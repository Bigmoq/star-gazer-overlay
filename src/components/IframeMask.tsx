const IframeMask = () => {
  return (
    <>
      {/* Bottom thin strip - covers any remaining cookie banner edge */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5]"
        style={{
          height: 24,
          background: "hsl(220 20% 4%)",
          pointerEvents: "auto",
        }}
      />
    </>
  );
};

export default IframeMask;
