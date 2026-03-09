import { motion } from "framer-motion";

interface StarMarkerProps {
  name: string;
  visible: boolean;
}

const StarMarker = ({ name, visible }: StarMarkerProps) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute z-10 pointer-events-none select-none flex flex-col items-center"
      style={{
        left: "calc(50% - 140px)",
        top: "calc(50% - 70px)",
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* Crosshair lines */}
      <div className="relative w-[28px] h-[28px] mb-1">
        {/* Horizontal line */}
        <div
          className="absolute top-1/2 left-0 w-full h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.7), transparent)",
          }}
        />
        {/* Vertical line */}
        <div
          className="absolute left-1/2 top-0 h-full w-[1px]"
          style={{
            background: "linear-gradient(180deg, transparent, hsl(var(--foreground) / 0.7), transparent)",
          }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 w-[5px] h-[5px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "hsl(var(--foreground))",
            boxShadow: "0 0 6px 2px hsl(var(--foreground) / 0.5)",
          }}
        />
      </div>
      {/* Star name label */}
      <span
        className="text-[14px] font-display font-semibold text-foreground whitespace-nowrap tracking-wide"
        style={{
          textShadow:
            "0 0 8px hsl(220 20% 4%), 0 0 16px hsl(220 20% 4%), 0 0 32px hsl(220 20% 4%), 0 0 48px hsl(220 20% 4%)",
        }}
      >
        {name}
      </span>
    </motion.div>
  );
};

export default StarMarker;
