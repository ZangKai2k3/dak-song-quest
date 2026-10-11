import type { Voucher, VoucherTier } from "../types";
import { accommodations } from "./accommodations";
import { diningPlaces } from "./restaurants";

// Tổng hợp danh sách tất cả 10 cơ sở lưu trú và ăn uống thực tế tại Đắk Song
export const allDakSongVenues = [
  ...accommodations.map((a) => ({
    type: "stay" as const,
    name: a.name,
    address: a.address,
    phone: a.phone,
    mapsUrl: a.mapsUrl,
    mapsQuery: a.mapsQuery,
    priceNote: a.priceOvernight,
  })),
  ...diningPlaces.map((d) => ({
    type: "dine" as const,
    name: d.name,
    address: d.address,
    phone: d.phone,
    mapsUrl: d.mapsUrl,
    mapsQuery: `${d.name} Dak Song`,
    priceNote: d.category,
  })),
];

/**
 * Danh sách voucher chính thức của 10 cơ sở kinh doanh thực tế tại Đắk Song
 * (Mỗi voucher = 1 cơ sở kinh doanh riêng biệt, không có voucher danh lam/thắng cảnh)
 */
export const vouchers: Voucher[] = [
  {
    id: "V-DIA-01",
    code: "DSQ-DIA-HN15",
    tier: "Diamond",
    title: "Đặc quyền Kim Cương tại Khách sạn Hoàng Nguyên",
    discount: "Giảm 15%",
    expiresAt: "2026-12-31",
    condition: "Giảm 15% tiền đặt phòng qua đêm khi xuất trình mã cho quầy lễ tân.",
    placeName: "Khách sạn Hoàng Nguyên",
    placeAddress: "Tổ 1, thị trấn Đức An, huyện Đắk Song, Đắk Nông",
    placePhone: "0888 394 466",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch%20s%E1%BA%A1n%20Ho%C3%A0ng%20Nguy%C3%AAn%20%C4%90%E1%BA%AFk%20Song",
    mapsQuery: "Khách sạn Hoàng Nguyên Đắk Song",
    places: ["Khách sạn Hoàng Nguyên"],
    used: false,
  },
  {
    id: "V-DIA-02",
    code: "DSQ-DIA-CG15",
    tier: "Diamond",
    title: "Đặc quyền Kim Cương tại Cơm Gà 52 Gia Hân",
    discount: "Giảm 15%",
    expiresAt: "2026-12-31",
    condition: "Giảm 15% trên tổng hóa đơn ăn uống từ 150.000đ. Mỗi mã áp dụng 1 lần.",
    placeName: "Cơm Gà 52 Gia Hân",
    placeAddress: "QL14, Tổ 3, Thị trấn Đức An, Huyện Đắk Song, Đắk Nông",
    placePhone: "0989 807 806",
    mapsUrl: "https://maps.google.com/?cid=2476026190170962207",
    mapsQuery: "Com Ga 52 Gia Han Dak Song",
    places: ["Cơm Gà 52 Gia Hân"],
    used: false,
  },
  {
    id: "V-GLD-01",
    code: "DSQ-GLD-LT10",
    tier: "Gold",
    title: "Ưu đãi Vàng tại Khách Sạn Lê Thức",
    discount: "Giảm 10%",
    expiresAt: "2026-12-31",
    condition: "Giảm 10% khi đặt phòng nghỉ qua đêm tại khách sạn (xuất trình mã cho lễ tân).",
    placeName: "Khách Sạn Lê Thức",
    placeAddress: "Quốc lộ 14, thị trấn Đức An, huyện Đắk Song, Đắk Nông",
    placePhone: "0934 111 799",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch%20S%E1%BA%A1n%20L%C3%AA%20Th%E1%BB%A9c%20%C4%90%E1%BA%AFk%20Song",
    mapsQuery: "Khách Sạn Lê Thức Đắk Song",
    places: ["Khách Sạn Lê Thức"],
    used: false,
  },
  {
    id: "V-GLD-02",
    code: "DSQ-GLD-HQ10",
    tier: "Gold",
    title: "Ưu đãi Vàng tại Quán Cơm Hương Quế",
    discount: "Giảm 10%",
    expiresAt: "2026-12-31",
    condition: "Giảm 10% cho mâm cơm gia đình hoặc đoàn du khách từ 200.000đ.",
    placeName: "Quán Cơm Hương Quế",
    placeAddress: "QL14, Thôn 3, Xã Trường Xuân, Huyện Đắk Song, Đắk Nông",
    placePhone: "0333 175 629",
    mapsUrl: "https://maps.google.com/?cid=10423522567252404637",
    mapsQuery: "Quan Com Huong Que Dak Song",
    places: ["Quán Cơm Hương Quế"],
    used: false,
  },
  {
    id: "V-GLD-03",
    code: "DSQ-GLD-HD10",
    tier: "Gold",
    title: "Ưu đãi Vàng tại Khách Sạn Hoàng Điệp",
    discount: "Giảm 10%",
    expiresAt: "2026-12-31",
    condition: "Giảm ngay 10% giá phòng đôi lưu trú khi xuất trình mã tại quầy lễ tân.",
    placeName: "Khách Sạn Hoàng Điệp",
    placeAddress: "Số 2 Trần Hưng Đạo, xã Đức Lập, huyện Đắk Song, Đắk Nông",
    placePhone: "0261 3751 686",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch%20S%E1%BA%A1n%20Ho%C3%A0ng%20%C4%90i%E1%BB%87p%20%C4%90%E1%BA%AFk%20Song",
    mapsQuery: "Khách Sạn Hoàng Điệp Đắk Song",
    places: ["Khách Sạn Hoàng Điệp"],
    used: false,
  },
  {
    id: "V-GLD-04",
    code: "DSQ-GLD-TC10",
    tier: "Gold",
    title: "Ưu đãi Vàng tại Quán Ăn Gia Đình Thành Công",
    discount: "Giảm 10%",
    expiresAt: "2026-12-31",
    condition: "Giảm 10% trên tổng hóa đơn ăn uống từ 200.000đ cho gia đình & du khách.",
    placeName: "Quán Ăn Gia Đình Thành Công",
    placeAddress: "QL14, Xã Trường Xuân, Huyện Đắk Song, Đắk Nông",
    placePhone: "0962 828 916",
    mapsUrl: "https://maps.google.com/?cid=5824690676867293191",
    mapsQuery: "Quan An Gia Dinh Thanh Cong Dak Song",
    places: ["Quán Ăn Gia Đình Thành Công"],
    used: false,
  },
  {
    id: "V-GLD-05",
    code: "DSQ-GLD-DC10",
    tier: "Gold",
    title: "Ưu đãi Vàng tại Điểm Dừng Chân Nông Sản Đắk Song",
    discount: "Giảm 10%",
    expiresAt: "2026-12-31",
    condition: "Giảm 10% khi mua các mặt hàng nông sản OCOP hoặc dùng nước giải khát tại điểm dừng chân.",
    placeName: "Điểm Dừng Chân Nông Sản Đắk Song",
    placeAddress: "Km 245 Quốc Lộ 14, Huyện Đắk Song, Đắk Nông",
    placePhone: "0988 123 456",
    mapsUrl: "https://maps.google.com/?q=Dak+Song+Dak+Nong",
    mapsQuery: "Diem Dung Chan Nong San Dak Song",
    places: ["Điểm Dừng Chân Nông Sản Đắk Song"],
    used: false,
  },
  {
    id: "V-SLV-01",
    code: "DSQ-SLV-STAR05",
    tier: "Silver",
    title: "Ưu đãi Bạc tại Star Coffee Đắk Song",
    discount: "Giảm 5%",
    expiresAt: "2026-12-31",
    condition: "Giảm 5% trên tổng hóa đơn đồ uống khi thanh toán tại quầy.",
    placeName: "Star Coffee Đắk Song",
    placeAddress: "Tổ 5 (gần QL14), Thị trấn Đức An, Huyện Đắk Song, Đắk Nông",
    placePhone: "0989 807 806",
    mapsUrl: "https://maps.google.com/?cid=10075820257061491898",
    mapsQuery: "Star Coffee Dak Song",
    places: ["Star Coffee Đắk Song"],
    used: false,
  },
  {
    id: "V-SLV-02",
    code: "DSQ-SLV-HP05",
    tier: "Silver",
    title: "Ưu đãi Bạc tại Nhà nghỉ Hoa Phượng",
    discount: "Giảm 5%",
    expiresAt: "2026-12-31",
    condition: "Giảm 5% tiền phòng nghỉ giờ hoặc qua đêm. Mở cửa 24/24.",
    placeName: "Nhà nghỉ Hoa Phượng",
    placeAddress: "Thị trấn Đức An, huyện Đắk Song, Đắk Nông",
    placePhone: "0983 483 488",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0%20ngh%E1%BB%89%20Hoa%20Ph%C6%B0%E1%BB%A3ng%20%C4%90%E1%BA%AFk%20Song",
    mapsQuery: "Nhà nghỉ Hoa Phượng Đắk Song",
    places: ["Nhà nghỉ Hoa Phượng"],
    used: false,
  },
  {
    id: "V-SLV-03",
    code: "DSQ-SLV-NN05",
    tier: "Silver",
    title: "Ưu đãi Bạc tại Nhà nghỉ 79 / 99",
    discount: "Giảm 5%",
    expiresAt: "2026-12-31",
    condition: "Giảm 5% tiền phòng khi đặt phòng nghỉ qua đêm (xuất trình mã cho lễ tân).",
    placeName: "Nhà nghỉ 79 / 99",
    placeAddress: "Xã Đắk N'Drung / Thuận Hạnh, huyện Đắk Song, Đắk Nông",
    placePhone: "0962 828 916",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nh%C3%A0+ngh%E1%BB%89+79+%C4%90%E1%BA%AFk+N%27Drung+%C4%90%E1%BA%AFk+Song",
    mapsQuery: "Nhà nghỉ 79 Đắk N'Drung Đắk Song",
    places: ["Nhà nghỉ 79 / 99"],
    used: false,
  },
  {
    id: "V-SLV-04",
    code: "DSQ-SLV-VNA05",
    tier: "Silver",
    title: "Ưu đãi Bạc tại Cafe Vườn Nhà Ai",
    discount: "Giảm 5%",
    expiresAt: "2026-12-31",
    condition: "Giảm 5% trên hóa đơn khi gọi đồ uống bất kỳ tại quán.",
    placeName: "Cafe Vườn Nhà Ai",
    placeAddress: "Cầu Nam Bình, Thôn 3, Xã Nam Bình, Huyện Đắk Song, Đắk Nông",
    placePhone: "0333 175 629",
    mapsUrl: "https://maps.google.com/?cid=15653722207506978653",
    mapsQuery: "Cafe Vuon Nha Ai Dak Song",
    places: ["Cafe Vườn Nhà Ai"],
    used: false,
  },
  {
    id: "V-TOP5-01",
    code: "DSQ-TOP5-30",
    tier: "Special",
    title: "Giải Thưởng Top 5 Tuần tại Khách Sạn Hoàng Điệp",
    discount: "VIP Giảm 30%",
    expiresAt: "2026-12-31",
    condition: "Voucher tốt nhất hệ thống: Giảm 30% phòng đôi cho 5 người đầu bảng BXH tuần Đắk Song Quest.",
    placeName: "Khách Sạn Hoàng Điệp",
    placeAddress: "Số 2 Trần Hưng Đạo, xã Đức Lập, huyện Đắk Song, Đắk Nông",
    placePhone: "0261 3751 686",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kh%C3%A1ch%20S%E1%BA%A1n%20Ho%C3%A0ng%20%C4%90i%E1%BB%87p%20%C4%90%E1%BA%AFk%20Song",
    mapsQuery: "Khách Sạn Hoàng Điệp Đắk Song",
    places: ["Khách Sạn Hoàng Điệp"],
    used: false,
  },
];

