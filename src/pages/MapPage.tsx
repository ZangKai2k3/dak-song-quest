import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  BookOpen,
  Calendar,
  Clock,
  Compass,
  ExternalLink,
  Hotel,
  MapPin,
  Phone,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { places } from "../data/places";
import {
  accommodations,
  accommodationPriceOverview,
  diningPlaces,
} from "../data/dakSongGuide";
import { weatherAtom } from "../state/store";
import { zmpSdk } from "../services/zmp-sdk";
import bgCamNang from "../assets/bg-cam-nang.png";

type HandbookTab = "destinations" | "accommodations" | "dining" | "tips";

const travelTips = [
  {
    title: "Thời điểm lý tưởng du lịch Đắk Song",
    content:
      "Từ tháng 11 đến tháng 4 năm sau là mùa khô lý tưởng nhất: trời trong xanh, ít mưa, nhiệt độ mát mẻ (18 - 26°C). Đặc biệt tháng 12 là mùa hoa dã quỳ vàng rực các cung đèo; tháng 2 - 3 là mùa hoa cà phê nở trắng muốt bạt ngàn cao nguyên.",
  },
  {
    title: "Di chuyển trên trục Quốc lộ 14",
    content:
      "Tuyến QL14 đi qua Đắk Song có đường thảm nhựa đẹp, nối liền TP. Gia Nghĩa (cách ~40km) và Đắk Lắk. Tuy nhiên cung đường có nhiều đoạn đèo dốc và sương mù sáng sớm/chiều muộn, du khách nên giữ tốc độ an toàn và kiểm tra phanh xe.",
  },
  {
    title: "Đặc sản nổi tiếng nên mua làm quà",
    content:
      "Đắk Song là 'thủ phủ hồ tiêu' với hạt tiêu Đắk Song cay nồng thơm lừng đạt chuẩn OCOP; Cà phê Robusta Đắk Song đậm đà hương đất đỏ bazan; Bơ sáp béo dẻo và măng le rừng tươi ngon.",
  },
  {
    title: "Trang phục và hành trang cần thiết",
    content:
      "Vùng cao nguyên Đắk Song có độ cao trung bình >800m so với mực nước biển, biên độ nhiệt ngày và đêm khá lớn. Bạn nên chuẩn bị áo khoác nhẹ, giày thể thao đi bộ thoải mái, kem chống nắng và ô/dù gấp gọn phòng những cơn mưa rào bất chợt.",
  },
];

