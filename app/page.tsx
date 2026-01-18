export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="px-6 pt-8 lg:pt-12">
        <div className="font-semibold text-[15px] text-[#1a1a1a]">
          Human Company
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pt-12 lg:pt-16 pb-32">
        <div className="max-w-[600px]">
          <div className="space-y-8 text-[17px] lg:text-[18px] leading-[1.7] text-[#1a1a1a]">
            <p>
              We build things, typically with code. We believe progress in AI will come from encoding real work into environments where agents can learn.
            </p>
            <p>
              As models scale, humans remain responsible for defining the tasks, constraints, and ground truth that turn intelligence into economic reality.
            </p>
            <p>
              To act on this belief, we focus on two concrete responsibilities.
            </p>

            {/* Section 01 */}
            <section className="space-y-2">
              <span className="text-[14px] text-stone-400 block">01</span>
              <h2 className="text-[18px] font-medium text-[#1a1a1a]">Environments</h2>
              <p className="text-[17px] lg:text-[18px] leading-[1.7]">
                Real work, formalized. We encode economically valuable tasks into high-fidelity training environments where agents learn by doing—starting with software engineering.
              </p>
            </section>

            {/* Section 02 */}
            <section className="space-y-2">
              <span className="text-[14px] text-stone-400 block">02</span>
              <h2 className="text-[18px] font-medium text-[#1a1a1a]">Curricula</h2>
              <p className="text-[17px] lg:text-[18px] leading-[1.7]">
                Tasks drawn from real economic activity—the work that matters, turned into high quality training signal.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#f5f5f0] border-t border-stone-200">
        <div className="px-6 py-4">
          <a
            href="mailto:amar@thehumancompany.ai"
            className="text-[15px] text-[#1a1a1a] font-medium hover:text-stone-500 transition-colors"
          >
            Contact
          </a>
        </div>
      </nav>
    </div>
  );
}
