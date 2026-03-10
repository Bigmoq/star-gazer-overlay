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
          height: 30,
          background: "linear-gradient(to top left, hsl(220 20% 4%) 60%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom-left - hide any text remnants */}
      <div
        className="absolute left-0 bottom-0 z-[5]"
        style={{
          width: 40,
          height: 30,
          background: "linear-gradient(to top right, hsl(220 20% 4%) 40%, transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
