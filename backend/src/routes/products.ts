import { Router, Request, Response } from 'express';
import { getDbPool, sql } from '../config/db';

export const productsRouter = Router();

// 1. GET /api/products
// Lấy danh sách các mặt hàng đặc sản Đắk Song OCOP
productsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const pool = await getDbPool();
    const request = pool.request();

    let query = `
      SELECT 
        ProductId, ProductName, Origin, Category, Price, Unit, 
        ImageUrl, Description, InStockQuantity, CreatedAt
      FROM dbo.Products
      WHERE IsActive = 1
    `;

    if (category) {
      query += ` AND Category = @category`;
      request.input('category', sql.NVarChar(50), category);
    }

    query += ` ORDER BY ProductId ASC`;

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách đặc sản:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/products/:id
// Lấy chi tiết một sản phẩm đặc sản
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(String(req.params.id), 10);
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('pId', sql.Int, productId)
      .query(`
        SELECT 
          ProductId, ProductName, Origin, Category, Price, Unit, 
          ImageUrl, Description, InStockQuantity, CreatedAt
        FROM dbo.Products
        WHERE ProductId = @pId AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error: any) {
    console.error('Lỗi lấy chi tiết sản phẩm:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
