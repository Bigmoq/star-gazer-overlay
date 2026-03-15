

## خطة: إضافة ميزة البحث عن النجوم في StellariumNative

### التغييرات على ملف واحد: `src/pages/StellariumNative.tsx`

**1. إضافة `Search` للـ imports** (سطر 3)
- إضافة `Search` لقائمة أيقونات lucide-react

**2. إضافة states جديدة** (بعد سطر 79 — بعد `dssOpacity`)
```typescript
const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [searchError, setSearchError] = useState<string | null>(null);
const [isSearching, setIsSearching] = useState(false);
```

**3. إضافة `handleSearch` callback** (بعد `handleStarSelected` — بعد سطر 456)
- يجرب 4 طرق للبحث: `core.getObj`, `core.getObjByName`, `stel.getObj`, `stel.getObjByNSID`
- يجرب 4 طرق للتنقل: `pointAndLock`, `lookat`, `zoomTo`, أو selection فقط
- يطبع الـ methods المتاحة في Console إذا فشل البحث
- يستدعي `handleStarSelected` لعرض بيانات النجم في الـ sidebar

**4. إضافة زر البحث** في Top Controls (سطر 617 — بجانب زر القائمة)
- زر `Search` بنفس تصميم زر القائمة

**5. إضافة نافذة البحث** (قبل `{/* ─── Hint ─── */}` — سطر 737)
- Modal مع input + أزرار اقتراحات سريعة (Sirius, Vega, Betelgeuse, M42, Jupiter, Polaris, Antares, Aldebaran)
- رسائل خطأ واضحة + حالة تحميل
- إغلاق بالنقر خارج النافذة

### ملاحظات تقنية
- الكود يطبع `Available core methods` و `Available stel methods` عند فشل البحث — هذا للتشخيص ومعرفة أي API يدعمها الـ WASM build
- النافذة تستخدم `autoFocus` على الـ input
- الـ search modal يستخدم `AnimatePresence` + `motion.div` لتحريك سلس

