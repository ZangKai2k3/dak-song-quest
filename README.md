# DAK SONG QUEST - ZALO MINI APP VA HE THONG QUAN TRI ADMIN CMS

---

## 1. GIOI THIEU DU AN

### 1.1. Ten du an va Muc tieu
- Ten du an: Dak Song Quest.
- Muc tieu tong quat: Xay dung nen tang so hoa du lich ket hop tro choi hoa (Gamification) va thuong mai dien tu nong san OCOP nham quang ba hinh anh van hoa, con nguoi, danh lam thang canh huyen Dak Song, tinh Dak Nong; dong thoi ho tro tieu thu dac san nong nghiep dia phuong va thuc day du khach su dung dich vu luu tru, am thuc tai dia ban.

### 1.2. Doi tuong phuc vu
1. Du khach va Nguoi dan dia phuong: Trai nghiem tro choi do vui van hoa, san voucher giam gia thuc te, mua dac san OCOP chinh goc va tra cuu thong tin du lich tren thiet bi di dong thong qua ung dung Zalo.
2. Hop tac xa Nong san Dak Song: Don vi kinh doanh va dieu phoi san pham OCOP, quan tri kho hang, thiet lap bang gia va xu ly quy trinh giao van don hang tren Cong thong tin Quan tri Admin CMS Web.
3. UBND va Ban Quan ly Huyen Dak Song: Co quan quan ly nha nuoc giam sat hoat dong du lich, cap phat han muc voucher uu dai cho cac co so kinh doanh, giam sat tinh minh bach cua bang xep hang va kiem toan toan bo thao tac he thong.
4. Co so kinh doanh am thuc va luu tru: Cac nha hang, quan an, khach san tren dia ban tiep nhan va xac thuc voucher giam gia do du khach mang den su dung.

### 1.3. Diem noi bat thuc te cua he thong
- Kien truc 1 Server 2 Giao dien: Mot may chu backend Node.js Express va co so du lieu Microsoft SQL Server duy nhat nhung tu dong bien hoa giao dien quan tri theo vai tro: giao dien Hop tac xa (chuyen ve nong san OCOP) va giao dien UBND Huyen (chuyen ve du lich va voucher).
- Tro choi do vui xao tron chong hoc thuoc: Ap dung thuat toan Fisher-Yates de xao tron ngau nhien thu tu cau hoi va dap an; tu dong sinh ma nhan dien Tag ID #1000-#9999 de phan biet cac thi sinh trung ten tren bang xep hang.
- Vong quay may man lien ket han muc thuc: Tu dong truy van co so du lieu va loai bo cac co so da het han muc phat hanh, dam bao khong phat voucher ao vuot qua cam ket cua cac quan.
- Quy trinh thuong mai OCOP dong bo: Ho tro thanh toan tien mat (COD) va Vi ZaloPay (mo phong in-app khong chu sandbox), theo doi 4 buoc tien do ro rang, tu dong khoa huy don khi buu kien dang van chuyen va co che hoan tra 100% ton kho ve CSDL khi don bi huy boi khach hang hoac HTX.
- Hop thoai popup thong minh: Chi hien thi hop thoai gioi thieu ung dung dung 1 lan moi phien truy cap (session), khong gay phien phuc khi nguoi dung chuyen qua lai giua cac man hinh.

---

## 2. TRANG THAI TRIEN KHAI HIEN TAI

Bang danh gia chi tiet trang thai cac phan he chuc nang dua tren ma nguon thuc te:

