import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { claimedVouchersAtom, completedTaskIdsAtom, luckySpinsAtom } from "../state/store";
import { vouchers } from "../data/vouchers";
import { getDailyTasksForDate } from "../data/tasks";
import type { Voucher } from "../types";
import { VoucherCard } from "./VoucherCard";
import { apiFetch } from "../services/apiConfig";

// Bảng màu rực rỡ, hài hòa cho các múi vòng quay động
const WHEEL_PALETTE = [
  { bgColor: "#047857", textColor: "#ffffff" }, // emerald-700
  { bgColor: "#d97706", textColor: "#ffffff" }, // amber-600
  { bgColor: "#0284c7", textColor: "#ffffff" }, // sky-600
  { bgColor: "#b45309", textColor: "#ffffff" }, // amber-700
  { bgColor: "#4f46e5", textColor: "#ffffff" }, // indigo-600
  { bgColor: "#059669", textColor: "#ffffff" }, // emerald-600
  { bgColor: "#e11d48", textColor: "#ffffff" }, // rose-600
  { bgColor: "#7c3aed", textColor: "#ffffff" }, // violet-600
  { bgColor: "#ea580c", textColor: "#ffffff" }, // orange-600
  { bgColor: "#15803d", textColor: "#ffffff" }, // green-700
  { bgColor: "#0891b2", textColor: "#ffffff" }, // cyan-600
  { bgColor: "#be185d", textColor: "#ffffff" }, // pink-700
];

function getVenueShortName(fullName: string): string {
  const map: Record<string, string> = {
    "Khách sạn Hoàng Nguyên": "Hoàng Nguyên",
    "Cơm Gà 52 Gia Hân": "Cơm Gà 52",
    "Khách Sạn Lê Thức": "Lê Thức",
    "Quán Cơm Hương Quế": "Hương Quế",
    "Khách Sạn Hoàng Điệp": "Hoàng Điệp",
    "Quán Ăn Gia Đình Thành Công": "Thành Công",
    "Star Coffee Đắk Song": "Star Coffee",
    "Nhà nghỉ Hoa Phượng": "Hoa Phượng",
    "Nhà nghỉ 79 / 99": "NN 79/99",
    "Cafe Vườn Nhà Ai": "Vườn Nhà Ai",
    "Điểm Dừng Chân Nông Sản Đắk Song": "Nông Sản",
  };
  if (map[fullName]) return map[fullName];
  const clean = fullName
    .replace(/^(Khách sạn|Khách Sạn|Quán Cơm|Quán Ăn|Nhà nghỉ|Nhà Nghỉ|Cafe|Cà phê)\s+/i, "")
    .trim();
  const words = clean.split(/\s+/);
  return words.slice(0, 2).join(" ");
}

export interface DynamicWheelSegment {
  venueId: number;
  venueName: string;
  shortName: string;
  discount: string;
  discountPercent: number;
  remainingCount: number;
  bgColor: string;
  textColor: string;
}

