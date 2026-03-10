const IframeMask = () => {
  return (
    <>
      {/* Top mask - hide Stellarium's native info panel */}
      <div
        className="absolute left-0 right-0 top-0 z-[5]"
        style={{
          height: 340,
          background: "linear-gradient(to bottom, hsl(220 20% 4%) 60%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Left edge - hide "he si..." cookie text */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 40,
          background: "linear-gradient(to right, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 z-[5]"
        style={{
          width: 24,
          background: "linear-gradient(to left, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom strip - hide toolbar and date/time */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[5]"
        style={{
          height: 60,
          background: "linear-gradient(to top, hsl(220 20% 4%) 50%, transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
