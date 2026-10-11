-- =======================================================
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU ĐẮK SONG QUEST (SQL SERVER)
-- Hệ thống Quản lý Voucher, Đặc sản OCOP Đắk Song & Đơn hàng
-- =======================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DakSongQuestDB')
BEGIN
    CREATE DATABASE DakSongQuestDB;
END
GO

USE DakSongQuestDB;
GO

-- 1. BẢNG CƠ SỞ KINH DOANH & HẠN MỨC VOUCHER (Admin cấu hình hạn mức thỏa thuận)
IF OBJECT_ID('dbo.Venues', 'U') IS NOT NULL DROP TABLE dbo.Venues;
CREATE TABLE dbo.Venues (
    VenueId INT IDENTITY(1,1) PRIMARY KEY,
    VenueName NVARCHAR(200) NOT NULL,
    Category NVARCHAR(50) NOT NULL, -- Quán Cà phê, Nhà hàng/Ẩm thực, Nhà nghỉ/Homestay
    Phone VARCHAR(20) NULL,
    Address NVARCHAR(300) NOT NULL,
    DiscountPercent INT NOT NULL DEFAULT 10, -- Mức giảm giá: 10, 20, 30%
    TotalLimit INT NOT NULL DEFAULT 50, -- Hạn mức tối đa Admin nhập thỏa thuận với quán
    IssuedCount INT NOT NULL DEFAULT 0, -- Số voucher đã phát ra cho khách
    UsedCount INT NOT NULL DEFAULT 0, -- Số voucher khách đã đến quán sử dụng
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 2. BẢNG CHI TIẾT VOUCHER CỦA NGƯỜI DÙNG (Cấp khi chơi Quiz/Vòng quay)
IF OBJECT_ID('dbo.UserVouchers', 'U') IS NOT NULL DROP TABLE dbo.UserVouchers;
CREATE TABLE dbo.UserVouchers (
    VoucherId INT IDENTITY(1,1) PRIMARY KEY,
    VoucherCode VARCHAR(50) UNIQUE NOT NULL, -- Ví dụ: DSQ-CAFE-10293
    VenueId INT NOT NULL FOREIGN KEY REFERENCES dbo.Venues(VenueId),
    UserId VARCHAR(100) NOT NULL, -- Zalo ID hoặc ID người dùng
    DiscountPercent INT NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active', -- 'Active', 'Used', 'Expired'
    IssuedAt DATETIME DEFAULT GETDATE(),
    UsedAt DATETIME NULL
);
GO

-- 3. BẢNG ĐẶC SẢN ĐẮK SONG OCOP (Hàng khô vận chuyển thuận tiện)
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
CREATE TABLE dbo.Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    ProductName NVARCHAR(200) NOT NULL,
    Origin NVARCHAR(100) NOT NULL, -- Ví dụ: Xã Đắk N’rung, Đắk Song
    Category NVARCHAR(50) NOT NULL, -- 'Hạt tiêu', 'Cà phê', 'Hạt dinh dưỡng', 'Nông sản khô'
    Price DECIMAL(18,0) NOT NULL, -- Giá bán VNĐ
    Unit NVARCHAR(50) NOT NULL, -- Gói 500g, Hộp 250g, v.v.
    ImageUrl NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    InStockQuantity INT NOT NULL DEFAULT 100,
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 4. BẢNG ĐƠN HÀNG MUA ĐẶC SẢN
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
CREATE TABLE dbo.Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    OrderCode VARCHAR(50) UNIQUE NOT NULL, -- Ví dụ: ORD-20261010-891
    UserId VARCHAR(100) NOT NULL,
    CustomerName NVARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    ShippingAddress NVARCHAR(350) NOT NULL,
    Note NVARCHAR(500) NULL,
    TotalAmount DECIMAL(18,0) NOT NULL,
    DiscountAmount DECIMAL(18,0) DEFAULT 0,
    FinalAmount DECIMAL(18,0) NOT NULL,
    VoucherCodeApplied VARCHAR(50) NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'ZaloPay', -- 'ZaloPay', 'COD'
    PaymentStatus NVARCHAR(30) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed'
    OrderStatus NVARCHAR(50) DEFAULT 'PendingConfirm', 
    -- Trạng thái đơn: 
    -- 'PendingConfirm' (Chờ Admin kiểm tra thanh toán & gọi nhà vườn)
    -- 'ReadyToShip' (Admin đã xác nhận nhà vườn còn hàng)
    -- 'Shipping' (Đã bàn giao đơn vị vận chuyển Viettel Post/Bưu điện)
    -- 'Completed' (Giao hàng thành công)
    -- 'Cancelled' (Hủy đơn/hết hàng)
    AdminConfirmedAt DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 5. BẢNG CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG (OrderItems)
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
CREATE TABLE dbo.OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL FOREIGN KEY REFERENCES dbo.Orders(OrderId),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES dbo.Products(ProductId),
    ProductName NVARCHAR(200) NOT NULL,
    Price DECIMAL(18,0) NOT NULL,
    Quantity INT NOT NULL,
    Subtotal DECIMAL(18,0) NOT NULL
);
GO

