import type { DailyTask, QuizCategory } from "../types";

export interface TaskDefinition extends DailyTask {
  categoryRequired?: QuizCategory;
  correctAnswersRequired?: number;
  type: "answer_count" | "category_correct" | "finish_quiz" | "spin_wheel";
}

/**
 * Lấy chuỗi ngày hôm nay dạng YYYY-MM-DD theo giờ địa phương Việt Nam
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Kho nhiệm vụ phong phú đa dạng chủ đề về Đắk Song
 */
export const taskPool: TaskDefinition[] = [
  {
    id: "t_answer_3",
    title: "Khởi động cao nguyên",
    description: "Trả lời đúng ít nhất 3 câu hỏi bất kỳ trong ngày hôm nay.",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "answer_count",
    correctAnswersRequired: 3,
  },
  {
    id: "t_hidden_gem",
    title: "Săn lùng Hidden Gems",
    description: "Trả lời đúng 1 câu hỏi thuộc chủ đề Hidden Gems Đắk Song.",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "category_correct",
    categoryRequired: "Hidden Gems",
  },
  {
    id: "t_mnong_culture",
    title: "Giai điệu cồng chiêng",
    description: "Trả lời đúng 1 câu hỏi thuộc chủ đề Văn hóa M’Nông.",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "category_correct",
    categoryRequired: "Văn hóa M’Nông",
  },
  {
    id: "t_food",
    title: "Hương vị Đắk Song",
    description: "Trả lời đúng 1 câu hỏi thuộc chủ đề Ẩm thực Đắk Song (cà phê, hồ tiêu, cơm lam).",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "category_correct",
    categoryRequired: "Ẩm thực",
  },
  {
    id: "t_nature",
    title: "Hùng vĩ đại ngàn",
    description: "Trả lời đúng 1 câu hỏi thuộc chủ đề Thiên nhiên & Khí hậu Đắk Song.",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "category_correct",
    categoryRequired: "Thiên nhiên",
  },
  {
    id: "t_finish_quiz",
    title: "Chinh phục thử thách",
    description: "Hoàn thành trọn vẹn 1 bài thi trắc nghiệm (Thi thử hoặc Thi chính thức).",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "finish_quiz",
  },
  {
    id: "t_spin_wheel",
    title: "Vận may gõ cửa",
    description: "Thực hiện 1 lượt quay Vòng quay may mắn nhận quà hôm nay.",
    reward: "+1 Lượt quay may mắn",
    completed: false,
    type: "spin_wheel",
  },
];

/**
 * Tự động chọn ra danh sách nhiệm vụ khác biệt cho từng ngày.
 * Cùng một ngày sẽ có bộ nhiệm vụ cố định; qua ngày hôm sau sẽ tự đổi sang bộ nhiệm vụ mới khác.
 */
export function getDailyTasksForDate(dateStr: string = getTodayDateString()): TaskDefinition[] {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || new Date().getMonth() + 1;
  const day = parts[2] || new Date().getDate();

  const dayValue = Math.floor(new Date(year, month - 1, day).getTime() / (1000 * 60 * 60 * 24));
  const poolSize = taskPool.length;

  const idx1 = Math.abs(dayValue) % poolSize;
  const idx2 = (idx1 + 2) % poolSize;
  const idx3 = (idx1 + 4) % poolSize;

  const selectedIndexes = [idx1, idx2, idx3];
  return selectedIndexes.map((i) => ({ ...taskPool[i] }));
}

/** Danh sách nhiệm vụ mặc định cho ngày hôm nay */
export const dailyTasks = getDailyTasksForDate();