# ĐẮK SONG QUEST - ZALO MINI APP VÀ HỆ THỐNG QUẢN TRỊ ADMIN CMS

---

## 1. GIỚI THIỆU DỰ ÁN

### 1.1. Tên dự án và Mục tiêu
- Tên dự án: Đắk Song Quest.
- Mục tiêu tổng quát: Xây dựng nền tảng số hóa du lịch kết hợp trò chơi hóa (Gamification) và thương mại điện tử nông sản OCOP nhằm quảng bá hình ảnh văn hóa, con người, danh lam thắng cảnh huyện Đắk Song, tỉnh Đắk Nông; đồng thời hỗ trợ tiêu thụ đặc sản nông nghiệp địa phương và thúc đẩy du khách sử dụng dịch vụ lưu trú, ẩm thực tại địa bàn.

### 1.2. Đối tượng phục vụ
1. Du khách và Người dân địa phương: Trải nghiệm trò chơi đố vui văn hóa, săn voucher giảm giá thực tế, mua đặc sản OCOP chính gốc và tra cứu thông tin du lịch trên thiết bị di động thông qua ứng dụng Zalo.
2. Hợp tác xã Nông sản Đắk Song: Đơn vị kinh doanh và điều phối sản phẩm OCOP, quản trị kho hàng, thiết lập bảng giá và xử lý quy trình giao vận đơn hàng trên Cổng thông tin Quản trị Admin CMS Web.
3. UBND và Ban Quản lý Huyện Đắk Song: Cơ quan quản lý nhà nước giám sát hoạt động du lịch, cấp phát hạn mức voucher ưu đãi cho các cơ sở kinh doanh, giám sát tính minh bạch của bảng xếp hạng và kiểm toán toàn bộ thao tác hệ thống.
4. Cơ sở kinh doanh ẩm thực và lưu trú: Các nhà hàng, quán ăn, khách sạn trên địa bàn tiếp nhận và xác thực voucher giảm giá do du khách mang đến sử dụng.

### 1.3. Điểm nổi bật thực tế của hệ thống
- Kiến trúc 1 Server 2 Giao diện: Một máy chủ backend Node.js Express và cơ sở dữ liệu Microsoft SQL Server duy nhất nhưng tự động biến hóa giao diện quản trị theo vai trò: giao diện Hợp tác xã (chuyên về nông sản OCOP) và giao diện UBND Huyện (chuyên về du lịch và voucher).
- Trò chơi đố vui xáo trộn chống học thuộc: Áp dụng thuật toán Fisher-Yates để xáo trộn ngẫu nhiên thứ tự câu hỏi và đáp án; tự động sinh mã nhận diện Tag ID #1000-#9999 để phân biệt các thí sinh trùng tên trên bảng xếp hạng.
- Vòng quay may mắn liên kết hạn mức thực: Tự động truy vấn cơ sở dữ liệu và loại bỏ các cơ sở đã hết hạn mức phát hành, đảm bảo không phát voucher ảo vượt quá cam kết của các quán.
- Quy trình thương mại OCOP đồng bộ: Hỗ trợ thanh toán tiền mặt (COD) và Ví ZaloPay (mô phỏng in-app không chữ sandbox), theo dõi 4 bước tiến độ rõ ràng, tự động khóa hủy đơn khi bưu kiện đang vận chuyển và cơ chế hoàn trả 100% tồn kho về CSDL khi đơn bị hủy bởi khách hàng hoặc HTX.
- Hộp thoại popup thông minh: Chỉ hiển thị hộp thoại giới thiệu ứng dụng đúng 1 lần mỗi phiên truy cập (session), không gây phiền phức khi người dùng chuyển qua lại giữa các màn hình.

---

## 2. TRẠNG THÁI TRIỂN KHAI HIỆN TẠI

Bảng đánh giá chi tiết trạng thái các phân hệ chức năng dựa trên mã nguồn thực tế:

