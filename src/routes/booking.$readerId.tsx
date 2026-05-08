import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, CreditCard, Calendar, Clock, Shield, Sparkles } from "lucide-react";
import { READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/booking/$readerId")({
  loader: ({ params }) => {
    const reader = READERS.find((r) => r.id === params.readerId);
    if (!reader) throw notFound();
    return { reader };
  },
  component: BookingFlow,
});

const PACKAGES = [
  { id: "p1", name: "Khám phá", duration: 15, mult: 1 },
  { id: "p2", name: "Sâu sắc", duration: 30, mult: 0.9, popular: true },
  { id: "p3", name: "Chuyên sâu", duration: 60, mult: 0.85 },
];
const TIMES = ["09:00", "10:30", "13:00", "15:30", "18:00", "20:00", "21:30"];
const STEPS = ["Package", "Thời gian", "Thanh toán", "Xác nhận"];

function BookingFlow() {
  const { reader } = Route.useLoaderData();
  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState(PACKAGES[1].id);
  const [time, setTime] = useState(TIMES[0]);

  const selected = PACKAGES.find((p) => p.id === pkg)!;
  const total = Math.round(reader.pricePerMin * selected.duration * selected.mult);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/reader/$readerId" params={{ readerId: reader.id }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Về profile
      </Link>

      {/* Progress */}
      <div className="mt-6 rounded-3xl border border-border bg-card/50 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${i <= step ? "bg-gradient-aurora text-primary-foreground" : "border border-border bg-background/40 text-muted-foreground"}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-xs md:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Reader summary */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-xl">
        <img src={reader.avatar} alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="font-semibold">{reader.name}</div>
          <div className="text-xs text-muted-foreground">{reader.specialties.join(" · ")}</div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{reader.pricePerMin.toLocaleString("vi-VN")}đ/phút</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="mt-6 rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-xl"
        >
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl">Chọn package phù hợp với bạn</h2>
              <div className="mt-5 space-y-3">
                {PACKAGES.map((p) => {
                  const price = Math.round(reader.pricePerMin * p.duration * p.mult);
                  const active = pkg === p.id;
                  return (
                    <button key={p.id} onClick={() => setPkg(p.id)} className={`relative w-full rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-background/20"}`}>
                      {p.popular && <span className="absolute -top-2 right-3 rounded-full bg-gradient-aurora px-2 py-0.5 text-[10px] font-semibold">Phổ biến</span>}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{p.name} · {p.duration} phút</div>
                          <div className="text-xs text-muted-foreground">Giảm còn {Math.round(p.mult * 100)}% giá gốc</div>
                        </div>
                        <div className="font-display text-lg font-semibold gradient-text-gold">{price.toLocaleString("vi-VN")}đ</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-xl">Chọn thời gian phù hợp</h2>
              <p className="mt-1 text-sm text-muted-foreground">Múi giờ: GMT+7 · Hôm nay, {new Date().toLocaleDateString("vi-VN")}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-4">
                {TIMES.map((t) => (
                  <button key={t} onClick={() => setTime(t)} className={`rounded-2xl border p-3 text-sm font-medium transition-colors ${time === t ? "border-primary bg-primary/15" : "border-border bg-background/20 hover:bg-background/40"}`}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border/50 bg-background/20 p-3 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" /> Bạn sẽ nhận nhắc nhở 15 phút trước buổi đọc.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-xl">Phương thức thanh toán</h2>
              <div className="mt-5 space-y-2">
                {["Thẻ Visa/Mastercard", "MoMo", "ZaloPay", "Apple Pay"].map((m, i) => (
                  <label key={m} className="flex items-center gap-3 rounded-2xl border border-border bg-background/20 p-4">
                    <input type="radio" name="pay" defaultChecked={i === 0} className="accent-primary" />
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{m}</span>
                  </label>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-success/5 p-3 text-xs text-success">
                <Shield className="h-4 w-4" /> Bảo mật thanh toán 256-bit · Hoàn tiền trong 24h.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-aurora shadow-glow">
                <Sparkles className="h-9 w-9 text-primary-foreground" />
              </motion.div>
              <h2 className="mt-5 font-display text-2xl">Đặt lịch thành công!</h2>
              <p className="mt-2 text-sm text-muted-foreground">Chúng tôi đã gửi xác nhận tới email của bạn. Hẹn gặp lại lúc {time} hôm nay.</p>
              <div className="mt-6 rounded-2xl border border-border bg-background/30 p-4 text-left text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Reader</span><span className="font-medium">{reader.name}</span></div>
                <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Package</span><span className="font-medium">{selected.name} · {selected.duration} phút</span></div>
                <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Thời gian</span><span className="font-medium">{time}</span></div>
                <div className="mt-3 flex justify-between border-t border-border pt-3"><span className="text-muted-foreground">Tổng</span><span className="font-display gradient-text-gold">{total.toLocaleString("vi-VN")}đ</span></div>
              </div>
              <Link to="/dashboard" className="mt-6 inline-flex rounded-full bg-gradient-aurora px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">Về dashboard</Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 3 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-2xl border border-border bg-card/50 px-5 py-3 text-sm font-medium disabled:opacity-40">Quay lại</button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Tổng</div>
              <div className="font-display text-lg font-semibold gradient-text-gold">{total.toLocaleString("vi-VN")}đ</div>
            </div>
            <button onClick={() => setStep((s) => s + 1)} className="rounded-2xl bg-gradient-aurora px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
              {step === 2 ? "Thanh toán" : "Tiếp tục"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
