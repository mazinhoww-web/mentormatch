export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="aurora-a absolute h-[55%] w-[55%] rounded-full"
        style={{
          top: "-15%",
          left: "-5%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)",
        }}
      />
      <div
        className="aurora-b absolute h-[45%] w-[45%] rounded-full"
        style={{
          bottom: "-5%",
          right: "-8%",
          background:
            "radial-gradient(circle, rgba(0,74,198,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="aurora-c absolute h-[35%] w-[35%] rounded-full"
        style={{
          top: "45%",
          left: "40%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)",
        }}
      />
    </div>
  )
}
