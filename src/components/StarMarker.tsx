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
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 5, times: [0, 0.1, 0.7, 1] }}
      className="absolute z-10 pointer-events-none select-none"
      style={{
        left: "calc(50% - 140px)",
        top: "calc(50% - 25px)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative flex flex-col items-center">
        <div className="mb-3">
          <span
            className="text-lg font-display font-semibold text-foreground whitespace-nowrap px-2"
            style={{
              textShadow: "0 0 10px hsl(var(--background)), 0 0 20px hsl(var(--background))",
            }}
          >
            {name}
          </span>
        </div>

        <div className="relative w-16 h-16 flex items-center justify-center">
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "hsl(var(--foreground) / 0.9)",
              boxShadow: "0 0 4px hsl(var(--foreground) / 0.5)",
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px" style={{ height: 14, background: "hsl(var(--foreground) / 0.7)" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px" style={{ height: 14, background: "hsl(var(--foreground) / 0.7)" }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px" style={{ width: 14, background: "hsl(var(--foreground) / 0.7)" }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px" style={{ width: 14, background: "hsl(var(--foreground) / 0.7)" }} />
        </div>
      </div>
    </motion.div>
  );
};

export default StarMarker;
