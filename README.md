# 🌾 ĐẮK SONG QUEST - ZALO MINI APP & ADMIN CMS

> **Nền tảng số hóa du lịch, trò chơi đố vui nhận thưởng và điều phối nông sản OCOP huyện Đắk Song, tỉnh Đắk Nông.**

---

## 📌 1. Giới thiệu Dự án

**Đắk Song Quest** là ứng dụng tích hợp đa nền tảng kết hợp giữa **Zalo Mini App** (dành cho du khách trên điện thoại) và **Admin CMS Web** (dành cho cán bộ quản lý / Hợp tác xã/ Nhân viên trên máy tính), vận hành trên nền tảng cơ sở dữ liệu quan hệ **Microsoft SQL Server**.

### Các tính năng nổi bật:
- 🎯 **Trò chơi Đố vui Du lịch (Quiz Game)**:
  - 2 chế độ: *Luyện tập* (không giới hạn theo chủ đề) và *Thi chính thức* (25 câu hỏi tính giờ mili-giây).
  - Bảng xếp hạng tuần thời gian thực, tự động phân biệt thí sinh trùng tên/avatar bằng Tag ID.
  - Cho phép tùy chỉnh tên và chọn 6 avatar nhân vật.
- 🎡 **Vòng quay May mắn (Lucky Wheel)**:
  - Quay trúng voucher thực tế từ các quán ăn, nhà hàng, khách sạn trên địa bàn huyện Đắk Song.
  - **Liên kết kho thực**: Tự động loại bỏ cơ sở khỏi vòng quay khi quán đã hết hạn mức phát hành trên CSDL.
- 🛒 **Sàn Nông sản Đặc sản OCOP Đắk Song**:
  - Xem sản phẩm, tồn kho thực tế, bảo vệ chống tranh chấp mua cùng lúc (Race Conditions).
  - Áp mã giảm giá OCOP, thanh toán mô phỏng ZaloPay In-App chuẩn quy trình.
  - Theo dõi tiến độ đơn hàng 4 bước: *Chờ duyệt* -> *Đóng gói* -> *Đang giao* -> *Hoàn tất*.
  - **Hủy đơn hàng thông minh**: Hiện Popup Modal xác nhận hủy đơn, tự động hoàn trả 100% số lượng tồn kho về SQL Server, trừ bớt doanh thu trên Dashboard; tự động khóa hủy khi đơn đã chuyển sang *Đang giao*.
- 🌦️ **Thời tiết Đắk Song Thời gian thực**: Tích hợp dữ liệu khí tượng trạm vệ tinh tọa độ Đắk Song (`12.535, 107.692`) qua Open-Meteo API.
- 🗺️ **Cẩm nang Du lịch & Dịch vụ**: Tra cứu điểm tham quan, lưu trú, ăn uống, hotline đặt bàn và chỉ đường Google Maps một chạm.
- 🛡️ **Hệ thống Quản trị Admin CMS Web**:
  - Dashboard thống kê tức thời (Doanh thu ZaloPay, Voucher, Thí sinh).
  - Quản lý cơ sở và cấp thêm hạn mức voucher (+10, +20, +50, +100...).
  - Điều phối đơn hàng OCOP: Phân biệt rõ đơn khách tự hủy (`[🔴 Người dùng hủy đơn]`) vs đơn HTX hủy, bộ lọc đơn đa năng.
  - Quản lý giá bán và tồn kho đặc sản.
  - Quản lý BXH: Xóa thành tích reset điểm tuần về 0 để thí sinh thi lại.
  - Lịch sử chỉnh sửa có bộ lọc phân loại: Kết quả thi, Voucher, Hàng hóa OCOP.
  - Cơ chế Realtime Polling tự động làm mới số liệu mỗi 4 giây.

---

## 🏗️ 2. Ngăn xếp Công nghệ (Tech Stack)

| Phân hệ | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend Mini App** | React 19, TypeScript, Vite 7, Tailwind CSS v4, Jotai, Lucide React, ZMP SDK (`zmp-sdk`) |
| **Backend API** | Node.js (v20+), Express, TypeScript, mssql, msnodesqlv8 |
| **Admin CMS Web** | Single Page Application (HTML5, Tailwind CSS, Lucide Icons, Vanilla JS) |
| **Cơ sở dữ liệu** | Microsoft SQL Server (SQLEXPRESS) |
| **Khí tượng** | Open-Meteo Satellite API |

---

## 📁 3. Cấu trúc Thư mục

