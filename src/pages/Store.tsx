import { useEffect, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Edit2,
  ExternalLink,
  Gift,
  Info,
  Lock,
  MapPin,
  Minus,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { ocopProducts as defaultOcopProducts } from "../data/products";
import { apiFetch } from "../services/apiConfig";
import {
  cartCountAtom,
  cartItemsAtom,
  cartTotalAmountAtom,
  claimedVouchersAtom,
  defaultShippingAddressAtom,
  placedOrdersAtom,
} from "../state/store";
import type { OCOPProduct, PlacedOrder } from "../types";

const CATEGORIES = ["Tất cả", "Hạt tiêu", "Cà phê", "Hạt dinh dưỡng", "Nông sản khô"] as const;

export const VIETNAM_PROVINCES = [
  "Đắk Nông",
  "Đắk Lắk",
  "Gia Lai",
  "Lâm Đồng",
  "Kon Tum",
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Phước",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Cần Thơ",
  "Khánh Hòa",
  "Bình Thuận",
  "Ninh Thuận",
  "Bình Định",
  "Phú Yên",
  "Quảng Nam",
  "Quảng Ngãi",
  "Thừa Thiên Huế",
  "Quảng Trị",
  "Quảng Bình",
  "Hà Tĩnh",
  "Nghệ An",
  "Thanh Hóa",
  "Ninh Bình",
  "Nam Định",
  "Thái Bình",
  "Hải Phòng",
  "Hải Dương",
  "Hưng Yên",
  "Bắc Ninh",
  "Bắc Giang",
  "Vĩnh Phúc",
  "Phú Thọ",
  "Thái Nguyên",
  "Quảng Ninh",
  "Lạng Sơn",
  "Cao Bằng",
  "Hà Giang",
  "Tuyên Quang",
  "Lào Cai",
  "Yên Bái",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Hòa Bình",
  "Long An",
  "Tiền Giang",
  "Bến Tre",
  "Trà Vinh",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Cà Mau",
  "Bạc Liêu",
  "Sóc Trăng",
  "Hậu Giang",
  "Tây Ninh",
];

// ĐỊNH DẠNG THỜI GIAN CHUẨN GIỜ VIỆT NAM (GMT+7)
function formatVietnamDateTime(raw: string | undefined): string {
  if (!raw) return 'Không rõ';
  const clean = raw.replace('Z', '').replace('T', ' ').trim();
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    const [dPart, tPart] = parts;
    const dateSub = dPart.split('-');
    if (dateSub.length === 3) {
      const [year, month, day] = dateSub;
      const timeSub = tPart.split('.')[0];
      return `${timeSub} ${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  const d = new Date(raw);
  return isNaN(d.getTime()) ? String(raw) : d.toLocaleString('vi-VN');
}

// THANH TIẾN ĐỘ 4 BƯỚC ĐIỀU PHỐI ĐƠN HÀNG THỜI GIAN THỰC
function OrderProgressTracker({ status, note, paymentMethod }: { status: string; note?: string; paymentMethod?: string }) {
  if (status === "Cancelled") {
    const isHTXCancelled = note && (note.includes("Hợp tác xã") || note.includes("chất lượng") || note.includes("số lượng"));
    return (
      <div className="rounded-xl bg-red-50 p-2.5 border border-red-200 text-red-900 text-xs font-medium space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-red-800">
          <XCircle size={15} className="text-red-600 shrink-0" />
          <span>{isHTXCancelled ? "Đơn hàng do Hợp tác xã hủy điều phối" : "Đơn hàng đã được HỦY"}</span>
        </div>
        <p className="text-[11px] text-red-700 leading-relaxed font-semibold">
          {note || (paymentMethod === "COD" ? "Đơn hàng COD đã hủy, quý khách không phải thanh toán." : "Tiền đã được hoàn về ví ZaloPay của bạn.")}
        </p>
      </div>
    );
  }

  const steps = [
    { key: "PendingConfirm", label: "Chờ duyệt", desc: "Đã trả ZaloPay" },
    { key: "ReadyToShip", label: "Đóng gói", desc: "Nhà vườn chuẩn bị" },
    { key: "Shipping", label: "Đang giao", desc: "Viettel Post" },
    { key: "Completed", label: "Hoàn tất", desc: "Đã nhận hàng" },
  ];

  const currentIdx =
    status === "PendingConfirm" ? 0 :
    status === "ReadyToShip" ? 1 :
    status === "Shipping" ? 2 :
    status === "Completed" ? 3 : 0;

  return (
    <div className="py-2.5 px-1 bg-stone-50/80 rounded-xl border border-stone-200/80 my-2">
      <div className="relative flex items-center justify-between px-2">
        {/* Thanh nối màu xanh */}
        <div className="absolute left-6 right-6 top-3 h-1 bg-stone-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${(currentIdx / 3) * 100}%` }}
          />
        </div>

        {steps.map((st, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={st.key} className="flex flex-col items-center text-center z-10 w-16">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-100"
                    : "bg-stone-300 text-stone-600"
                } ${isCurrent ? "scale-110 ring-4 ring-emerald-200 bg-emerald-700" : ""}`}
              >
                {isDone ? (
                  i === 3 ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <span>{i + 1}</span>
                  )
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-1 text-[10px] leading-tight ${
                  isCurrent
                    ? "font-black text-emerald-950"
                    : isDone
                    ? "font-bold text-emerald-800"
                    : "font-medium text-stone-500"
                }`}
              >
                {st.label}
              </span>
              <span className="text-[8px] text-stone-400 hidden sm:block">{st.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [products, setProducts] = useState<OCOPProduct[]>(defaultOcopProducts);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);

  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const cartCount = useAtomValue(cartCountAtom);
  const cartTotal = useAtomValue(cartTotalAmountAtom);
  const [shippingAddress, setShippingAddress] = useAtom(defaultShippingAddressAtom);
  const [placedOrders, setPlacedOrders] = useAtom(placedOrdersAtom);
  const claimedVouchers = useAtomValue(claimedVouchersAtom);

  const [selectedProvince, setSelectedProvince] = useState<string>("Đắk Nông");
  const [detailedAddress, setDetailedAddress] = useState<string>("");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string>("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<OCOPProduct | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "cart" | "orders" | "cancelled">("products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<PlacedOrder | null>(null);

  const activeOrders = useMemo(() => {
    return placedOrders.filter((o) => o.orderStatus !== "Cancelled");
  }, [placedOrders]);

  // Các đơn nào đã giao xong (Completed) thì không hiện số trong tab Đơn hàng của tôi
  const processingOrdersCount = useMemo(() => {
    return placedOrders.filter((o) => o.orderStatus !== "Cancelled" && o.orderStatus !== "Completed").length;
  }, [placedOrders]);

  const cancelledOrders = useMemo(() => {
    return placedOrders.filter((o) => o.orderStatus === "Cancelled");
  }, [placedOrders]);

  // Modal sửa thông tin đơn hàng
  const [editingOrder, setEditingOrder] = useState<PlacedOrder | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Modal xác nhận hủy đơn hàng
  const [cancellingOrder, setCancellingOrder] = useState<PlacedOrder | null>(null);
  const [isCancellingLoading, setIsCancellingLoading] = useState(false);



  // Popup thông báo khi kho không đủ hàng hoặc bị tranh chấp mua cùng lúc
  const [stockErrorModal, setStockErrorModal] = useState<{
    isOpen: boolean;
    message: string;
    hasAdjusted?: boolean;
  } | null>(null);

  // Phương thức thanh toán được chọn: ZaloPay hoặc Tiền mặt (COD)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"ZaloPay" | "COD">("ZaloPay");

  // Modal Cổng thanh toán ZaloPay Sandbox
  const [zaloPaySandboxModal, setZaloPaySandboxModal] = useState<{
    isOpen: boolean;
    order: PlacedOrder;
    appTransId?: string;
    orderUrl?: string;
    qrCodeUrl?: string;
  } | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Modal Popup kết quả tra cứu ZaloPay Sandbox
  const [zaloPayQueryResultModal, setZaloPayQueryResultModal] = useState<{
    isOpen: boolean;
    isSuccess: boolean;
    title: string;
    message: string;
    appTransId?: string;
    orderCode?: string;
  } | null>(null);

  // Modal Popup thông báo cập nhật thông tin nhận hàng thành công
  const [editSuccessModal, setEditSuccessModal] = useState<{
    isOpen: boolean;
    orderCode: string;
    customerName: string;
    phone: string;
    shippingAddress: string;
  } | null>(null);

  // 1. TỰ ĐỘNG TẢI GIÁ VÀ SẢN PHẨM MỚI NHẤT TỪ SQL SERVER BACKEND
  const loadLiveProducts = async (): Promise<OCOPProduct[]> => {
    setIsLoadingProducts(true);
    try {
      const res = await apiFetch(`/api/products`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: OCOPProduct[] = json.data.map((dbP: any) => {
          const matchedDefault = defaultOcopProducts.find((p) => p.id === dbP.ProductId);
          return {
            id: dbP.ProductId,
            name: dbP.ProductName,
            origin: dbP.Origin || "Đắk Song, Đắk Nông",
            category: dbP.Category,
            price: Number(dbP.Price),
            unit: dbP.Unit || "Gói 500g",
            imageUrl: dbP.ImageUrl || matchedDefault?.imageUrl || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
            description: dbP.Description || matchedDefault?.description || "",
            inStockQuantity: dbP.InStockQuantity,
            badge: matchedDefault?.badge || "OCOP Đắk Song",
          };
        });
        setProducts(mapped);
        return mapped;
      }
      return [];
    } catch (e) {
      console.warn("Không kết nối được Backend, dùng danh mục cục bộ:", e);
      return [];
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadLiveProducts();
  }, []);

  // 2. ĐỒNG BỘ TRẠNG THÁI ĐƠN HÀNG TỪ SQL SERVER BACKEND
  const syncOrderStatuses = async () => {
    if (placedOrders.length === 0) return;
    try {
      const updatedList = await Promise.all(
        placedOrders.map(async (order) => {
          try {
            const res = await apiFetch(`/api/orders/track/${order.orderCode}`);
            const json = await res.json();
            if (json.success && json.data) {
              return {
                ...order,
                orderStatus: json.data.OrderStatus,
                paymentStatus: json.data.PaymentStatus || order.paymentStatus,
                note: json.data.Note || order.note,
                customerName: json.data.CustomerName || order.customerName,
                phone: json.data.Phone || order.phone,
                shippingAddress: json.data.ShippingAddress || order.shippingAddress,
              };
            }
          } catch {
            // keep old if unreachable
          }
          return order;
        }),
      );
      setPlacedOrders(updatedList);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      syncOrderStatuses();
    }
  }, [activeTab]);

  // Tách địa chỉ mặc định sẵn có nếu có lưu
  useEffect(() => {
    if (shippingAddress.address) {
      const foundProv = VIETNAM_PROVINCES.find((p) => shippingAddress.address.includes(p));
      if (foundProv) {
        setSelectedProvince(foundProv);
        setDetailedAddress(shippingAddress.address.replace(`, ${foundProv}`, "").replace(foundProv, "").trim());
      } else {
        setDetailedAddress(shippingAddress.address);
      }
    }
  }, []);

  // BẢNG MÃ GIẢM GIÁ ĐƠN HÀNG NÔNG SẢN TRỰC TUYẾN
  const STORE_PROMO_CODES: Record<string, { label: string; percent: number; desc: string }> = {
    OCOP10: { label: "Nông sản OCOP 10%", percent: 10, desc: "Giảm 10% đơn hàng nông sản Đắk Song" },
    DAKSONG15: { label: "Đại ngàn Đắk Song 15%", percent: 15, desc: "Giảm 15% cho nông sản chính gốc Tây Nguyên" },
    TRIENLAM: { label: "Tuần lễ Nông sản 20%", percent: 20, desc: "Giảm 20% tuần lễ xúc tiến thương mại" },
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setPromoMessage({ text: "Vui lòng nhập mã ưu đãi!", isError: true });
      return;
    }
    if (STORE_PROMO_CODES[clean]) {
      setAppliedPromoCode(clean);
      setPromoMessage({ text: `Áp dụng thành công mã ${clean}: Giảm ${STORE_PROMO_CODES[clean].percent}%`, isError: false });
    } else {
      // Nếu khách thử nhập mã voucher cơ sở ăn uống / lưu trú
      const matchedVenueVoucher = claimedVouchers.find((v) => v.code.toUpperCase() === clean);
      if (matchedVenueVoucher) {
        setPromoMessage({
          text: `Mã "${clean}" là voucher dùng tại chỗ (${matchedVenueVoucher.placeName}). Voucher này chỉ áp dụng khi bạn đến cơ sở để nhân viên quầy xác nhận, không dùng cho đơn hàng nông sản bưu điện!`,
          isError: true,
        });
      } else {
        setPromoMessage({ text: `Mã ưu đãi "${clean}" không hợp lệ cho đơn hàng nông sản!`, isError: true });
      }
    }
  };

  const removePromoCode = () => {
    setAppliedPromoCode("");
    setPromoCodeInput("");
    setPromoMessage(null);
  };

  // Tính số tiền giảm giá từ mã ưu đãi nông sản
  const discountAmount = useMemo(() => {
    if (!appliedPromoCode || !STORE_PROMO_CODES[appliedPromoCode]) return 0;
    return Math.round((cartTotal * STORE_PROMO_CODES[appliedPromoCode].percent) / 100);
  }, [appliedPromoCode, cartTotal]);

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Lọc sản phẩm theo danh mục
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Tất cả") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  // Phân trang: 2 sản phẩm mỗi trang theo yêu cầu để vừa vặn màn hình điện thoại
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 2;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Modal chọn số lượng khi người dùng nhấn Thêm vào giỏ hàng
  const [quantityModalProduct, setQuantityModalProduct] = useState<OCOPProduct | null>(null);
  const [quantityToOrder, setQuantityToOrder] = useState<number>(1);

  // Popup thông báo thêm giỏ hàng thành công
  const [addedSuccessModal, setAddedSuccessModal] = useState<{
    product: OCOPProduct;
    quantity: number;
  } | null>(null);

  const handleOpenQuantitySelector = (product: OCOPProduct) => {
    if (product.inStockQuantity <= 0) {
      alert(`Sản phẩm "${product.name}" hiện đã hết hàng trong kho!`);
      return;
    }
    setQuantityModalProduct(product);
    setQuantityToOrder(1);
  };

  const handleConfirmAddToCart = () => {
    if (!quantityModalProduct) return;
    const qty = Math.max(1, Math.min(quantityToOrder, quantityModalProduct.inStockQuantity));

    let addedSuccessfully = false;
    setCartItems((curr) => {
      const existing = curr.find((item) => item.product.id === quantityModalProduct.id);
      if (existing) {
        const newTotal = existing.quantity + qty;
        if (newTotal > quantityModalProduct.inStockQuantity) {
          alert(`Kho chỉ còn ${quantityModalProduct.inStockQuantity} ${quantityModalProduct.unit}. Bạn đã có ${existing.quantity} trong giỏ hàng, chỉ có thể thêm tối đa ${quantityModalProduct.inStockQuantity - existing.quantity} nữa!`);
          return curr;
        }
        addedSuccessfully = true;
        return curr.map((item) =>
          item.product.id === quantityModalProduct.id
            ? { ...item, quantity: newTotal }
            : item,
        );
      }
      addedSuccessfully = true;
      return [...curr, { product: quantityModalProduct, quantity: qty }];
    });

    if (addedSuccessfully) {
      const addedProd = quantityModalProduct;
      const addedQty = qty;
      setQuantityModalProduct(null);
      setAddedSuccessModal({ product: addedProd, quantity: addedQty });
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    setCartItems((curr) => {
      return curr
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            const maxStock = prod?.inStockQuantity ?? item.product.inStockQuantity;
            if (delta > 0 && nextQty > maxStock) {
              alert(`Chỉ còn ${maxStock} ${item.product.unit} trong kho hàng!`);
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((curr) => curr.filter((item) => item.product.id !== productId));
  };

  // KIỂM TRA RÀNG BUỘC SỐ ĐIỆN THOẠI 10 SỐ VIỆT NAM
  const validatePhone = (phoneStr: string) => {
    const cleanPhone = phoneStr.trim().replace(/\s+/g, "");
    const regex = /^0(3|5|7|8|9)[0-9]{8}$/;
    return regex.test(cleanPhone);
  };

  // TIẾN HÀNH ĐẶT HÀNG & THANH TOÁN ZALOPAY
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingAddress.customerName.trim()) {
      alert("Vui lòng nhập Họ và tên người nhận!");
      return;
    }

    const cleanPhone = shippingAddress.phone.trim().replace(/\s+/g, "");
    if (!validatePhone(cleanPhone)) {
      alert("❌ Số điện thoại không hợp lệ!\nSố điện thoại phải gồm đúng 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09 (Ví dụ: 0912345678).");
      return;
    }

    if (!detailedAddress.trim()) {
      alert("Vui lòng nhập địa chỉ chi tiết (thôn/xã, đường/số nhà)!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const fullShippingAddress = `${detailedAddress.trim()}, ${selectedProvince}`;

    setShippingAddress({
      customerName: shippingAddress.customerName.trim(),
      phone: cleanPhone,
      address: fullShippingAddress,
      note: shippingAddress.note,
    });

    setIsSubmitting(true);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    try {
      const res = await apiFetch(`/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "zalo_guest_user",
          customerName: shippingAddress.customerName.trim(),
          phone: cleanPhone,
          shippingAddress: fullShippingAddress,
          note: shippingAddress.note,
          items: cartItems.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          voucherCode: appliedPromoCode || undefined,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      const resJson = await res.json();
      let assignedOrderCode = `ORD-${dateStr}-${randomSuffix}`;
      let assignedOrderId = Date.now();
      let zaloPayInfo: any = null;

      if (resJson.success && resJson.data) {
        assignedOrderCode = resJson.data.orderCode;
        assignedOrderId = resJson.data.orderId;
        zaloPayInfo = resJson.data.zaloPay;
      } else {
        // XỬ LÝ KHI KHO KHÔNG ĐỦ HÀNG (Ví dụ có người khác vừa đặt trước 0.005s)
        setIsSubmitting(false);
        const latestProds = (await loadLiveProducts()) || [];

        // Tự động điều chỉnh số lượng trong giỏ hàng về số lượng tối đa còn lại
        let adjustedAny = false;
        setCartItems((prevItems) => {
          return prevItems
            .map((ci) => {
              const liveP = latestProds.find((p) => p.id === ci.product.id);
              if (liveP && ci.quantity > liveP.inStockQuantity) {
                adjustedAny = true;
                return {
                  ...ci,
                  quantity: Math.max(0, liveP.inStockQuantity),
                  product: { ...ci.product, inStockQuantity: liveP.inStockQuantity },
                };
              }
              return ci;
            })
            .filter((ci) => ci.quantity > 0);
        });

        // Mở popup thông báo rõ ràng cho khách hàng
        setStockErrorModal({
          isOpen: true,
          message: resJson.message || "Kho hàng không đủ số lượng bạn vừa đặt do vừa có khách hàng khác đặt mua trước!",
          hasAdjusted: adjustedAny,
        });
        return; // DỪNG LẠI NGAY, TUYỆT ĐỐI KHÔNG TẠO ĐƠN
      }

      // XỬ LÝ 1: NẾU CHỌN THANH TOÁN TIỀN MẶT KHI NHẬN HÀNG (COD)
      if (selectedPaymentMethod === "COD") {
        const codOrder: PlacedOrder = {
          orderId: assignedOrderId,
          orderCode: assignedOrderCode,
          customerName: shippingAddress.customerName.trim(),
          phone: cleanPhone,
          shippingAddress: fullShippingAddress,
          items: cartItems.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity,
          })),
          totalAmount: cartTotal,
          discountAmount,
          finalAmount: finalTotal,
          voucherCodeApplied: appliedPromoCode || undefined,
          paymentMethod: "COD",
          paymentStatus: "Unpaid",
          orderStatus: "PendingConfirm",
          createdAt: new Date().toISOString(),
        };

        setPlacedOrders((curr) => [codOrder, ...curr]);
        setCartItems([]);
        setAppliedPromoCode("");
        setPromoCodeInput("");
        setPromoMessage(null);
        setIsSubmitting(false);
        setIsCartOpen(false);
        setSuccessOrder(codOrder);
        loadLiveProducts();
        return;
      }

      // XỬ LÝ 2: NẾU CHỌN ZALOPAY SANDBOX
      const pendingOrder: PlacedOrder = {
        orderId: assignedOrderId,
        orderCode: assignedOrderCode,
        customerName: shippingAddress.customerName.trim(),
        phone: cleanPhone,
        shippingAddress: fullShippingAddress,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        totalAmount: cartTotal,
        discountAmount,
        finalAmount: finalTotal,
        voucherCodeApplied: appliedPromoCode || undefined,
        paymentMethod: "ZaloPay",
        paymentStatus: "Pending",
        orderStatus: "PendingConfirm",
        createdAt: new Date().toISOString(),
      };

      // Mở modal cổng thanh toán ZaloPay Sandbox
      setZaloPaySandboxModal({
        isOpen: true,
        order: pendingOrder,
        appTransId: zaloPayInfo?.app_trans_id,
        orderUrl: zaloPayInfo?.order_url || resJson.data?.zaloPayOrderUrl,
        qrCodeUrl: zaloPayInfo?.qrCodeUrl,
      });

      setIsSubmitting(false);
      setIsCartOpen(false);
    } catch (err) {
      console.warn("Chưa thể kết nối tới Backend SQL Server:", err);
      setIsSubmitting(false);
      alert("Không thể kết nối đến máy chủ để xác nhận tồn kho. Vui lòng kiểm tra lại kết nối mạng!");
      return;
    }
  };

  // XÁC NHẬN THANH TOÁN ZALOPAY SANDBOX THÀNH CÔNG
  const handleConfirmSandboxPaymentSuccess = async (order: PlacedOrder) => {
    try {
      await apiFetch(`/api/orders/simulate-zalopay-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode: order.orderCode }),
      });
    } catch (e) {
      console.warn("Lỗi xác nhận ZaloPay:", e);
    }

    const paidOrder: PlacedOrder = {
      ...order,
      paymentStatus: "Paid",
      orderStatus: "PendingConfirm",
    };

    setPlacedOrders((curr) => {
      const exists = curr.some((o) => o.orderCode === order.orderCode);
      if (exists) {
        return curr.map((o) => (o.orderCode === order.orderCode ? paidOrder : o));
      }
      return [paidOrder, ...curr];
    });

    setCartItems([]);
    setAppliedPromoCode("");
    setPromoCodeInput("");
    setPromoMessage(null);
    setZaloPaySandboxModal(null);
    setSuccessOrder(paidOrder);
    loadLiveProducts();
  };

  // KIỂM TRA TRẠNG THÁI THANH TOÁN TRỰC TIẾP TỪ ZALOPAY SANDBOX GATEWAY
  const handleQueryZaloPayStatus = async (appTransId?: string, orderCode?: string) => {
    setIsCheckingPayment(true);
    try {
      const res = await apiFetch(`/api/orders/zalopay-sandbox/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_trans_id: appTransId, orderCode }),
      });
      const json = await res.json();
      if (json.isPaid && zaloPaySandboxModal?.order) {
        await handleConfirmSandboxPaymentSuccess(zaloPaySandboxModal.order);
        setZaloPayQueryResultModal({
          isOpen: true,
          isSuccess: true,
          title: "Thanh toán thành công!",
          message: json.message || "Giao dịch đã được hệ thống ZaloPay xác nhận thành công. Đơn hàng đang được Hợp tác xã chuẩn bị!",
          appTransId,
          orderCode,
        });
      } else {
        setZaloPayQueryResultModal({
          isOpen: true,
          isSuccess: false,
          title: "Kết quả kiểm tra thanh toán ZaloPay",
          message: json.message || "Giao dịch đang chờ thanh toán trên cổng ZaloPay. Quý khách vui lòng quét mã QR hoặc mở liên kết thanh toán, hoặc bấm 'Xác nhận đã thanh toán' để tiếp tục!",
          appTransId,
          orderCode,
        });
      }
    } catch (err: any) {
      setZaloPayQueryResultModal({
        isOpen: true,
        isSuccess: false,
        title: "Lỗi kết nối cổng thanh toán",
        message: "Chưa thể kết nối tới ZaloPay Gateway: " + (err.message || "Lỗi đường truyền mạng"),
        appTransId,
        orderCode,
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // MỞ POPUP XÁC NHẬN HỦY ĐƠN HÀNG
  const openCancelModal = (order: PlacedOrder) => {
    setCancellingOrder(order);
  };

  const executeCancelOrder = async (order: PlacedOrder) => {
    setIsCancellingLoading(true);
    try {
      const targetParam = order.orderCode || String(order.orderId);
      const res = await apiFetch(`/api/orders/${encodeURIComponent(targetParam)}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: order.orderCode,
          orderId: order.orderId,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message || "Không thể hủy đơn hàng trên máy chủ!");
        setIsCancellingLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Lỗi kết nối khi hủy đơn:", err);
    }

    setPlacedOrders((curr) =>
      curr.map((o) =>
        (o.orderId === order.orderId || o.orderCode === order.orderCode)
          ? {
              ...o,
              orderStatus: "Cancelled" as any,
              paymentStatus: "Refunded" as any,
              note: "Người dùng hủy đơn",
            }
          : o,
      ),
    );
    loadLiveProducts();
    setIsCancellingLoading(false);
    setCancellingOrder(null);
  };

  // SỬA THÔNG TIN ĐƠN HÀNG
  const openEditModal = (order: PlacedOrder) => {
    setEditingOrder(order);
    setEditName(order.customerName);
    setEditPhone(order.phone);
    setEditAddress(order.shippingAddress);
  };

  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const cleanPhone = editPhone.trim().replace(/\s+/g, "");
    if (!validatePhone(cleanPhone)) {
      alert("❌ Số điện thoại phải gồm đúng 10 chữ số!");
      return;
    }

    if (!editAddress.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    try {
      await apiFetch(`/api/orders/${editingOrder.orderId}/update-shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: editName.trim(),
          phone: cleanPhone,
          shippingAddress: editAddress.trim(),
        }),
      });
    } catch {
      // Offline fallback
    }

    setPlacedOrders((curr) =>
      curr.map((o) =>
        o.orderId === editingOrder.orderId
          ? { ...o, customerName: editName.trim(), phone: cleanPhone, shippingAddress: editAddress.trim() }
          : o,
      ),
    );

    const savedCode = editingOrder.orderCode;
    const savedName = editName.trim();
    const savedAddress = editAddress.trim();

    setEditingOrder(null);
    setEditSuccessModal({
      isOpen: true,
      orderCode: savedCode,
      customerName: savedName,
      phone: cleanPhone,
      shippingAddress: savedAddress,
    });
  };



  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200">
      {/* ===== KHỐI HEADING CỐ ĐỊNH Ở TRÊN CÙNG: TIÊU ĐỀ + 4 TABS + 5 DANH MỤC ===== */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-emerald-950 via-emerald-950/98 to-stone-950/95 backdrop-blur-md border-b border-emerald-800/60 shadow-lg -mx-2 px-3 pt-2 pb-2.5 rounded-b-2xl space-y-2">
        {/* DÒNG 1: TIÊU ĐỀ GIAN HÀNG & NÚT LÀM MỚI */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-800/90 border border-emerald-500/40 flex items-center justify-center text-amber-300 shadow-xs">
              <ShoppingBag size={14} />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-tight leading-none">
                Cửa hàng nông sản OCOP
              </h1>
              <p className="text-[10px] text-emerald-300/80 font-medium leading-tight mt-0.5">
                Nông sản chính hiệu • Kết nối tận vườn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadLiveProducts();
                if (activeTab === "orders" || activeTab === "cancelled") syncOrderStatuses();
              }}
              title="Cập nhật giá và trạng thái mới nhất từ máy chủ"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/20 shadow-xs"
            >
              <RefreshCw size={13} className={isLoadingProducts ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* DÒNG 2: 4 TABS ĐIỀU HƯỚNG HIỂN THỊ ĐẦY ĐỦ RÕ CHỮ (KHÔNG BỊ MẤT CHỮ) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("products")}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer text-center leading-tight flex flex-col items-center justify-center gap-0.5 ${
              activeTab === "products"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>Sản phẩm</span>
            <span className="text-[9px] font-bold opacity-80 leading-none">({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer text-center leading-tight flex flex-col items-center justify-center gap-0.5 ${
              activeTab === "cart"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-0.5">
              <ShoppingBag size={11} className="shrink-0" />
              <span>Giỏ hàng</span>
            </div>
            {cartCount > 0 ? (
              <span className="rounded-full bg-amber-400 text-stone-950 px-1.5 py-0.1 text-[9px] font-black leading-none">
                {cartCount} món
              </span>
            ) : (
              <span className="text-[9px] opacity-60 leading-none">0 món</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer text-center leading-tight flex flex-col items-center justify-center gap-0.5 ${
              activeTab === "orders"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>Đơn hàng của tôi</span>
            {processingOrdersCount > 0 && (
              <span className="rounded-full bg-amber-400 text-stone-950 px-1.5 py-0.1 text-[9px] font-black leading-none">
                {processingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`py-1.5 px-0.5 rounded-lg text-[10px] sm:text-xs font-black transition cursor-pointer text-center leading-tight flex flex-col items-center justify-center gap-0.5 ${
              activeTab === "cancelled"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-emerald-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>Đơn hàng đã hủy</span>
            {cancelledOrders.length > 0 && (
              <span className="rounded-full bg-red-500 text-white px-1.5 py-0.1 text-[9px] font-black leading-none">
                {cancelledOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* DÒNG 3: 5 DANH MỤC HIỂN THỊ ĐẦY ĐỦ RÕ CHỮ TRÊN 1 HÀNG CỐ ĐỊNH (KHI Ở TAB SẢN PHẨM) */}
        {activeTab === "products" && (
          <div className="grid grid-cols-5 gap-1 w-full bg-white/10 p-1 rounded-xl border border-white/15">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-0.5 text-center rounded-lg text-[9.5px] sm:text-[11px] font-bold transition cursor-pointer leading-tight whitespace-normal break-words flex items-center justify-center min-h-[30px] ${
                  selectedCategory === cat
                    ? "bg-white text-emerald-950 font-black shadow-xs"
                    : "text-emerald-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ===== TAB 1: SẢN PHẨM ===== */}
      {activeTab === "products" && (
        <div className="space-y-2.5">
          {/* GRID SẢN PHẨM: 2 SẢN PHẨM / TRANG, KÍCH THƯỚC GỌN GÀNG VỪA VẶN MÀN HÌNH ĐIỆN THOẠI */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {paginatedProducts.map((product) => {
              const isOutOfStock = product.inStockQuantity <= 0;
              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductDetail(product)}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                >
                  {/* ẢNH GỌN GÀNG */}
                  <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-stone-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* BADGE GÓC TRÊN TRÁI */}
                    <div className="absolute top-0 left-0">
                      <span className="inline-block rounded-br-lg bg-[#ee4d2d] px-1.5 py-0.5 text-[8.5px] font-black uppercase text-white shadow-xs">
                        {product.badge || "OCOP ĐẮK SONG"}
                      </span>
                    </div>
                    {/* QUY CÁCH GÓC DƯỚI PHẢI */}
                    <span className="absolute bottom-1 right-1 rounded-md bg-stone-900/75 px-1 py-0.5 text-[8.5px] font-semibold text-white backdrop-blur-2xs">
                      {product.unit}
                    </span>
                  </div>

                  {/* THÔNG TIN CHI TIẾT */}
                  <div className="flex flex-1 flex-col p-2 space-y-1">
                    {/* Nguồn gốc */}
                    <div className="text-[9.5px] text-stone-500 font-medium truncate flex items-center gap-0.5">
                      <MapPin size={9} className="text-emerald-700 shrink-0" />
                      <span className="truncate">{product.origin}</span>
                    </div>

                    {/* Tên sản phẩm */}
                    <h3 className="text-[11.5px] sm:text-xs font-bold text-stone-900 line-clamp-2 leading-snug min-h-[2rem]">
                      {product.name}
                    </h3>

                    {/* Tồn kho khả dụng */}
                    <div>
                      <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                        isOutOfStock
                          ? "bg-stone-100 text-stone-500 border-stone-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}>
                        Còn: <b className={isOutOfStock ? "text-red-600" : "text-emerald-950 font-black"}>{product.inStockQuantity}</b> {product.unit}
                      </span>
                    </div>

                    {/* Giá tiền & Nút Thêm vào giỏ hàng */}
                    <div className="mt-auto pt-1 space-y-1 border-t border-stone-100">
                      <div className="text-xs sm:text-sm font-black text-[#ee4d2d] leading-none">
                        {product.price.toLocaleString("vi-VN")}₫
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenQuantitySelector(product);
                        }}
                        className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition shadow-2xs ${
                          isOutOfStock
                            ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                            : "bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white cursor-pointer"
                        }`}
                        title={isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
                      >
                        <ShoppingBag size={11} />
                        <span>{isOutOfStock ? "Tạm hết" : "Thêm vào giỏ"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PHÂN TRANG (NGAY DƯỚI 2 SẢN PHẨM - KHÔNG CẦN VUỐT XUỐNG MỚI THẤY) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 pb-1 border-t border-stone-200">
              <div className="text-[11px] text-stone-500 font-medium">
                Trang <b>{currentPage}</b> / <b>{totalPages}</b> ({filteredProducts.length} sản phẩm)
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-0.5 px-2 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold text-stone-700 transition cursor-pointer"
                >
                  <ChevronLeft size={12} /> Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-6 h-6 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      currentPage === pg
                        ? "bg-emerald-900 text-white shadow-xs font-black"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-0.5 px-2 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold text-stone-700 transition cursor-pointer"
                >
                  Sau <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 2: GIỎ HÀNG ===== */}
      {activeTab === "cart" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-850" />
              <h2 className="text-sm font-black text-stone-900">Giỏ hàng của bạn</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                {cartCount} món
              </span>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={() => setCartItems([])}
                className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
              <div className="text-4xl">🛒</div>
              <h3 className="text-sm font-black text-stone-900">Giỏ hàng chưa có sản phẩm nào</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Hãy lựa chọn các mặt hàng nông sản OCOP chất lượng cao từ Đắk Song nhé!
              </p>
              <button
                onClick={() => setActiveTab("products")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-black text-white cursor-pointer"
              >
                Xem danh sách sản phẩm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DANH SÁCH MẶT HÀNG */}
              <div className="bg-white rounded-2xl border border-stone-200 p-3.5 space-y-2.5 shadow-2xs">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50 p-2.5"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-xs font-black text-[#ee4d2d]">
                        {item.product.price.toLocaleString("vi-VN")}₫
                      </div>
                      <div className="text-[10px] text-stone-500">
                        Còn trong kho: {item.product.inStockQuantity} {item.product.unit}
                      </div>
                    </div>

                    {/* TĂNG GIẢM SỐ LƯỢNG */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white border border-stone-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* KHUNG MÃ GIẢM GIÁ */}
              <div className="rounded-2xl border border-stone-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-black text-stone-900">
                  <span className="flex items-center gap-1.5">
                    <Gift size={14} className="text-emerald-800" />
                    <span>Mã giảm giá Nông sản OCOP</span>
                  </span>
                  {appliedPromoCode && (
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Hủy áp dụng
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: OCOP10, DAKSONG15)..."
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 rounded-xl border border-stone-300 bg-stone-50 p-2 text-xs font-bold text-stone-900 placeholder:font-normal uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => applyPromoCode(promoCodeInput)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-850 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-stone-500 font-medium">Mã sẵn có:</span>
                  {Object.keys(STORE_PROMO_CODES).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setPromoCodeInput(code);
                        applyPromoCode(code);
                      }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        appliedPromoCode === code
                          ? "bg-emerald-100 border-emerald-300 text-emerald-950 font-black"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {code} (-{STORE_PROMO_CODES[code].percent}%)
                    </button>
                  ))}
                </div>

                {promoMessage && (
                  <div
                    className={`p-2 rounded-xl text-[11px] font-semibold leading-relaxed ${
                      promoMessage.isError
                        ? "bg-red-50 text-red-900 border border-red-200"
                        : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    }`}
                  >
                    {promoMessage.text}
                  </div>
                )}
              </div>

              {/* FORM ĐỊA CHỈ NHẬN HÀNG & THANH TOÁN */}
              <div className="rounded-2xl border border-stone-200 bg-white p-3.5 space-y-3 shadow-2xs">
                <div className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1 border-b pb-2">
                  <Truck size={14} className="text-emerald-800" /> Thông tin nhận hàng (Giao tận nhà)
                </div>

                <form id="page-checkout-form" onSubmit={handleCheckout} className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-600">Họ và tên người nhận *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={shippingAddress.customerName}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, customerName: e.target.value })
                        }
                        className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-stone-600">Số điện thoại nhận hàng *</label>
                        <span className="text-[9px] text-emerald-800 font-bold">10 chữ số</span>
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="0912 345 678"
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setShippingAddress({ ...shippingAddress, phone: val });
                        }}
                        className={`mt-0.5 w-full rounded-xl border p-2 text-xs font-bold ${
                          shippingAddress.phone && !validatePhone(shippingAddress.phone)
                            ? "border-red-400 bg-red-50/50 text-red-950"
                            : "border-stone-300 text-stone-900"
                        }`}
                      />
                      {shippingAddress.phone && !validatePhone(shippingAddress.phone) && (
                        <div className="text-[10px] text-red-600 mt-0.5 font-medium">
                          ⚠️ SĐT phải gồm đúng 10 số (Bắt đầu 03, 05, 07, 08, 09)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-600">
                        Tỉnh / Thành phố Việt Nam *
                      </label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900"
                      >
                        {VIETNAM_PROVINCES.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-600">
                        Địa chỉ cụ thể (Thôn/Xã, Huyện, Số nhà) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Thôn 2, Xã Đắk N’rung..."
                        value={detailedAddress}
                        onChange={(e) => setDetailedAddress(e.target.value)}
                        className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600">Ghi chú giao hàng (nếu có)</label>
                    <input
                      type="text"
                      placeholder="Giao giờ hành chính, gọi trước khi giao..."
                      value={shippingAddress.note || ""}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, note: e.target.value })
                      }
                      className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                    />
                  </div>

                  {/* CHỌN HÌNH THỨC THANH TOÁN (VÍ ZALOPAY HOẶC TIỀN MẶT COD) */}
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                        <CreditCard size={13} className="text-emerald-700" /> Phương thức thanh toán
                      </label>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {selectedPaymentMethod === "COD" ? "💵 Tiền mặt (COD)" : "💳 Ví ZaloPay"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("ZaloPay")}
                        className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          selectedPaymentMethod === "ZaloPay"
                            ? "border-blue-500 bg-blue-50/70 text-blue-950 shadow-2xs"
                            : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-blue-700">Ví ZaloPay</span>
                        </div>
                        <p className="text-[10px] text-stone-500 leading-tight">Thanh toán qua mã QR / App ZaloPay</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("COD")}
                        className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          selectedPaymentMethod === "COD"
                            ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs"
                            : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-emerald-800">Tiền mặt (COD)</span>
                        </div>
                        <p className="text-[10px] text-stone-500 leading-tight">Giao hàng tận nơi mới thanh toán</p>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 pt-3 space-y-1.5">
                    <div className="flex justify-between text-stone-600">
                      <span>Tạm tính:</span>
                      <span>{cartTotal.toLocaleString("vi-VN")} đ</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between font-bold text-emerald-800">
                        <span>Voucher giảm giá:</span>
                        <span>-{discountAmount.toLocaleString("vi-VN")} đ</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Phí vận chuyển:</span>
                      <span className="font-bold text-emerald-800">Miễn phí (OCOP)</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm font-black text-stone-950">
                      <span>Tổng thanh toán:</span>
                      <span className="text-base text-[#ee4d2d]">
                        {finalTotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-black text-white shadow-md active:scale-98 transition cursor-pointer disabled:opacity-60 ${
                      selectedPaymentMethod === "COD"
                        ? "bg-emerald-700 hover:bg-emerald-800"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    {selectedPaymentMethod === "COD" ? <Truck size={16} /> : <CreditCard size={16} />}
                    <span>
                      {isSubmitting
                        ? "Đang xử lý đơn hàng..."
                        : selectedPaymentMethod === "COD"
                        ? `Đặt hàng giao tận nơi - COD (${finalTotal.toLocaleString("vi-VN")}₫)`
                        : `Thanh toán Ví ZaloPay (${finalTotal.toLocaleString("vi-VN")}₫)`}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 3: ĐƠN CỦA TÔI ===== */}
      {activeTab === "orders" && (
        <div className="space-y-3">

          {activeOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-sm font-black text-stone-900">Bạn chưa có đơn hàng nào đang xử lý</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Khám phá nông sản chính gốc Đắk Song và thanh toán 1 chạm an toàn qua ZaloPay!
              </p>
              <button
                onClick={() => setActiveTab("products")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-black text-white cursor-pointer"
              >
                Khám phá sản phẩm ngay
              </button>
            </div>
          ) : (
            activeOrders.map((order) => (
                <div key={order.orderId} className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
                  {/* HEADER ĐƠN */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div>
                      <span className="font-mono text-xs font-black text-stone-900">
                        #{order.orderCode}
                      </span>
                      <div className="text-[10px] text-stone-400">
                        {formatVietnamDateTime(order.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        order.orderStatus === "PendingConfirm"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : order.orderStatus === "ReadyToShip"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : order.orderStatus === "Shipping"
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {order.orderStatus === "PendingConfirm" && (
                        <>
                          <Clock size={11} /> Chờ duyệt
                        </>
                      )}
                      {order.orderStatus === "ReadyToShip" && (
                        <>
                          <Package size={11} /> Đóng gói
                        </>
                      )}
                      {order.orderStatus === "Shipping" && (
                        <>
                          <Truck size={11} /> Đang giao
                        </>
                      )}
                      {order.orderStatus === "Completed" && (
                        <>
                          <CheckCircle2 size={11} /> Hoàn tất
                        </>
                      )}
                    </span>
                  </div>

                  {/* TIẾN ĐỘ THỜI GIAN THỰC */}
                  <OrderProgressTracker status={order.orderStatus} note={order.note} paymentMethod={order.paymentMethod} />

                  {/* DANH SÁCH MÓN */}
                  <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-700">
                        <span className="truncate pr-2">
                          {it.productName} <b>x{it.quantity}</b>
                        </span>
                        <span className="font-bold shrink-0">{it.subtotal.toLocaleString("vi-VN")} đ</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-2 flex items-center justify-between text-xs">
                    <div className="text-stone-600 max-w-[65%]">
                      <div className="font-bold text-stone-900">{order.customerName} ({order.phone})</div>
                      <div className="text-[11px] text-stone-500 truncate">{order.shippingAddress}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 uppercase font-bold">
                        {order.paymentMethod === "COD" ? "💵 COD Tiền mặt" : "💳 ZaloPay"}
                      </div>
                      <div className="text-sm font-black text-[#ee4d2d]">
                        {order.finalAmount.toLocaleString("vi-VN")}₫
                      </div>
                      <div className="text-[10px] font-bold text-stone-500">
                        {order.paymentMethod === "COD"
                          ? (order.paymentStatus === "Paid" ? "Đã thu tiền" : "Thu khi giao")
                          : (order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chờ ZaloPay")}
                      </div>
                    </div>
                  </div>

                  {/* NÚT THAO TÁC / HỦY ĐƠN HÀNG */}
                  <div className="border-t border-stone-100 pt-2 flex items-center justify-end gap-2">
                    {order.orderStatus === "PendingConfirm" && (
                      <button
                        onClick={() => openEditModal(order)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Edit2 size={13} /> Sửa thông tin nhận
                      </button>
                    )}

                    {order.orderStatus === "PendingConfirm" || order.orderStatus === "ReadyToShip" ? (
                      <button
                        onClick={() => openCancelModal(order)}
                        className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <XCircle size={13} /> Hủy đơn hàng
                      </button>
                    ) : order.orderStatus === "Shipping" ? (
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-400 font-bold text-xs flex items-center gap-1 cursor-not-allowed opacity-80"
                        title="Đơn hàng đang trên đường giao, không thể hủy"
                      >
                        <Lock size={13} /> Đang giao (Khóa hủy đơn)
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Đã hoàn tất
                      </span>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* ===== TAB 4: ĐƠN BẠN ĐÃ HỦY ===== */}
      {activeTab === "cancelled" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <h2 className="text-xs font-black text-stone-900">Danh sách đơn hàng đã hủy</h2>
              <p className="text-[11px] text-stone-500">Bao gồm đơn bạn chủ động hủy hoặc hợp tác xã hủy</p>
            </div>
            <button
              onClick={syncOrderStatuses}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-[11px] font-bold text-stone-700 cursor-pointer"
            >
              <RefreshCw size={12} /> Cập nhật
            </button>
          </div>

          {cancelledOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                <XCircle size={24} />
              </div>
              <h3 className="text-sm font-black text-stone-900">Bạn chưa có đơn hàng nào bị hủy</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tất cả đơn hàng của bạn vẫn đang được xử lý thuận lợi.
              </p>
              <button
                onClick={() => setActiveTab("products")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-black text-white cursor-pointer"
              >
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            cancelledOrders.map((order) => (
              <div key={order.orderId} className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
                {/* HEADER ĐƠN */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-black text-stone-900">
                      #{order.orderCode}
                    </span>
                    <div className="text-[10px] text-stone-400">
                      {formatVietnamDateTime(order.createdAt)}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    <XCircle size={11} /> Đã hủy đơn
                  </span>
                </div>

                {/* THÔNG BÁO HỦY: HIỂN THỊ CÂU THÔNG BÁO */}
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-800 text-xs">
                    <XCircle size={14} />
                    <span>Thông báo hủy đơn</span>
                  </div>
                  <p className="text-xs text-red-900 font-semibold leading-relaxed">
                    {order.note?.includes("Người dùng") || order.note?.includes("Khách")
                      ? "Bạn đã chủ động hủy đơn hàng này (Tiền thanh toán ZaloPay đã được hoàn về ví)."
                      : order.note || "Hiện tại hợp tác xã đang chưa có đủ hàng để bán cho bạn. Mong bạn thông cảm."}
                  </p>
                </div>

                {/* DANH SÁCH MÓN */}
                <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-stone-700">
                      <span className="truncate pr-2">
                        {it.productName} <b>x{it.quantity}</b>
                      </span>
                      <span className="font-bold shrink-0">{it.subtotal.toLocaleString("vi-VN")} đ</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-2 flex items-center justify-between text-xs">
                  <div className="text-stone-600 max-w-[65%]">
                    <div className="font-bold text-stone-900">{order.customerName} ({order.phone})</div>
                    <div className="text-[11px] text-stone-500 truncate">{order.shippingAddress}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-400 uppercase font-bold">Số tiền</div>
                    <div className="text-sm font-black text-stone-600 line-through">
                      {order.finalAmount.toLocaleString("vi-VN")}₫
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== MODAL CHI TIẾT SẢN PHẨM ===== */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200">
            <div className="relative h-56 w-full bg-stone-100">
              <img
                src={selectedProductDetail.imageUrl}
                alt={selectedProductDetail.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="absolute top-3 right-3 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <MapPin size={13} /> {selectedProductDetail.origin}
                </div>
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Còn khả dụng: <span className="font-black text-emerald-950">{selectedProductDetail.inStockQuantity}</span> {selectedProductDetail.unit}
                </div>
              </div>

              <h2 className="text-base font-black text-stone-950">
                {selectedProductDetail.name}
              </h2>
              <div className="text-xl font-black text-[#ee4d2d]">
                {selectedProductDetail.price.toLocaleString("vi-VN")}₫{" "}
                <span className="text-xs font-normal text-stone-500">/ {selectedProductDetail.unit}</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                {selectedProductDetail.description}
              </p>

              <button
                disabled={selectedProductDetail.inStockQuantity <= 0}
                onClick={() => {
                  const prod = selectedProductDetail;
                  setSelectedProductDetail(null);
                  handleOpenQuantitySelector(prod);
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black shadow-md active:scale-98 transition ${
                  selectedProductDetail.inStockQuantity <= 0
                    ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                    : "bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer"
                }`}
              >
                <ShoppingBag size={16} />
                <span>{selectedProductDetail.inStockQuantity <= 0 ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CHỌN SỐ LƯỢNG KHI THÊM VÀO GIỎ HÀNG ===== */}
      {quantityModalProduct && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 p-4 bg-stone-50/80">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-800" />
                <h3 className="font-black text-stone-900 text-sm">Chọn số lượng đặt mua</h3>
              </div>
              <button
                onClick={() => setQuantityModalProduct(null)}
                className="rounded-full p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* THÔNG TIN SẢN PHẨM */}
              <div className="flex gap-3 items-center bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                <img
                  src={quantityModalProduct.imageUrl}
                  alt={quantityModalProduct.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-stone-900 truncate">{quantityModalProduct.name}</h4>
                  <div className="text-sm font-black text-[#ee4d2d]">
                    {quantityModalProduct.price.toLocaleString("vi-VN")}₫{" "}
                    <span className="text-[10px] font-normal text-stone-500">/ {quantityModalProduct.unit}</span>
                  </div>
                  <div className="text-[10.5px] text-emerald-800 font-bold mt-0.5">
                    Còn khả dụng: <span className="font-black text-emerald-950">{quantityModalProduct.inStockQuantity}</span> {quantityModalProduct.unit}
                  </div>
                </div>
              </div>

              {/* BỘ CHỌN SỐ LƯỢNG STEPPER */}
              <div className="space-y-2">
                <label className="font-bold text-stone-700 block">Số lượng bạn muốn mua:</label>
                <div className="flex items-center justify-center gap-3 bg-stone-100 p-2 rounded-2xl">
                  <button
                    type="button"
                    disabled={quantityToOrder <= 1}
                    onClick={() => setQuantityToOrder((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={quantityModalProduct.inStockQuantity}
                    value={quantityToOrder}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) setQuantityToOrder(1);
                      else setQuantityToOrder(Math.max(1, Math.min(val, quantityModalProduct.inStockQuantity)));
                    }}
                    className="w-20 text-center py-1.5 font-black text-base text-stone-900 bg-white rounded-xl border border-stone-200 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    disabled={quantityToOrder >= quantityModalProduct.inStockQuantity}
                    onClick={() => setQuantityToOrder((q) => Math.min(quantityModalProduct.inStockQuantity, q + 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* CÁC NÚT CHỌN NHANH */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[1, 2, 5, 10].filter((n) => n <= quantityModalProduct.inStockQuantity).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantityToOrder(n)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        quantityToOrder === n
                          ? "bg-emerald-800 text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      +{n}
                    </button>
                  ))}
                  {quantityModalProduct.inStockQuantity > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuantityToOrder(quantityModalProduct.inStockQuantity)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition cursor-pointer"
                    >
                      Tối đa ({quantityModalProduct.inStockQuantity})
                    </button>
                  )}
                </div>
              </div>

              {/* TẠM TÍNH TIỀN */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-stone-700">
                <span className="font-medium">Thành tiền:</span>
                <span className="text-base font-black text-[#ee4d2d]">
                  {(quantityModalProduct.price * quantityToOrder).toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* NÚT THÊM */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setQuantityModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition cursor-pointer text-center"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="flex-2 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black shadow-xs active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Thêm vào giỏ hàng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP THÔNG BÁO ĐÃ THÊM VÀO GIỎ HÀNG THÀNH CÔNG ===== */}
      {addedSuccessModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-200 text-center animate-in zoom-in-95 duration-200 p-5 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 mx-auto">
              <CheckCircle2 size={26} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-950">
                Thành công
              </span>
              <h3 className="mt-1 text-base font-black text-stone-900 leading-tight">
                Đã thêm vào giỏ hàng thành công!
              </h3>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-left">
              <img
                src={addedSuccessModal.product.imageUrl}
                alt={addedSuccessModal.product.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover border border-emerald-200"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-stone-900 truncate">
                  {addedSuccessModal.product.name}
                </h4>
                <div className="mt-0.5 flex items-center justify-between text-xs">
                  <span className="font-black text-emerald-800">
                    +{addedSuccessModal.quantity} {addedSuccessModal.product.unit}
                  </span>
                  <span className="font-black text-[#ee4d2d]">
                    {(addedSuccessModal.product.price * addedSuccessModal.quantity).toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAddedSuccessModal(null);
                  setActiveTab("cart");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-850 hover:bg-emerald-900 py-2.5 px-4 text-xs font-black text-white shadow-xs active:scale-98 transition cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>Xem giỏ hàng ({cartCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAddedSuccessModal(null)}
                className="w-full py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer text-center"
              >
                Tiếp tục xem hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SỬA THÔNG TIN ĐƠN HÀNG ===== */}
      {editingOrder && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-stone-900">Sửa thông tin nhận hàng</h3>
              <button onClick={() => setEditingOrder(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">Họ và tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700">Số điện thoại (đúng 10 số) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="0912345678"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 font-bold text-emerald-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700">Địa chỉ giao hàng chi tiết *</label>
                <textarea
                  required
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold cursor-pointer transition text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black shadow-md cursor-pointer flex items-center gap-1.5 transition text-xs"
                >
                  <CheckCircle2 size={14} /> Xác nhận cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL GIỎ HÀNG & THANH TOÁN ZALOPAY ===== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-stone-950/75 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-stone-200">
            {/* TIÊU ĐỀ */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-850" />
                <h3 className="font-black text-stone-900 text-sm">Giỏ hàng đặc sản Đắk Song</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                  {cartCount} món
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* DANH SÁCH MÓN & FORM */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500 space-y-2">
                  <div className="text-4xl">🛒</div>
                  <p>Giỏ hàng chưa có sản phẩm nào.</p>
                </div>
              ) : (
                <>
                  {/* DANH SÁCH MẶT HÀNG */}
                  <div className="space-y-2.5">
                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-2.5"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs font-black text-[#ee4d2d]">
                            {item.product.price.toLocaleString("vi-VN")}₫
                          </div>
                        </div>

                        {/* TĂNG GIẢM SỐ LƯỢNG */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-stone-200 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-5 text-center text-xs font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 text-stone-500 hover:text-stone-800 transition cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-stone-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* KHUNG MÃ GIẢM GIÁ NÔNG SẢN OCOP */}
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-black text-stone-900">
                      <span className="flex items-center gap-1.5">
                        <Gift size={14} className="text-emerald-800" />
                        <span>Mã giảm giá Nông sản OCOP</span>
                      </span>
                      {appliedPromoCode && (
                        <button
                          type="button"
                          onClick={removePromoCode}
                          className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                        >
                          Hủy áp dụng
                        </button>
                      )}
                    </div>

                    {/* Ô NHẬP MÃ */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Nhập mã (VD: OCOP10, DAKSONG15)..."
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900 placeholder:font-normal uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => applyPromoCode(promoCodeInput)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-850 hover:bg-emerald-900 text-white font-bold text-xs transition cursor-pointer shrink-0"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {/* CÁC MÃ GỢI Ý CHỌN NHANH */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-stone-500 font-medium">Mã sẵn có:</span>
                      {Object.keys(STORE_PROMO_CODES).map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setPromoCodeInput(code);
                            applyPromoCode(code);
                          }}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                            appliedPromoCode === code
                              ? "bg-emerald-100 border-emerald-300 text-emerald-950 font-black"
                              : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          {code} (-{STORE_PROMO_CODES[code].percent}%)
                        </button>
                      ))}
                    </div>

                    {/* THÔNG BÁO KẾT QUẢ MÃ */}
                    {promoMessage && (
                      <div
                        className={`p-2 rounded-xl text-[11px] font-semibold leading-relaxed ${
                          promoMessage.isError
                            ? "bg-red-50 text-red-900 border border-red-200"
                            : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {promoMessage.text}
                      </div>
                    )}

                    {/* GHI CHÚ RÕ RÀNG VỀ VOUCHER TRÚNG THƯỞNG DÙNG TẠI CHỖ */}
                    <div className="rounded-xl bg-amber-50/80 p-2.5 border border-amber-200 text-[10.5px] text-amber-950 leading-relaxed font-medium space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-amber-900">
                        <span>ℹ️ Lưu ý về Voucher nhận tại Quiz/Vòng quay:</span>
                      </div>
                      <p>
                        Các voucher ẩm thực & lưu trú (Cơm gà, Khách sạn Hoàng Nguyên, Nhà nghỉ...) là voucher <b>dùng trực tiếp tại chỗ</b> (nhân viên quán sẽ bấm xác nhận khi bạn ghé ăn hoặc lưu trú tại Đắk Song), không thể cấn trừ vào đơn đặt nông sản gửi qua bưu điện.
                      </p>
                    </div>
                  </div>

                  {/* FORM ĐỊA CHỈ NHẬN HÀNG */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-2.5 pt-2">
                    <div className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1">
                      <Truck size={14} className="text-emerald-800" /> Thông tin nhận hàng (Giao tận nhà)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-stone-600">Họ và tên người nhận *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Nguyễn Văn An"
                          value={shippingAddress.customerName}
                          onChange={(e) =>
                            setShippingAddress({ ...shippingAddress, customerName: e.target.value })
                          }
                          className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-stone-600">Số điện thoại nhận hàng *</label>
                          <span className="text-[9px] text-emerald-800 font-bold">10 chữ số</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="0912 345 678"
                          value={shippingAddress.phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setShippingAddress({ ...shippingAddress, phone: val });
                          }}
                          className={`mt-0.5 w-full rounded-xl border p-2 text-xs font-bold ${
                            shippingAddress.phone && !validatePhone(shippingAddress.phone)
                              ? "border-red-400 bg-red-50/50 text-red-950"
                              : "border-stone-300 text-stone-900"
                          }`}
                        />
                        {shippingAddress.phone && !validatePhone(shippingAddress.phone) && (
                          <div className="text-[10px] text-red-600 mt-0.5 font-medium">
                            ⚠️ SĐT phải gồm đúng 10 số (Bắt đầu 03, 05, 07, 08, 09)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BỘ CHỌN TỈNH/THÀNH PHỐ VIỆT NAM */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-stone-600">
                          Tỉnh / Thành phố Việt Nam *
                        </label>
                        <select
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                          className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white p-2 text-xs font-bold text-stone-900"
                        >
                          {VIETNAM_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-600">
                          Địa chỉ cụ thể (Thôn/Xã, Huyện, Số nhà) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Thôn 2, Xã Đắk N’rung..."
                          value={detailedAddress}
                          onChange={(e) => setDetailedAddress(e.target.value)}
                          className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-600">Ghi chú giao hàng (nếu có)</label>
                      <input
                        type="text"
                        placeholder="Giao giờ hành chính, gọi trước khi giao..."
                        value={shippingAddress.note || ""}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, note: e.target.value })
                        }
                        className="mt-0.5 w-full rounded-xl border border-stone-300 p-2 text-xs font-medium text-stone-900"
                      />
                    </div>

                    {/* CHỌN HÌNH THỨC THANH TOÁN (VÍ ZALOPAY HOẶC TIỀN MẶT COD) */}
                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                          <CreditCard size={13} className="text-emerald-700" /> Phương thức thanh toán
                        </label>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {selectedPaymentMethod === "COD" ? "💵 Tiền mặt (COD)" : "💳 Ví ZaloPay"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("ZaloPay")}
                          className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                            selectedPaymentMethod === "ZaloPay"
                              ? "border-blue-500 bg-blue-50/70 text-blue-950 shadow-2xs"
                              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-blue-700">Ví ZaloPay</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight">Thanh toán qua mã QR / App ZaloPay</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethod("COD")}
                          className={`p-2.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                            selectedPaymentMethod === "COD"
                              ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-2xs"
                              : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-emerald-800">Tiền mặt (COD)</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight">Giao hàng tận nơi mới thanh toán</p>
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* TỔNG TIỀN & NÚT THANH TOÁN */}
            {cartItems.length > 0 && (
              <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Tạm tính:</span>
                    <span>{cartTotal.toLocaleString("vi-VN")} đ</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-800">
                      <span>Voucher giảm giá:</span>
                      <span>-{discountAmount.toLocaleString("vi-VN")} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-bold text-emerald-800">Miễn phí (OCOP)</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-1.5 text-sm font-black text-stone-950">
                    <span>Tổng thanh toán:</span>
                    <span className="text-base text-[#ee4d2d]">
                      {finalTotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-black text-white shadow-md active:scale-98 transition cursor-pointer disabled:opacity-60 ${
                    selectedPaymentMethod === "COD"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {selectedPaymentMethod === "COD" ? <Truck size={16} /> : <CreditCard size={16} />}
                  <span>
                    {isSubmitting
                      ? "Đang xử lý đơn hàng..."
                      : selectedPaymentMethod === "COD"
                      ? `Đặt hàng giao tận nơi - COD (${finalTotal.toLocaleString("vi-VN")}₫)`
                      : `Thanh toán Ví ZaloPay (${finalTotal.toLocaleString("vi-VN")}₫)`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== POPUP ĐẶT HÀNG THÀNH CÔNG ===== */}
      {successOrder && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200 text-center animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-5 text-white">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl mb-2">
                <CheckCircle2 size={24} className="text-amber-300" />
              </div>
              <h3 className="text-base font-black tracking-tight text-white">
                Thanh toán ZaloPay thành công!
              </h3>
              <p className="mt-1 font-mono text-xs font-bold text-emerald-200">
                Mã đơn: #{successOrder.orderCode}
              </p>
            </div>

            <div className="p-4 space-y-3 text-left text-xs">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-950 leading-relaxed font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                  <span>Đơn hàng đã được lưu trên hệ thống!</span>
                </p>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Admin sẽ gọi điện xác nhận trực tiếp với người dân Đắk Song để đóng gói nông sản và gửi Viettel Post cho bạn.
                </p>
              </div>

              <div className="border-t border-stone-100 pt-2 space-y-1 text-stone-600 text-[11px]">
                <div>Người nhận: <b>{successOrder.customerName}</b> ({successOrder.phone})</div>
                <div>Địa chỉ: <b>{successOrder.shippingAddress}</b></div>
                <div>Tổng tiền: <b className="text-[#ee4d2d] text-xs">{successOrder.finalAmount.toLocaleString("vi-VN")}₫</b></div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setSuccessOrder(null);
                    setActiveTab("orders");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-850 hover:bg-emerald-900 py-2.5 px-4 text-xs font-black text-white shadow-xs active:scale-98 transition cursor-pointer"
                >
                  <Package size={15} /> Xem tiến độ đơn hàng
                </button>
                <button
                  onClick={() => setSuccessOrder(null)}
                  className="w-full py-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer text-center"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP THÔNG BÁO TỒN KHO KHI BỊ TRANH CHẤP / HẾT HÀNG ===== */}
      {stockErrorModal?.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-300 text-center animate-in zoom-in-95 duration-200 p-5 space-y-3.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 border border-amber-300 mx-auto">
              <Package size={24} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-[10px] font-black uppercase text-amber-950">
                Thông báo tồn kho thời gian thực
              </span>
              <h3 className="mt-1 text-base font-black text-stone-900 leading-tight">
                Không đủ hàng trong kho
              </h3>
            </div>

            <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3 text-left space-y-1.5 text-xs text-amber-950 leading-relaxed font-medium">
              <p className="font-semibold text-stone-900">
                ⚠️ {stockErrorModal.message}
              </p>
              <p className="text-[11px] text-stone-600">
                Vừa có khách hàng khác đặt mua thành công nhanh hơn một tích tắc.
              </p>
              {stockErrorModal.hasAdjusted && (
                <p className="text-[11px] text-emerald-800 font-bold border-t border-amber-200 pt-1">
                  ✓ Hệ thống đã tự động điều chỉnh số lượng trong giỏ hàng về số lượng tối đa còn lại trong kho.
                </p>
              )}
            </div>

            <div className="pt-1">
              <button
                onClick={() => setStockErrorModal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs active:scale-98 transition cursor-pointer"
              >
                Đã hiểu & Kiểm tra lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP XÁC NHẬN HỦY ĐƠN HÀNG ===== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-red-200 text-center animate-in zoom-in-95 duration-200 p-5 space-y-3.5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700 border border-red-200 mx-auto shadow-xs">
              <AlertTriangle size={28} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-red-100 border border-red-300 px-3 py-0.5 text-[10px] font-black uppercase text-red-900 tracking-wider">
                Xác nhận hủy đơn
              </span>
              <h3 className="mt-1 text-base font-black text-stone-900 leading-tight">
                Bạn chắc chắn muốn hủy đơn hàng này?
              </h3>
              <p className="font-mono text-xs font-black text-stone-600 mt-0.5">
                #{cancellingOrder.orderCode}
              </p>
            </div>

            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Số tiền hoàn về ví:</span>
                <span className="font-black text-[#ee4d2d] text-sm">
                  {cancellingOrder.finalAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="text-[11px] text-stone-600 space-y-1">
                <div><b>Người nhận:</b> {cancellingOrder.customerName} ({cancellingOrder.phone})</div>
                <div className="truncate"><b>Địa chỉ:</b> {cancellingOrder.shippingAddress}</div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-left text-[11px] text-amber-950 leading-relaxed font-medium">
              💡 <b>Lưu ý:</b> Hệ thống sẽ hoàn tiền 100% về ví ZaloPay của bạn. Số lượng nông sản sẽ được tự động hoàn lại kho cho hợp tác xã.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                disabled={isCancellingLoading}
                onClick={() => setCancellingOrder(null)}
                className="py-2.5 px-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs active:scale-98 transition cursor-pointer"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                disabled={isCancellingLoading}
                onClick={() => executeCancelOrder(cancellingOrder)}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs active:scale-98 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isCancellingLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Đang hủy...
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CỔNG THANH TOÁN ZALOPAY SANDBOX ===== */}
      {zaloPaySandboxModal?.isOpen && (
        <div className="fixed inset-0 z-[155] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-blue-200 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-white text-blue-700 flex items-center justify-center font-black shadow-xs">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm leading-tight">Cổng thanh toán Ví ZaloPay</h3>
                    <span className="text-[10px] text-blue-200 font-bold bg-blue-800/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Thanh toán trực tuyến an toàn
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setZaloPaySandboxModal(null)}
                  className="rounded-full p-1 text-blue-200 hover:text-white hover:bg-blue-800/50 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3.5 text-center">
              <div>
                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                  Mã đơn hàng
                </div>
                <div className="font-mono text-sm font-black text-stone-900 mt-0.5">
                  #{zaloPaySandboxModal.order.orderCode}
                </div>
                {zaloPaySandboxModal.appTransId && (
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Mã GD ZaloPay:{" "}
                    <span className="font-mono text-blue-800 font-bold">{zaloPaySandboxModal.appTransId}</span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-3">
                <div className="text-xs text-blue-900 font-medium">Số tiền thanh toán</div>
                <div className="text-xl font-black text-blue-700 mt-0.5">
                  {zaloPaySandboxModal.order.finalAmount.toLocaleString("vi-VN")}₫
                </div>
              </div>

              {/* KHUNG MÃ QR CODE THANH TOÁN */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-stone-200">
                  <img
                    src={zaloPaySandboxModal.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(zaloPaySandboxModal.orderUrl || 'https://zalopay.vn')}`}
                    alt="Mã QR ZaloPay"
                    className="w-40 h-40 object-contain mx-auto rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-2 font-medium">
                  Quét mã QR bằng ứng dụng Zalo / ZaloPay để thanh toán
                </p>
              </div>

              {/* CÁC NÚT THAO TÁC CỔNG THANH TOÁN */}
              <div className="space-y-2 pt-1">
                {/* 1. Mở Cổng ZaloPay Web */}
                {zaloPaySandboxModal.orderUrl && (
                  <a
                    href={zaloPaySandboxModal.orderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 px-3 text-xs font-black text-white shadow-xs transition cursor-pointer"
                  >
                    <ExternalLink size={14} /> Mở Cổng Ví ZaloPay (Webview)
                  </a>
                )}

                {/* 2. Kiểm tra trạng thái giao dịch */}
                <button
                  onClick={() => handleQueryZaloPayStatus(zaloPaySandboxModal.appTransId, zaloPaySandboxModal.order.orderCode)}
                  disabled={isCheckingPayment}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-blue-400 bg-white hover:bg-blue-50 py-2 px-3 text-xs font-bold text-blue-900 shadow-xs transition cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw size={13} className={isCheckingPayment ? "animate-spin" : ""} />
                  <span>{isCheckingPayment ? "Đang tra cứu ZaloPay..." : "Kiểm tra kết quả thanh toán"}</span>
                </button>

                {/* 3. Nút giả lập 1-click thành công để demo thuận tiện */}
                <button
                  onClick={() => handleConfirmSandboxPaymentSuccess(zaloPaySandboxModal.order)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 px-3 text-xs font-black text-white shadow-xs transition cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Xác nhận đã thanh toán ZaloPay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP KẾT QUẢ KIỂM TRA ZALOPAY SANDBOX ===== */}
      {zaloPayQueryResultModal?.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-blue-200 text-center animate-in zoom-in-95 duration-200 p-5 space-y-3.5">
            <div
              className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mx-auto shadow-xs border ${
                zaloPayQueryResultModal.isSuccess
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-blue-100 text-blue-700 border-blue-200"
              }`}
            >
              {zaloPayQueryResultModal.isSuccess ? (
                <CheckCircle2 size={30} />
              ) : (
                <Info size={30} />
              )}
            </div>

            <div>
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  zaloPayQueryResultModal.isSuccess
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-blue-100 text-blue-900 border border-blue-300"
                }`}
              >
                {zaloPayQueryResultModal.isSuccess ? "Thanh toán thành công" : "Cổng thanh toán ZaloPay"}
              </span>
              <h3 className="mt-1 text-base font-black text-stone-900 leading-tight">
                {zaloPayQueryResultModal.title}
              </h3>
              {zaloPayQueryResultModal.orderCode && (
                <p className="font-mono text-xs font-black text-stone-600 mt-0.5">
                  Mã đơn: #{zaloPayQueryResultModal.orderCode}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3 text-left space-y-2 text-xs">
              <p className="text-stone-700 leading-relaxed font-medium">
                {zaloPayQueryResultModal.message}
              </p>
              {zaloPayQueryResultModal.appTransId && (
                <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <span>Mã giao dịch ZaloPay: </span>
                  <span className="font-mono font-bold text-blue-800">
                    {zaloPayQueryResultModal.appTransId}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setZaloPayQueryResultModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              Đã hiểu & Đóng
            </button>
          </div>
        </div>
      )}

      {/* ===== POPUP CẬP NHẬT THÔNG TIN NHẬN HÀNG THÀNH CÔNG ===== */}
      {editSuccessModal?.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-200 text-center animate-in zoom-in-95 duration-200 p-5 space-y-3.5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 mx-auto shadow-xs">
              <CheckCircle2 size={30} />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-900 tracking-wider">
                Đã lưu thay đổi
              </span>
              <h3 className="mt-1 text-base font-black text-stone-900 leading-tight">
                Cập nhật thông tin nhận hàng thành công!
              </h3>
              <p className="font-mono text-xs font-black text-emerald-800 mt-0.5">
                Mã đơn: #{editSuccessModal.orderCode}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200/80 p-3 text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-stone-700">
                <span className="text-stone-500 font-medium">Người nhận mới:</span>
                <span className="font-bold text-stone-900">{editSuccessModal.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-stone-700">
                <span className="text-stone-500 font-medium">Số điện thoại:</span>
                <span className="font-bold text-emerald-800">{editSuccessModal.phone}</span>
              </div>
              <div className="pt-1 border-t border-emerald-100 text-[11px] text-stone-600">
                <span className="font-medium text-stone-500">Địa chỉ giao: </span>
                <span className="font-medium text-stone-800">{editSuccessModal.shippingAddress}</span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 font-medium">
              💡 Hợp tác xã sẽ chuẩn bị và giao hàng theo địa chỉ mới được cập nhật này.
            </div>

            <button
              type="button"
              onClick={() => setEditSuccessModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md transition cursor-pointer"
            >
              Xác nhận & Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
