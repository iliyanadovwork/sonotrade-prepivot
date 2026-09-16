export default function About() {
    return (
      <div className="min-h-screen text-white">
        {/* Hero Section */}
        <section className="border-b" style={{ borderColor: '#171717' }}>
          <div className="max-w-5xl mx-auto sm:px-6 px-4 py-12 sm:px-12 sm:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-balance mb-6 text-white">
                Sonotrade is the future of entertainment
              </h1>
              <p className="text-xl sm:text-2xl font-light" style={{ color: '#7a7a7a' }}>Yes, we&apos;re serious.</p>
            </div>
          </div>
        </section>
  
        <section className="border-b" style={{ borderColor: '#171717' }}>
          <div className="max-w-5xl mx-auto sm:px-6 px-4 py-10 sm:px-12 sm:py-24">
            <h2 className="text-sm uppercase tracking-wider mb-12" style={{ color: '#7a7a7a' }}>WHAT IS SONOTRADE</h2>
            <div className="max-w-3xl space-y-8">
              <div>
                <h3 className="text-2xl sm:text-3xl font-light mb-4 text-white">Our Mission</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  Entertainment shouldn&apos;t be one-way. We&apos;re creating a real-time market where anyone and everyone can leverage their cultural knowledge and take meaningful positions on what they believe in, to actively engage in the events that shape pop culture.
                </p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-light mb-4 text-white">Why Now</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  Culture moves faster than ever. Music breaks overnight, and moments become movements in hours. Traditional networks can&apos;t capture this speed with objective means. We can.
                </p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-light mb-4 text-white">The Vision</h3>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  Sonotrade is building the infrastructure for cultural value. Where opinions become contracts,
                  predictions become profit, and fans become stakeholders in the entertainment they love.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Features Grid */}
        <section>
          <div className="max-w-5xl mx-auto sm:px-6 px-4 py-10 sm:px-12 sm:py-24">
            <h2 className="text-sm uppercase tracking-wider mb-12" style={{ color: '#7a7a7a' }}>HOW CAN I USE SONOTRADE</h2>
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
              <div className="space-y-3">
                <div className="text-6xl font-light text-white">01</div>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  Trade contracts on outcomes of the most controversial topics and events in pop culture, music, TV, film
                  and more.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-6xl font-light text-white">02</div>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  Predict and trade live indexes for rappers, pop stars and more - all tradeable exclusively on Sonotrade.
                </p>
              </div>
              <div className="space-y-3 md:col-span-2">
                <div className="text-6xl font-light text-white">03</div>
                <p className="text-lg leading-relaxed" style={{ color: '#7a7a7a' }}>
                  It&apos;s like a stock market for music, but so much more. We&apos;re truly just getting started.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* Founders Section
        <section>
          <div className="max-w-5xl mx-auto px-6 py-16 sm:px-12 sm:py-24">
            <h2 className="text-sm uppercase tracking-wider opacity-50 mb-12">Founders</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="space-y-1">
                <div className="text-2xl font-light">Yunus Sufian</div>
                <div className="text-sm opacity-50">Co-Founder, CEO</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-light">Angel Mohamed</div>
                <div className="text-sm opacity-50">Co-Founder, CTO</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-light">Iliyan Adov</div>
                <div className="text-sm opacity-50">Co-Founder, CMO</div>
              </div>
            </div>
          </div>
        </section> */}
      </div>
    )
  }
  