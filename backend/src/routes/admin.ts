import { Router, Request, Response } from 'express';
import { getDbPool, sql } from '../config/db';

export const adminRouter = Router();

// =========================================================================
// KHỞI TẠO BẢNG TÀI KHOẢN PHÂN QUYỀN: HỢP TÁC XÃ (COOP) & HUYỆN (DISTRICT)
// =========================================================================
export async function ensureAdminUsersTable(pool: any) {
  try {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdminUsers' and xtype='U')
      BEGIN
        CREATE TABLE dbo.AdminUsers (
          UserId INT IDENTITY(1,1) PRIMARY KEY,
          Username NVARCHAR(50) UNIQUE NOT NULL,
          Password NVARCHAR(100) NOT NULL,
          FullName NVARCHAR(150) NOT NULL,
          Role NVARCHAR(50) NOT NULL, -- 'COOP' (Hợp tác xã) | 'DISTRICT' (Huyện)
          AgencyName NVARCHAR(200) NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE()
        );

        INSERT INTO dbo.AdminUsers (Username, Password, FullName, Role, AgencyName)
        VALUES 
        (N'htx_daksong', N'123', N'Ban Giám Đốc Hợp Tác Xã', N'COOP', N'Hợp tác xã Nông sản Đắk Song'),
        (N'huyen_daksong', N'123', N'UBND & Ban Quản Lý Huyện', N'DISTRICT', N'Ủy ban Nhân dân Huyện Đắk Song');
      END
    `);
  } catch (err) {
    console.warn('Lỗi kiểm tra bảng AdminUsers:', err);
  }
}

// Đảm bảo bảng lưu lịch sử chỉnh sửa voucher và hàng hóa luôn tồn tại
export async function ensureAuditLogTable(pool: any) {
  try {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AdminAuditLogs' and xtype='U')
      BEGIN
        CREATE TABLE dbo.AdminAuditLogs (
          LogId INT IDENTITY(1,1) PRIMARY KEY,
          ActionType NVARCHAR(50) NOT NULL,
          TargetType NVARCHAR(50) NOT NULL,
          TargetName NVARCHAR(200) NOT NULL,
          Details NVARCHAR(500) NOT NULL,
          AdminName NVARCHAR(100) DEFAULT N'Admin',
          CreatedAt DATETIME DEFAULT GETDATE()
        );

        INSERT INTO dbo.AdminAuditLogs (ActionType, TargetType, TargetName, Details, AdminName, CreatedAt)
        VALUES 
        (N'Cập nhật hạn mức', N'Voucher', N'Khách sạn Hoàng Nguyên', N'Thiết lập hạn mức voucher: 10 voucher giảm 15%', N'Admin', DATEADD(MINUTE, -120, GETDATE())),
        (N'Cập nhật tồn kho', N'Hàng hóa OCOP', N'Tiêu đen hữu cơ Đắk Song', N'Cập nhật tồn kho khả dụng: 50 Gói 500g', N'Admin', DATEADD(MINUTE, -90, GETDATE())),
        (N'Cập nhật tồn kho', N'Hàng hóa OCOP', N'Cà phê Robusta Đắk N’rung Đặc Sản', N'Cập nhật tồn kho khả dụng: 50 Gói 500g', N'Admin', DATEADD(MINUTE, -60, GETDATE())),
        (N'Cập nhật hạn mức', N'Voucher', N'Quán Cơm Gà Đắk Song', N'Thiết lập hạn mức voucher: 15 voucher giảm 20%', N'Admin', DATEADD(MINUTE, -30, GETDATE()));
      END
      ELSE
      BEGIN
        UPDATE dbo.AdminAuditLogs SET TargetType = N'Kết quả' WHERE TargetType = 'BXH Quiz' OR TargetType = N'BXH Quiz';
        DELETE FROM dbo.AdminAuditLogs WHERE TargetType = 'DON HANG' OR TargetType = N'ĐƠN HÀNG' OR TargetType = N'Đơn hàng' OR ActionType LIKE N'%HỦY ĐƠN%';
      END
    `);
  } catch (err) {
    console.warn('Lỗi kiểm tra bảng AdminAuditLogs:', err);
  }
}