| Phan he hoac Tinh nang | Trang thai trien khai | Ghi chu thuc te dua tren ma nguon |
| :--- | :--- | :--- |
| Giao dien Zalo Mini App di dong | Hoan thien va hoat dong | Trien khai bang React 19, TypeScript, Tailwind CSS v4; giao dien responsive day du tren man hinh di dong |
| Popup gioi thieu ung dung phien dau | Hoan thien va hoat dong | Su dung sessionStorage dak_song_intro_shown de chi hien thi 1 lan moi phien, khong lap lai khi bam ve Trang chu |
| The thoi tiet ve tinh thoi gian thuc | Hoan thien va hoat dong | Lay du lieu tu Open-Meteo API theo toa do Dak Song (12.535, 107.692), co co che fallback khi mat ket noi mang |
| Tro choi do vui: Thi thu | Hoan thien va hoat dong | Cho phep loc 5 nhom chu de, xao tron cau hoi, hien thi loi giai thich va cap voucher theo ty le diem (toi da 3 voucher/ngay) |
| Tro choi do vui: Thi chinh thuc | Hoan thien va hoat dong | Bo de 25 cau Tong hop, do thoi gian lam bai bang mili-giay, nop ket qua vao bang xep hang tuan tren SQL Server |
| Bang xep hang tuan va Tag ID | Hoan thien va hoat dong | Sap xep uu tien Score giam dan -> TimeMs tang dan; sinh Tag ID #1000-#9999 chong trung ten; luu ket qua tot nhat cua thi sinh |
| Vong quay may man | Hoan thien va hoat dong | Loc quan con han muc thuc te tu CSDL; cap nhat IssuedCount qua Transaction an toan; sinh ma DS-YYYYMMDD-XXXX |
| He thong nhiem vu hang ngay | Hoan thien va hoat dong | Tich luy luot quay may man khi tra loi dung; tu dong lam moi trang thai vao 00:00 UTC+7 |
| San nong san OCOP va Ton kho | Hoan thien va hoat dong | Lay du lieu va ton kho truc tiep tu bang Products tren SQL Server; khoa bi quan chong ban vuot ton kho |
| Thanh toan don hang OCOP | Mo phong / Cung cap COD | Ho tro COD tien mat; phuong thuc Vi ZaloPay su dung modal mo phong xac nhan in-app (chua tich hop merchant gateway that) |
| Theo doi va Cap nhat don hang | Hoan thien va hoat dong | Tien do 4 buoc ro rang; cho phep sua dia chi/so dien thoai khi don o buoc Cho duyet; nut xac nhan mau xanh ro rang |
| Quy trinh huy don hoan kho 100% | Hoan thien va hoat dong | Tu dong cong tra 100% ton kho ve CSDL; tu dong khoa huy khi don da chuyen sang Shipping; ghi chu ro nguon huy USER vs HTX |
| Quan tri Admin CMS da phan quyen | Hoan thien va hoat dong | 1 Server 2 Giao dien rieng biet cho COOP va DISTRICT; an cac tab khong thuoc tham quyen; chan 403 o tang backend |
| Nhat ky kiem toan (Audit Logs) | Hoan thien va hoat dong | Ghi nhan toan bo hanh vi thay doi han muc, gia ca, ton kho, huy don va xoa BXH vao bang AdminAuditLogs |
| Ngan hang cau hoi trac nghiem | Du lieu cuc bo tinh | 25 cau hoi hien luu trong file src/data/questions.ts chu chua quan tri dong qua bang CSDL |

---

## 3. CONG NGHE SU DUNG

### 3.1. Frontend Mini App
- Ngon ngu va Framework: TypeScript, React 19.0.0.
- Bundler va Tooling: Vite 7.3.0.
- Styling: Tailwind CSS 4.0.0.
- State Management: Jotai 2.12.1 (Atomic State ket hop atomWithStorage luu LocalStorage).
- Icons: Lucide React 1.16.0.
- Zalo Integration: ZMP SDK (zmp-sdk 2.53.0).

### 3.2. Backend va May chu API
- Runtime: Node.js (v20+).
- Framework: Express 4.21.2 (TypeScript).
- Database Driver: mssql 11.0.1 ket hop msnodesqlv8 4.2.3 (ho tro ket noi Windows Authentication).
- Bao mat va Tien ich: cors 2.8.5, dotenv 16.4.7.

### 3.3. Co so du lieu
- He quan tri CSDL: Microsoft SQL Server (SQLEXPRESS / LocalDB / SQL Server 2019/2022).
- Ten co so du lieu: DakSongQuestDB.
- To chuc du lieu: 8 bang quan he (AdminUsers, Venues, UserVouchers, Products, Orders, OrderItems, QuizLeaderboard, AdminAuditLogs).

### 3.4. Dich vu ben ngoai
- Open-Meteo Satellite API: Lay thong so khi tuong ve tinh thoi gian thuc tai toa do Dak Song (12.535, 107.692).

---

## 4. YEU CAU MOI TRUONG

