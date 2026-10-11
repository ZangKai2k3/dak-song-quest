# 🌲 HƯỚNG DẪN CÀI ĐẶT & CHẠY BACKEND ĐẮK SONG QUEST (MICROSOFT SQL SERVER)

Hệ thống Backend này được xây dựng bằng **Node.js + TypeScript + Express** kết nối trực tiếp với **Microsoft SQL Server (MSSQL)** để:
1. **Quản lý hạn mức Voucher cho từng cơ sở**: Admin nhập số lượng voucher tối đa theo thỏa thuận với quán (`TotalLimit`), kiểm soát số lượng đã phát ra (`IssuedCount`), số lượng khách đã đến dùng (`UsedCount`).
2. **Sàn Đặc sản OCOP Đắk Song**: Bán các mặt hàng khô đặc sản (Hạt tiêu Đắk N’rung, Cà phê Robusta bazan, Hạt Mắc ca sấy nứt, Măng le rừng khô).
3. **Điều phối đơn hàng & ZaloPay**: Người dùng đặt hàng, lưu địa chỉ giao hàng, thanh toán qua ZaloPay. Admin kiểm tra tiền về $\rightarrow$ gọi điện xác nhận người dân còn hàng $\rightarrow$ chuyển trạng thái sẵn sàng giao (`ReadyToShip`).
4. **Trang Web Quản trị (Admin Portal)**: Giao diện web trực quan tại `http://localhost:5000/admin` cho phép Admin thay đổi nội dung, chỉnh hạn mức voucher, cập nhật giá/kho sản phẩm và đổi trạng thái đơn hàng trực tiếp vào SQL Server!

---

## 🛠️ BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU SQL SERVER

1. Mở **SQL Server Management Studio (SSMS)** hoặc công cụ quản lý SQL Server bạn đang dùng.
2. Mở file [schema.sql](./schema.sql) trong thư mục `backend/`.
3. Bấm **Execute** (hoặc phím `F5`) để chạy kịch bản:
   - Tự động tạo cơ sở dữ liệu `DakSongQuestDB`.
   - Tạo 5 bảng: `Venues`, `UserVouchers`, `Products`, `Orders`, `OrderItems`.
   - Nạp sẵn dữ liệu mẫu cho các quán và các mặt hàng đặc sản Đắk Song OCOP.

---

## ⚙️ BƯỚC 2: CẤU HÌNH BIẾN MÔI TRƯỜNG (.env)

Mở file [.env](./.env) trong thư mục `backend/` và sửa lại thông tin tài khoản SQL Server của bạn:

```env
PORT=5000

# Tên máy chủ SQL Server của bạn:
# - Nếu là bản SQL Server mặc định: localhost hoặc 127.0.0.1
# - Nếu là bản SQL Server Express: localhost\\SQLEXPRESS
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=DakSongQuestDB

# Tài khoản đăng nhập SQL Server (SQL Authentication):
DB_USER=sa
DB_PASSWORD=Mật_khẩu_SQL_Server_của_bạn

DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

---

## 🚀 BƯỚC 3: CÀI ĐẶT THƯ VIỆN & CHẠY SERVER

Mở PowerShell hoặc Command Prompt tại thư mục `backend/`:

```powershell
cd d:\test\dak-song-quest-fixed\backend

# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Khởi chạy server ở chế độ phát triển (Development)
npm run dev
```

Khi chạy thành công, console sẽ hiển thị:
```
🚀 Máy chủ Backend Đắk Song Quest đang chạy tại: http://localhost:5000
✅ Kết nối thành công tới Microsoft SQL Server!
```

---

## 📡 DANH SÁCH CÁC API ENDPOINTS

### 1. Dành cho Mini App (Người chơi & Mua sắm)
- `GET /api/health`: Kiểm tra kết nối server & SQL Server.
- `GET /api/vouchers/available`: Lấy danh sách quán còn hạn mức voucher.
- `POST /api/vouchers/claim`: Cấp voucher ngẫu nhiên khi người chơi hoàn thành Quiz/quay thưởng.
  - Body mẫu: `{ "userId": "zalo_123", "discountPercent": 20 }`
- `POST /api/vouchers/use`: Khách xác nhận sử dụng voucher tại quán.
  - Body mẫu: `{ "voucherCode": "DSQ-1-84920" }`
- `GET /api/vouchers/my-vouchers?userId=zalo_123`: Xem kho voucher của người dùng.
- `GET /api/products`: Lấy danh sách đặc sản (Tiêu Đắk N’rung, Cà phê, Mắc ca, Măng khô).
- `POST /api/orders/create`: Đặt hàng mua đặc sản & tạo thông tin thanh toán ZaloPay.
  - Body mẫu:
    ```json
    {
      "userId": "zalo_123",
      "customerName": "Nguyễn Văn A",
      "phone": "0987654321",
      "shippingAddress": "123 Đường Trần Hưng Đạo, Phường 1, TP. Buôn Ma Thuột",
      "items": [{ "productId": 1, "quantity": 2 }, { "productId": 3, "quantity": 1 }],
      "voucherCode": "DSQ-1-84920",
      "paymentMethod": "ZaloPay"
    }
    ```
- `POST /api/orders/simulate-zalopay-success`: Giả lập thanh toán ZaloPay thành công (dành cho demo đồ án).
  - Body mẫu: `{ "orderCode": "ORD-20261010-8492" }`

### 2. Dành cho Quản trị viên (Admin Dashboard)
- `GET /api/admin/dashboard/stats`: Thống kê tổng số quán, voucher đã phát, đã dùng, tổng đơn hàng, doanh thu.
- `GET /api/admin/venues`: Danh sách chi tiết hạn mức từng quán (`TotalLimit`, `IssuedCount`, `UsedCount`).
- `POST /api/admin/venues`: Thêm quán mới và cài hạn mức voucher thỏa thuận.
  - Body mẫu:
    ```json
    {
      "venueName": "Quán Cà Phê Mây Đắk Song",
      "category": "Quán Cà phê",
      "phone": "0912345678",
      "address": "Thị trấn Đức An, Đắk Song",
      "discountPercent": 20,
      "totalLimit": 100
    }
    ```
- `PUT /api/admin/venues/:id/limit`: Điều chỉnh tăng hạn mức voucher cho quán.
- `GET /api/admin/orders`: Xem danh sách tất cả đơn hàng đã đặt.
- `GET /api/admin/orders/:id/items`: Xem chi tiết các sản phẩm trong đơn hàng.
- `PUT /api/admin/orders/:id/status`: Admin cập nhật trạng thái đơn hàng:
  - `ReadyToShip`: Admin đã gọi xác nhận với nhà vườn Đắk N'rung còn hàng và chuẩn bị giao.
  - `Shipping`: Đã giao cho bưu cục Viettel Post.
  - `Completed`: Giao hàng thành công.