export async function recordAuditLog(pool: any, actionType: string, targetType: string, targetName: string, details: string, adminName = 'Admin') {
  try {
    await ensureAuditLogTable(pool);
    await pool.request()
      .input('act', sql.NVarChar(50), actionType)
      .input('tgt', sql.NVarChar(50), targetType)
      .input('name', sql.NVarChar(200), targetName)
      .input('det', sql.NVarChar(500), details)
      .input('admin', sql.NVarChar(100), adminName)
      .query(`
        INSERT INTO dbo.AdminAuditLogs (ActionType, TargetType, TargetName, Details, AdminName, CreatedAt)
        VALUES (@act, @tgt, @name, @det, @admin, GETDATE())
      `);
  } catch (err) {
    console.error('Lỗi ghi audit log:', err);
  }
}

// 0. POST /api/admin/auth/login
// Xác thực đăng nhập với phân quyền: Hợp tác xã (COOP) và Huyện (DISTRICT)
adminRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu!' });
    }

    const pool = await getDbPool();
    await ensureAdminUsersTable(pool);

    const result = await pool.request()
      .input('u', sql.NVarChar(50), String(username).trim())
      .input('p', sql.NVarChar(100), String(password).trim())
      .query(`SELECT UserId, Username, FullName, Role, AgencyName FROM dbo.AdminUsers WHERE Username = @u AND Password = @p`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
    }

    const user = result.recordset[0];
    const roleLabel = user.Role === 'COOP' ? 'Hợp tác xã Nông sản Đắk Song' : 'Ban Quản lý Huyện Đắk Song';

    res.json({
      success: true,
      message: `Đăng nhập thành công với vai trò ${roleLabel}!`,
      data: {
        userId: user.UserId,
        username: user.Username,
        fullName: user.FullName,
        role: user.Role,
        agencyName: user.AgencyName,
      },
    });
  } catch (error: any) {
    console.error('Lỗi đăng nhập admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 1. GET /api/admin/dashboard/stats
// Thống kê tổng quan phục vụ Dashboard quản trị
adminRouter.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    const pool = await getDbPool();
    await ensureAuditLogTable(pool);
    await ensureAdminUsersTable(pool);

    // Thống kê Voucher
    const voucherStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS TotalVenues,
        ISNULL(SUM(TotalLimit), 0) AS TotalVoucherLimit,
        ISNULL(SUM(IssuedCount), 0) AS TotalIssuedVouchers,
        ISNULL(SUM(UsedCount), 0) AS TotalUsedVouchers,
        ISNULL(SUM(TotalLimit - IssuedCount), 0) AS RemainingVouchersInPool
      FROM dbo.Venues
      WHERE IsActive = 1
    `);

    // Thống kê Đơn hàng & Doanh thu (Không tính tiền các đơn đã Hủy)
    const orderStats = await pool.request().query(`
      SELECT 
        COUNT(*) AS TotalOrders,
        ISNULL(SUM(CASE WHEN PaymentStatus = 'Paid' AND OrderStatus <> 'Cancelled' THEN FinalAmount ELSE 0 END), 0) AS TotalRevenue,
        COUNT(CASE WHEN PaymentStatus = 'Paid' AND OrderStatus <> 'Cancelled' THEN 1 END) AS PaidOrdersCount,
        COUNT(CASE WHEN OrderStatus = 'PendingConfirm' THEN 1 END) AS PendingConfirmOrdersCount,
        COUNT(CASE WHEN OrderStatus = 'ReadyToShip' THEN 1 END) AS ReadyToShipOrdersCount,
        COUNT(CASE WHEN OrderStatus = 'Completed' THEN 1 END) AS CompletedOrdersCount,
        COUNT(CASE WHEN OrderStatus = 'Cancelled' THEN 1 END) AS CancelledOrdersCount
      FROM dbo.Orders
    `);

    // Thống kê tổng số lượt chỉnh sửa (Nếu là Huyện: chỉ đếm các mục Voucher và Kết quả thi)
    let auditLogsQuery = `SELECT COUNT(*) AS TotalAuditLogs FROM dbo.AdminAuditLogs`;
    if (adminRole === 'DISTRICT') {
      auditLogsQuery = `
        SELECT COUNT(*) AS TotalAuditLogs FROM dbo.AdminAuditLogs
        WHERE TargetType IN ('Voucher', N'Voucher', 'Kết quả', N'Kết quả', 'BXH Quiz', N'BXH Quiz')
           OR ActionType LIKE N'%voucher%' OR ActionType LIKE N'%Voucher%' OR ActionType LIKE N'%kết quả%'
      `;
    }
    const auditCountRes = await pool.request().query(auditLogsQuery);
    const auditLogsCount = auditCountRes.recordset[0]?.TotalAuditLogs || 0;

    // Thống kê Thí sinh thi Quiz
    let quizParticipantsCount = 0;
    try {
      const qRes = await pool.request().query(`SELECT COUNT(*) AS TotalQuizParticipants FROM dbo.QuizLeaderboard`);
      quizParticipantsCount = qRes.recordset[0]?.TotalQuizParticipants || 0;
    } catch {}

    // Thống kê Sản phẩm kho OCOP
    const prodStatsRes = await pool.request().query(`
      SELECT 
        COUNT(*) AS TotalProducts,
        COUNT(CASE WHEN InStockQuantity < 20 THEN 1 END) AS LowStockProductsCount
      FROM dbo.Products
    `);

    res.json({
      success: true,
      data: {
        vouchers: voucherStats.recordset[0],
        orders: orderStats.recordset[0],
        products: prodStatsRes.recordset[0] || { TotalProducts: 0, LowStockProductsCount: 0 },
        auditLogsCount,
        quizParticipantsCount,
      },
    });
  } catch (error: any) {
    console.error('Lỗi lấy thống kê Dashboard:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/admin/venues
// Lấy danh sách quán, hiển thị rõ số lượng voucher phát hành / đã dùng
adminRouter.get('/venues', async (_req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        VenueId, VenueName, Category, Phone, Address, DiscountPercent,
        TotalLimit, IssuedCount, UsedCount, (TotalLimit - IssuedCount) AS Remaining,
        IsActive, CreatedAt
      FROM dbo.Venues
      WHERE IsActive = 1
      ORDER BY VenueId DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách quán admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST /api/admin/venues
// Admin thêm quán mới hoặc cấu hình hạn mức thỏa thuận ban đầu (Thẩm quyền Huyện)
adminRouter.post('/venues', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'COOP') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Hợp tác xã chỉ có thẩm quyền quản lý Sàn TMĐT OCOP và Đơn hàng. Quản lý Quán & Hạn mức Voucher do Ban Quản lý Huyện phụ trách.',
      });
    }

    const { venueName, category, phone, address, discountPercent = 10, totalLimit = 50 } = req.body;
    const rawAdminName = (req.headers['x-admin-name'] as string) || '';
    let adminName = 'Ban Quản lý Huyện';
    try {
      adminName = rawAdminName ? decodeURIComponent(rawAdminName) : 'Ban Quản lý Huyện';
    } catch {
      adminName = rawAdminName || 'Ban Quản lý Huyện';
    }

    if (!venueName || !category || !address) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên quán, chuyên mục và địa chỉ!',
      });
    }

    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(200), venueName)
      .input('cat', sql.NVarChar(50), category)
      .input('phone', sql.VarChar(20), phone || null)
      .input('address', sql.NVarChar(300), address)
      .input('discount', sql.Int, discountPercent)
      .input('limit', sql.Int, totalLimit)
      .query(`
        INSERT INTO dbo.Venues (VenueName, Category, Phone, Address, DiscountPercent, TotalLimit, IssuedCount, UsedCount, CreatedAt, IsActive)
        OUTPUT INSERTED.VenueId
        VALUES (@name, @cat, @phone, @address, @discount, @limit, 0, 0, GETDATE(), 1);
      `);

    const newVenueId = result.recordset[0].VenueId;
    await recordAuditLog(
      pool,
      'Thêm cơ sở mới',
      'Voucher',
      venueName,
      `Thêm mới cơ sở với hạn mức ban đầu: ${totalLimit} voucher (giảm ${discountPercent}%)`
    );

    res.json({
      success: true,
      message: `Đã thêm thành công cơ sở ${venueName} với hạn mức ${totalLimit} voucher!`,
      venueId: newVenueId,
    });
  } catch (error: any) {
    console.error('Lỗi thêm quán mới:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT /api/admin/venues/:id/limit
// Admin cập nhật thêm hạn mức khi quán đồng ý tài trợ thêm đợt voucher mới (Thẩm quyền Huyện)
adminRouter.put('/venues/:id/limit', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'COOP') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Hợp tác xã chỉ có thẩm quyền quản lý Sàn TMĐT OCOP và Đơn hàng. Quản lý Quán & Hạn mức Voucher do Ban Quản lý Huyện phụ trách.',
      });
    }

    const venueId = parseInt(String(req.params.id), 10);
    const { newTotalLimit } = req.body;

    if (newTotalLimit === undefined || newTotalLimit < 0) {
      return res.status(400).json({ success: false, message: 'Hạn mức mới không hợp lệ!' });
    }

    const pool = await getDbPool();
    const currentVenue = await pool
      .request()
      .input('vId', sql.Int, venueId)
      .query(`SELECT VenueName, TotalLimit, IssuedCount FROM dbo.Venues WHERE VenueId = @vId`);
    const oldLimit = currentVenue.recordset[0]?.TotalLimit ?? 0;
    const currentIssued = currentVenue.recordset[0]?.IssuedCount ?? 0;
    const venueName = currentVenue.recordset[0]?.VenueName || `Cơ sở #${venueId}`;

    await pool
      .request()
      .input('vId', sql.Int, venueId)
      .input('limit', sql.Int, newTotalLimit)
      .query(`
        UPDATE dbo.Venues
        SET TotalLimit = @limit
        WHERE VenueId = @vId
      `);

    await recordAuditLog(
      pool,
      'Cập nhật hạn mức',
      'Voucher',
      venueName,
      `Thay đổi hạn mức từ ${oldLimit} thành ${newTotalLimit} voucher`
    );

    // Nếu hạn mức chỉnh về 0 hoặc nhỏ hơn/bằng số đã phát: Ghi log Hết voucher & tự loại khỏi vòng quay
    if (newTotalLimit === 0 || newTotalLimit <= currentIssued) {
      await recordAuditLog(
        pool,
        'Hết voucher',
        'Voucher',
        venueName,
        `Cơ sở đã hết voucher khả dụng (Hạn mức: ${newTotalLimit}, Đã phát: ${currentIssued}). Tự động loại khỏi Vòng quay may mắn.`,
        'Admin'
      );
    }

    res.json({
      success: true,
      message: `Đã cập nhật hạn mức voucher thành công: ${newTotalLimit}!`,
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật hạn mức quán:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4b. POST /api/admin/venues/:id/add-vouchers
// Admin cấp thêm số lượng voucher cho cơ sở (Thẩm quyền Huyện)
adminRouter.post('/venues/:id/add-vouchers', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'COOP') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Hợp tác xã chỉ có thẩm quyền quản lý Sàn TMĐT OCOP và Đơn hàng. Quản lý Quán & Hạn mức Voucher do Ban Quản lý Huyện phụ trách.',
      });
    }

    const venueId = parseInt(String(req.params.id), 10);
    const { quantityToAdd } = req.body;
    const qty = parseInt(String(quantityToAdd), 10);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng voucher cấp thêm phải lớn hơn 0!' });
    }

    const pool = await getDbPool();
    const currentVenue = await pool
      .request()
      .input('vId', sql.Int, venueId)
      .query(`SELECT VenueName, TotalLimit, IssuedCount, IsActive FROM dbo.Venues WHERE VenueId = @vId`);

    if (currentVenue.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở!' });
    }

    const venue = currentVenue.recordset[0];
    const oldLimit = venue.TotalLimit ?? 0;
    const currentIssued = venue.IssuedCount ?? 0;
    const venueName = venue.VenueName || `Cơ sở #${venueId}`;
    const newTotalLimit = oldLimit + qty;
    const oldRemaining = Math.max(0, oldLimit - currentIssued);
    const newRemaining = Math.max(0, newTotalLimit - currentIssued);

    await pool
      .request()
      .input('vId', sql.Int, venueId)
      .input('qty', sql.Int, qty)
      .query(`
        UPDATE dbo.Venues
        SET TotalLimit = TotalLimit + @qty,
            IsActive = 1
        WHERE VenueId = @vId
      `);

    await recordAuditLog(
      pool,
      'Cấp thêm voucher',
      'Voucher',
      venueName,
      `Cấp thêm +${qty} voucher. Hạn mức mới: ${newTotalLimit} (trước: ${oldLimit}). Số voucher còn lại tăng từ ${oldRemaining} lên ${newRemaining}. Tự động mở lại trong Vòng quay may mắn.`
    );

    res.json({
      success: true,
      message: `Đã cấp thêm thành công +${qty} voucher cho ${venueName}! Còn lại: ${newRemaining} voucher.`,
      newTotalLimit,
      newRemaining,
    });
  } catch (error: any) {
    console.error('Lỗi cấp thêm voucher cho quán:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. DELETE /api/admin/venues/:id
// Admin xóa voucher / cơ sở khỏi hệ thống (Thẩm quyền Huyện)
adminRouter.delete('/venues/:id', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'COOP') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Hợp tác xã chỉ có thẩm quyền quản lý Sàn TMĐT OCOP và Đơn hàng. Quản lý Quán & Hạn mức Voucher do Ban Quản lý Huyện phụ trách.',
      });
    }

    const venueId = parseInt(String(req.params.id), 10);
    const pool = await getDbPool();

    const currentVenue = await pool
      .request()
      .input('vId', sql.Int, venueId)
      .query(`SELECT VenueName, TotalLimit, IssuedCount FROM dbo.Venues WHERE VenueId = @vId`);

    if (currentVenue.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở cần xóa!' });
    }

    const venueName = currentVenue.recordset[0].VenueName;
    const issuedCount = currentVenue.recordset[0].IssuedCount || 0;

    // Vô hiệu hóa và xóa hạn mức để bảo đảm tính toàn vẹn dữ liệu
    await pool
      .request()
      .input('vId', sql.Int, venueId)
      .query(`
        UPDATE dbo.Venues
        SET IsActive = 0, TotalLimit = 0
        WHERE VenueId = @vId
      `);

    // Ghi nhận Audit Log
    await recordAuditLog(
      pool,
      'Xóa voucher',
      'Voucher',
      venueName,
      `Đã xóa voucher của cơ sở khỏi hệ thống (Đã phát: ${issuedCount} voucher). Loại bỏ vĩnh viễn khỏi Vòng quay may mắn.`,
      'Admin'
    );

    res.json({
      success: true,
      message: `Đã xóa voucher của cơ sở "${venueName}" thành công!`,
    });
  } catch (error: any) {
    console.error('Lỗi xóa cơ sở voucher:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET /api/admin/orders
// Quản trị viên xem toàn bộ danh sách đơn hàng mua đặc sản
adminRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const pool = await getDbPool();
    const request = pool.request();

    let query = `
      SELECT 
        o.OrderId, o.OrderCode, o.UserId, o.CustomerName, o.Phone, o.ShippingAddress, o.Note,
        o.TotalAmount, o.DiscountAmount, o.FinalAmount, o.VoucherCodeApplied,
        o.PaymentMethod, o.PaymentStatus, o.OrderStatus,
        CASE 
          WHEN o.OrderStatus = 'Cancelled' AND (
            LOWER(ISNULL(o.Note, '')) LIKE N'%hợp tác xã%' 
            OR LOWER(ISNULL(o.Note, '')) LIKE N'%htx%' 
            OR LOWER(ISNULL(o.Note, '')) LIKE N'%admin%'
            OR LOWER(ISNULL(o.Note, '')) LIKE N'%chất lượng%'
            OR LOWER(ISNULL(o.Note, '')) LIKE N'%số lượng%'
          ) THEN 'HTX'
          WHEN o.OrderStatus = 'Cancelled' THEN 'USER'
          ELSE NULL
        END AS CancelledBy,
        CONVERT(VARCHAR(19), o.AdminConfirmedAt, 120) AS AdminConfirmedAt,
        CONVERT(VARCHAR(19), o.CreatedAt, 120) AS CreatedAt
      FROM dbo.Orders o
    `;

    if (status) {
      query += ` WHERE o.OrderStatus = @status`;
      request.input('status', sql.NVarChar(50), status);
    }

    query += ` ORDER BY o.CreatedAt DESC`;

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. GET /api/admin/orders/:id/items
// Xem chi tiết các sản phẩm bên trong một đơn hàng
adminRouter.get('/orders/:id/items', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(String(req.params.id), 10);
    const pool = await getDbPool();

    const result = await pool
      .request()
      .input('oId', sql.Int, orderId)
      .query(`
        SELECT 
          oi.OrderItemId, oi.ProductId, oi.ProductName, oi.Price, oi.Quantity, oi.Subtotal,
          p.Origin, p.Unit
        FROM dbo.OrderItems oi
        JOIN dbo.Products p ON oi.ProductId = p.ProductId
        WHERE oi.OrderId = @oId
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy chi tiết sản phẩm đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. PUT /api/admin/orders/:id/status
// QUY TRÌNH QUAN TRỌNG: (Thẩm quyền Hợp Tác Xã)
// Hợp tác xã sau khi kiểm tra tiền ZaloPay đã về -> gọi điện cho người dân/nhà vườn xác nhận còn hàng
// Nếu còn hàng -> đổi sang 'ReadyToShip' và gửi thông tin cho nhà vườn đóng gói gửi bưu điện
adminRouter.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'DISTRICT') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Điều phối đơn hàng và sàn TMĐT OCOP thuộc thẩm quyền trực tiếp của Hợp tác xã Nông sản Đắk Song.',
      });
    }

    const orderId = parseInt(String(req.params.id), 10);
    const { newStatus } = req.body;
    // newStatus có thể là: 'PendingConfirm', 'ReadyToShip', 'Shipping', 'Completed', 'Cancelled'

    if (!newStatus) {
      return res.status(400).json({ success: false, message: 'Thiếu trạng thái newStatus!' });
    }

    const pool = await getDbPool();

    // Nếu Admin hủy đơn hàng, hoàn lại số lượng tồn kho sản phẩm
    const currentOrder = await pool
      .request()
      .input('oId', sql.Int, orderId)
      .query(`SELECT OrderStatus FROM dbo.Orders WHERE OrderId = @oId`);

    if (newStatus === 'Cancelled' && currentOrder.recordset.length > 0 && currentOrder.recordset[0].OrderStatus !== 'Cancelled') {
      const items = await pool
        .request()
        .input('oId', sql.Int, orderId)
        .query(`SELECT ProductId, Quantity FROM dbo.OrderItems WHERE OrderId = @oId`);

      for (const it of items.recordset) {
        await pool
          .request()
          .input('pId', sql.Int, it.ProductId)
          .input('qty', sql.Int, it.Quantity)
          .query(`UPDATE dbo.Products SET InStockQuantity = InStockQuantity + @qty WHERE ProductId = @pId`);
      }
    }

    await pool
      .request()
      .input('oId', sql.Int, orderId)
      .input('status', sql.NVarChar(50), newStatus)
      .query(`
        UPDATE dbo.Orders
        SET 
          OrderStatus = @status,
          PaymentStatus = CASE 
            WHEN @status = 'Cancelled' THEN (CASE WHEN PaymentMethod = 'COD' THEN 'Cancelled' ELSE 'Refunded' END)
            WHEN @status = 'Completed' AND PaymentMethod = 'COD' THEN 'Paid'
            ELSE PaymentStatus 
          END,
          Note = CASE 
            WHEN @status = 'Cancelled' THEN N'Đơn hàng do Hợp tác xã hủy do một số vấn đề về chất lượng cũng như số lượng nông sản chưa đảm bảo tại thời điểm này. Hợp tác xã chân thành xin lỗi quý khách!' 
            ELSE Note 
          END,
          AdminConfirmedAt = CASE WHEN @status = 'ReadyToShip' AND AdminConfirmedAt IS NULL THEN GETDATE() ELSE AdminConfirmedAt END,
          UpdatedAt = GETDATE()
        WHERE OrderId = @oId
      `);

    // Ghi nhận Audit Log khi Admin / Hợp tác xã hủy đơn
    if (newStatus === 'Cancelled') {
      const orderCodeRes = await pool.request()
        .input('oId', sql.Int, orderId)
        .query(`SELECT OrderCode FROM dbo.Orders WHERE OrderId = @oId`);
      const ordCode = orderCodeRes.recordset[0]?.OrderCode || `#${orderId}`;

      await recordAuditLog(
        pool,
        'Hủy đơn hàng',
        'Đơn hàng',
        ordCode,
        'Đơn hàng do admin/Hợp tác xã hủy trong tiến độ giao hàng và điều phối đơn do một số vấn đề về chất lượng cũng như số lượng nông sản. Tự động hoàn lại số lượng tồn kho.',
        'HTX Nông sản Đắk Song'
      );
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng #${orderId} sang "${newStatus}"!`,
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. POST /api/admin/products - Thêm sản phẩm đặc sản mới (Thẩm quyền Hợp Tác Xã)
adminRouter.post('/products', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'DISTRICT') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Quản lý hàng hóa, cập nhật giá và tồn kho sàn OCOP thuộc thẩm quyền trực tiếp của Hợp tác xã Nông sản Đắk Song.',
      });
    }

    const { productName, origin, category, price, unit, description, inStockQuantity = 50 } = req.body;
    if (!productName || !category || !price) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm!' });
    }

    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(200), productName)
      .input('origin', sql.NVarChar(100), origin || 'Đắk Song, Đắk Nông')
      .input('category', sql.NVarChar(50), category)
      .input('price', sql.Decimal(18, 0), price)
      .input('unit', sql.NVarChar(50), unit || 'Gói 500g')
      .input('desc', sql.NVarChar(sql.MAX), description || null)
      .input('qty', sql.Int, inStockQuantity)
      .query(`
        INSERT INTO dbo.Products (ProductName, Origin, Category, Price, Unit, Description, InStockQuantity, CreatedAt, IsActive)
        OUTPUT INSERTED.ProductId
        VALUES (@name, @origin, @category, @price, @unit, @desc, @qty, GETDATE(), 1);
      `);

    const newProductId = result.recordset[0].ProductId;
    await recordAuditLog(
      pool,
      'Thêm sản phẩm mới',
      'Hàng hóa OCOP',
      productName,
      `Thêm sản phẩm mới với giá ${Number(price).toLocaleString('vi-VN')}₫/${unit || 'Gói'}, tồn kho ban đầu: ${inStockQuantity}`
    );

    res.json({
      success: true,
      message: `Đã thêm sản phẩm ${productName} thành công!`,
      productId: newProductId,
    });
  } catch (error: any) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. PUT /api/admin/products/:id - Sửa thông tin / giá / tồn kho sản phẩm (Thẩm quyền Hợp Tác Xã)
