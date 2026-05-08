import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Phone, Video, MoreVertical, BadgeCheck, Smile } from "lucide-react";
import { READERS } from "@/lib/mock-data";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Mystica" }] }),
  component: Chat,
});

type Msg = { id: number; from: "me" | "them"; text: string; time: string };

const INITIAL: Msg[] = [
  { id: 1, from: "them", text: "Chào bạn ✨ Tôi là Luna. Hôm nay năng lượng của bạn thế nào?", time: "20:00" },
  { id: 2, from: "me", text: "Em đang phân vân về một mối quan hệ. Cảm giác mơ hồ lắm chị ạ.", time: "20:01" },
  { id: 3, from: "them", text: "Tôi hiểu. Trước khi rút bài, hãy hít thở thật sâu cùng tôi nhé. Bạn có thể chia sẻ thêm về điều khiến bạn mơ hồ?", time: "20:01" },
];

function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>(INITIAL);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const reader = READERS[0];
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMsgs((m) => [...m, { id: Date.now(), from: "me", text, time: now }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: Date.now() + 1, from: "them", text: "Tôi đang lắng nghe bạn. Hãy cho tôi rút lá bài đầu tiên...", time: now }]);
    }, 1800);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col px-0 md:px-4 md:py-6">
      {/* Header */}
      <div className="glass-strong flex items-center gap-3 border-b border-border p-4 md:rounded-t-3xl md:border">
        <img src={reader.avatar} className="h-11 w-11 rounded-full object-cover" alt="" />
        <div className="flex-1">
          <div className="flex items-center gap-1 font-semibold">
            {reader.name} {reader.verified && <BadgeCheck className="h-4 w-4 text-accent" />}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> đang online
          </div>
        </div>
        {[Phone, Video, MoreVertical].map((Icon, i) => (
          <button key={i} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scroll} className="flex-1 overflow-y-auto bg-card/20 p-4 md:border-x md:border-border">
        <div className="mx-auto max-w-2xl space-y-3">
          <div className="text-center text-[11px] uppercase tracking-widest text-muted-foreground">Hôm nay</div>
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
                m.from === "me"
                  ? "rounded-br-md bg-gradient-aurora text-primary-foreground"
                  : "rounded-bl-md border border-border bg-card text-foreground"
              }`}>
                {m.text}
                <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {m.time}{m.from === "me" && " · đã đọc"}
                </div>
              </div>
            </motion.div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 0.15, 0.3].map((d) => (
                    <motion.span key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="glass-strong flex items-center gap-2 border-t border-border p-3 md:rounded-b-3xl md:border">
        <button className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Viết một điều gì đó..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Smile className="h-4 w-4 text-muted-foreground" />
        </div>
        {text.trim() ? (
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-full bg-gradient-aurora shadow-glow">
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
        ) : (
          <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-aurora shadow-glow">
            <Mic className="h-4 w-4 text-primary-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
