import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Compass, FerrisWheel, Gift, Home, ShoppingBag, Trophy } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { cartCountAtom, claimedVouchersAtom, isLuckyWheelOpenAtom, luckySpinsAtom } from "../state/store";
import { LuckyWheelModal } from "./LuckyWheelModal";

const navItems = [
  { type: "link" as const, to: "/", label: "Trang chủ", icon: Home },
  { type: "link" as const, to: "/quiz", label: "Quiz", icon: Compass },
  { type: "wheel" as const, to: "", label: "Vòng quay", icon: FerrisWheel },
  { type: "link" as const, to: "/vouchers", label: "Voucher", icon: Gift },
  { type: "link" as const, to: "/map", label: "Cẩm nang", icon: BookOpen },
  { type: "link" as const, to: "/leaderboard", label: "BXH", icon: Trophy },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isWheelOpen, setIsWheelOpen] = useAtom(isLuckyWheelOpenAtom);
  const luckySpins = useAtomValue(luckySpinsAtom);
  const claimedVouchers = useAtomValue(claimedVouchersAtom);
  const cartCount = useAtomValue(cartCountAtom);
  const availableVouchersCount = claimedVouchers.filter((v) => !v.used).length;

  return (
    <div className="app-shell safe-top safe-bottom">
      {/* ===== HEADING ĐẮK SONG QUEST CỐ ĐỊNH Ở TRÊN CÙNG ===== */}
      <header className="site-header fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3.5 py-2 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="./logo-dak-song.png"
              alt="Huy hiệu Đắk Song"
              className="h-9 w-9 shrink-0 rounded-full object-contain p-0.5 bg-white border border-white/40 shadow-sm"
            />
            <div>
              <div className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none drop-shadow-xs">
                Đắk Song Quest
              </div>
              <div className="text-[11px] font-semibold text-emerald-100/90 mt-0.5 tracking-wide">
                Khám phá & Săn voucher
              </div>
            </div>
          </Link>

          {/* NÚT MUA HÀNG Ở HEADING (THAY THẾ Ô ĐẶC SẢN Ở NAV BÊN DƯỚI) */}
          <Link
            to="/store"
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-2 text-xs font-black text-stone-950 shadow-sm active:scale-95 transition"
            title="Mua đặc sản OCOP Đắk Song"
          >
            <div className="relative">
              <ShoppingBag size={15} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white ring-1 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Mua hàng</span>
          </Link>
        </div>
      </header>

      {/* Khoảng cách đệm phía trên để tránh che lấp nội dung khi header cố định */}
      <main className="mx-auto w-full max-w-6xl px-3.5 pt-[62px] pb-6 sm:px-6 sm:pt-[70px] lg:pt-[76px]">{children}</main>

      {/* MODAL VÒNG QUAY MAY MẮN DÙNG CHUNG TOÀN HỆ THỐNG */}
      <LuckyWheelModal isOpen={isWheelOpen} onClose={() => setIsWheelOpen(false)} />

      {/* Thanh điều hướng cố định dưới màn hình (6 tab: Trang chủ, Quiz, Vòng quay, Voucher, Cẩm nang, BXH) */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-6 py-1">
          {navItems.map((item) => {
            const isWheel = item.type === "wheel";
            const active = isWheel ? isWheelOpen : location.pathname === item.to;
            const isVoucherTab = item.to === "/vouchers";
            const Icon = item.icon;

            const content = (
              <>
                <div
                  className={`relative grid h-7 w-9 sm:w-11 place-items-center rounded-xl transition ${
                    active ? "bg-amber-400 text-stone-950 shadow-xs font-black" : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.6 : 2} />
                  {isWheel && luckySpins > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs">
                      {luckySpins}
                    </span>
                  )}
                  {isVoucherTab && availableVouchersCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white shadow-xs">
                      {availableVouchersCount}
                    </span>
                  )}
                </div>
                <span className={`truncate max-w-[52px] sm:max-w-[68px] text-[9.5px] sm:text-[11px] leading-tight text-center ${active ? "font-extrabold text-amber-300" : "font-medium text-emerald-100/80"}`}>
                  {item.label}
                </span>
              </>
            );

            if (isWheel) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setIsWheelOpen(true)}
                  title="Vòng quay may mắn Đắk Song"
                  className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9.5px] sm:text-[11px] font-bold transition active:scale-95 cursor-pointer ${
                    active
                      ? "text-amber-300"
                      : "text-emerald-100/75 hover:text-white"
                  }`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[9.5px] sm:text-[11px] font-bold transition active:scale-95 ${
                  active
                    ? "text-amber-300"
                    : "text-emerald-100/75 hover:text-white"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}