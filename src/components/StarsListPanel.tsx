import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trash2, Copy, ExternalLink, Pencil, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type StarRecord } from "@/lib/starStore";

interface StarsListPanelProps {
  stars: StarRecord[];
  open: boolean;
  onClose: () => void;
  onEdit: (star: StarRecord) => void;
  onDelete: (id: string) => void;
  onView: (url: string) => void;
  onCopy: (code: string) => void;
}

const StarsListPanel = ({ stars, open, onClose, onEdit, onDelete, onView, onCopy }: StarsListPanelProps) => {
  const [search, setSearch] = useState("");

  const filtered = stars.filter((s) =>
    s.customName.includes(search) || s.code.toLowerCase().includes(search.toLowerCase()) || s.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-[380px] bg-background/95 backdrop-blur-xl border-r border-border/50 overflow-y-auto"
            dir="rtl"
          >
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-star-glow fill-star-glow" />
                  <h2 className="font-display font-bold text-foreground">النجوم المسجلة ({stars.length})</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الرمز..."
                  className="bg-secondary/50 border-glass-border/40 pr-9 text-sm h-9"
                />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground font-body text-center py-8">لا توجد نتائج</p>
              )}
              {filtered.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-star-glow fill-star-glow shrink-0" />
                    <span className="font-display font-semibold text-foreground text-sm">{s.customName}</span>
                    <span className="text-[10px] text-muted-foreground font-body mr-auto" dir="ltr">{s.code}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-body flex items-center gap-2">
                    <span dir="ltr">{s.originalName}</span>
                    <span>•</span>
                    <span>{s.date}</span>
                  </div>
                  <div className="flex gap-1 pt-1 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => onEdit(s)}>
                      <Pencil className="w-3 h-3" /> تعديل
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => onCopy(s.code)}>
                      <Copy className="w-3 h-3" /> نسخ
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => { onView(s.stellariumUrl); onClose(); }}>
                      <ExternalLink className="w-3 h-3" /> عرض
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onDelete(s.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StarsListPanel;