Truoc khi cai dat va van hanh he thong, may tinh can dap ung cac yeu cau ky thuat:
- He dieu hanh: Windows 10 / Windows 11 (khuyen nghi) hoac Linux / macOS (can cau hinh tai khoan SQL Server xac thuc SQL thay vi Windows Authentication).
- Node.js: Phien ban 20.x tro len (kiem tra bang lenh: node -v).
- npm: Phien ban 10.x tro len (kiem tra bang lenh: npm -v).
- Microsoft SQL Server: Phien ban 2019, 2022 hoac ban Express (.\SQLEXPRESS) dang chay service.
- ODBC Driver: ODBC Driver 18 for SQL Server (hoac ODBC Driver 17 for SQL Server).
- Trinh duyet web: Google Chrome, Microsoft Edge hoac Mozilla Firefox phien ban moi nhat.
- Cong cu Zalo Mini App (tuy chon khi muon deploy len moi truong that): Zalo CLI (zmp-cli).

---

## 5. HUONG DAN CAI DAT VA CHAY DU AN

### 5.1. Buoc 1: Mo thu muc ma nguon
Mo terminal (PowerShell hoac Command Prompt) tai thu muc chua du an:
```bash
cd d:\test\dak-song-quest-fixed
```

---

### 5.2. Buoc 2: Cau hinh va Khoi chay Backend Server

1. Di chuyen vao thu muc backend va cai dat thu vien:
   ```bash
   cd backend
   npm install
   ```

2. Kiem tra va cau hinh bien moi truong trong file backend/.env:
   ```env
   PORT=5000
   DB_SERVER=.\SQLEXPRESS
   DB_DATABASE=DakSongQuestDB
   DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
   ```
   Luu y: Neu su dung ten SQL Server khac (vi du: localhost hoac ten may ca nhan), hay thay doi gia tri DB_SERVER tuong ung.

3. Tao co so du lieu tren SQL Server:
   - Mo SQL Server Management Studio (SSMS) hoac Azure Data Studio.
   - Thuc thi lenh tao co so du lieu:
     ```sql
     CREATE DATABASE DakSongQuestDB;
     ```
   - Luu y: Ban khong can phai chay script tao bang thu cong. Khi backend khoi chay lan dau, ma nguon trong backend/src/config/db.ts se tu dong khoi tao toan bo 8 bang CSDL va nap san du lieu mau ban dau (tai khoan quan tri, san pham OCOP mau, quan an mau).

4. Bien dich TypeScript va chay may chu Backend:
   ```bash
   npm run build
   node dist/index.js
   ```
   Khi khoi dong thanh cong, terminal se hien thi:
   - May chu API dang lang nghe tai cong: http://localhost:5000
   - Ket noi co so du lieu Microsoft SQL Server thanh cong.

5. Thong tin truy cap Cong Quan tri Admin CMS Web:
   - Dia chi truy cap: http://localhost:5000/admin.html
   - Tai khoan Hop tac xa Nong san Dak Song (Role COOP): htx_daksong / Mat khau: 123
   - Tai khoan UBND va Ban Quan ly Huyen (Role DISTRICT): huyen_daksong / Mat khau: 123

---

### 5.3. Buoc 3: Cai dat va Khoi chay Frontend Zalo Mini App

1. Mo mot cua so Terminal moi va di chuyen ve thu muc goc cua du an:
   ```bash
   cd d:\test\dak-song-quest-fixed
   ```

2. Cai dat cac thu vien phu thuoc:
   ```bash
   npm install
   ```

3. Khoi chay may chu phat trien Vite:
   ```bash
   npm run dev
   ```
   May chu Vite se khoi dong tai dia chi: http://localhost:5173

4. Trai nghiem ung dung tren trinh duyet:
   - Mo trinh duyet va truy cap: http://localhost:5173
   - Giao dien ung dung se hien thi duoi khung dien thoai di dong hoac responsive toan man hinh.

---

### 5.4. Buoc 4: Trien khai len nen tang Zalo Mini App that (Tuy chon)

1. Dang nhap tai khoan lap trinh vien Zalo qua Zalo CLI:
   ```bash
   zmp login
   ```
   Quet ma QR hien thi tren man hinh terminal bang ung dung Zalo tren dien thoai.

2. Dong goi va tai phien ban kiem thu len may chu Zalo:
   ```bash
   npm run deploy
   ```
   Nhap mo ta phien ban (vi du: Phien ban nghiem thu du an) va chon trang thai Testing.

