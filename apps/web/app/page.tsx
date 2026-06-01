import { Button } from "@/components/ui/button";

const phaseZeroItems = [
  "Next.js App Router scaffold",
  "FastAPI health checks",
  "PostgreSQL and Redis wiring",
  "Docker Compose development target"
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-8">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium text-accent-cyan">
            Phase 0 Project Initialization
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            SingFlow AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#B7BCC8]">
            AI Native Karaoke & Music Workflow Studio for scene playlist
            planning, group taste orchestration, recommendation reasoning, and
            future Agent workflow visibility.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-panel border border-border bg-white/[0.045] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Studio shell</h2>
                <p className="mt-2 text-sm leading-6 text-[#B7BCC8]">
                  This placeholder confirms the frontend foundation. The
                  flagship Studio UI starts in Phase 1.
                </p>
              </div>
              <Button type="button" variant="secondary">
                Mock mode ready
              </Button>
            </div>
          </div>

          <div className="rounded-panel border border-border bg-[#101218] p-6">
            <h2 className="text-sm font-semibold text-accent-mint">
              Initialization scope
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[#B7BCC8]">
              {phaseZeroItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-accent-mint" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
