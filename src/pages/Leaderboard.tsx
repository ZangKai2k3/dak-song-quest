import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { Clock3, RefreshCw, Share2, Trophy, User } from "lucide-react";
import { apiFetch } from "../services/apiConfig";
import { zmpSdk, type ZaloUserProfile } from "../services/zmp-sdk";
import { weeklyAttemptStorageAtom } from "../state/store";
import type { LeaderboardEntry } from "../types";
import { formatDuration, getPlayerTag, getWeekId } from "../utils/quiz";
import { UserProfileModal } from "../components/UserProfileModal";

const defaultDemoEntries: LeaderboardEntry[] = [
  { rank: 1, name: "M’Nông Explorer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", score: 24, totalQuestions: 25, timeMs: 68300, badge: "Top 1" },
  { rank: 2, name: "Cà Phê Tây Nguyên", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", score: 23, totalQuestions: 25, timeMs: 71500, badge: "Top 2" },
  { rank: 3, name: "Green Traveler", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", score: 23, totalQuestions: 25, timeMs: 82400, badge: "Top 3" },
  { rank: 4, name: "Dak Song Fan", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", score: 22, totalQuestions: 25, timeMs: 90100, badge: "Top 4" },
  { rank: 5, name: "Hidden Gem Hunter", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", score: 21, totalQuestions: 25, timeMs: 88700, badge: "Top 5" },
];

export function Leaderboard() {
  const [weeklyAttempt, setWeeklyAttempt] = useAtom(weeklyAttemptStorageAtom);
  const weekId = getWeekId();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(defaultDemoEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [myProfile, setMyProfile] = useState<ZaloUserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      // 1. Tải profile Zalo của người dùng hiện tại
      const profile = await zmpSdk.getUserProfile();
      setMyProfile(profile);

      // 2. Tải BXH tuần từ Backend SQL Server
      const res = await apiFetch(`/api/leaderboard?weekId=${encodeURIComponent(weekId)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.leaderboard)) {
        if (json.data.leaderboard.length > 0) {
          setLeaderboard(json.data.leaderboard);
        }
        const existsInBoard = json.data.leaderboard.some(
          (e: LeaderboardEntry) => profile && e.zaloUserId === profile.id
        );
        if (!existsInBoard) {
          setWeeklyAttempt(null);
        }
      }
    } catch (err) {
      console.warn("Chưa thể tải BXH thời gian thực từ Backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [weekId]);

  const myEntry = leaderboard.find(
    (e) => myProfile && e.zaloUserId === myProfile.id
  );

  const share = () => {
    const content = weeklyAttempt
      ? `Kết quả thi Đắk Song Quest của mình: ${weeklyAttempt.score}/${weeklyAttempt.totalQuestions} câu, thời gian ${formatDuration(weeklyAttempt.timeMs)}! Cùng tham gia đua Top tuần nhé!`
      : "Mình đang tham gia Đắk Song Quest! Cùng khám phá Đắk Song và đua Top tuần săn voucher nhé!";
    void zmpSdk.openShareSheet({ title: "Đắk Song Quest – BXH tuần", content });
  };

  const handleProfileSaved = async (updated: ZaloUserProfile) => {
    setMyProfile(updated);
    await loadLeaderboard();
  };


  return (
    <div className="space-y-4">
      {/* ===== BANNER BXH: ICON CÁI CUP ĐẶT CHÍNH GIỮA ===== */}
      <section className="rounded-2xl bg-gradient-to-br from-emerald-800 to-amber-900 p-5 text-white text-center shadow-xs flex flex-col items-center justify-center">
        {/* Icon cup chính giữa */}
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 mx-auto shadow-xs border border-white/30">
          <Trophy size={30} className="text-amber-300" />
        </div>

        <h1 className="mt-2.5 text-xl font-bold text-white sm:text-2xl">Bảng xếp hạng tuần</h1>
        <p className="mt-0.5 text-xs text-emerald-100 font-medium">
          {weekId.replace("-W", " • Tuần ")} — Tổng kết 23:59 Chủ Nhật • Top 5 nhận Voucher Giảm 30%
        </p>

        <div className="mt-3 w-full max-w-md rounded-xl bg-black/20 p-2.5 text-xs text-amber-100 border border-white/10 leading-relaxed text-left sm:text-center">
          <b>Quy tắc xếp hạng & trao thưởng:</b> Tính điểm bài thi chính thức. Điểm sẽ <b>tổng kết vào ngày Chủ Nhật mỗi tuần</b>. <b>5 người đầu bảng</b> sẽ được tặng <b>voucher giảm giá tốt nhất là 30%</b>!
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-2">
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-stone-900 shadow-xs transition hover:bg-amber-300 active:scale-95 cursor-pointer"
          >
            <Share2 size={14} /> Chia sẻ thành tích
          </button>
          <button
            onClick={loadLeaderboard}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 px-3 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            title="Tải lại bảng xếp hạng mới nhất"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </section>

      {/* DANH SÁCH XẾP HẠNG TOP 5 NGƯỜI CHƠI XUẤT SẮC NHẤT */}
      <div className="z-card divide-y divide-stone-100 overflow-hidden bg-white shadow-xs">
        <div className="bg-stone-50 px-3.5 py-2.5 border-b border-stone-200/80 flex items-center justify-between text-[11px] font-bold text-stone-700">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500 shrink-0" />
            <span className="font-black text-stone-900 uppercase">Top 5 Thí sinh đầu bảng</span>
          </div>
          <span className="text-emerald-800 font-bold flex items-center gap-1 text-[10px] bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Nhận Voucher Giảm 30%
          </span>
        </div>

        {leaderboard.slice(0, 5).map((entry) => {
          const percent = Math.round((entry.score / entry.totalQuestions) * 100);
          const isCurrentUser = Boolean(myProfile && entry.zaloUserId && entry.zaloUserId === myProfile.id);

          return (
            <div
              key={`${entry.name}-${entry.rank}-${entry.zaloUserId || ''}`}
              className={`flex items-center gap-2.5 p-3 transition ${
                entry.rank <= 3 ? "bg-amber-50/40" : "bg-white"
              } ${isCurrentUser ? "bg-emerald-50/90 ring-1 ring-inset ring-emerald-400" : ""}`}
            >
              {/* Thứ hạng */}
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black shadow-xs ${
                  entry.rank === 1
                    ? "bg-amber-400 text-stone-900 border border-amber-300"
                    : entry.rank === 2
                    ? "bg-stone-200 text-stone-800 border border-stone-300"
                    : entry.rank === 3
                    ? "bg-amber-700 text-white"
                    : "bg-emerald-800 text-white"
                }`}
              >
                {entry.rank}
              </div>

              {/* Avatar Zalo của thí sinh */}
              <div className="relative shrink-0">
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-stone-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                    <User size={18} />
                  </div>
                )}
                {entry.rank === 1 && (
                  <span className="absolute -top-1 -right-1 text-[11px] leading-none" title="Quán quân">
                    👑
                  </span>
                )}
              </div>

              {/* Thông tin thí sinh: Tên Zalo & Điểm */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs sm:text-sm">
                  <span className="truncate max-w-[100px] min-[360px]:max-w-[130px] sm:max-w-[190px]">{entry.name}</span>
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200 shrink-0">
                    {getPlayerTag(entry.zaloUserId, entry.attemptId)}
                  </span>
                  {isCurrentUser && (
                    <span className="rounded-full bg-emerald-800 px-1.5 py-0.5 text-[9px] font-black text-white shrink-0">
                      BẠN
                    </span>
                  )}
                  <span className="rounded-full bg-amber-100 border border-amber-300 px-1.5 py-0.2 text-[8.5px] font-black text-amber-950 shrink-0">
                    Top {entry.rank}
                  </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span className="font-bold text-emerald-800">
                    {entry.score}/{entry.totalQuestions} ({percent}%)
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={11} className="text-stone-400" />
                    {formatDuration(entry.timeMs)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* THÀNH TÍCH CÁ NHÂN CỦA NGƯỜI CHƠI (HIỆN BÊN DƯỚI BẢNG XẾP HẠNG TOP 5) */}
      <div className="z-card p-4 bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="border-b border-stone-100 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Thành tích cá nhân của bạn
            </span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-[10px] font-bold transition active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
              title="Chỉnh sửa tên hiển thị và ảnh đại diện"
            >
              <span>✏️ Đổi tên & Avatar</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <img
              src={myProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt=""
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-2xs"
            />
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-black text-stone-950">
                {myProfile?.name || "Tài khoản Zalo của bạn"}
              </span>
              {myProfile?.id && (
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                  {getPlayerTag(myProfile.id)}
                </span>
              )}
            </div>
          </div>
        </div>

        {myEntry ? (
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200">
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-500">
                  Thứ hạng bài thi chính thức:
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-2xs ${
                    myEntry.rank <= 5
                      ? "bg-amber-400 text-stone-950 border border-amber-300"
                      : "bg-stone-200 text-stone-800 border border-stone-300"
                  }`}>
                    Hạng #{myEntry.rank}
                  </span>
                  {myEntry.rank <= 5 ? (
                    <span className="text-xs font-black text-emerald-900">
                      🎉 Đang trong Top 5 nhận Voucher 30%!
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-stone-600">
                      Chưa vào Top 5 (Cách Top 5: {Math.max(1, myEntry.rank - 5)} hạng)
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                <div className="text-base font-black text-emerald-900">
                  {myEntry.score}/{myEntry.totalQuestions} câu ({Math.round((myEntry.score / myEntry.totalQuestions) * 100)}%)
                </div>
                <div className="text-[11px] font-mono text-stone-600 mt-0.5">
                  ⏱️ Thời gian: {formatDuration(myEntry.timeMs)}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
              Điểm số sẽ được <b>tổng kết vào 23:59 Chủ Nhật tuần này</b>. Nếu duy trì vị trí trong <b>Top 5 người đầu bảng</b>, bạn sẽ nhận được <b>Voucher giảm giá 30%</b>!
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-center sm:text-left">
            <p className="text-[11px] text-amber-950 leading-relaxed font-medium">
              Bạn chưa tham gia bài thi chính thức tuần này. Hãy tham gia ngay để ghi danh vào bảng vàng và đua Top 5 săn voucher giảm giá 30%!
            </p>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs shadow-xs hover:brightness-105 active:scale-98 transition"
            >
              <Trophy size={14} />
              <span>Tham gia Thi chính thức ngay</span>
            </Link>
          </div>
        )}
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialProfile={myProfile}
        onSaved={handleProfileSaved}
        attemptId={myEntry?.attemptId}
        weekId={weekId}
      />
    </div>
  );
}
