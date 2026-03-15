import { motion } from "framer-motion";
import { X, Sparkles, Compass, Sun, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStarStory } from "@/lib/starStories";
import type { ClickedStarInfo } from "@/hooks/useStellariumEngine";

interface Props {
  star: ClickedStarInfo;
  onDismiss: () => void;
}

const DataRow = ({ icon, label, value, isLtr }: { icon: React.ReactNode; label: string; value: string; isLtr?: boolean }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b last:border-0" style={{ borderColor: "hsl(var(--foreground) / 0.05)" }}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs font-body">{label}</span>
    </div>
    <span className="text-xs font-body font-medium text-foreground" dir={isLtr ? "ltr" : "rtl"}>
      {value}
    </span>
  </div>
);

const ClickedStarPanel = ({ star, onDismiss }: Props) => {
  const story = getStarStory(star.identifier || star.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute bottom-4 left-4 z-30 w-[min(85vw,320px)]"
      dir="rtl"
    >
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "hsl(var(--background) / 0.55)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          border: "1px solid hsl(var(--foreground) / 0.08)",
          boxShadow: "0 8px 32px hsl(var(--background) / 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: "hsl(var(--star-glow))",
                boxShadow: "0 0 8px hsl(var(--star-glow) / 0.8)",
              }}
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">
              نجم محدد
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground w-7 h-7"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Star Name */}
        <h3 className="text-lg font-display font-bold text-foreground star-glow leading-relaxed" dir="ltr">
          {star.name}
        </h3>

        {/* Divider */}
        <div className="h-px" style={{ background: "linear-gradient(to left, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1), transparent)" }} />

        {/* Data */}
        <div className="space-y-0">
          <DataRow icon={<Sparkles className="w-3.5 h-3.5" />} label="القدر الظاهري" value={star.magnitude} />
          <DataRow icon={<Compass className="w-3.5 h-3.5" />} label="المطلع المستقيم" value={star.ra} isLtr />
          <DataRow icon={<Sun className="w-3.5 h-3.5" />} label="الميل" value={star.dec} isLtr />
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "linear-gradient(to left, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1), transparent)" }} />

        {/* Star Story */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-body uppercase tracking-[0.2em]">حكاية النجم</span>
          </div>
          <p className="text-[11px] font-body text-foreground/80 leading-relaxed" dir="rtl">
            {story}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ClickedStarPanel;
