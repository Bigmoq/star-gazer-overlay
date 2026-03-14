import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import AdminAuth from "@/components/AdminAuth";
import AdminRegisterPanel from "@/components/AdminRegisterPanel";
import StarsListPanel from "@/components/StarsListPanel";
import EditStarDialog from "@/components/EditStarDialog";
import { Star, List, LogOut, Loader2, Mountain, Sun, Compass, Grid3X3, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllStars, deleteStar, type StarRecord } from "@/lib/starStore";
import { seedDemoStars } from "@/lib/seedDemo";
import { toast } from "@/hooks/use-toast";
import { useStellariumEngine } from "@/hooks/useStellariumEngine";
import { motion } from "framer-motion";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [stars, setStars] = useState<StarRecord[]>([]);
  const [showList, setShowList] = useState(false);
  const [editingStar, setEditingStar] = useState<StarRecord | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [engineKey, setEngineKey] = useState(0);

  // Engine toggles
  const [showConstellations, setShowConstellations] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(false);
  const [showLandscape, setShowLandscape] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showConstellationArt, setShowConstellationArt] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    stelRef,
    engineLoaded,
    engineError,
    loadingProgress,
    clickedStar,
    dismissClickedStar,
  } = useStellariumEngine(canvasRef, {
    initialFov: 120,
    atmosphere: false,
    landscape: true,
    constellations: true,
    key: engineKey,
  });

  // Auto-open register panel when a star is clicked
  useEffect(() => {
    if (clickedStar) {
      setShowRegister(true);
    }
  }, [clickedStar]);

  const refreshStars = async () => {
    setStars(await getAllStars());
  };

  useEffect(() => {
    if (authenticated) {
      getAllStars().then(async (existing) => {
        if (existing.length === 0) {
          await seedDemoStars();
          setStars(await getAllStars());
        } else {
          setStars(existing);
        }
      });
    }
  }, [authenticated]);

  const handleDelete = async (id: string) => {
    await deleteStar(id);
    await refreshStars();
    toast({ title: "تم الحذف" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الرمز" });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    dismissClickedStar();
  };

  // Toggle functions
  const toggleConstellations = useCallback(() => {
    const core = stelRef.current?.core;
    if (core?.constellations) {
      const next = !showConstellations;
      core.constellations.lines_visible = next;
      core.constellations.labels_visible = next;
      setShowConstellations(next);
    }
  }, [showConstellations, stelRef]);

  const toggleAtmosphere = useCallback(() => {
    const core = stelRef.current?.core;
    if (core) {
      const next = !showAtmosphere;
      core.atmosphere.visible = next;
      setShowAtmosphere(next);
    }
  }, [showAtmosphere, stelRef]);

  const toggleLandscape = useCallback(() => {
    const core = stelRef.current?.core;
    if (core?.landscapes) {
      const next = !showLandscape;
      core.landscapes.visible = next;
      setShowLandscape(next);
    }
  }, [showLandscape, stelRef]);

  const toggleGrid = useCallback(() => {
    const core = stelRef.current?.core;
    if (core) {
      const next = !showGrid;
      if (core.lines) core.lines.equatorial_grid = next;
      setShowGrid(next);
    }
  }, [showGrid, stelRef]);

  const toggleConstellationArt = useCallback(() => {
    const core = stelRef.current?.core;
    if (core?.constellations) {
      const next = !showConstellationArt;
      core.constellations.images_visible = next;
      setShowConstellationArt(next);
    }
  }, [showConstellationArt, stelRef]);

  if (!authenticated) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  const toolbarButtons = [
    { icon: Mountain, active: showLandscape, toggle: toggleLandscape, label: "تضاريس" },
    { icon: Sun, active: showAtmosphere, toggle: toggleAtmosphere, label: "غلاف جوي" },
    { icon: Compass, active: showConstellations, toggle: toggleConstellations, label: "أبراج" },
    { icon: PenTool, active: showConstellationArt, toggle: toggleConstellationArt, label: "رسوم" },
    { icon: Grid3X3, active: showGrid, toggle: toggleGrid, label: "شبكة" },
  ];

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-background">
      {/* Fullscreen Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full outline-none"
        tabIndex={0}
      />

      {/* Engine Loading Overlay */}
      <AnimatePresence>
        {!engineLoaded && (
          <motion.div
            key="admin-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <div className="flex flex-col items-center gap-5">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-body text-muted-foreground">جارٍ تحميل المحرك...</p>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--secondary))" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--star-glow)))" }}
                  animate={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              {engineError && (
                <div className="text-center space-y-2">
                  <p className="text-xs text-destructive font-body">{engineError}</p>
                  <Button variant="outline" size="sm" onClick={() => setEngineKey(k => k + 1)}>
                    إعادة المحاولة
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      {engineLoaded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
        >
          <div className="flex items-center justify-between p-3 sm:p-4 pointer-events-auto" dir="rtl">
            <div className="flex items-center gap-2 glass-panel rounded-xl px-3 py-2 sm:px-4">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-star-glow fill-star-glow" />
              <span className="font-display font-bold text-foreground text-xs sm:text-sm">لوحة الإدارة</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowList(true)}
                className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 gap-1.5 text-xs sm:text-sm h-8 sm:h-9"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                النجوم ({stars.length})
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 h-8 w-8 sm:h-9 sm:w-9"
                title="تسجيل خروج"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hint banner */}
      {engineLoaded && !clickedStar && !showRegister && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: 8, times: [0, 0.1, 0.7, 1] }}
          className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-body text-foreground/80 whitespace-nowrap"
            style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(8px)" }}
          >
            انقر على أي نجم لتسجيله باسم شخص 🌟
          </div>
        </motion.div>
      )}

      {/* Bottom toolbar */}
      {engineLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        >
          <div
            className="flex items-center gap-1 px-2 py-1.5 rounded-2xl"
            style={{
              background: "hsl(var(--background) / 0.5)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              border: "1px solid hsl(var(--foreground) / 0.08)",
            }}
          >
            {toolbarButtons.map(({ icon: Icon, active, toggle, label }) => (
              <button
                key={label}
                onClick={toggle}
                title={label}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200"
                style={{
                  background: active ? "hsl(var(--primary) / 0.2)" : "transparent",
                  color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.5)",
                }}
              >
                <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {active && (
                  <div
                    className="absolute bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: "hsl(var(--primary))" }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Register panel (appears on star click) */}
      <AnimatePresence>
        {showRegister && clickedStar && (
          <AdminRegisterPanel
            star={clickedStar}
            onClose={handleCloseRegister}
            onRegistered={refreshStars}
          />
        )}
      </AnimatePresence>

      {/* Stars list panel */}
      <StarsListPanel
        stars={stars}
        open={showList}
        onClose={() => setShowList(false)}
        onEdit={(s) => { setShowList(false); setEditingStar(s); }}
        onDelete={handleDelete}
        onView={() => {}}
        onCopy={copyCode}
      />

      {/* Edit dialog */}
      <AnimatePresence>
        {editingStar && (
          <EditStarDialog
            star={editingStar}
            onClose={() => setEditingStar(null)}
            onUpdated={refreshStars}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
