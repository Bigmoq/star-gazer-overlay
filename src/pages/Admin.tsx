import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminAuth from "@/components/AdminAuth";
import { Star, Plus, Trash2, Copy, ExternalLink, Loader2, ChevronDown, ChevronUp, Telescope, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addStar, getAllStars, deleteStar, type StarRecord } from "@/lib/starStore";
import { extractStarIdFromUrl, fetchStarData } from "@/lib/stellariumParser";
import { toast } from "@/hooks/use-toast";
import EditStarDialog from "@/components/EditStarDialog";

const STELLARIUM_BASE = "https://stellarium-web.org/";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [stars, setStars] = useState<StarRecord[]>([]);
  const [stellariumUrl, setStellariumUrl] = useState(STELLARIUM_BASE);
  const [iframeKey, setIframeKey] = useState(0);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStar, setEditingStar] = useState<StarRecord | null>(null);

  const [form, setForm] = useState({
    pastedUrl: "", code: "", customName: "", originalName: "", message: "", date: "", magnitude: "", distance: "", spectralClass: "", constellation: "", stellariumUrl: "",
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (authenticated) {
      getAllStars().then(setStars);
    }
  }, [authenticated]);

  const handleUrlPaste = useCallback(async (url: string) => {
    setForm((f) => ({ ...f, pastedUrl: url }));
    const starId = extractStarIdFromUrl(url);
    if (!starId) return;
    const fullUrl = url.includes("fov=") ? url : url + (url.includes("?") ? "&" : "?") + "fov=0.5";
    setStellariumUrl(fullUrl);
    setIframeKey((k) => k + 1);
    setForm((f) => ({ ...f, pastedUrl: url, code: starId, stellariumUrl: fullUrl }));
    setLoading(true);
    try {
      const data = await fetchStarData(starId);
      if (data) {
        setForm((f) => ({ ...f, originalName: data.originalName || f.originalName, magnitude: data.magnitude ? String(data.magnitude) : f.magnitude, spectralClass: data.spectralClass || f.spectralClass }));
        toast({ title: "تم جلب بيانات النجم تلقائياً ✨" });
      } else {
        toast({ title: "لم يتم العثور على بيانات - أدخلها يدوياً", variant: "destructive" });
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const handleAdd = async () => {
    if (!form.code || !form.customName) {
      toast({ title: "يرجى تعبئة الاسم المخصص ورمز النجم", variant: "destructive" });
      return;
    }
    try {
      await addStar({
        code: form.code, customName: form.customName, originalName: form.originalName || form.code,
        message: form.message, date: form.date || new Date().toISOString().split("T")[0],
        magnitude: parseFloat(form.magnitude) || 0, distance: form.distance,
        spectralClass: form.spectralClass, constellation: form.constellation,
        stellariumUrl: form.stellariumUrl || STELLARIUM_BASE,
      });
      setStars(await getAllStars());
      setForm({ pastedUrl: "", code: "", customName: "", originalName: "", message: "", date: "", magnitude: "", distance: "", spectralClass: "", constellation: "", stellariumUrl: "" });
      toast({ title: "تم تسجيل النجم بنجاح ✨" });
    } catch (e: any) {
      toast({ title: "خطأ في التسجيل", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteStar(id);
    setStars(await getAllStars());
    toast({ title: "تم الحذف" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الرمز" });
  };

  if (!authenticated) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="border-b border-border/50 px-4 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-star-glow star-icon-glow fill-star-glow" />
            <h1 className="text-xl font-display font-bold text-foreground">لوحة تسجيل النجوم</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowList(!showList)} className="text-muted-foreground gap-1">
            النجوم ({stars.length})
            {showList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-57px)]">
        <div className="flex-1 relative min-h-[300px] lg:min-h-0">
          <iframe ref={iframeRef} key={iframeKey} src={stellariumUrl} title="Stellarium Web" className="w-full h-full border-none" allow="fullscreen" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4 right-4 pointer-events-none">
            <div className="glass-panel rounded-xl px-4 py-2 text-xs text-muted-foreground font-body text-center pointer-events-auto">
              <Telescope className="w-3.5 h-3.5 inline-block ml-1" />
              تصفح السماء واختر نجماً، ثم انسخ الرابط من المتصفح والصقه في الحقل بالأسفل
            </div>
          </motion.div>
        </div>

        <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-r border-border/50 overflow-y-auto">
          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">1</div>
                <label className="text-sm font-display font-semibold text-foreground">رابط النجم من Stellarium</label>
              </div>
              <div className="relative">
                <Input value={form.pastedUrl} onChange={(e) => handleUrlPaste(e.target.value)} placeholder="https://stellarium-web.org/skysource/SAO1818" dir="ltr" className="bg-secondary/50 border-glass-border/40 pr-10 text-xs" />
                {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
              </div>
              {form.code && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-primary font-body">
                  ✓ تم التعرف على النجم: <span dir="ltr" className="font-medium">{form.code}</span>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">2</div>
                <label className="text-sm font-display font-semibold text-foreground">اسم العميل</label>
              </div>
              <Input value={form.customName} onChange={(e) => setForm({ ...form, customName: e.target.value })} placeholder="مثال: ساره" className="bg-secondary/50 border-glass-border/40" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">3</div>
                <label className="text-sm font-display font-semibold text-foreground">الرسالة والتاريخ</label>
              </div>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="نجمة مميزة لشخص مميز ✨" className="bg-secondary/50 border-glass-border/40 min-h-[70px] text-sm" />
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/50 border-glass-border/40" dir="ltr" />
            </div>

            <details className="group">
              <summary className="text-xs text-muted-foreground font-body cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                بيانات إضافية (تم جلبها تلقائياً)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block font-body">الاسم الأصلي</label>
                  <Input value={form.originalName} onChange={(e) => setForm({ ...form, originalName: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block font-body">السطوع</label><Input value={form.magnitude} onChange={(e) => setForm({ ...form, magnitude: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block font-body">المسافة</label><Input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="bg-secondary/50 border-glass-border/40 text-sm" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground mb-1 block font-body">الفئة الطيفية</label><Input value={form.spectralClass} onChange={(e) => setForm({ ...form, spectralClass: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" /></div>
                  <div><label className="text-xs text-muted-foreground mb-1 block font-body">الكوكبة</label><Input value={form.constellation} onChange={(e) => setForm({ ...form, constellation: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" /></div>
                </div>
              </div>
            </details>

            <Button onClick={handleAdd} className="w-full h-11 font-display text-base gap-2" disabled={!form.code || !form.customName}>
              <Star className="w-4 h-4" /> سجّل النجم
            </Button>
          </div>

          <AnimatePresence>
            {showList && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/50 overflow-hidden">
                <div className="p-5 space-y-3">
                  <h2 className="text-sm font-display font-semibold text-foreground">النجوم المسجلة ({stars.length})</h2>
                  {stars.map((s) => (
                    <div key={s.id} className="glass-panel rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Star className="w-3.5 h-3.5 text-star-glow fill-star-glow shrink-0" />
                          <span className="font-display font-semibold text-foreground text-sm">{s.customName}</span>
                          <span className="text-[10px] text-muted-foreground font-body">({s.originalName})</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                          <span dir="ltr" className="bg-secondary/60 px-1.5 py-0.5 rounded">{s.code}</span>
                          <span>{s.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingStar(s)} title="تعديل"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCode(s.code)} title="نسخ الرمز"><Copy className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setStellariumUrl(s.stellariumUrl); setIframeKey((k) => k + 1); }} title="عرض في الخريطة"><ExternalLink className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Admin;
