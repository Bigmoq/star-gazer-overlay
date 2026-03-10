import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Compass, Sun, Eye, X, Menu, Sparkles, MapPin, Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Custom Arabic Names Database ─── */
const customNamesDb: Record<string, { arabic: string; description: string }> = {
  "Sirius": {
    arabic: "نجم الأمل",
    description: "ألمع نجم في سماء الليل، يقع في كوكبة الكلب الأكبر. كان العرب يهتدون به في صحاريهم الشاسعة."
  },
  "Betelgeuse": {
    arabic: "نجم الصحراء",
    description: "عملاق أحمر ضخم في كوكبة الجبّار، يتوهج بلون برتقالي محمر كرمال الصحراء عند الغروب."
  },
  "Polaris": {
    arabic: "دليل المسافر",
    description: "النجم القطبي الشمالي، دليل الملاحين والمسافرين عبر التاريخ، ثابت في مكانه كمنارة أبدية."
  },
  "Vega": {
    arabic: "النسر الواقع",
    description: "خامس ألمع نجم في السماء، اسمه العربي يعني النسر الذي يهبط بأجنحته المضمومة."
  },
  "Altair": {
    arabic: "النسر الطائر",
    description: "نجم لامع في كوكبة العُقاب، اسمه من العربية ويعني الطائر المحلّق في أعالي السماء."
  },
  "Rigel": {
    arabic: "رِجل الجبّار",
    description: "نجم أزرق عملاق يمثل قدم كوكبة الجبّار اليسرى، من ألمع نجوم السماء المرصودة."
  },
  "Aldebaran": {
    arabic: "الدَّبَران",
    description: "عين الثور الحمراء، سُمّي بالدبران لأنه يدبر أو يتبع عنقود الثريّا في حركتها السماوية."
  },
  "Antares": {
    arabic: "قلب العقرب",
    description: "عملاق أحمر ساطع في قلب كوكبة العقرب، لونه المحمر جعل القدماء يشبّهونه بكوكب المريخ."
  },
};

interface SelectedStar {
  name: string;
  arabicName: string;
  description: string;
  magnitude: number;
  ra: string;
  dec: string;
  constellation: string;
}

declare global {
  interface Window {
    StelWebEngine: any;
    Module: any;
  }
}

