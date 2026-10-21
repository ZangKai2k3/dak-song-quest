import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDbPool, sql } from '../config/db';

export const ordersRouter = Router();

// ==========================================
// CẤU HÌNH & HÀM XỬ LÝ ZALOPAY SANDBOX GATEWAY
// ==========================================
export const ZALOPAY_SANDBOX_CONFIG = {
  app_id: 554,
  key1: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn',
  key2: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny',
  create_endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  query_endpoint: 'https://sb-openapi.zalopay.vn/v2/query',
};

export async function createZaloPaySandboxOrder(params: {
  orderCode: string;
  amount: number;
  customerName: string;
  items?: any[];
}) {
  try {
    const { orderCode, amount, customerName, items = [] } = params;
    const transID = Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const app_trans_id = `${yy}${mm}${dd}_${transID}`;
    const app_time = Date.now();
    const app_user = customerName || 'dak_song_guest';
    const embed_data = JSON.stringify({
      orderCode,
      redirecturl: 'https://zalo.me',
      merchantinfo: 'Hợp tác xã Nông sản Đắk Song',
    });
    const itemStr = JSON.stringify(items);

    const data = [
      ZALOPAY_SANDBOX_CONFIG.app_id,
      app_trans_id,
      app_user,
      amount,
      app_time,
      embed_data,
      itemStr,
    ].join('|');

    const mac = crypto
      .createHmac('sha256', ZALOPAY_SANDBOX_CONFIG.key1)
      .update(data)
      .digest('hex');

    const body = {
      app_id: ZALOPAY_SANDBOX_CONFIG.app_id,
      app_trans_id,
      app_user,
      amount,
      app_time,
      embed_data,
      item: itemStr,
      description: `Đắk Song Quest - Đơn hàng #${orderCode}`,
      bank_code: 'zalopayapp',
      mac,
    };

    const res = await fetch(ZALOPAY_SANDBOX_CONFIG.create_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body as any).toString(),
    });

    const json = (await res.json()) as any;
    const isSuccess = json.return_code === 1;
    return {
      success: isSuccess,
      app_trans_id,
      order_url: json.order_url || '',
      zp_trans_token: json.zp_trans_token || '',
      order_token: json.order_token || '',
      return_code: json.return_code,
      return_message: json.return_message,
    };
  } catch (err: any) {
    console.warn('Lỗi gọi ZaloPay Sandbox Gateway:', err.message);
    return {
      success: false,
      app_trans_id: '',
      order_url: '',
      zp_trans_token: '',
      return_code: 2,
      return_message: err.message,
    };
  }
}