adminRouter.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'DISTRICT') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Quản lý hàng hóa, cập nhật giá và tồn kho sàn OCOP thuộc thẩm quyền trực tiếp của Hợp tác xã Nông sản Đắk Song.',
      });
    }

    const productId = parseInt(String(req.params.id), 10);
    const { price, inStockQuantity, description } = req.body;

    const pool = await getDbPool();
    const currentProd = await pool
      .request()
      .input('pId', sql.Int, productId)
      .query(`SELECT ProductName, Price, InStockQuantity, Unit FROM dbo.Products WHERE ProductId = @pId`);
    const oldPrice = currentProd.recordset[0]?.Price;
    const oldQty = currentProd.recordset[0]?.InStockQuantity;
    const prodName = currentProd.recordset[0]?.ProductName || `Sản phẩm #${productId}`;
    const unit = currentProd.recordset[0]?.Unit || 'đơn vị';

    await pool
      .request()
      .input('pId', sql.Int, productId)
      .input('price', sql.Decimal(18, 0), price)
      .input('qty', sql.Int, inStockQuantity)
      .input('desc', sql.NVarChar(sql.MAX), description || null)
      .query(`
        UPDATE dbo.Products
        SET 
          Price = ISNULL(@price, Price),
          InStockQuantity = ISNULL(@qty, InStockQuantity),
          Description = ISNULL(@desc, Description)
        WHERE ProductId = @pId
      `);

    const changes: string[] = [];
    if (inStockQuantity !== undefined && inStockQuantity !== oldQty) {
      changes.push(`tồn kho: ${oldQty} ➔ ${inStockQuantity} ${unit}`);
    }
    if (price !== undefined && Number(price) !== Number(oldPrice)) {
      changes.push(`giá: ${Number(oldPrice).toLocaleString('vi-VN')}₫ ➔ ${Number(price).toLocaleString('vi-VN')}₫`);
    }

    await recordAuditLog(
      pool,
      'Cập nhật sản phẩm',
      'Hàng hóa OCOP',
      prodName,
      changes.length > 0 ? `Chỉnh sửa ${changes.join(', ')}` : 'Chỉnh sửa mô tả sản phẩm'
    );

    res.json({
      success: true,
      message: `Cập nhật sản phẩm #${productId} thành công!`,
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. GET /api/admin/audit-logs - Xem lịch sử chỉnh sửa voucher và hàng hóa
adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    const pool = await getDbPool();
    await ensureAuditLogTable(pool);

    let query = `
      SELECT LogId, ActionType, TargetType, TargetName, Details, AdminName,
        CONVERT(VARCHAR(19), CreatedAt, 120) AS CreatedAt
      FROM dbo.AdminAuditLogs
    `;

    // Nếu là UBND & BQL Huyện (DISTRICT) -> chỉ trả về nhật ký liên quan đến Voucher và Kết quả thi Quiz
    if (adminRole === 'DISTRICT') {
      query += `
        WHERE TargetType IN ('Voucher', N'Voucher', 'Kết quả', N'Kết quả', 'BXH Quiz', N'BXH Quiz')
           OR ActionType LIKE N'%voucher%' OR ActionType LIKE N'%Voucher%' OR ActionType LIKE N'%kết quả%'
      `;
    }

    query += ` ORDER BY LogId DESC`;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy lịch sử chỉnh sửa admin:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. DELETE /api/admin/leaderboard/:id - Xóa kết quả thi của người chơi (Thẩm quyền Huyện)
adminRouter.delete('/leaderboard/:id', async (req: Request, res: Response) => {
  try {
    const adminRole = (req.headers['x-admin-role'] as string) || '';
    if (adminRole === 'COOP') {
      return res.status(403).json({
        success: false,
        message: 'Quyền hạn bị từ chối: Bảng xếp hạng và kết quả thi Quiz do Ban Quản lý Huyện quản lý và phê duyệt.',
      });
    }

    const attemptId = parseInt(String(req.params.id), 10);
    const pool = await getDbPool();
    const cur = await pool.request()
      .input('id', sql.Int, attemptId)
      .query(`SELECT DisplayName, Score, TotalQuestions, WeekId FROM dbo.QuizLeaderboard WHERE AttemptId = @id`);
    
    if (cur.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả thi cần xóa!' });
    }

    const row = cur.recordset[0];
    await pool.request()
      .input('id', sql.Int, attemptId)
      .query(`DELETE FROM dbo.QuizLeaderboard WHERE AttemptId = @id`);

    await recordAuditLog(
      pool,
      'Xóa kết quả thi',
      'Kết quả',
      row.DisplayName,
      `Xóa kết quả thi của "${row.DisplayName}" (${row.Score}/${row.TotalQuestions} câu, Tuần: ${row.WeekId}) khỏi Bảng xếp hạng.`
    );

    res.json({
      success: true,
      message: `Đã xóa kết quả thi của thí sinh "${row.DisplayName}" thành công!`,
    });
  } catch (error: any) {
    console.error('Lỗi xóa kết quả thi:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

