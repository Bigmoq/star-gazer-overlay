const IframeMask = () => {
  return (
    <>
      {/* Top - fully opaque strip then smooth fade */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 80,
          background: "linear-gradient(to bottom, hsl(220 20% 4%) 50%, hsl(220 20% 4% / 0.7) 75%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Bottom - covers cookie banner + toolbar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 220,
          background: "linear-gradient(to top, hsl(220 20% 4%) 50%, hsl(220 20% 4% / 0.5) 72%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Left - fully opaque up to 320px, then smooth fade */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 450,
          background: "linear-gradient(to right, hsl(220 20% 4%) 0%, hsl(220 20% 4%) 65%, hsl(220 20% 4% / 0.7) 82%, hsl(220 20% 4% / 0.2) 92%, transparent 100%)",
          pointerEvents: "auto",
        }}
      />
    </>
  );
};

export default IframeMask;
