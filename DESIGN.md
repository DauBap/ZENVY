---
name: ZENVY
description: Nền tảng đặt lịch xem Tarot cao cấp — tinh tế, uy tín, sâu lắng
colors:
  primary: "oklch(0.65 0.2 280)"
  accent: "oklch(0.75 0.15 80)"
  background: "oklch(0.08 0.02 280)"
  foreground: "oklch(0.95 0.01 280)"
  card: "oklch(0.12 0.025 280)"
  muted: "oklch(0.15 0.02 280)"
  muted-foreground: "oklch(0.6 0.02 280)"
  border: "oklch(0.25 0.04 280)"
  input: "oklch(0.18 0.03 280)"
  destructive: "oklch(0.577 0.245 27.325)"
  cosmic-purple: "oklch(0.45 0.25 280)"
  cosmic-blue: "oklch(0.4 0.2 250)"
  mystic-gold: "oklch(0.75 0.15 80)"
  deep-black: "oklch(0.05 0.01 280)"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "0.5rem"
  md: "0.6875rem"
  lg: "0.75rem"
  xl: "1rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  card-glass:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: ZENVY

## 1. Overview

**Creative North Star: "Đài quan sát lúc nửa đêm"**

ZENVY sống trong một không gian tối, tĩnh và sâu — như đứng trước một đài thiên văn vào lúc nửa đêm, nơi sự huyền bí được cảm nhận qua chiều sâu và ánh sáng có chủ đích, không phải qua sự ồn ào. Nền tím-đen vũ trụ (oklch 0.08) làm phông cho chữ sáng và hai điểm nhấn được kiểm soát chặt: tím huyền (primary) cho hành động, vàng kim (accent) cho sự tin cậy và uy tín. Cảm giác tổng thể là **cao cấp và tinh tế**, không phải bói toán đường phố.

Hệ thống dùng glassmorphism và hiệu ứng glow như gia vị, không phải chủ đề. Bề mặt phẳng ở trạng thái nghỉ; chiều sâu xuất hiện khi tương tác. Bo góc rộng và nhất quán (12px) tạo sự mềm mại sang trọng. Typography ghép Playfair Display (serif hiển thị, gợi nghi thức và chiều sâu) với Inter (sans thân bài, hiện đại và dễ đọc) trên trục tương phản serif/sans.

Hệ thống này **từ chối** mọi thứ gợi mê tín rẻ tiền: tím neon chói, sao chi chít, biểu tượng huyền bí sến súa, hứa hẹn quá lời. Sự huyền bí ở đây được thể hiện bằng sự tiết chế.

**Key Characteristics:**
- Theme tối vũ trụ, nền tím-đen sâu làm chủ đạo
- Hai điểm nhấn kỷ luật: tím huyền (hành động) + vàng kim (uy tín)
- Glass & glow là gia vị, không phải chủ đề
- Serif hiển thị + sans thân bài, tương phản rõ
- Bo góc rộng nhất quán (12px), mềm mại sang trọng
- Mobile-first

## 2. Colors

Bảng màu tối đơn sắc lấy tím (hue 280) làm xương sống, điểm xuyết vàng kim (hue 80) làm đối trọng ấm.

### Primary
- **Tím Huyền** (oklch(0.65 0.2 280)): Màu hành động chính — nút primary, link, focus ring, biểu đồ. Mang năng lượng tâm linh nhưng được giữ ở độ bão hòa vừa phải để không chói.
- **Tím Vũ Trụ Sâu** (oklch(0.45 0.25 280)): Bản tím đậm hơn cho gradient nền, hiệu ứng glow, chiều sâu khí quyển.

### Secondary
- **Vàng Kim Huyền Bí** (oklch(0.75 0.15 80)): Điểm nhấn ấm cho dấu xác minh, sao đánh giá, chi tiết cao cấp. Đối trọng với biển tím lạnh. Dùng tiết chế — sự hiếm là điểm mạnh.
- **Xanh Tinh Vân** (oklch(0.4 0.2 250)): Màu phụ trợ trong gradient và biểu đồ.

### Neutral
- **Ánh Sao** (oklch(0.95 0.01 280)): Chữ chính trên nền tối, tương phản cao.
- **Xám Hoàng Hôn** (oklch(0.6 0.02 280)): Chữ phụ, mô tả. CẢNH BÁO tương phản — xem Do's/Don'ts.
- **Hư Vô Vũ Trụ** (oklch(0.08 0.02 280)): Nền trang chủ đạo.
- **Đen Sâu** (oklch(0.05 0.01 280)): Nền sâu nhất, lớp đáy.
- **Viền Tinh Tú** (oklch(0.25 0.04 280)): Viền, đường chia, ở mức rất tinh tế.

### Tertiary
- **Đỏ Tín Hiệu** (oklch(0.577 0.245 27.325)): Chỉ dùng cho lỗi, hủy, hành động phá hủy.

### Named Rules
**Quy tắc Hai Giọng.** Trên một màn hình, chỉ tím huyền và vàng kim được phép làm điểm nhấn. Vàng kim giữ ở ≤10% diện tích — nó báo hiệu uy tín, sự hiếm là điểm mạnh. Không thêm hue thứ ba làm accent.

## 3. Typography

