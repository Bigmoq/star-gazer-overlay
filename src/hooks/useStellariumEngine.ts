import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    StelWebEngine: any;
  }
}

const SUPABASE_URL = "https://zhajybiboozrllfiplyz.supabase.co";
const DATA_BASE_URL = `${SUPABASE_URL}/functions/v1/stellarium-proxy/`;

interface UseEngineOptions {
  targetStarId?: string;
  targetFov?: number;
  initialFov?: number;
  atmosphere?: boolean;
  landscape?: boolean;
  constellations?: boolean;
  /** If true, don't auto-navigate — wait for cinematicZoom call */
  deferNavigation?: boolean;
}

export function useStellariumEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseEngineOptions = {}
) {
  const stelRef = useRef<any>(null);
  const prefindRequestedRef = useRef<string | null>(null);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [targetFound, setTargetFound] = useState(false);
  const [starReady, setStarReady] = useState(false); // star found but not zoomed yet

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const progressInterval = setInterval(() => {
      setLoadingProgress((p) => (p >= 85 ? 85 : p + Math.random() * 12));
    }, 300);

    const script = document.createElement("script");
    script.src = "/stellarium-web-engine.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.StelWebEngine !== "function") {
        clearInterval(progressInterval);
        setEngineError("لم يتم العثور على دالة StelWebEngine");
        return;
      }

      try {
        window.StelWebEngine({
          wasmFile: "/stellarium-web-engine.wasm",
          canvas,
          onReady: (stel: any) => {
            stelRef.current = stel;
            clearInterval(progressInterval);
            setLoadingProgress(100);

            try {
              const core = stel.core;

              const addDS = (mod: any, source: { url: string; key?: string }, label: string) => {
                if (!mod?.addDataSource) return;
                try { mod.addDataSource(source); } catch {
                  try { mod.addDataSource(source.url, source.key); } catch (e) {
                    console.warn(`⚠️ ${label} failed:`, e);
                  }
                }
              };

              addDS(core.stars, { url: DATA_BASE_URL + "stars-minimal" }, "Stars minimal");
              addDS(core.stars, { url: DATA_BASE_URL + "surveys/gaia", key: "gaia" }, "Gaia");
              addDS(core.stars, { url: DATA_BASE_URL + "stars", key: "extended" }, "Stars proxy");
              addDS(core.stars, { url: DATA_BASE_URL + "stars-extended", key: "stars-extended" }, "Stars extended");
              addDS(core.dsos, { url: DATA_BASE_URL + "dso" }, "DSO");
              addDS(core.milkyway, { url: DATA_BASE_URL + "surveys/milkyway" }, "Milky Way");
              addDS(core.planets, { url: DATA_BASE_URL + "surveys/moon", key: "moon" }, "Moon");
              addDS(core.planets, { url: DATA_BASE_URL + "surveys/sun", key: "sun" }, "Sun");
              addDS(core.planets, { url: DATA_BASE_URL + "surveys/moon", key: "default" }, "Planets default");
              addDS(core.dsos, { url: DATA_BASE_URL + "surveys/dss" }, "DSS");

              const setDefault = () => {
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
                  },
                  () => setDefault(),
                  { timeout: 5000 }
                );
              } else {
                setDefault();
              }

              const now = new Date();
              const utcNight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 19, 0, 0);
              core.observer.utc = utcNight / 86400000 + 40587;

              if (core.constellations) {
                core.constellations.lines_visible = options.constellations !== false;
                core.constellations.labels_visible = options.constellations !== false;
              }
              if (core.atmosphere) core.atmosphere.visible = !!options.atmosphere;
              if (core.milkyway) core.milkyway.visible = true;
              if (core.landscapes) core.landscapes.visible = options.landscape !== false;
              if (core.stars) {
                core.stars.hints_visible = true;
                core.stars.hints_mag_offset = -3;
              }
              if (core.planets) {
                core.planets.hints_visible = true;
                core.planets.hints_mag_offset = 0;
              }

              core.bortle_index = 1;
              core.star_linear_scale = 0.9;
              core.star_relative_scale = 1.0;
              core.display_limit_mag = 12.0;
              core.fov = ((options.initialFov || 120) * Math.PI) / 180;

              // Pre-find and lock the star (point camera but keep wide FOV)
              if (options.targetStarId) {
                prefindRequestedRef.current = options.targetStarId;
                prefindStar(stel, options.targetStarId);
              } else {
                setStarReady(true);
              }

            } catch (e) {
              console.warn("⚠️ Engine setup error:", e);
            }

            setTimeout(() => setEngineLoaded(true), 500);
          },
          onError: () => {
            clearInterval(progressInterval);
            setEngineError("تعذّر تهيئة محرك النجوم.");
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
      window.removeEventListener("resize", resize);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  /** Find the star and point camera at it, but don't zoom yet */
  const prefindStar = useCallback((stel: any, starId: string) => {
    const core = stel.core;
    const formattedId = starId.replace(/([A-Za-z]+)(\d+)/, "$1 $2");

    const trySearch = (attempts: number) => {
      if (attempts <= 0) {
        console.warn("⚠️ Could not find star:", starId);
        setStarReady(true); // proceed anyway
        return;
      }

      let obj = null;
      const queries = [formattedId, starId, `NAME ${formattedId}`, `NAME ${starId}`];
      for (const q of queries) {
        try {
          obj = core.search?.(q) || stel.getObj?.(q);
          if (obj) break;
        } catch {}
      }

      if (obj) {
        console.log("🎯 Found star:", starId);
        try {
          core.selection = obj;
          core.lock = obj;
          // Keep wide FOV — zoom will happen cinematically later
        } catch (e) {
          console.warn("⚠️ Error selecting star:", e);
        }
        setStarReady(true);
      } else {
        setTimeout(() => trySearch(attempts - 1), 2000);
      }
    };

    setTimeout(() => trySearch(10), 2000);
  }, []);

  /** Cinematic zoom: smoothly animate FOV from current to target */
  const cinematicZoomToStar = useCallback((targetFovDeg = 0.5, durationMs = 3000) => {
    const core = stelRef.current?.core;
    if (!core) return;

    const startFov = core.fov;
    const endFov = (targetFovDeg * Math.PI) / 180;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-in-out cubic for smooth cinematic feel
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Logarithmic interpolation for natural zoom feel
      const logStart = Math.log(startFov);
      const logEnd = Math.log(endFov);
      core.fov = Math.exp(logStart + (logEnd - logStart) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        core.fov = endFov;
        setTargetFound(true);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const goToStar = useCallback((starId: string, fovDeg = 0.5) => {
    if (stelRef.current) {
      const core = stelRef.current.core;
      const formattedId = starId.replace(/([A-Za-z]+)(\d+)/, "$1 $2");
      const queries = [formattedId, starId, `NAME ${formattedId}`];
      for (const q of queries) {
        try {
          const obj = core.search?.(q) || stelRef.current.getObj?.(q);
          if (obj) {
            core.selection = obj;
            core.lock = obj;
            cinematicZoomToStar(fovDeg, 2000);
            return;
          }
        } catch {}
      }
    }
  }, [cinematicZoomToStar]);

  return {
    stelRef,
    engineLoaded,
    engineError,
    loadingProgress,
    targetFound,
    starReady,
    goToStar,
    cinematicZoomToStar,
  };
}