| Phân hệ hoặc Tính năng | Trạng thái triển khai | Ghi chú thực tế dựa trên mã nguồn |
| :--- | :--- | :--- |
| Giao diện Zalo Mini App di động | Hoàn thiện và hoạt động | Triển khai bằng React 19, TypeScript, Tailwind CSS v4; giao diện responsive đầy đủ trên màn hình di động |
| Popup giới thiệu ứng dụng phiên đầu | Hoàn thiện và hoạt động | Sử dụng sessionStorage dak_song_intro_shown để chỉ hiển thị 1 lần mỗi phiên, không lặp lại khi bấm về Trang chủ |
| Thẻ thời tiết vệ tinh thời gian thực | Hoàn thiện và hoạt động | Lấy dữ liệu từ Open-Meteo API theo tọa độ Đắk Song (12.535, 107.692), có cơ chế fallback khi mất kết nối mạng |
| Trò chơi đố vui: Thi thử | Hoàn thiện và hoạt động | Cho phép lọc 5 nhóm chủ đề, xáo trộn câu hỏi, hiển thị lời giải thích và cấp voucher theo tỷ lệ điểm (tối đa 3 voucher/ngày) |
| Trò chơi đố vui: Thi chính thức | Hoàn thiện và hoạt động | Bộ đề 25 câu Tổng hợp, đo thời gian làm bài bằng mili-giây, nộp kết quả vào bảng xếp hạng tuần trên SQL Server |
| Bảng xếp hạng tuần và Tag ID | Hoàn thiện và hoạt động | Sắp xếp ưu tiên Score giảm dần -> TimeMs tăng dần; sinh Tag ID #1000-#9999 chống trùng tên; lưu kết quả tốt nhất của thí sinh |
| Vòng quay may mắn | Hoàn thiện và hoạt động | Lọc quán còn hạn mức thực tế từ CSDL; cập nhật IssuedCount qua Transaction an toàn; sinh mã DS-YYYYMMDD-XXXX |
| Hệ thống nhiệm vụ hàng ngày | Hoàn thiện và hoạt động | Tích lũy lượt quay may mắn khi trả lời đúng; tự động làm mới trạng thái vào 00:00 UTC+7 |
| Sàn nông sản OCOP và Tồn kho | Hoàn thiện và hoạt động | Lấy dữ liệu và tồn kho trực tiếp từ bảng Products trên SQL Server; khóa bi quan chống bán vượt tồn kho |
| Thanh toán đơn hàng OCOP | Mô phỏng / Cung cấp COD | Hỗ trợ COD tiền mặt; phương thức Ví ZaloPay sử dụng modal mô phỏng xác nhận in-app (chưa tích hợp merchant gateway thật) |
| Theo dõi và Cập nhật đơn hàng | Hoàn thiện và hoạt động | Tiến độ 4 bước rõ ràng; cho phép sửa địa chỉ/số điện thoại khi đơn ở bước Chờ duyệt; nút xác nhận màu xanh rõ ràng |
| Quy trình hủy đơn hoàn kho 100% | Hoàn thiện và hoạt động | Tự động cộng trả 100% tồn kho về CSDL; tự động khóa hủy khi đơn đã chuyển sang Shipping; ghi chú rõ nguồn hủy USER vs HTX |
| Quản trị Admin CMS đã phân quyền | Hoàn thiện và hoạt động | 1 Server 2 Giao diện riêng biệt cho COOP và DISTRICT; ẩn các tab không thuộc thẩm quyền; chặn 403 ở tầng backend |
| Nhật ký kiểm toán (Audit Logs) | Hoàn thiện và hoạt động | Ghi nhận toàn bộ hành vi thay đổi hạn mức, giá cả, tồn kho, hủy đơn và xóa BXH vào bảng AdminAuditLogs |
| Ngân hàng câu hỏi trắc nghiệm | Dữ liệu cục bộ tĩnh | 25 câu hỏi hiện lưu trong file src/data/questions.ts chứ chưa quản trị động qua bảng CSDL |

---

## 3. CÔNG NGHỆ SỬ DỤNG

### 3.1. Frontend Mini App
- Ngôn ngữ và Framework: TypeScript, React 19.0.0.
- Bundler và Tooling: Vite 7.3.0.
- Styling: Tailwind CSS 4.0.0.
- Quản lý trạng thái: Jotai 2.12.1 (Atomic State kết hợp atomWithStorage lưu LocalStorage).
- Biểu tượng vector: Lucide React 1.16.0.
- Tích hợp Zalo: ZMP SDK (zmp-sdk 2.53.0).

