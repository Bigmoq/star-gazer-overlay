import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    StelWebEngine: any;
  }
}

const SUPABASE_URL = "https://zhajybiboozrllfiplyz.supabase.co";
const DATA_BASE_URL = `${SUPABASE_URL}/functions/v1/stellarium-proxy/`;

const ENGINE_TIMEOUT_MS = 30000;

export interface ClickedStarInfo {
  name: string;
  identifier: string;
  magnitude: string;
  ra: string;
  dec: string;
}

interface UseEngineOptions {
  targetStarId?: string;
  targetFov?: number;
  initialFov?: number;
  atmosphere?: boolean;
  landscape?: boolean;
  constellations?: boolean;
  deferNavigation?: boolean;
  key?: number;
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

export function useStellariumEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseEngineOptions = {}
) {
  const stelRef = useRef<any>(null);
  const initGuardRef = useRef(false);
  const prefindRequestedRef = useRef<string | null>(null);
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [targetFound, setTargetFound] = useState(false);
  const [starReady, setStarReady] = useState(false);
  const [clickedStar, setClickedStar] = useState<ClickedStarInfo | null>(null);

  const engineKey = options.key ?? 0;

  const handleStarSelected = useCallback((stel: any, obj: any) => {
    try {
      const designations = obj.designations?.() || [];
      let name = designations[0] || obj.name || "Unknown";
      name = name.replace(/^NAME /, "");

      // Extract best identifier (HIP, SAO, HD, etc.)
      let identifier = "";
      for (const d of designations) {
        const clean = (d as string).replace(/^NAME /, "");
        if (/^(HIP|SAO|HD|HR)\s?\d+/i.test(clean)) {
          identifier = clean.replace(/\s+/g, "");
          break;
        }
      }
      if (!identifier) {
        identifier = name.replace(/\s+/g, "");
      }

      const vmag = obj.getInfo?.("vmag");
      const magStr = vmag !== undefined ? vmag.toFixed(2) : "—";

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
      } catch { /* fallback */ }

      setClickedStar({ name, identifier, magnitude: magStr, ra: raStr, dec: decStr });
    } catch (e) {
      console.warn("Error reading star info:", e);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (initGuardRef.current) return;
    initGuardRef.current = true;

    setEngineLoaded(false);
    setEngineError(null);
    setLoadingProgress(0);
    setTargetFound(false);
    setStarReady(false);
    setClickedStar(null);
    stelRef.current = null;
    prefindRequestedRef.current = null;

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

    const timeoutId = setTimeout(() => {
      if (!stelRef.current) {
        clearInterval(progressInterval);
        setEngineError("استغرق تحميل المحرك وقتاً طويلاً. حاول مرة أخرى.");
      }
    }, ENGINE_TIMEOUT_MS);

    const script = document.createElement("script");
    script.src = "/stellarium-web-engine.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.StelWebEngine !== "function") {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
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
            clearTimeout(timeoutId);
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

              // Listen for star clicks/selections
              stel.change((obj: any, attr: string) => {
                if (attr === "selection" && core.selection) {
                  handleStarSelected(stel, core.selection);
                }
              });

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
            clearTimeout(timeoutId);
            setEngineError("تعذّر تهيئة محرك النجوم.");
          },
        });
      } catch (e: any) {
        clearInterval(progressInterval);
        clearTimeout(timeoutId);
        setEngineError(e.message || "خطأ غير متوقع");
      }
    };

    script.onerror = () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      setEngineError("تعذّر تحميل ملف stellarium-web-engine.js");
    };

    document.body.appendChild(script);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", resize);
      if (script.parentNode) script.parentNode.removeChild(script);
      initGuardRef.current = false;
    };
  }, [engineKey, handleStarSelected]);

  const prefindStar = useCallback((stel: any, starId: string) => {
    const core = stel.core;
    const formattedId = starId.replace(/([A-Za-z]+)(\d+)/, "$1 $2");

    const trySearch = (attempts: number) => {
      if (attempts <= 0) {
        console.warn("⚠️ Could not find star:", starId);
        setStarReady(true);
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

  useEffect(() => {
    const targetId = options.targetStarId;
    const stel = stelRef.current;

    if (!stel) return;
    if (!targetId) {
      setStarReady(true);
      return;
    }

    if (prefindRequestedRef.current === targetId) return;

    prefindRequestedRef.current = targetId;
    setStarReady(false);
    prefindStar(stel, targetId);
  }, [options.targetStarId, prefindStar]);

  const cinematicZoomToStar = useCallback((targetFovDeg = 0.5, durationMs = 3000) => {
    const core = stelRef.current?.core;
    if (!core) return;

    const startFov = core.fov;
    const endFov = (targetFovDeg * Math.PI) / 180;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

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

  const dismissClickedStar = useCallback(() => {
    setClickedStar(null);
  }, []);

  return {
    stelRef,
    engineLoaded,
    engineError,
    loadingProgress,
    targetFound,
    starReady,
    goToStar,
    cinematicZoomToStar,
    clickedStar,
    dismissClickedStar,
  };
}
