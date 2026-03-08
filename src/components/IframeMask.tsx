const IframeMask = () => {
  return (
    <>
      {/* Left edge - hide "he si..." cookie text */}
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
      {/* Bottom-right - hide date/time display */}
      <div
        className="absolute right-0 bottom-0 z-[5]"
        style={{
          width: 180,
          height: 50,
          background: "linear-gradient(to top left, hsl(220 20% 4%) 60%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom-left - hide any text remnants */}
      <div
        className="absolute left-0 bottom-0 z-[5]"
        style={{
          width: 40,
          height: 50,
          background: "linear-gradient(to top right, hsl(220 20% 4%) 40%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Cookie banner mask - center bottom */}
      <div
        className="absolute left-1/2 bottom-0 z-[5] -translate-x-1/2"
        style={{
          width: 400,
          height: 80,
          background: "hsl(220 20% 4%)",
          pointerEvents: "none",
        }}
      />
      {/* Cookie banner gradient edges */}
      <div
        className="absolute left-1/2 bottom-0 z-[4] -translate-x-1/2"
        style={{
          width: 500,
          height: 80,
          background: "linear-gradient(to top, hsl(220 20% 4%) 40%, transparent), linear-gradient(to right, hsl(220 20% 4%) 0%, transparent 20%, transparent 80%, hsl(220 20% 4%) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom toolbar background - make it look integrated */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[3]"
        style={{
          height: 56,
          background: "linear-gradient(to top, hsl(220 20% 4% / 0.7) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
