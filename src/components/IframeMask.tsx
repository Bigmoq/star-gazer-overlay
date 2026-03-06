const IframeMask = () => {
  return (
    <>
      {/* Top thin edge */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 8,
          background: "linear-gradient(to bottom, hsl(220 20% 4% / 0.6), transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
