# DAK SONG QUEST - ZALO MINI APP VA ADMIN CMS

> Nen tang so hoa du lich, tro choi do vui nhan thuong va dieu phoi nong san OCOP huyen Dak Song, tinh Dak Nong.

---

## 1. Gioi thieu Du an

Dak Song Quest la ung dung tich hop da nen tang ket hop giua Zalo Mini App (danh cho du khach tren dien thoai) va Admin CMS Web (danh cho can bo quan ly Huyen va Hop tac xa tren may tinh), van hanh tren nen tang co so du lieu quan he Microsoft SQL Server voi kien truc mot may chu may chu backend duy nhat phan quyen nghiem ngat.

### Cac tinh nang noi bat:
- Tro choi Do vui Du lich (Quiz Game):
  - 2 che do: Luyen tap (khong gioi han theo chu de) va Thi chinh thuc (25 cau hoi tinh gio mili-giay).
  - Bang xep hang tuan thoi gian thuc, tu dong phan biet thi sinh trung ten va avatar bang Tag ID.
  - Cho phep tuy chinh ten va chon bo 8 avatar nhan vat van hoa Dak Song.
- Vong quay May man (Lucky Wheel):
  - Quay trung voucher thuc te tu cac quan an, nha hang, khach san tren dia ban huyen Dak Song.
  - Lien ket kho thuc: Tu dong loai bo co so khoi vong quay khi quan da het han muc phat hanh tren co so du lieu.
- San Nong san Dac san OCOP Dak Song:
  - Xem danh muc san pham, ton kho thuc te, co che chong tranh chap mua cung luc (Race Conditions).
  - Ap dung ma giam gia OCOP, tich hop 2 phuong thuc thanh toan: Vi ZaloPay va Tien mat (COD).
  - Khong hien thi chu sandbox tren giao dien nguoi dung, mang lai trai nghiem thuc te va chuyen nghiep.
  - Theo doi tien do don hang 4 buoc: Cho duyet -> Dong goi -> Dang giao -> Hoan tat.
  - Huy don hang thong minh: Hien cua so popup xac nhan huy don, tu dong hoan tra 100% so luong ton kho ve SQL Server, tru bot doanh thu tren Dashboard; tu dong khoa huy khi don da chuyen sang Dang giao.
  - Cap nhat thong tin nhan hang: Form cap nhat dia chi voi nut xac nhan mau xanh noi bat va popup thong bao cap nhat thanh cong.
- Cua so Popup Gioi thieu: Tu dong hien thi banner gioi thieu ve Dak Song Quest moi khi nguoi dung truy cap ung dung.
- Thoi tiet Dak Song Thoi gian thuc: Tich hop du lieu khi tuong tram ve tinh toa do Dak Song (12.535, 107.692) qua Open-Meteo API.
- Cam nang Du lich va Dich vu: Tra cuu diem tham quan, luu tru, an uong, hotline dat ban va chi duong Google Maps mot cham.
- He thong Quan tri Admin CMS Web (Phan quyen 1 Server 2 Giao dien):
  - Dashboard thong ke chuyen biet theo vai tro dang nhap: Hop tac xa (OCOP Seller Center) va UBND Huyen (IOC Du lich & Dich vu).
  - Tai khoan Hop tac xa (htx_daksong / 123 - Role COOP): Toan quyen quan ly San TMDT OCOP, kho hang dac san, bang gia, xac nhan con hang, dong goi gui Viettel Post va huy don hang kem ghi chu ro rang.
  - Tai khoan UBND Huyen (huyen_daksong / 123 - Role DISTRICT): Quan ly co so quan an, nha nghi, cap phat han muc voucher du lich, quan ly BXH Quiz va giam sat kiem toan toan he thong.
  - Tien ich chuyen doi vai tro 1-click tuc thi khong can nhap lai mat khau.
  - Phan biet ro rang don hang bi huy: Khach tu huy don vs HTX / Admin huy don (ghi chu xin loi kem ly do chat luong hoac so luong).
  - Co che Realtime Polling tu dong lam moi so lieu moi 4 giay.

---

## 2. Ngan xep Cong nghe (Tech Stack)

| Phan he | Cong nghe su dung |
| :--- | :--- |
| Frontend Mini App | React 19, TypeScript, Vite 7, Tailwind CSS v4, Jotai, Lucide React, ZMP SDK |
| Backend API | Node.js (v20+), Express, TypeScript, mssql, msnodesqlv8 |
| Admin CMS Web | Single Page Application (HTML5, Tailwind CSS, Lucide Icons, Vanilla JS) |
| Co so du lieu | Microsoft SQL Server (SQLEXPRESS / LocalDB) |
| Khi tuong | Open-Meteo Satellite API |

---

## 3. Cau truc Thu muc