export async function queryZaloPaySandboxOrder(app_trans_id: string) {
  try {
    const data = `${ZALOPAY_SANDBOX_CONFIG.app_id}|${app_trans_id}|${ZALOPAY_SANDBOX_CONFIG.key1}`;
    const mac = crypto
      .createHmac('sha256', ZALOPAY_SANDBOX_CONFIG.key1)
      .update(data)
      .digest('hex');

    const body = {
      app_id: ZALOPAY_SANDBOX_CONFIG.app_id,
      app_trans_id,
      mac,
    };

    const res = await fetch(ZALOPAY_SANDBOX_CONFIG.query_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body as any).toString(),
    });

    return (await res.json()) as any;
  } catch (err: any) {
    return { return_code: 2, return_message: err.message };
  }
}

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

      const isCOD = paymentMethod === 'COD';
      const initialPayStatus = isCOD ? 'Unpaid' : 'Pending';

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
        .input('payStatus', sql.NVarChar(30), initialPayStatus) // COD: Unpaid | ZaloPay: Pending
        .input('orderStatus', sql.NVarChar(50), 'PendingConfirm') // Chờ HTX kiểm tra và gọi điện xác nhận
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

      // Nếu khách chọn hình thức Thanh toán khi nhận hàng (COD)
      if (isCOD) {
        return res.json({
          success: true,
          message: 'Đặt hàng COD thành công! Hợp tác xã sẽ gọi điện xác nhận trước khi đóng gói gửi bưu điện.',
          data: {
            orderId: newOrderId,
            orderCode,
            totalAmount,
            discountAmount,
            finalAmount,
            customerName,
            phone,
            shippingAddress,
            paymentMethod: 'COD',
            paymentStatus: 'Unpaid',
            orderStatus: 'PendingConfirm',
          },
        });
      }

      // Khởi tạo giao dịch ZaloPay Sandbox (AppID: 554)
      let sandboxPayment: any = {
        success: true,
        app_trans_id: `261021_${Math.floor(100000 + Math.random() * 900000)}`,
        order_url: `https://qcgateway.zalopay.vn/openinapp?order=eyJhcHBpZCI6NTU0LCJvcmRlciI6IiR7b3JkZXJDb2RlfSJ9`,
        zp_trans_token: `ZP_TOKEN_${orderCode}`,
        return_code: 1,
      };

      if (finalAmount > 0) {
        const zpRes = await createZaloPaySandboxOrder({
          orderCode,
          amount: Number(finalAmount),
          customerName,
          items: orderItemsToInsert.map((i) => ({
            itemid: String(i.productId),
            itemname: i.productName,
            itemprice: i.price,
            itemquantity: i.quantity,
          })),
        });
        if (zpRes.success) {
          sandboxPayment = zpRes;
        }
      }

      res.json({
        success: true,
        message: 'Khởi tạo đơn hàng thành công! Tiến hành thanh toán Ví ZaloPay.',
        data: {
          orderId: newOrderId,
          orderCode,
          totalAmount,
          discountAmount,
          finalAmount,
          customerName,
          phone,
          shippingAddress,
          zaloPay: {
            isSandbox: true,
            app_id: ZALOPAY_SANDBOX_CONFIG.app_id,
            app_trans_id: sandboxPayment.app_trans_id,
            order_url: sandboxPayment.order_url,
            zp_trans_token: sandboxPayment.zp_trans_token,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(sandboxPayment.order_url || `https://zalopay.vn/pay?orderCode=${orderCode}`)}`,
          },
          zaloPayOrderUrl: sandboxPayment.order_url || `https://zalopay.vn/pay?orderCode=${orderCode}&amount=${finalAmount}`,
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

// 3b. POST /api/orders/zalopay-sandbox/query
// Kiểm tra trạng thái giao dịch từ hệ thống ZaloPay Sandbox hoặc Database
ordersRouter.post('/zalopay-sandbox/query', async (req: Request, res: Response) => {
  try {
    const { app_trans_id, orderCode } = req.body;
    if (!app_trans_id && !orderCode) {
      return res.status(400).json({ success: false, message: 'Thiếu app_trans_id hoặc orderCode!' });
    }

    const pool = await getDbPool();

    // 1. Thử gọi sang ZaloPay Sandbox Gateway kiểm tra nếu có app_trans_id
    if (app_trans_id) {
      const zpResult = await queryZaloPaySandboxOrder(app_trans_id);
      if (zpResult && zpResult.return_code === 1) {
        if (orderCode) {
          await pool.request()
            .input('code', sql.VarChar(50), orderCode)
            .query(`UPDATE dbo.Orders SET PaymentStatus = 'Paid', UpdatedAt = GETDATE() WHERE OrderCode = @code`);
        }
        return res.json({
          success: true,
          isPaid: true,
          message: 'Hệ thống ZaloPay xác nhận: Giao dịch đã thanh toán thành công!',
          zaloPayData: zpResult,
        });
      }
    }

    // 2. Tra cứu trạng thái trong CSDL
    if (orderCode) {
      const dbOrder = await pool.request()
        .input('code', sql.VarChar(50), orderCode)
        .query(`SELECT PaymentStatus, OrderStatus FROM dbo.Orders WHERE OrderCode = @code`);

      if (dbOrder.recordset.length > 0) {
        const isPaid = dbOrder.recordset[0].PaymentStatus === 'Paid';
        return res.json({
          success: true,
          isPaid,
          orderStatus: dbOrder.recordset[0].OrderStatus,
          message: isPaid ? 'Đơn hàng đã được ghi nhận thanh toán thành công!' : 'Đơn hàng đang chờ thanh toán qua Ví ZaloPay.',
        });
      }
    }

    res.json({ success: true, isPaid: false, message: 'Chưa có thông tin thanh toán.' });
  } catch (error: any) {
    console.error('Lỗi tra cứu ZaloPay Sandbox:', error);
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


