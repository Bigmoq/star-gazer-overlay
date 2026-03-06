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
      transition={{ duration: 0.6 }}
      className="absolute z-10 pointer-events-none select-none"
      style={{
        left: "calc(50% - 140px)",
        top: "calc(50% - 25px)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Star name label - styled like Stellarium's native label */}
        <div className="mb-2">
          <span
            className="text-[15px] font-display font-semibold text-foreground whitespace-nowrap tracking-wide"
            style={{
              textShadow:
                "0 0 6px hsl(var(--background)), 0 0 12px hsl(var(--background)), 0 1px 3px hsl(var(--background))",
            }}
          >
            {name}
          </span>
        </div>

        {/* Crosshair / selection indicator - mimics Stellarium style */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Center dot */}
          <div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: "hsl(var(--foreground) / 0.8)",
              boxShadow: "0 0 3px hsl(var(--foreground) / 0.4)",
            }}
          />
          {/* Dashes - top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px"
            style={{ height: 10, background: "hsl(var(--foreground) / 0.6)" }}
          />
          {/* Dashes - bottom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px"
            style={{ height: 10, background: "hsl(var(--foreground) / 0.6)" }}
          />
          {/* Dashes - left */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px"
            style={{ width: 10, background: "hsl(var(--foreground) / 0.6)" }}
          />
          {/* Dashes - right */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 h-px"
            style={{ width: 10, background: "hsl(var(--foreground) / 0.6)" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default StarMarker;
