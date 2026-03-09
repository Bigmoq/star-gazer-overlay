const IframeMask = () => {
  return (
    <>
      {/* Top edge - smooth fade for any remnants */}
      <div
        className="absolute left-0 right-0 top-0 z-[5]"
        style={{
          height: 6,
          background: "linear-gradient(to bottom, hsl(220 20% 4%), transparent)",
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
      {/* Bottom-left - hide location text */}
      <div
        className="absolute left-0 bottom-0 z-[5]"
        style={{
          width: 100,
          height: 30,
          background: "linear-gradient(to top right, hsl(220 20% 4%) 40%, transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
