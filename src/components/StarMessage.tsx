import { motion } from "framer-motion";
import { Heart, CalendarDays } from "lucide-react";

const StarMessage = ({ message, date }: { message: string; date: string }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
      className="absolute bottom-8 right-6 z-10 w-72 glass-panel rounded-2xl overflow-hidden pointer-events-auto"
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-3.5 h-3.5 text-star-glow fill-star-glow" />
          <span className="text-[10px] font-body uppercase tracking-[0.2em] text-muted-foreground">
            رسالة خاصة
          </span>
        </div>
        <p className="text-sm font-body text-foreground/90 leading-relaxed mb-3" dir="rtl">
          {message}
        </p>
        <div className="h-px bg-gradient-to-r from-glass-border/30 to-transparent mb-3" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          <span className="text-[11px] font-body">{date}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StarMessage;
