// @ts-ignore
const sql = require('mssql/lib/msnodesqlv8');

const connectionString = 'Server=.\\SQLEXPRESS;Database=DakSongQuestDB;Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes';

async function seedCleanData() {
  const pool = await sql.connect({ connectionString });
  console.log('Connected to SQL Server');

  // 1. Clean test orders
  await pool.request().query('DELETE FROM dbo.OrderItems; DELETE FROM dbo.Orders;');
  console.log('Cleaned orders');

  // 2. Re-populate Venues with ALL 11 real Dak Song businesses (matching all vouchers)
  await pool.request().query('DELETE FROM dbo.UserVouchers; DELETE FROM dbo.Venues;');
  
  const venues = [
    {
      id: 1,
      name: 'Khách sạn Hoàng Nguyên',
      cat: 'Lưu trú',
      phone: '0888394466',
      addr: 'Tổ 1, thị trấn Đức An, Đắk Song, Đắk Nông',
      disc: 15,
      limit: 100,
    },
    {
      id: 2,
      name: 'Cơm Gà 52 Gia Hân',
      cat: 'Ăn uống',
      phone: '0989807806',
      addr: 'QL14, Tổ 3, TT. Đức An, Đắk Song, Đắk Nông',
      disc: 15,
      limit: 80,
    },
    {
      id: 3,
      name: 'Khách Sạn Lê Thức',
      cat: 'Lưu trú',
      phone: '0934111799',
      addr: 'Quốc lộ 14, thị trấn Đức An, Đắk Song, Đắk Nông',
      disc: 10,
      limit: 80,
    },
    {
      id: 4,
      name: 'Quán Cơm Hương Quế',
      cat: 'Ăn uống',
      phone: '0333175629',
      addr: 'QL14, Thôn 3, Xã Trường Xuân, Đắk Song, Đắk Nông',
      disc: 10,
      limit: 70,
    },
    {
      id: 5,
      name: 'Khách Sạn Hoàng Điệp',
      cat: 'Lưu trú',
      phone: '02613751686',
      addr: 'Số 2 Trần Hưng Đạo, Xã Đức Lập, Đắk Song, Đắk Nông',
      disc: 10,
      limit: 60,
    },
    {
      id: 6,
      name: 'Quán Ăn Gia Đình Thành Công',
      cat: 'Ăn uống',
      phone: '0962828916',
      addr: 'QL14, Xã Trường Xuân, Đắk Song, Đắk Nông',
      disc: 10,
      limit: 75,
    },
    {
      id: 7,
      name: 'Star Coffee Đắk Song',
      cat: 'Ăn uống',
      phone: '0989807806',
      addr: 'Tổ 5 (gần QL14), Thị trấn Đức An, Đắk Song, Đắk Nông',
      disc: 5,
      limit: 120,
    },
    {
      id: 8,
      name: 'Nhà nghỉ Hoa Phượng',
      cat: 'Lưu trú',
      phone: '0983483488',
      addr: 'Thị trấn Đức An, Đắk Song, Đắk Nông',
      disc: 5,
      limit: 90,
    },
    {
      id: 9,
      name: 'Nhà nghỉ 79 / 99',
      cat: 'Lưu trú',
      phone: '0962828916',
      addr: 'Xã Đắk N\'Drung / Thuận Hạnh, Đắk Song, Đắk Nông',
      disc: 5,
      limit: 90,
    },
    {
      id: 10,
      name: 'Cafe Vườn Nhà Ai',
      cat: 'Ăn uống',
      phone: '0333175629',
      addr: 'Cầu Nam Bình, Thôn 3, Xã Nam Bình, Đắk Song, Đắk Nông',
      disc: 5,
      limit: 100,
    },
    {
      id: 11,
      name: 'Điểm Dừng Chân Nông Sản Đắk Song',
      cat: 'Đặc sản',
      phone: '0912345678',
      addr: 'Km 235 Quốc Lộ 14, Đắk Song, Đắk Nông',
      disc: 10,
      limit: 120,
    },
  ];

  for (const v of venues) {
    await pool.request()
      .input('id', sql.Int, v.id)
      .input('name', sql.NVarChar(150), v.name)
      .input('cat', sql.NVarChar(50), v.cat)
      .input('phone', sql.VarChar(20), v.phone)
      .input('addr', sql.NVarChar(255), v.addr)
      .input('disc', sql.Int, v.disc)
      .input('limit', sql.Int, v.limit)
      .query(`
        SET IDENTITY_INSERT dbo.Venues ON;
        INSERT INTO dbo.Venues (VenueId, VenueName, Category, Phone, Address, DiscountPercent, TotalLimit, IssuedCount, UsedCount, IsActive)
        VALUES (@id, @name, @cat, @phone, @addr, @disc, @limit, 0, 0, 1);
        SET IDENTITY_INSERT dbo.Venues OFF;
      `);
  }
  console.log(`Seeded all ${venues.length} real Venues`);

  // 3. Re-populate Products with real Dak Song OCOP products and prices
  await pool.request().query('DELETE FROM dbo.Products;');

  const products = [
    {
      id: 1,
      name: 'Hạt tiêu đen Đắk N’rung thượng hạng',
      origin: 'Xã Đắk N’rung, Huyện Đắk Song',
      cat: 'Hạt tiêu',
      price: 140000,
      unit: 'Gói 500g (Hút chân không)',
      desc: 'Hạt tiêu đen chắc hạt, phơi khô tự nhiên từ thủ phủ hồ tiêu Đắk N’rung. Hương vị cay nồng đậm đà, chuẩn chất đất đỏ bazan.',
      qty: 100,
      img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Hạt tiêu sọ (Tiêu trắng) Đắk N’rung',
      origin: 'Xã Đắk N’rung, Huyện Đắk Song',
      cat: 'Hạt tiêu',
      price: 195000,
      unit: 'Hộp 500g (Kèm nắp bảo quản)',
      desc: 'Hạt tiêu sọ tuyển chọn từng hạt đều đặn, màu sáng tự nhiên, vị cay thanh quý phái. Đóng hộp trang trọng, bảo quản lâu dài.',
      qty: 60,
      img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Cà phê Robusta mộc rang xay Đắk Song',
      origin: 'Xã Nâm N’Jang, Huyện Đắk Song',
      cat: 'Cà phê',
      price: 120000,
      unit: 'Túi van 1 chiều 500g',
      desc: 'Cà phê Robusta thu hoạch chín mọng 100% từ vùng đất bazan màu mỡ. Rang mộc giữ trọn hương thơm nồng nàn, hậu vị ngọt sâu.',
      qty: 150,
      img: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      name: 'Hạt Mắc ca nứt vỏ sấy giòn Tây Nguyên',
      origin: 'Huyện Đắk Song, Đắk Nông',
      cat: 'Hạt dinh dưỡng',
      price: 165000,
      unit: 'Hộp 500g (Kèm dụng cụ tách)',
      desc: 'Mắc ca Đắk Song hạt to tròn đều, nhân bùi béo giàu Omega-3, sấy nứt vỏ dễ tách ăn liền.',
      qty: 80,
      img: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Măng le rừng khô tự nhiên Đắk Song',
      origin: 'Rừng tự nhiên Đắk Song, Đắk Nông',
      cat: 'Nông sản khô',
      price: 150000,
      unit: 'Túi 500g (Phơi nắng tự nhiên)',
      desc: 'Măng le rừng tự nhiên phơi nắng vàng óng, thịt dày giòn ngọt, không chất bảo quản hay phẩm màu.',
      qty: 50,
      img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'
    }
  ];

  for (const p of products) {
    await pool.request()
      .input('id', sql.Int, p.id)
      .input('name', sql.NVarChar(150), p.name)
      .input('origin', sql.NVarChar(150), p.origin)
      .input('cat', sql.NVarChar(50), p.cat)
      .input('price', sql.Decimal(18, 2), p.price)
      .input('unit', sql.NVarChar(50), p.unit)
      .input('desc', sql.NVarChar(sql.MAX), p.desc)
      .input('qty', sql.Int, p.qty)
      .input('img', sql.NVarChar(500), p.img)
      .query(`
        SET IDENTITY_INSERT dbo.Products ON;
        INSERT INTO dbo.Products (ProductId, ProductName, Origin, Category, Price, Unit, Description, InStockQuantity, ImageUrl, IsActive)
        VALUES (@id, @name, @origin, @cat, @price, @unit, @desc, @qty, @img, 1);
        SET IDENTITY_INSERT dbo.Products OFF;
      `);
  }
  console.log('Seeded real Products');

  await pool.close();
  console.log('Finished seeding clean data successfully!');
}

seedCleanData().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
