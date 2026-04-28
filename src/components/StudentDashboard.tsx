import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  Dna, 
  Github, 
  TrendingUp, 
  Layout, 
  Cpu, 
  Users, 
  Award,
  Calendar,
  Globe
} from 'lucide-react';

interface DNAData {
  subject: string;
  A: number;
  fullMark: number;
}

const defaultDNA: DNAData[] = [
  { subject: 'Logic', A: 85, fullMark: 100 },
  { subject: 'Architecture', A: 78, fullMark: 100 },
  { subject: 'Soft Skills', A: 92, fullMark: 100 },
  { subject: 'Tooling', A: 70, fullMark: 100 },
  { subject: 'Security', A: 65, fullMark: 100 },
  { subject: 'Scalability', A: 82, fullMark: 100 },
];

// Generate fake github data for heatmap
const generateHeatmapData = () => {
  const data = [];
  const levels = [0, 1, 2, 3, 4];
  for (let i = 0; i < 52; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      week.push(levels[Math.floor(Math.random() * levels.length)]);
    }
    data.push(week);
  }
  return data;
};

const heatmapData = generateHeatmapData();

export default function StudentDashboard({ 
  username, 
  language, 
  githubResult 
}: { 
  username?: string, 
  language: string,
  githubResult?: null | { 
    summary: string; 
    topSkills: string[]; 
    dnaScore: number; 
    reposAnalyzed: number; 
    targetJob: string; 
    recommendedRoadmap: string; 
  }
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Dna className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skill DNA Index</p>
            <h3 className="text-3xl font-black text-white">
              {githubResult ? githubResult.dnaScore : '84.2'} 
              <span className="text-sm font-bold text-emerald-400"> {githubResult ? '' : '+2.4'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              {githubResult ? `Based on ${githubResult.reposAnalyzed} Repos` : 'Top 5% in regional logic'}
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Github className="w-16 h-16 text-purple-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">GitHub Velocity</p>
            <h3 className="text-3xl font-black text-white">{githubResult ? githubResult.reposAnalyzed * 12 : '1,240'}</h3>
            <p className="text-xs text-slate-400 mt-2">Project DNA contributions</p>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Globe className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Language Logic</p>
            <h3 className="text-3xl font-black text-white">{language}</h3>
            <p className="text-xs text-slate-400 mt-2">Preferred context active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DNA Radar Chart */}
        <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest">Skill Genome Mapping</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Multidimensional Merit Analysis</p>
             </div>
             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={defaultDNA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="DNA Score"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GitHub Contribution Heatmap */}
        <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest">Growth Helix (Git)</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Code Consistency Heatmap</p>
             </div>
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-400" />
             </div>
          </div>

          <div className="flex flex-col gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
             <div className="flex gap-1.5 min-w-max">
                {heatmapData.map((week, wIdx) => (
                   <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((level, dIdx) => (
                         <div 
                            key={dIdx} 
                            className={`w-3 h-3 rounded-sm transition-all duration-500 hover:scale-150 ${
                               level === 0 ? 'bg-slate-900' :
                               level === 1 ? 'bg-indigo-900/40' :
                               level === 2 ? 'bg-indigo-700/60' :
                               level === 3 ? 'bg-indigo-500' :
                               'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]'
                            }`}
                            title={`Contribution Level: ${level}`}
                         />
                      ))}
                   </div>
                ))}
             </div>
             <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Less</span>
                {[0, 1, 2, 3, 4].map(l => (
                   <div key={l} className={`w-3 h-3 rounded-sm ${
                      l === 0 ? 'bg-slate-900' :
                      l === 1 ? 'bg-indigo-900/40' :
                      l === 2 ? 'bg-indigo-700/60' :
                      l === 3 ? 'bg-indigo-500' :
                      'bg-indigo-400'
                   }`} />
                ))}
                <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">More</span>
             </div>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl">
         <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">EduGenome Recommendations</h4>
         <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-indigo-500/50 transition-all">
               <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Layout className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                  <p className="text-xs font-black text-white uppercase mb-1">
                    {githubResult ? 'Target Role' : 'Architecture Boost'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {githubResult ? githubResult.targetJob : `You scored 78. Try the System Design logic in ${language}.`}
                  </p>
               </div>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-emerald-500/50 transition-all">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-6 h-6 text-emerald-400" />
               </div>
               <div>
                  <p className="text-xs font-black text-white uppercase mb-1">
                    {githubResult ? 'Growth Roadmap' : 'Backend Merit'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase line-clamp-2">
                    {githubResult ? githubResult.recommendedRoadmap : 'Your GitHub scans show strong Node.js DNA. Apply for Node roles.'}
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
