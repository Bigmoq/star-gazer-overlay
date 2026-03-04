import { motion } from "framer-motion";
import { Star } from "lucide-react";

const StarCenterLabel = ({ name }: { name: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut", delay: 1 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none"
    >
      <div className="flex items-center gap-3">
        <Star className="w-5 h-5 text-star-glow star-icon-glow fill-star-glow" />
        <span className="text-xl font-display font-semibold text-foreground star-glow whitespace-nowrap">
          {name}
        </span>
      </div>
    </motion.div>
  );
};

export default StarCenterLabel;