-- =======================================================
-- NẠP DỮ LIỆU BAN ĐẦU (SEED DATA MẪU)
-- =======================================================

-- 1. Nạp danh sách quán mẫu & hạn mức Admin thỏa thuận
INSERT INTO dbo.Venues (VenueName, Category, Phone, Address, DiscountPercent, TotalLimit, IssuedCount, UsedCount)
VALUES 
(N'Cà Phê Gió Đắk Song', N'Quán Cà phê', '0905123456', N'Đồi Gió, Thị trấn Đức An, Đắk Song', 20, 100, 15, 6),
(N'Cơm Lam Gà Nướng Thung Lũng', N'Nhà hàng/Ẩm thực', '0912345678', N'QL14, Xã Trường Xuân, Đắk Song', 15, 80, 25, 12),
(N'Homestay Đồi Thông Bazan', N'Nhà nghỉ/Homestay', '0987654321', N'Tiểu khu 1686, Xã Nâm N’Jang, Đắk Song', 20, 50, 10, 3),
(N'Quán Ăn Gia Đình Đại Ngàn', N'Nhà hàng/Ẩm thực', '0933221100', N'Trung tâm Xã Đắk N’rung, Đắk Song', 10, 120, 40, 18),
(N'Điểm Dừng Chân Nông Sản Đắk Song', N'Điểm Mua sắm', '0977889900', N'Thị trấn Đức An, Đắk Song', 30, 30, 8, 2);

-- 2. Nạp danh sách Đặc sản OCOP Đắk Song chất lượng cao
INSERT INTO dbo.Products (ProductName, Origin, Category, Price, Unit, Description, InStockQuantity)
VALUES
(
    N'Hạt tiêu đen Đắk N’rung thượng hạng', 
    N'Xã Đắk N’rung, Đắk Song', 
    N'Hạt tiêu', 
    140000, 
    N'Gói 500g', 
    N'Hạt tiêu đen chắc hạt, phơi khô tự nhiên từ thủ phủ hồ tiêu Đắk N’rung, hương vị cay nồng đậm đà chuẩn chỉ Tây Nguyên.', 
    100
),
(
    N'Hạt tiêu sọ (Tiêu trắng) Đắk N’rung', 
    N'Xã Đắk N’rung, Đắk Song', 
    N'Hạt tiêu', 
    195000, 
    N'Hộp 500g', 
    N'Hạt tiêu sọ tuyển chọn kỹ lưỡng, hạt to đều màu sáng, cay thơm thanh lịch, đóng hộp sang trọng rất thích hợp làm quà biếu.', 
    60
),
(
    N'Cà phê Robusta mộc rang xay Đắk Song', 
    N'Xã Nâm N’Jang, Đắk Song', 
    N'Cà phê', 
    120000, 
    N'Túi 500g', 
    N'Cà phê Robusta hái chín 100% trên thổ nhưỡng đất đỏ bazan, rang mộc hương thơm nồng nàn quyến rũ, vị đậm đà truyền thống.', 
    150
),
(
    N'Hạt Mắc ca nứt vỏ sấy giòn Tây Nguyên', 
    N'Huyện Đắk Song, Đắk Nông', 
    N'Hạt dinh dưỡng', 
    165000, 
    N'Hộp 500g (kèm dụng cụ tách)', 
    N'Mắc ca trồng tại Đắk Song hạt tròn đều, nhân thơm bùi béo ngậy giàu dinh dưỡng, sấy nứt vỏ dễ tách ăn liền.', 
    80
),
(
    N'Măng le rừng khô tự nhiên Đắk Song', 
    N'Rừng tự nhiên Đắk Song', 
    N'Nông sản khô', 
    150000, 
    N'Túi 500g', 
    N'Măng le tự nhiên phơi nắng khô vàng ruộm, thịt dày giòn ngọt, không chất bảo quản, chế biến các món hầm truyền thống.', 
    50
);
GO