```text
dak-song-quest-fixed/
|-- app-config.json              # Cau hinh Zalo Mini App
|-- package.json                 # Cau hinh dependency Frontend
|-- vite.config.ts               # Cau hinh Vite bundler va Proxy
|-- MO_TA_HE_THONG.md            # Tai lieu mo ta he thong chi tiet (Kien truc va CSDL)
|-- README.md                    # Huong dan cai dat va van hanh he thong
|-- dist/                        # Goi build thanh pham san sang deploy len Zalo
|-- backend/                     # Ma nguon Backend Node.js va Admin CMS
|   |-- .env                     # Cau hinh cong PORT va chuoi ket noi SQL Server
|   |-- package.json             # Dependency backend (express, mssql...)
|   |-- tsconfig.json            # Cau hinh TypeScript Backend
|   |-- public/
|   |   `-- admin.html           # Giao dien Admin CMS Dashboard da phan quyen
|   `-- src/
|       |-- index.ts             # Entry point may chu Express
|       |-- config/
|       |   `-- db.ts            # Ket noi Microsoft SQL Server
|       `-- routes/
|           |-- admin.ts         # API Quan tri CMS, Xac thuc Dang nhap va Audit Logs
|           |-- orders.ts        # API Don hang, Thanh toan (ZaloPay, COD) va Tien do
|           |-- products.ts      # API Danh muc Nong san OCOP va Ton kho
|           |-- vouchers.ts      # API Quan ly Voucher va Vong quay may man
|           `-- leaderboard.ts   # API Bang xep hang Quiz tuan
`-- src/                         # Ma nguon Frontend Zalo Mini App
    |-- components/              # Cac UI Components (Layout, WeatherCard, LuckyWheelModal...)
    |-- data/                    # Du lieu tinh du phong (cau hoi, dia diem...)
    |-- pages/                   # Cac man hinh chinh (Home, Quiz, Store, MapPage, Vouchers...)
    |-- services/                # API Client config, Weather Service, ZMP SDK Adapter
    |-- state/                   # Quan ly State bang Jotai Atoms va LocalStorage
    `-- types/                   # Dinh nghia Interface va TypeScript Types
```

---

## 4. Huong dan Khoi chay Moi truong Local

### 4.1. Chuan bi Co so du lieu Microsoft SQL Server
1. Cai dat SQL Server Express (.\SQLEXPRESS) va ODBC Driver 18 for SQL Server.
2. Mo SQL Server Management Studio (SSMS) va tao database:
   ```sql
   CREATE DATABASE DakSongQuestDB;
   ```
3. Kiem tra file cau hinh ket noi tai backend/.env:
   ```env
   PORT=5000
   DB_SERVER=.\SQLEXPRESS
   DB_DATABASE=DakSongQuestDB
   DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
   ```
   (He thong se tu dong khoi tao toan bo cac bang CSDL gom AdminUsers, Venues, Products, Orders, OrderItems, UserVouchers, QuizLeaderboard, AdminAuditLogs va nap du lieu mau khi backend chay lan dau).

---

### 4.2. Khoi chay Backend Server va Admin CMS
Mo Terminal tai thu muc backend:
```bash
cd backend
npm install
npm run build
node dist/index.js
```
- May chu Backend API chay tai: http://localhost:5000
- Trang Quan tri Admin CMS truy cap tai: http://localhost:5000/admin.html

Thong tin tai khoan quan tri he thong:
- Hop tac xa Nong san Dak Song (Quan tri San OCOP): Tai khoan: htx_daksong / Mat khau: 123
- UBND va Ban Quan ly Huyen (Quan tri Du lich & Voucher): Tai khoan: huyen_daksong / Mat khau: 123

---

### 4.3. Khoi chay Frontend Zalo Mini App
Mo cua so Terminal moi tai thu muc goc:
```bash
npm install
npm run dev
```
- Mo trinh duyet tai: http://localhost:5173 de trai nghiem giao dien nguoi dung.

---

## 5. Dong goi va Trien khai len Zalo Mini App That

### Buoc 1: Dang nhap tai khoan Zalo Developer
```bash
zmp login
```
- Quet ma QR hien thi trong terminal bang ung dung Zalo tren dien thoai de xac thuc.

### Buoc 2: Deploy len may chu Zalo
```bash
npm run deploy
```
- Chon trang thai phien ban: Testing.
- Nhap mo ta phien ban (Vi du: Ban nghiem thu he thong).
- Sau khi tai len thanh cong, mo Zalo Mini App Console (https://mini.zalo.me) de lay ma QR kiem thu tren dien thoai that.

---

## 6. Tai lieu Ky thuat Chi tiet
De xem toan bo so do kien truc he thong (Mermaid Diagram), thiet ke co so du lieu chi tiet (ERD), mo ta chi tiet tung API Endpoint va cac quy trinh nghiep vu sau, vui long tham khao file:
- MO_TA_HE_THONG.md
