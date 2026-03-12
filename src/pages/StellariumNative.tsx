import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Compass, Sun, Eye, X, Menu, Sparkles, MapPin, Layers, Moon, Mountain, Grid3X3, Telescope, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
  magnitude: string;
  ra: string;
  dec: string;
}

declare global {
  interface Window {
    StelWebEngine: any;
  }
}

/* ─── Data source base URL (proxied through Supabase Edge Function) ─── */
const SUPABASE_URL = "https://zhajybiboozrllfiplyz.supabase.co";
const DATA_BASE_URL = `${SUPABASE_URL}/functions/v1/stellarium-proxy/`;

const StellariumNative = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stelRef = useRef<any>(null);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [selectedStar, setSelectedStar] = useState<SelectedStar | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showConstellations, setShowConstellations] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(false);
  const [showLandscape, setShowLandscape] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [timeHour, setTimeHour] = useState(22); // 0-24 range, default 10 PM
  const [showTimeSlider, setShowTimeSlider] = useState(false);
  const [fov, setFov] = useState<number | null>(null);

  /* ─── Load & Initialize the Stellarium WASM Engine ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to fill screen
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    // Progress simulation while loading
    const progressInterval = setInterval(() => {
      setLoadingProgress((p) => (p >= 85 ? 85 : p + Math.random() * 12));
    }, 300);

    // Dynamically inject the engine script
    const script = document.createElement("script");
    script.src = "/stellarium-web-engine.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.StelWebEngine !== "function") {
        clearInterval(progressInterval);
        setEngineError("لم يتم العثور على دالة StelWebEngine — تأكد من أن الملف مُترجم بشكل صحيح.");
        return;
      }

      try {
        window.StelWebEngine({
          wasmFile: "/stellarium-web-engine.wasm",
          canvas: canvas,
          onReady: (stel: any) => {
            stelRef.current = stel;
            clearInterval(progressInterval);
            setLoadingProgress(100);

            try {
              const core = stel.core;

              // ── Add all data sources ──
              const addDataSourceCompat = (
                moduleObj: any,
                source: { url: string; key?: string },
                label: string
              ) => {
                if (!moduleObj?.addDataSource) {
                  console.warn(`⚠️ ${label}: addDataSource not available`);
                  return;
                }

                // Some wrapper builds accept object form, others positional args.
                try {
                  moduleObj.addDataSource(source);
                  console.log(`✅ ${label} loaded (object API):`, source.url);
                  return;
                } catch {
                  // try positional fallback
                }

                try {
                  moduleObj.addDataSource(source.url, source.key);
                  console.log(`✅ ${label} loaded (positional API):`, source.url);
                } catch (e) {
                  console.warn(`⚠️ ${label} failed:`, source.url, e);
                }
              };

              // IMPORTANT: Gaia survey includes bright stars (< 8) that were missing.
              addDataSourceCompat(core.stars, {
                url: "https://data.stellarium.org/surveys/gaia",
                key: "gaia",
              }, "Stars Gaia (bright + faint)");

              // Keep proxy extended survey as fallback (mainly faint stars).
              addDataSourceCompat(core.stars, {
                url: DATA_BASE_URL + "stars",
                key: "extended",
              }, "Stars proxy extended");

              addDataSourceCompat(core.skycultures, {
                url: DATA_BASE_URL + "skycultures/western",
                key: "western",
              }, "Skyculture western");

              addDataSourceCompat(core.dsos, { url: DATA_BASE_URL + "dso" }, "DSO catalog");

              addDataSourceCompat(core.landscapes, {
                url: DATA_BASE_URL + "landscapes/guereins",
                key: "guereins",
              }, "Landscape guereins");

              addDataSourceCompat(core.milkyway, {
                url: DATA_BASE_URL + "surveys/milkyway",
              }, "Milky Way");

              addDataSourceCompat(core.planets, {
                url: DATA_BASE_URL + "surveys/moon",
                key: "moon",
              }, "Moon survey");

              addDataSourceCompat(core.planets, {
                url: DATA_BASE_URL + "surveys/sun",
                key: "sun",
              }, "Sun survey");

              // Set observer location — try user's GPS, fallback to Riyadh
              const setDefaultLocation = () => {
                core.observer.latitude = (24.7136 * Math.PI) / 180;
                core.observer.longitude = (46.6753 * Math.PI) / 180;
                core.observer.altitude = 612;
              };

              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    core.observer.latitude = (pos.coords.latitude * Math.PI) / 180;
                    core.observer.longitude = (pos.coords.longitude * Math.PI) / 180;
                    core.observer.altitude = pos.coords.altitude || 0;
                    console.log("📍 Using user location:", pos.coords.latitude, pos.coords.longitude);
                  },
                  () => {
                    setDefaultLocation();
                    console.log("📍 Geolocation denied, using Riyadh");
                  },
                  { timeout: 5000 }
                );
              } else {
                setDefaultLocation();
              }

              // Set time to 10 PM Riyadh time (UTC+3) = 19:00 UTC
              // Use UTC directly to avoid browser timezone issues
              const now = new Date();
              const utcNight = Date.UTC(
                now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                19, 0, 0 // 19:00 UTC = 22:00 Riyadh (UTC+3)
              );
              const mjd = (utcNight / 86400000) + 40587;
              core.observer.utc = mjd;

              console.log("🕐 Setting engine time - MJD:", mjd, "UTC date:", new Date(utcNight).toISOString());

              // ── Enable visual layers ──
              if (core.constellations) {
                core.constellations.lines_visible = true;
                core.constellations.labels_visible = true;
              }
              // Disable atmosphere for pitch-black background
              if (core.atmosphere) {
                core.atmosphere.visible = false;
              }
              if (core.milkyway) {
                core.milkyway.visible = true;
              }
              if (core.landscapes) {
                core.landscapes.visible = true;
              }

              // ── Breathtaking Sky Settings (verified from C source core.c) ──
              // Bortle 1 = pristine dark sky, no light pollution
              core.bortle_index = 1;
              // Increase star rendering size — bright stars get halos
              core.star_linear_scale = 1.8;
              // Boost size difference between bright/faint stars
              core.star_relative_scale = 1.8;
              // Show stars down to mag 12
              core.display_limit_mag = 12.0;
              // Do NOT touch exposure_scale — default 1.0 preserves
              // the tonemapper curve so bright stars stay visible
              // core.exposure_scale = 1.0;  // engine default
              // Set wide 120° FOV
              core.fov = (120 * Math.PI) / 180;

              // ── Diagnostic: log star catalog status ──
              console.log("🌟 Star source (bright+faint):", "https://data.stellarium.org/surveys/gaia");
              console.log("🌟 Star source fallback (faint):", DATA_BASE_URL + "stars");
              console.log("🔧 core.star_linear_scale =", core.star_linear_scale);
              console.log("🔧 core.star_relative_scale =", core.star_relative_scale);
              console.log("🔧 core.bortle_index =", core.bortle_index);
              console.log("🔧 core.display_limit_mag =", core.display_limit_mag);
              console.log("🔧 core.exposure_scale =", core.exposure_scale);
              console.log("🔧 core.fov (deg) =", (core.fov * 180) / Math.PI);

              // Listen for selection changes
              stel.change((obj: any, attr: string) => {
                if (attr === "selection" && core.selection) {
                  handleStarSelected(stel, core.selection);
                }
              });

              console.log("✅ Stellarium Web Engine initialized with full data sources");
            } catch (e) {
              console.warn("⚠️ Data source setup error:", e);
            }

            setTimeout(() => setEngineLoaded(true), 500);

            // Track FOV changes
            const fovInterval = setInterval(() => {
              try {
                const fovRad = stelRef.current?.core?.fov;
                if (fovRad !== undefined) {
                  setFov((fovRad * 180) / Math.PI);
                }
              } catch {}
            }, 300);
            // Store interval for cleanup
            (window as any).__fovInterval = fovInterval;
          },
          onError: (err: any) => {
            clearInterval(progressInterval);
            console.error("Engine error:", err);
            setEngineError("تعذّر تهيئة محرك النجوم. يرجى تحديث الصفحة.");
          },
        });
      } catch (e: any) {
        clearInterval(progressInterval);
        setEngineError(e.message || "خطأ غير متوقع");
      }
    };

    script.onerror = () => {
      clearInterval(progressInterval);
      setEngineError("تعذّر تحميل ملف stellarium-web-engine.js");
    };

    document.body.appendChild(script);

    return () => {
      clearInterval(progressInterval);
      clearInterval((window as any).__fovInterval);
      window.removeEventListener("resize", resize);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  /* ─── Handle star selection from the engine ─── */
  const handleStarSelected = useCallback((stel: any, obj: any) => {
    try {
      const designations = obj.designations?.() || [];
      let name = designations[0] || obj.name || "Unknown";
      name = name.replace(/^NAME /, "");

      // Get magnitude
      const vmag = obj.getInfo?.("vmag");
      const magStr = vmag !== undefined ? vmag.toFixed(2) : "—";

      // Get RA/Dec
      let raStr = "—";
      let decStr = "—";
      try {
        const obs = stel.core.observer;
        const radec = obj.getInfo?.("radec");
        if (radec) {
          const cirs = stel.convertFrame(obs, "ICRF", "CIRS", radec);
          const c = stel.c2s(cirs);
          const ra = stel.anp(c[0]);
          const dec = stel.anpm(c[1]);
          const raf = stel.a2tf(ra, 1);
          const daf = stel.a2af(dec, 1);
          raStr = `${pad(raf.hours)}h ${pad(raf.minutes)}m ${pad(raf.seconds)}.${raf.fraction}s`;
          decStr = `${daf.sign}${pad(daf.degrees)}° ${pad(daf.arcminutes)}' ${pad(daf.arcseconds)}.${daf.fraction}"`;
        }
      } catch {
        /* fallback to "—" */
      }

      // Check for custom Arabic name
      const custom = customNamesDb[name];
      setSelectedStar({
        name,
        arabicName: custom?.arabic || name,
        description: custom?.description || "نجم لم يُسمَّ بعد في قاعدة بياناتنا.",
        magnitude: magStr,
        ra: raStr,
        dec: decStr,
      });
      setSidebarOpen(true);
    } catch (e) {
      console.warn("Error reading star info:", e);
    }
  }, []);

  /* ─── Toggle engine features ─── */
  const toggleConstellations = useCallback(() => {
    const core = stelRef.current?.core;
    if (core?.constellations) {
      const next = !showConstellations;
      core.constellations.lines_visible = next;
      core.constellations.labels_visible = next;
      setShowConstellations(next);
    }
  }, [showConstellations]);

  const toggleAtmosphere = useCallback(() => {
    const core = stelRef.current?.core;
    if (core) {
      const next = !showAtmosphere;
      core.atmosphere.visible = next;
      setShowAtmosphere(next);
    }
  }, [showAtmosphere]);

  const toggleLandscape = useCallback(() => {
    const core = stelRef.current?.core;
    if (core?.landscapes) {
      const next = !showLandscape;
      core.landscapes.visible = next;
      setShowLandscape(next);
    }
  }, [showLandscape]);

  const toggleGrid = useCallback(() => {
    const core = stelRef.current?.core;
    if (core) {
      const next = !showGrid;
      if (core.lines) core.lines.equatorial_grid = next;
      setShowGrid(next);
    }
  }, [showGrid]);

  const handleTimeChange = useCallback((value: number[]) => {
    const core = stelRef.current?.core;
    const hour = value[0];
    setTimeHour(hour);
    if (core) {
      const now = new Date();
      const wholeHour = Math.floor(hour);
      const minutes = Math.round((hour - wholeHour) * 60);
      // Convert Riyadh local hour to UTC (subtract 3 hours for UTC+3)
      const utcHour = wholeHour - 3;
      const utcTime = Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
        utcHour, minutes, 0
      );
      const mjd = (utcTime / 86400000) + 40587;
      core.observer.utc = mjd;
    }
  }, []);

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const period = h >= 12 ? "م" : "ص";
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
  };

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-background">
      {/* ─── Full-Screen Canvas ─── */}
      <canvas
        ref={canvasRef}
        id="stel-canvas"
        className="absolute inset-0 w-full h-full outline-none"
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
                <p className="text-sm font-body text-muted-foreground">Stellarium Web Engine</p>
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

      {/* ─── Top Controls ─── */}
      {engineLoaded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 z-30 flex gap-2 items-center"
        >
          {fov !== null && (
            <div className="glass-panel border-glass-border/40 rounded-lg px-3 py-2 text-xs font-mono text-foreground/80 flex items-center gap-1.5">
              <Telescope className="w-3.5 h-3.5 text-primary" />
              <span dir="ltr">{fov < 1 ? fov.toFixed(2) : fov.toFixed(1)}°</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((o) => !o)}
            className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 w-10 h-10"
            title={sidebarOpen ? "إغلاق" : "القائمة"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </motion.div>
      )}

      {/* ─── Bottom Toolbar ─── */}
      {engineLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2"
        >
          <ToolbarButton
            icon={<Layers className="w-4 h-4" />}
            label="الأبراج"
            active={showConstellations}
            onClick={toggleConstellations}
          />
          <ToolbarButton
            icon={<Sun className="w-4 h-4" />}
            label="الغلاف الجوي"
            active={showAtmosphere}
            onClick={toggleAtmosphere}
          />
          <ToolbarButton
            icon={<Mountain className="w-4 h-4" />}
            label="المشهد"
            active={showLandscape}
            onClick={toggleLandscape}
          />
          <ToolbarButton
            icon={<Grid3X3 className="w-4 h-4" />}
            label="الشبكة"
            active={showGrid}
            onClick={toggleGrid}
          />
          <ToolbarButton
            icon={<Clock className="w-4 h-4" />}
            label={formatTime(timeHour)}
            active={showTimeSlider}
            onClick={() => setShowTimeSlider((v) => !v)}
          />
        </motion.div>
      )}

      {/* ─── Time Slider ─── */}
      <AnimatePresence>
        {engineLoaded && showTimeSlider && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 glass-panel rounded-2xl px-5 py-4 w-[min(90vw,360px)]"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {timeHour >= 18 || timeHour < 6 ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-primary" />
                )}
                <span className="text-xs font-body text-muted-foreground">الوقت</span>
              </div>
              <span className="text-sm font-display font-bold text-foreground">{formatTime(timeHour)}</span>
            </div>
            <Slider
              value={[timeHour]}
              onValueChange={handleTimeChange}
              min={0}
              max={23.75}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-[10px] font-body text-muted-foreground/60">
              <span>12 ص</span>
              <span>6 ص</span>
              <span>12 م</span>
              <span>6 م</span>
              <span>12 ص</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hint ─── */}
      <AnimatePresence>
        {engineLoaded && !selectedStar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-3" dir="rtl">
              <Telescope className="w-5 h-5 text-primary" />
              <span className="text-sm font-body text-foreground/80">انقر على أي نجم لعرض معلوماته</span>
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
            {/* Header */}
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

            {/* Arabic Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="px-4 sm:px-6 pt-6"
            >
              <h1 className="text-3xl sm:text-4xl font-bold star-glow leading-relaxed font-display">
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

            {/* Data */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="px-4 sm:px-6 pt-6 space-y-3 flex-1"
            >
              <SidebarRow icon={<Sparkles className="w-4 h-4" />} label="القدر الظاهري" value={selectedStar.magnitude} />
              <SidebarRow icon={<Compass className="w-4 h-4" />} label="المطلع المستقيم" value={selectedStar.ra} isLtr />
              <SidebarRow icon={<Sun className="w-4 h-4" />} label="الميل" value={selectedStar.dec} isLtr />
            </motion.div>

            {/* Footer tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-4 sm:p-6 pt-0"
            >
              <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  حرّك السماء بالسحب، وقرّب بعجلة الفأرة أو بالقرص على الشاشة
                </p>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Toolbar Button ─── */
const ToolbarButton = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`glass-panel rounded-xl px-3 py-2.5 flex flex-col items-center gap-1 transition-all duration-200 min-w-[60px] ${
      active ? "text-primary border-primary/30" : "text-muted-foreground opacity-60"
    }`}
    title={label}
  >
    {icon}
    <span className="text-[9px] font-body hidden sm:block">{label}</span>
  </button>
);

/* ─── Sidebar Data Row ─── */
const SidebarRow = ({
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
    <span className="text-xs font-body font-medium text-foreground" dir={isLtr ? "ltr" : "rtl"}>
      {value}
    </span>
  </div>
);

/* ─── Helpers ─── */
function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

export default StellariumNative;
