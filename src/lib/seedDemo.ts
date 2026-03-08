import { supabase } from "./supabaseClient";

// Run once to seed demo data
export async function seedDemoStars() {
  const demoStars = [
    {
      code: "SAO1818",
      custom_name: "ساره",
      original_name: "SAO 1818 (BD+82 324)",
      message: "نجمة مميزة لشخص مميز ✨ كل ما أنظر للسماء أتذكرك",
      date: "2024-12-25",
      magnitude: 10.37,
      distance: "617 سنة ضوئية",
      spectral_class: "F0",
      constellation: "Draco",
      stellarium_url: "https://stellarium-web.org/skysource/SAO1818?fov=0.5",
    },
    {
      code: "HIP11767",
      custom_name: "عبدالله",
      original_name: "Polaris (Alpha Ursae Minoris)",
      message: "مثل نجم القطب، أنت دليلي في كل طريق 🌟",
      date: "2025-01-15",
      magnitude: 1.98,
      distance: "433 سنة ضوئية",
      spectral_class: "F7Ib",
      constellation: "Ursa Minor",
      stellarium_url: "https://stellarium-web.org/skysource/HIP11767?fov=0.5",
    },
    {
      code: "HIP69673",
      custom_name: "لمى",
      original_name: "Arcturus (Alpha Boötis)",
      message: "أسطع نجوم السماء لأغلى إنسانة 💫",
      date: "2025-03-01",
      magnitude: -0.05,
      distance: "36.7 سنة ضوئية",
      spectral_class: "K1.5IIIFe",
      constellation: "Boötes",
      stellarium_url: "https://stellarium-web.org/skysource/HIP69673?fov=0.5",
    },
  ];

  for (const star of demoStars) {
    const { error } = await supabase
      .from("star_registry")
      .upsert(star, { onConflict: "code" });
    if (error) console.error(`Failed to seed ${star.code}:`, error.message);
  }

  console.log("✅ Demo stars seeded!");
}
