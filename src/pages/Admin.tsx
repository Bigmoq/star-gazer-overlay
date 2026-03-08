import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AdminAuth from "@/components/AdminAuth";
import RegisterDrawer from "@/components/RegisterDrawer";
import StarsListPanel from "@/components/StarsListPanel";
import EditStarDialog from "@/components/EditStarDialog";
import { Star, List, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllStars, deleteStar, type StarRecord } from "@/lib/starStore";
import { seedDemoStars } from "@/lib/seedDemo";
import { toast } from "@/hooks/use-toast";

const STELLARIUM_BASE = "https://stellarium-web.org/";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [stars, setStars] = useState<StarRecord[]>([]);
  const [stellariumUrl, setStellariumUrl] = useState(STELLARIUM_BASE);
  const [iframeKey, setIframeKey] = useState(0);
  const [showList, setShowList] = useState(false);
  const [editingStar, setEditingStar] = useState<StarRecord | null>(null);

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

  const handleNavigate = (url: string) => {
    setStellariumUrl(url);
    setIframeKey((k) => k + 1);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الرمز" });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Fullscreen Stellarium */}
      <iframe
        key={iframeKey}
        src={stellariumUrl}
        title="Stellarium Web"
        className="absolute inset-0 w-full h-full border-none"
        allow="fullscreen"
      />

      {/* Top bar - floating */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center justify-between p-4 pointer-events-auto" dir="rtl">
          <div className="flex items-center gap-2 glass-panel rounded-xl px-4 py-2">
            <Star className="w-5 h-5 text-star-glow fill-star-glow" />
            <span className="font-display font-bold text-foreground text-sm">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowList(true)}
              className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 gap-1.5"
            >
              <List className="w-4 h-4" />
              النجوم ({stars.length})
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="glass-panel border-glass-border/40 text-foreground hover:bg-secondary/60 h-9 w-9"
              title="تسجيل خروج"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Register drawer (FAB + side panel) */}
      <RegisterDrawer
        onRegistered={refreshStars}
        onNavigate={handleNavigate}
      />

      {/* Stars list panel */}
      <StarsListPanel
        stars={stars}
        open={showList}
        onClose={() => setShowList(false)}
        onEdit={(s) => { setShowList(false); setEditingStar(s); }}
        onDelete={handleDelete}
        onView={handleNavigate}
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
