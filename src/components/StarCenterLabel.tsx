import { motion } from "framer-motion";

const StarCenterLabel = ({ name }: { name: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 1] }}
      transition={{ duration: 6, times: [0, 0.15, 0.7, 1], ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none flex flex-col items-center gap-2"
    >
      {/* Pulsing ring indicator */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: 2, ease: "easeOut" }}
        className="w-8 h-8 rounded-full border-2"
        style={{
          borderColor: "hsl(var(--star-glow) / 0.7)",
        }}
      />

      {/* Star name */}
      <span
        className="text-base font-display font-semibold text-foreground star-glow whitespace-nowrap px-3 py-1 rounded-full"
        style={{
          background: "hsl(var(--background) / 0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        ⭐ {name}
      </span>
    </motion.div>
  );
};

export default StarCenterLabel;
