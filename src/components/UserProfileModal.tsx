import { useEffect, useState } from "react";
import { Check, RefreshCw, User, X } from "lucide-react";
import { apiFetch } from "../services/apiConfig";
import { zmpSdk, type ZaloUserProfile } from "../services/zmp-sdk";
import avatar1 from "../assets/avatars/avatar-1.png";
import avatar2 from "../assets/avatars/avatar-2.png";
import avatar3 from "../assets/avatars/avatar-3.png";
import avatar4 from "../assets/avatars/avatar-4.png";
import avatar5 from "../assets/avatars/avatar-5.png";

export const DEFAULT_AVATAR = avatar1;

export const PRESET_AVATARS = [
  {
    id: "avatar-1",
    label: "Cụ bà M’Nông",
    url: avatar1,
  },
  {
    id: "avatar-2",
    label: "Bé trai thổi sáo",
    url: avatar2,
  },
  {
    id: "avatar-3",
    label: "Thiếu nữ dệt vải",
    url: avatar3,
  },
  {
    id: "avatar-4",
    label: "Già làng M’Nông",
    url: avatar4,
  },
  {
    id: "avatar-5",
    label: "Bé gái đeo gùi",
    url: avatar5,
  },
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: ZaloUserProfile | null;
  onSaved: (updatedProfile: ZaloUserProfile) => void;
  attemptId?: number;
  weekId?: string;
}

export function UserProfileModal({
  isOpen,
  onClose,
  initialProfile,
  onSaved,
  attemptId,
  weekId,
}: UserProfileModalProps) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "info" | "success" | "warn"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialProfile?.name || "");
      setAvatar(initialProfile?.avatar || DEFAULT_AVATAR);
      setStatusMessage(null);
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: "warn", text: "Vui lòng nhập tên hiển thị của bạn!" });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const cleanName = name.trim();
      const cleanAvatar = avatar.trim() || DEFAULT_AVATAR;

      // 1. Cập nhật local storage và state SDK (giữ nguyên ID ổn định)
      const updated = zmpSdk.setUserProfile({
        name: cleanName,
        avatar: cleanAvatar,
      });

      // 2. Gửi lệnh cập nhật trực tiếp lên SQL Server Backend (đổi tên trên dòng hiện tại, không tạo dòng mới)
      try {
        await apiFetch("/api/leaderboard/rename", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: updated.id,
            oldUserId: initialProfile?.id || updated.id,
            oldName: initialProfile?.name,
            newName: cleanName,
            avatarUrl: cleanAvatar,
            weekId,
            attemptId,
          }),
        });
      } catch (err) {
        console.warn("Lưu tên lên server cảnh báo:", err);
      }

      onSaved(updated);
      onClose();
    } catch (err: any) {
      console.error("Lỗi khi lưu profile:", err);
      setStatusMessage({ type: "warn", text: "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại!" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-emerald-800 to-amber-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <User size={18} className="text-amber-300" />
            <h2 className="text-sm sm:text-base font-bold">Hồ sơ Thí sinh Zalo</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội dung Form */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4 text-stone-850 text-xs">
          {/* Thông báo trạng thái nếu có */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : statusMessage.type === "warn"
                  ? "bg-red-50 border-red-300 text-red-900"
                  : "bg-blue-50 border-blue-300 text-blue-900"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Khung xem trước Avatar + Nút Đồng bộ Zalo */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="relative shrink-0">
              <img
                src={avatar || DEFAULT_AVATAR}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                }}
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 text-white text-[9px] font-bold border border-white">
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-stone-700">Ảnh đại diện trên BXH</div>
              <p className="text-[10px] text-stone-500 mt-0.5">
                Nhấn chọn 1 trong 5 hình mẫu Đắk Song bên dưới.
              </p>
            </div>
          </div>

          {/* Chọn ảnh mẫu có sẵn */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
              Chọn ảnh đại diện mẫu (5 phong cách Đắk Song):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AVATARS.map((item) => {
                const isSelected = avatar === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAvatar(item.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition active:scale-95 cursor-pointer ${
                      isSelected ? "border-amber-500 ring-2 ring-amber-400 shadow-sm" : "border-stone-200 hover:border-stone-400"
                    }`}
                    title={item.label}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <span className="absolute inset-0 bg-amber-900/30 grid place-items-center text-white">
                        <Check size={14} className="stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ô nhập Tên hiển thị */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              Tên hiển thị trên Bảng xếp hạng: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hoàng Long, Nguyễn Văn A..."
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 focus:border-emerald-600 focus:outline-hidden shadow-2xs"
            />
          </div>

          {/* Hướng dẫn đơn giản */}
          <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-2.5 text-[10px] text-amber-950 leading-relaxed">
            <span className="font-bold text-amber-900">💡 Gợi ý:</span> Chọn 1 ảnh đại diện mẫu ở trên và đặt tên hiển thị tùy thích để thể hiện cá tính trên Bảng xếp hạng!
          </div>

          {/* Nút bấm Lưu & Đóng */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <RefreshCw size={12} className="animate-spin" />}
              <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

