import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, X, ChevronDown, AlertTriangle, Check, ClipboardPaste } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addStar, findByCode, type StarRecord } from "@/lib/starStore";
import { extractStarIdFromUrl, fetchStarData } from "@/lib/stellariumParser";
import { toast } from "@/hooks/use-toast";

interface RegisterDrawerProps {
  onRegistered: () => void;
  onNavigate: (url: string) => void;
}

const RegisterDrawer = ({ onRegistered, onNavigate }: RegisterDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"paste" | "form" | "success">("paste");
  const [loading, setLoading] = useState(false);
  const [taken, setTaken] = useState(false);
  const [takenBy, setTakenBy] = useState("");
  const [pasteValue, setPasteValue] = useState("");

  const [form, setForm] = useState({
    code: "",
    customName: "",
    originalName: "",
    message: "",
    date: new Date().toISOString().split("T")[0],
    magnitude: "",
    distance: "",
    spectralClass: "",
    constellation: "",
    stellariumUrl: "",
  });

  const reset = () => {
    setStep("paste");
    setPasteValue("");
    setTaken(false);
    setTakenBy("");
    setForm({
      code: "", customName: "", originalName: "", message: "",
      date: new Date().toISOString().split("T")[0], magnitude: "",
      distance: "", spectralClass: "", constellation: "", stellariumUrl: "",
    });
  };

  const handlePaste = useCallback(async (url: string) => {
    setPasteValue(url);
    const starId = extractStarIdFromUrl(url);
    if (!starId) return;

    const fullUrl = url.includes("fov=") ? url : url + (url.includes("?") ? "&" : "?") + "fov=0.5";
    onNavigate(fullUrl);

    setLoading(true);
    setTaken(false);

    // Check if star is already taken
    const existing = await findByCode(starId);
    if (existing) {
      setTaken(true);
      setTakenBy(existing.customName);
      setLoading(false);
      return;
    }

    // Fetch star data
    setForm((f) => ({ ...f, code: starId, stellariumUrl: fullUrl }));

    try {
      const data = await fetchStarData(starId);
      if (data) {
        setForm((f) => ({
          ...f,
          originalName: data.originalName || starId,
          magnitude: data.magnitude ? String(data.magnitude) : "",
          spectralClass: data.spectralClass || "",
        }));
      }
    } catch { /* silent */ }

    setLoading(false);
    setStep("form");
  }, [onNavigate]);

  const handleRegister = async () => {
    if (!form.code || !form.customName) {
      toast({ title: "يرجى تعبئة اسم الشخص", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await addStar({
        code: form.code,
        customName: form.customName,
        originalName: form.originalName || form.code,
        message: form.message,
        date: form.date,
        magnitude: parseFloat(form.magnitude) || 0,
        distance: form.distance,
        spectralClass: form.spectralClass,
        constellation: form.constellation,
        stellariumUrl: form.stellariumUrl,
      });
      setStep("success");
      onRegistered();
      toast({ title: `تم تسجيل النجم باسم ${form.customName} ✨` });
    } catch (e: any) {
      toast({ title: "خطأ في التسجيل", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Auto-read clipboard when opening
  const handleOpen = async () => {
    setOpen(true);
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.includes("stellarium-web.org") || text.includes("skysource"))) {
        await handlePaste(text);
      }
    } catch {
      // Clipboard permission denied - user will paste manually
    }
  };

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: [0, 1, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            className="text-xs font-body text-foreground/70 glass-panel rounded-lg px-3 py-1.5 pointer-events-none"
          >
            اختر نجماً ثم اضغط هنا ⭐
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            title="تسجيل نجم جديد"
          >
            <Star className="w-6 h-6 fill-current" />
          </motion.button>
        </motion.div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); reset(); }}
              className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50 overflow-y-auto"
              dir="rtl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-star-glow fill-star-glow" />
                  <h2 className="font-display font-bold text-foreground">
                    {step === "paste" && "تسجيل نجم جديد"}
                    {step === "form" && "بيانات الإهداء"}
                    {step === "success" && "تم التسجيل!"}
                  </h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setOpen(false); reset(); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-5">
                {/* Step: Paste URL */}
                {step === "paste" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="glass-panel rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-display font-semibold text-foreground">
                        <ClipboardPaste className="w-4 h-4 text-primary" />
                        الصق رابط النجم من Stellarium
                      </div>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">
                        تصفح السماء في الخريطة، اضغط على نجم، ثم انسخ الرابط من شريط العنوان في Stellarium والصقه هنا
                      </p>
                      <div className="relative">
                        <Input
                          value={pasteValue}
                          onChange={(e) => handlePaste(e.target.value)}
                          placeholder="https://stellarium-web.org/skysource/..."
                          dir="ltr"
                          className="bg-secondary/50 border-glass-border/40 text-xs h-11"
                          autoFocus
                        />
                        {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                      </div>
                    </div>

                    {/* Star taken warning */}
                    <AnimatePresence>
                      {taken && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-2"
                        >
                          <div className="flex items-center gap-2 text-sm font-display font-semibold text-destructive">
                            <AlertTriangle className="w-4 h-4" />
                            هذا النجم مسجّل بالفعل!
                          </div>
                          <p className="text-xs text-destructive/80 font-body">
                            تم تسجيل هذا النجم باسم <strong>{takenBy}</strong>. اختر نجماً آخر.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => { setPasteValue(""); setTaken(false); }}
                          >
                            اختيار نجم آخر
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Step: Registration form */}
                {step === "form" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Star info badge */}
                    <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-star-glow fill-star-glow" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-display font-semibold text-foreground" dir="ltr">{form.code}</div>
                        <div className="text-[10px] text-muted-foreground font-body truncate" dir="ltr">
                          {form.originalName || "جاري جلب البيانات..."}
                          {form.magnitude && ` • mag ${form.magnitude}`}
                          {form.spectralClass && ` • ${form.spectralClass}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs mr-auto shrink-0"
                        onClick={reset}
                      >
                        تغيير
                      </Button>
                    </div>

                    {/* Person info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                          اسم الشخص <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={form.customName}
                          onChange={(e) => setForm({ ...form, customName: e.target.value })}
                          placeholder="مثال: ساره"
                          className="bg-secondary/50 border-glass-border/40 h-11"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                          رسالة الإهداء
                        </label>
                        <Textarea
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          placeholder="نجمة مميزة لشخص مميز ✨"
                          className="bg-secondary/50 border-glass-border/40 min-h-[80px] text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-display font-semibold text-foreground mb-1.5 block">
                          تاريخ الإهداء
                        </label>
                        <Input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="bg-secondary/50 border-glass-border/40 h-11"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Extra data (collapsible) */}
                    <details className="group">
                      <summary className="text-xs text-muted-foreground font-body cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                        بيانات إضافية
                      </summary>
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block font-body">المسافة</label>
                            <Input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="bg-secondary/50 border-glass-border/40 text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block font-body">الكوكبة</label>
                            <Input value={form.constellation} onChange={(e) => setForm({ ...form, constellation: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Submit */}
                    <Button
                      onClick={handleRegister}
                      disabled={loading || !form.customName}
                      className="w-full h-12 font-display text-base gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                      سجّل النجم
                    </Button>
                  </motion.div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-5 py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto"
                    >
                      <Check className="w-8 h-8 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-foreground mb-1">تم تسجيل النجم!</h3>
                      <p className="text-sm text-muted-foreground font-body">
                        تم تسجيل <strong dir="ltr">{form.code}</strong> باسم <strong>{form.customName}</strong>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Button onClick={reset} className="w-full font-display gap-2">
                        <Star className="w-4 h-4" />
                        تسجيل نجم آخر
                      </Button>
                      <Button variant="outline" onClick={() => { setOpen(false); reset(); }} className="w-full font-display">
                        إغلاق
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RegisterDrawer;
