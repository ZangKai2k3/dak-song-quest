import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import { Sparkles, Ticket, CheckCircle2, Clock } from "lucide-react";
import { claimedVouchersAtom, isLuckyWheelOpenAtom, luckySpinsAtom } from "../state/store";
import { VoucherCard } from "../components/VoucherCard";
import bgVouchers from "../assets/bg-vouchers.png";

export function Vouchers() {
  const claimed = useAtomValue(claimedVouchersAtom);
  const luckySpins = useAtomValue(luckySpinsAtom);
  const [, setIsWheelOpen] = useAtom(isLuckyWheelOpenAtom);
  const [filterTab, setFilterTab] = useState<"all" | "unused" | "used">("unused");

  const unusedCount = claimed.filter((v) => !v.used).length;
  const usedCount = claimed.filter((v) => v.used).length;

  const filtered = claimed.filter((v) => {
    if (filterTab === "unused") return !v.used;
    if (filterTab === "used") return v.used;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ===== HEADER KHO VOUCHER ===== */}
      <section
        className="rounded-2xl p-5 text-white shadow-sm border border-rose-900/30"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(153, 27, 27, 0.88) 0%, rgba(185, 28, 28, 0.75) 100%), url(${bgVouchers})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold text-white border border-white/30 backdrop-blur-xs">
          KHO VOUCHER ƯU ĐÃI
        </div>
        <h1 className="mt-1.5 text-xl font-black text-white sm:text-2xl drop-shadow-xs">
          Kho voucher của bạn
        </h1>
        <p className="mt-1 text-xs text-rose-100 font-medium">
          Bạn đang có <b className="text-amber-200 font-black text-sm">{unusedCount} voucher khả dụng</b>
        </p>
      </section>

      {/* ===== BANNER VÒNG QUAY MAY MẮN ===== */}
      <section className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-3.5 text-stone-950 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🎡</span>
          <div>
            <div className="font-black text-xs sm:text-sm">Vòng quay may mắn Đắk Song</div>
            <div className="text-[11px] font-medium text-stone-900">
              Bạn có <b>{luckySpins} lượt quay</b> để nhận thêm voucher cơ sở
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsWheelOpen(true)}
          className="shrink-0 rounded-xl bg-stone-950 px-3.5 py-2 text-xs font-black text-amber-300 transition hover:bg-stone-900 active:scale-95 shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Sparkles size={13} />
          <span>Quay ngay ({luckySpins})</span>
        </button>
      </section>

      {claimed.length === 0 ? (
        <div className="z-card p-6 text-center bg-white">
          <h2 className="text-base font-bold text-stone-900">Bạn chưa có voucher nào</h2>
          <p className="mt-1.5 text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            Hãy tham gia Quiz Đắk Song hoặc thử vận may tại <b>Vòng quay may mắn</b> để nhận voucher ưu đãi áp dụng tại khách sạn hoặc quán ăn thực tế ở Đắk Song.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setIsWheelOpen(true)}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 transition hover:bg-amber-400 cursor-pointer"
            >
              🎡 Vòng quay may mắn
            </button>
            <Link
              to="/quiz"
              className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-900 cursor-pointer"
            >
              Chơi quiz nhận voucher
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* TABS LỌC TRẠNG THÁI VOUCHER */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                filterTab === "all"
                  ? "bg-white text-emerald-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Ticket size={13} />
              <span>Tất cả ({claimed.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("unused")}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                filterTab === "unused"
                  ? "bg-white text-emerald-900 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Clock size={13} />
              <span>Khả dụng ({unusedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("used")}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                filterTab === "used"
                  ? "bg-white text-red-700 shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Đã dùng ({usedCount})</span>
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="z-card p-6 text-center text-xs text-stone-500 bg-white">
              Không có voucher nào trong mục này.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((v) => (
                <VoucherCard key={v.id} voucher={v} claimed />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}