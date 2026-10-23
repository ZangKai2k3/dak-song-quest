# HUONG DAN CAI DAT VA CHAY BACKEND DAK SONG QUEST (MICROSOFT SQL SERVER)

He thong Backend duoc xay dung bang Node.js, TypeScript va Express ket noi truc tiep voi Microsoft SQL Server (MSSQL). He thong ap dung kien truc 1 Server duy nhat nhung tu dong phan quyen va tao ra 2 bo giao dien rieng biet cho Hop tac xa va UBND Huyen:

1. Phan quyen tai khoan Backend:
   - Hop tac xa Nong san Dak Song (Tai khoan: htx_daksong / Mat khau: 123 - Role: COOP): Toan quyen quan tri San TMDT OCOP, kho hang dac san, bang gia, xac nhan con hang, dong goi gui Viettel Post, hoan tat don hoac huy don kem ghi chu ro rang.
   - UBND va Ban Quan ly Huyen (Tai khoan: huyen_daksong / Mat khau: 123 - Role: DISTRICT): Tham dinh, thoa thuan va cap phat han muc voucher quan an, khach san; quan tri BXH Quiz va nhat ky kiem toan toan he thong (chi xem va kiem toan voucher va BXH, an tinh nang don hang va kho hang OCOP).
2. Quan ly han muc Voucher cho tung co so: Cung cap han muc voucher theo thoa thuan voi quan (TotalLimit), kiem soat so luong da phat ra (IssuedCount) va so luong khach da den dung thuc te (UsedCount).
3. San Dac san OCOP Dak Song: Quan ly danh muc dac san nong nghiep Dak Song (Hat tieu huu co Dak Song, Ca phe Robusta dac san, Hat Mac ca say nut, Mang le rung kho).
4. Dieu phoi don hang va Thanh toan da kenh: Nguoi dung dat hang, luu dia chi giao hang, thanh toan linh hoat qua Vi ZaloPay hoac Tien mat (COD). HTX kiem tra don hang, goi dien xac nhan voi nha vuon con hang va chuyen trang thai sang san sang giao (ReadyToShip).
5. Trang Web Quan tri Admin CMS: Giao dien web tai dia chi http://localhost:5000/admin.html cho phep can bo dang nhap theo quyen han, tu dong thay doi mau sac thuong hieu va bo cong cu phu hop voi tung don vi.

---

## BUOC 1: KHOI TAO CO SO DU LIEU SQL SERVER

1. Mo SQL Server Management Studio (SSMS) hoac cong cu quan ly SQL Server ban dang dung.
2. Tao co so du lieu moi:
   ```sql
   CREATE DATABASE DakSongQuestDB;
   ```
3. Khi may chu backend khoi chay lan dau tien, he thong se tu dong kiem tra va khoi tao toan bo cac bang CSDL (AdminUsers, Venues, Products, Orders, OrderItems, UserVouchers, QuizLeaderboard, AdminAuditLogs) va nap san du lieu mau ban dau.

---

## BUOC 2: CAU HINH BIEN MOI TRUONG (.env)

Mo file .env trong thu muc backend/ va kiem tra thong tin ket noi SQL Server:

```env
PORT=5000

# Ten may chu SQL Server:
# - Neu dung ban SQL Server mac dinh: localhost hoac 127.0.0.1
# - Neu dung ban SQL Server Express: .\SQLEXPRESS hoac localhost\SQLEXPRESS
DB_SERVER=.\SQLEXPRESS
DB_PORT=1433
DB_DATABASE=DakSongQuestDB

# Chuoi ket noi Windows Authentication (khuyen nghi cho ban Express):
DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
```

---

## BUOC 3: CAI DAT THU VIEN VA CHAY SERVER

Mo PowerShell hoac Command Prompt tai thu muc backend/:

```powershell
cd d:\test\dak-song-quest-fixed\backend

# 1. Cai dat cac thu vien can thiet
npm install

# 2. Bien dich ma nguon TypeScript
npm run build

# 3. Khoi chay may chu backend
node dist/index.js
```

(Hoac su dung lenh npm run dev de khoi chay o che do Development).

