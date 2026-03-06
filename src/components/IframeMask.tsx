const IframeMask = () => {
  // Use the exact background color for seamless blending
  const bg = "hsl(220 20% 4%)";

  return (
    <>
      {/* Top - covers navbar/search bar */}
      <div
        className="absolute top-0 left-0 right-0 z-[5]"
        style={{
          height: 70,
          background: `linear-gradient(to bottom, ${bg} 55%, ${bg} / 0.8 75%, transparent)`,
          pointerEvents: "auto",
        }}
      />

      {/* Bottom - covers toolbar, cookie banner */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 180,
          background: `linear-gradient(to top, ${bg} 65%, ${bg} / 0.7 80%, transparent)`,
          pointerEvents: "auto",
        }}
      />

      {/* Left - covers sidebar + mobile promo completely */}
      <div
        className="absolute left-0 top-0 bottom-0 z-[5]"
        style={{
          width: 400,
          background: `linear-gradient(to right, ${bg} 72%, ${bg} / 0.85 85%, ${bg} / 0.4 93%, transparent)`,
          pointerEvents: "auto",
        }}
      />
    </>
  );
};

export default IframeMask;