export function LuckyWheelModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [luckySpins, setLuckySpins] = useAtom(luckySpinsAtom);
  const [, setClaimedVouchers] = useAtom(claimedVouchersAtom);
  const [, setCompletedTasks] = useAtom(completedTaskIdsAtom);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonVoucher, setWonVoucher] = useState<Voucher | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [activeSegments, setActiveSegments] = useState<DynamicWheelSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentRotationRef = useRef(0);
  const totalSegments = activeSegments.length;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 360;

  // Tải trạng thái các cơ sở từ Backend: CHỈ LẤY CƠ SỞ CÒN VOUCHER (> 0)
  const loadVenueStatus = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/vouchers/venues-status");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // TỰ ĐỘNG LOẠI BỎ CÁC CƠ SỞ HẾT VOUCHER (RemainingCount <= 0 HOẶC IsAvailable = 0)
        const availableVenues = json.data.filter(
          (v: any) => Boolean(v.IsAvailable) && Number(v.RemainingCount) > 0
        );

        const mapped: DynamicWheelSegment[] = availableVenues.map((v: any, idx: number) => {
          const color = WHEEL_PALETTE[idx % WHEEL_PALETTE.length];
          return {
            venueId: v.VenueId,
            venueName: v.VenueName,
            shortName: getVenueShortName(v.VenueName),
            discount: `Giảm ${v.DiscountPercent}%`,
            discountPercent: Number(v.DiscountPercent),
            remainingCount: Number(v.RemainingCount),
            bgColor: color.bgColor,
            textColor: color.textColor,
          };
        });

        setActiveSegments(mapped);
      }
    } catch (e) {
      console.warn("Không kết nối được API trạng thái voucher:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVenueStatus();
    } else {
      setShowPrizeModal(false);
      setWonVoucher(null);
    }
  }, [isOpen]);

  // Âm thanh tick nhẹ khi quay (Web Audio API)
  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // Bỏ qua nếu trình duyệt chặn audio
    }
  };

  const handleSpin = async () => {
    if (spinning || luckySpins <= 0) return;

    if (activeSegments.length === 0) {
      alert("Hôm nay tất cả các cơ sở đã phát hết hạn mức voucher! Vui lòng quay lại vào ngày mai.");
      return;
    }

    setSpinning(true);
    setWonVoucher(null);
    setShowPrizeModal(false);

    try {
      // 1. GỌI SERVER SPIN: SERVER DÙNG UPDLOCK KHÓA VOUCHER VÀ CHỌN CƠ SỞ CÒN HÀNG
      const spinRes = await apiFetch("/api/vouchers/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "zalo_user" }),
      });
      const spinJson = await spinRes.json();

      if (!spinJson.success || !spinJson.data) {
        setSpinning(false);
        alert(spinJson.message || "Không thể thực hiện lượt quay lúc này. Vui lòng thử lại sau!");
        return;
      }

      // Trừ 1 lượt quay sau khi Server đã xác nhận hợp lệ
      setLuckySpins((prev) => Math.max(0, prev - 1));

      // Kiểm tra hoàn thành nhiệm vụ ngày (nếu có)
      const activeTasks = getDailyTasksForDate();
      if (activeTasks.some((t) => t.id === "t_spin_wheel")) {
        setCompletedTasks((curr) => {
          if (!curr.includes("t_spin_wheel")) {
            setLuckySpins((spins) => spins + 1);
            return [...curr, "t_spin_wheel"];
          }
          return curr;
        });
      }

      // 2. TÌM VỊ TRÍ CỦA CƠ SỞ TRÚNG TRÊN VÒNG QUAY HIỆN TẠI
      const wonVenueId = spinJson.data.venueId;
      const targetIndex = activeSegments.findIndex((s) => s.venueId === wonVenueId);
      const winningIndex = targetIndex >= 0 ? targetIndex : 0;
      const prizeSegment = activeSegments[winningIndex] || activeSegments[0];

      // Tìm template voucher tương ứng
      const matchedTemplate =
        vouchers.find((v) => v.placeName.toLowerCase().includes(prizeSegment.venueName.toLowerCase())) ||
        vouchers.find((v) => prizeSegment.venueName.toLowerCase().includes(v.placeName.toLowerCase())) ||
        vouchers[0];

      const prize: Voucher = {
        ...matchedTemplate,
        id: `WHEEL-VOUCHER-${Date.now()}`,
        code: spinJson.data.voucherCode,
        placeName: prizeSegment.venueName,
        discount: `Giảm ${spinJson.data.discountPercent}%`,
        used: false,
      };

      // 3. TÍNH TOÁN GÓC QUAY DỪNG CHÍNH XÁC VÀO TÂM MÚI TRÚNG
      const extraRounds = 360 * (5 + Math.floor(Math.random() * 3)); // Quay từ 5 - 7 vòng
      const prizeCenterAngle = winningIndex * segmentAngle + segmentAngle / 2;
      const targetOffset = 360 - prizeCenterAngle;

      const currentBase = currentRotationRef.current % 360;
      const additionalRotation = (targetOffset - currentBase + 360) % 360;
      const finalRotation = currentRotationRef.current + extraRounds + additionalRotation;

      currentRotationRef.current = finalRotation;
      setRotation(finalRotation);

      // Hiệu ứng âm thanh tick ngắt quãng
      const interval = setInterval(() => {
        playTickSound();
      }, 180);

      setTimeout(() => {
        clearInterval(interval);
      }, 4200);

      // 4. SAU KHI BÁNH XE DỪNG LẠI (4.5s): HIỆN THÔNG BÁO VÀ TẢI LẠI VÒNG QUAY
      setTimeout(() => {
        setSpinning(false);
        setWonVoucher(prize);
        setShowPrizeModal(true);
        setClaimedVouchers((curr) => [prize, ...curr]);
        // Tải lại trạng thái để nếu quán nào vừa hết chiếc voucher cuối cùng, nó lập tức tự động loại khỏi vòng quay!
        loadVenueStatus();
      }, 4500);
    } catch (err) {
      setSpinning(false);
      console.error("Lỗi khi thực hiện quay thưởng:", err);
      alert("Đã xảy ra lỗi kết nối khi quay. Vui lòng thử lại!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-300 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Nút đóng góc phải */}
        <button
          onClick={onClose}
          aria-label="Đóng vòng quay"
          className="absolute top-3.5 right-3.5 z-30 rounded-full bg-stone-100 p-1.5 text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header tiêu đề */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-amber-950 px-5 pt-5 pb-3 text-white text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-300">
            <Sparkles size={12} />
            Vòng quay may mắn Đắk Song
          </div>
          <h2 className="mt-1 text-lg sm:text-xl font-black text-white">
            Quay Là Trúng Voucher 100%
          </h2>
        </div>

        {/* Nội dung Vòng quay */}
        <div className="p-4 flex flex-col items-center justify-center overflow-y-auto">
          {/* Thông tin số lượt quay và số cơ sở khả dụng */}
          <div className="flex items-center justify-between w-full mb-2 px-1 text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <span>Lượt quay:</span>
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 font-black text-amber-950">
                {luckySpins} lượt
              </span>
            </span>
            <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {activeSegments.length} cơ sở còn voucher
            </span>
          </div>

          {activeSegments.length === 0 && !isLoading ? (
            <div className="w-full my-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <AlertCircle size={32} className="mx-auto text-amber-600" />
              <h4 className="font-black text-stone-900 text-sm">Tất cả cơ sở đã phát hết voucher!</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hôm nay tất cả các cơ sở tại Đắk Song đã phát hết hạn mức voucher. Vui lòng quay lại vào ngày mai khi có đợt hạn mức mới!
              </p>
            </div>
          ) : (
            /* Vòng quay SVG tương tác */
            <div className="relative w-76 h-76 sm:w-84 sm:h-84 my-1 shrink-0 select-none">
              {/* Kim chỉ ở đỉnh vòng quay (vị trí 12h) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 pointer-events-none drop-shadow-md">
                <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[26px] border-t-amber-400 filter drop-shadow-sm" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600 mx-auto -mt-6" />
              </div>

              {/* Bánh xe xoay tròn */}
              <div
                className="w-full h-full rounded-full shadow-lg border-4 border-amber-400 overflow-hidden bg-slate-50"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.2, 1.0)" : "none",
                }}
              >
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="198" fill="#f8fafc" />
                  {activeSegments.map((segment, index) => {
                    const angle = segmentAngle;
                    const startAngle = index * angle;
                    const endAngle = (index + 1) * angle;

                    // Tính toạ độ vẽ hình quạt
                    const x1 = 200 + 198 * Math.sin((startAngle * Math.PI) / 180);
                    const y1 = 200 - 198 * Math.cos((startAngle * Math.PI) / 180);
                    const x2 = 200 + 198 * Math.sin((endAngle * Math.PI) / 180);
                    const y2 = 200 - 198 * Math.cos((endAngle * Math.PI) / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;
                    const pathData = totalSegments === 1
                      ? "M 200 2 A 198 198 0 1 1 199.9 2 Z"
                      : `M 200 200 L ${x1} ${y1} A 198 198 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    // Góc chữ xoay theo hướng tia bán kính
                    const textAngle = startAngle + angle / 2;

                    return (
                      <g key={`${segment.venueId}-${index}`}>
                        <path
                          d={pathData}
                          fill={segment.bgColor}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <g transform={`rotate(${textAngle}, 200, 200) translate(200, 52)`}>
                          <text
                            x="0"
                            y="0"
                            fill={segment.textColor}
                            fontSize={totalSegments > 10 ? "11.5" : "13"}
                            fontWeight="bold"
                            textAnchor="middle"
                            transform="rotate(90, 0, 0)"
                          >
                            {segment.shortName}
                          </text>
                          <text
                            x="0"
                            y="14"
                            fill="#fef08a"
                            fontSize={totalSegments > 10 ? "10" : "11"}
                            fontWeight="900"
                            textAnchor="middle"
                            transform="rotate(90, 0, 0)"
                          >
                            {segment.discount}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Trục tâm nút Quay ở chính giữa */}
              <button
                onClick={handleSpin}
                disabled={spinning || luckySpins <= 0 || activeSegments.length === 0}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-amber-300 shadow-md flex flex-col items-center justify-center font-black transition active:scale-95 ${
                  spinning || activeSegments.length === 0
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : luckySpins > 0
                    ? "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 hover:scale-105 cursor-pointer"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                <span className="text-[13px] leading-tight font-extrabold uppercase tracking-wide">
                  {spinning ? "ĐANG" : activeSegments.length === 0 ? "HẾT" : "QUAY"}
                </span>
                <span className="text-[10px] font-bold">
                  {spinning ? "QUAY..." : activeSegments.length === 0 ? "VOUCHER" : "NGAY"}
                </span>
              </button>
            </div>
          )}

          {/* Nút hành động bên dưới */}
          <div className="w-full mt-2.5 space-y-2">
            <button
              onClick={handleSpin}
              disabled={spinning || luckySpins <= 0 || activeSegments.length === 0}
              className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition ${
                spinning || activeSegments.length === 0
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : luckySpins > 0
                  ? "bg-gradient-to-r from-emerald-800 to-amber-900 text-white hover:opacity-95 active:scale-98 cursor-pointer"
                  : "bg-stone-200 text-stone-500 cursor-not-allowed"
              }`}
            >
              {spinning
                ? "Bánh xe đang quay..."
                : activeSegments.length === 0
                ? "Tất cả cơ sở đã phát hết hạn mức hôm nay"
                : luckySpins > 0
                ? `Nhấn Quay Ngay (${luckySpins} lượt còn lại)`
                : "Hết lượt quay (Làm nhiệm vụ ngày để nhận thêm)"}
            </button>

            {luckySpins <= 0 && (
              <p className="text-center text-[11px] text-stone-500 leading-relaxed">
                <b>Mẹo:</b> Hoàn thành các thử thách quiz trong mục <b>Nhiệm vụ ngày</b> để tích thêm lượt quay may mắn mỗi ngày!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CHÚC MỪNG KHI TRÚNG VOUCHER */}
      {showPrizeModal && wonVoucher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl border border-amber-300 space-y-4">
            <div>
              <span className="inline-block rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-[11px] font-bold text-amber-900">
                TRÚNG THƯỞNG VÒNG QUAY
              </span>
              <h3 className="mt-1.5 text-lg font-black text-stone-900">
                Chúc mừng bạn đã trúng voucher!
              </h3>
              <p className="mt-0.5 text-xs text-stone-600">
                Mã ưu đãi đã được tự động lưu vào <b>Kho Voucher</b> của bạn.
              </p>
            </div>

            {/* Thẻ voucher trúng thưởng */}
            <div className="text-left">
              <VoucherCard voucher={wonVoucher} claimed />
            </div>

            <div className="flex gap-2 pt-1">
              {luckySpins > 0 ? (
                <button
                  onClick={() => {
                    setShowPrizeModal(false);
                    setWonVoucher(null);
                  }}
                  className="flex-1 rounded-xl bg-amber-500 py-2.5 text-xs font-black text-stone-950 transition hover:bg-amber-400 active:scale-95 shadow-sm cursor-pointer"
                >
                  Quay tiếp ({luckySpins} lượt)
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowPrizeModal(false);
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-emerald-800 py-2.5 text-xs font-black text-white transition hover:bg-emerald-900 active:scale-95 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Xem Kho Voucher</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowPrizeModal(false);
                  onClose();
                }}
                className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-200 active:scale-95 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LuckyWheelModal;
