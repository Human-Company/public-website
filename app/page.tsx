import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-neutral-200 flex items-start lg:items-center justify-center px-6 pt-24 pb-12 lg:p-24">
      <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-12 items-start">
        {/* Left Sidebar - Header & Nav */}
        <div className="flex flex-col gap-1 text-[18px] lg:sticky lg:top-24">
          <div className="font-bold mb-1">Human Company</div>
          <nav className="flex flex-col gap-1">

            <a href="mailto:amar@thehumancompany.ai" className="opacity-50 hover:opacity-100 transition-opacity">Contact</a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="max-w-[450px]">
          <h1 className="font-serif text-[32px] lg:text-[36px] leading-[1.15] font-normal text-foreground mb-10 max-w-[280px] lg:max-w-none">
            Humans won't judge intelligence. They'll define the work that creates it.
          </h1>
          <div className="space-y-6 text-[18px] leading-[1.7] text-foreground/80">
            <p>
              Progress in AI will come from encoding real work into environments where agents can learn. As models scale, humans remain responsible for defining the tasks, constraints, and ground truth that turn intelligence into economic reality.
            </p>
            <p>
              This drives our two areas of focus.
            </p>

            {/* Section 01 */}
            <section className="space-y-2">
              <div className="flex gap-3 lg:gap-4 items-baseline">
                <span className="text-[18px] text-muted-foreground">01</span>
                <h2 className="text-[18px] font-medium text-foreground">Environments</h2>
              </div>
              <p className="text-[18px] leading-[1.7]">
                Real work, formalized. We encode economically valuable tasks into high-fidelity training environments where agents learn by doing—starting with software engineering.
              </p>
            </section>

            {/* Section 02 */}
            <section className="space-y-2">
              <div className="flex gap-3 lg:gap-4 items-baseline">
                <span className="text-[18px] text-muted-foreground">02</span>
                <h2 className="text-[18px] font-medium text-foreground">Curricula</h2>
              </div>
              <p className="text-[18px] leading-[1.7]">
                Tasks drawn from real economic activity—the work that matters, turned into high quality training signal.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
