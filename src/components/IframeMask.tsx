const IframeMask = () => {
  return (
    <>
      {/* Very thin top edge blend */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 12,
          background: "linear-gradient(to bottom, hsl(220 20% 4% / 0.5), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Very thin bottom edge blend */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 12,
          background: "linear-gradient(to top, hsl(220 20% 4% / 0.5), transparent)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default IframeMask;
