const IframeMask = () => {
  return (
    <>
      {/* Top strip - just covers the thin navbar */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 44,
          background: "hsl(220 20% 4%)",
          pointerEvents: "auto",
        }}
      />
      {/* Top fade - tiny smooth transition */}
      <div
        className="absolute left-0 right-0 z-[5]"
        style={{
          top: 44,
          height: 20,
          background: "linear-gradient(to bottom, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom strip - covers cookie banner + toolbar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 48,
          background: "hsl(220 20% 4%)",
          pointerEvents: "auto",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute left-0 right-0 z-[5]"
        style={{
          bottom: 48,
          height: 20,
          background: "linear-gradient(to top, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Left strip - covers sidebar icons only */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 44,
          background: "hsl(220 20% 4%)",
          pointerEvents: "auto",
        }}
      />
      {/* Left fade */}
      <div
        className="absolute top-0 bottom-0 z-[5]"
        style={{
          left: 44,
          width: 16,
          background: "linear-gradient(to right, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
