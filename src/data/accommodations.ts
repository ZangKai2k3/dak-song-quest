export interface Accommodation {
  id: string;
  name: string;
  type: "Khách sạn" | "Nhà nghỉ";
  address: string;
  phone: string;
  priceHourly: string;
  priceOvernight: string;
  note: string;
  operatingHours?: string;
  mapsQuery: string;
  mapsUrl: string;
}

export const accommodationPriceOverview = {
  hourly: "60.000 – 100.000 VNĐ / 2–3 giờ đầu",
  overnight: "130.000 – 450.000 VNĐ / đêm",
  description: "Mặt bằng chung giá lưu trú tại Đắk Song tùy theo hạng phòng đơn, phòng đôi hoặc tiêu chuẩn khách sạn/nhà nghỉ."
};

/**
 * Danh sách cơ sở lưu trú (Khách sạn & Nhà nghỉ) tại Đắk Song
 * Tách riêng tại file này để dễ dàng thêm mới, sửa đổi hoặc xóa bớt.
 */
export const accommodations: Accommodation[] = [
  {
    id: "acc-hoang-nguyen",
    name: "Khách sạn Hoàng Nguyên",
    type: "Khách sạn",
    address: "Tổ 1, thị trấn Đức An, huyện Đắk Song, Đắk Nông",
    phone: "0888 394 466",
    priceHourly: "80.000 – 100.000 VNĐ / 2 giờ đầu",
    priceOvernight: "250.000 – 350.000 VNĐ / đêm",
    note: "Phòng mới, sạch sẽ, thoáng mát, đầy đủ tiện nghi hiện đại.",
    operatingHours: "24/24",
    mapsQuery: "Khách sạn Hoàng Nguyên thị trấn Đức An Đắk Song Đắk Nông",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch+s%E1%BA%A1n+Ho%C3%A0ng+Nguy%C3%AAn+th%E1%BB%8B+tr%E1%BA%A5n+%C4%90%E1%BB%A9c+An+%C4%90%E1%BA%AFk+Song+%C4%90%E1%BA%AFk+N%C3%B4ng"
  },
  {
    id: "acc-le-thuc",
    name: "Khách Sạn Lê Thức",
    type: "Khách sạn",
    address: "Quốc lộ 14, thị trấn Đức An, huyện Đắk Song, Đắk Nông (cách QL14 khoảng 50m, gần chợ huyện)",
    phone: "0934 111 799",
    priceHourly: "từ 80.000 VNĐ / 2 giờ",
    priceOvernight: "Khoảng 300.000 VNĐ / đêm (phòng đơn có cửa sổ)",
    note: "Khách sạn có thang máy, vị trí thuận tiện đi lại và ăn uống mua sắm gần chợ.",
    operatingHours: "24/24",
    mapsQuery: "Khách Sạn Lê Thức thị trấn Đức An Đắk Song",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch+S%E1%BA%A1n+L%C3%AA+Th%E1%BB%A9c+th%E1%BB%8B+tr%E1%BA%A5n+%C4%90%E1%BB%A9c+An+%C4%90%E1%BA%AFk+Song"
  },
  {
    id: "acc-hoang-diep",
    name: "Khách Sạn Hoàng Điệp",
    type: "Khách sạn",
    address: "Số 2 Trần Hưng Đạo, xã Đức Lập, huyện Đắk Song, Đắk Nông",
    phone: "0261 3751 686",
    priceHourly: "từ 100.000 VNĐ",
    priceOvernight: "Khoảng 350.000 – 400.000 VNĐ / đêm (phòng đôi)",
    note: "Không gian thoáng đãng, nằm gần trung tâm xã Đức Lập thuận tiện di chuyển.",
    operatingHours: "24/24",
    mapsQuery: "Khách Sạn Hoàng Điệp xã Đức Lập Đắk Song",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch+S%E1%BA%A1n+Ho%C3%A0ng+%C4%90i%E1%BB%87p+x%C3%A3+%C4%90%E1%BB%A9c+L%E1%BA%ADp+%C4%90%E1%BA%AFk+Song"
  },
  {
    id: "acc-hoa-phuong",
    name: "Nhà nghỉ Hoa Phượng",
    type: "Nhà nghỉ",
    address: "Thị trấn Đức An, huyện Đắk Song, Đắk Nông",
    phone: "0983 483 488",
    priceHourly: "Khoảng 60.000 – 80.000 VNĐ / 2 giờ",
    priceOvernight: "Khoảng 150.000 – 220.000 VNĐ / đêm",
    note: "Phòng ốc bình dân, sạch sẽ, chủ nhà nghỉ thân thiện, nhiệt tình hỗ trợ du khách.",
    operatingHours: "24/24",
    mapsQuery: "Nhà nghỉ Hoa Phượng thị trấn Đức An Đắk Song",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+ngh%E1%BB%89+Hoa+Ph%C6%B0%E1%BB%A3ng+th%E1%BB%8B+tr%E1%BA%A5n+%C4%90%E1%BB%A9c+An+%C4%90%E1%BA%AFk+Song"
  },
  {
    id: "acc-79-99",
    name: "Nhà nghỉ 79 / 99",
    type: "Nhà nghỉ",
    address: "Xã Đắk N'Drung / Thuận Hạnh, huyện Đắk Song, Đắk Nông",
    phone: "0962 828 916",
    priceHourly: "Dưới 3 tiếng khoảng 80.000 VNĐ",
    priceOvernight: "Khoảng 130.000 – 180.000 VNĐ / đêm",
    note: "Giá cả bình dân, vị trí thuận lợi cho du khách và dân phượt dừng chân nghỉ ngơi.",
    operatingHours: "24/24",
    mapsQuery: "Nhà nghỉ 79 Đắk N'Drung Đắk Song",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+ngh%E1%BB%89+79+%C4%90%E1%BA%AFk+N%27Drung+%C4%90%E1%BA%AFk+Song"
  }
];
