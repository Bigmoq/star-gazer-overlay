const IframeMask = () => {
  return (
    <>
      {/* Top cover - hides Stellarium navbar */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 55,
          background: "linear-gradient(to bottom, hsl(var(--background)) 70%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Bottom cover - hides toolbar & cookie banner */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 180,
          background: "linear-gradient(to top, hsl(var(--background)) 75%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Left-side: covers sidebar & mobile promo */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 360,
          background: "linear-gradient(to right, hsl(var(--background)) 65%, hsl(var(--background) / 0.9) 85%, transparent)",
          pointerEvents: "auto",
        }}
      />
    </>
  );
};

export default IframeMask;
