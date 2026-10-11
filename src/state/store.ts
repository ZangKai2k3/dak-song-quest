import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { CartItem, PlacedOrder, QuizCategory, ShippingAddress, Voucher, Weather, WeeklyAttempt } from "../types";
import { getWeekId } from "../utils/quiz";

import { getTodayDateString } from "../data/tasks";

export const scoreAtom = atomWithStorage("dak-song-score", 0);
export const answeredAtom = atomWithStorage("dak-song-answered", 0);
export const unlockedPlacesAtom = atomWithStorage<string[]>("dak-song-unlocked-places", []);
export const claimedVouchersAtom = atomWithStorage<Voucher[]>("dak-song-claimed-vouchers", []);

/**
 * Trạng thái nhiệm vụ hàng ngày: Tự động reset danh sách hoàn thành khi sang ngày mới
 */
export interface DailyTasksState {
  date: string;
  completedTaskIds: string[];
}

export const dailyTasksStorageAtom = atomWithStorage<DailyTasksState>(
  "dak-song-daily-tasks-state",
  { date: getTodayDateString(), completedTaskIds: [] },
);

export const completedTaskIdsAtom = atom(
  (get) => {
    const state = get(dailyTasksStorageAtom);
    const today = getTodayDateString();
    return state.date === today ? state.completedTaskIds : [];
  },
  (get, set, update: string[] | ((prev: string[]) => string[])) => {
    const state = get(dailyTasksStorageAtom);
    const today = getTodayDateString();
    const currentCompleted = state.date === today ? state.completedTaskIds : [];
    const nextCompleted = typeof update === "function" ? update(currentCompleted) : update;
    set(dailyTasksStorageAtom, {
      date: today,
      completedTaskIds: nextCompleted,
    });
  },
);

/**
 * Giới hạn nhận voucher trong phần thi thử: Tối đa 3 voucher / ngày, tự động reset khi qua ngày mới
 */
export interface DailyPracticeVoucherState {
  date: string;
  count: number;
}

export const dailyPracticeVouchersStorageAtom = atomWithStorage<DailyPracticeVoucherState>(
  "dak-song-daily-practice-vouchers",
  { date: getTodayDateString(), count: 0 },
);

export const dailyPracticeVouchersCountAtom = atom(
  (get) => {
    const state = get(dailyPracticeVouchersStorageAtom);
    const today = getTodayDateString();
    return state.date === today ? state.count : 0;
  },
  (get, set, update: number | ((prev: number) => number)) => {
    const state = get(dailyPracticeVouchersStorageAtom);
    const today = getTodayDateString();
    const currentCount = state.date === today ? state.count : 0;
    const nextCount = typeof update === "function" ? update(currentCount) : update;
    set(dailyPracticeVouchersStorageAtom, {
      date: today,
      count: nextCount,
    });
  },
);

/** Số lượt quay may mắn tích lũy: BẢO LƯU VĨNH VIỄN KHÔNG BỊ RESET QUA NGÀY */
export const luckySpinsAtom = atomWithStorage<number>("dak-song-lucky-spins", 1);
export const isLuckyWheelOpenAtom = atom<boolean>(false);
/** Danh sách id huy hiệu đã nhận (persist) */
export const earnedBadgesAtom = atomWithStorage<string[]>("dak-song-earned-badges", []);
export const selectedCategoryAtom = atom<QuizCategory>("Tổng hợp");
export const weatherAtom = atom<Weather | null>(null);

// Lưu kết quả chính thức của lượt chơi đầu tiên trong tuần vào localStorage.
export const weeklyAttemptStorageAtom = atomWithStorage<WeeklyAttempt | null>(
  "dak-song-weekly-attempt",
  null,
);

export const weeklyAttemptAtom = atom((get) => {
  const attempt = get(weeklyAttemptStorageAtom);
  return attempt?.weekId === getWeekId() ? attempt : null;
});

export const discoveryPercentAtom = atom((get) => {
  const unlocked = get(unlockedPlacesAtom).length;
  return Math.min(100, Math.round((unlocked / 5) * 100));
});

export const tierAtom = atom((get) => {
  const answered = get(answeredAtom);
  const score = get(scoreAtom);
  if (answered === 0) return "Chưa xếp hạng";
  const percent = (score / answered) * 100;
  if (percent >= 90) return "Diamond";
  if (percent >= 80) return "Gold";
  if (percent >= 70) return "Silver";
  return "Explorer";
});

/** ===== GIAN HÀNG ĐẶC SẢN OCOP & GIỎ HÀNG ===== **/
export const cartItemsAtom = atomWithStorage<CartItem[]>("dak-song-cart-items", []);

export const defaultShippingAddressAtom = atomWithStorage<ShippingAddress>(
  "dak-song-default-shipping-address",
  {
    customerName: "",
    phone: "",
    address: "",
    note: "",
  },
);

export const placedOrdersAtom = atomWithStorage<PlacedOrder[]>("dak-song-placed-orders", []);

export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.quantity, 0);
});

export const cartTotalAmountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
});
