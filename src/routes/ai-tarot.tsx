import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, RotateCw, ArrowRight } from "lucide-react";
import { TAROT_CARDS, READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/ai-tarot")({
  head: () => ({
    meta: [
      { title: "AI Tarot — Trải bài miễn phí | Mystica" },
      { name: "description", content: "Đặt câu hỏi và nhận một buổi trải bài tarot từ AI ngay lập tức. Miễn phí." },
    ],
  }),
  component: AITarot,
});

function AITarot() {
  const [step, setStep] = useState<"ask" | "draw" | "result">("ask");
  const [q, setQ] = useState("");
  const [drawn, setDrawn] = useState<typeof TAROT_CARDS>([]);

  const draw = () => {
    setStep("draw");
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5).slice(0, 3);
      setDrawn(shuffled);
      setStep("result");
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
          <Sparkles className="h-3 w-3" /> Miễn phí · Powered by AI
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
          Hỏi vũ trụ <span className="gradient-text-gold">bất kỳ điều gì</span>
        </h1>
        <p className="mt-3 text-muted-foreground">AI sẽ trải 3 lá bài cho bạn — Quá khứ · Hiện tại · Tương lai.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === "ask" && (
          <motion.div key="ask" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-10 rounded-3xl border border-border bg-card/50 p-8 backdrop-blur-xl">
            <label className="font-display text-lg">Câu hỏi của bạn là gì?</label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              rows={4}
              placeholder="VD: Mối quan hệ này có nên tiếp tục không?"
              className="mt-3 w-full rounded-2xl border border-border bg-background/40 p-4 text-sm outline-none focus:border-primary"
            />
            <button onClick={draw} disabled={!q.trim()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-aurora py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50 md:w-auto md:px-8">
              <Moon className="h-4 w-4" /> Trải bài ngay
            </button>
          </motion.div>
        )}

        {step === "draw" && (
          <motion.div key="draw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10 grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ rotateY: [0, 360], y: [0, -10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
                className="aspect-[2/3] rounded-2xl border border-gold/30 bg-gradient-mystic shadow-glow"
              >
                <div className="grid h-full place-items-center text-4xl">🌙</div>
              </motion.div>
            ))}
            <p className="col-span-3 mt-4 text-center text-sm text-muted-foreground">Đang lắng nghe vũ trụ...</p>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {drawn.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2, duration: 0.7 }}
                  className="rounded-2xl border border-gold/30 bg-gradient-mystic p-5 shadow-card"
                >
                  <div className="text-xs uppercase tracking-widest text-gold">{["Quá khứ", "Hiện tại", "Tương lai"][i]}</div>
                  <div className="my-3 text-center text-6xl">{c.emoji}</div>
                  <div className="text-center font-display text-lg font-semibold">{c.name}</div>
                  <p className="mt-2 text-center text-xs text-foreground/80">{c.meaning}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl">
              <h3 className="font-display text-xl">Lời giải của vũ trụ</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Câu hỏi của bạn về <em className="text-foreground">"{q}"</em> đang được phản chiếu qua ba lá bài.
                Quá khứ cho thấy bạn đã trải qua một giai đoạn cần can đảm. Hiện tại đang mời gọi bạn lắng nghe trực giác của mình.
                Và tương lai — vũ trụ đang mở ra một cánh cửa mà bạn chỉ cần đủ rõ ràng để bước qua.
              </p>
            </div>

            <div className="rounded-3xl border border-gold/30 bg-gradient-cosmic p-6">
              <h3 className="font-display text-xl">Muốn đi sâu hơn với reader thật?</h3>
              <p className="mt-2 text-sm text-muted-foreground">AI chỉ là khởi đầu. Một reader giàu kinh nghiệm sẽ giúp bạn khám phá chiều sâu mà AI không thể chạm tới.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {READERS.slice(0, 2).map((r) => (
                  <Link key={r.id} to="/reader/$readerId" params={{ readerId: r.id }} className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 hover:bg-background/60">
                    <img src={r.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                    <div className="flex-1 text-sm">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.specialties.join(" · ")}</div>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <button onClick={() => { setStep("ask"); setQ(""); }} className="mx-auto flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium">
              <RotateCw className="h-4 w-4" /> Hỏi câu khác
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