### 3.2. Backend và Máy chủ API
- Runtime: Node.js (v20+).
- Framework: Express 4.21.2 (TypeScript).
- Database Driver: mssql 11.0.1 kết hợp msnodesqlv8 4.2.3 (hỗ trợ kết nối Windows Authentication).
- Bảo mật và Tiện ích: cors 2.8.5, dotenv 16.4.7.

### 3.3. Cơ sở dữ liệu
- Hệ quản trị CSDL: Microsoft SQL Server (SQLEXPRESS / LocalDB / SQL Server 2019/2022).
- Tên cơ sở dữ liệu: DakSongQuestDB.
- Tổ chức dữ liệu: 8 bảng quan hệ (AdminUsers, Venues, UserVouchers, Products, Orders, OrderItems, QuizLeaderboard, AdminAuditLogs).

### 3.4. Dịch vụ bên ngoài
- Open-Meteo Satellite API: Lấy thông số khí tượng vệ tinh thời gian thực tại tọa độ Đắk Song (12.535, 107.692).

---

## 4. YÊU CẦU MÔI TRƯỜNG

Trước khi cài đặt và vận hành hệ thống, máy tính cần đáp ứng các yêu cầu kỹ thuật:
- Hệ điều hành: Windows 10 / Windows 11 (khuyến nghị) hoặc Linux / macOS (cần cấu hình tài khoản SQL Server xác thực SQL thay vì Windows Authentication).
- Node.js: Phiên bản 20.x trở lên (kiểm tra bằng lệnh: node -v).
- npm: Phiên bản 10.x trở lên (kiểm tra bằng lệnh: npm -v).
- Microsoft SQL Server: Phiên bản 2019, 2022 hoặc bản Express (.\SQLEXPRESS) đang chạy service.
- ODBC Driver: ODBC Driver 18 for SQL Server (hoặc ODBC Driver 17 for SQL Server).
- Trình duyệt web: Google Chrome, Microsoft Edge hoặc Mozilla Firefox phiên bản mới nhất.
- Công cụ Zalo Mini App (tùy chọn khi muốn deploy lên môi trường thật): Zalo CLI (zmp-cli).

---

## 5. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN

### 5.1. Bước 1: Mở thư mục mã nguồn
Mở terminal (PowerShell hoặc Command Prompt) tại thư mục chứa dự án:
```bash
cd d:\test\dak-song-quest-fixed
```

---

### 5.2. Bước 2: Cấu hình và Khởi chạy Backend Server

1. Di chuyển vào thư mục backend và cài đặt thư viện:
   ```bash
   cd backend
   npm install
   ```

2. Kiểm tra và cấu hình biến môi trường trong file backend/.env:
   ```env
   PORT=5000
   DB_SERVER=.\SQLEXPRESS
   DB_DATABASE=DakSongQuestDB
   DB_CONNECTION_STRING=Server=.\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes
   ```
   Lưu ý: Nếu sử dụng tên SQL Server khác (ví dụ: localhost hoặc tên máy cá nhân), hãy thay đổi giá trị DB_SERVER tương ứng.

3. Tạo cơ sở dữ liệu trên SQL Server:
   - Mở SQL Server Management Studio (SSMS) hoặc Azure Data Studio.
   - Thực thi lệnh tạo cơ sở dữ liệu:
     ```sql
     CREATE DATABASE DakSongQuestDB;
     ```
   - Lưu ý: Bạn không cần phải chạy script tạo bảng thủ công. Khi backend khởi chạy lần đầu, mã nguồn trong backend/src/config/db.ts sẽ tự động khởi tạo toàn bộ 8 bảng CSDL và nạp sẵn dữ liệu mẫu ban đầu (tài khoản quản trị, sản phẩm OCOP mẫu, quán ăn mẫu).

4. Biên dịch TypeScript và chạy máy chủ Backend:
   ```bash
   npm run build
   node dist/index.js
   ```
   Khi khởi động thành công, terminal sẽ thông báo:
   - Máy chủ API đang lắng nghe tại cổng: http://localhost:5000
   - Kết nối cơ sở dữ liệu Microsoft SQL Server thành công.

5. Thông tin truy cập Cổng Quản trị Admin CMS Web:
   - Địa chỉ truy cập: http://localhost:5000/admin.html
   - Tài khoản Hợp tác xã Nông sản Đắk Song (Role COOP): htx_daksong / Mật khẩu: 123
   - Tài khoản UBND và Ban Quản lý Huyện (Role DISTRICT): huyen_daksong / Mật khẩu: 123