export function MapPage() {
  const weather = useAtomValue(weatherAtom);

  const [activeTab, setActiveTab] = useState<HandbookTab>("destinations");

  const openUrl = (url: string) => {
    void zmpSdk.openWebview(url);
  };

  const filteredPlaces = places;
  const filteredAccommodations = accommodations;
  const filteredDining = diningPlaces;

  return (
    <div className="space-y-4">
      {/* ===== TIÊU ĐỀ PHẦN CẨM NANG (ẢNH NỀN SỐ 3) ===== */}
      <section
        className="rounded-2xl p-4 min-[375px]:p-5 border border-stone-200 shadow-2xs"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(210, 244, 14, 0.84) 0%, rgba(123, 175, 228, 0.92) 100%), url(${bgCamNang})`,
          backgroundPosition: "center 60%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="inline-block rounded-full bg-emerald-900/10 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900 border border-emerald-900/20 backdrop-blur-xs">
          CẨM NANG ĐẮK SONG
        </div>
        <h1 className="mt-1.5 text-base min-[360px]:text-[17px] min-[400px]:text-xl sm:text-2xl font-extrabold text-stone-950 whitespace-nowrap tracking-tight">
          Cẩm nang du lịch và khám phá
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
          Tổng hợp chi tiết điểm tham quan, bảng giá khách sạn, quán ăn ngon và kinh nghiệm du lịch thực tế tại Đắk Song.
        </p>
      </section>


      {/* 4 TAB CẨM NANG GỌN GÀNG */}
      <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-stone-100 p-1 shadow-2xs">
        <button
          onClick={() => setActiveTab("destinations")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg py-2 px-1 text-xs font-bold transition cursor-pointer ${
            activeTab === "destinations"
              ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <Compass size={14} />
          <span className="truncate">Điểm đến</span>
        </button>

        <button
          onClick={() => setActiveTab("accommodations")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg py-2 px-1 text-xs font-bold transition cursor-pointer ${
            activeTab === "accommodations"
              ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <Hotel size={14} />
          <span className="truncate">Lưu trú</span>
        </button>

        <button
          onClick={() => setActiveTab("dining")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg py-2 px-1 text-xs font-bold transition cursor-pointer ${
            activeTab === "dining"
              ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <UtensilsCrossed size={14} />
          <span className="truncate">Quán ăn</span>
        </button>

        <button
          onClick={() => setActiveTab("tips")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-lg py-2 px-1 text-xs font-bold transition cursor-pointer ${
            activeTab === "tips"
              ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
              : "text-stone-600 hover:text-stone-900"
          }`}
        >
          <BookOpen size={14} />
          <span className="truncate">Kinh nghiệm</span>
        </button>
      </div>

      {/* TAB 1: ĐIỂM THAM QUAN & DANH THẮNG */}
      {activeTab === "destinations" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-white border border-stone-200 px-3 py-2 text-xs shadow-2xs">
            <span className="font-bold text-stone-700">
              Tổng hợp <b className="text-emerald-900 font-extrabold">{filteredPlaces.length} điểm đến nổi bật</b> tại Đắk Song
            </span>
          </div>

          {weather?.type === "rainy" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950 font-medium leading-relaxed">
              <b>Lưu ý thời tiết:</b> Đắk Song đang có mưa. Ưu tiên điểm văn hóa, cà phê trong nhà hoặc chùa/thiền viện.
            </div>
          )}
            {filteredPlaces.map((place) => {
              const hasPhone = Boolean(place.phone && place.phone !== "Đang cập nhật");
              return (
                <div
                  key={place.id}
                  className="z-card p-4 bg-white space-y-3 border border-stone-200 shadow-2xs hover:shadow-xs transition"
                >
                  {/* Tiêu đề & Loại hình */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <h3 className="font-extrabold text-stone-950 text-base sm:text-lg">
                        {place.name}
                      </h3>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-900">
                        {place.type}
                      </span>
                    </div>

                    {place.highlight && (
                      <div className="mt-1 text-xs text-emerald-800 font-semibold">
                        {place.highlight}
                      </div>
                    )}

                    <p className="mt-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  {/* Thông số thực tế: Địa chỉ, SĐT, Giờ mở cửa, Giá vé */}
                  <div className="rounded-xl bg-stone-50 p-3 text-xs space-y-2 border border-stone-200/80">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                      <span className="text-stone-800 leading-relaxed font-medium">
                        <b className="font-bold text-stone-900">Địa chỉ:</b> {place.address}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                      <span className="text-stone-800 font-medium">
                        <b className="font-bold text-stone-900">Giờ mở cửa:</b> {place.openHours}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Ticket size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                      <span className="text-stone-800 font-medium">
                        <b className="font-bold text-stone-900">Mức giá / Vé:</b>{" "}
                        <span className="text-emerald-900 font-bold">{place.ticketPrice}</span>
                      </span>
                    </div>

                    {hasPhone && (
                      <div className="flex items-start gap-2">
                        <Phone size={14} className="text-emerald-800 shrink-0 mt-0.5" />
                        <span className="text-stone-800 font-medium">
                          <b className="font-bold text-stone-900">Số điện thoại:</b>{" "}
                          <button
                            onClick={() => void zmpSdk.openPhone(place.phone)}
                            className="text-emerald-900 font-bold underline hover:text-emerald-950 cursor-pointer text-left"
                          >
                            {place.phone}
                          </button>
                        </span>
                      </div>
                    )}

                    {place.weatherTip && (
                      <div className="mt-1 border-t border-stone-200/60 pt-1.5 text-[11px] text-stone-600 leading-relaxed">
                        <b className="text-stone-800 font-bold">Lưu ý du lịch:</b> {place.weatherTip}
                      </div>
                    )}
                  </div>

                  {/* Nút thao tác: Google Maps & Hotline */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      onClick={() => openUrl(place.mapsUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-900 active:scale-98"
                    >
                      <ExternalLink size={13} /> Chỉ đường Google Maps
                    </button>
                    {hasPhone && (
                      <button
                        onClick={() => void zmpSdk.openPhone(place.phone)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-800 transition hover:bg-stone-50 active:scale-98 cursor-pointer"
                      >
                        <Phone size={13} className="text-emerald-800" /> Gọi liên hệ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* ======================================================== */}
      {/* TAB 2: CƠ SỞ LƯU TRÚ (KHÁCH SẠN / NHÀ NGHỈ)               */}
      {/* ======================================================== */}
      {activeTab === "accommodations" && (
        <div className="space-y-2.5">
          {/* TỔNG QUAN GIÁ LƯU TRÚ */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 shadow-2xs">
            <h3 className="font-extrabold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Hotel size={15} className="text-amber-800 shrink-0" />
              <span>Mặt bằng chung giá lưu trú tại Đắk Song</span>
            </h3>
            <p className="mt-0.5 text-[11px] text-stone-600 leading-relaxed">
              {accommodationPriceOverview.description}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2 border border-amber-200/80">
                <span className="text-stone-500 font-medium">Theo giờ:</span>
                <div className="font-black text-amber-900 mt-0.5">{accommodationPriceOverview.hourly}</div>
              </div>
              <div className="rounded-lg bg-white p-2 border border-amber-200/80">
                <span className="text-stone-500 font-medium">Qua đêm:</span>
                <div className="font-black text-emerald-900 mt-0.5">{accommodationPriceOverview.overnight}</div>
              </div>
            </div>
          </div>

          {filteredAccommodations.map((hotel) => (
            <div key={hotel.id} className="z-card p-3.5 bg-white">
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-amber-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                      {hotel.type}
                    </span>
                    {hotel.operatingHours && (
                      <span className="text-[11px] text-stone-500">
                        • {hotel.operatingHours}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-stone-900">
                    {hotel.name}
                  </h4>
                </div>
              </div>

              <div className="mt-2 space-y-1.5 text-xs text-stone-700">
                <div className="flex items-start gap-1.5 text-stone-500">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-stone-400" />
                  <span>{hotel.address}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="shrink-0 text-emerald-700" />
                  <span>SĐT: <b className="font-bold text-stone-900">{hotel.phone}</b></span>
                </div>

                {/* Giá phòng */}
                <div className="rounded-lg bg-stone-50 p-2 text-stone-800 border border-stone-100">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nghỉ theo giờ:</span>
                    <span className="font-bold text-emerald-900">{hotel.priceHourly}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200/60 pt-1 mt-1">
                    <span className="text-stone-500">Nghỉ qua đêm:</span>
                    <span className="font-bold text-emerald-900">{hotel.priceOvernight}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 italic">
                  "{hotel.note}"
                </p>
              </div>

              {/* Nút hành động */}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-2 text-xs">
                <button
                  onClick={() => void zmpSdk.openPhone(hotel.phone)}
                  className="flex items-center justify-center gap-1 rounded-lg bg-emerald-800 py-2 font-bold text-white transition hover:bg-emerald-900 cursor-pointer"
                >
                  <Phone size={12} /> Gọi đặt phòng
                </button>
                <button
                  onClick={() => openUrl(hotel.mapsUrl)}
                  className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 py-2 font-bold text-stone-800 transition hover:bg-stone-100"
                >
                  <ExternalLink size={12} /> Chỉ đường
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: QUÁN ĂN & CÀ PHÊ (ĐÃ ĐỔI THÀNH "QUÁN ĂN")         */}
      {/* ======================================================== */}
      {activeTab === "dining" && (
        <div className="space-y-2.5">
          <div className="rounded-xl border border-stone-200 bg-white p-2.5 text-xs text-stone-700 shadow-2xs font-medium">
            Tổng hợp các quán ăn ngon và quán cà phê nổi bật tại Đắk Song kèm giờ mở cửa và liên kết bản đồ.
          </div>

          {filteredDining.map((dine) => {
            const hasPhone = dine.phone && !dine.phone.includes("cập nhật");
            return (
              <div key={dine.id} className="z-card p-3.5 bg-white">
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        {dine.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Clock size={11} className="text-emerald-800" />
                        <span>{dine.openHours}</span>
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-stone-900">
                      {dine.name}
                    </h4>
                  </div>
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-start gap-1.5 text-stone-500">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                    <span>{dine.address}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="shrink-0 text-emerald-800" />
                    <span>SĐT: <b className="font-bold text-stone-900">{dine.phone}</b></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Ticket size={12} className="shrink-0 text-emerald-800" />
                    <span>Mức giá: <b className="font-bold text-emerald-900">{dine.priceRange}</b></span>
                  </div>

                  {dine.highlight && (
                    <p className="mt-1 rounded-lg bg-stone-50 p-2 text-[11px] text-stone-600">
                      {dine.highlight}
                    </p>
                  )}
                </div>

                {/* Nút hành động */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-100 pt-2 text-xs">
                  {hasPhone ? (
                    <button
                      onClick={() => void zmpSdk.openPhone(dine.phone)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-emerald-800 py-2 font-bold text-white transition hover:bg-emerald-900 cursor-pointer"
                    >
                      <Phone size={12} /> Gọi quán
                    </button>
                  ) : (
                    <button
                      onClick={() => openUrl(dine.mapsUrl)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 py-2 font-semibold text-stone-700"
                    >
                      Trực tiếp QL14
                    </button>
                  )}

                  <button
                    onClick={() => openUrl(dine.mapsUrl)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 py-2 font-bold text-stone-800 transition hover:bg-stone-100"
                  >
                    <ExternalLink size={12} /> Chi tiết & chỉ đường
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KINH NGHIỆM DU LỊCH BỎ TÚI (HOÀN THIỆN CẨM NANG) */}
      {/* ======================================================== */}
      {activeTab === "tips" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-stone-200 bg-white p-2.5 text-xs text-stone-700 shadow-2xs flex items-center gap-1.5 font-bold text-emerald-900">
            <Calendar size={14} className="shrink-0" />
            <span>Sổ tay kinh nghiệm du lịch Đắk Song thực tế bỏ túi</span>
          </div>

          <div className="space-y-2.5">
            {travelTips.map((tip, idx) => (
              <div key={idx} className="z-card p-3.5 bg-white">
                <h4 className="font-bold text-stone-900 text-sm">
                  {idx + 1}. {tip.title}
                </h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                  {tip.content}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 text-center">
            <h5 className="font-bold text-stone-900 text-sm">Cần thêm thông tin du lịch?</h5>
            <p className="mt-1 text-xs text-stone-500">
              Bạn có thể truy cập Cổng thông tin du lịch chính thức của huyện Đắk Song.
            </p>
            <button
              onClick={() => void zmpSdk.openWebview("https://dulichdaksong.vnasw.vn/")}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-900"
            >
              <ExternalLink size={13} /> Cổng du lịch Đắk Song
            </button>
          </div>
        </div>
      )}
    </div>
  );
}