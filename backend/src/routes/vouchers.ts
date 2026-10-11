import { Router, Request, Response } from 'express';
import { getDbPool, sql } from '../config/db';
import { recordAuditLog } from './admin';

export const vouchersRouter = Router();

// 1. GET /api/vouchers/available
// Lấy danh sách các quán còn hạn mức voucher để hệ thống bốc thăm trao thưởng khi chơi Quiz
vouchersRouter.get('/available', async (_req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        VenueId, VenueName, Category, Phone, Address, DiscountPercent,
        TotalLimit, IssuedCount, UsedCount, (TotalLimit - IssuedCount) AS RemainingCount
      FROM dbo.Venues
      WHERE IsActive = 1 AND IssuedCount < TotalLimit
      ORDER BY RemainingCount DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách quán còn voucher:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vouchers/venues-status
// Lấy trạng thái hạn mức và số lượng còn lại của từng cơ sở để Vòng quay may mắn loại trừ ô hết hạn
vouchersRouter.get('/venues-status', async (_req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        VenueId, VenueName, Category, DiscountPercent,
        TotalLimit, IssuedCount, UsedCount,
        CASE WHEN TotalLimit > IssuedCount THEN (TotalLimit - IssuedCount) ELSE 0 END AS RemainingCount,
        CASE WHEN TotalLimit > IssuedCount AND IsActive = 1 THEN 1 ELSE 0 END AS IsAvailable
      FROM dbo.Venues
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy trạng thái hạn mức cơ sở:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/vouchers/spin
// QUAY THƯỞNG PHÍA SERVER (SERVER-SIDE SPIN CHUẨN SHOPEE/MOMO)
// Xử lý tranh chấp đồng thời: Khóa hàng tức thì, đảm bảo 2 người cùng bấm không bao giờ trượt voucher cuối cùng
vouchersRouter.post('/spin', async (req: Request, res: Response) => {
  const pool = await getDbPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const { userId = 'zalo_user' } = req.body;

    // 1. Khóa và lấy danh sách TẤT CẢ cơ sở CÒN HẠN MỨC (IssuedCount < TotalLimit)
    const availableResult = await transaction.request().query(`
      SELECT VenueId, VenueName, Category, DiscountPercent, TotalLimit, IssuedCount
      FROM dbo.Venues WITH (UPDLOCK)
      WHERE IsActive = 1 AND IssuedCount < TotalLimit
    `);

    const availableVenues = availableResult.recordset;

    // Nếu tất cả các cơ sở trên vòng quay đều đã hết hạn mức
    if (!availableVenues || availableVenues.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        code: 'ALL_OUT_OF_STOCK',
        message: 'Tất cả các cơ sở hôm nay đã phát hết hạn mức voucher!',
      });
    }

    // 2. Server chọn ngẫu nhiên 1 cơ sở trong danh sách CÒN HẠN MỨC
    const pickedVenue = availableVenues[Math.floor(Math.random() * availableVenues.length)];

    // 3. Sinh mã voucher duy nhất và trừ hạn mức ngay lập tức trong transaction
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const voucherCode = `DSQ-W-${pickedVenue.VenueId}-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Lưu vào bảng UserVouchers
    await transaction
      .request()
      .input('code', sql.VarChar(50), voucherCode)
      .input('vId', sql.Int, pickedVenue.VenueId)
      .input('uId', sql.VarChar(100), userId)
      .input('discount', sql.Int, pickedVenue.DiscountPercent)
      .query(`
        INSERT INTO dbo.UserVouchers (VoucherCode, VenueId, UserId, DiscountPercent, Status, IssuedAt)
        VALUES (@code, @vId, @uId, @discount, 'Active', GETDATE())
      `);

    // Tăng số lượng đã phát của quán lên 1
    await transaction
      .request()
      .input('vId', sql.Int, pickedVenue.VenueId)
      .query(`
        UPDATE dbo.Venues
        SET IssuedCount = IssuedCount + 1
        WHERE VenueId = @vId
      `);

    // Cam kết giao dịch, mở khóa cho các lượt quay tiếp theo
    await transaction.commit();

    // 4. Nếu quán này vừa phát hết voucher (IssuedCount + 1 >= TotalLimit), tự động ghi thông báo hết voucher vào lịch sử
    if (pickedVenue.IssuedCount + 1 >= pickedVenue.TotalLimit) {
      try {
        await recordAuditLog(
          pool,
          'Hết voucher',
          'Voucher',
          pickedVenue.VenueName,
          `Đã phát hết toàn bộ ${pickedVenue.TotalLimit} voucher. Cơ sở này đã tự động được loại khỏi Vòng quay may mắn.`,
          'Hệ thống tự động'
        );
      } catch (logErr) {
        console.warn('Lỗi ghi audit log khi hết voucher:', logErr);
      }
    }

    res.json({
      success: true,
      message: 'Quay thưởng thành công!',
      data: {
        venueId: pickedVenue.VenueId,
        venueName: pickedVenue.VenueName,
        discountPercent: pickedVenue.DiscountPercent,
        voucherCode,
        issuedAt: new Date(),
      },
    });
  } catch (err: any) {
    await transaction.rollback();
    console.error('Lỗi khi quay thưởng trên server:', err);
    res.status(500).json({ success: false, message: err.message || 'Lỗi xử lý vòng quay trên máy chủ' });
  }
});

// 2. POST /api/vouchers/claim
// Cấp voucher cho người dùng khi hoàn thành bài Quiz hoặc trúng Vòng quay
// Tự động kiểm tra hạn mức còn lại và tăng IssuedCount lên 1
vouchersRouter.post('/claim', async (req: Request, res: Response) => {
  try {
    const { userId = 'zalo_user', venueId, venueName, discountPercent, voucherCode: incomingCode } = req.body;

    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Xác định cơ sở (theo venueId hoặc theo tên venueName)
      let targetVenueId = venueId;
      if (!targetVenueId && venueName) {
        const nameMatch = await transaction
          .request()
          .input('vName', sql.NVarChar(200), String(venueName).trim())
          .query(`
            SELECT TOP 1 VenueId 
            FROM dbo.Venues 
            WHERE IsActive = 1 AND (VenueName LIKE '%' + @vName + '%' OR @vName LIKE '%' + VenueName + '%')
          `);
        if (nameMatch.recordset.length > 0) {
          targetVenueId = nameMatch.recordset[0].VenueId;
        }
      }

      // Nếu không tìm thấy hoặc không truyền, chọn ngẫu nhiên 1 quán còn hạn mức
      if (!targetVenueId) {
        const venuePick = await transaction.request().query(`
          SELECT TOP 1 VenueId, DiscountPercent, VenueName 
          FROM dbo.Venues 
          WHERE IsActive = 1 AND IssuedCount < TotalLimit
          ORDER BY NEWID()
        `);

        if (venuePick.recordset.length === 0) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'Tất cả các quán đã hết hạn mức voucher hôm nay!',
          });
        }
        targetVenueId = venuePick.recordset[0].VenueId;
      }

      // Kiểm tra lại hạn mức của quán
      const venueCheck = await transaction
        .request()
        .input('vId', sql.Int, targetVenueId)
        .query(`
          SELECT VenueId, VenueName, DiscountPercent, TotalLimit, IssuedCount
          FROM dbo.Venues WITH (UPDLOCK)
          WHERE VenueId = @vId AND IsActive = 1
        `);

      if (venueCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở này!' });
      }

      const venue = venueCheck.recordset[0];
      if (venue.IssuedCount >= venue.TotalLimit) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Quán ${venue.VenueName} đã phát hết số lượng voucher (${venue.TotalLimit}/${venue.TotalLimit})!`,
        });
      }

      // Sử dụng mã voucher từ client hoặc sinh mã mới
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const voucherCode = incomingCode || `DSQ-${venue.VenueId}-${randomSuffix}`;
      const finalDiscount = discountPercent || venue.DiscountPercent;

      // Lưu voucher của người dùng (nếu mã đã có thì bỏ qua insert)
      const existing = await transaction
        .request()
        .input('code', sql.VarChar(50), voucherCode)
        .query(`SELECT VoucherId FROM dbo.UserVouchers WHERE VoucherCode = @code`);

      if (existing.recordset.length === 0) {
        await transaction
          .request()
          .input('code', sql.VarChar(50), voucherCode)
          .input('vId', sql.Int, venue.VenueId)
          .input('uId', sql.VarChar(100), userId)
          .input('discount', sql.Int, finalDiscount)
          .query(`
            INSERT INTO dbo.UserVouchers (VoucherCode, VenueId, UserId, DiscountPercent, Status, IssuedAt)
            VALUES (@code, @vId, @uId, @discount, 'Active', GETDATE())
          `);

        // Tăng số lượng đã phát của quán lên 1
        await transaction
          .request()
          .input('vId', sql.Int, venue.VenueId)
          .query(`
            UPDATE dbo.Venues
            SET IssuedCount = IssuedCount + 1
            WHERE VenueId = @vId
          `);

        // Nếu quán này vừa phát hết voucher qua Quiz, tự động ghi thông báo hết voucher vào lịch sử
        if (venue.IssuedCount + 1 >= venue.TotalLimit) {
          try {
            await recordAuditLog(
              pool,
              'Hết voucher',
              'Voucher',
              venue.VenueName,
              `Đã phát hết toàn bộ ${venue.TotalLimit} voucher qua đổi thưởng Quiz. Cơ sở này đã tự động được loại khỏi Vòng quay may mắn.`,
              'Hệ thống tự động'
            );
          } catch (logErr) {
            console.warn('Lỗi ghi audit log khi hết voucher quiz:', logErr);
          }
        }
      }

      await transaction.commit();

      res.json({
        success: true,
        message: 'Cấp voucher thành công!',
        data: {
          voucherCode,
          venueName: venue.VenueName,
          discountPercent: finalDiscount,
          issuedAt: new Date(),
        },
      });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (error: any) {
    console.error('Lỗi cấp voucher:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/vouchers/use
// Khách đưa mã voucher cho chủ quán và bấm sử dụng tại quán
// Chuyển trạng thái sang 'Used' và tăng UsedCount của quán lên 1
vouchersRouter.post('/use', async (req: Request, res: Response) => {
  try {
    const { voucherCode, venueName, venueId, userId = 'zalo_user', discountPercent = 15 } = req.body;
    if (!voucherCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã voucher!' });
    }

    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const voucherCheck = await transaction
        .request()
        .input('code', sql.VarChar(50), voucherCode)
        .query(`
          SELECT uv.VoucherId, uv.VoucherCode, uv.VenueId, uv.Status, v.VenueName
          FROM dbo.UserVouchers uv
          JOIN dbo.Venues v ON uv.VenueId = v.VenueId
          WHERE uv.VoucherCode = @code
        `);

      let targetVenueName = venueName || 'Đối tác Đắk Song';

      if (voucherCheck.recordset.length > 0) {
        const voucher = voucherCheck.recordset[0];
        targetVenueName = voucher.VenueName;
        if (voucher.Status === 'Used') {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Voucher này đã được sử dụng trước đó tại ${voucher.VenueName}!`,
          });
        }

        // Cập nhật trạng thái voucher
        await transaction
          .request()
          .input('code', sql.VarChar(50), voucherCode)
          .query(`
            UPDATE dbo.UserVouchers
            SET Status = 'Used', UsedAt = GETDATE()
            WHERE VoucherCode = @code
          `);

        // Tăng số lượng đã sử dụng của quán lên 1
        await transaction
          .request()
          .input('vId', sql.Int, voucher.VenueId)
          .query(`
            UPDATE dbo.Venues
            SET UsedCount = UsedCount + 1
            WHERE VenueId = @vId
          `);
      } else {
        // Nếu mã voucher chưa từng được ghi nhận (ví dụ sinh offline trước đó):
        let targetVenueId = venueId;
        if (!targetVenueId && venueName) {
          const matchV = await transaction
            .request()
            .input('vn', sql.NVarChar(200), String(venueName).trim())
            .query(`
              SELECT TOP 1 VenueId, VenueName 
              FROM dbo.Venues 
              WHERE IsActive = 1 AND (VenueName LIKE '%' + @vn + '%' OR @vn LIKE '%' + VenueName + '%')
            `);
          if (matchV.recordset.length > 0) {
            targetVenueId = matchV.recordset[0].VenueId;
            targetVenueName = matchV.recordset[0].VenueName;
          }
        }
        if (!targetVenueId) {
          const anyV = await transaction.request().query(`SELECT TOP 1 VenueId, VenueName FROM dbo.Venues WHERE IsActive = 1`);
          targetVenueId = anyV.recordset[0]?.VenueId || 1;
          targetVenueName = anyV.recordset[0]?.VenueName || targetVenueName;
        }

        // Lưu vào UserVouchers với trạng thái Used
        await transaction
          .request()
          .input('code', sql.VarChar(50), voucherCode)
          .input('vId', sql.Int, targetVenueId)
          .input('uId', sql.VarChar(100), userId)
          .input('discount', sql.Int, discountPercent)
          .query(`
            INSERT INTO dbo.UserVouchers (VoucherCode, VenueId, UserId, DiscountPercent, Status, IssuedAt, UsedAt)
            VALUES (@code, @vId, @uId, @discount, 'Used', GETDATE(), GETDATE())
          `);

        // Tăng UsedCount (và tăng IssuedCount nếu IssuedCount <= UsedCount để số liệu luôn cân xứng)
        await transaction
          .request()
          .input('vId', sql.Int, targetVenueId)
          .query(`
            UPDATE dbo.Venues
            SET IssuedCount = CASE WHEN IssuedCount <= UsedCount THEN IssuedCount + 1 ELSE IssuedCount END,
                UsedCount = UsedCount + 1
            WHERE VenueId = @vId
          `);
      }

      await transaction.commit();

      res.json({
        success: true,
        message: `Đã xác nhận sử dụng thành công voucher tại ${targetVenueName}!`,
      });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (error: any) {
    console.error('Lỗi sử dụng voucher:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET /api/vouchers/my-vouchers
// Lấy danh sách voucher trong kho của một người dùng cụ thể
vouchersRouter.get('/my-vouchers', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu tham số userId!' });
    }

    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('uId', sql.VarChar(100), userId)
      .query(`
        SELECT 
          uv.VoucherId, uv.VoucherCode, uv.DiscountPercent, uv.Status, uv.IssuedAt, uv.UsedAt,
          v.VenueId, v.VenueName, v.Category, v.Phone, v.Address
        FROM dbo.UserVouchers uv
        JOIN dbo.Venues v ON uv.VenueId = v.VenueId
        WHERE uv.UserId = @uId
        ORDER BY uv.IssuedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy kho voucher người dùng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

