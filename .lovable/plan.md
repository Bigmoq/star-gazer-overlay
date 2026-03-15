

## خطة: تحسين تجربة عرض النجوم (3 ميزات)

### الميزات المطلوبة

**1. توسيط تلقائي + تكبير عند البحث/الاختيار**
حالياً `prefindStar` في `useStellariumEngine.ts` يبحث عن النجم ويضبط `core.selection` و `core.lock` لكن لا يقوم بتكبير تلقائي. سنضيف استدعاء `cinematicZoomToStar` تلقائياً بعد نجاح البحث، بحيث يتم التوسيط والتكبير بشكل سينمائي فوري.

**ملف:** `src/hooks/useStellariumEngine.ts`
- في `prefindStar`، بعد `core.selection = obj` و `core.lock = obj`، استدعاء zoom تلقائي
- إضافة خيار `autoZoomOnFind` لـ `UseEngineOptions` (افتراضي `true`)
- نفس الشيء لـ fallback بالإحداثيات: بعد `core.lookat` نقوم بتكبير FOV

**2. عرض البيانات العلمية (القدر، المطلع المستقيم، الميل)**
`StarInfoPanel` يعرض فعلاً magnitude/distance/spectralClass/constellation لكن لا يعرض RA/Dec. سنضيفهما.

**ملف:** `src/components/StarInfoPanel.tsx`
- إضافة حقلي `ra` و `dec` لـ `StarData` interface
- إضافة DataRow للمطلع المستقيم والميل بأيقونات Compass و Sun

**ملف:** `src/pages/StarView.tsx`
- تمرير `ra` و `dec` من بيانات النجم المخزنة (حساب من `raRad`/`decRad` → تنسيق HMS/DMS)

**3. قصة أسطورية حتمية لكل نجم**
إضافة مصفوفة الـ 40 قصة + دالة hash حتمية تحسب index ثابت من اسم النجم.

**ملف جديد:** `src/lib/starStories.ts`
- مصفوفة `starStories` (40 قصة)
- دالة `getStarStory(nameOrId: string): string` تحسب hash بسيط من أحرف الاسم ثم `% 40`

**ملف:** `src/components/StarInfoPanel.tsx`
- إضافة قسم "حكاية النجم" أسفل البيانات العلمية مع أيقونة BookOpen
- استدعاء `getStarStory(star.originalName || star.customName)`

**ملف:** `src/components/ClickedStarPanel.tsx`
- إضافة نفس القصة عند النقر على نجم من الخريطة

### الملفات المتأثرة
- `src/hooks/useStellariumEngine.ts` — auto-zoom بعد البحث
- `src/lib/starStories.ts` — ملف جديد (مصفوفة + hash)
- `src/components/StarInfoPanel.tsx` — إضافة RA/Dec + قصة
- `src/components/ClickedStarPanel.tsx` — إضافة قصة
- `src/pages/StarView.tsx` — تمرير RA/Dec محسوبة

