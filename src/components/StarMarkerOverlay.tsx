import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface StarMarkerOverlayProps {
  starMarker: { ra: number; dec: number; name: string };
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  stelRef: React.MutableRefObject<any>;
}

const StarMarkerOverlay = ({ starMarker, canvasRef, stelRef }: StarMarkerOverlayProps) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const stel = stelRef.current;
      const core = stel?.core;
      if (!core || !stel) return;

      try {
        const raRad = (starMarker.ra * Math.PI) / 180;
        const decRad = (starMarker.dec * Math.PI) / 180;
        const targetICRF = stel.s2c([raRad, decRad]);
        const obs = core.observer;

        const screenPos = core.getCanvasPosForPoint?.(targetICRF);
        if (screenPos) {
          const dpr = window.devicePixelRatio || 1;
          setPos({ x: screenPos[0] / dpr, y: screenPos[1] / dpr });
          return;
        }

        // Fallback: convert through frames
        const observed = stel.convertFrame(obs, "ICRF", "OBSERVED", targetICRF);
        const viewPos = stel.convertFrame(obs, "OBSERVED", "VIEW", observed);
        if (viewPos && viewPos[2] > 0) {
          const cx = canvasRef.current!.clientWidth / 2;
          const cy = canvasRef.current!.clientHeight / 2;
          const fovRad = core.fov || Math.PI;
          const scale = Math.min(cx, cy) / Math.tan(fovRad / 2);
          setPos({
            x: cx + (viewPos[0] / viewPos[2]) * scale,
            y: cy - (viewPos[1] / viewPos[2]) * scale,
          });
        } else {
          setPos(null);
        }
      } catch {
        // position calc failed
      }
    }, 100);

    return () => clearInterval(interval);
  }, [starMarker, canvasRef, stelRef]);

  if (!pos) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute pointer-events-none"
      style={{
        left: pos.x - 24,
        top: pos.y - 24,
        zIndex: 25,
      }}
    >
      {/* Pulsing ring */}
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ border: '2px solid hsl(var(--primary))', opacity: 0.4 }}
        />
        <div
          className="absolute inset-1 rounded-full animate-pulse"
          style={{ border: '2px solid hsl(var(--primary))', opacity: 0.7 }}
        />
        <div
          className="absolute inset-[18px] rounded-full"
          style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 12px hsl(var(--primary))' }}
        />
      </div>
      {/* Label */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap glass-panel rounded-lg px-3 py-1.5">
        <span className="text-xs font-body text-primary font-medium">{starMarker.name}</span>
      </div>
    </motion.div>
  );
};

export default StarMarkerOverlay;
