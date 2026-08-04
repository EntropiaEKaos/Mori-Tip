export default function AppLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-[#e8e2d4] border-t-[#c5a84a] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#8a826a] tracking-[1px]">Carregando...</p>
      </div>
    </div>
  );
}
