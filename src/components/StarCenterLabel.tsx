import { motion } from "framer-motion";

const StarCenterLabel = ({ name }: { name: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none select-none flex flex-col items-center gap-3"
    >
      {/* Realistic glowing star point */}
      <div className="relative">
        {/* Outer glow */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--star-glow) / 0.4) 0%, hsl(var(--star-glow) / 0.1) 40%, transparent 70%)",
          }}
        />
        {/* Mid glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute inset-0 w-10 h-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--star-glow) / 0.7) 0%, hsl(var(--star-glow) / 0.2) 50%, transparent 80%)",
          }}
        />
        {/* Core bright point */}
        <div
          className="w-3 h-3 rounded-full relative z-10"
          style={{
            background: "radial-gradient(circle, hsl(0 0% 100%) 0%, hsl(var(--star-glow)) 60%, transparent 100%)",
            boxShadow: `
              0 0 4px 1px hsl(var(--star-glow) / 0.9),
              0 0 12px 4px hsl(var(--star-glow) / 0.5),
              0 0 30px 8px hsl(var(--star-glow) / 0.3)
            `,
          }}
        />
        {/* Cross-shaped diffraction spikes */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 opacity-40"
          style={{
            background: "linear-gradient(to bottom, transparent, hsl(var(--star-glow) / 0.8) 40%, hsl(var(--star-glow)) 50%, hsl(var(--star-glow) / 0.8) 60%, transparent)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-px opacity-40"
          style={{
            background: "linear-gradient(to right, transparent, hsl(var(--star-glow) / 0.8) 40%, hsl(var(--star-glow)) 50%, hsl(var(--star-glow) / 0.8) 60%, transparent)",
          }}
        />
      </div>

      {/* Star name below */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="text-lg font-display font-semibold text-foreground star-glow whitespace-nowrap mt-2"
      >
        {name}
      </motion.span>
    </motion.div>
  );
};

export default StarCenterLabel;
