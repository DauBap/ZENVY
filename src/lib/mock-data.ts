export type Reader = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  cover: string;
  online: boolean;
  verified: boolean;
  rating: number;
  reviews: number;
  sessions: number;
  responseTime: string;
  pricePerMin: number;
  specialties: string[];
  languages: string[];
  bio: string;
  tagline: string;
  yearsExperience: number;
};

const avatars = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
];

const covers = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&h=400&fit=crop",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=400&fit=crop",
];

const names = [
  "Luna Seraphina", "Orion Blackwood", "Maeve Ashthorne", "Cassian Vale",
  "Selene Moonshade", "Ravenna Cole", "Isolde Wren", "Atticus Storm",
];

const taglines = [
  "Khai mở những điều trái tim chưa dám gọi tên.",
  "Bản đồ định mệnh dành cho những trái tim đang lạc lối.",
  "Bạn không cô đơn. Vũ trụ đang lắng nghe.",
  "Mỗi lá bài là một cánh cửa. Hãy bước qua cùng tôi.",
  "Ánh sáng luôn ở đó — dù bạn chưa nhìn thấy.",
  "Sự rõ ràng bắt đầu từ một câu hỏi chân thành.",
  "Tarot không phán xét. Nó chỉ phản chiếu sự thật.",
  "Hành trình bên trong là hành trình quan trọng nhất.",
];

const specialtiesPool = [
  "Tình yêu", "Sự nghiệp", "Tâm linh", "Tài chính", "Chữa lành",
  "Tiền kiếp", "Twin Flame", "Định hướng", "Năng lượng", "Mối quan hệ",
];

export const READERS: Reader[] = names.map((name, i) => ({
  id: `reader-${i + 1}`,
  name,
  handle: name.toLowerCase().replace(/\s+/g, "."),
  avatar: avatars[i % avatars.length],
  cover: covers[i % covers.length],
  online: i % 3 !== 0,
  verified: i % 4 !== 0,
  rating: 4.6 + ((i * 7) % 4) / 10,
  reviews: 120 + i * 87,
  sessions: 350 + i * 213,
  responseTime: ["< 1 phút", "< 3 phút", "< 5 phút"][i % 3],
  pricePerMin: 25000 + (i % 5) * 10000,
  specialties: [
    specialtiesPool[i % specialtiesPool.length],
    specialtiesPool[(i + 3) % specialtiesPool.length],
    specialtiesPool[(i + 5) % specialtiesPool.length],
  ],
  languages: ["Tiếng Việt", "English"].slice(0, (i % 2) + 1),
  bio: "Tôi đã đồng hành cùng hàng ngàn trái tim trong những khoảnh khắc khó khăn nhất của họ. Mỗi buổi đọc bài là một không gian an toàn — nơi bạn có thể trút bỏ mọi mặt nạ và lắng nghe tiếng nói thật sự bên trong mình.",
  tagline: taglines[i % taglines.length],
  yearsExperience: 3 + (i % 12),
}));

export const TESTIMONIALS = [
  { name: "Mai Anh", avatar: avatars[2], rating: 5, text: "Buổi đọc bài giúp tôi nhìn rõ điều trái tim mình thật sự muốn. Cảm xúc dâng trào nhưng nhẹ nhõm.", verified: true, reader: "Luna Seraphina" },
  { name: "Hữu Thắng", avatar: avatars[0], rating: 5, text: "Reader rất tinh tế, không phán xét. Tôi tìm thấy sự rõ ràng cho hướng đi sự nghiệp của mình.", verified: true, reader: "Orion Blackwood" },
  { name: "Linh Đan", avatar: avatars[7], rating: 5, text: "Lần đầu tôi tin rằng tarot là thật. Mọi thứ chính xác đến lạnh sống lưng.", verified: true, reader: "Maeve Ashthorne" },
  { name: "Quốc Bảo", avatar: avatars[3], rating: 4.8, text: "Không gian rất an toàn để chia sẻ. Tôi đã khóc, đã cười và rời đi với niềm tin mới.", verified: true, reader: "Selene Moonshade" },
];

export const FAQS = [
  { q: "Mọi thông tin của tôi có được bảo mật không?", a: "Tất cả các buổi đọc bài đều được mã hoá end-to-end. Chúng tôi không lưu trữ nội dung cuộc trò chuyện và bạn có toàn quyền xoá lịch sử bất cứ lúc nào." },
  { q: "Tôi có thể hoàn tiền nếu không hài lòng?", a: "Có. Chúng tôi cam kết hoàn 100% trong vòng 24h nếu bạn cảm thấy buổi đọc không đáp ứng kỳ vọng — không cần giải thích." },
  { q: "Reader trên Mystica được xác minh thế nào?", a: "Mỗi reader trải qua quy trình 4 bước: phỏng vấn, kiểm tra kỹ năng đọc bài, đánh giá đạo đức và thử nghiệm cộng đồng trong 30 ngày." },
  { q: "Tôi có thể đặt lịch trễ vào lúc nào?", a: "Reader hoạt động 24/7. Bạn có thể đặt buổi ngay lập tức hoặc lên lịch trước theo múi giờ của mình." },
  { q: "Các phương thức thanh toán được hỗ trợ?", a: "Thẻ Visa/Mastercard, MoMo, ZaloPay, Apple Pay, Google Pay và chuyển khoản ngân hàng." },
];

export const TAROT_CARDS = [
  { name: "The Fool", emoji: "🌙", meaning: "Khởi đầu mới, tự do, niềm tin vào vũ trụ." },
  { name: "The Lovers", emoji: "💞", meaning: "Sự kết nối sâu sắc, lựa chọn của trái tim." },
  { name: "The Star", emoji: "✨", meaning: "Hy vọng, chữa lành, ánh sáng dẫn đường." },
  { name: "The Moon", emoji: "🌑", meaning: "Trực giác, ảo ảnh, những điều ẩn giấu." },
  { name: "The Sun", emoji: "☀️", meaning: "Niềm vui, thành công, sự rõ ràng." },
  { name: "The World", emoji: "🌍", meaning: "Hoàn thành, viên mãn, một chu kỳ khép lại." },
];
