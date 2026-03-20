import FilterPanel from "./FilterPanel";
import GenerateBooksButton from "./GenerateBooksButton";
import RevealOverlay from "./RevealOverlay";
import WheelCanvas from "./WheelCanvas";
import RoomInitializer from "./RoomInitializer";

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(99,102,241,0.10),transparent_60%),linear-gradient(to_bottom,#090a12,#04040b)] px-4 py-8 sm:px-6">
      <RoomInitializer roomId={params.id} />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-2">
          <div className="text-xs font-medium tracking-wide text-white/50">
            Room
          </div>
          <div className="text-lg font-semibold text-white/90">Set filters, generate books, then spin.</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              <FilterPanel />
              <GenerateBooksButton />
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="flex h-full items-center justify-center">
              <WheelCanvas />
            </div>
          </main>
        </div>
      </div>

      <RevealOverlay />
    </div>
  );
}

