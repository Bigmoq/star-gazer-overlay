import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Trash2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addStar, getAllStars, deleteStar, type StarRecord } from "@/lib/starStore";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const [stars, setStars] = useState<StarRecord[]>(getAllStars());
  const [form, setForm] = useState({
    code: "",
    customName: "",
    originalName: "",
    message: "",
    date: "",
    magnitude: "",
    distance: "",
    spectralClass: "",
    constellation: "",
    stellariumUrl: "",
  });

  const handleAdd = () => {
    if (!form.code || !form.customName || !form.originalName) {
      toast({ title: "يرجى تعبئة الحقول المطلوبة", variant: "destructive" });
      return;
    }
    addStar({
      code: form.code,
      customName: form.customName,
      originalName: form.originalName,
      message: form.message,
      date: form.date || new Date().toISOString().split("T")[0],
      magnitude: parseFloat(form.magnitude) || 0,
      distance: form.distance,
      spectralClass: form.spectralClass,
      constellation: form.constellation,
      stellariumUrl: form.stellariumUrl || "https://stellarium-web.org/",
    });
    setStars(getAllStars());
    setForm({ code: "", customName: "", originalName: "", message: "", date: "", magnitude: "", distance: "", spectralClass: "", constellation: "", stellariumUrl: "" });
    toast({ title: "تم تسجيل النجم بنجاح ✨" });
  };

  const handleDelete = (id: string) => {
    deleteStar(id);
    setStars(getAllStars());
    toast({ title: "تم الحذف" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "تم نسخ الرمز" });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-8 h-8 text-star-glow star-icon-glow fill-star-glow" />
            <h1 className="text-3xl font-display font-bold text-foreground">لوحة تسجيل النجوم</h1>
          </div>
          <p className="text-muted-foreground font-body">أضف نجوم جديدة للعملاء</p>
        </motion.div>

        {/* Add form */}
        <div className="glass-panel rounded-2xl p-6 mb-8 space-y-4">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5" /> تسجيل نجم جديد
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">رمز النجم (الكود) *</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="HD12323" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">الاسم المخصص *</label>
              <Input value={form.customName} onChange={(e) => setForm({ ...form, customName: e.target.value })} placeholder="لمى" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">اسم النجم الأصلي *</label>
              <Input value={form.originalName} onChange={(e) => setForm({ ...form, originalName: e.target.value })} placeholder="Epsilon Persei" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">التاريخ</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/50 border-glass-border/40" dir="ltr" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">السطوع (Magnitude)</label>
              <Input value={form.magnitude} onChange={(e) => setForm({ ...form, magnitude: e.target.value })} placeholder="2.88" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">المسافة</label>
              <Input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="540 سنة ضوئية" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">الفئة الطيفية</label>
              <Input value={form.spectralClass} onChange={(e) => setForm({ ...form, spectralClass: e.target.value })} placeholder="B0.5 III" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-body mb-1 block">الكوكبة</label>
              <Input value={form.constellation} onChange={(e) => setForm({ ...form, constellation: e.target.value })} placeholder="Perseus" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground font-body mb-1 block">رابط Stellarium</label>
            <Input value={form.stellariumUrl} onChange={(e) => setForm({ ...form, stellariumUrl: e.target.value })} placeholder="https://stellarium-web.org/skysource/EpsilonPersei" dir="ltr" className="bg-secondary/50 border-glass-border/40" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground font-body mb-1 block">الرسالة الشخصية</label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="نجمة مميزة لشخص مميز ✨" className="bg-secondary/50 border-glass-border/40 min-h-[80px]" />
          </div>

          <Button onClick={handleAdd} className="w-full h-11 font-display text-base gap-2">
            <Star className="w-4 h-4" /> سجّل النجم
          </Button>
        </div>

        {/* Stars list */}
        <div className="space-y-3">
          <h2 className="text-lg font-display font-semibold text-foreground">النجوم المسجلة ({stars.length})</h2>
          {stars.map((star) => (
            <div key={star.id} className="glass-panel rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-star-glow fill-star-glow shrink-0" />
                  <span className="font-display font-semibold text-foreground">{star.customName}</span>
                  <span className="text-xs text-muted-foreground font-body">({star.originalName})</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                  <span dir="ltr" className="bg-secondary/60 px-2 py-0.5 rounded">{star.code}</span>
                  <span>{star.date}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => copyCode(star.code)} title="نسخ الرمز">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(star.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
