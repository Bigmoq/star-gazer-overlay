const IframeMask = () => {
  return (
    <>
      {/* Top-left: cover Stellarium's native info panel */}
      <div
        className="absolute left-0 top-0 z-[5]"
        style={{
          width: "min(450px, 60vw)",
          height: 380,
          background: "linear-gradient(135deg, hsl(220 20% 4%) 55%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Top edge full width - subtle fade */}
      <div
        className="absolute left-0 right-0 top-0 z-[4]"
        style={{
          height: 20,
          background: "linear-gradient(to bottom, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 24,
          background: "linear-gradient(to right, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 z-[5]"
        style={{
          width: 16,
          background: "linear-gradient(to left, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom full strip - cover toolbar */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[5]"
        style={{
          height: 60,
          background: "linear-gradient(to top, hsl(220 20% 4%) 40%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right - hide date/time display */}
      <div
        className="absolute right-0 bottom-0 z-[5]"
        style={{
          width: 180,
          height: 30,
          background: "linear-gradient(to top left, hsl(220 20% 4%) 60%, transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