3. Quet ma QR phien ban tren Zalo Mini App Developer Console (https://mini.zalo.me) de kiem thu truc tiep trong ung dung Zalo tren dien thoai that.

---

## 6. CAU TRUC THU MUC DU AN

```text
dak-song-quest-fixed/
|-- app-config.json              Tep cau hinh thong tin Zalo Mini App
|-- package.json                 Khai bao thu vien phia Frontend
|-- vite.config.ts               Cau hinh bundler Vite, Port 5173 va Dev Proxy den Backend
|-- MO_TA_HE_THONG.md            Tai lieu dac ta kien truc, nghiep vu va mo hinh du lieu chi tiet
|-- README.md                    Tai lieu huong dan tong quan, cai dat va van hanh he thong
|-- dist/                        Thu muc ma nguon sau khi build san sang deploy Zalo
|-- backend/                     Thu muc Backend Node.js Express va Admin CMS
|   |-- .env                     Bien moi truong: PORT va chuoi ket noi SQL Server
|   |-- package.json             Khai bao thu vien backend (express, mssql, cors...)
|   |-- tsconfig.json            Cau hinh bien dich TypeScript backend
|   |-- public/
|   |   `-- admin.html           Trang Quan tri Admin CMS Web da phan quyen RBAC
|   `-- src/
|       |-- index.ts             Entry point may chu Express va dang ky routes
|       |-- config/
|       |   `-- db.ts            Ket noi SQL Server, khoi tao bang va du lieu mau ban dau
|       `-- routes/
|           |-- admin.ts         API Dashboard stats, CRUD co so, phan quyen va Audit Logs
|           |-- leaderboard.ts   API Bang xep hang, nop diem va cap nhat ten thi sinh
|           |-- orders.ts        API Don hang, thanh toan, huy don hoan kho va doi dia chi
|           |-- products.ts      API Danh sach dac san OCOP va so luong ton kho
|           `-- vouchers.ts      API Han muc voucher, quay thuong va xac nhan tai quan
`-- src/                         Thu muc ma nguon Frontend Zalo Mini App
    |-- App.tsx                  Router ung dung va Layout chinh
    |-- main.tsx                 Entry point React DOM
    |-- components/              Cac thanh phan giao dien tai su dung
    |   |-- BottomNav.tsx        Thanh dieu huong duoi (Trang chu, Thi, Cua hang, Ban do, Voucher)
    |   |-- Header.tsx           Thanh tieu de ung dung va nut ho so ca nhan
    |   |-- LuckyWheelModal.tsx  Modal Vong quay may man kiem tra han muc co so
    |   |-- UserProfileModal.tsx Modal doi ten va chon 1 trong 5 avatar chibi Tay Nguyen
    |   `-- WeatherCard.tsx      The hien thi thoi tiet ve tinh thoi gian thuc
    |-- data/                    Du lieu tinh
    |   |-- questions.ts         Ngan hang 25 cau hoi trac nghiem van hoa, lich su Dak Song
    |   `-- venues.ts            Danh ba co so luu tru, am thuc va hotline lien he
    |-- pages/                   Cac man hinh nghiep vu chinh
    |   |-- Home.tsx             Trang chu: Popup gioi thieu, thoi tiet, vong quay, danh ba quan
    |   |-- Quiz.tsx             Trang thi quiz: Che do thi chinh thuc va Che do luyen tap
    |   |-- Leaderboard.tsx      Trang bang xep hang tuan, the hien Tag ID va thoi gian ms
    |   |-- Store.tsx            Trang cua hang OCOP: Gio hang, thanh toan, theo doi va huy don
    |   |-- Vouchers.tsx         Trang vi voucher nguoi dung va ma QR doi uu dai tai quan
    |   `-- MapPage.tsx          Trang cam nang du lich, danh lam thang canh va ban do
    |-- services/                Giao tiep dich vu ben ngoai
    |   |-- api.ts               Client Axios/Fetch ket noi den Backend API
    |   |-- weather.ts           Service lay thong tin thoi tiet ve tinh tu Open-Meteo
    |   `-- zalo.ts              Service giao tiep voi ZMP SDK
    |-- state/                   Quan ly trang thai
    |   `-- store.ts             Jotai atoms luu giu gio hang, voucher, diem so, luot quay
    |-- types/                   Dinh nghia kieu du lieu TypeScript toan he thong
    `-- utils/                   Cac ham tien ich
        `-- quiz.ts              Thuat toan Fisher-Yates, tinh tuan ISO, tinh Tag ID nguoi choi
```

---

## 7. HUONG DAN SU DUNG CHO NGUOI DUNG CUOI

### 7.1. Man hinh chinh (Trang Chu) va Hop thoai Popup Gioi thieu
- Khi nguoi dung mo ung dung trong mot phien moi, hop thoai popup Chao mung den voi Dak Song Quest se tu dong xuat hien de gioi thieu 3 tien ich cot loi: San voucher uu dai, Kham pha do vui van hoa va Mua nong san OCOP.
- Nguoi dung nhan nut Vao ung dung de dong popup va bat dau su dung. Hop thoai nay se khong xuat hien lai khi nguoi dung nhan chuyen ve Trang chu tu cac man hinh khac trong cung phien truy cap.
- Tai Trang chu, nguoi dung co the xem the Thoi tiet thoi gian thuc tai Dak Song, nhan vao nut Vong quay may man de quay thuong, hoac cuon xuong danh ba de tim kiem cac nha hang, quan an, khach san. Moi quan an deu co nut Goi hotline de lien he truc tiep va nut Chi duong de mo ban do Google Maps.

### 7.2. Phan he Thi Do Vui (Quiz Game)
- Truy cap bang cach nhan tab Thi tren thanh BottomNav hoac bam nut Thi do vui tai Trang chu.
- Nguoi choi lua chon 1 trong 2 che do:
  1. Che do Thi thu / Luyen tap:
     - Nguoi choi co the chon mot chu de yeu thich (Dia ly, Lich su, Van hoa, Nong nghiep - OCOP) hoac Tat ca.
     - Khong gioi han thoi gian lam bai. Sau moi cau hoi, he thong se hien thi ngay loi giai thich chi tiet de nguoi choi bo sung kien thuc.
     - Neu hoan thanh dat tu 70% tro len va chua nhan du 3 voucher trong ngay, nguoi choi se duoc thuong ngay 1 voucher giam gia vao Vi voucher.
  2. Che do Thi chinh thuc:
     - Bo de co dinh 25 cau hoi Tong hop, duoc xao tron ngau nhien thu tu cau va thu tu dap an A, B, C, D.
     - He thong tu dong dem thoi gian chinh xac bang mili-giay.
     - Sau khi nop bai, ket qua duoc gui len may chu de xep hang tuan thoi gian thuc. Thi sinh co the thi lai nhieu lan, he thong se tu dong ghi nhan ket qua tot nhat cua ban.
- Thiet lap Ho so nguoi choi:
  - Nhan vao bieu tuong avatar hoac nut Ho so tai goc tren man hinh.
  - Nguoi choi co the nhap Ten hien thi moi va lua chon 1 trong 5 avatar chibi dac trung van hoa Tay Nguyen.

### 7.3. Vong quay May man va Nhiem vu hang ngay
- Nhan nut Vong quay may man tai Trang chu de mo giao dien banh xe quay.
- Neu con luot quay (luckySpins > 0), nhan nut Quay ngay. Banh xe se quay ngau nhien va dung o o co so con han muc phat voucher tren CSDL.
- Khi trung thuong, hop thoai chuc mung xuat hien va voucher se duoc luu ngay vao Vi voucher cua ban voi ma duy nhat dang DS-YYYYMMDD-XXXX.
- Nhan them luot quay qua Nhiem vu hang ngay:
  - Kiem tra danh sach nhiem vu ngay trong hop thoai: Tra loi 3 cau hoi, Hoan thanh 1 bai thi, Tra loi dung chu de yeu cau.
  - Khi hoan thanh moi nhiem vu, he thong se tu dong cong them 1 luot quay may man.

### 7.4. Vi Voucher ca nhan va Cach su dung tai quan
- Truy cap tab Voucher tren thanh BottomNav de quan ly toan bo voucher ban dang so huu.
- Voucher duoc phan loai thanh 2 muc: Chua su dung va Da su dung.
- Cach su dung voucher giam gia:
  1. Den truc tiep nha hang, quan an hoac khach san co ten tren voucher.
  2. Mo the voucher va nhan nut Su dung tai quan de hien thi ma code va ma QR.
  3. Xuat trinh ma cho nhan vien thu ngan de duoc tru truc tiep vao hoa don thanh toan.
  4. Nhan Xac nhan da su dung de danh dau voucher da hoan tat.

### 7.5. San Nong san OCOP va Quan ly Don hang
- Truy cap tab Cua hang tren thanh BottomNav.
- Chon dac san OCOP (Tieu den huu co, Ca phe Robusta, Hat Mac ca...) va nhan Them vao gio.
- Vao Gio hang, nhap day du thong tin: Ho ten, So dien thoai, Dia chi giao hang.
- Chon phuong thuc thanh toan:
  - Vi ZaloPay: He thong mo hop thoai xac nhan thanh toan Vi ZaloPay chuyen nghiep khong chu sandbox. Nhan Xac nhan de hoan tat.
  - Tien mat khi nhan hang (COD): Thanh toan tien mat truc tiep cho shipper khi nhan hang.
- Theo doi tien do don hang: Vao tab Don hang cua toi trong Cua hang de theo doi 4 buoc tien do: Cho duyet -> Dong goi -> Dang giao -> Hoan tat.
- Chinh sua thong tin nhan hang: Khi don dang o buoc Cho duyet, co the bam Sua thong tin de cap nhat lai dia chi hoac so dien thoai. Form co nut xac nhan mau xanh ro rang va popup thong bao khi sua thanh cong.
- Huy don hoan kho: Khi don dang o buoc Cho duyet hoac Dong goi, nguoi dung co the bam nut Huy don hang. Hop thoai popup xac nhan se hien thi. Khi xac nhan huy, he thong se tu dong hoan tra 100% so luong san pham ve kho tren co so du lieu. Khi don hang da chuyen sang Dang giao (Shipping), nut huy se tu dong duoc khoa de bao ve tien do van chuyen.

### 7.6. Bang xep hang tuan
- Nhan nut Xem BXH tu man hinh tong ket quiz hoac the thong ke de vao trang Bang xep hang.
- Nguoi choi co the chon tuan thi dau de xem lai lich su. Top 1, Top 2, Top 3 duoc trao huy chuong vang, bac, dong.
- Thi sinh duoc hien thi ro rang kem Tag ID #1000-#9999 de tranh nham lan voi cac thi sinh khac co cung ten.
- Top 5 thi sinh co diem cao nhat va thoi gian lam bai nhanh nhat vao 23:59 Chu Nhat hang tuan se duoc trao voucher dac biet giam gia 30%.

### 7.7. Cong thong tin Quan tri Admin CMS Web
- Truy cap tai trinh duyet may tinh: http://localhost:5000/admin.html
- Dang nhap theo vai tro:
  1. Vai tro Hop tac xa Nong san (htx_daksong / 123):
     - Giao dien thuong hieu mau xanh ngoc / Emerald.
     - Dashboard OCOP: Xem doanh thu san, don cho duyet, don dang dong goi va van chuyen, tong quan kho hang.
     - Tab Don hang: Nhan nut Xac nhan con hang (chuyen sang Dong goi), nut Giao Viettel Post (chuyen sang Dang giao), nut Giao thanh cong (Hoan tat) hoac nut Huy don do pham cap/so luong nong san chua dat (kem ghi chu xin loi va hoan 100% ton kho).
     - Tab Kho hang: Dieu chinh gia niem yet va cap nhat them so luong ton kho cho tung dac san OCOP.
     - An hoan toan cac tab thuoc tham quyen quan ly nha nuoc cua Huyen.
  2. Vai tro UBND va Ban Quan ly Huyen (huyen_daksong / 123):
     - Giao dien thuong hieu mau Slate va Vang Amber.
     - Dashboard IOC Du lich: Xem so luong co so hop tac, so voucher da dung tai quan, luot thi sinh tham gia quiz va tong luot kiem toan he thong. Bang kiem toan gan day chi hien thi thao tac ve voucher va BXH.
     - Tab Quan & Han muc: Them co so am thuc/luu tru moi, cap them so luong voucher, sua han muc toi da hoac xoa co so khoi he thong.
     - Tab BXH Quiz: Giam sat danh sach thi sinh, xoa ket qua thi gian lan hoac reset ve 0 de yeu cau thi lai.
     - Tab Lich su kiem toan: Theo doi va tra cuu toan bo nhat ky hanh vi tren he thong (chi loc va xem the BXH va Voucher).
     - An hoan toan cac tab ve don hang va kho hang OCOP.
  3. Nut Chuyen doi vai tro 1-Click: Tren thanh header luon co nut chuyen nhanh giua Hop tac xa va Huyen giup can bo kiem tra giao dien tuc thi ma khong can dang xuat.

---

## 8. KIEM TRA VA XAC MINH HE THONG

Cac kich ban kiem thu quan trong de kiem tra hoat dong thuc te cua he thong:

1. Kiem thu Luong Do vui va Tinh diem:
   - Chon che do Thi chinh thuc, tra loi het 25 cau hoi.
   - Kiem tra bo dem thoi gian mili-giay dung lai khi hoan thanh.
   - Mo trang Bang xep hang kiem tra ten va Tag ID da xuat hien dung vi tri voi diem so va thoi gian thuc.
2. Kiem thu Vong quay may man va Han muc CSDL:
   - Mo Admin CMS voi tai khoan Huyen (huyen_daksong), vao tab Quan & Han muc va ha TotalLimit cua mot quan ve bang voi IssuedCount.
   - Quay lai Mini App tren dien thoai, mo Vong quay may man va kiem tra xem quan do da duoc tu dong loai bo khoi danh sach o quay chua.
3. Kiem thu Don hang OCOP va Hoan kho 100%:
   - Ghi nho so luong InStockQuantity cua san pham Tieu den huu co tren Store.
   - Dat mua 2 goi Tieu den huu co. Sau khi dat xong, kiem tra lai xem ton kho tren CSDL da tu dong giam di 2 chua.
   - Vao tab Don hang cua toi, bam nut Huy don hang va xac nhan trong popup.
   - Kiem tra lai xem ton kho cua san pham da duoc cong tra lai dung 2 don vi chua.
4. Kiem thu Phan quyen va Chuc nang chan loi 403 Forbidden:
   - Dang nhap tai khoan Hop tac xa (htx_daksong).
   - Su dung cong cu Postman hoac fetch tren Console trinh duyet gui request xoa ket qua thi: DELETE /api/admin/leaderboard/1.
   - Kiem tra xem backend co tra ve ma HTTP 403 Forbidden hay khong.

---

## 9. TAI LIEU LIEN QUAN

De tim hieu chuyen sau ve kien truc phan mem, mo hinh thuc the ERD, chi tiet ma nguon tung component, danh muc day du tat ca cac API endpoints va bang quy tac nghiep vu toan he thong, vui long tham khao tep:
- MO_TA_HE_THONG.md (Tai lieu mo ta he thong toan dien).

---

## 10. CAC LOI THUONG GAP VA CACH KHAC PHUC

| Hien tuong loi | Nguyen nhan tiem an | Cach xu ly cu the |
| :--- | :--- | :--- |
| Loi ECONNREFUSED khi backend ket noi den SQL Server | Dịch vu SQL Server (SQLEXPRESS) chua duoc bat hoac chua bat giao thuc TCP/IP | Mo SQL Server Configuration Manager, dam bao service SQL Server (SQLEXPRESS) dang o trang thai Running; bat TCP/IP trong phan SQL Server Network Configuration va khoi dong lai service |
| Loi Login failed for user khi ket noi CSDL | Thiet lap xac thuc SQL Server chua cho phep Windows Authentication hoac sai chuoi ket noi | Mo file backend/.env, kiem tra chuoi ket noi DB_CONNECTION_STRING; dam bao tham so Trusted_Connection=Yes va TrustServerCertificate=Yes duoc khai bao dung |
| May chu bao Port 5000 already in use | Cong 5000 dang bi mot phien chay truoc cua Node.js hoac ung dung khac chiem dung | Mo terminal go lenh tim tien trinh: netstat -ano \| findstr :5000; sau do huy tien trinh bang lenh: taskkill /PID <PID_NUMBER> /F roi khoi dong lai backend |
| May chu Vite bao Port 5173 in use | Cong 5173 dang duoc mo boi mot tien trinh dev khac | Vite se tu dong chuyen sang cong 5174; hoac ban co the dung taskkill de tat tien trinh cu va khoi dong lai |
| Loi ERESOLVE khi chay npm install | Xung dot phien ban phu thuoc giua cac package moi | Chay lenh cai dat kem tham so legacy: npm install --legacy-peer-deps |
| Trang admin.html hien thi trang trang hoac bao loi API | May chu backend chua duoc bien dich hoac chua chay lenh npm run build trong backend | Vao thu muc backend, chay npm run build de bien dich TypeScript sang dist/, sau do khoi dong bang node dist/index.js |
| Khong mo duoc ban do Google Maps tren mot so trinh duyet | Trinh duyet chan cua so popup moi (pop-up blocker) | Cho phep pop-up cho dia chi localhost:5173 trong cai dat quyen rieng tu cua trinh duyet |

Cac kich ban kiem thu quan trong de kiem tra hoat dong thuc te cua he thong:

1. Kiem thu Luong Do vui va Tinh diem:
   - Chon che do Thi chinh thuc, tra loi het 25 cau hoi.
   - Kiem tra bo dem thoi gian mili-giay dung lai khi hoan thanh.
   - Mo trang Bang xep hang kiem tra ten va Tag ID da xuat hien dung vi tri voi diem so va thoi gian thuc.
2. Kiem thu Vong quay may man va Han muc CSDL:
   - Mo Admin CMS voi tai khoan Huyen (huyen_daksong), vao tab Quan & Han muc va ha TotalLimit cua mot quan ve bang voi IssuedCount.
   - Quay lai Mini App tren dien thoai, mo Vong quay may man va kiem tra xem quan do da duoc tu dong loai bo khoi danh sach o quay chua.
3. Kiem thu Don hang OCOP va Hoan kho 100%:
   - Ghi nho so luong InStockQuantity cua san pham Tieu den huu co tren Store.
   - Dat mua 2 goi Tieu den huu co. Sau khi dat xong, kiem tra lai xem ton kho tren CSDL da tu dong giam di 2 chua.
   - Vao tab Don hang cua toi, bam nut Huy don hang va xac nhan trong popup.
   - Kiem tra lai xem ton kho cua san pham da duoc cong tra lai dung 2 don vi chua.
4. Kiem thu Phan quyen va Chuc nang chan loi 403 Forbidden:
   - Dang nhap tai khoan Hop tac xa (htx_daksong).
   - Su dung cong cu Postman hoac fetch tren Console trinh duyet gui request xoa ket qua thi: DELETE /api/admin/leaderboard/1.
   - Kiem tra xem backend co tra ve ma HTTP 403 Forbidden hay khong.

---

## 9. TAI LIEU LIEN QUAN

De tim hieu chuyen sau ve kien truc phan mem, mo hinh thuc the ERD, chi tiet ma nguon tung component, danh muc day du tat ca cac API endpoints va bang quy tac nghiep vu toan he thong, vui long tham khao tep:
- MO_TA_HE_THONG.md (Tai lieu mo ta he thong toan dien).

---

## 10. CAC LOI THUONG GAP VA CACH KHAC PHUC

| Hien tuong loi | Nguyen nhan tiem an | Cach xu ly cu the |
| :--- | :--- | :--- |
| Loi ECONNREFUSED khi backend ket noi den SQL Server | Dịch vu SQL Server (SQLEXPRESS) chua duoc bat hoac chua bat giao thuc TCP/IP | Mo SQL Server Configuration Manager, dam bao service SQL Server (SQLEXPRESS) dang o trang thai Running; bat TCP/IP trong phan SQL Server Network Configuration va khoi dong lai service |
| Loi Login failed for user khi ket noi CSDL | Thiet lap xac thuc SQL Server chua cho phep Windows Authentication hoac sai chuoi ket noi | Mo file backend/.env, kiem tra chuoi ket noi DB_CONNECTION_STRING; dam bao tham so Trusted_Connection=Yes va TrustServerCertificate=Yes duoc khai bao dung |
| May chu bao Port 5000 already in use | Cong 5000 dang bi mot phien chay truoc cua Node.js hoac ung dung khac chiem dung | Mo terminal go lenh tim tien trinh: netstat -ano \| findstr :5000; sau do huy tien trinh bang lenh: taskkill /PID <PID_NUMBER> /F roi khoi dong lai backend |
| May chu Vite bao Port 5173 in use | Cong 5173 dang duoc mo boi mot tien trinh dev khac | Vite se tu dong chuyen sang cong 5174; hoac ban co the dung taskkill de tat tien trinh cu va khoi dong lai |
| Loi ERESOLVE khi chay npm install | Xung dot phien ban phu thuoc giua cac package moi | Chay lenh cai dat kem tham so legacy: npm install --legacy-peer-deps |
| Trang admin.html hien thi trang trang hoac bao loi API | May chu backend chua duoc bien dich hoac chua chay lenh npm run build trong backend | Vao thu muc backend, chay npm run build de bien dich TypeScript sang dist/, sau do khoi dong bang node dist/index.js |
| Khong mo duoc ban do Google Maps tren mot so trinh duyet | Trinh duyet chan cua so popup moi (pop-up blocker) | Cho phep pop-up cho dia chi localhost:5173 trong cai dat quyen rieng tu cua trinh duyet |

