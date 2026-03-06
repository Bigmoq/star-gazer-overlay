import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findByCode } from "@/lib/starStore";
import StarInfoPanel from "@/components/StarInfoPanel";
import StarIntro from "@/components/StarIntro";
import IframeMask from "@/components/IframeMask";
import StarMessage from "@/components/StarMessage";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const StarView = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const star = code ? findByCode(decodeURIComponent(code)) : undefined;
  const [introDone, setIntroDone] = useState(false);

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
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Stellarium iframe loads in background during intro */}
      <iframe
        src={star.stellariumUrl}
        title="Stellarium Web - Star View"
        className="absolute border-none"
        style={{
          top: -50,
          left: -300,
          right: -20,
          bottom: 0,
          width: "calc(100% + 320px)",
          height: "calc(100% + 50px)",
        }}
        allow="fullscreen"
      />

      <IframeMask />

      {/* Intro overlay */}
      <AnimatePresence>
        {!introDone && (
          <StarIntro
            name={star.customName}
            message={star.message}
            date={star.date}
            onComplete={() => setIntroDone(true)}
          />
        )}
      </AnimatePresence>

      {/* UI elements appear after intro */}
      <AnimatePresence>
        {introDone && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute top-4 right-4 z-20"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60"
              >
                <ArrowRight className="w-4 h-4 ml-1" />
                رجوع
              </Button>
            </motion.div>

            <StarInfoPanel star={panelData} />
            <StarMessage message={star.message} date={star.date} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarView;