```text
dak-song-quest-fixed/
├── app-config.json              # Cấu hình Zalo Mini App
├── package.json                 # Cấu hình dependency Frontend
├── vite.config.ts               # Cấu hình Vite bundler & Proxy
├── MO_TA_HE_THONG.md            # Tài liệu mô tả hệ thống chi tiết (Kiến trúc & CSDL)
├── README.md                    # Hướng dẫn cài đặt và vận hành
├── dist/                        # Gói build thành phẩm sẵn sàng deploy lên Zalo
├── backend/                     # Mã nguồn Backend Node.js & Admin CMS
│   ├── .env                     # Cấu hình cổng PORT và chuỗi kết nối SQL Server
│   ├── package.json             # Dependency backend (express, mssql...)
│   ├── tsconfig.json            # Cấu hình TypeScript Backend
│   ├── public/
│   │   └── admin.html           # Giao diện Admin CMS Dashboard toàn diện
│   └── src/
│       ├── index.ts             # Entry point máy chủ Express
│       ├── config/
│       │   └── db.ts            # Kết nối Microsoft SQL Server
│       └── routes/
│           ├── admin.ts         # API Quản trị CMS & Lịch sử chỉnh sửa
│           ├── orders.ts        # API Đơn hàng, ZaloPay & Tiến độ vận chuyển
│           ├── products.ts      # API Danh mục Nông sản OCOP & Tồn kho
│           ├── vouchers.ts      # API Quản lý Voucher & Vòng quay may mắn
│           └── leaderboard.ts   # API Bảng xếp hạng Quiz tuần
└── src/                         # Mã nguồn Frontend Zalo Mini App
    ├── components/              # Các UI Components (Layout, WeatherCard, LuckyWheelModal...)
    ├── data/                    # Dữ liệu tĩnh dự phòng (câu hỏi, địa điểm...)
    ├── pages/                   # Các màn hình chính (Home, Quiz, Store, MapPage, Vouchers...)
    ├── services/                # API Client config, Weather Service, ZMP SDK Adapter
    ├── state/                   # Quản lý State bằng Jotai Atoms & LocalStorage
    └── types/                   # Định nghĩa Interface & TypeScript Types
```

---

## 🚀 4. Hướng dẫn Khởi chạy Môi trường Local

### 4.1. Chuẩn bị Cơ sở dữ liệu Microsoft SQL Server
1. Cài đặt **SQL Server Express** (`.\SQLEXPRESS`) và **ODBC Driver 18 for SQL Server**.
2. Mở SQL Server Management Studio (SSMS) và tạo database:
   ```sql
   CREATE DATABASE DakSongQuestDB;
   ```
3. Kiểm tra file cấu hình kết nối tại `backend/.env`:
   ```env
   PORT=5000
   DB_SERVER=.\SQLEXPRESS
   DB_DATABASE=DakSongQuestDB
   DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
   ```
   *(Hệ thống sẽ **tự động tạo toàn bộ các bảng CSDL và nạp dữ liệu mẫu ban đầu** khi backend khởi chạy lần đầu).*

---

### 4.2. Khởi chạy Backend Server & Admin CMS
Mở Terminal tại thư mục `backend`:
```bash
cd backend
npm install
npm run build
node dist/index.js
```
- **Máy chủ Backend API** chạy tại: `http://localhost:5000`
- **Trang Quản trị Admin CMS** truy cập tại: `http://localhost:5000/admin.html`

---

### 4.3. Khởi chạy Frontend Zalo Mini App
Mở một cửa sổ Terminal mới tại thư mục gốc:
```bash
npm install
npm run dev
```
- Mở trình duyệt tại: `http://localhost:5173` để trải nghiệm giao diện Mini App.

---

## 📱 5. Đóng gói & Triển khai lên Zalo Mini App Thật

### Bước 1: Đăng nhập tài khoản Zalo Developer
```bash
zmp login
```
- Quét mã QR hiển thị trong terminal bằng ứng dụng Zalo trên điện thoại để xác thực.

### Bước 2: Deploy lên máy chủ Zalo
```bash
npm run deploy
```
- Chọn trạng thái phiên bản: `Testing`.
- Nhập mô tả phiên bản (VD: *Bản kiểm thử nghiệm thu*).
- Sau khi tải lên thành công, mở [Zalo Mini App Console](https://mini.zalo.me) để lấy mã QR kiểm thử trên điện thoại thật.

---

## 📑 6. Tài liệu Kỹ thuật Chi tiết
Để xem toàn bộ sơ đồ kiến trúc hệ thống (Mermaid Diagram), thiết kế cơ sở dữ liệu chi tiết (ERD), mô tả chi tiết từng API Endpoint và các quy trình nghiệp vụ sâu, vui lòng tham khảo file:
👉 [MO_TA_HE_THONG.md](file:///d:/test/dak-song-quest-fixed/MO_TA_HE_THONG.md)
