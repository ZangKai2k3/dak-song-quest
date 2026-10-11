import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Gift,
  Home,
  MapPin,
  Play,
  Share2,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { questions } from "../data/questions";
import { generateRandomSingleVenueVoucher } from "../data/vouchers";
import { getDailyTasksForDate } from "../data/tasks";
import {
  answeredAtom,
  claimedVouchersAtom,
  completedTaskIdsAtom,
  dailyPracticeVouchersCountAtom,
  isLuckyWheelOpenAtom,
  luckySpinsAtom,
  scoreAtom,
  selectedCategoryAtom,
  unlockedPlacesAtom,
  weeklyAttemptStorageAtom,
} from "../state/store";
import type { QuizCategory, QuizQuestion, Voucher, VoucherTier } from "../types";
import { ProgressBar } from "../components/ProgressBar";
import { zmpSdk, type ZaloUserProfile } from "../services/zmp-sdk";
import { formatDuration, getPlayerTag, getWeekId, prepareQuizSession } from "../utils/quiz";
import { apiFetch } from "../services/apiConfig";
import { UserProfileModal } from "../components/UserProfileModal";
import bgQuiz from "../assets/bg-quiz.png";

const categories: QuizCategory[] = ["Thiên nhiên", "Văn hóa M’Nông", "Ẩm thực", "Hidden Gems", "Tổng hợp"];

function buildPool(category: QuizCategory): QuizQuestion[] {
  if (category === "Tổng hợp") return [...questions];
  return questions.filter((q) => q.category === category);
}

