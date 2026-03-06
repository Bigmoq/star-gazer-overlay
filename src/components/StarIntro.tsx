import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, CalendarDays } from "lucide-react";

interface StarIntroProps {
  name: string;
  message: string;
  date: string;
  onComplete: () => void;
}

const StarIntro = ({ name, message, date, onComplete }: StarIntroProps) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 7000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ background: "hsl(var(--background))" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      {/* Subtle star particles in background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: "hsl(var(--foreground) / 0.4)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center px-6 max-w-md">
        {/* Glowing star */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="relative mb-8"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(0 0% 100%), hsl(var(--star-glow)))",
              boxShadow: `
                0 0 8px 2px hsl(var(--star-glow) / 0.9),
                0 0 24px 8px hsl(var(--star-glow) / 0.5),
                0 0 60px 20px hsl(var(--star-glow) / 0.3),
                0 0 120px 40px hsl(var(--star-glow) / 0.15)
              `,
            }}
          />
        </motion.div>

        {/* Star name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-5xl md:text-6xl font-display font-bold text-foreground star-glow mb-4"
          dir="rtl"
        >
          {name}
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="w-24 h-px mb-6"
          style={{ background: "linear-gradient(to right, transparent, hsl(var(--star-glow) / 0.5), transparent)" }}
        />

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.3 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-star-glow fill-star-glow" />
            </div>
            <p className="text-lg font-body text-foreground/80 leading-relaxed" dir="rtl">
              {message}
            </p>
          </motion.div>
        )}

        {/* Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span className="text-sm font-body">{date}</span>
        </motion.div>

        {/* Skip hint */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 4 }}
          whileHover={{ opacity: 1 }}
          onClick={onComplete}
          className="mt-10 text-xs font-body text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          اضغط لعرض النجم في السماء ←
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StarIntro;
