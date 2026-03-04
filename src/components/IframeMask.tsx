const IframeMask = () => {
  return (
    <>
      {/* Top navbar cover */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 60,
          background: "linear-gradient(to bottom, hsl(var(--background)) 75%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Bottom toolbar + cookie banner cover */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 160,
          background: "linear-gradient(to top, hsl(var(--background)) 80%, transparent)",
          pointerEvents: "auto",
        }}
      />

      {/* Left-side: covers sidebar icons + mobile promo */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 330,
          background: "linear-gradient(to right, hsl(var(--background)) 55%, hsl(var(--background) / 0.7) 75%, transparent)",
          pointerEvents: "auto",
        }}
      />
    </>
  );
};

export default IframeMask;