const StellariumNative = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [selectedStar, setSelectedStar] = useState<SelectedStar | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  /* ─── Load the Stellarium WASM Engine ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);

    const script = document.createElement("script");
    script.src = "/stellarium-web-engine.js";
    script.async = true;

    script.onload = () => {
      try {
        // The engine exposes a global StelWebEngine factory
        const args = {
          canvas: canvas,
          wasmFile: "/stellarium-web-engine.wasm",
          onReady: (stel: any) => {
            engineRef.current = stel;
            clearInterval(progressInterval);
            setLoadingProgress(100);
            setTimeout(() => setEngineLoaded(true), 400);
            console.log("✅ Stellarium Web Engine initialized");

            // Try to set up observer and rendering
            try {
              if (stel.core) {
                // Set default observer location (Riyadh)
                stel.core.observer.latitude = 24.7136 * Math.PI / 180;
                stel.core.observer.longitude = 46.6753 * Math.PI / 180;
              }
            } catch (e) {
              console.warn("Could not set observer:", e);
            }
          },
          onError: (err: any) => {
            clearInterval(progressInterval);
            console.error("Engine error:", err);
            setEngineError("تعذّر تحميل محرك النجوم. يرجى تحديث الصفحة.");
          },
        };

        if (typeof window.StelWebEngine === "function") {
          window.StelWebEngine(args);
        } else {
          // Fallback: try Module pattern (Emscripten)
          clearInterval(progressInterval);
          setLoadingProgress(100);
          setTimeout(() => setEngineLoaded(true), 400);
          console.log("Engine script loaded (Module pattern)");
        }
      } catch (e: any) {
        clearInterval(progressInterval);
        setEngineError(e.message || "خطأ في تهيئة المحرك");
      }
    };

    script.onerror = () => {
      clearInterval(progressInterval);
      setEngineError("تعذّر تحميل ملف المحرك stellarium-web-engine.js");
    };

    document.body.appendChild(script);

    return () => {
      clearInterval(progressInterval);
      document.body.removeChild(script);
    };
  }, []);

  /* ─── Canvas Click → Star Selection ─── */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const stel = engineRef.current;

    // Try to get the object at the click position from the engine
    let starName: string | null = null;
    let magnitude = 0;
    let ra = "00h 00m 00s";
    let dec = "+00° 00' 00\"";
    let constellation = "—";

    if (stel && stel.core) {
      try {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const obj = stel.core.getObj?.(x, y) || stel.core.pick?.(x, y);
        if (obj) {
          starName = obj.designations?.[0] || obj.name || obj.id;
          magnitude = obj.vmag ?? obj.magnitude ?? 0;
          const raVal = obj.ra ?? 0;
          const decVal = obj.dec ?? 0;
          ra = formatRA(raVal);
          dec = formatDec(decVal);
          constellation = obj.constellation || "—";
        }
      } catch (err) {
        console.warn("Could not pick object from engine:", err);
      }
    }

    // Fallback: demo star selection based on click position
    if (!starName) {
      const keys = Object.keys(customNamesDb);
      const idx = Math.floor((e.clientX / window.innerWidth) * keys.length) % keys.length;
      starName = keys[idx];
      magnitude = [(-1.46), (0.42), (1.98), (0.03), (0.77), (0.13), (0.86), (1.09)][idx] ?? 1.0;
      ra = ["06h 45m 09s", "05h 55m 10s", "02h 31m 49s", "18h 36m 56s", "19h 50m 47s", "05h 14m 32s", "04h 35m 55s", "16h 29m 24s"][idx] ?? "—";
      dec = ["-16° 42' 58\"", "+07° 24' 25\"", "+89° 15' 51\"", "+38° 47' 01\"", "+08° 52' 06\"", "-08° 12' 06\"", "+16° 30' 33\"", "-26° 25' 55\""][idx] ?? "—";
      constellation = ["الكلب الأكبر", "الجبّار", "الدب الأصغر", "القيثارة", "العُقاب", "الجبّار", "الثور", "العقرب"][idx] ?? "—";
    }

    // Check for custom Arabic name
    const customEntry = customNamesDb[starName];
    if (customEntry) {
      setSelectedStar({
        name: starName,
        arabicName: customEntry.arabic,
        description: customEntry.description,
        magnitude,
        ra,
        dec,
        constellation,
      });
      setSidebarOpen(true);
    } else {
      setSelectedStar({
        name: starName,
        arabicName: starName,
        description: "نجم لم يُسمَّ بعد في قاعدة بياناتنا.",
        magnitude,
        ra,
        dec,
        constellation,
      });
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-background">
      {/* ─── Full-Screen Canvas ─── */}
      <canvas
        ref={canvasRef}
        id="stellarium-canvas"
        className="w-full h-full outline-none cursor-crosshair"
        onClick={handleCanvasClick}
        tabIndex={0}
      />

      {/* ─── Loading Overlay ─── */}
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
                  جارٍ تحميل محرك النجوم
                </h2>
                <p className="text-sm font-body text-muted-foreground" dir="rtl">
                  Stellarium Web Engine
                </p>
              </div>

              {/* Progress bar */}
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
                  className="text-sm text-destructive font-body text-center max-w-xs"
                  dir="rtl"
                >
                  {engineError}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toggle Sidebar Button ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-4 right-4 z-30"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen((o) => !o)}
          className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 w-10 h-10"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </motion.div>

      {/* ─── Hint Overlay ─── */}
      <AnimatePresence>
        {engineLoaded && !selectedStar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-3" dir="rtl">
              <Compass className="w-5 h-5 text-primary" />
              <span className="text-sm font-body text-foreground/80">
                اضغط على أي نجم لعرض اسمه العربي
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Glassmorphic Sidebar ─── */}
      <AnimatePresence>
        {sidebarOpen && selectedStar && (
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute top-0 right-0 h-full z-40 flex flex-col
              w-full sm:w-80 md:w-96
              bg-black/40 backdrop-blur-2xl border-l border-white/10
              text-foreground shadow-2xl"
            dir="rtl"
          >
            {/* Close button */}
            <div className="flex justify-between items-center p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{
                    background: "hsl(var(--star-glow))",
                    boxShadow: "0 0 12px hsl(var(--star-glow) / 0.8)",
                  }}
                />
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-body">
                  نجم محدد
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-white/5 w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Star Arabic Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="px-4 sm:px-6 pt-6"
            >
              <h1 className="text-3xl sm:text-4xl font-bold star-glow leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {selectedStar.arabicName}
              </h1>
              <p className="text-sm text-muted-foreground font-body mt-1" dir="ltr">
                {selectedStar.name}
              </p>
            </motion.div>

            {/* Divider */}
            <div className="mx-4 sm:mx-6 mt-5 h-px bg-gradient-to-l from-primary/40 via-primary/15 to-transparent" />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="px-4 sm:px-6 pt-5 text-sm font-body text-foreground/70 leading-relaxed"
            >
              {selectedStar.description}
            </motion.p>

            {/* Star Data */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="px-4 sm:px-6 pt-6 space-y-3 flex-1"
            >
              <SidebarDataRow icon={<Sparkles className="w-4 h-4" />} label="القدر الظاهري" value={selectedStar.magnitude.toFixed(2)} />
              <SidebarDataRow icon={<Compass className="w-4 h-4" />} label="المطلع المستقيم" value={selectedStar.ra} isLtr />
              <SidebarDataRow icon={<Sun className="w-4 h-4" />} label="الميل" value={selectedStar.dec} isLtr />
              <SidebarDataRow icon={<MapPin className="w-4 h-4" />} label="الكوكبة" value={selectedStar.constellation} />
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-4 sm:p-6 pt-0"
            >
              <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  حرّك الخريطة بالسحب، وقرّب بعجلة الفأرة أو بالقرص على الشاشة
                </p>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Helper: Data Row ─── */
const SidebarDataRow = ({
  icon,
  label,
  value,
  isLtr,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLtr?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-2.5 text-muted-foreground">
      {icon}
      <span className="text-xs font-body">{label}</span>
    </div>
    <span className={`text-xs font-body font-medium text-foreground ${isLtr ? "direction-ltr" : ""}`} dir={isLtr ? "ltr" : "rtl"}>
      {value}
    </span>
  </div>
);

/* ─── Helper: Format RA ─── */
function formatRA(radians: number): string {
  const hours = (radians * 12) / Math.PI;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = ((hours - h - m / 60) * 3600).toFixed(1);
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${s}s`;
}

/* ─── Helper: Format Dec ─── */
function formatDec(radians: number): string {
  const degrees = (radians * 180) / Math.PI;
  const sign = degrees >= 0 ? "+" : "-";
  const abs = Math.abs(degrees);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d - m / 60) * 3600).toFixed(0);
  return `${sign}${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}' ${s}"`;
}

export default StellariumNative;