export function Quiz() {
  const [category, setCategory] = useAtom(selectedCategoryAtom);
  const [, setScore] = useAtom(scoreAtom);
  const [, setAnswered] = useAtom(answeredAtom);
  const [, setUnlocked] = useAtom(unlockedPlacesAtom);
  const [, setClaimed] = useAtom(claimedVouchersAtom);
  const [, setTasks] = useAtom(completedTaskIdsAtom);
  const [, setLuckySpins] = useAtom(luckySpinsAtom);
  const [, setWeeklyAttempt] = useAtom(weeklyAttemptStorageAtom);

  const [practiceVouchersToday, setPracticeVouchersToday] = useAtom(dailyPracticeVouchersCountAtom);
  const [showPracticeLimitModal, setShowPracticeLimitModal] = useState(false);
  const activeTasksToday = useMemo(() => getDailyTasksForDate(), []);
  const MAX_PRACTICE_VOUCHERS = 3;

  const [quizMode, setQuizMode] = useState<"practice" | "official">("official");
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [earnedVoucher, setEarnedVoucher] = useState<Voucher | null>(null);
  const [showEarnedVoucherModal, setShowEarnedVoucherModal] = useState(false);
  const [earnedSpins, setEarnedSpins] = useState(0);
  const [, setIsLuckyWheelOpen] = useAtom(isLuckyWheelOpenAtom);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [runWasOfficial, setRunWasOfficial] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<ZaloUserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [serverAttempt, setServerAttempt] = useState<{
    attemptId: number;
    score: number;
    totalQuestions: number;
    timeMs: number;
    rank: number;
    displayName: string;
    avatarUrl?: string;
  } | null>(null);
  const [isCheckingAttempt, setIsCheckingAttempt] = useState(false);

  const checkLeaderboardStatus = useCallback(async (prof?: ZaloUserProfile | null) => {
    const target = prof || currentUserProfile;
    if (!target) return;
    setIsCheckingAttempt(true);
    try {
      const curWeek = getWeekId();
      const res = await apiFetch(
        `/api/leaderboard/status?userId=${encodeURIComponent(target.id)}&weekId=${encodeURIComponent(curWeek)}&userName=${encodeURIComponent(target.name)}`
      );
      const json = await res.json();
      if (json.success && json.data?.hasAttempt && json.data.attempt) {
        setServerAttempt(json.data.attempt);
      } else {
        setServerAttempt(null);
        setWeeklyAttempt(null);
      }
    } catch (e) {
      console.warn("Lỗi kiểm tra trạng thái lượt thi:", e);
    } finally {
      setIsCheckingAttempt(false);
    }
  }, []);

  // Chỉ tải profile 1 lần duy nhất khi vào trang Quiz
  useEffect(() => {
    let isMounted = true;
    void (async () => {
      const p = await zmpSdk.getUserProfile();
      if (isMounted) {
        setCurrentUserProfile(p);
        void checkLeaderboardStatus(p);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [checkLeaderboardStatus]);

  // Khi người dùng chuyển đổi tab thi chính thức
  useEffect(() => {
    if (quizMode === "official" && currentUserProfile) {
      void checkLeaderboardStatus(currentUserProfile);
    }
  }, [quizMode]);

  const handleChangeUserName = () => {
    setIsProfileModalOpen(true);
  };

  useEffect(() => {
    if (!started || finished || startedAt === null) return;
    const updateTimer = () => setElapsedMs(Date.now() - startedAt);
    updateTimer();
    const timerId = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(timerId);
  }, [started, finished, startedAt]);

  const executeStartQuiz = (mode: "practice" | "official" = quizMode) => {
    const isOfficial = mode === "official";
    setQuizMode(mode);
    const playCategory: QuizCategory = isOfficial ? "Tổng hợp" : category;
    if (isOfficial) setCategory("Tổng hợp");

    const pool = buildPool(playCategory);
    const prepared = prepareQuizSession(pool);

    setSessionQuestions(prepared);
    setIndex(0);
    setSelected(null);
    setFinished(false);
    setSessionCorrect(0);
    setEarnedVoucher(null);
    setShowEarnedVoucherModal(false);
    setElapsedMs(0);
    setStartedAt(Date.now());
    setRunWasOfficial(isOfficial);
    setStarted(true);
  };

  const startQuiz = (mode: "practice" | "official" = quizMode) => {
    if (mode === "practice" && practiceVouchersToday >= MAX_PRACTICE_VOUCHERS) {
      setShowPracticeLimitModal(true);
      return;
    }
    executeStartQuiz(mode);
  };

  const choose = (optionIndex: number) => {
    if (!started || selected !== null || finished) return;
    if (optionIndex < 0 || optionIndex >= (sessionQuestions[index]?.options.length ?? 0)) return;

    setSelected(optionIndex);
    const current = sessionQuestions[index];
    const correct = optionIndex === current.answerIndex;

    setAnswered((v) => v + 1);
    if (correct) {
      setScore((v) => v + 1);
      setSessionCorrect((v) => v + 1);
      if (current.locationId) {
        setUnlocked((curr) =>
          curr.includes(current.locationId!) ? curr : [...curr, current.locationId!],
        );
      }
    }

    // Kiểm tra và trao thưởng các nhiệm vụ ngày hôm nay (nếu có trong bộ nhiệm vụ xoay tua)
    const checkAndAwardTask = (taskId: string) => {
      if (activeTasksToday.some((t) => t.id === taskId)) {
        setTasks((curr) => {
          if (!curr.includes(taskId)) {
            setLuckySpins((spins) => spins + 1);
            setEarnedSpins((prev) => prev + 1);
            return [...curr, taskId];
          }
          return curr;
        });
      }
    };

    if (sessionCorrect + (correct ? 1 : 0) >= 3 || index >= 2) {
      checkAndAwardTask("t_answer_3");
    }
    if (current.category === "Hidden Gems" && correct) {
      checkAndAwardTask("t_hidden_gem");
    }
    if (current.category === "Văn hóa M’Nông" && correct) {
      checkAndAwardTask("t_mnong_culture");
    }
    if (current.category === "Ẩm thực" && correct) {
      checkAndAwardTask("t_food");
    }
    if (current.category === "Thiên nhiên" && correct) {
      checkAndAwardTask("t_nature");
    }
  };

  const finishQuiz = (finalCorrect: number) => {
    const completedAt = new Date().toISOString();
    const finalTimeMs = startedAt === null ? elapsedMs : Math.max(elapsedMs, Date.now() - startedAt);
    const total = sessionQuestions.length || 1;
    const finalPercent = Math.round((finalCorrect / total) * 100);
    const tier: VoucherTier | null =
      finalPercent >= 90 ? "Diamond" : finalPercent >= 80 ? "Gold" : finalPercent >= 70 ? "Silver" : null;
    const isPractice = !runWasOfficial;

    // Kiểm tra hoàn thành nhiệm vụ kết thúc bài thi hôm nay
    if (activeTasksToday.some((t) => t.id === "t_finish_quiz")) {
      setTasks((curr) => {
        if (!curr.includes("t_finish_quiz")) {
          setLuckySpins((spins) => spins + 1);
          setEarnedSpins((prev) => prev + 1);
          return [...curr, "t_finish_quiz"];
        }
        return curr;
      });
    }

    if (runWasOfficial) {
      const currentWeek = getWeekId();
      setWeeklyAttempt({
        weekId: currentWeek,
        score: finalCorrect,
        totalQuestions: total,
        timeMs: finalTimeMs,
        category: "Tổng hợp",
        completedAt,
      });

      // Lấy Profile Zalo thật và đồng bộ kết quả lên SQL Server Backend để cập nhật BXH tuần
      void (async () => {
        try {
          const profile = await zmpSdk.getUserProfile();
          await apiFetch("/api/leaderboard/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              zaloUserId: profile.id,
              displayName: profile.name,
              avatarUrl: profile.avatar,
              score: finalCorrect,
              totalQuestions: total,
              timeMs: finalTimeMs,
              weekId: currentWeek,
            }),
          });
          void checkLeaderboardStatus(profile);
        } catch (err) {
          console.warn("Lỗi đồng bộ kết quả thi lên BXH:", err);
        }
      })();
    }

    // CHỈ TẶNG VOUCHER Ở CHẾ ĐỘ THI THỬ (LUYỆN TẬP), THI CHÍNH THỨC KHÔNG TẶNG VOUCHER GIẢM GIÁ
    if (tier && isPractice) {
      const awardVoucher = (voucher: Voucher) => {
        setClaimed((curr) => [voucher, ...curr]);
        setEarnedVoucher(voucher);
        setShowEarnedVoucherModal(true);
        // Đồng bộ lên SQL Server Backend để Admin tự động trừ hạn mức và cập nhật Đã phát
        apiFetch("/api/vouchers/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "zalo_user",
            voucherCode: voucher.code,
            venueName: voucher.placeName,
            discountPercent: parseInt(voucher.discount.replace(/\D/g, "")) || 15,
          }),
        }).catch((err) => console.warn("Lỗi đồng bộ cấp voucher lên server:", err));
      };

      // GIỚI HẠN TỐI ĐA 3 VOUCHER TRONG PHẦN THI THỬ MỖI NGÀY
      if (practiceVouchersToday >= MAX_PRACTICE_VOUCHERS) {
        // Khi thi lần thứ 4 trở đi (đã nhận đủ 3 voucher):
        // Bật cửa sổ popup thông báo mỗi ngày tối đa 3 voucher, ngày mai mới nhận tiếp!
        setShowPracticeLimitModal(true);
      } else {
        // Còn trong giới hạn (< 3): Cấp voucher và tăng biến đếm
        const newVoucher = generateRandomSingleVenueVoucher(tier);
        awardVoucher(newVoucher);
        setPracticeVouchersToday((curr) => curr + 1);
      }
    } else if (isPractice && practiceVouchersToday >= MAX_PRACTICE_VOUCHERS) {
      // Khi thi thử lần thứ 4 trở đi dù chưa đạt tier vẫn thông báo giới hạn nếu hoàn thành
      setShowPracticeLimitModal(true);
    }

    setElapsedMs(finalTimeMs);
    setFinished(true);
  };

  const next = () => {
    if (index >= sessionQuestions.length - 1) {
      finishQuiz(sessionCorrect);
      return;
    }
    setIndex((v) => v + 1);
    setSelected(null);
  };

  const reset = () => {
    setSessionQuestions([]);
    setIndex(0);
    setSelected(null);
    setFinished(false);
    setStarted(false);
    setSessionCorrect(0);
    setEarnedVoucher(null);
    setShowEarnedVoucherModal(false);
    setStartedAt(null);
    setElapsedMs(0);
    setRunWasOfficial(false);
    setShowPracticeLimitModal(false);
  };

  const renderPracticeLimitModal = () => {
    if (!showPracticeLimitModal) return null;
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-5 text-white text-center relative">
            <button
              onClick={() => setShowPracticeLimitModal(false)}
              className="absolute top-3 right-3 rounded-full bg-black/20 p-1 text-white hover:bg-black/40 transition cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner mb-1.5">
              🎁
            </div>
            <h3 className="text-lg font-black tracking-tight text-stone-950">
              Mỗi ngày tối đa 3 Voucher
            </h3>
            <p className="mt-0.5 text-xs text-amber-100 font-medium">
              Thông báo giới hạn phần thi thử
            </p>
          </div>

          <div className="p-5 space-y-3.5 text-center">
            <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-950 leading-relaxed font-medium">
              <p className="font-bold text-amber-950 text-sm">
                Bạn đã nhận đủ 3/3 voucher từ phần thi thử hôm nay!
              </p>
              <p className="mt-2 text-amber-900 text-[11px] leading-relaxed">
                ⏰ Mỗi ngày bạn chỉ có thể nhận tối đa 3 voucher ở phần thi thử. <b>Khi qua ngày mai, bạn mới được tiếp tục nhận thêm voucher nhé!</b>
              </p>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Bạn vẫn có thể tiếp tục <b>luyện tập để trau dồi kiến thức</b>, hoặc tham gia <b>Thi chính thức</b> để đua Top nhận quà tuần!
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowPracticeLimitModal(false);
                  reset();
                  executeStartQuiz("official");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 px-4 text-xs font-black text-stone-950 shadow-xs hover:brightness-105 active:scale-98 transition cursor-pointer"
              >
                <Trophy size={15} /> Thi chính thức đua Top BXH
              </button>

              <Link
                to="/vouchers"
                onClick={() => setShowPracticeLimitModal(false)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 py-2 px-4 text-xs font-bold text-stone-800 hover:bg-stone-100 transition"
              >
                Xem Kho Voucher của bạn
              </Link>

              <button
                onClick={() => {
                  setShowPracticeLimitModal(false);
                  if (!started && quizMode === "practice") {
                    executeStartQuiz("practice");
                  }
                }}
                className="w-full py-1 text-xs font-medium text-stone-500 hover:text-stone-800 transition cursor-pointer"
              >
                {!started ? "Đã hiểu, tiếp tục thi thử (không nhận voucher)" : "Đã hiểu, tiếp tục"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileModal = () => (
    <UserProfileModal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      initialProfile={currentUserProfile}
      onSaved={(p) => {
        setCurrentUserProfile(p);
        void checkLeaderboardStatus(p);
      }}
      attemptId={serverAttempt?.attemptId}
      weekId={getWeekId()}
    />
  );

  const share = async () => {
    const total = sessionQuestions.length || 1;
    await zmpSdk.openShareSheet({
      title: "Đắk Song Quest",
      content: `Mình vừa đạt ${sessionCorrect}/${total} câu (${Math.round((sessionCorrect / total) * 100)}%) trong Đắk Song Quest, thời gian ${formatDuration(elapsedMs)}! 🌲 Thử sức khám phá vùng đất Đắk Song nhé!`,
    });
  };

  // ========== Màn hình kết quả ==========
  if (finished) {
    const total = sessionQuestions.length || 1;
    const finalPercent = Math.round((sessionCorrect / total) * 100);
    return (
      <div className="space-y-4 pb-8 animate-in fade-in duration-200">
        <section className="z-card p-5 text-center shadow-md bg-white">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-2 text-xl font-black text-stone-950 sm:text-2xl">
            {runWasOfficial ? "Hoàn thành bài thi chính thức!" : "Hoàn thành bài thi thử!"}
          </h1>
          <div className="mt-1 text-3xl font-black text-emerald-900">
            {sessionCorrect}/{total}
          </div>
          <p className="mt-0.5 text-xs font-bold text-stone-600">Tỷ lệ đúng: {finalPercent}%</p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-black text-stone-900">
            <Clock3 size={14} className="text-emerald-800" /> {formatDuration(elapsedMs)}
          </div>
          <div className="mt-3">
            <ProgressBar value={finalPercent} />
          </div>

          {/* THÔNG BÁO THEO TỪNG CHẾ ĐỘ THI */}
          {runWasOfficial ? (
            <>
              {/* KHỐI THÔNG BÁO THÀNH TÍCH THI CHÍNH THỨC */}
              <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center text-xs font-semibold text-emerald-950 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Trophy size={18} className="text-amber-600 shrink-0" />
                  <b className="text-emerald-950 font-black text-sm">Ghi nhận thành tích bài thi chính thức!</b>
                </div>
                <p className="text-xs leading-relaxed text-emerald-900">
                  Bạn đã hoàn thành bài thi với kết quả: <b>{sessionCorrect}/{total} câu đúng</b> trong thời gian <b>{formatDuration(elapsedMs)}</b>.
                </p>
                <div className="rounded-xl bg-white/80 border border-emerald-200 p-2.5 text-[11px] text-emerald-900 leading-relaxed font-medium">
                  ✨ Thành tích của bạn đã được lưu vào hệ thống để xếp hạng tuần này. Chúc bạn đạt vị trí cao trên bảng xếp hạng!
                </div>
              </div>

              {/* HAI NÚT HÀNH ĐỘNG VỚI MÀU SẮC TƯƠNG PHẢN NỔI BẬT */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                <Link
                  to="/leaderboard"
                  className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm py-3 px-4 shadow-md border-2 border-amber-500 active:scale-95 transition text-center"
                >
                  <Trophy size={16} className="text-stone-950 shrink-0" />
                  <span>Xem Bảng xếp hạng tuần</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setQuizMode("practice");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm py-3 px-4 shadow-md border-2 border-emerald-950 active:scale-95 transition cursor-pointer text-center"
                >
                  <Play size={16} className="text-amber-300 shrink-0" />
                  <span>Luyện tập</span>
                </button>
              </div>

              {/* NÚT PHỤ: VỀ TRANG CHỦ & CHIA SẺ */}
              <div className="mt-3 flex justify-center gap-2">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 px-4 py-2 text-xs font-bold shadow-2xs active:scale-95 transition"
                >
                  <Home size={14} /> Về Trang chủ
                </Link>
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 px-4 py-2 text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer"
                >
                  <Share2 size={14} /> Chia sẻ thành tích
                </button>
              </div>
            </>
          ) : (
            <>
              {/* KHỐI THÔNG BÁO THI THỬ (LUYỆN TẬP) */}
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/80 p-3 text-center text-xs font-semibold text-blue-950 space-y-1.5">
                <b className="text-blue-950 font-black flex items-center justify-center gap-1.5 text-xs">
                  <span>🎯 Kết quả bài thi thử (Luyện tập)</span>
                </b>
                <p className="text-[11px] leading-relaxed text-blue-900">
                  Bạn đã trả lời đúng <b>{sessionCorrect}/{total} câu</b> ({finalPercent}%).
                </p>
                <div className="rounded-xl bg-blue-100/80 border border-blue-200 p-2 text-[10px] text-blue-950 leading-relaxed font-medium">
                  ⚠️ <b>Lưu ý:</b> Lượt Thi thử <b>KHÔNG tính điểm BXH</b>. Chọn <b>"Thi chính thức"</b> để ghi danh bảng vàng!
                </div>
              </div>

              {/* NÚT XEM BẢNG XẾP HẠNG TUẦN (CHO BÀI THI THỬ) */}
              <div className="mt-4 flex justify-center">
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-stone-950 shadow-sm transition hover:brightness-105 active:scale-95"
                >
                  <Trophy size={16} /> Xem Bảng xếp hạng tuần
                </Link>
              </div>

              {/* CÁC NÚT ĐIỀU HƯỚNG KHI THI THỬ */}
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 active:scale-95 transition"
                >
                  <Home size={14} /> Về Trang chủ
                </Link>
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-50 active:scale-95 transition cursor-pointer"
                >
                  <Share2 size={14} /> Chia sẻ
                </button>
                <button
                  onClick={() => {
                    reset();
                    setQuizMode("practice");
                  }}
                  className="rounded-xl bg-stone-100 border border-stone-300 px-3.5 py-2 text-xs font-bold text-stone-800 shadow-2xs hover:bg-stone-200 active:scale-95 transition cursor-pointer"
                >
                  Thi thử lại
                </button>
                <button
                  onClick={() => {
                    reset();
                    setQuizMode("official");
                  }}
                  className="rounded-xl bg-amber-100 border border-amber-300 px-3.5 py-2 text-xs font-black text-amber-950 shadow-2xs hover:bg-amber-200 active:scale-95 transition cursor-pointer"
                >
                  Thi chính thức
                </button>
              </div>
            </>
          )}
        </section>

        {/* CỬA SỔ POPUP CHÚC MỪNG NHẬN VOUCHER (HIỂN THỊ DẠNG POPUP MODAL) */}
        {showEarnedVoucherModal && earnedVoucher && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-200">
              {/* Header Popup */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-3xl shadow-inner mb-2">
                  🎉
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Chúc Mừng Nhận Voucher!
                </h3>
                <p className="mt-1 text-xs text-emerald-200 font-bold">
                  Phần thưởng đạt {finalPercent}% điểm ({earnedVoucher.tier})
                </p>
              </div>

              {/* Nội dung Voucher trong Popup */}
              <div className="p-4 space-y-3 text-left text-xs">
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                      VOUCHER DÙNG TẠI CHỖ
                    </span>
                    <span className="text-sm font-black text-emerald-950">
                      {earnedVoucher.discount}
                    </span>
                  </div>
                  <div className="font-black text-stone-900 text-sm">{earnedVoucher.title}</div>
                  <div className="text-[11px] text-stone-600 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-700 shrink-0" />
                    <span className="truncate">{earnedVoucher.placeName}</span>
                  </div>
                </div>

                {/* Khung mã Code */}
                <div className="flex items-center justify-between gap-2 rounded-xl bg-stone-100 border border-stone-300 px-3 py-2 text-xs font-mono font-bold text-stone-900">
                  <span className="text-sm font-black text-emerald-950 truncate">{earnedVoucher.code}</span>
                  <button
                    onClick={async () => {
                      try {
                        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                          await navigator.clipboard.writeText(earnedVoucher.code);
                          alert(`Đã sao chép mã: ${earnedVoucher.code}`);
                        } else {
                          alert(`Mã voucher: ${earnedVoucher.code}`);
                        }
                      } catch {
                        alert(`Mã voucher: ${earnedVoucher.code}`);
                      }
                    }}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-[11px] font-bold hover:bg-emerald-900 active:scale-95 transition cursor-pointer"
                  >
                    <Copy size={12} /> Sao chép
                  </button>
                </div>

                {/* Ghi chú hướng dẫn sử dụng */}
                <div className="text-[11px] text-stone-600 leading-relaxed bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                  ✅ <b>Đã lưu vào Kho Voucher của bạn.</b> Khi đến quán/khách sạn tại Đắk Song, bạn chỉ cần mở voucher để nhân viên quầy bấm xác nhận áp dụng giảm giá nhé!
                </div>

                {/* Các nút bấm */}
                <div className="pt-1 space-y-2">
                  <Link
                    to="/vouchers"
                    onClick={() => setShowEarnedVoucherModal(false)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-2.5 px-4 text-xs font-black text-white shadow-xs active:scale-98 transition text-center"
                  >
                    <span>Vào Kho Voucher xem ngay</span>
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowEarnedVoucherModal(false)}
                    className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer text-center"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* THÔNG BÁO LƯỢT QUAY TÍCH LŨY */}
        {earnedSpins > 0 && (
          <div className="z-card p-3 border border-amber-300 bg-amber-50/90 text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-block rounded-full bg-amber-200/90 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-900 border border-amber-300">
                🎁 Hoàn thành nhiệm vụ ngày
              </span>
              <span className="text-xs font-black text-amber-900">+{earnedSpins} Lượt quay</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed">
              Bạn nhận được <b>{earnedSpins} lượt quay may mắn</b>. Hãy thử vận may ngay!
            </p>
            <button
              onClick={() => setIsLuckyWheelOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-black text-stone-950 shadow-2xs hover:from-amber-400 hover:to-amber-500 active:scale-98 transition cursor-pointer"
            >
              <Sparkles size={13} /> Chơi Vòng quay may mắn ngay
            </button>
          </div>
        )}

        {/* THÔNG BÁO GIỚI HẠN VOUCHER THI THỬ NẾU ĐÃ ĐẠT 3/3 HÔM NAY */}
        {!runWasOfficial && practiceVouchersToday >= MAX_PRACTICE_VOUCHERS && (
          <div className="z-card p-3.5 border border-amber-300 bg-amber-50/90 text-amber-950 space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
              <Gift size={14} className="text-amber-700 shrink-0" />
              <span>Đã nhận đủ 3/3 voucher thi thử hôm nay</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Mỗi ngày bạn chỉ có thể nhận tối đa 3 voucher từ phần thi thử. <b>Khi qua ngày mai, bạn mới được tiếp tục nhận thêm voucher nhé!</b> Hãy tham gia <b>Thi chính thức</b> để đua Top BXH tuần nhận voucher 30%!
            </p>
          </div>
        )}

        <div className="z-card p-4 text-xs font-semibold leading-relaxed text-stone-700">
          <b className="text-stone-900 font-bold">Quy tắc tính thưởng BXH tuần:</b> Điểm thi chính thức sẽ được tổng kết vào <b>ngày Chủ Nhật mỗi tuần</b>. <b>5 người đầu bảng</b> sẽ được tặng <b>voucher giảm giá 30%</b>!
        </div>

        {renderPracticeLimitModal()}
        {renderProfileModal()}
      </div>
    );
  }

  // ========== Màn hình chọn chủ đề / bắt đầu ==========
  if (!started) {
    return (
      <div className="space-y-5">
        <section className="z-card overflow-hidden shadow-lg">
          <div
            className="p-4 min-[375px]:p-5 sm:p-6 text-white"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.50) 0%, rgba(120, 53, 15, 0.82) 100%), url(${bgQuiz})`,
              backgroundPosition: "center 30%",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="inline-block rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-black text-amber-200">
              {quizMode === "official" ? "BÀI THI CHÍNH THỨC BXH TUẦN" : "CHẾ ĐỘ THI THỬ (LUYỆN TẬP)"}
            </div>
            <h1 className="mt-2.5 text-lg min-[360px]:text-xl min-[410px]:text-2xl sm:text-3xl font-black text-white whitespace-nowrap tracking-tight">
              Quiz khám phá Đắk Song
            </h1>
            <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-100">
              Khám phá câu hỏi về đại ngàn, thổ nhưỡng, văn hóa M’Nông và ẩm thực. Trả lời đúng để mở khóa điểm đến và nhận voucher!
            </p>
          </div>

          <div className="p-5 space-y-4">
            {/* TABS LỰA CHỌN: THI THỬ vs THI CHÍNH THỨC */}
            <div>
              <div className="text-xs font-black text-stone-700 uppercase tracking-wide mb-2">
                Chọn hình thức thi đấu:
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuizMode("practice")}
                  className={`py-3 px-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    quizMode === "practice"
                      ? "bg-white text-emerald-900 shadow-sm border border-emerald-300"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>Thi thử (Luyện tập)</span>
                  <span className="text-[10px] font-normal opacity-80 text-stone-500">
                    Không tính điểm BXH
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizMode("official")}
                  className={`py-3 px-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    quizMode === "official"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm border border-amber-500"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>Thi chính thức (BXH)</span>
                  <span className="text-[10px] font-semibold opacity-90 text-stone-950">
                    Săn voucher 30% Top 5
                  </span>
                </button>
              </div>
            </div>

            {/* NỘI DUNG TƯƠNG ỨNG TỪNG CHẾ ĐỘ */}
            {quizMode === "practice" ? (
              /* ===== KHỐI CHẾ ĐỘ THI THỬ ===== */
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. CHỌN CHỦ ĐỀ */}
                <div>
                  <div className="text-xs font-black text-stone-900 mb-2">Chọn chủ đề muốn luyện tập:</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((item) => (
                      <button
                        key={item}
                        onClick={() => setCategory(item)}
                        className={`rounded-full px-3.5 py-2 text-xs font-black transition cursor-pointer ${
                          category === item
                            ? "bg-emerald-800 text-white shadow-sm"
                            : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. NÚT BẮT ĐẦU THI THỬ */}
                <button
                  onClick={() => startQuiz("practice")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 px-4 py-3.5 text-sm font-black text-white shadow-md transition hover:opacity-95 active:scale-98 cursor-pointer"
                >
                  <Play size={18} />
                  Bắt đầu thi thử ({category})
                </button>

                {/* 3. THÔNG BÁO GIẢI THÍCH CHẾ ĐỘ THI THỬ */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs font-semibold text-blue-950 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black text-blue-800 tracking-wider">
                      THÔNG TIN CHẾ ĐỘ
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black shrink-0 shadow-2xs ${
                        practiceVouchersToday >= MAX_PRACTICE_VOUCHERS
                          ? "bg-amber-200 text-amber-950 border border-amber-400"
                          : "bg-blue-200 text-blue-950 border border-blue-300"
                      }`}
                    >
                      <Gift size={11} /> Voucher hôm nay: {practiceVouchersToday}/{MAX_PRACTICE_VOUCHERS}
                    </span>
                  </div>

                  <div className="font-black text-blue-950 text-sm sm:text-base leading-snug">
                    Chế độ Thi thử (Luyện tập)
                  </div>
                  <p className="text-[12px] text-blue-900/90 leading-relaxed font-normal">
                    Làm bài không giới hạn để rèn luyện kiến thức, tìm hiểu Đắk Song và nhận điểm tích lũy / quà nhiệm vụ ngày.
                  </p>
                  {practiceVouchersToday >= MAX_PRACTICE_VOUCHERS ? (
                    <div className="rounded-xl bg-amber-100 border border-amber-300 p-2.5 text-[11px] text-amber-950 leading-relaxed font-medium">
                      ⚠️ <b>Đã nhận đủ 3/3 voucher hôm nay:</b> Bạn vẫn có thể luyện tập bình thường. Để tiếp tục nhận thêm voucher thi thử, vui lòng chờ qua ngày mai hoặc tham gia <b>Thi chính thức</b> để săn voucher 30% nhé!
                    </div>
                  ) : (
                    <div className="inline-block rounded-lg bg-blue-100 border border-blue-300 px-2.5 py-1 text-[11px] font-black text-blue-950">
                      ⚠️ Lưu ý: Kết quả thi thử KHÔNG tính điểm vào BXH tuần!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ===== KHỐI CHẾ ĐỘ THI CHÍNH THỨC ===== */
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. HIỂN THỊ TÊN TÀI KHOẢN ZALO DỰ THI */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">
                      TÀI KHOẢN DỰ THI
                    </span>
                    <button
                      type="button"
                      onClick={handleChangeUserName}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-[10px] font-bold text-amber-950 hover:bg-amber-100 active:scale-95 transition shadow-2xs cursor-pointer flex items-center gap-1"
                      title="Đổi tên hiển thị và ảnh đại diện dự thi"
                    >
                      <span>✏️ Đổi tên & Avatar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={currentUserProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-black text-stone-950">
                        {currentUserProfile?.name || "Đang tải tên Zalo..."}
                      </span>
                      {currentUserProfile?.id && (
                        <span className="text-[11px] font-mono font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded-md border border-amber-400 shrink-0 shadow-2xs">
                          {getPlayerTag(currentUserProfile.id)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. KHỐI TRẠNG THÁI & NÚT BẮT ĐẦU THI CHÍNH THỨC */}
                {serverAttempt ? (
                  /* TRƯỜNG HỢP 1: ĐÃ THI VÀ ĐANG CÓ BẢN GHI TRÊN BXH TUẦN (CHỈ ĐƯỢC THI 1 LẦN DUY NHẤT) */
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/95 p-4 text-emerald-950 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-700 shrink-0" size={20} />
                      <div>
                        <div className="font-black text-sm text-emerald-950">
                          Bạn đã hoàn thành bài thi chính thức tuần này!
                        </div>
                        <div className="text-[11px] text-emerald-800">
                          Mỗi thí sinh chỉ được thi 1 lần duy nhất trong giai đoạn kì thi.
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-emerald-200/90 flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-500">
                          Kết quả ghi nhận trên BXH:
                        </div>
                        <div className="text-sm font-black text-emerald-950 mt-0.5 flex items-center gap-2">
                          <span>{serverAttempt.score}/{serverAttempt.totalQuestions} câu</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-xs text-stone-700 font-mono">⏱️ {formatDuration(serverAttempt.timeMs)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs shadow-2xs">
                          Hạng #{serverAttempt.rank}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-emerald-900 font-medium">
                      Điểm thi của bạn đang được xếp hạng và sẽ <b>tổng kết vào lúc 23:59 Chủ Nhật</b> (Top 5 nhận voucher 30%). Bạn có thể theo dõi thứ hạng trên BXH hoặc tiếp tục luyện tập ở chế độ Thi thử nhé!
                    </p>

                    <div className="pt-1.5 grid grid-cols-2 gap-2.5">
                      <Link
                        to="/leaderboard"
                        className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md border-2 border-amber-500 active:scale-95 transition text-center"
                      >
                        <Trophy size={15} className="text-stone-950 shrink-0" />
                        <span>Xem BXH tuần</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setQuizMode("practice")}
                        className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs shadow-md border-2 border-emerald-950 active:scale-95 transition cursor-pointer text-center"
                      >
                        <Play size={15} className="text-amber-300 shrink-0" />
                        <span>Luyện tập</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* TRƯỜNG HỢP: CHƯA THI HOẶC ĐÃ ĐƯỢC ADMIN RESET/XÓA KHỎI BXH */
                  <button
                    onClick={() => startQuiz("official")}
                    disabled={isCheckingAttempt}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-4 py-3.5 text-sm font-black text-stone-950 shadow-md transition hover:brightness-105 active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={18} />
                    <span>{isCheckingAttempt ? "Đang kiểm tra lượt thi..." : "Bắt đầu thi chính thức ngay"}</span>
                  </button>
                )}

                {/* 3. THÔNG BÁO GIẢI THÍCH QUY CHẾ BÀI THI CHÍNH THỨC */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-950 space-y-2">
                  <div className="font-black text-amber-950 text-sm">
                    Quy chế bài Thi chính thức (BXH tuần)
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-amber-950 leading-relaxed list-disc list-inside">
                    <li>
                      <b>Mỗi tuần thi 1 lần:</b> Trong suốt kì thi tuần, mỗi thí sinh chỉ được nộp bài chính thức <b>1 lần duy nhất</b> để đảm bảo tính công bằng.
                    </li>
                    <li>
                      <b>Bắt đầu tính điểm:</b> Kết quả và thời gian làm bài sẽ được ghi nhận trực tiếp vào <b>Bảng xếp hạng tuần</b> (Bộ đề chuẩn 25 câu Tổng hợp).
                    </li>
                    <li>
                      <b>Thời gian tổng kết:</b> Điểm sẽ <b>tổng kết vào ngày Chủ Nhật mỗi tuần (lúc 23:59)</b>.
                    </li>
                    <li>
                      <b>Phần thưởng hấp dẫn:</b> <b>5 người đầu bảng (Top 5)</b> sẽ được tặng <b>voucher giảm giá tốt nhất là 30%</b>!
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {renderPracticeLimitModal()}
        {renderProfileModal()}
      </div>
    );
  }

  // ========== Màn hình đang chơi ==========
  const question = sessionQuestions[index];
  if (!question) {
    return (
      <div className="z-card p-6 text-center">
        <p className="font-bold text-stone-900">Không tìm thấy câu hỏi. Vui lòng tải lại.</p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-emerald-800 px-4 py-2 font-black text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const total = sessionQuestions.length;

  return (
    <div className="space-y-4">
      <section>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-stone-950 sm:text-2xl">
              {runWasOfficial ? "Thử thách BXH tuần (Chính thức)" : "Quiz luyện tập Đắk Song (Thi thử)"}
            </h1>
            <p className="mt-1 text-xs font-bold text-stone-700">
              {runWasOfficial
                ? "Tính điểm BXH tuần • Tổng kết Chủ Nhật • Top 5 nhận Voucher 30%"
                : "Chế độ thi thử • Không tính điểm vào BXH tuần"}
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-emerald-950 px-3.5 py-1.5 text-xs font-black text-amber-200 tabular-nums shadow-sm">
            ⏱ {formatDuration(elapsedMs)}
          </div>
        </div>
      </section>

      {/* Hiển thị chủ đề hiện tại */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            disabled
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black disabled:cursor-not-allowed ${
              category === item
                ? "bg-emerald-800 text-white"
                : "border border-stone-200 bg-white/70 text-stone-500 opacity-60"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="z-card p-4 sm:p-5 shadow-md">
        <ProgressBar
          value={Math.round((index / total) * 100)}
          label={`Câu ${index + 1}/${total}`}
        />
        <div className="mt-5">
          <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-950 border border-amber-300">
            {question.category}
          </span>
          <h2 className="mt-2.5 text-lg font-black leading-snug text-stone-950 sm:text-xl">
            {question.question}
          </h2>
        </div>

        <div className="mt-5 space-y-2.5">
          {question.options.map((option, optionIndex) => {
            const isCorrect = optionIndex === question.answerIndex;
            const isSelected = selected === optionIndex;
            let cls = "border-stone-300 bg-white text-stone-900 hover:border-emerald-600 hover:bg-emerald-50/40";
            if (selected !== null && isCorrect) {
              cls = "border-emerald-700 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-700 font-black";
            } else if (selected !== null && isSelected) {
              cls = "border-red-600 bg-red-100 text-red-950 ring-2 ring-red-600 font-black";
            }
            return (
              <button
                key={`${question.id}-${optionIndex}`}
                onClick={() => choose(optionIndex)}
                disabled={selected !== null}
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm font-bold transition disabled:cursor-default ${cls}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-black text-stone-900 ring-1 ring-stone-300">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span>{option}</span>
                </span>
                {selected !== null && isCorrect && (
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-800" />
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <XCircle size={20} className="shrink-0 text-red-700" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* POPUP THÔNG BÁO KẾT QUẢ CÂU TRẢ LỜI */}
      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl border-2 p-5 sm:p-6 shadow-2xl text-center bg-white transition-all transform animate-in zoom-in-95 duration-200 ${
              selected === question.answerIndex
                ? "border-emerald-500"
                : "border-red-500"
            }`}
          >
            {/* Icon trạng thái */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-3.5">
              {selected === question.answerIndex ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
                  <CheckCircle2 size={36} className="stroke-[2.5]" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
                  <XCircle size={36} className="stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Tiêu đề popup */}
            <h3
              className={`text-xl font-black ${
                selected === question.answerIndex ? "text-emerald-800" : "text-red-700"
              }`}
            >
              {selected === question.answerIndex ? "Chính xác! 🎉" : "Chưa chính xác! ❌"}
            </h3>

            {/* Nếu trả lời sai, chỉ rõ đáp án đúng */}
            {selected !== question.answerIndex && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-stone-800 text-left">
                <span className="font-bold text-amber-950">Đáp án chính xác: </span>
                <span className="font-extrabold text-emerald-900 block mt-0.5">
                  {question.options[question.answerIndex]}
                </span>
              </div>
            )}

            {/* Giải thích chi tiết */}
            {question.explanation && (
              <div className="mt-3 rounded-2xl bg-stone-50 border border-stone-200 p-3 text-xs leading-relaxed text-stone-700 text-left">
                <span className="font-black text-stone-900 block mb-1">💡 Bạn có biết:</span>
                {question.explanation}
              </div>
            )}

            {/* Nút sang câu tiếp theo hoặc xem kết quả */}
            <button
              onClick={next}
              className={`mt-4 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-black text-white shadow-md active:scale-98 transition cursor-pointer ${
                selected === question.answerIndex
                  ? "bg-gradient-to-r from-emerald-700 to-teal-800 hover:brightness-105"
                  : "bg-gradient-to-r from-stone-800 to-stone-900 hover:brightness-110"
              }`}
            >
              <span>{index >= total - 1 ? "Xem kết quả tổng kết" : "Câu tiếp theo"}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {renderPracticeLimitModal()}
      {renderProfileModal()}
    </div>
  );
}
