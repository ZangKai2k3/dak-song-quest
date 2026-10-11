export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** Cách nhận (hiển thị cho người chơi) */
  howTo: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: "explorer-start",
    name: "Explorer",
    description: "Bắt đầu hành trình khám phá Đắk Song.",
    emoji: "🧭",
    howTo: "Hoàn thành nhiệm vụ Khởi động Explorer (trả lời từ câu thứ 3 trở đi).",
  },
  {
    id: "hidden-gem",
    name: "Hidden Gem Hunter",
    description: "Tìm được viên ngọc ẩn của địa phương.",
    emoji: "💎",
    howTo: "Trả lời đúng 1 câu thuộc chủ đề Hidden Gems.",
  },
  {
    id: "silver",
    name: "Silver Traveler",
    description: "Đạt tỷ lệ đúng từ 70% trong một lượt quiz.",
    emoji: "🥈",
    howTo: "Hoàn thành quiz với ≥70% câu đúng.",
  },
  {
    id: "gold",
    name: "Gold Traveler",
    description: "Đạt tỷ lệ đúng từ 80% trong một lượt quiz.",
    emoji: "🥇",
    howTo: "Hoàn thành quiz với ≥80% câu đúng.",
  },
  {
    id: "diamond",
    name: "Diamond Explorer",
    description: "Đạt tỷ lệ đúng từ 90% trong một lượt quiz.",
    emoji: "💠",
    howTo: "Hoàn thành quiz với ≥90% câu đúng.",
  },
  {
    id: "weekly-official",
    name: "BXH Tuần",
    description: "Đã ghi nhận lượt thi chính thức trong tuần.",
    emoji: "🏆",
    howTo: "Hoàn thành lượt thi BXH tuần (lần đầu trong tuần).",
  },
];