---

### 5.3. Bước 3: Cài đặt và Khởi chạy Frontend Zalo Mini App

1. Mở một cửa sổ Terminal mới và di chuyển về thư mục gốc của dự án:
   ```bash
   cd d:\test\dak-song-quest-fixed
   ```

2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
   Máy chủ Vite sẽ khởi động tại địa chỉ: http://localhost:5173

4. Trải nghiệm ứng dụng trên trình duyệt:
   - Mở trình duyệt và truy cập: http://localhost:5173
   - Giao diện ứng dụng sẽ hiển thị dưới khung điện thoại di động hoặc responsive toàn màn hình.

---

### 5.4. Bước 4: Triển khai lên nền tảng Zalo Mini App thật (Tùy chọn)

1. Đăng nhập tài khoản lập trình viên Zalo qua Zalo CLI:
   ```bash
   zmp login
   ```
   Quét mã QR hiển thị trên màn hình terminal bằng ứng dụng Zalo trên điện thoại.

2. Đóng gói và tải phiên bản kiểm thử lên máy chủ Zalo:
   ```bash
   npm run deploy
   ```
   Nhập mô tả phiên bản (ví dụ: Phiên bản nghiệm thu dự án) và chọn trạng thái Testing.

3. Quét mã QR phiên bản trên Zalo Mini App Developer Console (https://mini.zalo.me) để kiểm thử trực tiếp trong ứng dụng Zalo trên điện thoại thật.

---

## 6. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
dak-song-quest-fixed/
|-- app-config.json              Tệp cấu hình thông tin Zalo Mini App
|-- package.json                 Khai báo thư viện phía Frontend
|-- vite.config.ts               Cấu hình bundler Vite, Port 5173 và Dev Proxy đến Backend
|-- MO_TA_HE_THONG.md            Tài liệu đặc tả kiến trúc, nghiệp vụ và mô hình dữ liệu chi tiết
|-- README.md                    Tài liệu hướng dẫn tổng quan, cài đặt và vận hành hệ thống
|-- dist/                        Thư mục mã nguồn sau khi build sẵn sàng deploy Zalo
|-- backend/                     Thư mục Backend Node.js Express và Admin CMS
|   |-- .env                     Biến môi trường: PORT và chuỗi kết nối SQL Server
|   |-- package.json             Khai báo thư viện backend (express, mssql, cors...)
|   |-- tsconfig.json            Cấu hình biên dịch TypeScript backend
|   |-- public/
|   |   `-- admin.html           Trang Quản trị Admin CMS Web đã phân quyền RBAC
|   `-- src/
|       |-- index.ts             Entry point máy chủ Express và đăng ký routes
|       |-- config/
|       |   `-- db.ts            Kết nối SQL Server, khởi tạo bảng và dữ liệu mẫu ban đầu
|       `-- routes/
|           |-- admin.ts         API Dashboard stats, CRUD cơ sở, phân quyền và Audit Logs
|           |-- leaderboard.ts   API Bảng xếp hạng, nộp điểm và cập nhật tên thí sinh
|           |-- orders.ts        API Đơn hàng, thanh toán, hủy đơn hoàn kho và đổi địa chỉ
|           |-- products.ts      API Danh sách đặc sản OCOP và số lượng tồn kho
|           `-- vouchers.ts      API Hạn mức voucher, quay thưởng và xác nhận tại quán
`-- src/                         Thư mục mã nguồn Frontend Zalo Mini App
    |-- App.tsx                  Router ứng dụng và Layout chính
    |-- main.tsx                 Entry point React DOM
    |-- components/              Các thành phần giao diện tái sử dụng
    |   |-- BottomNav.tsx        Thanh điều hướng dưới (Trang chủ, Thi, Cửa hàng, Bản đồ, Voucher)
    |   |-- Header.tsx           Thanh tiêu đề ứng dụng và nút hồ sơ cá nhân
    |   |-- LuckyWheelModal.tsx  Modal Vòng quay may mắn kiểm tra hạn mức cơ sở
    |   |-- UserProfileModal.tsx Modal đổi tên và chọn 1 trong 5 avatar chibi Tây Nguyên
    |   `-- WeatherCard.tsx      Thẻ hiển thị thời tiết vệ tinh thời gian thực
    |-- data/                    Dữ liệu tĩnh
    |   |-- questions.ts         Ngân hàng 25 câu hỏi trắc nghiệm văn hóa, lịch sử Đắk Song
    |   `-- venues.ts            Danh bạ cơ sở lưu trú, ẩm thực và hotline liên hệ
    |-- pages/                   Các màn hình nghiệp vụ chính
    |   |-- Home.tsx             Trang chủ: Popup giới thiệu, thời tiết, vòng quay, danh bạ quán
    |   |-- Quiz.tsx             Trang thi quiz: Chế độ thi chính thức và Chế độ luyện tập
    |   |-- Leaderboard.tsx      Trang bảng xếp hạng tuần, thể hiện Tag ID và thời gian ms
    |   |-- Store.tsx            Trang cửa hàng OCOP: Giỏ hàng, thanh toán, theo dõi và hủy đơn
    |   |-- Vouchers.tsx         Trang ví voucher người dùng và mã QR đổi ưu đãi tại quán
    |   `-- MapPage.tsx          Trang cẩm nang du lịch, danh lam thắng cảnh và bản đồ
    |-- services/                Giao tiếp dịch vụ bên ngoài
    |   |-- api.ts               Client Axios/Fetch kết nối đến Backend API
    |   |-- weather.ts           Service lấy thông tin thời tiết vệ tinh từ Open-Meteo
    |   `-- zalo.ts              Service giao tiếp với ZMP SDK
    |-- state/                   Quản lý trạng thái
    |   `-- store.ts             Jotai atoms lưu giữ giỏ hàng, voucher, điểm số, lượt quay
    |-- types/                   Định nghĩa kiểu dữ liệu TypeScript toàn hệ thống
    `-- utils/                   Các hàm tiện ích
        `-- quiz.ts              Thuật toán Fisher-Yates, tính tuần ISO, tính Tag ID người chơi
```

---

## 7. HƯỚNG DẪN SỬ DỤNG CHO NGƯỜI DÙNG CUỐI

### 7.1. Màn hình chính (Trang Chủ) và Hộp thoại Popup Giới thiệu
- Khi người dùng mở ứng dụng trong một phiên mới, hộp thoại popup Chào mừng đến với Đắk Song Quest sẽ tự động xuất hiện để giới thiệu 3 tiện ích cốt lõi: Săn voucher ưu đãi, Khám phá đố vui văn hóa và Mua nông sản OCOP.
- Người dùng nhấn nút Vào ứng dụng để đóng popup và bắt đầu sử dụng. Hộp thoại này sẽ không xuất hiện lại khi người dùng nhấn chuyển về Trang chủ từ các màn hình khác trong cùng phiên truy cập.
- Tại Trang chủ, người dùng có thể xem thẻ Thời tiết thời gian thực tại Đắk Song, nhấn vào nút Vòng quay may mắn để quay thưởng, hoặc cuộn xuống danh bạ để tìm kiếm các nhà hàng, quán ăn, khách sạn. Mỗi quán ăn đều có nút Gọi hotline để liên hệ trực tiếp và nút Chỉ đường để mở bản đồ Google Maps.

### 7.2. Phân hệ Thi Đố Vui (Quiz Game)
- Truy cập bằng cách nhấn tab Thi trên thanh BottomNav hoặc bấm nút Thi đố vui tại Trang chủ.
- Người chơi lựa chọn 1 trong 2 chế độ:
  1. Chế độ Thi thử / Luyện tập:
     - Người chơi có thể chọn một chủ đề yêu thích (Địa lý, Lịch sử, Văn hóa, Nông nghiệp - OCOP) hoặc Tất cả.
     - Không giới hạn thời gian làm bài. Sau mỗi câu hỏi, hệ thống sẽ hiển thị ngay lời giải thích chi tiết để người chơi bổ sung kiến thức.
     - Nếu hoàn thành đạt từ 70% trở lên và chưa nhận đủ 3 voucher trong ngày, người chơi sẽ được thưởng ngay 1 voucher giảm giá vào Ví voucher.
  2. Chế độ Thi chính thức:
     - Bộ đề cố định 25 câu hỏi Tổng hợp, được xáo trộn ngẫu nhiên thứ tự câu và thứ tự đáp án A, B, C, D.
     - Hệ thống tự động đếm thời gian chính xác bằng mili-giây.
     - Sau khi nộp bài, kết quả được gửi lên máy chủ để xếp hạng tuần thời gian thực. Thí sinh có thể thi lại nhiều lần, hệ thống sẽ tự động ghi nhận kết quả tốt nhất của bạn.
- Thiết lập Hồ sơ người chơi:
  - Nhấn vào biểu tượng avatar hoặc nút Hồ sơ tại góc trên màn hình.
  - Người chơi có thể nhập Tên hiển thị mới và lựa chọn 1 trong 5 avatar chibi đặc trưng văn hóa Tây Nguyên.

### 7.3. Vòng quay May mắn và Nhiệm vụ hàng ngày
- Nhấn nút Vòng quay may mắn tại Trang chủ để mở giao diện bánh xe quay.
- Nếu còn lượt quay (luckySpins > 0), nhấn nút Quay ngay. Bánh xe sẽ quay ngẫu nhiên và dừng ở ô cơ sở còn hạn mức phát voucher trên CSDL.
- Khi trúng thưởng, hộp thoại chúc mừng xuất hiện và voucher sẽ được lưu ngay vào Ví voucher của bạn với mã duy nhất dạng DS-YYYYMMDD-XXXX.
- Nhận thêm lượt quay qua Nhiệm vụ hàng ngày:
  - Kiểm tra danh sách nhiệm vụ ngày trong hộp thoại: Trả lời 3 câu hỏi, Hoàn thành 1 bài thi, Trả lời đúng chủ đề yêu cầu.
  - Khi hoàn thành mỗi nhiệm vụ, hệ thống sẽ tự động cộng thêm 1 lượt quay may mắn.

### 7.4. Ví Voucher cá nhân và Cách sử dụng tại quán
- Truy cập tab Voucher trên thanh BottomNav để quản lý toàn bộ voucher bạn đang sở hữu.
- Voucher được phân loại thành 2 mục: Chưa sử dụng và Đã sử dụng.
- Cách sử dụng voucher giảm giá:
  1. Đến trực tiếp nhà hàng, quán ăn hoặc khách sạn có tên trên voucher.
  2. Mở thẻ voucher và nhấn nút Sử dụng tại quán để hiển thị mã code và mã QR.
  3. Xuất trình mã cho nhân viên thu ngân để được trừ trực tiếp vào hóa đơn thanh toán.
  4. Nhấn Xác nhận đã sử dụng để đánh dấu voucher đã hoàn tất.

### 7.5. Sàn Nông sản OCOP và Quản lý Đơn hàng
- Truy cập tab Cửa hàng trên thanh BottomNav.
- Chọn đặc sản OCOP (Tiêu đen hữu cơ, Cà phê Robusta, Hạt Mắc ca...) và nhấn Thêm vào giỏ.
- Vào Giỏ hàng, nhập đầy đủ thông tin: Họ tên, Số điện thoại, Địa chỉ giao hàng.
- Chọn phương thức thanh toán:
  - Ví ZaloPay: Hệ thống mở hộp thoại xác nhận thanh toán Ví ZaloPay chuyên nghiệp không chữ sandbox. Nhấn Xác nhận để hoàn tất.
  - Tiền mặt khi nhận hàng (COD): Thanh toán tiền mặt trực tiếp cho shipper khi nhận hàng.
- Theo dõi tiến độ đơn hàng: Vào tab Đơn hàng của tôi trong Cửa hàng để theo dõi 4 bước tiến độ: Chờ duyệt -> Đóng gói -> Đang giao -> Hoàn tất.
- Chỉnh sửa thông tin nhận hàng: Khi đơn đang ở bước Chờ duyệt, có thể bấm Sửa thông tin để cập nhật lại địa chỉ hoặc số điện thoại. Form có nút xác nhận màu xanh rõ ràng và popup thông báo khi sửa thành công.
- Hủy đơn hoàn kho: Khi đơn đang ở bước Chờ duyệt hoặc Đóng gói, người dùng có thể bấm nút Hủy đơn hàng. Hộp thoại popup xác nhận sẽ hiển thị. Khi xác nhận hủy, hệ thống sẽ tự động hoàn trả 100% số lượng sản phẩm về kho trên cơ sở dữ liệu. Khi đơn hàng đã chuyển sang Đang giao (Shipping), nút hủy sẽ tự động được khóa để bảo vệ tiến độ vận chuyển.

### 7.6. Bảng xếp hạng tuần
- Nhấn nút Xem BXH từ màn hình tổng kết quiz hoặc thẻ thống kê để vào trang Bảng xếp hạng.
- Người chơi có thể chọn tuần thi đấu để xem lại lịch sử. Top 1, Top 2, Top 3 được trao huy chương vàng, bạc, đồng.
- Thí sinh được hiển thị rõ ràng kèm Tag ID #1000-#9999 để tránh nhầm lẫn với các thí sinh khác có cùng tên.
- Top 5 thí sinh có điểm cao nhất và thời gian làm bài nhanh nhất vào 23:59 Chủ Nhật hàng tuần sẽ được trao voucher đặc biệt giảm giá 30%.

### 7.7. Cổng thông tin Quản trị Admin CMS Web
- Truy cập tại trình duyệt máy tính: http://localhost:5000/admin.html
- Đăng nhập theo vai trò:
  1. Vai trò Hợp tác xã Nông sản (htx_daksong / 123):
     - Giao diện thương hiệu màu xanh ngọc / Emerald.
     - Dashboard OCOP: Xem doanh thu sàn, đơn chờ duyệt, đơn đang đóng gói và vận chuyển, tổng quan kho hàng.
     - Tab Đơn hàng: Nhấn nút Xác nhận còn hàng (chuyển sang Đóng gói), nút Giao Viettel Post (chuyển sang Đang giao), nút Giao thành công (Hoàn tất) hoặc nút Hủy đơn do phẩm cấp/số lượng nông sản chưa đạt (kèm ghi chú xin lỗi và hoàn 100% tồn kho).
     - Tab Kho hàng: Điều chỉnh giá niêm yết và cập nhật thêm số lượng tồn kho cho từng đặc sản OCOP.
     - Ẩn hoàn toàn các tab thuộc thẩm quyền quản lý nhà nước của Huyện.
  2. Vai trò UBND và Ban Quản lý Huyện (huyen_daksong / 123):
     - Giao diện thương hiệu màu Slate và Vàng Amber.
     - Dashboard IOC Du lịch: Xem số lượng cơ sở hợp tác, số voucher đã dùng tại quán, lượt thí sinh tham gia quiz và tổng lượt kiểm toán hệ thống. Bảng kiểm toán gần đây chỉ hiển thị thao tác về voucher và BXH.
     - Tab Quán & Hạn mức: Thêm cơ sở ẩm thực/lưu trú mới, cấp thêm số lượng voucher, sửa hạn mức tối đa hoặc xóa cơ sở khỏi hệ thống.
     - Tab BXH Quiz: Giám sát danh sách thí sinh, xóa kết quả thi gian lận hoặc reset về 0 để yêu cầu thi lại.
     - Tab Lịch sử kiểm toán: Theo dõi và tra cứu toàn bộ nhật ký hành vi trên hệ thống (chỉ lọc và xem thẻ BXH và Voucher).
     - Ẩn hoàn toàn các tab về đơn hàng và kho hàng OCOP.
  3. Nút Chuyển đổi vai trò 1-Click: Trên thanh header luôn có nút chuyển nhanh giữa Hợp tác xã và Huyện giúp cán bộ kiểm tra giao diện tức thì mà không cần đăng xuất.

---

## 8. KIỂM TRA VÀ XÁC MINH HỆ THỐNG

Các kịch bản kiểm thử quan trọng để kiểm tra hoạt động thực tế của hệ thống:

1. Kiểm thử Luồng Đố vui và Tính điểm:
   - Chọn chế độ Thi chính thức, trả lời hết 25 câu hỏi.
   - Kiểm tra bộ đếm thời gian mili-giay dừng lại khi hoàn thành.
   - Mở trang Bảng xếp hạng kiểm tra tên và Tag ID đã xuất hiện đúng vị trí với điểm số và thời gian thực.
2. Kiểm thử Vòng quay may mắn và Hạn mức CSDL:
   - Mở Admin CMS với tài khoản Huyện (huyen_daksong), vào tab Quán & Hạn mức và hạ TotalLimit của một quán về bằng với IssuedCount.
   - Quay lại Mini App trên điện thoại, mở Vòng quay may mắn và kiểm tra xem quán đó đã được tự động loại bỏ khỏi danh sách ô quay chưa.
3. Kiểm thử Đơn hàng OCOP và Hoàn kho 100%:
   - Ghi nhớ số lượng InStockQuantity của sản phẩm Tiêu đen hữu cơ trên Store.
   - Đặt mua 2 gói Tiêu đen hữu cơ. Sau khi đặt xong, kiểm tra lại xem tồn kho trên CSDL đã tự động giảm đi 2 chưa.
   - Vào tab Đơn hàng của tôi, bấm nút Hủy đơn hàng và xác nhận trong popup.
   - Kiểm tra lại xem tồn kho của sản phẩm đã được cộng trả lại đúng 2 đơn vị chưa.
4. Kiểm thử Phân quyền và Chức năng chặn lỗi 403 Forbidden:
   - Đăng nhập tài khoản Hợp tác xã (htx_daksong).
   - Sử dụng công cụ Postman hoặc fetch trên Console trình duyệt gửi request xóa kết quả thi: DELETE /api/admin/leaderboard/1.
   - Kiểm tra xem backend có trả về mã HTTP 403 Forbidden hay không.

---

## 9. TÀI LIỆU LIÊN QUAN

Để tìm hiểu chuyên sâu về kiến trúc phần mềm, mô hình thực thể ERD, chi tiết mã nguồn từng component, danh mục đầy đủ tất cả các API endpoints và bảng quy tắc nghiệp vụ toàn hệ thống, vui lòng tham khảo tệp:
- MO_TA_HE_THONG.md (Tài liệu mô tả hệ thống toàn diện).

---

## 10. CÁC LỖI THƯỜNG GẶP VÀ CÁCH KHẮC PHỤC

| Hiện tượng lỗi | Nguyên nhân tiềm ẩn | Cách xử lý cụ thể |
| :--- | :--- | :--- |
| Lỗi ECONNREFUSED khi backend kết nối đến SQL Server | Dịch vụ SQL Server (SQLEXPRESS) chưa được bật hoặc chưa bật giao thức TCP/IP | Mở SQL Server Configuration Manager, đảm bảo service SQL Server (SQLEXPRESS) đang ở trạng thái Running; bật TCP/IP trong phần SQL Server Network Configuration và khởi động lại service |
| Lỗi Login failed for user khi kết nối CSDL | Thiết lập xác thực SQL Server chưa cho phép Windows Authentication hoặc sai chuỗi kết nối | Mở file backend/.env, kiểm tra chuỗi kết nối DB_CONNECTION_STRING; đảm bảo tham số Trusted_Connection=Yes và TrustServerCertificate=Yes được khai báo đúng |
| Máy chủ báo Port 5000 already in use | Cổng 5000 đang bị một phiên chạy trước của Node.js hoặc ứng dụng khác chiếm dụng | Mở terminal gõ lệnh tìm tiến trình: netstat -ano \| findstr :5000; sau đó hủy tiến trình bằng lệnh: taskkill /PID <PID_NUMBER> /F rồi khởi động lại backend |
| Máy chủ Vite báo Port 5173 in use | Cổng 5173 đang được mở bởi một tiến trình dev khác | Vite sẽ tự động chuyển sang cổng 5174; hoặc bạn có thể dùng taskkill để tắt tiến trình cũ và khởi động lại |
| Lỗi ERESOLVE khi chạy npm install | Xung đột phiên bản phụ thuộc giữa các package mới | Chạy lệnh cài đặt kèm tham số legacy: npm install --legacy-peer-deps |
| Trang admin.html hiển thị trang trắng hoặc báo lỗi API | Máy chủ backend chưa được biên dịch hoặc chưa chạy lệnh npm run build trong backend | Vào thư mục backend, chạy npm run build để biên dịch TypeScript sang dist/, sau đó khởi động bằng node dist/index.js |
| Không mở được bản đồ Google Maps trên một số trình duyệt | Trình duyệt chặn cửa sổ popup mới (pop-up blocker) | Cho phép pop-up cho địa chỉ localhost:5173 trong cài đặt quyền riêng tư của trình duyệt |
