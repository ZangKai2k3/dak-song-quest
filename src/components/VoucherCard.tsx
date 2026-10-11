import { useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, MapPin, Phone, ShieldCheck, Store, X } from "lucide-react";
import { useSetAtom } from "jotai";
import { claimedVouchersAtom } from "../state/store";
import type { Voucher } from "../types";
import { zmpSdk } from "../services/zmp-sdk";
import { apiFetch } from "../services/apiConfig";

export function VoucherCard({ voucher, claimed = false }: { voucher: Voucher; claimed?: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirmRedeem, setShowConfirmRedeem] = useState(false);
  const setClaimedVouchers = useSetAtom(claimedVouchersAtom);

  const mapsUrl =
    voucher.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(voucher.mapsQuery || voucher.placeName)}`;

  const copy = async () => {
    if (voucher.used) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(voucher.code);
        window.alert(`Đã sao chép mã voucher: ${voucher.code}`);
      } else {
        window.alert(`Mã voucher: ${voucher.code}`);
      }
    } catch {
      window.alert(`Mã voucher: ${voucher.code}`);
    }
  };

  const handleCall = () => {
    if (voucher.placePhone && !voucher.placePhone.includes("cập nhật")) {
      void zmpSdk.openPhone(voucher.placePhone);
    } else {
      window.alert("Số điện thoại cơ sở đang được cập nhật.");
    }
  };

  const handleConfirmRedeem = async () => {
    const timeStr = new Date().toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    setClaimedVouchers((prev) =>
      prev.map((item) =>
        item.id === voucher.id ? { ...item, used: true, usedAt: timeStr } : item
      )
    );
    setShowConfirmRedeem(false);

    // Đồng bộ xác nhận sử dụng voucher lên SQL Server Backend (tăng UsedCount trong Venues & Dashboard)
    try {
      await apiFetch("/api/vouchers/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherCode: voucher.code,
          venueName: voucher.placeName,
          discountPercent: parseInt(voucher.discount.replace(/\D/g, "")) || 15,
        }),
      });
    } catch (err) {
      console.warn("Lỗi đồng bộ sử dụng voucher lên server:", err);
    }
  };

  /**
   * Màu chuẩn theo từng hạng mức voucher:
   * - Diamond: Màu xanh tím kim cương (Indigo - Purple)
   * - Gold: Màu vàng kim hổ phách (Amber Gold)
   * - Silver: Màu xám bạc thanh lịch (Slate Silver)
   * - Special: Màu đỏ sẫm hoàng gia (Ruby Red)
   */
  const getTierConfig = (tier: Voucher["tier"]) => {
    switch (tier) {
      case "Diamond":
        return {
          headerBg: "bg-gradient-to-r from-indigo-700 to-purple-800 text-white",
          tierBadge: "bg-white/20 text-white border border-white/30",
          cardBorder: "border-indigo-200",
          discountBg: "bg-indigo-50 text-indigo-900 border-indigo-200",
          label: "HẠNG KIM CƯƠNG",
        };
      case "Gold":
        return {
          headerBg: "bg-gradient-to-r from-amber-600 to-yellow-700 text-white",
          tierBadge: "bg-white/20 text-white border border-white/30",
          cardBorder: "border-amber-200",
          discountBg: "bg-amber-50 text-amber-900 border-amber-200",
          label: "HẠNG VÀNG",
        };
      case "Silver":
        return {
          headerBg: "bg-gradient-to-r from-slate-600 to-zinc-700 text-white",
          tierBadge: "bg-white/20 text-white border border-white/30",
          cardBorder: "border-slate-200",
          discountBg: "bg-slate-50 text-slate-900 border-slate-200",
          label: "HẠNG BẠC",
        };
      case "Special":
      default:
        return {
          headerBg: "bg-gradient-to-r from-rose-800 to-red-900 text-white",
          tierBadge: "bg-white/20 text-white border border-white/30",
          cardBorder: "border-rose-200",
          discountBg: "bg-rose-50 text-rose-900 border-rose-200",
          label: "TOP 5 TUẦN",
        };
    }
  };

  const config = getTierConfig(voucher.tier);
  const hasPhone = Boolean(voucher.placePhone && !voucher.placePhone.includes("cập nhật"));

  return (
    <>
      {/* ===== GIAO DIỆN TỐI GIẢN NGOÀI DANH SÁCH (COMPACT CARD) ===== */}
      <div
        onClick={() => setShowDetail(true)}
        className={`z-card relative overflow-hidden border ${
          voucher.used ? "border-stone-300 bg-stone-50/80 opacity-75" : `${config.cardBorder} bg-white`
        } shadow-2xs transition hover:shadow-sm active:scale-[0.99] cursor-pointer`}
      >
        {/* Dấu mộc đỏ đóng góc nếu đã sử dụng */}
        {voucher.used && (
          <div className="absolute right-3 top-3 rotate-[-10deg] rounded border-2 border-red-600 bg-red-50/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-600 shadow-2xs pointer-events-none z-10">
            ✓ ĐÃ SỬ DỤNG
          </div>
        )}

        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider ${
                voucher.used ? "bg-stone-200 text-stone-700 border border-stone-300" : `${config.discountBg} border`
              }`}
            >
              {config.label}
            </span>
            <span
              className={`text-base font-black tracking-tight ${
                voucher.used ? "text-stone-400 line-through" : "text-emerald-900"
              }`}
            >
              {voucher.discount}
            </span>
          </div>

          <div>
            <div className={`font-extrabold text-sm leading-snug line-clamp-1 ${voucher.used ? "text-stone-700" : "text-stone-900"}`}>
              {voucher.placeName}
            </div>
            <div className="text-xs text-stone-600 line-clamp-1 mt-0.5">
              {voucher.title}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-[11px]">
            {voucher.used ? (
              <span className="text-red-700 font-bold truncate">
                Đã dùng: {voucher.usedAt || "Tại cơ sở"}
              </span>
            ) : (
              <span className="text-stone-500">
                HSD: <b className="text-stone-700 font-semibold">{new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}</b>
              </span>
            )}
            <span className={`font-bold flex items-center gap-0.5 ${voucher.used ? "text-stone-500" : "text-emerald-800"}`}>
              Xem chi tiết ➔
            </span>
          </div>
        </div>
      </div>

      {/* ===== MODAL POPUP CHI TIẾT VOUCHER (HIỂN THỊ KHI NHẤP VÀO) ===== */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header chi tiết */}
            <div className={`px-4 py-3.5 ${voucher.used ? "bg-stone-700 text-white" : config.headerBg} flex items-start justify-between gap-2`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${config.tierBadge}`}>
                    {config.label}
                  </span>
                  <span className={`text-base font-black tracking-tight ${voucher.used ? "line-through opacity-80" : ""}`}>
                    {voucher.discount}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold tracking-tight leading-snug">
                  {voucher.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="shrink-0 rounded-full bg-white/20 p-1 text-white hover:bg-white/30 transition cursor-pointer"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {/* KHUNG MÃ CODE ƯU ĐÃI & SAO CHÉP */}
              <div
                className={`relative overflow-hidden rounded-xl border border-dashed p-3 text-center ${
                  voucher.used
                    ? "border-red-300 bg-red-50/50"
                    : "border-stone-300 bg-stone-50"
                }`}
              >
                {/* Dấu mộc to chìm giữa khung nếu đã dùng */}
                {voucher.used && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="rotate-[-10deg] rounded-xl border-3 border-red-600 bg-white/90 px-4 py-1 text-xl font-black uppercase tracking-widest text-red-600 shadow-md">
                      ✓ ĐÃ SỬ DỤNG
                    </span>
                  </div>
                )}

                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Mã voucher ưu đãi {voucher.used ? "(Đã vô hiệu hóa)" : ""}
                </div>
                <div
                  className={`mt-1 font-mono text-xl sm:text-2xl font-black tracking-wider ${
                    voucher.used ? "text-stone-400 line-through select-none" : "text-stone-900 select-all"
                  }`}
                >
                  {voucher.code}
                </div>

                {!voucher.used ? (
                  <button
                    onClick={copy}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-900 active:scale-95 cursor-pointer shadow-2xs"
                  >
                    <Copy size={13} /> Sao chép mã
                  </button>
                ) : (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-stone-200 px-3.5 py-1.5 text-xs font-bold text-stone-500">
                    <Check size={13} /> Mã đã áp dụng tại cơ sở
                  </div>
                )}
              </div>

              {/* KHỐI XÁC NHẬN DÀNH CHO NHÂN VIÊN QUÁN (OFFLINE VERIFICATION) */}
              {claimed && (
                <>
                  {!voucher.used ? (
                    <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/70 p-3.5 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs">
                        <Store size={16} className="text-amber-800 shrink-0" />
                        <span>Dành cho nhân viên thu ngân tại quán / khách sạn</span>
                      </div>
                      <p className="text-[11px] text-stone-700 leading-relaxed font-medium">
                        Xuất trình màn hình này cho nhân viên khi thanh toán để nhân viên bấm xác nhận áp dụng ưu đãi vào hóa đơn.
                      </p>
                      <button
                        onClick={() => setShowConfirmRedeem(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 py-3 px-4 text-xs font-black text-white shadow-sm hover:brightness-105 active:scale-98 transition cursor-pointer"
                      >
                        <ShieldCheck size={16} />
                        <span>[ Nhân viên bấm xác nhận áp dụng ]</span>
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50/80 p-3.5 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-red-700 uppercase">
                        <CheckCircle2 size={16} className="text-red-600" />
                        <span>Voucher này đã được áp dụng</span>
                      </div>
                      <p className="text-[11px] text-stone-700 font-semibold">
                        Thời gian sử dụng: <b className="text-stone-900">{voucher.usedAt || "Tại cơ sở"}</b>
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Mỗi mã voucher chỉ có giá trị sử dụng một lần duy nhất và đã bị khóa vĩnh viễn trên thiết bị.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ĐIỀU KIỆN ÁP DỤNG */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-1 text-xs">
                <div className="font-bold text-emerald-950 uppercase text-[11px] tracking-wide">
                  Điều kiện áp dụng
                </div>
                <p className="text-stone-700 leading-relaxed font-medium">
                  {voucher.condition}
                </p>
                <div className="pt-1 text-stone-500 text-[11px]">
                  Hạn sử dụng đến: <b className="text-stone-900">{new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}</b>
                </div>
              </div>

              {/* THÔNG TIN CƠ SỞ & NÚT GỌI ĐẶT CHỖ */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 space-y-2">
                <div className="font-bold text-emerald-950 uppercase text-[11px] tracking-wide">
                  Thông tin cơ sở & Liên hệ
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{voucher.placeName}</h4>
                  {voucher.placeAddress && (
                    <div className="mt-1 text-xs text-stone-600 leading-relaxed">
                      {voucher.placeAddress}
                    </div>
                  )}
                  {hasPhone && (
                    <div className="mt-1 text-xs text-stone-700 font-medium">
                      Hotline: <b className="font-bold text-stone-900">{voucher.placePhone}</b>
                    </div>
                  )}
                </div>

                {/* CÁC NÚT HÀNH ĐỘNG: GỌI ĐẶT CHỖ & MỞ GOOGLE MAPS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {hasPhone && (
                    <button
                      onClick={handleCall}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-900 active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <Phone size={13} /> Gọi đặt chỗ
                    </button>
                  )}
                  <button
                    onClick={() => void zmpSdk.openWebview(mapsUrl)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 transition hover:bg-stone-100 active:scale-95 shadow-2xs cursor-pointer ${
                      !hasPhone ? "col-span-2" : ""
                    }`}
                  >
                    <MapPin size={13} className="text-amber-800" /> Google Maps
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-1.5 rounded-lg bg-stone-50 p-2.5 text-[11px] text-stone-600">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-700" />
                <span>Xuất trình mã voucher cho nhân viên khi thanh toán tại cơ sở.</span>
              </div>
            </div>

            {/* Nút đóng chân trang */}
            <div className="border-t border-stone-200 p-3 bg-stone-50 flex justify-end">
              <button
                onClick={() => setShowDetail(false)}
                className="w-full rounded-xl bg-stone-200 px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-300 transition active:scale-98 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL XÁC NHẬN SỬ DỤNG CHO NHÂN VIÊN QUÁN ===== */}
      {showConfirmRedeem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl text-center border border-stone-200 animate-in zoom-in-95 duration-150 space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 ring-8 ring-amber-50">
              <AlertTriangle size={30} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-stone-900">
                Xác nhận áp dụng voucher?
              </h4>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Xác nhận áp dụng ưu đãi <b className="text-emerald-900 font-extrabold">{voucher.discount}</b> cho khách tại <b className="text-stone-900">{voucher.placeName}</b>?
              </p>
              <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-2.5 text-[11px] text-red-700 font-bold">
                ⚠️ Hành động này sẽ đóng dấu ĐÃ SỬ DỤNG và không thể hoàn tác!
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowConfirmRedeem(false)}
                className="rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 active:scale-98 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-2.5 text-xs font-black text-white hover:from-red-700 hover:to-red-800 active:scale-98 shadow-sm transition cursor-pointer"
              >
                Xác nhận áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}