import { CompassLogo } from "@/components/compass-logo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-[#0f0f11] flex items-center justify-center mb-6 animate-pulse">
          <CompassLogo size={48} />
        </div>
        <h2 className="font-serif text-4xl tracking-[-1.5px] text-[#0f0f11]">Mori</h2>
        <p className="text-[#8a826a] mt-2 text-sm tracking-[1px]">Preparando sua próxima viagem...</p>
      </div>
    </div>
  );
}
