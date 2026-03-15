import { motion } from "framer-motion";
import { Telescope, Ruler, Sparkles, CircleDot, MapPin, Compass, Sun, BookOpen } from "lucide-react";
import { getStarStory } from "@/lib/starStories";

interface StarData {
  customName: string;
  originalName: string;
  magnitude: number;
  distance: string;
  spectralClass: string;
  constellation: string;
  ra?: string;
  dec?: string;
}

const StarInfoPanel = ({ star }: { star: StarData }) => {
  const story = getStarStory(star.originalName || star.customName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      className="absolute z-10 glass-panel rounded-2xl overflow-hidden pointer-events-auto
        bottom-4 left-4 right-4 w-auto
        sm:bottom-6 sm:left-6 sm:right-auto sm:w-72
        md:bottom-8 md:w-80
        lg:w-80"
    >
      {/* Header with star name */}
      <div className="p-4 pb-3 sm:p-5 sm:pb-4">
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
        <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-tight" dir="rtl">
          {star.customName}
        </h1>
      </div>

      {/* Divider */}
      <div className="mx-4 sm:mx-5 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

      {/* Data rows */}
      <div className="p-4 pt-3 sm:p-5 sm:pt-4 space-y-2 sm:space-y-2.5">
        <DataRow icon={<Telescope className="w-3.5 h-3.5" />} label="الاسم الفلكي" value={star.originalName} />
        <DataRow icon={<Sparkles className="w-3.5 h-3.5" />} label="السطوع" value={star.magnitude.toFixed(2)} />
        <DataRow icon={<Ruler className="w-3.5 h-3.5" />} label="المسافة" value={star.distance} />
        <DataRow icon={<CircleDot className="w-3.5 h-3.5" />} label="الفئة الطيفية" value={star.spectralClass} />
        <DataRow icon={<MapPin className="w-3.5 h-3.5" />} label="الكوكبة" value={star.constellation} />
        {star.ra && <DataRow icon={<Compass className="w-3.5 h-3.5" />} label="المطلع المستقيم" value={star.ra} isLtr />}
        {star.dec && <DataRow icon={<Sun className="w-3.5 h-3.5" />} label="الميل" value={star.dec} isLtr />}
      </div>

      {/* Divider */}
      <div className="mx-4 sm:mx-5 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

      {/* Star Story */}
      <div className="p-4 pt-3 sm:p-5 sm:pt-4">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="text-[10px] font-body uppercase tracking-[0.2em]">حكاية النجم</span>
        </div>
        <p className="text-[11px] sm:text-xs font-body text-foreground/80 leading-relaxed" dir="rtl">
          {story}
        </p>
      </div>
    </motion.div>
  );
};

const DataRow = ({
  icon,
  label,
  value,
  isLtr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLtr?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-[11px] sm:text-xs font-body">{label}</span>
    </div>
    <span className="text-[11px] sm:text-xs font-body font-medium text-foreground" dir={isLtr ? "ltr" : "rtl"}>{value}</span>
  </div>
);

export default StarInfoPanel;