Khi chay thanh cong, man hinh se thong bao:
- May chu Backend Dak Song Quest dang chay tai: http://localhost:5000
- Ket noi thanh cong toi Microsoft SQL Server

---

## DANH SACH CAC API ENDPOINTS

### 1. Danh cho Mini App (Nguoi choi va Mua sam)
- GET /api/health: Kiem tra ket noi may chu va SQL Server.
- GET /api/vouchers/available-pool: Lay danh sach quan con han muc voucher thuc te.
- POST /api/vouchers/claim: Cap voucher ngau nhien khi nguoi choi hoan thanh Quiz hoac quay thuong.
- POST /api/vouchers/redeem: Nhan vien co so xac nhan su dung voucher tai quan.
- GET /api/vouchers/user/:userId: Xem kho voucher cua nguoi dung.
- GET /api/products: Lay danh sach nong san dac san kem so luong ton kho thuc te.
- POST /api/orders/create: Dat hang mua dac san OCOP, ho tro 2 phuong thuc thanh toan: ZaloPay va COD (Tien mat).
- POST /api/orders/simulate-zalopay-success: Gia lap thanh toan ZaloPay thanh cong.
- PUT /api/orders/:id/cancel: Khach hang chu dong huy don hang khi chua xuat kho (tu dong hoan lai 100% ton kho).
- PUT /api/orders/:id/update-shipping: Cap nhat lai thong tin nguoi nhan hang khi don dang o buoc Cho xac nhan.
- GET /api/orders/track/:orderCode: Tra cuu tien do don hang theo ma don.
- GET /api/leaderboard: Xem bang xep hang diem Quiz tuan.
- POST /api/leaderboard/submit: Luu ket qua thi Quiz chinh thuc.
- PUT /api/leaderboard/rename: Cap nhat ten hien thi va avatar thi sinh.

### 2. Danh cho Quan tri vien (Admin CMS)
- POST /api/admin/auth/login: Xac thuc dang nhap phan quyen giua Hop tac xa (Role: COOP) va UBND Huyen (Role: DISTRICT).
- GET /api/admin/dashboard/stats: Thong ke tong hop so lieu Dashboard (Co so, Voucher, Doanh thu, Don hang, Don ton, Thi sinh, Audit Logs).
- GET /api/admin/venues: Danh sach co so va han muc voucher (TotalLimit, IssuedCount, UsedCount).
- POST /api/admin/venues: Them co so du lich moi (Chi danh cho role DISTRICT, role COOP bi chan 403).
- PUT /api/admin/venues/:id/limit: Dieu chinh han muc voucher cho quan (Tham quyen DISTRICT).
- POST /api/admin/venues/:id/add-vouchers: Cap them so luong voucher cho quan (Tham quyen DISTRICT).
- DELETE /api/admin/venues/:id: Xoa co so khoi he thong (Tham quyen DISTRICT).
- GET /api/admin/orders: Xem danh sach toan bo don hang OCOP kem nhan phan loai CancelledBy (HTX vs USER).
- GET /api/admin/orders/:id/items: Xem chi tiet cac san pham ben trong don hang.
- PUT /api/admin/orders/:id/status: Dieu phoi don hang (Tham quyen doc quyen cua Hop tac xa COOP, role DISTRICT bi chan 403):
  - ReadyToShip: HTX xac nhan con hang voi nha vuon va chuyen sang dong goi.
  - Shipping: HTX ban giao kien hang cho don vi van chuyen Viettel Post.
  - Completed: Giao hang thanh cong den tay nguoi mua.
  - Cancelled: HTX huy don hang do chat luong hoac so luong khong dam bao (tu dong hoan kho, ghi chu xin loi khach).
- POST /api/admin/products: Them san pham dac san OCOP moi (Tham quyen COOP, role DISTRICT bi chan 403).
- PUT /api/admin/products/:id: Cap nhat gia ban va so luong ton kho san pham (Tham quyen COOP, role DISTRICT bi chan 403).
- GET /api/admin/audit-logs: Xem nhat ky lich su kiem toan he thong.
- DELETE /api/admin/leaderboard/:id: Xoa ket qua thi gian lan khoi BXH, reset diem thi sinh ve 0 de thi lai (Tham quyen DISTRICT, role COOP bi chan 403).
