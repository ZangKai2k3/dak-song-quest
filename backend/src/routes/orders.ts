import { Router, Request, Response } from 'express';
import { getDbPool, sql } from '../config/db';

export const ordersRouter = Router();

interface CartItemInput {
  productId: number;
  quantity: number;
}

// 1. POST /api/orders/create
// Người dùng tiến hành đặt mua đặc sản, nhập địa chỉ, sđt và thanh toán ZaloPay
ordersRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      customerName,
      phone,
      shippingAddress,
      note,
      items, // mảng: [{ productId: 1, quantity: 2 }]
      voucherCode,
      paymentMethod = 'ZaloPay',
    } = req.body;

    if (!userId || !customerName || !phone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: họ tên, sđt, địa chỉ nhận hàng và danh sách sản phẩm!',
      });
    }

    const pool = await getDbPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Lấy thông tin các sản phẩm từ database để tính giá chính xác
      let totalAmount = 0;
      const orderItemsToInsert: {
        productId: number;
        productName: string;
        price: number;
        quantity: number;
        subtotal: number;
      }[] = [];

      for (const item of items as CartItemInput[]) {
        const prodResult = await transaction
          .request()
          .input('pId', sql.Int, item.productId)
          .query(`
            SELECT ProductId, ProductName, Price, InStockQuantity
            FROM dbo.Products WITH (UPDLOCK)
            WHERE ProductId = @pId AND IsActive = 1
          `);

        if (prodResult.recordset.length === 0) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sản phẩm có mã ID ${item.productId}!`,
          });
        }

        const prod = prodResult.recordset[0];
        if (prod.InStockQuantity < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${prod.ProductName}" hiện chỉ còn ${prod.InStockQuantity} trong kho, không đủ số lượng ${item.quantity} bạn đặt!`,
          });
        }

        const subtotal = prod.Price * item.quantity;
        totalAmount += subtotal;

        orderItemsToInsert.push({
          productId: prod.ProductId,
          productName: prod.ProductName,
          price: prod.Price,
          quantity: item.quantity,
          subtotal,
        });
      }

      // 2. Tính giảm giá nếu có áp dụng Voucher
      let discountAmount = 0;
      if (voucherCode) {
        const upperCode = voucherCode.toUpperCase().trim();
        if (upperCode === 'OCOP10') {
          discountAmount = Math.round((totalAmount * 10) / 100);
        } else if (upperCode === 'DAKSONG15') {
          discountAmount = Math.round((totalAmount * 15) / 100);
        } else if (upperCode === 'TRIENLAM' || upperCode === 'DAKSONG20') {
          discountAmount = Math.round((totalAmount * 20) / 100);
        } else {
          const voucherCheck = await transaction
            .request()
            .input('code', sql.VarChar(50), voucherCode)
            .input('uId', sql.VarChar(100), userId)
            .query(`
              SELECT uv.VoucherId, uv.DiscountPercent, uv.Status
              FROM dbo.UserVouchers uv
              JOIN dbo.Venues v ON uv.VenueId = v.VenueId
              WHERE uv.VoucherCode = @code AND uv.UserId = @uId AND uv.Status = 'Active'
                AND v.Category = N'Đặc sản'
            `);

          if (voucherCheck.recordset.length > 0) {
            const discountPercent = voucherCheck.recordset[0].DiscountPercent;
            discountAmount = Math.round((totalAmount * discountPercent) / 100);
          }
        }
      }

      const finalAmount = Math.max(0, totalAmount - discountAmount);

      // 3. Sinh mã đơn hàng ngẫu nhiên: ORD-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `ORD-${datePart}-${randomSuffix}`;

      // 4. Tạo bản ghi đơn hàng trong dbo.Orders
      const insertOrderResult = await transaction
        .request()
        .input('orderCode', sql.VarChar(50), orderCode)
        .input('uId', sql.VarChar(100), userId)
        .input('cName', sql.NVarChar(150), customerName)
        .input('phone', sql.VarChar(20), phone)
        .input('address', sql.NVarChar(350), shippingAddress)
        .input('note', sql.NVarChar(500), note || null)
        .input('total', sql.Decimal(18, 0), totalAmount)
        .input('discount', sql.Decimal(18, 0), discountAmount)
        .input('final', sql.Decimal(18, 0), finalAmount)
        .input('voucherCode', sql.VarChar(50), voucherCode || null)
        .input('payMethod', sql.NVarChar(50), paymentMethod)
        .input('payStatus', sql.NVarChar(30), 'Pending') // Chờ thanh toán ZaloPay
        .input('orderStatus', sql.NVarChar(50), 'PendingConfirm') // Chờ Admin kiểm tra và gọi điện cho dân
        .query(`
          INSERT INTO dbo.Orders (
            OrderCode, UserId, CustomerName, Phone, ShippingAddress, Note,
            TotalAmount, DiscountAmount, FinalAmount, VoucherCodeApplied,
            PaymentMethod, PaymentStatus, OrderStatus, CreatedAt
          )
          OUTPUT INSERTED.OrderId
          VALUES (
            @orderCode, @uId, @cName, @phone, @address, @note,
            @total, @discount, @final, @voucherCode,
            @payMethod, @payStatus, @orderStatus, GETDATE()
          );
        `);

      const newOrderId = insertOrderResult.recordset[0].OrderId;

      // 5. Thêm chi tiết các mặt hàng vào dbo.OrderItems & trừ tồn kho
      for (const item of orderItemsToInsert) {
        await transaction
          .request()
          .input('oId', sql.Int, newOrderId)
          .input('pId', sql.Int, item.productId)
          .input('pName', sql.NVarChar(200), item.productName)
          .input('price', sql.Decimal(18, 0), item.price)
          .input('qty', sql.Int, item.quantity)
          .input('subtotal', sql.Decimal(18, 0), item.subtotal)
          .query(`
            INSERT INTO dbo.OrderItems (OrderId, ProductId, ProductName, Price, Quantity, Subtotal)
            VALUES (@oId, @pId, @pName, @price, @qty, @subtotal)
          `);

        // Trừ số lượng tồn kho sản phẩm
        await transaction
          .request()
          .input('pId', sql.Int, item.productId)
          .input('qty', sql.Int, item.quantity)
          .query(`
            UPDATE dbo.Products
            SET InStockQuantity = CASE WHEN InStockQuantity >= @qty THEN InStockQuantity - @qty ELSE 0 END
            WHERE ProductId = @pId
          `);
      }

      // 6. Nếu dùng voucher, đánh dấu voucher đã được sử dụng cho đơn hàng này
      if (voucherCode && discountAmount > 0) {
        await transaction
          .request()
          .input('code', sql.VarChar(50), voucherCode)
          .query(`
            UPDATE dbo.UserVouchers
            SET Status = 'Used', UsedAt = GETDATE()
            WHERE VoucherCode = @code
          `);
      }

      await transaction.commit();

      // Giả lập dữ liệu trả về để Mini App gọi ZaloPay SDK thanh toán
      res.json({
        success: true,
        message: 'Khởi tạo đơn hàng thành công! Tiến hành thanh toán ZaloPay.',
        data: {
          orderId: newOrderId,
          orderCode,
          totalAmount,
          discountAmount,
          finalAmount,
          customerName,
          phone,
          shippingAddress,
          // Mô phỏng tham số ZaloPay
          zaloPayOrderUrl: `https://zalopay.vn/pay?orderCode=${orderCode}&amount=${finalAmount}`,
        },
      });
    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (error: any) {
    console.error('Lỗi tạo đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST /api/orders/zalopay-callback
// Webhook nhận thông báo từ ZaloPay khi khách chuyển tiền thành công
ordersRouter.post('/zalopay-callback', async (req: Request, res: Response) => {
  try {
    const { orderCode, status } = req.body;
    // status: 1 là thanh toán thành công
    const isSuccess = status === 1 || status === 'SUCCESS';

    const pool = await getDbPool();
    await pool
      .request()
      .input('orderCode', sql.VarChar(50), orderCode)
      .input('payStatus', sql.NVarChar(30), isSuccess ? 'Paid' : 'Failed')
      .query(`
        UPDATE dbo.Orders
        SET PaymentStatus = @payStatus, UpdatedAt = GETDATE()
        WHERE OrderCode = @orderCode
      `);

    res.json({
      return_code: 1,
      return_message: 'Xác nhận trạng thái ZaloPay thành công',
    });
  } catch (error: any) {
    console.error('Lỗi callback ZaloPay:', error);
    res.status(500).json({ return_code: 2, return_message: error.message });
  }
});

// 3. POST /api/orders/simulate-zalopay-success (Dành cho việc test/demo đồ án)
// Cho phép giả lập thanh toán ZaloPay thành công ngay lập tức để demo quy trình
ordersRouter.post('/simulate-zalopay-success', async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ success: false, message: 'Thiếu orderCode!' });
    }

    const pool = await getDbPool();
    await pool
      .request()
      .input('orderCode', sql.VarChar(50), orderCode)
      .query(`
        UPDATE dbo.Orders
        SET PaymentStatus = 'Paid', UpdatedAt = GETDATE()
        WHERE OrderCode = @orderCode
      `);

    res.json({
      success: true,
      message: `Đã giả lập thanh toán ZaloPay thành công cho đơn hàng ${orderCode}!`,
    });
  } catch (error: any) {
    console.error('Lỗi giả lập thanh toán:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET /api/orders/user/:userId
// Lấy lịch sử đơn hàng của người dùng
ordersRouter.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('uId', sql.VarChar(100), userId)
      .query(`
        SELECT 
          OrderId, OrderCode, CustomerName, Phone, ShippingAddress, 
          TotalAmount, DiscountAmount, FinalAmount, PaymentMethod, PaymentStatus, 
          OrderStatus,
          CONVERT(VARCHAR(19), CreatedAt, 120) AS CreatedAt
        FROM dbo.Orders
        WHERE UserId = @uId
        ORDER BY CreatedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy đơn hàng người dùng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. PUT /api/orders/:id/update-shipping
// Người dùng cập nhật lại địa chỉ, SĐT, người nhận khi đơn đang ở trạng thái 'PendingConfirm'
ordersRouter.put('/:id/update-shipping', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(String(req.params.id), 10);
    const { customerName, phone, shippingAddress, note } = req.body;

    if (!customerName || !phone || !shippingAddress) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, SĐT và địa chỉ!' });
    }

    const pool = await getDbPool();
    const checkOrder = await pool
      .request()
      .input('oId', sql.Int, orderId)
      .query(`SELECT OrderStatus FROM dbo.Orders WHERE OrderId = @oId`);

    if (checkOrder.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    if (checkOrder.recordset[0].OrderStatus !== 'PendingConfirm') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được nhà vườn chuẩn bị hoặc đang giao, không thể sửa thông tin!',
      });
    }

    await pool
      .request()
      .input('oId', sql.Int, orderId)
      .input('name', sql.NVarChar(150), customerName)
      .input('phone', sql.VarChar(20), phone)
      .input('address', sql.NVarChar(350), shippingAddress)
      .input('note', sql.NVarChar(500), note || null)
      .query(`
        UPDATE dbo.Orders
        SET CustomerName = @name, Phone = @phone, ShippingAddress = @address, Note = @note, UpdatedAt = GETDATE()
        WHERE OrderId = @oId
      `);

    res.json({
      success: true,
      message: 'Cập nhật thông tin giao hàng thành công!',
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật địa chỉ đơn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. PUT /api/orders/:id/cancel
// Người dùng hoặc Admin hủy đơn hàng (Hỗ trợ cả OrderId số và OrderCode chuỗi)
ordersRouter.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const rawParam = String(req.params.id || '').trim();
    const bodyOrderCode = String(req.body?.orderCode || '').trim();
    const bodyOrderId = req.body?.orderId ? parseInt(String(req.body.orderId), 10) : NaN;

    const parsedParam = parseInt(rawParam, 10);
    // Kiểm tra xem ID có phải là số nguyên 32-bit hợp lệ của SQL Server không (tránh overflow Date.now())
    const candidateId =
      !isNaN(bodyOrderId) && bodyOrderId > 0 && bodyOrderId <= 2147483647
        ? bodyOrderId
        : !isNaN(parsedParam) && parsedParam > 0 && parsedParam <= 2147483647
        ? parsedParam
        : null;

    const candidateCode = bodyOrderCode || rawParam;

    const pool = await getDbPool();

    let checkOrder;
    if (candidateId !== null) {
      checkOrder = await pool
        .request()
        .input('oId', sql.Int, candidateId)
        .input('code', sql.VarChar(50), candidateCode)
        .query(`
          SELECT OrderId, OrderCode, FinalAmount, PaymentStatus, OrderStatus 
          FROM dbo.Orders 
          WHERE OrderId = @oId OR OrderCode = @code
        `);
    } else {
      checkOrder = await pool
        .request()
        .input('code', sql.VarChar(50), candidateCode)
        .query(`
          SELECT OrderId, OrderCode, FinalAmount, PaymentStatus, OrderStatus 
          FROM dbo.Orders 
          WHERE OrderCode = @code
        `);
    }

    if (checkOrder.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    const orderRow = checkOrder.recordset[0];
    const realOrderId = orderRow.OrderId;
    const realOrderCode = orderRow.OrderCode;
    const currentStatus = orderRow.OrderStatus;
    const finalAmount = orderRow.FinalAmount || 0;

    if (currentStatus === 'Shipping' || currentStatus === 'Completed' || currentStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đang trên đường giao hoặc đã hoàn tất/đã hủy, không thể hủy!',
      });
    }

    // Hoàn lại số lượng tồn kho sản phẩm cho kho hàng
    const itemsResult = await pool
      .request()
      .input('oId', sql.Int, realOrderId)
      .query(`SELECT ProductId, Quantity FROM dbo.OrderItems WHERE OrderId = @oId`);

    for (const it of itemsResult.recordset) {
      await pool
        .request()
        .input('pId', sql.Int, it.ProductId)
        .input('qty', sql.Int, it.Quantity)
        .query(`UPDATE dbo.Products SET InStockQuantity = InStockQuantity + @qty WHERE ProductId = @pId`);
    }

    // Cập nhật trạng thái đơn hàng sang Cancelled và hoàn tiền
    await pool
      .request()
      .input('oId', sql.Int, realOrderId)
      .query(`
        UPDATE dbo.Orders
        SET OrderStatus = 'Cancelled', PaymentStatus = 'Refunded', Note = N'Người dùng hủy đơn', UpdatedAt = GETDATE()
        WHERE OrderId = @oId
      `);



    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công!',
      data: {
        orderId: realOrderId,
        orderCode: realOrderCode,
        orderStatus: 'Cancelled',
        paymentStatus: 'Refunded',
      },
    });
  } catch (error: any) {
    console.error('Lỗi hủy đơn hàng:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. GET /api/orders/track/:orderCode
// Tra cứu trạng thái đơn hàng thời gian thực
ordersRouter.get('/track/:orderCode', async (req: Request, res: Response) => {
  try {
    const code = req.params.orderCode;
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('code', sql.VarChar(50), code)
      .query(`
        SELECT 
          OrderId, OrderCode, CustomerName, Phone, ShippingAddress, Note,
          TotalAmount, DiscountAmount, FinalAmount, PaymentMethod, PaymentStatus, 
          OrderStatus,
          CONVERT(VARCHAR(19), AdminConfirmedAt, 120) AS AdminConfirmedAt,
          CONVERT(VARCHAR(19), CreatedAt, 120) AS CreatedAt,
          CONVERT(VARCHAR(19), UpdatedAt, 120) AS UpdatedAt
        FROM dbo.Orders
        WHERE OrderCode = @code OR Phone = @code
        ORDER BY CreatedAt DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng với mã hoặc SĐT này!' });
    }

    const order = result.recordset[0];
    const itemsResult = await pool
      .request()
      .input('oId', sql.Int, order.OrderId)
      .query(`
        SELECT ProductId, ProductName, Price, Quantity, Subtotal
        FROM dbo.OrderItems
        WHERE OrderId = @oId
      `);

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.recordset,
      },
    });
  } catch (error: any) {
    console.error('Lỗi tra cứu đơn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


