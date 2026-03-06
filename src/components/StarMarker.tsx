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
      className="absolute z-10 pointer-events-none select-none"
      style={{
        left: "calc(50% - 140px)",
        top: "calc(50% - 55px)",
        transform: "translate(-50%, 0)",
      }}
    >
      <span
        className="text-[15px] font-display font-semibold text-foreground whitespace-nowrap tracking-wide"
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
