const IframeMask = () => {
  return (
    <>
      {/* Top full-width mask - covers Stellarium native info panel on all devices */}
      <div
        className="absolute left-0 right-0 top-0 z-[5]"
        style={{
          height: 380,
          background: "linear-gradient(to bottom, hsl(220 20% 4%) 70%, transparent 100%)",
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
    </>
  );
};

export default IframeMask;
