

## خطة: إصلاح بيانات النجم التلقائية والتوجيه الدقيق

### المشكلتان

1. **بيانات ناقصة عند التسجيل**: `AdminRegisterPanel` يحفظ `distance`, `spectralClass`, `constellation` كنصوص فارغة لأن `ClickedStarInfo` لا يحتوي عليها.
2. **التوجيه غير دقيق**: `prefindStar` يبحث بالاسم فقط (مثل `HD 29139`) وقد لا يجده في كتالوج المحرك. لا يوجد fallback بالإحداثيات.

### الحل

#### 1. توسيع `ClickedStarInfo` واستخراج بيانات إضافية من المحرك
**ملف:** `src/hooks/useStellariumEngine.ts`

- إضافة حقول جديدة لـ `ClickedStarInfo`: `distance`, `spectralClass`, `constellation`, `raRad`, `decRad`
- في `handleStarSelected`، استخدام `obj.getInfo()` لاستخراج:
  - `distance` من `obj.getInfo("distance")` (بالفرسخ الفلكي → تحويل لسنة ضوئية)
  - `spectralClass` من `obj.getInfo("spect-type")`
  - `constellation` من `obj.getInfo("constellation")` أو `obj.getInfo("cst")`
  - `raRad` / `decRad` (الإحداثيات بالراديان) للحفظ في قاعدة البيانات

#### 2. حفظ البيانات الكاملة عند التسجيل
**ملف:** `src/components/AdminRegisterPanel.tsx`

- تمرير `distance`, `spectralClass`, `constellation` من `ClickedStarInfo` إلى `addStar()` بدل النصوص الفارغة

#### 3. إضافة أعمدة RA/Dec لقاعدة البيانات + تحديث StarStore
**Migration**: إضافة `ra_rad` و `dec_rad` (double precision, nullable) لجدول `star_registry`
**ملف:** `src/lib/starStore.ts`
- إضافة `raRad` و `decRad` لـ `StarRecord` و `DbRow`
- تحديث `addStar` لحفظ الإحداثيات

#### 4. التوجيه بالإحداثيات عند فشل البحث بالاسم
**ملف:** `src/hooks/useStellariumEngine.ts`

- إضافة خيار `targetRaDeg` و `targetDecDeg` لـ `UseEngineOptions`
- في `prefindStar`، إذا فشل البحث بالاسم → استخدام `core.lookat()` أو ضبط `core.observer.yaw/pitch` يدوياً للانتقال بالإحداثيات
**ملف:** `src/pages/StarView.tsx`
- تمرير `raRad` و `decRad` من بيانات النجم كـ fallback coordinates

#### 5. جلب بيانات SIMBAD كـ fallback إضافي
**ملف:** `src/components/AdminRegisterPanel.tsx`

- إذا لم يوفر المحرك `distance` أو `spectralClass`، محاولة جلبها من SIMBAD TAP (الدالة `fetchStarData` موجودة فعلاً في `stellariumParser.ts`)

### الملفات المتأثرة
- `src/hooks/useStellariumEngine.ts` — توسيع ClickedStarInfo + navigation بالإحداثيات
- `src/components/AdminRegisterPanel.tsx` — تمرير البيانات الكاملة
- `src/lib/starStore.ts` — إضافة raRad/decRad
- `src/pages/StarView.tsx` — تمرير الإحداثيات للمحرك
- Migration جديدة لإضافة أعمدة ra_rad/dec_rad

