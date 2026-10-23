import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Gift,
  Hotel,
  MapPin,
  Phone,
  Ticket,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { weatherAtom, completedTaskIdsAtom } from "../state/store";
import { useEffect, useMemo, useState } from "react";
import { getDakSongWeather } from "../services/weather";
import { WeatherCard } from "../components/WeatherCard";
import { getDailyTasksForDate } from "../data/tasks";
import { zmpSdk } from "../services/zmp-sdk";
import { accommodations, diningPlaces, accommodationPriceOverview } from "../data/dakSongGuide";
import bgHeroHome from "../assets/bg-hero-home.jpg";

let memoryIntroShown = false;

function getHasShownIntro(): boolean {
  if (memoryIntroShown) return true;
  try {
    return sessionStorage.getItem("dak_song_intro_shown") === "true";
  } catch {
    return false;
  }
}

function setHasShownIntro(): void {
  memoryIntroShown = true;
  try {
    sessionStorage.setItem("dak_song_intro_shown", "true");
  } catch {
    // ignore
  }
}

export function Home() {
  const [weather, setWeather] = useAtom(weatherAtom);
  const completed = useAtomValue(completedTaskIdsAtom);
  const currentDailyTasks = useMemo(() => getDailyTasksForDate(), []);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  // Chỉ hiển thị popup giới thiệu một lần duy nhất khi người dùng mở vào app
  const [showIntro, setShowIntro] = useState(() => !getHasShownIntro());
  const [serviceTab, setServiceTab] = useState<"all" | "stay" | "dine">("all");

  const dismissIntro = () => {
    setHasShownIntro();
    setShowIntro(false);
  };

  const exploreDakSong = async () => {
    setHasShownIntro();
    setShowIntro(false);
    await zmpSdk.openWebview("https://dulichdaksong.vnasw.vn/");
  };

  const loadWeather = async (showLoading = true) => {
    if (showLoading) setLoadingWeather(true);
    setWeatherError(null);
    try {
      const result = await getDakSongWeather();
      setWeather(result);
    } catch {
      setWeatherError("Không thể tải thời tiết lúc này.");
    } finally {
      if (showLoading) setLoadingWeather(false);
    }
  };

  useEffect(() => {
    // Luôn tải dữ liệu thời tiết thời gian thực mới nhất khi mở trang
    void loadWeather(!weather);

    // Chu kỳ tự động đồng bộ thời gian thực mỗi 60 giây
    const timer = window.setInterval(() => {
      void loadWeather(false);
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div className="space-y-4">
        {/* ===== HERO BANNER ĐẮK SONG - THIẾT KẾ ĐƠN GIẢN NATIVE MINI APP ===== */}
        <section
          className="overflow-hidden rounded-2xl p-4 min-[375px]:p-5 text-white shadow-sm border border-emerald-950/20"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(20, 83, 45, 0.85) 100%), url(${bgHeroHome})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Logo Đắk Song chính */}
            <div className="shrink-0 flex justify-center">
              <img
                src="./logo-dak-song.png"
                alt="Logo Huyện Đắk Song"
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain rounded-full bg-white p-1 border-2 border-white/50 shadow-sm"
              />
            </div>

            {/* Nội dung căn giữa trên điện thoại */}
            <div className="flex-1 text-center sm:text-left">
              {/* Đã bỏ icon theo yêu cầu */}
              <div className="inline-block rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white tracking-wide">
                MINI GAME DU LỊCH ĐẮK SONG
              </div>

              <h1 className="mt-2 font-black leading-tight text-white">
                <span className="block text-xl min-[360px]:text-2xl min-[410px]:text-[26px] sm:text-3xl whitespace-nowrap tracking-tight">
                  Khám phá Đắk Song
                </span>
                <span className="block text-sm min-[360px]:text-base min-[410px]:text-xl sm:text-2xl whitespace-nowrap text-amber-300 font-extrabold mt-1 tracking-tight">
                  chơi vui nhận voucher!
                </span>
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-emerald-50 leading-relaxed max-w-lg mx-auto sm:mx-0">
                Tìm hiểu thiên nhiên, văn hóa M’Nông, ẩm thực địa phương. Mở khóa điểm đến và nhận voucher lưu trú & ăn uống tại Đắk Song.
              </p>

              {/* Nút thao tác căn giữa ở điện thoại */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 w-full">
                <Link
                  to="/quiz"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-stone-900 shadow-xs transition hover:bg-amber-300 active:scale-98 w-full sm:w-auto max-w-xs"
                >
                  Bắt đầu quiz <ArrowRight size={15} />
                </Link>

                <button
                  onClick={() => void exploreDakSong()}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/25 active:scale-98 w-full sm:w-auto max-w-xs"
                >
                  <ExternalLink size={15} /> Cổng du lịch Đắk Song
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ===== THỜI TIẾT ĐẮK SONG ===== */}
        <WeatherCard
          weather={weather}
          loading={loadingWeather}
          error={weatherError}
          onRefresh={() => void loadWeather()}
        />

        {/* ===== NHIỆM VỤ HÔM NAY (ĐẶT TRÊN DỊCH VỤ TẠI ĐẮK SONG) ===== */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">Nhiệm vụ hôm nay</h2>
            <span className="text-xs font-medium text-stone-500">
              {completed.length}/{currentDailyTasks.length} hoàn thành
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {currentDailyTasks.map((task) => {
              const done = completed.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`z-card p-3.5 bg-white ${done ? "border-emerald-300 bg-emerald-50/40" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-stone-900 text-sm">
                      {task.title}
                    </div>
                    {done ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        Đã nhận +1 Lượt quay
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                        Đang làm
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-stone-600">{task.description}</div>
                  <div className="mt-2 text-xs font-semibold text-emerald-900 flex items-center gap-1">
                    <Gift size={13} className="shrink-0 text-amber-700" />
                    <span>Thưởng: {task.reward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== DỊCH VỤ TẠI ĐẮK SONG - GOM TRONG MỘT PHẦN THỐNG NHẤT ===== */}
        <section className="z-card overflow-hidden bg-white border border-stone-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-stone-900">Dịch vụ tại Đắk Song</h2>
              <p className="text-xs text-stone-500">Khách sạn, nhà nghỉ & quán ăn thực tế</p>
            </div>
            <Link
              to="/map"
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {/* MẶT BẰNG GIÁ LƯU TRÚ ĐẮK SONG - CỐ ĐỊNH Ở ĐẦU PHẦN DỊCH VỤ */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
              <Hotel size={15} className="text-amber-800 shrink-0" />
              <span>Mặt bằng giá lưu trú Đắk Song:</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-800 font-medium">
              <span>Theo giờ: <b className="font-extrabold text-emerald-900">{accommodationPriceOverview.hourly}</b></span>
              <span>Qua đêm: <b className="font-extrabold text-emerald-900">{accommodationPriceOverview.overnight}</b></span>
            </div>
          </div>

          {/* TABS CHỌN NHANH */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setServiceTab("all")}
              className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                serviceTab === "all" ? "bg-white text-emerald-900 shadow-2xs font-extrabold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setServiceTab("stay")}
              className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                serviceTab === "stay" ? "bg-white text-emerald-900 shadow-2xs font-extrabold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Khách sạn
            </button>
            <button
              type="button"
              onClick={() => setServiceTab("dine")}
              className={`py-1.5 px-2 rounded-lg transition cursor-pointer text-center ${
                serviceTab === "dine" ? "bg-white text-emerald-900 shadow-2xs font-extrabold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Quán ăn
            </button>
          </div>

          {/* VÙNG CUỘN DANH SÁCH: KHI KÉO XEM THÌ MẶT BẰNG GIÁ Ở TRÊN VẪN LUÔN HIỂN THỊ */}
          <div className="max-h-[380px] sm:max-h-[440px] overflow-y-auto space-y-3 pr-1">
            {/* Danh sách Khách sạn */}
            {(serviceTab === "all" || serviceTab === "stay") &&
              accommodations.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-xl border border-stone-200 p-3 bg-stone-50/40 space-y-2.5">
                  <div className="flex items-center justify-between gap-1 border-b border-stone-200/60 pb-1.5">
                    <span className="rounded bg-amber-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                      {item.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Clock size={11} className="text-emerald-800" />
                      <span>{item.operatingHours || "24/24"}</span>
                    </span>
                  </div>

                  <h4 className="font-extrabold text-stone-900 text-sm leading-snug">{item.name}</h4>

                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                      <span className="line-clamp-1">{item.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="shrink-0 text-emerald-800" />
                      <span>SĐT: <b className="font-bold text-stone-900">{item.phone}</b></span>
                    </div>
                  </div>

                  {/* Giá phòng */}
                  <div className="rounded-lg bg-white p-2 text-xs text-stone-800 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center gap-1">
                        <Ticket size={12} className="text-emerald-800" /> Theo giờ:
                      </span>
                      <span className="font-extrabold text-emerald-900">{item.priceHourly}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-100 pt-1">
                      <span className="text-stone-500 flex items-center gap-1">
                        <Ticket size={12} className="text-emerald-800" /> Qua đêm:
                      </span>
                      <span className="font-extrabold text-emerald-900">{item.priceOvernight}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-stone-200/60 pt-2 text-xs">
                    <button
                      onClick={() => void zmpSdk.openPhone(item.phone)}
                      className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                    >
                      <Phone size={12} /> Gọi đặt phòng
                    </button>
                    <a
                      href={item.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950"
                    >
                      <ExternalLink size={12} /> Chi tiết & chỉ đường
                    </a>
                  </div>
                </div>
              ))}

            {/* Danh sách Quán ăn */}
            {(serviceTab === "all" || serviceTab === "dine") &&
              diningPlaces.slice(0, 3).map((item) => {
                const hasPhone = item.phone && !item.phone.includes("cập nhật");
                return (
                  <div key={item.id} className="rounded-xl border border-stone-200 p-3 bg-stone-50/40 space-y-2.5">
                    <div className="flex items-center justify-between gap-1 border-b border-stone-200/60 pb-1.5">
                      <span className="rounded bg-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Clock size={11} className="text-emerald-800" />
                        <span>{item.openHours}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-stone-900 text-sm leading-snug">{item.name}</h4>

                    <div className="space-y-1 text-xs text-stone-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-emerald-800" />
                        <span className="line-clamp-1">{item.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="shrink-0 text-emerald-800" />
                        <span>SĐT: <b className="font-bold text-stone-900">{item.phone}</b></span>
                      </div>
                    </div>

                    {/* Mức giá */}
                    <div className="rounded-lg bg-white p-2 text-xs text-stone-800 border border-stone-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 flex items-center gap-1">
                          <Ticket size={12} className="text-emerald-800" /> Mức giá:
                        </span>
                        <span className="font-extrabold text-emerald-900">{item.priceRange}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-200/60 pt-2 text-xs">
                      {hasPhone ? (
                        <button
                          onClick={() => void zmpSdk.openPhone(item.phone)}
                          className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                        >
                          <Phone size={12} /> Gọi quán
                        </button>
                      ) : (
                        <span className="text-stone-500 text-[11px]">Trực tiếp tại QL14</span>
                      )}
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950"
                      >
                        <ExternalLink size={12} /> Chi tiết & chỉ đường
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      {/* ===== POPUP GIỚI THIỆU (CHỈ XUẤT HIỆN 1 LẦN KHI MỞ VÀO ỨNG DỤNG) ===== */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-amber-950 p-5 text-white text-center sm:text-left">
              <div className="flex justify-center sm:justify-start">
                <img
                  src="./logo-dak-song.png"
                  alt="Logo Đắk Song"
                  className="h-16 w-16 rounded-full bg-white p-1 shadow-md border-2 border-white/60"
                />
              </div>
              <div className="mt-3 text-xs font-black text-amber-300 uppercase tracking-wide">
                Chào mừng đến với Đắk Song
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-black text-white leading-tight">
                Cổng thông tin du lịch Đắk Song
              </h2>
              <p className="mt-1.5 text-xs text-emerald-100/90 leading-relaxed font-medium">
                Tìm hiểu cảnh đẹp thác nước, rừng thông, cắm trại, văn hóa bản địa, ẩm thực đặc sản và săn voucher du lịch độc quyền.
              </p>
            </div>

            <div className="space-y-2.5 p-4 bg-stone-50/50">
              <button
                onClick={() => void exploreDakSong()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 px-4 py-3 text-xs font-black text-white shadow-md transition cursor-pointer active:scale-98"
              >
                <ExternalLink size={15} /> Khám phá Website Du Lịch Đắk Song
              </button>

              <button
                onClick={dismissIntro}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white hover:bg-stone-100 py-2.5 text-xs font-bold text-stone-700 transition cursor-pointer active:scale-98"
              >
                Vào ứng dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
