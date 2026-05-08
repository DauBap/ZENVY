import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, Clock, Sparkles, BadgeCheck } from "lucide-react";
import type { Reader } from "@/lib/mock-data";

export function ReaderCard({ reader, index = 0 }: { reader: Reader; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-card transition-shadow hover:shadow-glow"
    >
      <div className="relative h-32 overflow-hidden">
        <img src={reader.cover} alt="" className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
      </div>

      <div className="relative -mt-12 px-5 pb-5">
        <div className="flex items-end justify-between">
          <div className="relative">
            <img src={reader.avatar} alt={reader.name} className="h-20 w-20 rounded-2xl border-2 border-card object-cover shadow-card" />
            {reader.online && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-success">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-success opacity-80" />
              </span>
            )}
          </div>
          <div className="mb-1 flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1">
            <Star className="h-3 w-3 fill-gold text-gold" />
            <span className="text-xs font-semibold text-gold">{reader.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reader.reviews})</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <h3 className="font-display text-lg font-semibold">{reader.name}</h3>
          {reader.verified && <BadgeCheck className="h-4 w-4 text-accent" />}
        </div>
        <p className="line-clamp-2 mt-1 text-sm italic text-muted-foreground">"{reader.tagline}"</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {reader.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {reader.sessions}+ buổi</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reader.responseTime}</span>
        </div>

        <Link
          to="/reader/$readerId"
          params={{ readerId: reader.id }}
          className="mt-4 flex w-full items-center justify-center rounded-2xl bg-gradient-aurora py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Xem hồ sơ · {reader.pricePerMin.toLocaleString("vi-VN")}đ/phút
        </Link>
      </div>
    </motion.div>
  );
}
