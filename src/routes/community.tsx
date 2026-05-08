import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Sparkles, Radio, Plus } from "lucide-react";
import { READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — Mystica" }] }),
  component: Community,
});

const POSTS = [
  { author: "Ẩn danh", time: "2 phút", text: "Hôm nay tôi rút được lá The Star. Lần đầu tiên sau nhiều tháng, tôi thấy le lói hy vọng...", likes: 124, comments: 18, mood: "✨" },
  { author: "Mai Linh", time: "1 giờ", text: "Buổi đọc với chị Luna đã thay đổi cách tôi nhìn mối quan hệ này. Cảm ơn vũ trụ đã dẫn tôi đến đây.", likes: 89, comments: 12, mood: "💞" },
  { author: "Ẩn danh", time: "3 giờ", text: "Có ai từng cảm thấy lạc lối nhưng không biết hỏi gì với reader không? Tôi muốn nghe trải nghiệm của các bạn.", likes: 56, comments: 34, mood: "🌙" },
];

function Community() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Cộng đồng</p>
          <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Trái tim bên cạnh trái tim</h1>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full bg-gradient-aurora shadow-glow"><Plus className="h-5 w-5 text-primary-foreground" /></button>
      </div>

      {/* Live */}
      <section className="mt-6 rounded-3xl border border-border bg-gradient-cosmic p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-destructive/20 px-2 py-0.5 text-destructive"><Radio className="h-3 w-3" /> LIVE</span>
          <span className="text-muted-foreground">3 reader đang livestream</span>
        </div>
        <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide">
          {READERS.slice(0, 4).map((r) => (
            <div key={r.id} className="shrink-0 text-center">
              <div className="relative">
                <img src={r.avatar} className="h-16 w-16 rounded-full border-2 border-gold object-cover" alt="" />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">LIVE</span>
              </div>
              <div className="mt-2 max-w-[68px] truncate text-xs">{r.name.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="mt-6 space-y-4">
        {POSTS.map((p, i) => (
          <motion.article key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-3xl border border-border bg-card/50 p-5 backdrop-blur-xl">
            <header className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-mystic text-lg">{p.mood}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.author}</div>
                <div className="text-xs text-muted-foreground">{p.time} trước</div>
              </div>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </header>
            <p className="mt-3 leading-relaxed text-foreground/90">{p.text}</p>
            <footer className="mt-4 flex items-center gap-5 border-t border-border pt-3 text-xs text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-foreground"><Heart className="h-4 w-4" /> {p.likes}</button>
              <button className="flex items-center gap-1.5 hover:text-foreground"><MessageCircle className="h-4 w-4" /> {p.comments}</button>
              <button className="flex items-center gap-1.5 hover:text-foreground"><Share2 className="h-4 w-4" /></button>
            </footer>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
