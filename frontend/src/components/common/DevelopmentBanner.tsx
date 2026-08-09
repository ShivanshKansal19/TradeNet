export default function DevelopmentBanner() {
  const mockEnabled = import.meta.env.VITE_USE_MOCK_API === "true";

  if (!mockEnabled) {
    return null;
  }

  return (
    <div className="border-b border-amber-900/50 bg-amber-950/30 px-4 py-2 text-center text-xs text-amber-400">
      Development mode — market data is mocked
    </div>
  );
}
