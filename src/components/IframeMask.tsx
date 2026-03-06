const IframeMask = () => {
  return (
    <>
      {/* Left edge - hide tiny "he si..." cookie text remnant */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 16,
          background: "linear-gradient(to right, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Right edge - hide time display */}
      <div
        className="absolute right-0 top-0 bottom-0 z-[5]"
        style={{
          width: 16,
          background: "linear-gradient(to left, hsl(220 20% 4%), transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
