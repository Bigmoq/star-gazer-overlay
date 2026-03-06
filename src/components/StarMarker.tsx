import { motion } from "framer-motion";

interface StarMarkerProps {
  name: string;
}

const StarMarker = ({ name }: StarMarkerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="absolute z-10 pointer-events-none select-none"
      style={{
        /* Position at Stellarium's center point accounting for iframe offset */
        left: "calc(50% - 140px)",
        top: "calc(50% - 25px)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* Star name label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mb-3"
        >
          <span
            className="text-lg font-display font-semibold text-foreground whitespace-nowrap px-2"
            style={{
              textShadow: "0 0 10px hsl(var(--background)), 0 0 20px hsl(var(--background))",
            }}
          >
            {name}
          </span>
        </motion.div>

        {/* Crosshair / target indicator */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Center dot */}
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "hsl(var(--foreground) / 0.9)",
              boxShadow: "0 0 4px hsl(var(--foreground) / 0.5)",
            }}
          />

          {/* Top dash */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-px"
            style={{
              height: 14,
              background: "hsl(var(--foreground) / 0.7)",
            }}
          />
          {/* Bottom dash */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px"
            style={{
              height: 14,
              background: "hsl(var(--foreground) / 0.7)",
            }}
          />
          {/* Left dash */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px"
            style={{
              width: 14,
              background: "hsl(var(--foreground) / 0.7)",
            }}
          />
          {/* Right dash */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 h-px"
            style={{
              width: 14,
              background: "hsl(var(--foreground) / 0.7)",
            }}
          />

          {/* Corner gaps create the dashed cross look */}
        </div>
      </div>
    </motion.div>
  );
};

export default StarMarker;
