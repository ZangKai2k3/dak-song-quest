import type { QuizQuestion } from "../types";

export const questions: QuizQuestion[] = [
  {
    id: "nature-01", category: "Thiên nhiên",
    question: "Đắk Song thuộc tỉnh nào?",
    options: ["Đắk Lắk", "Đắk Nông", "Gia Lai", "Lâm Đồng"], answerIndex: 1,
    explanation: "Đắk Song là một huyện của tỉnh Đắk Nông, thuộc khu vực Tây Nguyên."
  },
  {
    id: "nature-02", category: "Thiên nhiên",
    question: "Cảnh quan nào thường tạo nên nét đặc trưng hấp dẫn của vùng Tây Nguyên?",
    options: ["Đồi núi, rừng và thác", "Đồng bằng ngập mặn", "Bãi biển cát trắng", "Đảo san hô"], answerIndex: 0,
    explanation: "Tây Nguyên nổi bật với địa hình cao nguyên, rừng, thác và nhiều cảnh quan tự nhiên.", locationId: "p4"
  },
  {
    id: "nature-03", category: "Thiên nhiên",
    question: "Mùa mưa ở Tây Nguyên thường thuận lợi cho trải nghiệm nào?",
    options: ["Khám phá thác và rừng", "Tắm biển", "Trượt tuyết", "Lặn san hô"], answerIndex: 0,
    explanation: "Mưa làm dòng thác mạnh hơn và cảnh quan rừng xanh tốt, nhưng cần ưu tiên an toàn khi di chuyển."
  },
  {
    id: "nature-04", category: "Thiên nhiên",
    question: "Khi tham quan khu vực rừng/thác, hành động nào phù hợp nhất?",
    options: ["Mang rác về đúng nơi quy định", "Tự ý đốt lửa", "Bẻ cây làm kỷ niệm", "Đi vào khu vực cấm"], answerIndex: 0,
    explanation: "Du lịch có trách nhiệm giúp bảo vệ cảnh quan và hệ sinh thái địa phương."
  },
  {
    id: "nature-05", category: "Thiên nhiên",
    question: "Đất đỏ bazan ở Tây Nguyên nổi tiếng phù hợp với cây trồng nào?",
    options: ["Cà phê", "Dừa nước", "Đước", "Muối"], answerIndex: 0,
    explanation: "Đất bazan màu mỡ và khí hậu cao nguyên tạo điều kiện thuận lợi cho cây cà phê."
  },
  {
    id: "mnong-01", category: "Văn hóa M’Nông",
    question: "M’Nông là một trong các cộng đồng dân tộc sinh sống lâu đời ở khu vực nào?",
    options: ["Tây Nguyên", "Đồng bằng sông Hồng", "Tây Bắc", "Đồng bằng sông Cửu Long"], answerIndex: 0,
    explanation: "Người M’Nông là một trong những dân tộc bản địa gắn bó lâu đời với không gian văn hóa Tây Nguyên.", locationId: "p3"
  },
  {
    id: "mnong-02", category: "Văn hóa M’Nông",
    question: "Không gian văn hóa cồng chiêng Tây Nguyên được UNESCO ghi danh ở cấp độ nào?",
    options: ["Di sản văn hóa phi vật thể", "Di sản thiên nhiên", "Di sản tư liệu", "Kỳ quan thế giới"], answerIndex: 0,
    explanation: "Không gian văn hóa cồng chiêng Tây Nguyên được UNESCO ghi danh là kiệt tác truyền khẩu và di sản phi vật thể."
  },
  {
    id: "mnong-03", category: "Văn hóa M’Nông",
    question: "Loại hình nào thường gắn với sinh hoạt văn hóa cộng đồng Tây Nguyên?",
    options: ["Cồng chiêng và lễ hội", "Opera châu Âu", "Kabuki", "Flamenco"], answerIndex: 0,
    explanation: "Cồng chiêng, lễ hội và sinh hoạt cộng đồng là những thành tố quan trọng trong đời sống văn hóa Tây Nguyên."
  },
  {
    id: "mnong-04", category: "Văn hóa M’Nông",
    question: "Khi tìm hiểu văn hóa M’Nông, cách tiếp cận nào phù hợp?",
    options: ["Tôn trọng cộng đồng và hỏi trước khi chụp ảnh", "Tự ý lấy đồ thủ công", "Chế giễu phong tục", "Tự ý vào khu vực nghi lễ"], answerIndex: 0,
    explanation: "Tôn trọng chủ thể văn hóa là nguyên tắc quan trọng của du lịch cộng đồng."
  },
  {
    id: "mnong-05", category: "Văn hóa M’Nông",
    question: "Nhạc cụ cồng chiêng thường có vai trò gì trong đời sống cộng đồng Tây Nguyên?",
    options: ["Gắn với nghi lễ và sinh hoạt cộng đồng", "Chỉ dùng để báo giờ", "Chỉ dùng trong thể thao", "Chỉ dùng để trang trí"], answerIndex: 0,
    explanation: "Cồng chiêng có giá trị nghệ thuật, tín ngưỡng và cộng đồng, hiện diện trong nhiều nghi lễ và sinh hoạt."
  },
  {
    id: "food-01", category: "Ẩm thực",
    question: "Cà phê là một sản vật nổi tiếng gắn với vùng nào của Việt Nam?",
    options: ["Tây Nguyên", "Đồng bằng sông Hồng", "Đông Bắc", "Ven biển Nam Trung Bộ"], answerIndex: 0,
    explanation: "Tây Nguyên là vùng sản xuất cà phê quan trọng của Việt Nam.", locationId: "p2"
  },
  {
    id: "food-02", category: "Ẩm thực",
    question: "Khi thưởng thức đặc sản địa phương, lựa chọn nào thể hiện du lịch bền vững?",
    options: ["Ưu tiên sản phẩm địa phương có nguồn gốc rõ ràng", "Mua động vật hoang dã", "Lấy cây rừng làm quà", "Mua sản phẩm không rõ nguồn gốc"], answerIndex: 0,
    explanation: "Ưu tiên sản phẩm địa phương hợp pháp giúp tạo sinh kế và giảm tác động tiêu cực tới môi trường."
  },
  {
    id: "food-03", category: "Ẩm thực",
    question: "Cà phê rang xay tại địa phương có thể trở thành sản phẩm du lịch theo cách nào?",
    options: ["Quà tặng và trải nghiệm thử cà phê", "Chỉ dùng làm nhiên liệu", "Chỉ trưng bày trong bảo tàng", "Không thể gắn với du lịch"], answerIndex: 0,
    explanation: "Ẩm thực và nông sản có thể được kết hợp thành trải nghiệm, quà tặng và câu chuyện điểm đến."
  },
  {
    id: "food-04", category: "Ẩm thực",
    question: "Một nguyên tắc an toàn khi thử món ăn mới là gì?",
    options: ["Hỏi thành phần nếu có dị ứng", "Ăn thật nhanh", "Không cần quan tâm nguồn gốc", "Chỉ chọn món đắt tiền"], answerIndex: 0,
    explanation: "Hỏi thành phần giúp giảm rủi ro, đặc biệt với người có dị ứng thực phẩm."
  },
  {
    id: "food-05", category: "Ẩm thực",
    question: "Du lịch nông nghiệp cà phê có thể mang lại giá trị nào?",
    options: ["Kết nối sản xuất, trải nghiệm và tiêu thụ sản phẩm", "Chỉ tăng giao thông", "Chỉ tạo thêm rác", "Không có giá trị kinh tế"], answerIndex: 0,
    explanation: "Du lịch nông nghiệp giúp kể câu chuyện sản phẩm và tạo thêm giá trị cho chuỗi địa phương."
  },
  {
    id: "hidden-01", category: "Hidden Gems",
    question: "Khái niệm 'Hidden Gem' trong du lịch thường chỉ điều gì?",
    options: ["Điểm đến ít người biết nhưng đáng khám phá", "Khách sạn 5 sao", "Sân bay quốc tế", "Trung tâm thương mại"], answerIndex: 0,
    explanation: "Hidden Gem là cách gọi phổ biến cho những điểm đến thú vị nhưng chưa quá nổi tiếng.", locationId: "p5"
  },
  {
    id: "hidden-02", category: "Hidden Gems",
    question: "Trước khi đến một điểm ít người biết, nên kiểm tra điều gì?",
    options: ["Đường đi, thời tiết và quy định địa phương", "Chỉ giá vé máy bay", "Chỉ số lượt thích", "Không cần chuẩn bị"], answerIndex: 0,
    explanation: "Điểm ít người biết có thể thiếu dịch vụ hỗ trợ, vì vậy cần chuẩn bị kỹ hơn."
  },
  {
    id: "hidden-03", category: "Hidden Gems",
    question: "Nếu đường vào điểm tham quan chưa rõ ràng, lựa chọn an toàn là gì?",
    options: ["Hỏi người địa phương hoặc đơn vị quản lý", "Tự đi đường rừng bất kỳ", "Bỏ qua biển cảnh báo", "Đi vào ban đêm"], answerIndex: 0,
    explanation: "Thông tin địa phương giúp bạn chọn tuyến phù hợp và tránh khu vực nguy hiểm."
  },
  {
    id: "hidden-04", category: "Hidden Gems",
    question: "Một bản đồ khám phá số có thể giúp du khách làm gì?",
    options: ["Tìm điểm, xem thông tin và lên kế hoạch tuyến", "Thay thế hoàn toàn hướng dẫn viên", "Đảm bảo không bao giờ lạc", "Thay đổi thời tiết"], answerIndex: 0,
    explanation: "Bản đồ số hỗ trợ khám phá và lập kế hoạch nhưng không thay thế hoàn toàn đánh giá an toàn thực tế."
  },
  {
    id: "hidden-05", category: "Hidden Gems",
    question: "Tại sao review của du khách nên đi kèm thông tin xác thực?",
    options: ["Giúp người khác đánh giá thông tin đáng tin cậy", "Để tăng độ dài bài viết", "Để mọi nơi đều giống nhau", "Không có lý do"], answerIndex: 0,
    explanation: "Thông tin có nguồn và thời điểm rõ ràng giúp giảm rủi ro khi lập kế hoạch chuyến đi."
  },
  {
    id: "mix-01", category: "Tổng hợp",
    question: "Nếu trời mưa lớn khi bạn đang định đến thác, nên làm gì?",
    options: ["Ưu tiên an toàn và cân nhắc đổi lịch", "Cố đi bằng mọi giá", "Bơi dưới thác", "Đi vào vùng cấm"], answerIndex: 0,
    explanation: "Mưa lớn có thể làm mực nước và dòng chảy thay đổi nhanh, nên an toàn luôn được ưu tiên."
  },
  {
    id: "mix-02", category: "Tổng hợp",
    question: "Voucher du lịch số có giá trị nhất khi nào?",
    options: ["Có mã riêng, điều kiện và thời hạn rõ ràng", "Không có mã", "Không có nơi áp dụng", "Không có hạn sử dụng"], answerIndex: 0,
    explanation: "Mã riêng và điều kiện rõ ràng giúp doanh nghiệp kiểm soát đổi ưu đãi và giảm nhầm lẫn."
  },
  {
    id: "mix-03", category: "Tổng hợp",
    question: "Điểm số quiz nên được dùng như thế nào trong Đắk Song Quest?",
    options: ["Khuyến khích khám phá và mở khóa ưu đãi", "Đánh giá giá trị con người", "Thay thế giấy tờ cá nhân", "Dùng để quyết định quyền truy cập dịch vụ công"], answerIndex: 0,
    explanation: "Điểm số là cơ chế gamification để khuyến khích trải nghiệm, không phải công cụ đánh giá cá nhân."
  },
  {
    id: "mix-04", category: "Tổng hợp",
    question: "Chia sẻ thành tích lên Zalo có tác dụng gì?",
    options: ["Tạo động lực và lan tỏa điểm đến", "Bắt buộc người khác chơi", "Xác nhận hộ chiếu", "Thay thế bản đồ"], answerIndex: 0,
    explanation: "Social sharing giúp tăng tương tác và lan tỏa hình ảnh điểm đến nếu người dùng chủ động chia sẻ."
  },
  {
    id: "mix-05", category: "Tổng hợp",
    question: "Cách kết hợp game, bản đồ và voucher hợp lý nhất là gì?",
    options: ["Chơi → khám phá → mở khóa → nhận ưu đãi", "Chỉ xem quảng cáo", "Chỉ thu thập dữ liệu cá nhân", "Chỉ xem bảng xếp hạng"], answerIndex: 0,
    explanation: "Luồng này tạo vòng lặp trải nghiệm rõ ràng và gắn gamification với hành vi khám phá thực tế."
  }
];