**Display Font:** Playfair Display (fallback Georgia, serif)
**Body Font:** Inter (fallback system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (chỉ cho số liệu/mã, nếu cần)

**Character:** Serif hiển thị cổ điển, kịch tính ghép với sans hình học hiện đại, sạch. Tương phản serif/sans tạo cảm giác vừa nghi thức vừa dễ tiếp cận — đúng tinh thần "tâm linh nhưng chuyên nghiệp".

### Hierarchy
- **Display** (700, clamp(2.5rem, 6vw, 5rem), 1.05): Tiêu đề hero, tên màn hình lớn. Playfair Display.
- **Headline** (600, clamp(1.5rem, 3vw, 2.25rem), 1.2): Tiêu đề mục, tên reader. Inter.
- **Title** (600, 1.125–1.25rem, 1.3): Tiêu đề card, nhóm.
- **Body** (400, 1rem, 1.6): Văn bản thân bài. Giới hạn 65–75ch cho đoạn dài.
- **Label** (500, 0.875rem, 1.4): Nhãn nút, chip, metadata.

### Named Rules
**Quy tắc Serif Tiết Chế.** Playfair Display chỉ dành cho cấp Display/Headline. Không dùng serif cho thân bài hay nhãn — nó là điểm nhấn nghi thức, không phải chữ làm việc.

## 4. Elevation

Hệ thống tối ưu cho nền tối: chiều sâu tạo bằng **lớp tông màu** (nền 0.08 → card 0.12 → popover 0.10) và **glow phát sáng**, không phải bóng đổ truyền thống (bóng đen vô nghĩa trên nền tối). Glassmorphism (`backdrop-filter: blur`) tạo lớp nổi trong suốt cho card và overlay.

### Shadow Vocabulary
- **Glow Tím** (`box-shadow: 0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2), 0 0 60px rgba(168,85,247,0.1)`): Phát sáng quanh phần tử hành động/nổi bật. Dùng có chủ đích.
- **Glow Vàng** (`box-shadow: 0 0 20px rgba(251,191,36,0.4), 0 0 40px rgba(251,191,36,0.2)`): Phát sáng cho chi tiết cao cấp/xác minh.
- **Glass** (`backdrop-filter: blur(12px)` + nền trắng mờ 5% + viền trắng 10%): Lớp kính cho card nổi.

### Named Rules
**Quy tắc Sáng-Thay-Vì-Tối.** Trên nền tối, chiều sâu đến từ ánh sáng (glow, lớp tông sáng dần) chứ không phải bóng đen. Bóng đổ tối truyền thống bị cấm vì vô hình.

## 5. Components

### Buttons
- **Shape:** Bo góc rộng (0.75rem / 12px).
- **Primary:** Nền tím huyền (oklch(0.65 0.2 280)), chữ ánh sao, padding 12px 24px.
- **Hover / Focus:** Sáng/đậm nhẹ + có thể thêm glow tím tinh tế; focus ring dùng màu ring (tím).
- **Outline / Ghost:** Nền trong suốt, viền trắng mờ (border-white/10), chữ sáng; hover nền trắng mờ nhẹ.
- **Destructive:** Nền đỏ tín hiệu, chỉ cho hành động hủy/xóa.

### Cards / Containers
- **Corner Style:** Bo góc 0.75–1rem (12–16px).
- **Background:** Card oklch(0.12) hoặc glass (trắng mờ 5% + blur).
- **Shadow Strategy:** Phẳng khi nghỉ; glow/lớp glass khi nổi (xem Elevation).
- **Border:** Viền trắng mờ 10% (border-white/10), rất tinh tế.
- **Internal Padding:** 24px (lg).

### Inputs / Fields
- **Style:** Nền input tối (oklch(0.18)), bo góc 11px, viền tinh tế.
- **Focus:** Ring màu tím (var(--ring)), rõ ràng cho điều hướng bàn phím.
- **Error / Disabled:** Đỏ tín hiệu cho lỗi; giảm opacity khi disabled.

### Navigation
- Header trong suốt/glass ở đỉnh; mobile có MobileNav dạng thanh dưới. Chữ sáng, trạng thái active dùng tím.

### Signature: Glass Card + Cosmic Background
Card kính nổi trên nền vũ trụ động (sao lấp lánh, gradient dịch chuyển) là chữ ký thị giác của ZENVY. Hiệu ứng phải tinh tế — gợi chiều sâu, không phải sân khấu ảo thuật.

## 6. Do's and Don'ts

### Do:
- **Do** giữ nền tím-đen sâu (oklch 0.08) làm chủ đạo; để chữ sáng và khoảng tối tạo sự sang trọng.
- **Do** giới hạn accent vàng kim ở ≤10% diện tích (Quy tắc Hai Giọng).
- **Do** tạo chiều sâu bằng glow và lớp tông sáng dần, không phải bóng đen (Quy tắc Sáng-Thay-Vì-Tối).
- **Do** kiểm tra tương phản: chữ thân bài ≥4.5:1 trên nền tối; nếu dùng "Xám Hoàng Hôn" cho đoạn dài, đẩy về phía ánh sao.
- **Do** cung cấp phương án `prefers-reduced-motion: reduce` cho mọi animation (float, twinkle, pulse-glow, gradient-shift, shimmer).
- **Do** dùng Playfair Display chỉ cho Display/Headline.

### Don't:
- **Don't** biến nó thành mê tín rẻ tiền: tím neon chói, sao chi chít trang trí, biểu tượng huyền bí sến, font kiểu phù thủy.
- **Don't** lạm dụng glassmorphism — kính là gia vị hiếm, không phải mặc định cho mọi card (cảnh báo: codebase hiện đang dùng khá nhiều, cân nhắc tiết chế).
- **Don't** lạm dụng gradient text (`background-clip: text`) — hiện có `.gradient-text`/`.gradient-text-gold`; dùng tiết chế, ưu tiên màu đặc + nhấn bằng cỡ/đậm.
- **Don't** để "Xám Hoàng Hôn" (oklch 0.6) làm chữ thân bài dài trên nền tối nếu chưa kiểm tra đạt 4.5:1.
- **Don't** thêm hue thứ ba làm accent ngoài tím và vàng kim.
- **Don't** dùng bóng đổ đen kiểu nền sáng — vô hình trên theme tối.
