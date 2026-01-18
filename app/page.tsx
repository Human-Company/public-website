export default function Home() {
  return (
    <div className="min-h-screen flex justify-center bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-stone-200">
      <div className="max-w-[900px] w-full mx-auto px-6 lg:px-12 pt-12 lg:pt-[280px] pb-32">
        <div className="flex flex-col lg:flex-row lg:gap-[80px]">

          {/* Sidebar */}
          <aside className="lg:w-[140px] flex-shrink-0 mb-6 lg:mb-0">
            <div className="flex flex-row justify-between items-center lg:fixed lg:w-[140px] lg:flex-col lg:items-start lg:justify-start">
              {/* Brand Name */}
              <div className="font-semibold text-[15px] text-[#1a1a1a]">
                Human Company
              </div>
              {/* Nav */}
              <nav className="flex flex-col text-[15px] text-stone-500 lg:mt-1">
                <a href="#" className="hover:text-[#1a1a1a] transition-colors">Contact</a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-[480px]">
            <div className="flex flex-col gap-[64px] pb-32">
                          {/* Title Section */}
                          <section>
                            <h1 className="font-[family-name:var(--font-playfair)] text-[32px] lg:text-[42px] leading-[1.15] font-normal tracking-[-0.5px] mb-[32px] text-[#1a1a1a]">
                              Humans won’t judge intelligence. They’ll define the work that creates it.
                            </h1>                <div className="space-y-[20px] text-[17px] leading-[1.6] text-stone-500">
                  <p>
                    We believe progress in AI will come from encoding real work into environments where agents can learn. As models scale, humans remain responsible for defining the tasks, constraints, and ground truth that turn intelligence into economic reality.
                  </p>
                  <p className="font-medium text-[17px] leading-[1.6] text-[#1a1a1a]">
                    To act on this belief, we focus on two concrete responsibilities.
                  </p>
                </div>
              </section>

              <hr className="border-stone-300 w-full" />

              {/* Section 01 */}
              <section className="space-y-[10px]">
                <span className="text-[14px] leading-[20px] text-stone-400 block">01</span>
                <h2 className="text-[20px] leading-[1.4] font-medium text-[#1a1a1a]">Environments</h2>
                <p className="text-stone-500 text-[16px] leading-[1.6] max-w-[460px]">
                  Real work, formalized. We encode economically valuable tasks into high-fidelity training environments where agents learn by doing—starting with software engineering.
                </p>
              </section>

              {/* Section 02 */}
              <section className="space-y-[10px]">
                <span className="text-[14px] leading-[20px] text-stone-400 block">02</span>
                <h2 className="text-[20px] leading-[1.4] font-medium text-[#1a1a1a]">Curricula</h2>
                <p className="text-stone-500 text-[16px] leading-[1.6] max-w-[460px]">
                  Tasks drawn from real economic activity—the work that matters, turned into high quality training signal.
                </p>

                <p className="text-stone-500 text-[16px] leading-[1.6]">
                  Contact us at <a href="mailto:amar@thehumancompany.ai" className="text-[#1a1a1a] underline underline-offset-2 hover:text-stone-600 transition-colors">amar@thehumancompany.ai</a>.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
