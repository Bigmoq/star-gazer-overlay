const IframeMask = () => {
  return (
    <>
      {/* Top edge fade - subtle, just hides the search bar */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 56,
          background: "linear-gradient(to bottom, hsl(220 20% 4%) 40%, hsl(220 20% 4% / 0.6) 70%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Bottom edge fade - hides toolbar & cookie */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 100,
          background: "linear-gradient(to top, hsl(220 20% 4%) 30%, hsl(220 20% 4% / 0.5) 60%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Left sidebar cover - minimal, just hides the icons */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 50,
          background: "linear-gradient(to right, hsl(220 20% 4%) 50%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Right edge - very subtle */}
      <div
        className="absolute right-0 top-0 bottom-0 z-[5]"
        style={{
          width: 20,
          background: "linear-gradient(to left, hsl(220 20% 4% / 0.3), transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
