import { motion } from "framer-motion";
import { Heart, CalendarDays } from "lucide-react";

const StarMessage = ({ message, date }: { message: string; date: string }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
      className="absolute bottom-8 right-6 z-10 w-72 glass-panel rounded-2xl p-5 pointer-events-auto"
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-star-glow fill-star-glow" />
        <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">
          رسالة خاصة
        </span>
      </div>
      <p className="text-sm font-body text-foreground leading-relaxed mb-3" dir="rtl">
        {message}
      </p>
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5" />
        <span className="text-xs font-body">{date}</span>
      </div>
    </motion.div>
  );
};

export default StarMessage;
