import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Save, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addStar, findByCode } from "@/lib/starStore";
import { fetchStarData } from "@/lib/stellariumParser";
import { toast } from "@/hooks/use-toast";
import type { ClickedStarInfo } from "@/hooks/useStellariumEngine";

interface Props {
  star: ClickedStarInfo;
  onClose: () => void;
  onRegistered: () => void;
}

const AdminRegisterPanel = ({ star, onClose, onRegistered }: Props) => {
  const code = star.identifier || star.name.replace(/\s+/g, "");
  const stellariumUrl = `https://stellarium-web.org/skysource/${code}?fov=0.5`;

  const [customName, setCustomName] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedCode, setSavedCode] = useState("");

  // Enriched metadata (from engine + SIMBAD fallback)
  const [distance, setDistance] = useState(star.distance || "");
  const [spectralClass, setSpectralClass] = useState(star.spectralClass || "");
  const [constellation, setConstellation] = useState(star.constellation || "");

  useEffect(() => {
    setAlreadyExists(false);
    setSaved(false);
    setCustomName("");
    setMessage("");
    setDistance(star.distance || "");
    setSpectralClass(star.spectralClass || "");
    setConstellation(star.constellation || "");

    findByCode(code).then((existing) => {
      if (existing) setAlreadyExists(true);
    });

    // SIMBAD fallback if engine didn't provide metadata
    if (!star.distance || !star.spectralClass) {
      fetchStarData(code).then((simbad) => {
        if (simbad) {
          if (!star.distance && simbad.magnitude) {
            // SIMBAD doesn't directly give distance, but we use what we can
          }
          if (!star.spectralClass && simbad.spectralClass) {
            setSpectralClass(simbad.spectralClass);
          }
        }
      }).catch(() => {});
    }
  }, [code, star.distance, star.spectralClass]);

  const handleSave = async () => {
    if (!customName.trim()) {
      toast({ title: "أدخل اسم الشخص", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addStar({
        code,
        customName: customName.trim(),
        originalName: star.name,
        message: message.trim(),
        date,
        magnitude: parseFloat(star.magnitude) || 0,
        distance,
        spectralClass,
        constellation,
        stellariumUrl,
        raRad: star.raRad || null,
        decRad: star.decRad || null,
      });
      setSavedCode(code);
      setSaved(true);
      onRegistered();
      toast({ title: "تم تسجيل النجم بنجاح ✨" });
    } catch (e: any) {
      toast({ title: "خطأ في التسجيل", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(savedCode);
    toast({ title: "تم نسخ الرمز" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="absolute top-0 right-0 bottom-0 z-30 w-[min(90vw,380px)] flex flex-col"
      dir="rtl"
    >
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{
          background: "hsl(var(--background) / 0.75)",
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          borderLeft: "1px solid hsl(var(--foreground) / 0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-foreground text-sm">تسجيل نجم</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="w-8 h-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-5">
          {/* Star info (auto-filled) */}
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: "hsl(var(--secondary) / 0.4)", border: "1px solid hsl(var(--foreground) / 0.05)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-body">بيانات النجم (تلقائي)</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">الاسم</span>
                <span className="text-foreground font-medium" dir="ltr">{star.name}</span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">المعرّف</span>
                <span className="text-foreground font-medium" dir="ltr">{code}</span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">القدر</span>
                <span className="text-foreground font-medium" dir="ltr">{star.magnitude}</span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">RA</span>
                <span className="text-foreground font-medium" dir="ltr">{star.ra}</span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-muted-foreground">Dec</span>
                <span className="text-foreground font-medium" dir="ltr">{star.dec}</span>
              </div>
            </div>
          </div>

          {alreadyExists && !saved && (
            <div
              className="rounded-lg p-3 text-xs font-body text-center"
              style={{ background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))" }}
            >
              ⚠️ هذا النجم مسجّل مسبقاً بالرمز <strong dir="ltr">{code}</strong>
            </div>
          )}

          {saved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center py-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.15)" }}>
                <Check className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-lg">تم التسجيل ✨</p>
                <p className="text-sm text-muted-foreground font-body mt-1">رمز النجم:</p>
              </div>
              <button
                onClick={copyCode}
                className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-bold text-primary"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}
              >
                <Copy className="w-4 h-4" />
                {savedCode}
              </button>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
                إغلاق
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Customer fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-body text-muted-foreground">اسم الشخص *</Label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="مثال: ساره"
                    className="text-sm font-body bg-secondary/30 border-foreground/10 focus:border-primary/40"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body text-muted-foreground">رسالة الإهداء</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالة جميلة..."
                    rows={3}
                    className="text-sm font-body bg-secondary/30 border-foreground/10 focus:border-primary/40 resize-none"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-body text-muted-foreground">التاريخ</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-sm font-body bg-secondary/30 border-foreground/10 focus:border-primary/40"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Save button */}
              <Button
                onClick={handleSave}
                disabled={saving || alreadyExists || !customName.trim()}
                className="w-full gap-2 font-display"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "جارٍ الحفظ..." : "سجّل النجم"}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminRegisterPanel;
