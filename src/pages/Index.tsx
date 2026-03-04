import StarInfoPanel from "@/components/StarInfoPanel";
import StarCenterLabel from "@/components/StarCenterLabel";

const starData = {
  customName: "Sarah's Star",
  originalName: "Epsilon Persei",
  magnitude: 2.88,
  distance: "540 light-years",
  spectralClass: "B0.5 III",
  constellation: "Perseus",
  stellariumUrl: "https://stellarium-web.org/skysource/EpsilonPersei",
};

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Full-screen Stellarium iframe */}
      <iframe
        src={starData.stellariumUrl}
        title="Stellarium Web - Star View"
        className="absolute inset-0 w-full h-full border-none"
        allow="fullscreen"
      />

      {/* Overlay 1: Info Panel */}
      <StarInfoPanel star={starData} />

      {/* Overlay 2: Center Star Label */}
      <StarCenterLabel name={starData.customName} />
    </div>
  );
};

export default Index;
