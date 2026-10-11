import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, MapPin } from "lucide-react";
import {
  answeredAtom,
  claimedVouchersAtom,
  luckySpinsAtom,
  scoreAtom,
} from "../state/store";
import { zmpSdk } from "../services/zmp-sdk";

export function Profile() {
  const score = useAtomValue(scoreAtom);
  const answered = useAtomValue(answeredAtom);
  const vouchers = useAtomValue(claimedVouchersAtom);
  const luckySpins = useAtomValue(luckySpinsAtom);
  const [location, setLocation] = useState<string>("Đang định vị...");

  useEffect(() => {
    void zmpSdk
      .getLocation()
      .then((v) => setLocation(`${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)} (Đắk Song)`));
  }, []);

  const unusedCount = vouchers.filter((v) => !v.used).length;

  return (
    <div className="space-y-4">
      {/* Header hồ sơ cá nhân */}
      <section className="z-card p-4 bg-white">
        <div className="flex items-center gap-3">
          <img
            src="./logo-dak-song.png"
            alt="Avatar"
            className="h-14 w-14 rounded-full border border-stone-200 p-0.5 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-stone-900">Người chơi Đắk Song</h1>
            <p className="text-xs text-stone-500">Thành viên khám phá văn hóa & du lịch</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Điểm số" value={String(score)} />
          <Metric label="Đã trả lời" value={String(answered)} />
          <Metric label="Voucher có" value={String(vouchers.length)} />
          <Metric label="Lượt quay" value={String(luckySpins)} />
        </div>
      </section>

      {/* Kho Voucher cá nhân */}
      <section className="z-card p-4 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-emerald-800" />
            <h2 className="text-sm font-bold text-stone-900">Kho Voucher của bạn</h2>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
            {unusedCount} chưa dùng
          </span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Bạn nhận voucher khi hoàn thành nhiệm vụ ngày hoặc đạt điểm cao trong các bài quiz. Tất cả voucher đều có thể sử dụng tại các cơ sở lưu trú và ăn uống thực tế tại Đắk Song.
        </p>
        <Link
          to="/vouchers"
          className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 p-3 text-xs font-bold text-emerald-900 transition hover:bg-stone-100"
        >
          <span>Xem chi tiết danh sách {vouchers.length} voucher</span>
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* Vị trí */}
      <div className="z-card p-3.5 bg-white text-xs text-stone-600 flex items-center gap-2">
        <MapPin size={15} className="text-emerald-800 shrink-0" />
        <div>
          <span className="font-semibold text-stone-800">Tọa độ GPS ZMP SDK:</span>{" "}
          <span className="font-mono text-stone-900">{location}</span>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-100 text-center">
      <div className="text-[11px] text-stone-500 font-medium">{label}</div>
      <div className="mt-0.5 text-lg font-bold text-stone-900">{value}</div>
    </div>
  );
}
