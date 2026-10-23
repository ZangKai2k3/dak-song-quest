import {
  openShareSheet as zmpOpenShareSheet,
  openWebview as zmpOpenWebview,
  getLocation as zmpGetLocation,
  openPhone as zmpOpenPhone,
  getUserInfo as zmpGetUserInfo,
  authorize as zmpAuthorize,
} from "zmp-sdk";
import defaultAvatar from "../assets/avatars/avatar-1.png";

export interface LocationResult {
  latitude: number;
  longitude: number;
}

export interface ShareResult {
  shared: boolean;
}

export interface WebviewResult {
  opened: boolean;
}

export interface ZaloUserProfile {
  id: string;
  name: string;
  avatar: string;
}

export interface ZmpSdkAdapter {
  getLocation(): Promise<LocationResult>;
  openShareSheet(payload: { title: string; content: string }): Promise<ShareResult>;
  openWebview(url: string): Promise<WebviewResult>;
  openPhone(phoneNumber: string): Promise<void>;
  getUserProfile(forcePrompt?: boolean): Promise<ZaloUserProfile>;
  setUserProfile(profile: Partial<ZaloUserProfile>): ZaloUserProfile;
}

const DEVICE_USER_ID_KEY = "dak_song_device_user_id";
const USER_PROFILE_KEY = "dak_song_user_profile";

export function getStableUserId(): string {
  try {
    let id = localStorage.getItem(DEVICE_USER_ID_KEY);
    if (id && id.trim()) return id.trim();

    // Thử lấy từ profile đã lưu
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.id && typeof parsed.id === "string" && parsed.id.trim()) {
        localStorage.setItem(DEVICE_USER_ID_KEY, parsed.id.trim());
        return parsed.id.trim();
      }
    }

    // Nếu chưa có, tạo 1 ID vĩnh viễn cho trình duyệt/thiết bị này
    id = `zalo-user-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(DEVICE_USER_ID_KEY, id);
    return id;
  } catch {
    return "zalo-user-guest";
  }
}

/**
 * Tích hợp chuẩn Zalo Mini App SDK với fallback an toàn khi chạy trên trình duyệt web.
 */
export const zmpSdk: ZmpSdkAdapter = {
  async getLocation() {
    try {
      await zmpGetLocation();
      return { latitude: 12.55, longitude: 107.72 };
    } catch {
      return { latitude: 12.55, longitude: 107.72 };
    }
  },

  async openShareSheet(payload) {
    try {
      await zmpOpenShareSheet({
        type: "text",
        data: {
          text: `${payload.title}\n\n${payload.content}`,
        },
      });
      return { shared: true };
    } catch {
      // Fallback khi chạy trên browser thường
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ title: payload.title, text: payload.content });
          return { shared: true };
        } catch {
          return { shared: false };
        }
      }
      return { shared: true };
    }
  },

  async openWebview(url) {
    try {
      await zmpOpenWebview({ url });
      return { opened: true };
    } catch {
      // Fallback khi chạy trên browser thường
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return { opened: true };
    }
  },

  async openPhone(phoneNumber: string) {
    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
    try {
      // Gọi API chính thức của Zalo Mini App
      await zmpOpenPhone({ phoneNumber: cleanNumber });
    } catch {
      // Fallback khi chạy trên trình duyệt web thường
      if (typeof window !== "undefined") {
        window.location.href = `tel:${cleanNumber}`;
      }
    }
  },

  setUserProfile(profile: Partial<ZaloUserProfile>): ZaloUserProfile {
    const stableId = getStableUserId();
    let currentName = "Thí sinh Zalo";
    let currentAvatar = defaultAvatar;

    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) currentName = parsed.name;
        if (parsed?.avatar) currentAvatar = parsed.avatar;
      }
    } catch {}

    const updated: ZaloUserProfile = {
      id: profile.id || stableId,
      name: (profile.name !== undefined ? profile.name : currentName).trim(),
      avatar: profile.avatar || currentAvatar,
    };

    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
      localStorage.setItem(DEVICE_USER_ID_KEY, updated.id);
    } catch {}
    return updated;
  },

  async getUserProfile(forcePrompt = false): Promise<ZaloUserProfile> {
    const stableId = getStableUserId();
    let cachedProfile: ZaloUserProfile | null = null;
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          cachedProfile = {
            id: parsed.id || stableId,
            name: parsed.name,
            avatar: parsed.avatar || defaultAvatar,
          };
        }
      }
    } catch {}

    // 1. Nếu không ép buộc đồng bộ Zalo và đã có profile lưu thì dùng luôn
    if (!forcePrompt && cachedProfile) {
      return cachedProfile;
    }

    // 2. Thử gọi API chính thức của Zalo Mini App SDK (hoạt động khi chạy trên app Zalo điện thoại)
    try {
      if (forcePrompt) {
        // Chủ động xin quyền truy cập Tên và Ảnh đại diện Zalo theo Nghị Định 13
        try {
          await zmpAuthorize({ scopes: ["scope.userInfo"] });
        } catch (authErr) {
          console.warn("Zalo authorize scope.userInfo:", authErr);
        }
      }

      // autoRequestPermission: true để Zalo hiển thị popup xin quyền
      const res = await zmpGetUserInfo({
        autoRequestPermission: true,
        avatarType: "normal",
      });

      if (res && res.userInfo && res.userInfo.name) {
        const u = res.userInfo;
        const profile: ZaloUserProfile = {
          id: u.id || stableId,
          name: u.name,
          avatar: u.avatar || cachedProfile?.avatar || defaultAvatar,
        };
        try {
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
          localStorage.setItem(DEVICE_USER_ID_KEY, profile.id);
        } catch {}
        return profile;
      }
    } catch (err) {
      // Xảy ra khi chạy trên trình duyệt web máy tính (dev) hoặc người dùng từ chối quyền trên Zalo
      console.warn("Không thể lấy thông tin Zalo tự động qua ZMP SDK (môi trường Web hoặc chưa cấp quyền):", err);
    }

    // 3. Fallback: dùng cachedProfile nếu có, hoặc tạo default profile với stableId cố định
    if (cachedProfile) {
      return cachedProfile;
    }

    const defaultProfile: ZaloUserProfile = {
      id: stableId,
      name: "Tài khoản Zalo của bạn",
      avatar: defaultAvatar,
    };
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
    } catch {}
    return defaultProfile;
  },
};