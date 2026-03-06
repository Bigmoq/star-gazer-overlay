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
        /* 
         * Position matches where Stellarium renders the star name label.
         * The star is centered in the iframe, but the iframe is offset 
         * left: -300px, top: -50px, so the star center in viewport is:
         * x = 50% - 140px, y = 50% - 25px
         * Stellarium shows the name label slightly above-right of the crosshair.
         */
        left: "calc(50% - 140px)",
        top: "calc(50% - 60px)",
        transform: "translate(-50%, 0)",
      }}
    >
      {/* Name label with opaque background to cover Stellarium's native label */}
      <div
        className="px-3 py-1 rounded"
        style={{
          background: "hsl(var(--background) / 0.85)",
          boxShadow: "0 0 20px 12px hsl(var(--background) / 0.85)",
        }}
      >
        <span
          className="text-[15px] font-display font-semibold text-foreground whitespace-nowrap tracking-wide"
          style={{
            textShadow: "0 0 8px hsl(var(--background))",
          }}
        >
          {name}
        </span>
      </div>
    </motion.div>
  );
};

export default StarMarker;
