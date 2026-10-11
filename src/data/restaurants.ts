export interface DiningPlace {
  id: string;
  name: string;
  category: "Quán ăn" | "Cà phê & Đồ uống";
  address: string;
  phone: string;
  openHours: string;
  priceRange: string;
  mapsUrl: string;
  highlight?: string;
}

/**
 * Danh sách nhà hàng, quán ăn và cà phê tại Đắk Song (theo Foody & Google Maps)
 * Tách riêng tại file này để dễ dàng thêm mới, sửa đổi hoặc cập nhật.
 */
export const diningPlaces: DiningPlace[] = [
  {
    id: "dine-com-ga-52",
    name: "Cơm Gà 52 Gia Hân",
    category: "Quán ăn",
    address: "QL14, Tổ 3, Thị trấn Đức An, Huyện Đắk Song, Đắk Nông",
    phone: "0989 807 806",
    openHours: "06:30 – 21:55",
    priceRange: "35.000 – 120.000 VNĐ / món",
    mapsUrl: "https://maps.google.com/?cid=2476026190170962207",
    highlight: "Cơm gà xé, gà nướng đậm vị Tây Nguyên, phục vụ nhanh chu đáo trên trục QL14."
  },
  {
    id: "dine-huong-que",
    name: "Quán Cơm Hương Quế",
    category: "Quán ăn",
    address: "QL14, Thôn 3, Xã Trường Xuân, Huyện Đắk Song, Đắk Nông",
    phone: "0333 175 629",
    openHours: "07:00 – 20:00",
    priceRange: "40.000 – 150.000 VNĐ / phần",
    mapsUrl: "https://maps.google.com/?cid=10423522567252404637",
    highlight: "Cơm phần gia đình, món ăn dân dã tươi ngon, trạm dừng chân quen thuộc của tài xế và du khách."
  },
  {
    id: "dine-thanh-cong",
    name: "Quán Ăn Gia Đình Thành Công",
    category: "Quán ăn",
    address: "QL14, Xã Trường Xuân, Huyện Đắk Song, Đắk Nông",
    phone: "Đang cập nhật (liên hệ trực tiếp tại quán trên trục QL14)",
    openHours: "10:00 – 21:00",
    priceRange: "50.000 – 200.000 VNĐ / món",
    mapsUrl: "https://maps.google.com/?cid=5824690676867293191",
    highlight: "Không gian ấm cúng, chuyên các món ăn gia đình truyền thống và đặc sản cao nguyên."
  },
  {
    id: "dine-star-coffee",
    name: "Star Coffee Đắk Song",
    category: "Cà phê & Đồ uống",
    address: "Tổ 5 (gần QL14), Thị trấn Đức An, Huyện Đắk Song, Đắk Nông",
    phone: "Đang cập nhật",
    openHours: "06:15 – 22:00",
    priceRange: "20.000 – 45.000 VNĐ / ly",
    mapsUrl: "https://maps.google.com/?cid=10075820257061491898",
    highlight: "Cà phê nguyên chất Đắk Song, không gian hiện đại, thoáng mát để trò chuyện và check-in."
  },
  {
    id: "dine-cafe-vuon-nha-ai",
    name: "Cafe Vườn Nhà Ai",
    category: "Cà phê & Đồ uống",
    address: "Cầu Nam Bình, Thôn 3, Xã Nam Bình, Huyện Đắk Song, Đắk Nông",
    phone: "Đang cập nhật",
    openHours: "06:30 – 22:00",
    priceRange: "20.000 – 40.000 VNĐ / ly",
    mapsUrl: "https://maps.google.com/?cid=15653722207506978653",
    highlight: "Không gian sân vườn xanh mát gần cầu Nam Bình, thư giãn ngắm cảnh núi rừng yên bình."
  }
];
