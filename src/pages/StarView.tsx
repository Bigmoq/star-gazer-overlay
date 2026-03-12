import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findByCode, type StarRecord } from "@/lib/starStore";
import { extractStarIdFromUrl } from "@/lib/stellariumParser";
import StarInfoPanel from "@/components/StarInfoPanel";
import StarMarker from "@/components/StarMarker";
import StarMessage from "@/components/StarMessage";
import StarIntro from "@/components/StarIntro";
import { useStellariumEngine } from "@/hooks/useStellariumEngine";
import { ArrowRight, LocateFixed, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const StarView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [star, setStar] = useState<StarRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [introDone, setIntroDone] = useState(false); // Show intro first!
  const [showMarker, setShowMarker] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [starId, setStarId] = useState<string | undefined>();

  // Load star data
  useEffect(() => {
    if (!code) { setLoading(false); return; }
    findByCode(decodeURIComponent(code)).then((data) => {
      if (data) {
        setStar(data);
        const id = extractStarIdFromUrl(data.stellariumUrl);
        if (id) setStarId(id);
      }
      setLoading(false);
    });
  }, [code]);

  // Initialize engine — deferred navigation (intro shows first)
  const {
    engineLoaded, engineError, loadingProgress,
    targetFound, starReady, goToStar, cinematicZoomToStar
  } = useStellariumEngine(canvasRef, {
    targetStarId: starId,
    targetFov: 0.5,
    initialFov: 120,
    atmosphere: false,
    landscape: false,
    constellations: true,
    deferNavigation: true,
  });

  // When intro completes → trigger cinematic zoom
  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
    // Start cinematic zoom after a brief moment
    setTimeout(() => {
      cinematicZoomToStar(0.5, 4000); // 4 second smooth zoom
    }, 300);
    // Show marker and UI after zoom mostly completes
    setTimeout(() => {
      setShowMarker(true);
      setShowUI(true);
    }, 3500);
  }, [cinematicZoomToStar]);

  // Hide marker on interaction
  useEffect(() => {
    const hide = () => setShowMarker(false);
    window.addEventListener("blur", hide);
    return () => window.removeEventListener("blur", hide);
  }, []);

  const recenterStar = () => {
    if (starId) {
      goToStar(starId, 0.5);
      setShowMarker(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!star) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground font-body">لم يتم العثور على النجم</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للبحث
          </Button>
        </div>
      </div>
    );
  }

  const panelData = {
    customName: star.customName,
    originalName: star.originalName,
    magnitude: star.magnitude,
    distance: star.distance,
    spectralClass: star.spectralClass,
    constellation: star.constellation,
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-background">
      {/* ─── Full-Screen Canvas ─── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full outline-none"
        tabIndex={0}
      />

      {/* ─── Loading Screen (before engine loads) ─── */}
      <AnimatePresence>
        {!engineLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <Star className="w-16 h-16 text-primary star-icon-glow" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "radial-gradient(circle, hsl(var(--star-glow) / 0.3) 0%, transparent 70%)" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-display font-bold text-foreground" dir="rtl">
                  جارٍ تحميل نجمك
                </h2>
                <p className="text-sm font-body text-muted-foreground">{star.customName} ✨</p>
              </div>
              <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--secondary))" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--star-glow)))" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {engineError && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive font-body text-center max-w-xs" dir="rtl"
                >
                  {engineError}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cinematic Intro (name + message + date) ─── */}
      <AnimatePresence>
        {engineLoaded && !introDone && (
          <StarIntro
            name={star.customName}
            message={star.message}
            date={star.date}
            onComplete={handleIntroComplete}
            isMapReady={starReady}
          />
        )}
      </AnimatePresence>

      {/* ─── Star View UI (appears after zoom) ─── */}
      <AnimatePresence>
        {introDone && showUI && (
          <>
            {/* Top buttons */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex gap-1.5 sm:gap-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={recenterStar}
                className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
                title="العودة للنجم"
              >
                <LocateFixed className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                <span className="hidden xs:inline">تحديد النجم</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                <span className="hidden xs:inline">رجوع</span>
              </Button>
            </motion.div>

            {/* Hint toast */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 0.7, 0.7, 0] }}
              transition={{ duration: 6, times: [0, 0.1, 0.6, 1] }}
              className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-[90%] sm:w-auto"
            >
              <div
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-body text-foreground/80 text-center"
                style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(8px)" }}
              >
                اسحب لاستكشاف السماء حول نجمك 🔭
              </div>
            </motion.div>

            {/* Star marker */}
            <AnimatePresence>
              {showMarker && <StarMarker name={star.customName} visible={showMarker} />}
            </AnimatePresence>

            {/* Info panel + message */}
            <StarInfoPanel star={panelData} />
            <StarMessage message={star.message} date={star.date} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarView;
