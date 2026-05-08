import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { READERS } from "@/lib/mock-data";
import { ReaderCard } from "@/components/reader-card";

export const Route = createFileRoute("/readers")({
  head: () => ({
    meta: [
      { title: "Reader xác minh — Mystica" },
      { name: "description", content: "Khám phá hơn 850 reader tarot được xác minh, lọc theo chuyên môn, ngôn ngữ và đánh giá." },
    ],
  }),
  component: ReadersPage,
});

const FILTERS = ["Tất cả", "Tình yêu", "Sự nghiệp", "Tâm linh", "Chữa lành", "Định hướng", "Twin Flame"];

function ReadersPage() {
  const [active, setActive] = useState("Tất cả");
  const [q, setQ] = useState("");

  const filtered = READERS.filter((r) => {
    const matchFilter = active === "Tất cả" || r.specialties.includes(active);
    const matchQ = !q || r.name.toLowerCase().includes(q.toLowerCase());
    return matchFilter && matchQ;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Khám phá</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-6xl">
          Tìm reader <span className="gradient-text">dành riêng cho bạn</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{READERS.length}+ reader xác minh đang sẵn sàng lắng nghe — hãy chọn người khiến bạn cảm thấy an toàn nhất.</p>
      </motion.div>

      <div className="sticky top-16 z-30 mt-8 rounded-3xl border border-border bg-card/60 p-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên hoặc chuyên môn..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background/40 px-4 py-2.5 text-sm">
            <SlidersHorizontal className="h-4 w-4" /> Bộ lọc
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                active === f
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((r, i) => <ReaderCard key={r.id} reader={r} index={i} />)}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-border bg-card/40 p-12 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-xl">Không tìm thấy reader phù hợp</p>
          <p className="mt-1 text-sm text-muted-foreground">Hãy thử bộ lọc khác — vũ trụ luôn có người đang chờ bạn.</p>
        </div>
      )}
    </div>
  );
}
