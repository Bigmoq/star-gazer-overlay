import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateStar, type StarRecord } from "@/lib/starStore";
import { toast } from "@/hooks/use-toast";

interface EditStarDialogProps {
  star: StarRecord;
  onClose: () => void;
  onUpdated: () => void;
}

const EditStarDialog = ({ star, onClose, onUpdated }: EditStarDialogProps) => {
  const [form, setForm] = useState({
    customName: star.customName,
    originalName: star.originalName,
    message: star.message,
    date: star.date,
    magnitude: String(star.magnitude || ""),
    distance: star.distance,
    spectralClass: star.spectralClass,
    constellation: star.constellation,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStar(star.id, {
        customName: form.customName,
        originalName: form.originalName,
        message: form.message,
        date: form.date,
        magnitude: parseFloat(form.magnitude) || 0,
        distance: form.distance,
        spectralClass: form.spectralClass,
        constellation: form.constellation,
      });
      toast({ title: "تم تحديث بيانات النجم ✨" });
      onUpdated();
      onClose();
    } catch {
      toast({ title: "خطأ في التحديث", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">تعديل النجم</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground font-body bg-secondary/40 rounded-lg px-3 py-2" dir="ltr">
          {star.code}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-body">اسم العميل</label>
            <Input value={form.customName} onChange={(e) => setForm({ ...form, customName: e.target.value })} className="bg-secondary/50 border-glass-border/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-body">الرسالة</label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-secondary/50 border-glass-border/40 min-h-[60px] text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-body">التاريخ</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-secondary/50 border-glass-border/40" dir="ltr" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-body">الاسم الأصلي</label>
            <Input value={form.originalName} onChange={(e) => setForm({ ...form, originalName: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-body">السطوع</label>
              <Input value={form.magnitude} onChange={(e) => setForm({ ...form, magnitude: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-body">المسافة</label>
              <Input value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className="bg-secondary/50 border-glass-border/40 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-body">الفئة الطيفية</label>
              <Input value={form.spectralClass} onChange={(e) => setForm({ ...form, spectralClass: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-body">الكوكبة</label>
              <Input value={form.constellation} onChange={(e) => setForm({ ...form, constellation: e.target.value })} dir="ltr" className="bg-secondary/50 border-glass-border/40 text-sm" />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving || !form.customName} className="w-full h-11 font-display gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التعديلات
        </Button>
      </motion.div>
    </div>
  );
};

export default EditStarDialog;
