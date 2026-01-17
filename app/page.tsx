export default function Home() {
  return (
    <div className="min-h-screen flex justify-center bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-stone-200">
      <div className="max-w-[900px] w-full mx-auto px-6 lg:px-12 pt-32 lg:pt-[280px] pb-32">
        <div className="flex flex-col lg:flex-row lg:gap-[80px]">

          {/* Sidebar */}
          <aside className="lg:w-[140px] flex-shrink-0 mb-12 lg:mb-0">
            <div className="lg:fixed lg:w-[140px] flex flex-col">
              {/* Brand Name */}
              <div className="font-semibold text-[15px] text-[#1a1a1a]">
                Human Company
              </div>
              {/* Nav */}
              <nav className="flex flex-col text-[15px] text-stone-500 mt-1">
                <a href="#" className="hover:text-[#1a1a1a] transition-colors">Contact</a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-[480px]">
          <div className="flex flex-col gap-[64px] pb-32">
            {/* Title Section */}
            <section>
              <h1 className="font-[family-name:var(--font-playfair)] text-[42px] leading-[1.15] font-normal tracking-[-0.5px] mb-[32px] text-[#1a1a1a]">
                RL infrastructure<br />
                for agent training
              </h1>
              <div className="space-y-[20px] text-[17px] leading-[1.6] text-stone-500">
                <p>
                  We believe in a future where agents are lifelike. They will see, hear, and collaborate with us. RL infrastructure is key to unlocking this future.
                </p>
                <p className="font-medium text-[17px] leading-[1.6] text-[#1a1a1a]">
                  To start, we have two goals.
                </p>
              </div>
            </section>

            <hr className="border-stone-300 w-full" />

            {/* Section 01 */}
            <section className="space-y-[10px]">
              <span className="text-[14px] leading-[20px] text-stone-400 block">01</span>
              <h2 className="text-[20px] leading-[1.4] font-medium text-[#1a1a1a]">A scalable foundation</h2>
              <p className="text-stone-500 text-[16px] leading-[1.6] max-w-[460px]">
                Building the training grounds for the next generation of AI. Our infrastructure enables massive-scale reinforcement learning environments that mimic the complexity of the real world.
              </p>
            </section>

            {/* Section 02 */}
            <section className="space-y-[10px]">
              <span className="text-[14px] leading-[20px] text-stone-400 block">02</span>
              <h2 className="text-[20px] leading-[1.4] font-medium text-[#1a1a1a]">Human-aligned reward models</h2>
              <p className="text-stone-500 text-[16px] leading-[1.6] max-w-[460px]">
                Ensuring that agents learn from human feedback effectively. We are developing novel algorithms to align agent behavior with human intent through natural interaction.
              </p>
              <p className="text-stone-500 text-[16px] leading-[1.6]">
                Try our research <a href="#" className="text-[#1a1a1a] underline underline-offset-2 hover:text-stone-600 transition-colors">preview</a>.
              </p>
            </section>
          </div>
          </main>
        </div>
      </div>
    </div>
  );
}
