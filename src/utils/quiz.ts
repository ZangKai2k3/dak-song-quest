import type { QuizQuestion } from "../types";

export function getVietnamDate(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

export function getWeekId(date = new Date()): string {
  const vnDate = getVietnamDate(date);
  const target = new Date(Date.UTC(vnDate.getFullYear(), vnDate.getMonth(), vnDate.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function formatDuration(timeMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${milliseconds}`;
}

/** Fisher–Yates shuffle (returns new array). */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepare a quiz session:
 * - Shuffle question order
 * - Shuffle options of every question and update answerIndex accordingly
 * so each play feels fresh and correct answer is not always A.
 */
export function prepareQuizSession(source: QuizQuestion[]): QuizQuestion[] {
  return shuffle(source).map((q) => {
    const indices = q.options.map((_, i) => i);
    const shuffledIndices = shuffle(indices);
    const newOptions = shuffledIndices.map((i) => q.options[i]);
    const newAnswerIndex = shuffledIndices.indexOf(q.answerIndex);
    return {
      ...q,
      options: newOptions,
      answerIndex: newAnswerIndex,
    };
  });
}

/**
 * Tạo mã nhận diện thí sinh ngắn 4 số (#1000 - #9999) cố định từ userId hoặc attemptId.
 * Giúp phân biệt rõ ràng hai người chơi trùng tên và trùng ảnh đại diện.
 */
export function getPlayerTag(userId?: string, attemptId?: number): string {
  if (!userId && attemptId) {
    return `#${String(attemptId).padStart(4, "0").slice(-4)}`;
  }
  if (!userId) return "#1001";

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const tagNum = (hash % 9000) + 1000;
  return `#${tagNum}`;
}
