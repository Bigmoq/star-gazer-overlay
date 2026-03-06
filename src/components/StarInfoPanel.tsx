import { motion } from "framer-motion";
import { Telescope, Ruler, Sparkles, CircleDot, MapPin } from "lucide-react";

interface StarData {
  customName: string;
  originalName: string;
  magnitude: number;
  distance: string;
  spectralClass: string;
  constellation: string;
}

const StarInfoPanel = ({ star }: { star: StarData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      className="absolute bottom-8 left-6 z-10 w-80 glass-panel rounded-2xl overflow-hidden pointer-events-auto"
    >
      {/* Header with star name */}
      <div className="p-5 pb-4">
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
        <h1 className="text-2xl font-display font-bold text-foreground leading-tight" dir="rtl">
          {star.customName}
        </h1>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

      {/* Data rows */}
      <div className="p-5 pt-4 space-y-2.5">
        <DataRow icon={<Telescope className="w-3.5 h-3.5" />} label="الاسم الفلكي" value={star.originalName} />
        <DataRow icon={<Sparkles className="w-3.5 h-3.5" />} label="السطوع" value={star.magnitude.toFixed(2)} />
        <DataRow icon={<Ruler className="w-3.5 h-3.5" />} label="المسافة" value={star.distance} />
        <DataRow icon={<CircleDot className="w-3.5 h-3.5" />} label="الفئة الطيفية" value={star.spectralClass} />
        <DataRow icon={<MapPin className="w-3.5 h-3.5" />} label="الكوكبة" value={star.constellation} />
      </div>
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
      <span className="text-xs font-body">{label}</span>
    </div>
    <span className="text-xs font-body font-medium text-foreground" dir="ltr">{value}</span>
  </div>
);

export default StarInfoPanel;
