import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  Zap, 
  Globe2, 
  Users, 
  LineChart, 
  ShieldCheck, 
  X,
  Presentation
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  tag: string;
}

export default function PitchDeck({ onClose }: { onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      tag: "The Mission",
      title: "EduGenome AI",
      subtitle: "Decoding Talent in the Post-Certificate Era",
      icon: <Zap className="w-12 h-12 text-indigo-400" />,
      content: (
        <div className="space-y-6 text-left">
          <p className="text-xl text-slate-400 leading-relaxed">
            Certificates are static. Skills are dynamic. We are building the first <span className="text-white font-bold">DNA-based talent infrastructure</span> that bridges the gap between academic theory and industry reality.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="text-3xl font-black text-white mb-1">0.16</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">CGPA-Job Correlation</div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <div className="text-3xl font-black text-white mb-1">87%</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Skills-First Hiring Growth</div>
            </div>
          </div>
        </div>
      )
    },
    {
      tag: "The Problem",
      title: "The Validation Mismatch",
      subtitle: "Why Resume-Based Hiring is Failing",
      icon: <Target className="w-12 h-12 text-red-400" />,
      content: (
        <div className="space-y-6 text-left">
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 bg-red-400/10 rounded-full flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
              </div>
              <div>
                <h4 className="text-white font-bold">Academic Blindspots</h4>
                <p className="text-sm text-slate-400">CGPA doesn't capture logic flow, error handling, or architecture design.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-6 h-6 bg-red-400/10 rounded-full flex items-center justify-center mt-1">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
              </div>
              <div>
                <h4 className="text-white font-bold">Language Barriers</h4>
                <p className="text-sm text-slate-400">Untapped talent in Tulu, Konkani, and Kannada speakers excluded by English-only testing.</p>
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      tag: "The Solution",
      title: "Skill DNA Mapping",
      subtitle: "Bias-Free, Language-Agnostic Intelligence",
      icon: <Zap className="w-12 h-12 text-emerald-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-3xl">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Bias-Free
              </h4>
              <p className="text-xs text-slate-400">Stripping identity data to focus purely on skill genome markers.</p>
            </div>
            <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-3xl">
              <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-indigo-400" /> Bhashini Sync
              </h4>
              <p className="text-xs text-slate-400">Government-backed localization for 11+ Indian dialects.</p>
            </div>
          </div>
          <div className="relative aspect-square bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
             <div className="z-10 text-center">
                <div className="text-4xl font-black text-white">DNA</div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Skill Genome</div>
             </div>
          </div>
        </div>
      )
    },
    {
      tag: "Strategy",
      title: "The Bhashini Advantage",
      subtitle: "A 'Digital India' Solution",
      icon: <Globe2 className="w-12 h-12 text-blue-400" />,
      content: (
        <div className="space-y-6 text-left">
          <p className="text-lg text-slate-400">
            Leveraging the <span className="text-white font-bold">Bhashini Udbhav Portal</span> APIs to create a hyper-local talent pool.
          </p>
          <div className="space-y-3">
            {['Tulu', 'Konkani', 'Kannada', 'Hindi'].map((lang) => (
              <div key={lang} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-white font-bold">{lang} Support</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded uppercase">API Active</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      tag: "Roadmap",
      title: "6-Month Growth Helix",
      subtitle: "From Research to Market Launch",
      icon: <LineChart className="w-12 h-12 text-purple-400" />,
      content: (
        <div className="relative pl-8 space-y-8 text-left">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-800"></div>
          {[
            { phase: "Research & Authority", time: "Month 1", focus: "NACE Data & Academic Grounding" },
            { phase: "AI Factory Setup", time: "Month 2", focus: "Cursor & Replit Logic Pipeline" },
            { phase: "MVP Buildout", time: "Months 3-4", focus: "Bhashini Plugin Integration" },
            { phase: "Launch & Pilot", time: "Months 5-6", focus: "Community Testing & Investor Pitch" },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-8 top-1.5 w-6 h-6 bg-slate-950 border-2 border-indigo-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.time}</div>
              <div className="text-white font-bold">{item.phase}</div>
              <div className="text-xs text-slate-500">{item.focus}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      tag: "Social Proof",
      title: "Hostel-Proven Validation",
      subtitle: "Testing with Real Users, Real Dialects",
      icon: <Users className="w-12 h-12 text-orange-400" />,
      content: (
        <div className="space-y-6 text-left">
          <div className="p-8 bg-slate-900 border border-amber-500/20 rounded-3xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
            <p className="italic text-slate-300 text-lg relative z-10">
              "Being able to explain system design in Konkani made me feel for the first time that my local logic is a global skill."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-black text-white">J</div>
              <div>
                <div className="text-white font-bold text-sm">Beta Tester #42</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Software Student, Mangalore</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm tracking-tight">EduGenome Pitch Deck</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic font-mono">v1.0 Internal Template</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-center"
          >
            {/* Left Column: Visuals & Tags */}
            <div className="hidden lg:flex flex-col items-center text-center space-y-6">
              <div className="w-32 h-32 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl">
                {slide.icon}
              </div>
              <div className="space-y-2">
                <span className="px-4 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-500/20">
                  {slide.tag}
                </span>
                <p className="text-slate-500 font-mono text-[10px] uppercase">Slide {currentSlide + 1} of {slides.length}</p>
              </div>
            </div>

            {/* Right Column: Copy & Content */}
            <div className="space-y-8">
              <div className="text-left">
                <h3 className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] mb-2">{slide.tag}</h3>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter leading-none">
                  {slide.title}
                </h1>
                <p className="text-xl text-indigo-400 font-medium italic">{slide.subtitle}</p>
              </div>
              
              <div className="min-h-[300px]">
                {slide.content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress & Controls */}
      <div className="p-8 border-t border-slate-900 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-8">
          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500" 
              initial={{ width: 0 }}
              animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="w-14 h-14 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-30 transition-all bg-slate-900/50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
