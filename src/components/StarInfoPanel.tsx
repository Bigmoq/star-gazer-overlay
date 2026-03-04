import { motion } from "framer-motion";
import { Star, Telescope, Ruler, Sparkles } from "lucide-react";

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
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
      className="absolute top-6 left-6 z-10 w-80 glass-panel rounded-2xl p-6 pointer-events-auto"
    >
      {/* Star custom name */}
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-star-glow star-icon-glow fill-star-glow" />
        <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">
          Named Star
        </span>
      </div>
      <h1 className="text-3xl font-display font-bold text-foreground mb-4 leading-tight">
        {star.customName}
      </h1>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent mb-4" />

      {/* Scientific data */}
      <div className="space-y-3">
        <DataRow
          icon={<Telescope className="w-4 h-4" />}
          label="Catalog Name"
          value={star.originalName}
        />
        <DataRow
          icon={<Sparkles className="w-4 h-4" />}
          label="Magnitude"
          value={star.magnitude.toFixed(2)}
        />
        <DataRow
          icon={<Ruler className="w-4 h-4" />}
          label="Distance"
          value={star.distance}
        />
        <DataRow
          icon={<Star className="w-4 h-4" />}
          label="Spectral Class"
          value={star.spectralClass}
        />
        <DataRow
          icon={<Telescope className="w-4 h-4" />}
          label="Constellation"
          value={star.constellation}
        />
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-glass-border/30">
        <p className="text-xs text-muted-foreground font-body">
          Drag the star map to explore the sky
        </p>
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
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-sm font-body">{label}</span>
    </div>
    <span className="text-sm font-body font-medium text-foreground">{value}</span>
  </div>
);

export default StarInfoPanel;
