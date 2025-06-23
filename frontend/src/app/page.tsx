'use client';
import { MultiAgentSDLC } from '@/components/MultiAgentSDLC';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4a00e0] via-[#8e2de2] to-[#4a00e0] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-['Press_Start_2P'] text-white mb-2">
            AUTOMATED SDLC
          </h1>
          <p className="text-white/80 text-sm md:text-base font-['Press_Start_2P']">
            MULTI-AGENT DEVELOPMENT SIMULATOR
          </p>
        </header>
        
        {/* Main Content */}
        <main className="relative z-10">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="bg-black/90 p-4 md:p-6">
                <MultiAgentSDLC />
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-white/60 text-xs font-['Press_Start_2P']">
            © 2024 SDLC AUTOMATION
          </p>
        </footer>
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
      </div>
    </div>
  );
}