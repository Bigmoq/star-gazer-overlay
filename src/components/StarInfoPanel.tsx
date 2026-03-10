import { motion } from "framer-motion";
import { Telescope, Ruler, Sparkles, CircleDot, MapPin, Heart, CalendarDays } from "lucide-react";

interface StarData {
  customName: string;
  originalName: string;
  magnitude: number;
  distance: string;
  spectralClass: string;
  constellation: string;
}

const StarInfoPanel = ({ star, message, date }: { star: StarData; message?: string; date?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      className="absolute z-10 glass-panel rounded-2xl overflow-hidden pointer-events-auto
        bottom-3 left-3 right-3 w-auto max-h-[70vh] overflow-y-auto
        sm:bottom-6 sm:left-6 sm:right-auto sm:w-72 sm:max-h-none sm:overflow-visible
        md:bottom-8 md:w-80
        lg:w-80"
    >
      {/* Header with star name */}
      <div className="p-3.5 pb-2.5 sm:p-5 sm:pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "hsl(var(--star-glow))",
              boxShadow: "0 0 6px hsl(var(--star-glow) / 0.8)",
            }}
          />
          <span className="text-[10px] font-body uppercase tracking-[0.2em] text-muted-foreground">
            نجم مسمى
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl font-display font-bold text-foreground leading-tight" dir="rtl">
          {star.customName}
        </h1>
      </div>

      {/* Divider */}
      <div className="mx-3.5 sm:mx-5 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

      {/* Data rows */}
      <div className="p-3.5 pt-2.5 sm:p-5 sm:pt-4 space-y-1.5 sm:space-y-2.5">
        <DataRow icon={<Telescope className="w-3.5 h-3.5" />} label="الاسم الفلكي" value={star.originalName} />
        <DataRow icon={<Sparkles className="w-3.5 h-3.5" />} label="السطوع" value={star.magnitude.toFixed(2)} />
        <DataRow icon={<Ruler className="w-3.5 h-3.5" />} label="المسافة" value={star.distance} />
        <DataRow icon={<CircleDot className="w-3.5 h-3.5" />} label="الفئة الطيفية" value={star.spectralClass} />
        <DataRow icon={<MapPin className="w-3.5 h-3.5" />} label="الكوكبة" value={star.constellation} />
      </div>

      {/* Mobile-only: Message section inline */}
      {message && (
        <div className="sm:hidden">
          <div className="mx-3.5 h-px bg-gradient-to-r from-glass-border/30 to-transparent" />
          <div className="p-3.5 pt-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3 h-3 text-star-glow fill-star-glow" />
              <span className="text-[10px] font-body uppercase tracking-[0.2em] text-muted-foreground">
                رسالة خاصة
              </span>
            </div>
            <p className="text-xs font-body text-foreground/90 leading-relaxed mb-2" dir="rtl">
              {message}
            </p>
            {date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                <span className="text-[11px] font-body">{date}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DataRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-[11px] sm:text-xs font-body">{label}</span>
    </div>
    <span className="text-[11px] sm:text-xs font-body font-medium text-foreground" dir="ltr">{value}</span>
  </div>
);

export default StarInfoPanel;
