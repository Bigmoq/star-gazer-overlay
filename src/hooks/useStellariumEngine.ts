import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    StelWebEngine: any;
  }
}

const SUPABASE_URL = "https://zhajybiboozrllfiplyz.supabase.co";
const DATA_BASE_URL = `${SUPABASE_URL}/functions/v1/stellarium-proxy/`;

interface UseEngineOptions {
  /** If provided, navigate to this star after engine loads */
  targetStarId?: string;
  /** FOV in degrees for targeting (default 0.5) */
  targetFov?: number;
  /** Initial FOV in degrees (default 120) */
  initialFov?: number;
  /** Show atmosphere (default false) */
  atmosphere?: boolean;
  /** Show landscape (default true) */
  landscape?: boolean;
  /** Show constellations (default true) */
  constellations?: boolean;
}

export function useStellariumEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseEngineOptions = {}
) {
  const stelRef = useRef<any>(null);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [targetFound, setTargetFound] = useState(false);

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

              // ── Add data sources ──
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

              // ── Observer location ──
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

              // ── Time: 10 PM Riyadh ──
              const now = new Date();
              const utcNight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 19, 0, 0);
              core.observer.utc = utcNight / 86400000 + 40587;

              // ── Visual layers ──
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

              // ── Rendering settings ──
              core.bortle_index = 1;
              core.star_linear_scale = 0.9;
              core.star_relative_scale = 1.0;
              core.display_limit_mag = 12.0;
              core.fov = ((options.initialFov || 120) * Math.PI) / 180;

              // ── Navigate to target star ──
              if (options.targetStarId) {
                navigateToStar(stel, options.targetStarId, options.targetFov || 0.5);
              }

            } catch (e) {
              console.warn("⚠️ Engine setup error:", e);
            }

            setTimeout(() => setEngineLoaded(true), 500);
          },
          onError: (err: any) => {
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

  const navigateToStar = useCallback((stel: any, starId: string, fovDeg: number) => {
    const core = stel.core;

    // Format: "SAO1818" → "SAO 1818", "HIP11767" → "HIP 11767"
    const formattedId = starId.replace(/([A-Za-z]+)(\d+)/, "$1 $2");

    // Try multiple search patterns with delay to allow data to load
    const trySearch = (attempts: number) => {
      if (attempts <= 0) {
        console.warn("⚠️ Could not find star:", starId);
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
          // Select and lock onto the star
          core.selection = obj;
          core.lock = obj;
          // Zoom to target FOV
          const fovRad = (fovDeg * Math.PI) / 180;
          core.fov = fovRad;
          setTargetFound(true);
        } catch (e) {
          console.warn("⚠️ Error navigating to star:", e);
        }
      } else {
        // Retry after data loads
        setTimeout(() => trySearch(attempts - 1), 2000);
      }
    };

    // Start searching after a delay to allow star catalogs to load
    setTimeout(() => trySearch(10), 3000);
  }, []);

  const goToStar = useCallback((starId: string, fovDeg = 0.5) => {
    if (stelRef.current) {
      navigateToStar(stelRef.current, starId, fovDeg);
    }
  }, [navigateToStar]);

  return {
    stelRef,
    engineLoaded,
    engineError,
    loadingProgress,
    targetFound,
    goToStar,
  };
}
