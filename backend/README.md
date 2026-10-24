# HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY BACKEND ĐẮK SONG QUEST (MICROSOFT SQL SERVER)

Hệ thống Backend được xây dựng bằng Node.js, TypeScript và Express kết nối trực tiếp với Microsoft SQL Server (MSSQL). Hệ thống áp dụng kiến trúc 1 Server duy nhất nhưng tự động phân quyền và tạo ra 2 bộ giao diện riêng biệt cho Hợp tác xã và UBND Huyện:

1. Phân quyền tài khoản Backend:
   - Hợp tác xã Nông sản Đắk Song (Tài khoản: htx_daksong / Mật khẩu: 123 - Role: COOP): Toàn quyền quản trị Sàn TMĐT OCOP, kho hàng đặc sản, bảng giá, xác nhận còn hàng, đóng gói gửi Viettel Post, hoàn tất đơn hoặc hủy đơn kèm ghi chú rõ ràng.
   - UBND và Ban Quản lý Huyện (Tài khoản: huyen_daksong / Mật khẩu: 123 - Role: DISTRICT): Thẩm định, thỏa thuận và cấp phát hạn mức voucher quán ăn, khách sạn; quản trị BXH Quiz và nhật ký kiểm toán toàn hệ thống (chỉ xem và kiểm toán voucher và BXH, ẩn tính năng đơn hàng và kho hàng OCOP).
2. Quản lý hạn mức Voucher cho từng cơ sở: Cung cấp hạn mức voucher theo thỏa thuận với quán (TotalLimit), kiểm soát số lượng đã phát ra (IssuedCount) và số lượng khách đã đến dùng thực tế (UsedCount).
3. Sàn Đặc sản OCOP Đắk Song: Quản lý danh mục đặc sản nông nghiệp Đắk Song (Hạt tiêu hữu cơ Đắk Song, Cà phê Robusta đặc sản, Hạt Mắc ca sấy nứt, Măng lê rừng khô).
4. Điều phối đơn hàng và Thanh toán đa kênh: Người dùng đặt hàng, lưu địa chỉ giao hàng, thanh toán linh hoạt qua Ví ZaloPay hoặc Tiền mặt (COD). HTX kiểm tra đơn hàng, gọi điện xác nhận với nhà vườn còn hàng và chuyển trạng thái sang sẵn sàng giao (ReadyToShip).
5. Trang Web Quản trị Admin CMS: Giao diện web tại địa chỉ http://localhost:5000/admin.html cho phép cán bộ đăng nhập theo quyền hạn, tự động thay đổi màu sắc thương hiệu và bộ công cụ phù hợp với từng đơn vị.

---

## BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU SQL SERVER

1. Mở SQL Server Management Studio (SSMS) hoặc công cụ quản lý SQL Server bạn đang dùng.
2. Tạo cơ sở dữ liệu mới:
   ```sql
   CREATE DATABASE DakSongQuestDB;
   ```
3. Khi máy chủ backend khởi chạy lần đầu tiên, hệ thống sẽ tự động kiểm tra và khởi tạo toàn bộ các bảng CSDL (AdminUsers, Venues, Products, Orders, OrderItems, UserVouchers, QuizLeaderboard, AdminAuditLogs) và nạp sẵn dữ liệu mẫu ban đầu.

---

## BƯỚC 2: CẤU HÌNH BIẾN MÔI TRƯỜNG (.env)

Mở file .env trong thư mục backend/ và kiểm tra thông tin kết nối SQL Server:

```env
PORT=5000

# Tên máy chủ SQL Server:
# - Nếu dùng bản SQL Server mặc định: localhost hoặc 127.0.0.1
# - Nếu dùng bản SQL Server Express: .\SQLEXPRESS hoặc localhost\SQLEXPRESS
DB_SERVER=.\SQLEXPRESS
DB_PORT=1433
DB_DATABASE=DakSongQuestDB

# Chuỗi kết nối Windows Authentication (khuyến nghị cho bản Express):
DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
```

---

## BƯỚC 3: CÀI ĐẶT THƯ VIỆN VÀ CHẠY SERVER

Mở PowerShell hoặc Command Prompt tại thư mục backend/:

```powershell
cd d:\test\dak-song-quest-fixed\backend

# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Biên dịch mã nguồn TypeScript
npm run build

# 3. Khởi chạy máy chủ backend
node dist/index.js
```

(Hoặc sử dụng lệnh npm run dev để khởi chạy ở chế độ Development).

