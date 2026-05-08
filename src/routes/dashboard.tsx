import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Calendar, Heart, Sparkles, Bell, CreditCard, Clock, ChevronRight, Star } from "lucide-react";
import { READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Mystica" }] }),
  component: Dashboard,
});

function Dashboard() {
  const upcoming = READERS.slice(0, 2);
  const favorites = READERS.slice(2, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Chào buổi tối</p>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Mai Anh ✨</h1>
        </div>
        <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card/50">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>
      </motion.div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: "Buổi sắp tới", v: "2", icon: Calendar },
          { l: "Đã hoàn thành", v: "12", icon: Sparkles },
          { l: "Reader yêu thích", v: "5", icon: Heart },
          { l: "Số dư", v: "120K", icon: CreditCard },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-xl">
            <s.icon className="h-4 w-4 text-primary" />
            <div className="mt-2 font-display text-2xl font-semibold gradient-text-gold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Upcoming */}
          <section className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Buổi đọc sắp tới</h2>
              <Link to="/readers" className="text-xs text-muted-foreground hover:text-foreground">Đặt mới</Link>
            </div>
            <div className="mt-4 space-y-3">
              {upcoming.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-border bg-background/30 p-4">
                  <img src={r.avatar} className="h-14 w-14 rounded-xl object-cover" alt={r.name} />
                  <div className="flex-1">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{i === 0 ? "Hôm nay · 20:00" : "Mai · 15:30"} · 30 phút</div>
                  </div>
                  <Link to="/chat" className="rounded-full bg-gradient-aurora px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">Vào buổi</Link>
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          <section className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h2 className="font-display text-xl">Lịch sử buổi đọc</h2>
            <div className="mt-4 space-y-2">
              {READERS.slice(2, 5).map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-background/30">
                  <img src={r.avatar} className="h-10 w-10 rounded-lg object-cover" alt="" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{["3 ngày", "1 tuần", "2 tuần"][i]} trước · 30 phút</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3 w-3 fill-gold text-gold" /> 5.0
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-gradient-cosmic p-6">
            <Sparkles className="h-5 w-5 text-gold" />
            <h3 className="mt-2 font-display text-lg">AI Tarot hôm nay</h3>
            <p className="mt-1 text-xs text-muted-foreground">Lá bài năng lượng của bạn đang chờ.</p>
            <Link to="/ai-tarot" className="mt-3 inline-flex rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-gold-foreground">Mở ngay</Link>
          </section>

          <section className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="font-display text-lg">Reader yêu thích</h3>
            <div className="mt-3 space-y-3">
              {favorites.map((r) => (
                <Link key={r.id} to="/reader/$readerId" params={{ readerId: r.id }} className="flex items-center gap-3 rounded-xl p-2 hover:bg-background/30">
                  <div className="relative">
                    <img src={r.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                    {r.online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.online ? "online" : `phản hồi ${r.responseTime}`}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