/**
 * Danh sách 10 ô vòng quay may mắn (tương ứng với 10 cơ sở có dữ liệu)
 * Bạc: 5%, Vàng: 10%, Kim cương: 15%
 */
export interface WheelSegment {
  id: string;
  venueId: number;
  venueName: string;
  shortName: string;
  discount: string;
  bgColor: string;
  textColor: string;
  voucherTemplateId: string;
}

export const luckyWheelSegments: WheelSegment[] = [
  {
    id: "seg-1",
    venueId: 1,
    venueName: "KS Hoàng Nguyên",
    shortName: "Hoàng Nguyên",
    discount: "Giảm 15%",
    bgColor: "#047857", // emerald-700
    textColor: "#ffffff",
    voucherTemplateId: "V-DIA-01",
  },
  {
    id: "seg-2",
    venueId: 2,
    venueName: "Cơm Gà 52 Gia Hân",
    shortName: "Cơm Gà 52",
    discount: "Giảm 15%",
    bgColor: "#d97706", // amber-600
    textColor: "#ffffff",
    voucherTemplateId: "V-DIA-02",
  },
  {
    id: "seg-3",
    venueId: 3,
    venueName: "KS Lê Thức",
    shortName: "Lê Thức",
    discount: "Giảm 10%",
    bgColor: "#0284c7", // sky-600
    textColor: "#ffffff",
    voucherTemplateId: "V-GLD-01",
  },
  {
    id: "seg-4",
    venueId: 4,
    venueName: "Cơm Hương Quế",
    shortName: "Hương Quế",
    discount: "Giảm 10%",
    bgColor: "#b45309", // amber-700
    textColor: "#ffffff",
    voucherTemplateId: "V-GLD-02",
  },
  {
    id: "seg-5",
    venueId: 5,
    venueName: "KS Hoàng Điệp",
    shortName: "Hoàng Điệp",
    discount: "Giảm 10%",
    bgColor: "#4f46e5", // indigo-600
    textColor: "#ffffff",
    voucherTemplateId: "V-GLD-03",
  },
  {
    id: "seg-6",
    venueId: 7,
    venueName: "Star Coffee",
    shortName: "Star Coffee",
    discount: "Giảm 5%",
    bgColor: "#059669", // emerald-600
    textColor: "#ffffff",
    voucherTemplateId: "V-SLV-01",
  },
  {
    id: "seg-7",
    venueId: 8,
    venueName: "NN Hoa Phượng",
    shortName: "Hoa Phượng",
    discount: "Giảm 5%",
    bgColor: "#e11d48", // rose-600
    textColor: "#ffffff",
    voucherTemplateId: "V-SLV-02",
  },
  {
    id: "seg-8",
    venueId: 9,
    venueName: "Nhà nghỉ 79/99",
    shortName: "NN 79/99",
    discount: "Giảm 5%",
    bgColor: "#7c3aed", // violet-600
    textColor: "#ffffff",
    voucherTemplateId: "V-SLV-03",
  },
  {
    id: "seg-9",
    venueId: 6,
    venueName: "Cơm Thành Công",
    shortName: "Thành Công",
    discount: "Giảm 10%",
    bgColor: "#ea580c", // orange-600
    textColor: "#ffffff",
    voucherTemplateId: "V-GLD-04",
  },
  {
    id: "seg-10",
    venueId: 10,
    venueName: "Cafe Vườn Nhà Ai",
    shortName: "Vườn Nhà Ai",
    discount: "Giảm 5%",
    bgColor: "#15803d", // green-700
    textColor: "#ffffff",
    voucherTemplateId: "V-SLV-04",
  },
];

