import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BadgeCheck, Star, Clock, MessageCircle, Heart, Share2,
  Globe, Sparkles, PlayCircle, Calendar, Shield, ChevronLeft
} from "lucide-react";
import { READERS, TESTIMONIALS } from "@/lib/mock-data";

export const Route = createFileRoute("/reader/$readerId")({
  loader: ({ params }) => {
    const reader = READERS.find((r) => r.id === params.readerId);
    if (!reader) throw notFound();
    return { reader };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.reader.name} — Reader trên Mystica` },
      { name: "description", content: loaderData?.reader.tagline },
      { property: "og:image", content: loaderData?.reader.cover },
    ],
  }),
  component: ReaderProfile,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-display text-3xl">Reader không tồn tại</h1>
      <Link to="/readers" className="mt-4 inline-block text-primary">Quay lại danh sách</Link>
    </div>
  ),
});

function ReaderProfile() {
  const { reader } = Route.useLoaderData();

  const packages = [
    { name: "Khám phá nhanh", duration: "15 phút", price: reader.pricePerMin * 15, desc: "Một câu hỏi cụ thể, câu trả lời rõ ràng." },
    { name: "Đi sâu vào câu chuyện", duration: "30 phút", price: reader.pricePerMin * 30 * 0.9, desc: "Khám phá sâu một chủ đề bạn đang trăn trở.", popular: true },
    { name: "Buổi đọc chuyên sâu", duration: "60 phút", price: reader.pricePerMin * 60 * 0.85, desc: "Toàn cảnh tình yêu, sự nghiệp, hành trình bên trong." },
  ];

  return (
    <div className="pb-12">
      {/* Cover */}
      <div className="relative h-56 md:h-72">
        <img src={reader.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <Link to="/readers" className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs backdrop-blur-md">
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại
        </Link>
        <div className="absolute right-4 top-4 flex gap-2">
          {[Heart, Share2].map((Icon, i) => (
            <button key={i} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/50 backdrop-blur-md hover:bg-background/80">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto -mt-16 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
            <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl shadow-card">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img src={reader.avatar} alt={reader.name} className="h-24 w-24 rounded-2xl border-2 border-card object-cover shadow-card md:h-28 md:w-28" />
                  {reader.online && (
                    <span className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border-2 border-card bg-success px-2 py-0.5 text-[10px] font-semibold text-background">
                      online
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-semibold md:text-3xl">{reader.name}</h1>
                    {reader.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        <BadgeCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm italic text-muted-foreground">"{reader.tagline}"</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-gold text-gold" /> {reader.rating.toFixed(1)} ({reader.reviews})</span>
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {reader.sessions}+ buổi</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reader.responseTime}</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {reader.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {reader.specialties.map((s: string) => (
                  <span key={s} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>

            {/* Intro video */}
            <div className="mt-5 group relative aspect-video overflow-hidden rounded-3xl border border-border">
              <img src={reader.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-cosmic opacity-50" />
              <button className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-aurora shadow-glow transition-transform group-hover:scale-110">
                  <PlayCircle className="h-8 w-8 text-primary-foreground" />
                </span>
              </button>
              <div className="absolute bottom-4 left-4">
                <p className="text-xs text-muted-foreground">Lời chào từ {reader.name.split(" ")[0]}</p>
                <p className="font-display text-lg">"Hãy để tôi giới thiệu về hành trình của mình"</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-5 rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="font-display text-xl font-semibold">Về {reader.name.split(" ")[0]}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{reader.bio}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { l: "Kinh nghiệm", v: `${reader.yearsExperience} năm` },
                  { l: "Sessions", v: `${reader.sessions}+` },
                  { l: "Phản hồi", v: reader.responseTime },
                  { l: "Đánh giá", v: `${reader.rating.toFixed(1)}/5` },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-border bg-background/30 p-3 text-center">
                    <div className="font-display text-lg font-semibold gradient-text-gold">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-5 rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Đánh giá từ cộng đồng</h2>
                <span className="text-sm text-muted-foreground">{reader.reviews} reviews</span>
              </div>
              <div className="mt-4 space-y-4">
                {TESTIMONIALS.slice(0, 3).map((t, i) => (
                  <div key={i} className="rounded-2xl border border-border/50 bg-background/30 p-4">
                    <div className="flex items-center gap-3">
                      <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          {t.name} {t.verified && <BadgeCheck className="h-3 w-3 text-accent" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-gold text-gold" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground/90">"{t.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar — sticky CTA */}
          <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="md:sticky md:top-24 md:self-start">
            <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-xl shadow-card">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Từ</span>
                <div>
                  <span className="font-display text-3xl font-semibold gradient-text-gold">
                    {reader.pricePerMin.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-sm text-muted-foreground"> /phút</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {packages.map((p) => (
                  <div key={p.name} className={`relative rounded-2xl border p-4 ${p.popular ? "border-primary/50 bg-primary/5" : "border-border bg-background/20"}`}>
                    {p.popular && (
                      <span className="absolute -top-2 right-3 rounded-full bg-gradient-aurora px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Phổ biến</span>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.duration} · {p.desc}</div>
                      </div>
                      <div className="text-right font-display text-lg font-semibold">
                        {Math.round(p.price).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/booking/$readerId"
                params={{ readerId: reader.id }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-aurora py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                <Calendar className="h-4 w-4" /> Đặt lịch ngay
              </Link>
              <Link to="/chat" className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/20 py-3 text-sm font-medium transition-colors hover:bg-background/40">
                <MessageCircle className="h-4 w-4" /> Nhắn tin trước
              </Link>

              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/50 bg-background/20 p-3 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 text-success" />
                Hoàn 100% trong 24h nếu không hài lòng. Mã hoá end-to-end.
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-16 z-40 md:hidden">
        <div className="mx-3 rounded-2xl border border-border bg-card/90 p-3 shadow-card backdrop-blur-xl">
          <Link
            to="/booking/$readerId"
            params={{ readerId: reader.id }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-aurora py-3 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Calendar className="h-4 w-4" /> Đặt lịch · từ {reader.pricePerMin.toLocaleString("vi-VN")}đ/p
          </Link>
        </div>
      </div>
    </div>
  );
}
