import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDbPool } from './config/db';
import { vouchersRouter } from './routes/vouchers';
import { productsRouter } from './routes/products';
import { ordersRouter } from './routes/orders';
import { adminRouter } from './routes/admin';
import { leaderboardRouter } from './routes/leaderboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vouchers', vouchersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Endpoint kiểm tra sức khỏe hệ thống (Health Check)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const pool = await getDbPool();
    const dbTest = await pool.request().query('SELECT GETDATE() AS ServerTime');
    res.json({
      status: 'OK',
      message: 'Hệ thống Backend Đắk Song Quest đang hoạt động bình thường!',
      serverTime: dbTest.recordset[0].ServerTime,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DATABASE_ERROR',
      message: 'Lỗi kết nối tới Microsoft SQL Server',
      error: error.message,
    });
  }
});

import path from 'path';

// Phục vụ giao diện Trang Web Quản trị Admin CMS
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

// Trang chào mừng mặc định
app.get('/', (_req: Request, res: Response) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #065f46;">🌲 ĐẮK SONG QUEST BACKEND API 🌲</h1>
      <p>Hệ thống Quản lý Voucher & Sàn Đặc sản OCOP Đắk Song kết nối Microsoft SQL Server.</p>
      <div style="margin-top: 20px;">
        <a href="/admin" style="display: inline-block; background: #065f46; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: bold;">
          👉 Mở Trang Quản Trị (Admin Portal)
        </a>
      </div>
      <p style="margin-top: 20px; font-size: 13px; color: #666;">Kiểm tra API: <a href="/api/health">/api/health</a></p>
    </div>
  `);
});

// Khởi chạy server
app.listen(PORT, async () => {
  console.log(`🚀 Máy chủ Backend Đắk Song Quest đang chạy tại: http://localhost:${PORT}`);
  try {
    await getDbPool();
  } catch {
    console.warn('⚠️ Lưu ý: Chưa thể kết nối tới SQL Server. Hãy kiểm tra file .env và chắc chắn SQL Server đang bật!');
  }
});