Khi chạy thành công, màn hình sẽ thông báo:
- Máy chủ Backend Đắk Song Quest đang chạy tại: http://localhost:5000
- Kết nối thành công tới Microsoft SQL Server

---

## DANH SÁCH CÁC API ENDPOINTS

### 1. Dành cho Mini App (Người chơi và Mua sắm)
- GET /api/health: Kiểm tra kết nối máy chủ và SQL Server.
- GET /api/vouchers/available-pool: Lấy danh sách quán còn hạn mức voucher thực tế.
- POST /api/vouchers/claim: Cấp voucher ngẫu nhiên khi người chơi hoàn thành Quiz hoặc quay thưởng.
- POST /api/vouchers/redeem: Nhân viên cơ sở xác nhận sử dụng voucher tại quán.
- GET /api/vouchers/user/:userId: Xem kho voucher của người dùng.
- GET /api/products: Lấy danh sách nông sản đặc sản kèm số lượng tồn kho thực tế.
- POST /api/orders/create: Đặt hàng mua đặc sản OCOP, hỗ trợ 2 phương thức thanh toán: ZaloPay và COD (Tiền mặt).
- POST /api/orders/simulate-zalopay-success: Giả lập thanh toán ZaloPay thành công.
- PUT /api/orders/:id/cancel: Khách hàng chủ động hủy đơn hàng khi chưa xuất kho (tự động hoàn lại 100% tồn kho).
- PUT /api/orders/:id/update-shipping: Cập nhật lại thông tin người nhận hàng khi đơn đang ở bước Chờ xác nhận.
- GET /api/orders/track/:orderCode: Tra cứu tiến độ đơn hàng theo mã đơn.
- GET /api/leaderboard: Xem bảng xếp hạng điểm Quiz tuần.
- POST /api/leaderboard/submit: Lưu kết quả thi Quiz chính thức.
- PUT /api/leaderboard/rename: Cập nhật tên hiển thị và avatar thí sinh.

### 2. Dành cho Quản trị viên (Admin CMS)
- POST /api/admin/auth/login: Xác thực đăng nhập phân quyền giữa Hợp tác xã (Role: COOP) và UBND Huyện (Role: DISTRICT).
- GET /api/admin/dashboard/stats: Thống kê tổng hợp số liệu Dashboard (Cơ sở, Voucher, Doanh thu, Đơn hàng, Đơn tồn, Thí sinh, Audit Logs).
- GET /api/admin/venues: Danh sách cơ sở và hạn mức voucher (TotalLimit, IssuedCount, UsedCount).
- POST /api/admin/venues: Thêm cơ sở du lịch mới (Chỉ dành cho role DISTRICT, role COOP bị chặn 403).
- PUT /api/admin/venues/:id/limit: Điều chỉnh hạn mức voucher cho quán (Thẩm quyền DISTRICT).
- POST /api/admin/venues/:id/add-vouchers: Cấp thêm số lượng voucher cho quán (Thẩm quyền DISTRICT).
- DELETE /api/admin/venues/:id: Xóa cơ sở khỏi hệ thống (Thẩm quyền DISTRICT).
- GET /api/admin/orders: Xem danh sách toàn bộ đơn hàng OCOP kèm nhãn phân loại CancelledBy (HTX vs USER).
- GET /api/admin/orders/:id/items: Xem chi tiết các sản phẩm bên trong đơn hàng.
- PUT /api/admin/orders/:id/status: Điều phối đơn hàng (Thẩm quyền độc quyền của Hợp tác xã COOP, role DISTRICT bị chặn 403):
  - ReadyToShip: HTX xác nhận còn hàng với nhà vườn và chuyển sang đóng gói.
  - Shipping: HTX bàn giao kiện hàng cho đơn vị vận chuyển Viettel Post.
  - Completed: Giao hàng thành công đến tay người mua.
  - Cancelled: HTX hủy đơn hàng do chất lượng hoặc số lượng không đảm bảo (tự động hoàn kho, ghi chú xin lỗi khách).
- POST /api/admin/products: Thêm sản phẩm đặc sản OCOP mới (Thẩm quyền COOP, role DISTRICT bị chặn 403).
- PUT /api/admin/products/:id: Cập nhật giá bán và số lượng tồn kho sản phẩm (Thẩm quyền COOP, role DISTRICT bị chặn 403).
- GET /api/admin/audit-logs: Xem nhật ký lịch sử kiểm toán hệ thống.
- DELETE /api/admin/leaderboard/:id: Xóa kết quả thi gian lận khỏi BXH, reset điểm thí sinh về 0 để thi lại (Thẩm quyền DISTRICT, role COOP bị chặn 403).
