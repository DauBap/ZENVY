import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Star, Shield, Clock, Users, ArrowRight,
  Heart, Briefcase, Compass, MessageCircle, Calendar, BadgeCheck,
  Plus, Minus, Moon
} from "lucide-react";
import { useState } from "react";
import { READERS, TESTIMONIALS, FAQS } from "@/lib/mock-data";
import { ReaderCard } from "@/components/reader-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mystica — Sự rõ ràng cho trái tim, ngay khi bạn cần" },
      { name: "description", content: "Đặt buổi tarot 1-1 với những reader đáng tin cậy. AI Tarot miễn phí. Hoạt động 24/7, mã hoá end-to-end." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <TrustBar />
      <FeaturedReaders />
      <HowItWorks />
      <AISection />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const onlineCount = READERS.filter((r) => r.online).length;
  return (
    <section className="relative px-4 pt-12 md:pt-20">
      {/* floating mystical orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[10%] top-20 h-40 w-40 rounded-full bg-gradient-aurora opacity-30 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[5%] top-40 h-56 w-56 rounded-full bg-gradient-mystic opacity-25 blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-md"
        >
          <span className="flex h-2 w-2"><span className="absolute h-2 w-2 animate-ping rounded-full bg-success opacity-70"/><span className="h-2 w-2 rounded-full bg-success" /></span>
          {onlineCount} reader đang online · sẵn sàng lắng nghe bạn
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          Bạn đang cần <span className="gradient-text">sự rõ ràng</span><br />
          cho điều mà trái tim<br className="md:hidden" /> chưa dám gọi tên?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Mystica kết nối bạn với những reader tarot được xác minh kỹ lưỡng — trong tình yêu, sự nghiệp và hành trình bên trong. An toàn, riêng tư, mọi lúc.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/readers" className="group inline-flex items-center gap-2 rounded-full bg-gradient-aurora px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105">
            <Sparkles className="h-4 w-4" /> Tìm reader cho bạn
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/ai-tarot" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-7 py-3.5 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-card">
            <Moon className="h-4 w-4" /> Trải bài AI miễn phí
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-success" /> Mã hoá end-to-end</span>
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-accent" /> 100% reader xác minh</span>
          <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-gold text-gold" /> 4.9/5 từ 12,000+ reviews</span>
        </motion.div>

        {/* Floating reader preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto mt-16 max-w-4xl"
        >
          <div className="relative rounded-3xl border border-border bg-card/40 p-3 shadow-card backdrop-blur-xl md:p-5">
            <div className="rounded-2xl bg-gradient-cosmic p-6 md:p-10">
              <div className="grid items-center gap-6 md:grid-cols-3">
                {READERS.slice(0, 3).map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`flex items-center gap-3 rounded-2xl border border-border/40 bg-background/30 p-3 backdrop-blur-md ${i === 1 ? "md:scale-110" : ""}`}
                  >
                    <div className="relative">
                      <img src={r.avatar} className="h-12 w-12 rounded-xl object-cover" alt={r.name} />
                      {r.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        {r.name.split(" ")[0]}
                        {r.verified && <BadgeCheck className="h-3 w-3 text-accent" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.specialties[0]} · ⭐ {r.rating.toFixed(1)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- TRUST BAR ---------------- */
function TrustBar() {
  const stats = [
    { v: "120K+", l: "buổi đọc bài hoàn thành" },
    { v: "4.9/5", l: "đánh giá trung bình" },
    { v: "850+", l: "reader xác minh" },
    { v: "< 2 phút", l: "thời gian phản hồi" },
    { v: "98%", l: "khách quay lại" },
  ];
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card/40 p-8 backdrop-blur-xl md:p-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-semibold gradient-text-gold md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURED READERS ---------------- */
function FeaturedReaders() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Reader nổi bật</p>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">
              Những trái tim <span className="gradient-text">đang lắng nghe</span> bạn
            </h2>
          </div>
          <Link to="/readers" className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
            Xem tất cả <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {READERS.slice(0, 4).map((r, i) => (
            <ReaderCard key={r.id} reader={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function HowItWorks() {
  const steps = [
    { icon: Compass, title: "Chọn reader phù hợp", desc: "Lọc theo chuyên môn, đánh giá, ngôn ngữ. Xem profile chi tiết và intro video." },
    { icon: Calendar, title: "Đặt lịch chỉ trong 60 giây", desc: "Chọn package, thời gian phù hợp với múi giờ. Thanh toán an toàn." },
    { icon: Heart, title: "Nhận guidance bạn cần", desc: "Trò chuyện qua chat hoặc voice. Bảo mật tuyệt đối, hoàn tiền nếu không hài lòng." },
  ];
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cách hoạt động</p>
        <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">
          Ba bước đến với <span className="gradient-text">sự rõ ràng</span>
        </h2>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative rounded-3xl border border-border bg-card/50 p-8 text-left backdrop-blur-xl transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-aurora shadow-glow">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-display text-5xl font-semibold text-muted/50">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- AI SECTION ---------------- */
function AISection() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border bg-gradient-cosmic p-8 md:p-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
              <Sparkles className="h-3 w-3" /> Miễn phí 100%
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">
              Thử ngay <span className="gradient-text-gold">AI Tarot</span><br />trước khi gặp reader thật
            </h2>
            <p className="mt-4 text-muted-foreground">
              Đặt câu hỏi của bạn — AI của Mystica sẽ trải bài và đưa ra góc nhìn ban đầu. Khi bạn sẵn sàng đi sâu hơn, chúng tôi sẽ giới thiệu reader phù hợp nhất.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/ai-tarot" className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-gold transition-transform hover:scale-105">
                <Moon className="h-4 w-4" /> Trải bài ngay
              </Link>
              <Link to="/readers" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/30 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-background/50">
                Hoặc gặp reader thật
              </Link>
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {["🌙", "✨", "💞"].map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ rotateY: 180, opacity: 0 }}
                whileInView={{ rotateY: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                whileHover={{ y: -8, rotate: i === 1 ? 0 : i === 0 ? -3 : 3 }}
                className={`aspect-[2/3] rounded-2xl border border-gold/30 bg-gradient-mystic p-4 shadow-card ${i === 1 ? "translate-y-4" : ""}`}
              >
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="text-5xl">{emoji}</div>
                  <div className="rounded-full border border-gold/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">Arcana</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Câu chuyện thật</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">
            Hàng ngàn trái tim đã <span className="gradient-text">tìm thấy lối đi</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <img src={t.avatar} className="h-9 w-9 rounded-full object-cover" alt={t.name} />
                <div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    {t.name}
                    {t.verified && <BadgeCheck className="h-3 w-3 text-accent" />}
                  </div>
                  <div className="text-xs text-muted-foreground">đọc bài với {t.reader}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Câu hỏi thường gặp</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-5xl">Mọi điều bạn muốn biết</h2>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium">{f.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-muted/40">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  return (
    <section className="px-4 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-gradient-cosmic p-10 text-center md:p-16">
        <motion.div
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-aurora opacity-30 blur-3xl"
        />
        <h2 className="font-display text-3xl font-semibold md:text-5xl">
          Vũ trụ đã sẵn sàng.<br />
          <span className="gradient-text-gold">Còn bạn?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Bắt đầu hành trình của bạn — buổi đọc bài đầu tiên giảm 50%.
        </p>
        <Link to="/readers" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-sm font-semibold text-gold-foreground shadow-gold transition-transform hover:scale-105">
          <Sparkles className="h-4 w-4" /> Tìm reader cho bạn ngay
        </Link>
      </div>
    </section>
  );
}
