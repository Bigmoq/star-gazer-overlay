import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findByCode, type StarRecord } from "@/lib/starStore";
import StarInfoPanel from "@/components/StarInfoPanel";
import StarIntro from "@/components/StarIntro";
import StarMarker from "@/components/StarMarker";
import IframeMask from "@/components/IframeMask";
import StarMessage from "@/components/StarMessage";
import { ArrowRight, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const StarView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [star, setStar] = useState<StarRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [introDone, setIntroDone] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showMarker, setShowMarker] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!code) { setLoading(false); return; }
    findByCode(decodeURIComponent(code)).then((data) => {
      if (data) {
        const url = data.stellariumUrl.includes('fov=')
          ? data.stellariumUrl
          : data.stellariumUrl + (data.stellariumUrl.includes('?') ? '&' : '?') + 'fov=0.5';
        setStar({ ...data, stellariumUrl: url });
      }
      setLoading(false);
    });
  }, [code]);

  // Marker stays visible permanently - no blur handler

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

  const recenterStar = () => {
    setIframeKey((k) => k + 1);
    setShowMarker(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <iframe
        ref={iframeRef}
        key={iframeKey}
        src={star.stellariumUrl}
        title="Stellarium Web - Star View"
        className="absolute border-none"
        style={{
          top: -50, left: -300, right: -20, bottom: 0,
          width: "calc(100% + 320px)", height: "calc(100% + 50px)",
        }}
        allow="fullscreen"
      />
      <IframeMask />
      <AnimatePresence>
        {!introDone && (
          <StarIntro name={star.customName} message={star.message} date={star.date} onComplete={() => setIntroDone(true)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {introDone && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="absolute top-4 right-4 z-20 flex gap-2">
              <Button variant="ghost" size="sm" onClick={recenterStar} className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60" title="العودة للنجم">
                <LocateFixed className="w-4 h-4 ml-1" /> تحديد النجم
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60">
                <ArrowRight className="w-4 h-4 ml-1" /> رجوع
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: [0, 0.7, 0.7, 0] }} transition={{ duration: 6, times: [0, 0.1, 0.6, 1] }} className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-4 py-2 rounded-full text-sm font-body text-foreground/80" style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(8px)" }}>
                استخدم الأيقونات في الأسفل لتغيير عرض السماء 🔭
              </div>
            </motion.div>
            <AnimatePresence>
              {showMarker && <StarMarker name={star.customName} visible={showMarker} />}
            </AnimatePresence>
            <StarInfoPanel star={panelData} />
            <StarMessage message={star.message} date={star.date} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarView;