/**
 * Sinh voucher cho người chơi khi trúng trên Vòng quay may mắn
 */
export function generateWheelVoucher(segmentIndex: number): Voucher {
  const seg = luckyWheelSegments[segmentIndex] || luckyWheelSegments[0];
  const template =
    vouchers.find((v) => v.id === seg.voucherTemplateId) || vouchers[0];
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    ...template,
    id: `WHEEL-VOUCHER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code: `${template.code}-W${randomSuffix}`,
    used: false,
  };
}

/**
 * Sinh ngẫu nhiên 1 voucher cho Quiz theo hạng Tier (cho điểm số >= 70%)
 */
export function generateRandomSingleVenueVoucher(tier: VoucherTier): Voucher {
  const eligible = vouchers.filter(
    (v) => v.tier === tier && !v.id.includes("TOP3")
  );
  const base =
    eligible.length > 0
      ? eligible[Math.floor(Math.random() * eligible.length)]
      : vouchers[0];
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    ...base,
    id: `QUIZ-VOUCHER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code: `${base.code}-Q${randomSuffix}`,
    used: false,
  };
}

/**
 * Lấy ngẫu nhiên 1 voucher trong hệ thống làm phần thưởng khi hoàn thành nhiệm vụ ngày.
 * Loại trừ các voucher được thưởng trong bảng xếp hạng (Special / Top 3).
 */
export function getRandomTaskRewardVoucher(): Voucher {
  const eligible = vouchers.filter(
    (v) => v.tier !== "Special" && !v.id.includes("TOP3") && !v.title.includes("Top 3")
  );
  const base = eligible[Math.floor(Math.random() * eligible.length)] || vouchers[0];
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return {
    ...base,
    id: `TASK-REWARD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    code: `${base.code}-${randomSuffix}`,
    used: false,
  };
}