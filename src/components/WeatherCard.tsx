import {
  AlertCircle,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  LoaderCircle,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import type { Weather } from "../types";

export function WeatherCard({
  weather,
  loading,
  error,
  onRefresh,
}: {
  weather: Weather | null;
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
}) {
  if (loading && !weather) {
    return (
      <div className="z-card flex items-center justify-center gap-3 p-8 min-h-[160px]">
        <LoaderCircle className="animate-spin text-emerald-800" size={22} />
        <span className="text-sm font-medium text-stone-700">
          Đang cập nhật thời tiết Đắk Song...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="z-card border border-stone-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-amber-700 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-stone-900">Không thể kết nối thời tiết</h4>
            <p className="mt-1 text-xs text-stone-600 leading-relaxed">
              Vui lòng kiểm tra kết nối mạng và bấm thử lại.
            </p>
            <button
              onClick={onRefresh}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              <RefreshCw size={13} /> Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const Icon = weather.type === "rainy" ? CloudRain : weather.type === "cloudy" ? CloudSun : Sun;

  return (
    <div className="z-card overflow-hidden bg-white">
      {/* Tiêu đề mục thời tiết Đắk Song */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 bg-stone-50/70">
        <div className="flex items-center gap-2">
          <Icon size={19} className="text-amber-700 shrink-0" />
          <span className="font-bold text-sm text-stone-900">Thời tiết Đắk Song</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Nhiệt độ chính & cảm nhận, nút làm mới */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {weather.temperature}°C
              </span>
              {weather.apparentTemperature !== undefined && (
                <span className="text-xs font-bold text-stone-500">
                  (Cảm nhận {weather.apparentTemperature}°C)
                </span>
              )}
            </div>
            {weather.tempMax !== undefined && weather.tempMin !== undefined && (
              <div className="mt-0.5 text-xs font-semibold text-stone-600">
                Biên độ hôm nay: <b className="text-stone-900">{weather.tempMin}°C – {weather.tempMax}°C</b>
              </div>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-100 active:scale-95 shadow-2xs disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-emerald-800" : ""} />
            <span>{loading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        </div>

        {/* Mô tả tình trạng thời tiết */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm font-semibold text-stone-800">
            Trạng thái: <span className="font-extrabold text-emerald-900">{weather.description}</span>
          </p>
          {weather.updatedAt && (
            <span className="text-[11px] text-stone-400">
              Cập nhật {weather.updatedAt}
            </span>
          )}
        </div>

        {/* 4 thông số chi tiết chuẩn dubaothoitiet.edu.vn: Độ ẩm, Gió, Điểm ngưng, Chỉ số UV */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
          <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-stone-500">
              <Droplets size={12} className="text-blue-600" /> Độ ẩm
            </div>
            <div className="mt-1 font-extrabold text-stone-900 text-sm">{weather.humidity}%</div>
          </div>

          <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-stone-500">
              <Wind size={12} className="text-emerald-700" /> Tốc độ gió
            </div>
            <div className="mt-1 font-extrabold text-stone-900 text-sm">
              {weather.windSpeed} m/s
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-stone-500">
              <Eye size={12} className="text-amber-700" /> Điểm ngưng
            </div>
            <div className="mt-1 font-extrabold text-stone-900 text-sm">
              {weather.dewPoint !== undefined ? `${weather.dewPoint}°C` : "24.6°C"}
            </div>
          </div>

          <div className="rounded-xl bg-stone-50 p-2 border border-stone-100">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-stone-500">
              <Sun size={12} className="text-amber-600" /> Chỉ số UV
            </div>
            <div className="mt-1 font-extrabold text-stone-900 text-sm">
              {weather.uvIndex !== undefined ? weather.uvIndex : "0.82"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}