import React, { useState, useRef, useEffect } from 'react';
import { Github, Loader2, Dna, Code2, Globe, BrainCircuit, ChevronRight, Mail, AlignLeft, Send, Sparkles, Video, StopCircle, Mic, RefreshCw, Route, Target, Play, UserCheck, Eye, EyeOff, MessageSquare, Headphones, Search, X, BarChart2, Linkedin, TrendingUp, Lightbulb, Languages, Zap, Share2, Twitter, Presentation, CheckCircle2, Bell } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Markdown from 'react-markdown';
import ErrorBoundary from './components/ErrorBoundary';
import PitchDeck from './components/PitchDeck';
import StudentDashboard from './components/StudentDashboard';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Notification {
  id: string;
  candidateId: string;
  type: string;
  status: string;
  timestamp: string;
  read: boolean;
  message: string;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'github' | 'linkedin' | 'logic' | 'softskill' | 'roadmap' | 'bridge' | 'vision' | 'dashboard'>('dashboard');
  const [viewMode, setViewMode] = useState<'candidate' | 'recruiter'>('candidate');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [language, setLanguage] = useState('Auto-Detect');
  const [error, setError] = useState('');

  // Recruiter Dashboard State
  const [revealedCandidates, setRevealedCandidates] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [minLogic, setMinLogic] = useState(0);
  const [minTech, setMinTech] = useState(0);
  const [minSoft, setMinSoft] = useState(0);
  const [filterSkill, setFilterSkill] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [sortBy, setSortBy] = useState<'logic' | 'tech' | 'soft' | 'name' | 'id'>('id');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [comparisonView, setComparisonView] = useState<'radar' | 'bar'>('radar');
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState<string | null>(null);
  const [isOpeningDetails, setIsOpeningDetails] = useState(false);
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, 'New' | 'Screening' | 'Review' | 'Interviewing' | 'Offered' | 'Rejected'>>({});
  const [scheduledInterviews, setScheduledInterviews] = useState<Record<string, { date: string, time: string }>>({});
  const [schedulingCandidateIds, setSchedulingCandidateIds] = useState<string[]>([]);
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '' });

  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const handleNotifyCandidate = (candidateId: string, status: string) => {
    setIsNotifying(true);
    const candidate = mockCandidates.find(c => c.id === candidateId);
    const candidateName = candidate ? candidate.realName : `Candidate #${candidateId}`;
    
    let message = `Notification: Your application status for the current role has been updated to '${status}'.`;
    if (status === 'Interviewing') message = `Great news! You have been advanced to the Interview Stage. Check your schedule soon.`;
    if (status === 'Offered') message = `Congratulations! An offer has been extended based on your exceptional Skill DNA profile.`;
    if (status === 'Rejected') message = `Thank you for your interest. After reviewing your DNA metrics, we have decided to move forward with other candidates at this time.`;
    if (status === 'Screening') message = `Your Skill DNA assessment is now being screened by our expert panel.`;
    if (status === 'Review') message = "Your profile is currently under Technical Review by our senior architects.";

    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      candidateId,
      type: 'status_update',
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      message
    };
    
    setTimeout(() => {
      setNotifications(prev => [newNotification, ...prev]);
      setIsNotifying(false);
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 3000);
    }, 600);
  };

  const [showPitchDeck, setShowPitchDeck] = useState(false);

  const [careerStrategy, setCareerStrategy] = useState<Record<string, string>>({});
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const generateCareerStrategy = async (candidate: any) => {
    if (careerStrategy[candidate.id]) return;
    
    setIsGeneratingStrategy(true);
    try {
      const prompt = `
        You are a Global Career Strategist for EduGenome AI.
        
        Analyze this candidate's Skill DNA Profile:
        - Technical Logic: ${candidate.fullSkillDNA.logic}/100
        - Technology Proficiency: ${candidate.id === '104' ? 'React, Redux, Tailwind' : candidate.id === '291' ? 'Node.js, Streams, WebSockets' : candidate.id === '315' ? 'Fullstack, Socket.io' : 'Python, Distributed Systems, Redis'} (Score: ${candidate.fullSkillDNA.tech}/100)
        - Soft Skills Genome: ${candidate.fullSkillDNA.soft}/100
        - Architecture: ${candidate.fullSkillDNA.architecture}/100
        - Innovation: ${candidate.fullSkillDNA.innovation}/100

        Your Task:
        1. Analyze the balance between their technical logic and soft skills.
        2. Identify three job roles where they would thrive.
        3. Justify the selection: Explain why their specific 'DNA' fits that role.
        4. Regional vs. Global: Suggest if they are ready for global remote roles or should start with specific regional opportunities.

        Constraint: Do not mention their CGPA or college name; focus entirely on their merit.
        Format: Use professional, encouraging markdown. Use bold for job titles.
      `;

      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      setCareerStrategy(prev => ({ ...prev, [candidate.id]: text }));
    } catch (err) {
      console.error("Failed to generate strategy:", err);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const mockCandidates = [
    { 
      id: '104', logic: 95, tech: { name: 'React', score: 80 }, soft: 85, insight: 'Exceptional structural thinking without formal training.', realName: 'Neha Sharma', college: 'Tier 3 College', cgpa: 6.5,
      fullSkillDNA: { architecture: 88, innovation: 92, logic: 95, tech: 80, soft: 85 },
      fullSummary: 'Candidate 104 demonstrates an extraordinary capability in structural UI design and component optimization. Their logic-first approach bypasses common pitfalls in state management, focusing heavily on maintainability and scalable performance. Verified skills include React, Redux, and Tailwind.',
      projects: [
        { name: 'E-commerce Redux Architecture', description: 'Re-architected the global state of a mock e-commerce app to reduce unneeded re-renders by 40%.' },
        { name: 'Canvas-based Diagram Tool', description: 'Built an entire drag-and-drop flowbox UI without any external libraries.' }
      ],
      topSkills: ['React', 'Redux', 'Architecture']
    },
    { 
      id: '291', logic: 88, tech: { name: 'Node.js', score: 92 }, soft: 70, insight: 'Strong backend skills. Good asynchronous logic.', realName: 'Rahul Verma', college: 'State University', cgpa: 7.2,
      fullSkillDNA: { architecture: 90, innovation: 80, logic: 88, tech: 92, soft: 70 },
      fullSummary: 'Candidate 291 possesses deep knowledge in event-driven asynchronous architectures. Exhibited a high degree of proficiency in Node.js streaming and memory optimization. Proven capability to handle backend load balancing and API design.',
      projects: [
        { name: 'High-Concurrency Chat Server', description: 'Created a WebSockets backend handling up to 10k mock concurrent connections with minimal latency.' },
        { name: 'Data Pipeline API', description: 'Built an ETL pipeline using streams that processes gigabytes of JSON data without maxing out memory.' }
      ],
      topSkills: ['Node.js', 'Streams', 'WebSockets']
    },
    { 
      id: '315', logic: 82, tech: { name: 'Full-Stack', score: 85 }, soft: 90, insight: 'Great communication and teamwork indicator. Fast learner.', realName: 'Aisha Khan', college: 'Community College', cgpa: 5.8,
      fullSkillDNA: { architecture: 85, innovation: 87, logic: 82, tech: 85, soft: 90 },
      fullSummary: 'Candidate 315 shows a remarkable balance of technical breadth and emotional intelligence. Adapts very quickly to new paradigms and communicates design decisions clearly. Shows an ability to coordinate across frontend and backend seamlessly.',
      projects: [
        { name: 'Real-time Sync Board', description: 'Developed a full-stack collaborative whiteboard using MERN stack and Socket.io.' },
        { name: 'Analytics Dashboard', description: 'Integrated a complex set of visual data charts pulling real-time metrics, handling edge cases gracefully.' }
      ],
      topSkills: ['Full-Stack', 'Socket.io', 'Communication']
    },
    { 
      id: '422', logic: 91, tech: { name: 'Python', score: 88 }, soft: 82, insight: 'Exceptional data modeling and distributed system design.', realName: 'Arjun Das', college: 'National Institute', cgpa: 8.9,
      fullSkillDNA: { architecture: 94, innovation: 85, logic: 91, tech: 88, soft: 82 },
      fullSummary: 'Candidate 422 demonstrates a strong mastery of Python-based distributed systems. They show deep architectural understanding in multi-tenant environments and high-throughput data processing. Highly analytical with a focus on system reliability and observability.',
      projects: [
        { name: 'Distributed Crawler Cluster', description: 'Designed and implemented a scalable web crawler handling millions of requests per day with automated retries and dead-letter queues.' },
        { name: 'Financial Risk Engine', description: 'Built a real-time risk calculation engine for mock portfolio data using Python and Redis for low-latency computation.' }
      ],
      topSkills: ['Python', 'Distributed Systems', 'Redis']
    }
  ];

  // GitHub Assessment State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    summary: string;
    topSkills: string[];
    dnaScore: number;
    reposAnalyzed: number;
    targetJob: string;
    recommendedRoadmap: string;
  }>(null);

  // LinkedIn Assessment State
  const [profileText, setProfileText] = useState('');
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinResult, setLinkedinResult] = useState<null | {
    technicalLogic: number;
    architectureAndDesign: number;
    innovationLevel: number;
    top3VerifiedSkills: string[];
    unbiasedSummary: string;
    targetJob: string;
    recommendedRoadmap: string;
  }>(null);

  // Logic Assessment State
  const [logicDifficulty, setLogicDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [logicProblem, setLogicProblem] = useState('');
  const [logicAnswer, setLogicAnswer] = useState('');
  const [logicLoading, setLogicLoading] = useState(false);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [logicScore, setLogicScore] = useState<null | { score: number; feedback: string }>(null);

  // Soft Skill Assessment State
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoFile, setVideoFile] = useState<Blob | null>(null);
  const [ssLoading, setSsLoading] = useState(false);
  const [ssScore, setSsScore] = useState<null | { score: number; feedback: string, tone: string }>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Roadmap State
  const [roadmapInput, setRoadmapInput] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<null | { base: string, goal: string, steps: { title: string, duration: string, description: string, youtubeQuery: string }[] }>(null);

  // Interview Bridge State
  const [bridgeTranscript, setBridgeTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [bridgeTranslation, setBridgeTranslation] = useState('');
  const [recruiterAnswer, setRecruiterAnswer] = useState('');
  const [recruiterAnswerTranslated, setRecruiterAnswerTranslated] = useState('');
  const [isRecruiterResponding, setIsRecruiterResponding] = useState(false);
  const [recruiterResponseInput, setRecruiterResponseInput] = useState('');
  const [recruiterVerdict, setRecruiterVerdict] = useState<{ job: string, roadmap: string, explanation: string } | null>(null);
  const [isAnalyzingBridge, setIsAnalyzingBridge] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [translating, setTranslating] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Stop video stream when leaving tab
  useEffect(() => {
    if (activeTab !== 'softskill') {
      stopRecordingAndStream();
    }
    if (activeTab !== 'bridge') {
      stopListening();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedForComparison.length === 0) {
      setShowComparison(false);
    }
  }, [selectedForComparison]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, minLogic, minTech, minSoft, filterSkill, filterCollege, sortBy]);

  const stopRecordingAndStream = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setVideoStream(null);
  };


  const translateTranscript = async (text: string) => {
    if (!text.trim()) return;
    setTranslating(true);
    try {
      const prompt = `Identify the language of the following text and translate it to English. Only provide the translation, nothing else.\n\nText: ${text}`;
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setBridgeTranslation(prev => prev + (prev ? ' ' : '') + (result.response.text() || '').trim());
    } catch (err: any) {
      console.error(err);
      setError('Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const generateRecruiterVerdict = async () => {
    if (!bridgeTranslation.trim()) return;
    setIsAnalyzingBridge(true);
    try {
      const prompt = `
        You are a Recruiter at a top tech company. Analyze the following interview transcript:
        "${bridgeTranslation}"
        
        Based on this conversation, provide:
        1. A specific Job Role they are suited for.
        2. A Roadmap focus they should choose to improve.
        3. A brief explanation of why.
        
        Format your response as a JSON object with keys: "job", "roadmap", and "explanation".
      `;
      
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text || '{}');
      setRecruiterVerdict(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze interview.');
    } finally {
      setIsAnalyzingBridge(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported in this browser. Please try Chrome.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    const langCodeMap: Record<string, string> = {
      'English': 'en-US',
      'Hindi': 'hi-IN',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Kannada': 'kn-IN',
      'Marathi': 'mr-IN',
      'Bengali': 'bn-IN',
      'Gujarati': 'gu-IN',
      'Punjabi': 'pa-IN',
      'Spanish': 'es-ES',
      'French': 'fr-FR'
    };
    recognition.lang = langCodeMap[language] || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      
      setInterimTranscript(interim);

      if (finalTranscript) {
        setBridgeTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
        translateTranscript(finalTranscript);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        setIsListening(false);
        setError('Microphone error: ' + e.error);
        console.error(e);
      }
    };

    recognition.onend = () => {
      // In a real app we might restart if continuous isn't working perfectly, but let's just stop
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
      recognitionRef.current = recognition;
      setError('');
    } catch (err) {
      console.error(err);
    }
  };

  const generateRecruiterResponse = async () => {
    if (!bridgeTranslation.trim()) return;
    setIsRecruiterResponding(true);
    try {
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              translated: { type: Type.STRING },
              identifiedLanguage: { type: Type.STRING }
            }
          }
        }
      });
      const prompt = `You are a Global Talent Recruiter at a top tech company. A student just finished speaking an interview segment. 
      The translated transcript is: "${bridgeTranslation}".
      
      First, identify the language used by the student if it's not English.
      Then, respond to the student professionally, keeping it very conversational as if you are in a live room. Ask a follow-up question or give brief feedback.
      Keep it short (1-2 sentences).
      
      Finally, translate your response into the student's identified language (${language}).
      
      Return JSON: { "english": "...", "translated": "...", "identifiedLanguage": "..." }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text || '{}');
      setRecruiterAnswer(data.english || '');
      setRecruiterAnswerTranslated(data.translated || '');

      // Text-to-Speech for the student in their native language
      if (data.translated) {
        const utterance = new SpeechSynthesisUtterance(data.translated);
        utterance.lang = language === 'Kannada' ? 'kn-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecruiterResponding(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (bridgeTranslation.trim()) {
      generateRecruiterResponse();
    }
  };

  const handleManualRecruiterResponse = async () => {
    if (!recruiterResponseInput.trim()) return;
    setIsRecruiterResponding(true);
    const textToTranslate = recruiterResponseInput;
    setRecruiterAnswer(textToTranslate);
    setRecruiterResponseInput('');
    
    try {
      const prompt = `Translate the following recruiter response into ${language}. 
      The response is: "${textToTranslate}".
      Only return the translated text without any preamble.`;

      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const translated = result.response.text();
      setRecruiterAnswerTranslated(translated);

      // Text-to-Speech for the student
      if (translated) {
        const utterance = new SpeechSynthesisUtterance(translated);
        // Better language detection for TTS
        const langMap: Record<string, string> = {
          'Kannada': 'kn-IN',
          'Hindi': 'hi-IN',
          'Tamil': 'ta-IN',
          'Telugu': 'te-IN',
          'Konkani': 'hi-IN', // Approximation if not direct
          'Tulu': 'kn-IN',    // Approximation
          'Malayalam': 'ml-IN',
          'Bengali': 'bn-IN'
        };
        utterance.lang = langMap[language] || 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecruiterResponding(false);
    }
  };

  const generateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapInput.trim()) return;
    setRoadmapLoading(true);
    setError('');
    
    try {
      const prompt = `Act as an expert technical career coach. A student has provided the following information about their current skills, strengths, weaknesses, or goals: "${roadmapInput}".
      
      They want to learn and evolve their technical skills. Generate a "Zero-to-Hero Genetic Growth Plan" in ${language}.
      Assess their current base, identify a target goal, and provide a step-by-step roadmap. For each step, suggest what they should learn and a realistic YouTube search query to find free tutorials.

      Return JSON matching this schema.`;

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              base: { type: Type.STRING, description: `The student's identified current base` },
              goal: { type: Type.STRING, description: `The target goal` },
              steps: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    description: { type: Type.STRING },
                    youtubeQuery: { type: Type.STRING, description: "A search query for finding free YouTube tutorials" }
                  },
                  required: ["title", "duration", "description", "youtubeQuery"]
                }
              }
            },
            required: ["base", "goal", "steps"]
          }
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text || '{}');
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setRoadmapLoading(false);
    }
  };

  const analyzeGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Fetch GitHub Repositories
      const ghRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`);
      if (!ghRes.ok) {
        if (ghRes.status === 404) {
          throw new Error('GitHub user not found. Please check the username.');
        } else {
          throw new Error('Failed to fetch from GitHub API (Rate limit might be exceeded).');
        }
      }
      
      const repos = await ghRes.json();
      if (repos.length === 0) {
        throw new Error('No public repositories found for this user.');
      }

      // Simplify data to send to Gemini
      const repoData = repos.map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        topics: r.topics
      }));

      // 2. Call Gemini AI to analyze the data
      const prompt = `Analyze the following GitHub repository data for user '${username}'. 
Data: ${JSON.stringify(repoData, null, 2)}
      
Provide an unbiased 'Skill DNA' assessment in ${language}. 
Look past traditional societal biases like CGPA or university prestige, and purely evaluate their technical skills, logical structuring, and potential soft skills demonstrated by the projects.

Specifically, include:
1. A summary of their DNA.
2. Top 5 skills.
3. A DNA score (0-100).
4. A 'Target Job' they are ready for.
5. A 'Recommended Roadmap' focus to reach the next level.`;

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: `A comprehensive paragraph explaining their strengths, dominant logic, and skill DNA` },
              topSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of 3-5 key technical or soft skills discovered" },
              dnaScore: { type: Type.NUMBER, description: "A score from 0 to 100 mapping their overall skill depth based on repo complexity" },
              targetJob: { type: Type.STRING, description: "A specific job role recommendation" },
              recommendedRoadmap: { type: Type.STRING, description: "A concise roadmap focus" }
            },
            required: ["summary", "topSkills", "dnaScore", "targetJob", "recommendedRoadmap"]
          }
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text || '{}');
      setResult({
        ...data,
        reposAnalyzed: repos.length
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeLinkedIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileText.trim()) return;
    
    setLinkedinLoading(true);
    setError('');
    setLinkedinResult(null);

    try {
      const prompt = `You are the core engine of EduGenome AI. Your goal is to provide a Bias-Free Technical Evaluation of a candidate.

Input: I will provide a text-based scrape of a candidate's LinkedIn profile and project descriptions.

Your Task:
1. Ignore Bias: Completely ignore the candidate's name, gender, college name, and CGPA.
2. Scan Projects: Identify the technical complexity of their projects (e.g., MERN stack, Java, Python).
3. Evaluate Logic: Based on their project descriptions, rate their logical thinking and problem-solving ability.
4. Generate Output: Provide a 'Skill DNA Score' in the requested JSON format format in ${language}. Include a 'targetJob' recommendation and a 'recommendedRoadmap' focus.

Data:
${profileText}`;

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technicalLogic: { type: Type.NUMBER, description: "Technical Logic score 1-100" },
              architectureAndDesign: { type: Type.NUMBER, description: "Architecture & Design score 1-100" },
              innovationLevel: { type: Type.NUMBER, description: "Innovation Level score 1-100" },
              top3VerifiedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of top 3 verified skills" },
              unbiasedSummary: { type: Type.STRING, description: `A 2-line summary of their capability focusing only on Proof of Work` },
              targetJob: { type: Type.STRING, description: "Recommended job role" },
              recommendedRoadmap: { type: Type.STRING, description: "Concise growth roadmap focus" }
            },
            required: ["technicalLogic", "architectureAndDesign", "innovationLevel", "top3VerifiedSkills", "unbiasedSummary", "targetJob", "recommendedRoadmap"]
          }
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text || '{}');
      setLinkedinResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during LinkedIn analysis.');
    } finally {
      setLinkedinLoading(false);
    }
  };

  const generateProblem = async () => {
    setIsGeneratingProblem(true);
    setError('');
    setLogicScore(null);
    setLogicAnswer('');
    
    try {
      let contextStr = "";
      if (result) {
        contextStr = `The candidate has a Skill DNA score of ${result.dnaScore}. Their top skills are: ${result.topSkills.join(', ')}. Target job: ${result.targetJob}.`;
      } else if (linkedinResult) {
        contextStr = `The candidate has a Technical Logic score of ${linkedinResult.technicalLogic}, Architecture score of ${linkedinResult.architectureAndDesign}. Top skills: ${linkedinResult.top3VerifiedSkills.join(', ')}.`;
      }

      const prompt = `Generate a ${logicDifficulty} difficulty practical coding problem focused on algorithmic and logical problem solving. 
      ${contextStr ? `IMPORTANT: Personalize this problem for a candidate with the following skill profile to challenge their specific strengths: ${contextStr}` : 'The problem should be a general technical challenge.'}
      The problem should involve a real-world scenario.
      Do NOT provide code or syntax. Describe the scenario in ${language}. 
      Ensure the tone is encouraging and focused on evaluating raw logical thinking, independent of any specific programming language. 
      At the end, ask the user to explain how they would solve it step-by-step in plain language.`;
      
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      setLogicProblem(result.response.text() || '');
    } catch(err: any) {
      setError(err.message || "Failed to generate logic problem");
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  const evaluateLogic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logicAnswer.trim()) return;
    setLogicLoading(true);
    setError('');
    
    try {
      const prompt = `You are assessing a user's logical problem-solving ability for software engineering.
Problem given to user: ${logicProblem}
User's Answer (in ${language} or any other language they chose): ${logicAnswer}

Please analyze their logical approach, completely ignoring English proficiency or any syntax errors if they used pseudo-code. 
Score their "Logical Accuracy" from 0 to 100 based purely on how they broke down the problem, their algorithmic thinking, and their edge-case handling.
Provide a constructive feedback paragraph explaining their logical strengths and areas for improvement in ${language}.`;

      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Logical Accuracy score (0-100)" },
              feedback: { type: Type.STRING, description: `Constructive feedback on their thought process` }
            },
            required: ["score", "feedback"]
          }
        }
      });
      
      const resultValue = await model.generateContent(prompt);
      const textVal = resultValue.response.text();
      const data = JSON.parse(textVal || '{}');
      setLogicScore(data);
    } catch(err: any) {
      setError(err.message || "Failed to evaluate logic");
    } finally {
      setLogicLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setVideoFile(null);
      setSsScore(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      setVideoStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      setError('Could not access camera/microphone. Please allow permissions.');
    }
  };

  const startRecording = () => {
    if (!videoStream) return;
    // We use webm as a widely supported format for Gemini multimodal
    const recorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoFile(blob);
    };
    setMediaRecorder(recorder);
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const analyzeSoftSkill = async () => {
    if (!videoFile) return;
    setSsLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          
          const prompt = `Analyze this video introduction where the candidate speaks in ${language}. Ignore the picture quality. Evaluate the tone, confidence, body language, and communication style. Provide a 'Soft-Skill DNA' score from 0 to 100 representing their readiness for a global corporate environment. Also provide constructive feedback and tips for improvement in ${language}.`;

          const model = ai.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER, description: "Soft skills score (0-100)" },
                  tone: { type: Type.STRING, description: "One or two words describing their tone" },
                  feedback: { type: Type.STRING, description: `Constructive feedback on their soft skills, written in ${language}` }
                },
                required: ["score", "tone", "feedback"]
              }
            }
          });

          const result = await model.generateContent([
            {
              inlineData: {
                mimeType: videoFile.type || "video/webm",
                data: base64data
              }
            },
            {text: prompt}
          ]);
          
          const text = result.response.text();
          const data = JSON.parse(text || '{}');
          setSsScore(data);
        } catch (err: any) {
          setError(err.message || "Failed to analyze soft skills video");
        } finally {
          setSsLoading(false);
        }
      };
    } catch(err: any) {
      setError(err.message || "Failed to process video");
      setSsLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen flex flex-col font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 pt-1">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-900 fill-current mb-1" xmlns="http://www.w3.org/2000/svg">
               <path d="M19 4C19 3.44772 18.5523 3 18 3H6C4.34315 3 3 4.34315 3 6V18C3 19.6569 4.34315 21 6 21H18C18.5523 21 19 20.5523 19 20C19 19.4477 18.5523 19 18 19H8C6.89543 19 6 18.1046 6 17V7C6 5.89543 6.89543 5 8 5H18C18.5523 5 19 4.55232 19 4Z"/>
               <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16Z"/>
            </svg>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-1 z-10 -ml-3 border-2 border-slate-900">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">EduGenome <span className="text-indigo-400">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setViewMode(viewMode === 'candidate' ? 'recruiter' : 'candidate')}
            className={`text-xs font-semibold px-4 py-2 ${viewMode === 'candidate' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'} text-white rounded-full shadow-lg transition-colors`}
          >
            {viewMode === 'candidate' ? 'Recruiter Login' : 'Student Portal'}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      {viewMode === 'candidate' ? (
        <main className="flex-1 flex flex-col lg:flex-row p-8 lg:p-16 gap-8 overflow-hidden">
          
          {/* Left Side: Action & Intro */}
        <div className="lg:w-2/5 flex flex-col justify-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6 w-fit animate-in fade-in slide-in-from-left duration-700">
            <Dna className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">EduGenome AI • Beta v1.0</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6 tracking-tighter">
            Decoding your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              Technical DNA.
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-md font-medium">
            Moving beyond academic borders. We replace 'Mark Sheets' with 'Skill Genomes' to help high-talent students get the global jobs they deserve.
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('vision')}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              The "Why" Behind EduGenome
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-5 text-slate-300">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Skill DNA Mapping</p>
                <p className="text-xs text-slate-500">AI-driven analysis of codebase and design patterns.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Hyper-Localization</p>
                <p className="text-xs text-slate-500">Solve logic problems in Tulu, Kannada, Konkani, or Hindi.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bias-Blind Hiring</p>
                <p className="text-xs text-slate-500">Recruiters see your performance, not your CGPA or College.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Interaction & Result */}
        <div className="lg:w-3/5 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center overflow-y-auto">
          <div className="w-full max-w-xl mx-auto z-10 relative">
            
            <div className="flex bg-slate-800/80 p-1.5 rounded-xl mb-10 w-full max-w-2xl flex-wrap overflow-x-auto scroolbar-hide">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <TrendingUp className="w-3.5 h-3.5 hidden sm:block" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('github')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'github' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <Github className="w-3.5 h-3.5 hidden sm:block" /> GitHub
              </button>
              <button 
                onClick={() => setActiveTab('linkedin')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'linkedin' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <Linkedin className="w-3.5 h-3.5 hidden sm:block" /> Profile
              </button>
              <button 
                onClick={() => setActiveTab('logic')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'logic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <BrainCircuit className="w-3.5 h-3.5 hidden sm:block" /> Logic
              </button>
              <button 
                onClick={() => setActiveTab('softskill')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'softskill' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <Video className="w-3.5 h-3.5 hidden sm:block" /> Soft-Skill
              </button>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'roadmap' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <Route className="w-3.5 h-3.5 hidden sm:block" /> Roadmap
              </button>
              <button 
                onClick={() => setActiveTab('bridge')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'bridge' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <MessageSquare className="w-3.5 h-3.5 hidden sm:block" /> Bridge
              </button>
              <button 
                onClick={() => setActiveTab('vision')}
                className={`flex-1 min-w-[80px] py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'vision' ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
              >
                <Lightbulb className="w-3.5 h-3.5 hidden sm:block text-amber-400" /> The Why
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'dashboard' && 'Your Merit DNA Dashboard'}
                {activeTab === 'github' && 'Generate your Skill DNA'}
                {activeTab === 'linkedin' && 'Bias-Free Profile Analysis'}
                {activeTab === 'logic' && 'Logic-First Assessment'}
                {activeTab === 'softskill' && 'Soft-Skill Genome Coach'}
                {activeTab === 'roadmap' && 'Zero-to-Hero Genetic Roadmap'}
                {activeTab === 'bridge' && 'Real-Time Multilingual Interview Bridge'}
                {activeTab === 'vision' && 'The Vision: Beyond Academic Borders'}
              </h2>
              <p className="text-slate-400 text-sm">
                {activeTab === 'dashboard' && "Track your cross-lingual logic scores, technical DNA velocity, and verified merits."}
                {activeTab === 'github' && 'Enter your GitHub username to authorize an AI-driven repository scan.'}
                {activeTab === 'linkedin' && 'Paste your LinkedIn profile text for unbiased technical evaluation.'}
                {activeTab === 'logic' && 'Solve a logic problem in your native language to prove your algorithmic thinking.'}
                {activeTab === 'softskill' && 'Record a 30-second video introduction in any language to evaluate your communication readiness.'}
                {activeTab === 'roadmap' && 'Get a custom DNA growth plan with free multilingual tutorials based on your strengths.'}
                {activeTab === 'bridge' && 'Speak in your native language; recruiters hear English in real-time.'}
                {activeTab === 'vision' && 'Decoding the DNA of technical talent by removing academic and linguistic bias.'}
              </p>
            </div>

            {/* Global Language Selector (Applied to both tabs) */}
            <div className="space-y-2 mb-6">
              <label htmlFor="language" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Assessment Language</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select 
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all"
                >
                  <optgroup label="Global">
                    <option value="Auto-Detect">Auto-Detect</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </optgroup>
                  <optgroup label="Indian Regional">
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Konkani">Konkani (कोंकणी)</option>
                    <option value="Tulu">Tulu (ತುಳು)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* --- DASHBOARD TAB CONTENT --- */}
            {activeTab === 'dashboard' && (
              <StudentDashboard username={username} language={language} githubResult={result} notifications={notifications} />
            )}

            {/* --- GITHUB TAB CONTENT --- */}
            {activeTab === 'github' && (
              <form onSubmit={analyzeGitHub} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="github" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">GitHub Username</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="github"
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      id="email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. developer@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !username}
                  className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Repos...</>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                        Connect GitHub & Analyze
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* --- LINKEDIN TAB CONTENT --- */}
            {activeTab === 'linkedin' && (
              <form onSubmit={analyzeLinkedIn} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="profileText" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">LinkedIn Profile</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <textarea 
                      id="profileText"
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      placeholder="Paste your LinkedIn text and summary here..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition-all min-h-[150px]"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={linkedinLoading || !profileText}
                  className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {linkedinLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Extracting Proof of Work...</>
                    ) : (
                      <>
                        <Linkedin className="w-5 h-5" />
                        Analyze Profile
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* --- LOGIC FIRST TAB CONTENT --- */}
            {activeTab === 'logic' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Select Difficulty</p>
                  <div className="flex gap-2">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setLogicDifficulty(diff)}
                        className={`flex-1 py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${
                          logicDifficulty === diff 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {!logicProblem ? (
                  <div className="space-y-4">
                    {(result || linkedinResult) && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-in fade-in duration-700">
                        <Dna className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">DNA-Personalized Mode Active</span>
                      </div>
                    )}
                    <button 
                      onClick={generateProblem}
                      disabled={isGeneratingProblem}
                      className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-900 font-bold py-4 px-6 rounded-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        {isGeneratingProblem ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Tailoring Problem to your DNA...</>
                        ) : (
                          <><AlignLeft className="w-5 h-5" /> { (result || linkedinResult) ? 'Start Personalized Assessment' : 'Generate General Assessment' }</>
                        )}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-5 bg-slate-800 border border-slate-700 rounded-2xl relative">
                      <button 
                        onClick={generateProblem} 
                        className="absolute top-3 right-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 disabled:opacity-50"
                        disabled={isGeneratingProblem}
                      >
                        {isGeneratingProblem && <Loader2 className="w-3 h-3 animate-spin"/>}
                        {isGeneratingProblem ? 'Regenerating...' : 'Regenerate'}
                      </button>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block">Scenario</h3>
                      <p className="text-sm leading-relaxed text-slate-200 mt-1 whitespace-pre-wrap">
                        {logicProblem}
                      </p>
                    </div>

                    {!logicScore ? (
                      <form onSubmit={evaluateLogic} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="logicAnswer" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Your Logical Approach</label>
                          <textarea 
                            id="logicAnswer"
                            value={logicAnswer}
                            onChange={(e) => setLogicAnswer(e.target.value)}
                            placeholder="Explain how you would solve this step-by-step..."
                            className="w-full p-4 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500 transition-all min-h-[160px] resize-y"
                            required
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={logicLoading || !logicAnswer}
                          className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500"
                        >
                          {logicLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating logic...</>
                          ) : (
                            <><Send className="w-4 h-4" /> Submit Logic for Review</>
                          )}
                        </button>
                      </form>
                    ) : (
                       <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium">Logic Accuracy Report</h3>
                                <h2 className="text-2xl font-bold text-white">Assessment Complete</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-purple-400">
                                {logicScore.score}<span className="text-xl">/100</span>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Logic Score</p>
                            </div>
                        </div>

                        <div className="p-6 bg-purple-950/30 border border-purple-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span className="text-xs font-bold text-purple-300 uppercase">Gemini 1.5 Flash Review</span>
                            </div>
                            <p className="text-sm italic text-slate-300 leading-relaxed whitespace-pre-wrap">
                                "{logicScore.feedback}"
                            </p>
                        </div>
                        
                        <button 
                            onClick={generateProblem} 
                            disabled={isGeneratingProblem}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {isGeneratingProblem ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Problem...</>
                            ) : (
                                "Try Another Problem"
                            )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- SOFTSKILL TAB CONTENT --- */}
            {activeTab === 'softskill' && (
              <div className="space-y-6">
                {!videoFile && !ssScore && (
                  <div className="flex flex-col gap-4">
                    {!videoStream ? (
                      <button 
                        onClick={startCamera}
                        className="w-full flex items-center justify-center gap-3 bg-slate-800 text-white font-bold py-16 px-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
                      >
                         <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-white transition-colors">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Video className="w-8 h-8 text-indigo-400" />
                            </div>
                            <span>Enable Camera & Mic for 30s Intro</span>
                         </div>
                      </button>
                    ) : (
                      <div className="rounded-2xl overflow-hidden bg-black border border-slate-700 relative aspect-video">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          muted 
                          playsInline 
                          className={`w-full h-full object-cover transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-80'}`}
                        />
                        
                        {/* Recording Indicator */}
                        {isRecording && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-red-500/30">
                             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
                             <span className="text-xs font-bold text-white font-mono tracking-wider">REC</span>
                          </div>
                        )}
                        
                        {/* Controls */}
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                           {!isRecording ? (
                              <button 
                                onClick={startRecording}
                                className="w-16 h-16 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white outline outline-4 outline-white/20 outline-offset-2"
                              >
                                <Mic className="w-6 h-6" />
                              </button>
                           ) : (
                              <button 
                                onClick={stopRecording}
                                className="w-16 h-16 bg-slate-900/80 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline outline-4 outline-red-500/50 outline-offset-2"
                              >
                                <StopCircle className="w-8 h-8 text-red-500" />
                              </button>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {videoFile && !ssScore && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-2xl overflow-hidden bg-black border border-slate-700 aspect-video relative">
                      <video 
                        src={URL.createObjectURL(videoFile)} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => { setVideoFile(null); startCamera(); }}
                        disabled={ssLoading}
                        className="flex-1 py-4 text-sm font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" /> Retake
                      </button>
                      <button 
                        onClick={analyzeSoftSkill}
                        disabled={ssLoading}
                        className="flex-[2] py-4 text-sm font-semibold rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 flex items-center justify-center gap-2 transition-all disabled:opacity-50 group overflow-hidden relative"
                      >
                         <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                         <span className="relative z-10 flex items-center gap-2">
                          {ssLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing soft traits...</>
                          ) : (
                            <><Sparkles className="w-5 h-5" /> Analyze Genome</>
                          )}
                         </span>
                      </button>
                    </div>
                  </div>
                )}

                {ssScore && !ssLoading && (
                  <div className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-slate-400 text-sm font-medium">Soft-Skill DNA Report</h3>
                            <h2 className="text-2xl font-bold text-white">Assessment Complete</h2>
                            <span className="inline-block mt-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-full border border-cyan-500/20">Tone: {ssScore.tone}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black text-cyan-400">
                              {ssScore.score}<span className="text-xl">/100</span>
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Confidence Score</p>
                        </div>
                    </div>

                    <div className="p-6 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            <span className="text-xs font-bold text-cyan-300 uppercase">Gemini 1.5 Flash Insight</span>
                        </div>
                        <p className="text-sm italic text-slate-300 leading-relaxed whitespace-pre-wrap">
                            "{ssScore.feedback}"
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => { setSsScore(null); setVideoFile(null); }} 
                        className="mt-6 w-full py-3 text-sm font-semibold border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Re-assess Soft Skills
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- ROADMAP TAB CONTENT --- */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                {!roadmap ? (
                  <form onSubmit={generateRoadmap} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="roadmapInput" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Your Current Status</label>
                      <textarea 
                        id="roadmapInput"
                        value={roadmapInput}
                        onChange={(e) => setRoadmapInput(e.target.value)}
                        placeholder="E.g., I'm good at math but have zero programming knowledge. I want to build AI apps."
                        className="w-full p-4 bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500 transition-all min-h-[120px] resize-y"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={roadmapLoading || !roadmapInput}
                      className="w-full flex items-center justify-center gap-3 bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        {roadmapLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Generating Genome...</>
                        ) : (
                          <><Route className="w-4 h-4" /> Build DNA Growth Plan</>
                        )}
                      </span>
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-slate-400 text-sm font-medium">Genetic Growth Plan</h3>
                            <h2 className="text-2xl font-bold text-white">Your Evolution Roadmap</h2>
                        </div>
                        <div className="text-right">
                            <Target className="w-8 h-8 text-amber-400 opacity-80" />
                        </div>
                    </div>

                    <div className="p-5 bg-amber-950/30 border border-amber-500/20 rounded-2xl mb-6">
                      <p className="text-sm text-amber-100 mb-2 font-medium">Starting DNA: <span className="text-amber-300 font-normal">{roadmap.base}</span></p>
                      <p className="text-sm text-amber-100 font-medium">Target DNA: <span className="text-amber-300 font-normal">{roadmap.goal}</span></p>
                    </div>

                    <div className="space-y-4">
                      {roadmap.steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6 pb-2">
                          {idx !== roadmap.steps.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-700"></div>
                          )}
                          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          </div>
                          <div className="bg-slate-800/80 rounded-xl p-4 ml-4 border border-slate-700/50 hover:border-amber-500/30 transition-all">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                              <h4 className="font-bold text-amber-400 text-sm">{step.title}</h4>
                              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md shrink-0 border border-slate-800">{step.duration}</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-4">{step.description}</p>
                            <a 
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.youtubeQuery)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
                            >
                              <Play className="w-3 h-3 text-red-500" /> Watch "{step.youtubeQuery}" Tutorials
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                        onClick={() => setRoadmap(null)} 
                        className="mt-6 w-full py-3 text-sm font-semibold border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        Start Over
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* --- BRIDGE TAB CONTENT --- */}
            {activeTab === 'bridge' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Left Column: Student Native Side */}
                  <div className="flex-1 bg-slate-900 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-pink-500/50"></div>
                    <div className="flex items-center gap-3 w-full justify-between mb-8">
                       <span className="bg-slate-800 border border-slate-700 text-xs px-3 py-1 rounded-full text-slate-300 font-bold flex items-center gap-2">
                          <Mic className="w-3 h-3 text-pink-400" /> Student Mic
                       </span>
                       <span className="text-pink-400 text-xs font-bold bg-pink-500/10 px-2 py-1 rounded-md">{language}</span>
                    </div>

                    {!isListening ? (
                      <button 
                        onClick={startListening}
                        className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center hover:bg-slate-700 hover:border-pink-500 transition-all text-white relative group"
                      >
                         <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                         <span className="absolute -bottom-8 text-xs font-bold text-slate-400 whitespace-nowrap group-hover:text-pink-400">Tap to Speak</span>
                      </button>
                    ) : (
                      <button 
                         onClick={stopListening}
                         className="w-24 h-24 rounded-full bg-pink-500/20 border-2 border-pink-500 flex items-center justify-center relative shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                      >
                         <div className="absolute inset-0 rounded-full border-2 border-pink-500 animate-ping"></div>
                         <StopCircle className="w-10 h-10 text-pink-400" />
                         <span className="absolute -bottom-8 text-xs font-bold text-pink-400 whitespace-nowrap">Listening...</span>
                      </button>
                    )}

                    <div className="mt-12 w-full text-left">
                       <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Live Transcript ({language})</h4>
                       <div className="w-full h-32 bg-black/40 rounded-xl p-4 border border-slate-800 overflow-y-auto text-sm text-slate-300">
                          {bridgeTranscript || interimTranscript ? (
                             <>
                               {bridgeTranscript}
                               {interimTranscript && <span className="text-slate-500 italic ml-1">{interimTranscript}</span>}
                             </>
                          ) : (
                             <span className="text-slate-600 italic">No speech detected yet. Start speaking...</span>
                          )}
                       </div>
                    </div>

                    {recruiterAnswerTranslated && (
                       <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 flex gap-3 items-start">
                             <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-pink-500/30">
                                <MessageSquare className="w-3 h-3 text-pink-400" />
                             </div>
                             <div className="text-left">
                                <div className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1">Recruiter Response ({language})</div>
                                <p className="text-sm text-white font-medium italic">"{recruiterAnswerTranslated}"</p>
                             </div>
                          </div>
                       </div>
                    )}
                  </div>

                  {/* Icon Separator */}
                  <div className="hidden lg:flex flex-col items-center justify-center min-w-[120px]">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${translating ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] scale-110' : 'bg-slate-800 text-slate-400'}`}>
                        {translating ? <Sparkles className="w-6 h-6 animate-pulse" /> : <ChevronRight className="w-6 h-6" />}
                     </div>
                     <div className={`h-10 mt-3 flex flex-col items-center transition-opacity duration-300 ${translating ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                       <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                         <Loader2 className="w-3 h-3 animate-spin" /> Gemini AI
                       </span>
                       <span className="text-[9px] text-slate-500 uppercase tracking-widest">Translating</span>
                     </div>
                  </div>

                  {/* Right Column: Recruiter English Side */}
                  <div className="flex-1 bg-slate-900 border border-slate-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-emerald-500/50"></div>
                    
                    <div className="flex items-center gap-3 w-full justify-between mb-8">
                       <span className="bg-slate-800 border border-slate-700 text-xs px-3 py-1 rounded-full text-slate-300 font-bold flex items-center gap-2">
                          <Headphones className="w-3 h-3 text-emerald-400" /> Recruiter Hears
                       </span>
                       <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-md">English</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-[280px] mx-auto text-center mb-4">
                        <div className="relative inline-block mx-auto mb-3">
                          <Globe className="w-16 h-16 text-emerald-400 animate-[pulse_3s_infinite]" />
                          <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full"></div>
                        </div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-1">Global Helix Active</h3>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Recruiter Listening</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Your Skill DNA is being beamed to the global talent network in real-time.</p>
                    </div>

                    <div className="mt-auto w-full text-left relative">
                       {translating && (
                         <div className="absolute -top-6 right-0 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                           <Loader2 className="w-3 h-3 animate-spin" /> Translating via Gemini...
                         </div>
                       )}
                       <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-widest">Real-Time English Output</h4>
                       <div className="w-full h-32 bg-black/40 rounded-xl p-4 border border-slate-800 overflow-y-auto text-sm text-emerald-300 font-medium leading-relaxed mb-4">
                          {bridgeTranslation ? (
                             <div className="animate-in fade-in duration-500">
                               "{bridgeTranslation}"
                               {translating && <span className="inline-block ml-2 w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>}
                             </div>
                          ) : translating ? (
                             <div className="flex items-center gap-2 text-emerald-500 italic font-medium"><Loader2 className="w-4 h-4 animate-spin"/> Translating via Gemini...</div>
                          ) : (
                             <span className="text-slate-600 italic font-normal">Waiting for speech...</span>
                          )}
                       </div>

                       {/* Recruiter Response Input */}
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recruiter Response (English)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={recruiterResponseInput}
                              onChange={(e) => setRecruiterResponseInput(e.target.value)}
                              placeholder="Type your response to the student..."
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                              onKeyDown={(e) => e.key === 'Enter' && handleManualRecruiterResponse()}
                            />
                            <button 
                              onClick={handleManualRecruiterResponse}
                              disabled={!recruiterResponseInput.trim() || isRecruiterResponding}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                    </div>

                    {isRecruiterResponding && (
                       <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                          <Loader2 className="w-4 h-4 animate-spin" /> Recruiter is thinking...
                       </div>
                    )}

                    {recruiterAnswer && (
                       <div className="mt-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start overflow-hidden relative group">
                             <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                <Headphones className="w-3 h-3 text-emerald-400" />
                             </div>
                             <div className="text-left">
                                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                   Recruiter Answer (English)
                                   <span className="flex items-center gap-1 text-[8px] bg-emerald-500/20 px-1 rounded animate-pulse">Live</span>
                                </div>
                                <p className="text-sm text-white font-medium italic">"{recruiterAnswer}"</p>
                             </div>
                             <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/50 group-hover:w-2 transition-all"></div>
                          </div>
                       </div>
                    )}

                    {bridgeTranslation && !isListening && !isRecruiterResponding && (
                      <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {recruiterVerdict ? (
                          <div className="bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white font-black text-xs uppercase tracking-tight">Recruiter's Analysis</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Based on Interview DNA</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/20 p-3 rounded-xl border border-slate-700">
                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Target Job</div>
                                <div className="text-sm font-bold text-white uppercase">{recruiterVerdict.job}</div>
                              </div>
                              <div className="bg-black/20 p-3 rounded-xl border border-slate-700">
                                <div className="text-[9px] font-black text-pink-400 uppercase tracking-widest mb-1">Recommended Roadmap</div>
                                <div className="text-sm font-bold text-white uppercase">{recruiterVerdict.roadmap}</div>
                              </div>
                            </div>
                            
                            <div className="bg-black/20 p-4 rounded-xl border border-slate-700">
                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Why this fits</div>
                              <p className="text-xs text-slate-300 leading-relaxed italic">"{recruiterVerdict.explanation}"</p>
                            </div>

                            <button 
                              onClick={() => setRecruiterVerdict(null)}
                              className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-slate-600"
                            >
                              Start New Session
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={generateRecruiterVerdict}
                            disabled={isAnalyzingBridge}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group overflow-hidden relative"
                          >
                             {isAnalyzingBridge ? (
                               <>
                                 <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Interview...
                               </>
                             ) : (
                               <>
                                 <BrainCircuit className="w-4 h-4 group-hover:scale-125 transition-transform" /> 
                                 <span>Get Recruiter Verdict</span>
                                 <div className="absolute inset-y-0 left-0 w-12 bg-white/10 skew-x-[-20deg] -translate-x-full group-hover:translate-x-[500px] transition-transform duration-1000"></div>
                               </>
                             )}
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}

            {/* Error Details */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium border border-red-500/20">
                {error}
              </div>
            )}

            {/* --- VISION/WHY TAB CONTENT --- */}
            {activeTab === 'vision' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 pb-10">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">The Problem (The "Why")</h3>
                      <h4 className="text-2xl md:text-3xl font-black leading-tight mb-6">
                        "CGPA and language proficiency act as artificial gatekeepers, excluding millions from the workforce."
                      </h4>
                      <p className="text-indigo-50 text-sm leading-relaxed max-w-xl">
                        In regions like Karnataka, thousands of students from 'Tier 2 & 3' colleges possess advanced skills but remain invisible to global recruiters because of arbitrary academic cut-offs.
                      </p>
                   </div>
                   <Dna className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                            <Target className="w-4 h-4 text-pink-400" />
                         </div>
                         <h5 className="font-bold text-white uppercase text-xs tracking-widest">Skill DNA Mapping</h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instead of CGPA, we analyze GitHub repositories, project architecture, and code quality to generate a Dynamic Merit Score ($S_d$).
                      </p>
                   </div>
                   <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                            <Languages className="w-4 h-4 text-cyan-400" />
                         </div>
                         <h5 className="font-bold text-white uppercase text-xs tracking-widest">Hyper-Localization</h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                         Assessments are provided in local dialects (Tulu, Konkani, etc.), allowing logic to be proved in the candidate's most comfortable language.
                      </p>
                   </div>
                </div>

                <div className="p-8 bg-slate-950 border border-slate-800 rounded-3xl">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 text-center">Research & Evidence</h3>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
                      <div className="space-y-1">
                         <p className="text-3xl font-black text-white">90%</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase">Non-English Fluent</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-3xl font-black text-indigo-400">Low</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase">GPA-Job Link</p>
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                         <p className="text-3xl font-black text-emerald-400">Zero</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase">Bias Tolerance</p>
                      </div>
                   </div>
                </div>

                <div className="text-center p-6 italic text-slate-400 text-sm border-t border-slate-800 flex flex-col items-center gap-4">
                   <p>"We’re decoding true technical DNA to help the world's most talented students get the global jobs they deserve."</p>
                   <button 
                     onClick={() => {
                       setOnboardingStep(0);
                       setShowOnboarding(true);
                       setActiveTab('github');
                     }}
                     className="mt-4 px-4 py-2 border border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all"
                   >
                     🚀 Restart Guided Tour
                   </button>
                </div>
              </div>
            )}
            {activeTab === 'github' && result && !loading && (
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-slate-400 text-sm font-medium">Skill DNA Report for</h3>
                    <h2 className="text-2xl font-bold text-white">@{username}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-indigo-400">
                      {result.dnaScore}<span className="text-xl">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Verified Score</p>
                  </div>
                </div>

                <div className="p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-xs font-bold text-indigo-300 uppercase">Gemini 1.5 Flash Insight</span>
                  </div>
                  <p className="text-sm italic text-slate-300 leading-relaxed">
                    "{result.summary}"
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top Detected Skills based on {result.reposAnalyzed} Repos</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.topSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 inline-block shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl animate-in fade-in slide-in-from-left-4 duration-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase letter-spacing-widest">Target Job Role</span>
                    </div>
                    <p className="text-xl font-black text-white mb-2">{result.targetJob}</p>
                    <p className="text-xs text-slate-500 font-medium">Based on your cumulative Project Velocity and Skill DNA alignment.</p>
                  </div>
                  
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300 uppercase letter-spacing-widest">Recommended Roadmap</span>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed markdown-container">
                      <Markdown>{result.recommendedRoadmap}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn DNA Score Result */}
            {activeTab === 'linkedin' && linkedinResult && !linkedinLoading && (
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                   <h3 className="text-slate-400 text-sm font-medium">Bias-Free Profile DNA Report</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Technical Logic</p>
                    <div className="text-3xl font-black text-emerald-400">{linkedinResult.technicalLogic}<span className="text-lg">/100</span></div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Architecture</p>
                    <div className="text-3xl font-black text-indigo-400">{linkedinResult.architectureAndDesign}<span className="text-lg">/100</span></div>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Innovation</p>
                    <div className="text-3xl font-black text-pink-400">{linkedinResult.innovationLevel}<span className="text-lg">/100</span></div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-indigo-300 uppercase">Unbiased Summary (Proof of Work)</span>
                  </div>
                  <p className="text-sm italic text-slate-300 leading-relaxed">
                    "{linkedinResult.unbiasedSummary}"
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top 3 Verified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {linkedinResult.top3VerifiedSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 inline-block shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800 pt-8">
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Recommended Role</span>
                    </div>
                    <p className="text-xl font-black text-white">{linkedinResult.targetJob}</p>
                  </div>
                  
                  <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Skill DNA Roadmap</span>
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed">
                      <Markdown>{linkedinResult.recommendedRoadmap}</Markdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative Background Effects Base on Tab */}
          {activeTab === 'linkedin' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}
          {activeTab === 'logic' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}
          {activeTab === 'github' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}
          {activeTab === 'softskill' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}
          {activeTab === 'roadmap' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}
          {activeTab === 'bridge' && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000"></div>
          )}

          {/* DNA Helix Decorative Element */}
          <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
            <svg width="300" height="400" viewBox="0 0 100 200" className="transform rotate-12 translate-x-12 translate-y-12">
              <path d="M30,20 Q70,50 30,80 T30,140" stroke="white" strokeWidth="2" fill="none" />
              <path d="M70,20 Q30,50 70,80 T70,140" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          {/* "AI ANALYSIS ACTIVE" text showing when result exists */}
          {activeTab === 'linkedin' && linkedinResult && !linkedinLoading && (
            <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">AI ANALYSIS COMPLETE</span>
            </div>
          )}
          {activeTab === 'github' && result && !loading && (
            <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-full border border-green-500/20">AI ANALYSIS COMPLETE</span>
            </div>
          )}
          {activeTab === 'logic' && logicScore && !logicLoading && (
            <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/20">AI LOGIC SCORED</span>
            </div>
          )}
          {activeTab === 'softskill' && ssScore && !ssLoading && (
            <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20">AI CAMERA ANALYZED</span>
            </div>
          )}
          {activeTab === 'roadmap' && roadmap && !roadmapLoading && (
            <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20">DNA ROADMAP GENERATED</span>
            </div>
          )}
          {activeTab === 'bridge' && (
             <div className="absolute top-0 right-0 p-8 z-10 pointer-events-none hidden lg:block">
               <span className="px-3 py-1 bg-pink-500/10 text-pink-400 text-[10px] font-bold rounded-full border border-pink-500/20 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-pink-500 animate-pulse' : 'bg-slate-600'}`}></div>
                 LIVE INTERPRETER
               </span>
             </div>
          )}
          {/* Guided Onboarding Tour */}
          {showOnboarding && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                <div className="relative h-48 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.4),transparent_70%)]" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-4">
                      {onboardingStep === 0 && <Dna className="w-8 h-8 text-indigo-400" />}
                      {onboardingStep === 1 && <Github className="w-8 h-8 text-white" />}
                      {onboardingStep === 2 && <Linkedin className="w-8 h-8 text-cyan-400" />}
                      {onboardingStep === 3 && <BrainCircuit className="w-8 h-8 text-pink-400" />}
                      {onboardingStep === 4 && <Video className="w-8 h-8 text-emerald-400" />}
                    </div>
                  <div className="flex gap-4 items-center justify-center">
                    <button 
                      onClick={() => setShowPitchDeck(true)}
                      className="px-6 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                    >
                      <Presentation className="w-3 h-3" /> Generator Pitch Deck
                    </button>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map(step => (
                        <div key={step} className={`h-1 rounded-full transition-all duration-300 ${step === onboardingStep ? 'w-6 bg-indigo-400' : 'w-2 bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  </div>
                </div>

                <div className="p-8 text-center">
                  {onboardingStep === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-xl font-black text-white mb-3">Welcome to your Skill DNA</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Let's decode your technical potential beyond academic borders. This quick tour will show you how to generate your "Skill Genome".</p>
                    </div>
                  )}
                  {onboardingStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-xl font-black text-white mb-3">GitHub DNA Mapping</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">We analyze your repository history, issue contributions, and architectural patterns to verify your "Proof of Work" automatically.</p>
                    </div>
                  )}
                  {onboardingStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-xl font-black text-white mb-3">LinkedIn DNA Mapping</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Map your professional history into a bias-free skill genome. We extract core competencies from your LinkedIn while protecting you from unconscious hiring bias.</p>
                    </div>
                  )}
                  {onboardingStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-xl font-black text-white mb-3">Logic-First Assessment</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Prove your algorithmic thinking in your native language. We value the logic in your brain more than the syntax of your English.</p>
                    </div>
                  )}
                  {onboardingStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <h3 className="text-xl font-black text-white mb-3">Soft-Skill Genome Coach</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Record a quick introduction to evaluate communication readiness. We provide feedback on your tone and confidence instantly.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 flex gap-3">
                  {onboardingStep > 0 ? (
                    <button 
                      onClick={() => setOnboardingStep(prev => prev - 1)}
                      className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                    >
                      Previous
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowOnboarding(false)}
                      className="flex-1 py-3 text-slate-500 hover:text-white font-bold text-xs transition-all"
                    >
                      Skip Tour
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (onboardingStep < 4) {
                        setOnboardingStep(prev => prev + 1);
                        // Auto-switch tabs to show features
                        const tabs: any[] = ['github', 'github', 'linkedin', 'logic', 'softskill'];
                        setActiveTab(tabs[onboardingStep + 1]);
                      } else {
                        setShowOnboarding(false);
                        setActiveTab('github');
                      }
                    }}
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    {onboardingStep === 4 ? "Let's Begin" : "Next Step"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </main>

      ) : (
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-emerald-400" />
                "Bias-Blind" Recruiter Dashboard
              </h2>
              <p className="text-slate-400">Evaluate candidates strictly based on their Skill DNA. Identities are hidden to ensure unbiased first decisions.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Search</label>
                <Search className="absolute left-3 top-[34px] w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                />
              </div>
              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">Top Skill</label>
                <input 
                  type="text"
                  placeholder="e.g. React, Node.js"
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="pl-4 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                />
              </div>
              <div className="flex-1 w-full relative">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block">College</label>
                <input 
                  type="text"
                  placeholder="e.g. State University"
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="pl-4 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <label>Logic Score</label>
                  <span className={minLogic > 0 ? "text-amber-400" : ""}>{minLogic}+</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5" 
                  value={minLogic} onChange={(e) => setMinLogic(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg appearance-none h-2" 
                />
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <label>Tech Score</label>
                  <span className={minTech > 0 ? "text-indigo-400" : ""}>{minTech}+</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5" 
                  value={minTech} onChange={(e) => setMinTech(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-2" 
                />
              </div>
              <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <label>Soft Skill Score</label>
                  <span className={minSoft > 0 ? "text-pink-400" : ""}>{minSoft}+</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5" 
                  value={minSoft} onChange={(e) => setMinSoft(parseInt(e.target.value))}
                  className="w-full accent-pink-500 bg-slate-800 rounded-lg appearance-none h-2" 
                />
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <label>Sort By</label>
                </div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="id">Default (ID)</option>
                  <option value="logic">Logic Score</option>
                  <option value="tech">Tech Score</option>
                  <option value="soft">Soft Skill Score</option>
                  <option value="name">Candidate Name</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(() => {
              const filteredAndSortedCandidates = mockCandidates.filter(c => {
                 const query = searchQuery.toLowerCase();
                 const matchesName = (c.realName || '').toLowerCase().includes(query);
                 const matchesAlias = `candidate #${c.id}`.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
                 const matchesSearch = searchQuery.trim() === '' || matchesName || matchesAlias;
                 
                 const matchesLogic = (c.logic || 0) >= minLogic;
                 const matchesTech = (c.tech?.score || 0) >= minTech;
                 const matchesSoft = (c.soft || 0) >= minSoft;
                 
                 const skillQuery = filterSkill.toLowerCase().trim();
                 const matchesSpecificSkill = skillQuery === '' || (c.topSkills || []).some(s => s.toLowerCase().includes(skillQuery)) || (c.tech?.name || '').toLowerCase().includes(skillQuery);
                 
                 const collegeQuery = filterCollege.toLowerCase().trim();
                 const matchesCollege = collegeQuery === '' || (c.college || '').toLowerCase().includes(collegeQuery);

                 return matchesSearch && matchesLogic && matchesTech && matchesSoft && matchesSpecificSkill && matchesCollege;
              }).sort((a, b) => {
                 if (sortBy === 'logic') return b.logic - a.logic;
                 if (sortBy === 'tech') return b.tech.score - a.tech.score;
                 if (sortBy === 'soft') return b.soft - a.soft;
                 if (sortBy === 'name') return (a.realName || '').localeCompare(b.realName || '');
                 return 0;
              });

              const paginatedCandidates = filteredAndSortedCandidates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
              
              if (paginatedCandidates.length === 0) {
                return (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-10 h-10 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">No candidates found</h3>
                      <p className="text-slate-500">Try adjusting your filters or search query.</p>
                    </div>
                  </div>
                );
              }

              return paginatedCandidates.map(candidate => {
              const isRevealed = revealedCandidates[candidate.id];

              return (
                <div 
                  key={candidate.id} 
                  onClick={() => {
                    setIsOpeningDetails(true);
                    setSelectedCandidateDetails(candidate.id);
                    setTimeout(() => setIsOpeningDetails(false), 1000);
                  }}
                  className={`bg-slate-900 border rounded-2xl p-6 relative overflow-hidden transition-all cursor-pointer hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] group ${isRevealed ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-800'}`}
                >
                  {/* Anonymous / Reveal Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRevealed ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                        {isRevealed ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />}
                      </div>
                      <div>
                        <h3 className={`font-bold ${isRevealed ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} text-lg`}>
                          {isRevealed ? candidate.realName : `Candidate #${candidate.id}`}
                        </h3>
                        {isRevealed ? (
                          <p className="text-xs text-emerald-400">{candidate.college} • {candidate.cgpa} CGPA</p>
                        ) : (
                          <p className="text-xs text-slate-500">Identity Hidden</p>
                        )}
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={candidateStatuses[candidate.id] || 'New'}
                        onChange={(e) => setCandidateStatuses(prev => ({ ...prev, [candidate.id]: e.target.value as any }))}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${
                          (candidateStatuses[candidate.id] || 'New') === 'New' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                          (candidateStatuses[candidate.id] === 'Screening') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          (candidateStatuses[candidate.id] === 'Interviewing') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          (candidateStatuses[candidate.id] === 'Offered') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-slate-300">New</option>
                        <option value="Screening" className="bg-slate-900 text-slate-300">Screening</option>
                        <option value="Interviewing" className="bg-slate-900 text-slate-300">Interviewing</option>
                        <option value="Offered" className="bg-slate-900 text-slate-300">Offered</option>
                        <option value="Rejected" className="bg-slate-900 text-slate-300">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills DNA Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Algorithmic Logic</span>
                        <span className="text-purple-400 font-bold">{candidate.logic}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full" style={{ width: `${candidate.logic}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Tech ({candidate.tech.name})</span>
                        <span className="text-indigo-400 font-bold">{candidate.tech.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" style={{ width: `${candidate.tech.score}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">Soft Skills & Communication</span>
                        <span className="text-cyan-400 font-bold">{candidate.soft}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: `${candidate.soft}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles className="w-3 h-3 text-amber-400" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Recruiter Insight</span>
                    </div>
                    <p className="text-xs text-slate-400 italic">"{candidate.insight}"</p>
                  </div>

                  {/* Share DNA Summary */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Share DNA Summary</span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => {
                          const url = `https://edugenome.ai/dna/${candidate.id}`;
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-all border border-slate-700/50"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const text = `Check out this Skill DNA Profile on EduGenome AI: #${candidate.id}`;
                          const url = `https://edugenome.ai/dna/${candidate.id}`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all border border-slate-700/50"
                        title="Share on Twitter"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const subject = `Skill DNA Profile: Candidate #${candidate.id}`;
                          const body = `I found an interesting candidate on EduGenome AI. View their Skill DNA here: https://edugenome.ai/dna/${candidate.id}`;
                          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-all border border-slate-700/50"
                        title="Share via Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          handleNotifyCandidate(candidate.id, candidateStatuses[candidate.id] || 'New');
                          // Simple visual feedback could be added here if needed
                        }}
                        className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-600/40 transition-all border border-indigo-500/30"
                        title="Notify Candidate of Status Change"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button 
                         onClick={async () => {
                           const shareData = {
                             title: 'Skill DNA Profile',
                             text: `Decoding Technical DNA: Candidate #${candidate.id} profile.`,
                             url: `https://edugenome.ai/dna/${candidate.id}`,
                           };
                           try {
                             if (navigator.share) {
                               await navigator.share(shareData);
                             } else {
                               navigator.clipboard.writeText(shareData.url);
                               alert('Link copied to clipboard!');
                             }
                           } catch (err) {
                             console.error('Error sharing:', err);
                           }
                         }}
                         className="px-3 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-[10px] hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20 gap-2"
                      >
                        <Share2 className="w-3 h-3" /> Copy DNA Link
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedCandidateDetails(candidate.id)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all uppercase tracking-widest shadow-xl"
                    >
                      <BarChart2 className="w-4 h-4 text-indigo-400" /> View Full Skill DNA
                    </button>

                    <div className="flex gap-2">
                      <select 
                        value={candidateStatuses[candidate.id] || 'New'}
                        onChange={(e) => setCandidateStatuses(prev => ({ ...prev, [candidate.id]: e.target.value as any }))}
                        className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold border outline-none cursor-pointer appearance-none transition-all ${
                          (candidateStatuses[candidate.id] || 'New') === 'New' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600' :
                          (candidateStatuses[candidate.id] === 'Screening') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          (candidateStatuses[candidate.id] === 'Interviewing') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          (candidateStatuses[candidate.id] === 'Offered') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        <option value="New" className="bg-slate-900 text-slate-300">New</option>
                        <option value="Screening" className="bg-slate-900 text-slate-300">Screening</option>
                        <option value="Interviewing" className="bg-slate-900 text-slate-300">Interviewing</option>
                        <option value="Offered" className="bg-slate-900 text-slate-300">Offered</option>
                        <option value="Rejected" className="bg-slate-900 text-slate-300">Rejected</option>
                      </select>

                      <button
                        disabled={isRevealed}
                        onClick={() => setRevealedCandidates(prev => ({ ...prev, [candidate.id]: true }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isRevealed ? 'bg-emerald-500/10 text-emerald-400 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                      >
                        {isRevealed ? (
                           <>Interest Expressed</>
                        ) : (
                         <><Eye className="w-4 h-4" /> Reveal Identity</>
                      )}
                    </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedForComparison(prev => 
                              prev.includes(candidate.id) ? prev.filter(id => id !== candidate.id) : [...prev, candidate.id]
                            );
                          }}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all border ${selectedForComparison.includes(candidate.id) ? 'bg-slate-800 border-indigo-500 text-indigo-400' : 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {selectedForComparison.includes(candidate.id) ? 'Selected' : 'Compare'}
                        </button>

                        {(candidateStatuses[candidate.id] === 'Interviewing' || candidateStatuses[candidate.id] === 'Offered') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSchedulingCandidateIds([candidate.id]);
                            }}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${scheduledInterviews[candidate.id] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                          >
                            <RefreshCw className={`w-3 h-3 ${scheduledInterviews[candidate.id] ? '' : 'text-indigo-400'}`} />
                            {scheduledInterviews[candidate.id] ? 'Reschedule' : 'Schedule'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select 
                          value={candidateStatuses[candidate.id] || 'New'}
                          onChange={(e) => setCandidateStatuses(prev => ({ ...prev, [candidate.id]: e.target.value as any }))}
                          className="flex-1 bg-slate-900 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="New">Status: New</option>
                          <option value="Review">Technical Review</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Offered">Offer Extended</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => sendNotification(candidate.id, candidateStatuses[candidate.id] || 'New')}
                          disabled={isNotifying}
                          className={`flex-[1.5] py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${notificationSent ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'}`}
                        >
                          {isNotifying ? <Loader2 className="w-3 h-3 animate-spin" /> : (notificationSent ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3 text-indigo-400" />)}
                          {notificationSent ? 'Sent' : 'Notify'}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setCandidateStatuses(prev => ({ ...prev, [candidate.id]: 'Offered' }));
                        }}
                        className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${candidateStatuses[candidate.id] === 'Offered' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]'}`}
                      >
                        {candidateStatuses[candidate.id] === 'Offered' ? (
                          <><UserCheck className="w-4 h-4" /> Final Offer Sent</>
                        ) : (
                          <><Zap className="w-4 h-4 text-amber-300" /> Instant Hire (Offer)</>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Share Profile</span>
                        <Share2 className="w-3 h-3 text-slate-500" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const text = `Check out this candidate's Skill DNA! Logic Score: ${candidate.fullSkillDNA.logic}, Architecture: ${candidate.fullSkillDNA.architecture}. #SkillDNA #BiasFreeHiring`;
                            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
                          title="Share on LinkedIn"
                        >
                          <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button 
                          onClick={() => {
                            const text = `Verified Skill DNA: Logic ${candidate.fullSkillDNA.logic} | Architecture ${candidate.fullSkillDNA.architecture} | Tech ${candidate.fullSkillDNA.tech}. Bias-free technical evaluation via SkillDNA.`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
                          title="Share on Twitter"
                        >
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                        </button>
                        <button 
                          onClick={() => {
                            const subject = `Skill DNA Candidate Lead: #${candidate.id}`;
                            const body = `Anonymous Candidate Technical Profile:\n\nSkill DNA Breakdown:\n- Logic: ${candidate.fullSkillDNA.logic}\n- Architecture: ${candidate.fullSkillDNA.architecture}\n- Innovation: ${candidate.fullSkillDNA.innovation}\n- Technical Proficiency: ${candidate.fullSkillDNA.tech}\n\nTop Skills: ${candidate.topSkills.join(', ')}\n\nView full DNA breakdown on the SkillDNA Recruiter Dashboard.`;
                            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                          }}
                          className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-colors"
                          title="Share via Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
              });
            })()}
          </div>

          {/* Pagination Controls */}
          {(() => {
              const filteredCount = mockCandidates.filter(c => {
                 const query = searchQuery.toLowerCase();
                 const matchesName = (c.realName || '').toLowerCase().includes(query);
                 const matchesAlias = `candidate #${c.id}`.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
                 const matchesSearch = searchQuery.trim() === '' || matchesName || matchesAlias;
                 const matchesLogic = (c.logic || 0) >= minLogic;
                 const matchesTech = (c.tech?.score || 0) >= minTech;
                 const matchesSoft = (c.soft || 0) >= minSoft;
                 const skillQuery = filterSkill.toLowerCase().trim();
                 const matchesSpecificSkill = skillQuery === '' || (c.topSkills || []).some(s => s.toLowerCase().includes(skillQuery)) || (c.tech?.name || '').toLowerCase().includes(skillQuery);
                 const collegeQuery = filterCollege.toLowerCase().trim();
                 const matchesCollege = collegeQuery === '' || (c.college || '').toLowerCase().includes(collegeQuery);
                 return matchesSearch && matchesLogic && matchesTech && matchesSoft && matchesSpecificSkill && matchesCollege;
              }).length;
              
              const totalPages = Math.ceil(filteredCount / itemsPerPage);
              
              if (totalPages <= 1) return null;
              
              return (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl animate-in fade-in duration-700">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Showing <span className="text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white">{Math.min(currentPage * itemsPerPage, filteredCount)}</span> of <span className="text-white">{filteredCount}</span> Candidates
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                            currentPage === page 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
          })()}

          {/* Floating Compare Button */}
          {selectedForComparison.length > 1 && !showComparison && (
            <div className="fixed bottom-16 right-8 z-50 animate-in slide-in-from-bottom-5">
              <button
                onClick={() => setShowComparison(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] px-6 py-4 rounded-full font-bold flex items-center gap-3 transition-transform hover:scale-105"
              >
                <BarChart2 className="w-5 h-5" /> Compare {selectedForComparison.length} Candidates
              </button>
            </div>
          )}

          {/* Comparison Overlay */}
          {showComparison && (
            <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
              <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-6xl max-h-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                <div className="bg-slate-900/90 backdrop-blur-md p-6 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3"><BarChart2 className="w-6 h-6 text-indigo-400"/> Compare Candidates</h3>
                    <p className="text-slate-400 text-sm mt-1">Side-by-side analysis of selected candidates.</p>
                  </div>
                  <button onClick={() => setShowComparison(false)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 md:p-8 overflow-auto flex-1">
                   {(() => {
                     const selectedCandidatesObj = selectedForComparison.map(id => mockCandidates.find(c => c.id === id)).filter(Boolean) as typeof mockCandidates;
                     if (selectedCandidatesObj.length === 0) return null;
                     
                     const maxLogic = Math.max(...selectedCandidatesObj.map(c => c.logic));
                     const maxTech = Math.max(...selectedCandidatesObj.map(c => c.tech.score));
                     const maxSoft = Math.max(...selectedCandidatesObj.map(c => c.soft));
                     const minLogicDiff = Math.min(...selectedCandidatesObj.map(c => c.logic));
                     const minTechDiff = Math.min(...selectedCandidatesObj.map(c => c.tech.score));
                     const minSoftDiff = Math.min(...selectedCandidatesObj.map(c => c.soft));

                     const radarData = [
                       { subject: 'Logic', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.logic}), {}) },
                       { subject: 'Architecture', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.architecture}), {}) },
                       { subject: 'Innovation', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.innovation}), {}) },
                       { subject: 'Tech', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.tech}), {}) },
                       { subject: 'Soft', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.soft}), {}) },
                     ];

                     const barData = [
                       { name: 'Logic', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.logic}), {}) },
                       { name: 'Arch', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.architecture}), {}) },
                       { name: 'Inno', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.innovation}), {}) },
                       { name: 'Tech', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.tech}), {}) },
                       { name: 'Soft', ...selectedCandidatesObj.reduce((acc, c) => ({...acc, [c.id]: c.fullSkillDNA.soft}), {}) },
                     ];

                     const chartColors = ['#f59e0b', '#6366f1', '#10b981', '#f43f5e', '#a855f7'];

                     return (
                       <div className="flex flex-col gap-8 w-max min-w-full">
                         {selectedCandidatesObj.length > 1 && (
                           <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sticky left-0 min-w-[max(100%,650px)] max-w-4xl max-md:min-w-fit">
                             <div className="flex justify-between items-start mb-6">
                               <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                 <Sparkles className="w-4 h-4 text-emerald-400" /> Key Score Differences
                               </h4>
                               <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                                 <button 
                                   onClick={() => setComparisonView('radar')}
                                   className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${comparisonView === 'radar' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                 >
                                   RADAR
                                 </button>
                                 <button 
                                   onClick={() => setComparisonView('bar')}
                                   className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${comparisonView === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                 >
                                   BARS
                                 </button>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                 <div className="text-xs text-slate-400 font-bold uppercase mb-1">Logic Gap</div>
                                 <div className="flex items-end gap-2">
                                   <div className="text-2xl font-black text-amber-400"><TrendingUp className="w-4 h-4 inline-block mr-1 text-amber-500/50" />{maxLogic - minLogicDiff}<span className="text-sm text-slate-500 font-bold tracking-normal ml-1 mb-1">pts</span></div>
                                   <span className="text-[10px] text-slate-500 font-medium mb-1">({minLogicDiff} - {maxLogic})</span>
                                 </div>
                               </div>
                               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                 <div className="text-xs text-slate-400 font-bold uppercase mb-1">Tech Gap</div>
                                 <div className="flex items-end gap-2">
                                   <div className="text-2xl font-black text-indigo-400"><TrendingUp className="w-4 h-4 inline-block mr-1 text-indigo-500/50" />{maxTech - minTechDiff}<span className="text-sm text-slate-500 font-bold tracking-normal ml-1 mb-1">pts</span></div>
                                   <span className="text-[10px] text-slate-500 font-medium mb-1">({minTechDiff} - {maxTech})</span>
                                 </div>
                               </div>
                               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                 <div className="text-xs text-slate-400 font-bold uppercase mb-1">Soft Skills Gap</div>
                                 <div className="flex items-end gap-2">
                                   <div className="text-2xl font-black text-pink-400"><TrendingUp className="w-4 h-4 inline-block mr-1 text-pink-500/50" />{maxSoft - minSoftDiff}<span className="text-sm text-slate-500 font-bold tracking-normal ml-1 mb-1">pts</span></div>
                                   <span className="text-[10px] text-slate-500 font-medium mb-1">({minSoftDiff} - {maxSoft})</span>
                                 </div>
                               </div>
                             </div>

                             <div className="mt-8">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                 <Dna className="w-4 h-4 text-indigo-400" /> Skill DNA Comparison
                               </h4>
                               <div className="h-[400px] w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                   {comparisonView === 'radar' ? (
                                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                       <PolarGrid stroke="#334155" />
                                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickCount={6} />
                                       <Tooltip 
                                         wrapperStyle={{ outline: 'none' }} 
                                         contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                                       />
                                       <Legend 
                                         wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 600 }} 
                                         verticalAlign="bottom"
                                       />
                                       {selectedCandidatesObj.map((c, i) => (
                                         <Radar
                                           key={c.id}
                                           name={revealedCandidates[c.id] ? c.realName : `Candidate #${c.id}`}
                                           dataKey={c.id}
                                           stroke={chartColors[i % chartColors.length]}
                                           fill={chartColors[i % chartColors.length]}
                                           fillOpacity={0.25}
                                           strokeWidth={2}
                                         />
                                       ))}
                                     </RadarChart>
                                   ) : (
                                     <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                       <XAxis 
                                          dataKey="name" 
                                          stroke="#94a3b8" 
                                          fontSize={11} 
                                          fontWeight={600}
                                          tickLine={false} 
                                          axisLine={false} 
                                          dy={10}
                                       />
                                       <YAxis 
                                          stroke="#64748b" 
                                          fontSize={10} 
                                          tickLine={false} 
                                          axisLine={false} 
                                          domain={[0, 100]} 
                                       />
                                       <Tooltip 
                                         cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                         contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }} 
                                       />
                                       <Legend 
                                          wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 600 }} 
                                          verticalAlign="bottom"
                                       />
                                       {selectedCandidatesObj.map((c, i) => (
                                         <Bar
                                           key={c.id}
                                           name={revealedCandidates[c.id] ? c.realName : `Candidate #${c.id}`}
                                           dataKey={c.id}
                                           fill={chartColors[i % chartColors.length]}
                                           radius={[4, 4, 0, 0]}
                                           barSize={selectedCandidatesObj.length > 3 ? 12 : 24}
                                         />
                                       ))}
                                     </BarChart>
                                   )}
                                 </ResponsiveContainer>
                               </div>
                             </div>

                             {/* Competency Benchmarking Section */}
                             <div className="mt-8 pt-8 border-t border-slate-800">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                 <TrendingUp className="w-4 h-4 text-indigo-400" /> Relative Competency Benchmarking
                               </h4>
                               <div className="space-y-4">
                                 {selectedCandidatesObj.map((candidate, idx) => {
                                   const dna = candidate.fullSkillDNA;
                                   const metrics = [
                                     { name: 'Logic', score: dna.logic },
                                     { name: 'Architecture', score: dna.architecture },
                                     { name: 'Innovation', score: dna.innovation },
                                     { name: 'Tech', score: dna.tech },
                                     { name: 'Soft Skills', score: dna.soft }
                                   ];
                                   
                                   // Find strength (highest score) and weakness (lowest score)
                                   const sorted = [...metrics].sort((a, b) => b.score - a.score);
                                   const strength = sorted[0];
                                   const growth = sorted[sorted.length - 1];

                                   return (
                                     <div key={candidate.id} className="bg-slate-900/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 border border-slate-800/50">
                                       <div className="flex items-center gap-3 md:w-48 shrink-0">
                                          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black" style={{ borderColor: chartColors[idx % chartColors.length], color: chartColors[idx % chartColors.length] }}>
                                            {idx + 1}
                                          </div>
                                          <span className="font-bold text-sm text-white truncate">
                                            {revealedCandidates[candidate.id] ? candidate.realName : `Candidate #${candidate.id}`}
                                          </span>
                                       </div>
                                       
                                       <div className="flex-1 grid grid-cols-2 gap-4">
                                         <div className="flex flex-col">
                                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Top Strength</span>
                                           <div className="flex items-center gap-2">
                                             <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/20">{strength.name}</span>
                                             <span className="text-sm font-bold text-slate-300">{strength.score}%</span>
                                           </div>
                                         </div>
                                         <div className="flex flex-col">
                                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Focus Area</span>
                                           <div className="flex items-center gap-2">
                                             <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-md border border-amber-500/20">{growth.name}</span>
                                             <span className="text-sm font-bold text-slate-300">{growth.score}%</span>
                                           </div>
                                         </div>
                                       </div>
                                       
                                       <div className="md:w-32 flex justify-end">
                                         <div className="text-right">
                                           <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Overall Fit</div>
                                           <div className="text-lg font-black text-indigo-400">
                                              {Math.round((dna.logic + dna.tech + dna.soft + dna.architecture + dna.innovation) / 5)}%
                                           </div>
                                         </div>
                                       </div>
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>

                             <div className="mt-8">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                 <Target className="w-4 h-4 text-emerald-400" /> Category Leaders
                               </h4>
                               <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                 {[
                                   { key: 'logic', label: 'Logic', color: 'border-amber-500/30 text-amber-400' },
                                   { key: 'architecture', label: 'Architecture', color: 'border-indigo-500/30 text-indigo-400' },
                                   { key: 'innovation', label: 'Innovation', color: 'border-emerald-500/30 text-emerald-400' },
                                   { key: 'tech', label: 'Tech', color: 'border-blue-500/30 text-blue-400' },
                                   { key: 'soft', label: 'Soft', color: 'border-pink-500/30 text-pink-400' },
                                 ].map(cat => {
                                   const leader = selectedCandidatesObj.reduce((prev, curr) => 
                                     ((curr.fullSkillDNA as any)[cat.key] > (prev.fullSkillDNA as any)[cat.key]) ? curr : prev
                                   );
                                   return (
                                     <div key={cat.key} className={`bg-slate-900 border ${cat.color} rounded-xl p-3 flex flex-col items-center text-center`}>
                                       <div className="text-[10px] font-bold uppercase opacity-60 mb-1">{cat.label}</div>
                                       <div className="text-xs font-black truncate w-full">
                                         {revealedCandidates[leader.id] ? leader.realName : `C#${leader.id}`}
                                       </div>
                                       <div className="text-[10px] font-mono mt-1 opacity-80">{(leader.fullSkillDNA as any)[cat.key]}%</div>
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>

                             <div className="mt-8 pt-8 border-t border-slate-800">
                               <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                                 <AlignLeft className="w-4 h-4 text-indigo-400" /> Comparative DNA Intelligence Matrix
                               </h4>
                               <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse border border-slate-800 rounded-2xl overflow-hidden">
                                   <thead>
                                     <tr className="bg-slate-900/50">
                                       <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Core Genomes</th>
                                       {selectedCandidatesObj.map((c, idx) => (
                                         <th key={c.id} className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                              <div className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></div>
                                              <span className="text-[10px] font-black text-white uppercase tracking-tighter whitespace-nowrap">
                                                {revealedCandidates[c.id] ? c.realName?.split(' ')[0] : `C#${c.id}`}
                                              </span>
                                            </div>
                                         </th>
                                       ))}
                                     </tr>
                                   </thead>
                                   <tbody>
                                     {[
                                       { key: 'logic', label: 'Logic Flow', color: 'text-amber-400' },
                                       { key: 'architecture', label: 'System Design', color: 'text-indigo-400' },
                                       { key: 'innovation', label: 'Creative DNA', color: 'text-emerald-400' },
                                       { key: 'tech', label: 'Tech Stack', color: 'text-blue-400' },
                                       { key: 'soft', label: 'EQ/Soft Skills', color: 'text-pink-400' },
                                     ].map((metric) => (
                                       <tr key={metric.key} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                         <td className="p-4">
                                           <span className={`text-[11px] font-bold uppercase tracking-wide ${metric.color}`}>{metric.label}</span>
                                         </td>
                                         {selectedCandidatesObj.map(c => {
                                           const val = (c.fullSkillDNA as any)[metric.key];
                                           const allVals = selectedCandidatesObj.map(cand => (cand.fullSkillDNA as any)[metric.key]);
                                           const maxVal = Math.max(...allVals);
                                           const minVal = Math.min(...allVals);
                                           const isHigh = val === maxVal;
                                           const isLow = val === minVal;
                                           
                                           return (
                                             <td key={c.id} className="p-4 text-center">
                                               <div className="flex flex-col items-center gap-1">
                                                 <span className={`text-sm font-black ${isHigh ? 'text-white' : 'text-slate-500'}`}>{val}%</span>
                                                 <div className="w-full max-w-[40px] h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                   <div 
                                                     className={`h-full rounded-full ${isHigh ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : isLow ? 'bg-slate-700' : 'bg-slate-600'}`} 
                                                     style={{ width: `${val}%` }}
                                                   ></div>
                                                 </div>
                                                 {isHigh && <span className="text-[8px] font-black text-indigo-400 uppercase mt-1 animate-pulse tracking-tighter">Leader</span>}
                                                 {isLow && <span className="text-[8px] font-black text-slate-600 uppercase mt-1 tracking-tighter opacity-50">Gap</span>}
                                               </div>
                                             </td>
                                           );
                                         })}
                                       </tr>
                                     ))}
                                   </tbody>
                                 </table>
                               </div>
                               <div className="mt-4 flex items-center gap-6 justify-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leader in Metric</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Lowest Relative Score</span>
                                  </div>
                               </div>
                             </div>
                           </div>
                         )}

                         <div className="flex gap-6 min-w-max">
                           {selectedCandidatesObj.map(candidate => {
                         const isRevealed = revealedCandidates[candidate.id];
                         return (
                           <div key={candidate.id} className="w-[320px] shrink-0 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                              {isRevealed && <div className="absolute top-0 w-full h-1 bg-emerald-500/50 left-0"></div>}
                              
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h4 className="text-lg font-bold text-white mb-1">
                                    {isRevealed ? candidate.realName : `Candidate #${candidate.id}`}
                                  </h4>
                                  {isRevealed && (
                                    <p className="text-xs text-slate-400 mb-1">{candidate.college} • {candidate.cgpa} CGPA</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleNotifyCandidate(candidate.id, candidateStatuses[candidate.id] || 'New')}
                                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                                    title="Notify Candidate"
                                  >
                                    <Bell className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setSelectedForComparison(prev => prev.filter(cId => cId !== candidate.id))}
                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4 mb-6 relative">
                                 <div className={`flex flex-col gap-1 p-3 rounded-lg border transition-colors ${candidate.logic === maxLogic ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-transparent'}`}>
                                    <div className="flex justify-between text-xs font-bold">
                                       <span className="text-slate-400">Logic Score</span>
                                       <div className="flex items-center gap-1">
                                         {candidate.logic === maxLogic && <span className="text-[10px] text-amber-500 bg-amber-500/20 px-1.5 py-0.5 rounded-full mr-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> TOP</span>}
                                         <span className="text-white">{candidate.logic}/100</span>
                                       </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-amber-500 rounded-full" style={{ width: `${candidate.logic}%` }}></div>
                                    </div>
                                 </div>
                                 <div className={`flex flex-col gap-1 p-3 rounded-lg border transition-colors ${candidate.tech.score === maxTech ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900 border-transparent'}`}>
                                    <div className="flex justify-between text-xs font-bold">
                                       <span className="text-slate-400">{candidate.tech.name} Score</span>
                                       <div className="flex items-center gap-1">
                                          {candidate.tech.score === maxTech && <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded-full mr-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> TOP</span>}
                                          <span className="text-white">{candidate.tech.score}/100</span>
                                       </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${candidate.tech.score}%` }}></div>
                                    </div>
                                 </div>
                                 <div className={`flex flex-col gap-1 p-3 rounded-lg border transition-colors ${candidate.soft === maxSoft ? 'bg-pink-500/10 border-pink-500/30' : 'bg-slate-900 border-transparent'}`}>
                                    <div className="flex justify-between text-xs font-bold">
                                       <span className="text-slate-400">Soft Skill Score</span>
                                       <div className="flex items-center gap-1">
                                          {candidate.soft === maxSoft && <span className="text-[10px] text-pink-400 bg-pink-500/20 px-1.5 py-0.5 rounded-full mr-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> TOP</span>}
                                          <span className="text-white">{candidate.soft}/100</span>
                                       </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                       <div className="h-full bg-pink-500 rounded-full" style={{ width: `${candidate.soft}%` }}></div>
                                    </div>
                                 </div>
                              </div>

                              <div className="mb-6">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top Verified Skills</h5>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.topSkills.slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-[10px] font-medium text-slate-300">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 mt-auto">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-emerald-400" /> AI Insight</h5>
                                <p className="text-sm text-slate-300">{candidate.insight}</p>
                              </div>

                              {!isRevealed ? (
                                 <button
                                   onClick={() => setRevealedCandidates(prev => ({ ...prev, [candidate.id]: true }))}
                                   className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-all mt-auto"
                                 >
                                   <Eye className="w-4 h-4" /> Reveal Identity
                                 </button>
                              ) : (
                                 <div className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-auto">
                                   Identity Revealed
                                 </div>
                              )}

                           </div>
                         )
                       })}
                       </div>
                     </div>
                     );
                     })()}
                   </div>
              </div>
            </div>
          )}

          {/* Pitch Deck Presentation Mode */}
          {showPitchDeck && (
            <PitchDeck onClose={() => setShowPitchDeck(false)} />
          )}

          {selectedCandidateDetails && (
            <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center">
              <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative animate-in fade-in zoom-in-95 duration-300 flex flex-col">
                
                {isOpeningDetails ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-20">
                    <div className="relative mb-8">
                       <Dna className="w-16 h-16 text-indigo-500 animate-pulse" />
                       <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Skill DNA</h3>
                    <p className="text-slate-400 text-sm">Decoding metrics, architecture aptitude and innovative patterns...</p>
                    <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                       <div className="h-full bg-indigo-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                ) : (() => {
                  const candidate = mockCandidates.find(c => c.id === selectedCandidateDetails);
                  if (!candidate) return null;
                  const isRevealed = revealedCandidates[candidate.id];

                  return (
                    <>
                      <div className="bg-slate-900/90 backdrop-blur-md p-6 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isRevealed ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                            {isRevealed ? <UserCheck className="w-6 h-6 text-emerald-400" /> : <EyeOff className="w-6 h-6 text-slate-500" />}
                          </div>
                          <div>
                            <h3 className={`text-2xl font-bold flex items-center gap-3 ${isRevealed ? 'text-white' : 'text-slate-400'}`}>
                              {isRevealed ? candidate.realName : `Candidate #${candidate.id}`}
                            </h3>
                            {isRevealed ? (
                              <p className="text-sm text-emerald-400 mt-1">{candidate.college} • {candidate.cgpa} CGPA</p>
                            ) : (
                              <p className="text-sm text-slate-500 mt-1">Identity Hidden to prevent bias</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <select 
                            value={candidateStatuses[candidate.id] || 'New'}
                            onChange={(e) => setCandidateStatuses(prev => ({ ...prev, [candidate.id]: e.target.value as any }))}
                            className={`text-sm font-bold px-4 py-2 rounded-full border outline-none cursor-pointer appearance-none ${
                              (candidateStatuses[candidate.id] || 'New') === 'New' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                              (candidateStatuses[candidate.id] === 'Screening') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              (candidateStatuses[candidate.id] === 'Interviewing') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                              (candidateStatuses[candidate.id] === 'Offered') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            <option value="New" className="bg-slate-900 text-slate-300">New</option>
                            <option value="Screening" className="bg-slate-900 text-slate-300">Screening</option>
                            <option value="Interviewing" className="bg-slate-900 text-slate-300">Interviewing</option>
                            <option value="Offered" className="bg-slate-900 text-slate-300">Offered</option>
                            <option value="Rejected" className="bg-slate-900 text-slate-300">Rejected</option>
                          </select>

                          {(candidateStatuses[candidate.id] === 'Interviewing' || candidateStatuses[candidate.id] === 'Offered') && (
                            <button 
                              onClick={() => setSchedulingCandidateIds([candidate.id])}
                              className={`px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all border ${scheduledInterviews[candidate.id] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'}`}
                            >
                              <RefreshCw className={`w-3 h-3 ${scheduledInterviews[candidate.id] ? '' : 'animate-spin-slow'}`} />
                              {scheduledInterviews[candidate.id] ? 'Reschedule' : 'Schedule Interview'}
                            </button>
                          )}
                          <button 
                             onClick={async () => {
                               const shareData = {
                                 title: 'Skill DNA Profile',
                                 text: `Decoding Technical DNA: Candidate #${candidate.id} profile.`,
                                 url: `https://edugenome.ai/dna/${candidate.id}`,
                               };
                               try {
                                 if (navigator.share) {
                                   await navigator.share(shareData);
                                 } else {
                                   navigator.clipboard.writeText(shareData.url);
                                   alert('DNA Link copied to clipboard!');
                                 }
                               } catch (err) {
                                 console.error('Error sharing:', err);
                               }
                             }}
                             className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-full flex items-center justify-center transition-colors border border-slate-700 shrink-0"
                             title="Share Skill DNA"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => setSelectedCandidateDetails(null)} className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 overflow-auto flex-1 space-y-8">
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
                            <BarChart2 className="w-4 h-4 text-indigo-400" /> Skill DNA Comparison (Individual vs. Global Average)
                          </h4>
                          
                          <div className="h-[300px] w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                            {(() => {
                              const avgArchitecture = mockCandidates.reduce((acc, c) => acc + c.fullSkillDNA.architecture, 0) / mockCandidates.length;
                              const avgInnovation = mockCandidates.reduce((acc, c) => acc + c.fullSkillDNA.innovation, 0) / mockCandidates.length;
                              const avgLogic = mockCandidates.reduce((acc, c) => acc + c.fullSkillDNA.logic, 0) / mockCandidates.length;
                              const avgTech = mockCandidates.reduce((acc, c) => acc + c.fullSkillDNA.tech, 0) / mockCandidates.length;
                              const avgSoft = mockCandidates.reduce((acc, c) => acc + c.fullSkillDNA.soft, 0) / mockCandidates.length;

                              const chartData = [
                                { name: 'Logic', candidate: candidate.fullSkillDNA.logic, average: Math.round(avgLogic) },
                                { name: 'Architecture', candidate: candidate.fullSkillDNA.architecture, average: Math.round(avgArchitecture) },
                                { name: 'Innovation', candidate: candidate.fullSkillDNA.innovation, average: Math.round(avgInnovation) },
                                { name: 'Technology', candidate: candidate.fullSkillDNA.tech, average: Math.round(avgTech) },
                                { name: 'Soft Skills', candidate: candidate.fullSkillDNA.soft, average: Math.round(avgSoft) },
                              ];

                              return (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                      dataKey="name" 
                                      stroke="#64748b" 
                                      fontSize={10} 
                                      fontWeight={600} 
                                      tickLine={false} 
                                      axisLine={false}
                                      dy={10}
                                    />
                                    <YAxis 
                                      stroke="#64748b" 
                                      fontSize={10} 
                                      tickLine={false} 
                                      axisLine={false} 
                                      domain={[0, 100]} 
                                    />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }}
                                      cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    />
                                    <Legend 
                                      verticalAlign="top" 
                                      align="right" 
                                      wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingBottom: '20px' }}
                                    />
                                    <Bar name="Candidate Score" dataKey="candidate" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar name="Global Average" dataKey="average" fill="#334155" radius={[4, 4, 0, 0]} barSize={32} />
                                  </BarChart>
                                </ResponsiveContainer>
                              );
                            })()}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                            {[
                              { label: 'Logic', score: candidate.fullSkillDNA.logic, color: 'text-amber-400' },
                              { label: 'Architecture', score: candidate.fullSkillDNA.architecture, color: 'text-indigo-400' },
                              { label: 'Innovation', score: candidate.fullSkillDNA.innovation, color: 'text-emerald-400' },
                              { label: 'Technology', score: candidate.fullSkillDNA.tech, color: 'text-blue-400' },
                              { label: 'Soft Skills', score: candidate.fullSkillDNA.soft, color: 'text-pink-400' },
                            ].map(s => (
                              <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">{s.label}</p>
                                <p className={`text-xl font-black ${s.color}`}>{s.score}<span className="text-[10px] text-slate-500 ml-0.5">/100</span></p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                            <BrainCircuit className="w-4 h-4 text-emerald-400" /> Comprehensive AI Summary
                          </h4>
                          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Dna className="w-24 h-24 text-indigo-400" />
                            </div>
                            <p className="text-slate-300 leading-relaxed relative z-10">{candidate.fullSummary}</p>
                          </div>
                        </div>

                        {/* Global Career Strategist Section */}
                        <div className="mb-10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
                              <Globe className="w-4 h-4 text-indigo-400" /> Career Strategist Insight
                            </h4>
                            {!careerStrategy[candidate.id] && (
                              <button 
                                onClick={() => generateCareerStrategy(candidate)}
                                disabled={isGeneratingStrategy}
                                className={`text-[10px] font-bold px-3 py-1 border rounded-lg transition-all flex items-center gap-2 ${isGeneratingStrategy ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30'}`}
                              >
                                {isGeneratingStrategy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {isGeneratingStrategy ? 'CONSULTING AI...' : 'GENERATE STRATEGY'}
                              </button>
                            )}
                          </div>
                          
                          {isGeneratingStrategy && !careerStrategy[candidate.id] ? (
                            <div className="bg-indigo-950/10 border border-indigo-500/10 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center animate-pulse">
                               <BrainCircuit className="w-10 h-10 text-indigo-500/40 mb-4 animate-[bounce_2s_infinite]" />
                               <p className="text-indigo-400/60 font-medium text-sm">Strategist is analyzing balance between technical logic and soft skills...</p>
                            </div>
                          ) : careerStrategy[candidate.id] ? (
                            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-500">
                              <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-strong:text-indigo-400 prose-headings:text-white">
                                <Markdown>{careerStrategy[candidate.id]}</Markdown>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                <Globe className="w-6 h-6 text-slate-500" />
                              </div>
                              <p className="text-sm text-slate-400 max-w-sm">
                                View personalized career paths, regional assessments, and job role justifications based on this candidate's DNA.
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                            <Code2 className="w-4 h-4 text-blue-400" /> Verified Projects
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {candidate.projects.map((project, idx) => (
                              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-colors group">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                    <Route className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">{project.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 border-t border-slate-800 p-6 flex flex-wrap justify-center sm:justify-end gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedForComparison(prev => 
                              prev.includes(candidate.id) ? prev.filter(id => id !== candidate.id) : [...prev, candidate.id]
                            );
                          }}
                          className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all border ${selectedForComparison.includes(candidate.id) ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {selectedForComparison.includes(candidate.id) ? 'Selected' : 'Compare DNA'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setCandidateStatuses(prev => ({ ...prev, [candidate.id]: 'Offered' }));
                          }}
                          className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${candidateStatuses[candidate.id] === 'Offered' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]'}`}
                        >
                          {candidateStatuses[candidate.id] === 'Offered' ? (
                            <><UserCheck className="w-5 h-5" /> Offered</>
                          ) : (
                            <><Zap className="w-5 h-5 text-amber-300" /> Hire Candidate</>
                          )}
                        </button>

                        <button
                          onClick={() => handleNotifyCandidate(candidate.id, candidateStatuses[candidate.id] || 'New')}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-all border border-slate-700"
                        >
                          <Bell className="w-4 h-4" /> Notify DNA
                        </button>

                        {!isRevealed ? (
                          <button
                            onClick={() => setRevealedCandidates(prev => ({ ...prev, [candidate.id]: true }))}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                          >
                            <Eye className="w-4 h-4" /> Express Interest
                          </button>
                        ) : (
                          <div className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <UserCheck className="w-4 h-4" /> Interest Expressed
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedForComparison.length > 0 && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-black text-white">
                    {selectedForComparison.length}
                  </div>
                  <span className="text-sm font-bold text-slate-300">Selected</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Update Status</span>
                    <select 
                      onChange={(e) => {
                        const newStatus = e.target.value as any;
                        if (newStatus === "") return;
                        const updates = { ...candidateStatuses };
                        selectedForComparison.forEach(id => {
                          updates[id] = newStatus;
                        });
                        setCandidateStatuses(updates);
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-400 outline-none focus:border-indigo-500"
                    >
                      <option value="">Bulk Status...</option>
                      <option value="New">New</option>
                      <option value="Screening">Screening</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setSchedulingCandidateIds(selectedForComparison)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" /> Schedule Bulk Interview
                  </button>

                  <button 
                    onClick={() => setSelectedForComparison([])}
                    className="text-xs font-bold text-slate-500 hover:text-white transition-colors ml-2"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interview Scheduling Modal */}
          {schedulingCandidateIds.length > 0 && (
            <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-400" /> {schedulingCandidateIds.length > 1 ? 'Bulk Interview Scheduling' : 'Schedule Interview'}
                  </h3>
                  <button 
                    onClick={() => setSchedulingCandidateIds([])}
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {schedulingCandidateIds.length === 1 ? (
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-xs">
                          {schedulingCandidateIds[0]}
                       </div>
                       <div>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Candidate</p>
                         <p className="text-white font-bold">
                           {revealedCandidates[schedulingCandidateIds[0]] ? mockCandidates.find(c => c.id === schedulingCandidateIds[0])?.realName : `Candidate #${schedulingCandidateIds[0]}`}
                         </p>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 text-center">Batch Scheduling</p>
                       <div className="flex flex-wrap justify-center gap-2">
                          {schedulingCandidateIds.map(id => (
                            <span key={id} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded border border-indigo-500/20">#{id}</span>
                          ))}
                       </div>
                       <p className="text-[10px] text-slate-600 mt-2 text-center">Applying same time to {schedulingCandidateIds.length} candidates</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Date</label>
                      <input 
                        type="date" 
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Select Time</label>
                      <input 
                        type="time" 
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-xs text-emerald-400 leading-relaxed">
                     <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                     <p>Scheduling will automatically trigger <strong>Skill DNA Notifications</strong> to all {schedulingCandidateIds.length} candidate dashboards.</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-800/30 flex gap-4">
                  <button 
                    onClick={() => {
                      setSchedulingCandidateIds([]);
                      setNotificationSent(false);
                      setIsNotifying(false);
                    }}
                    className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors"
                  >
                    {notificationSent ? 'Close' : 'Cancel'}
                  </button>
                  {!notificationSent && (
                    <button 
                      disabled={isNotifying}
                      onClick={async () => {
                        if (interviewForm.date && interviewForm.time) {
                          setIsNotifying(true);
                          
                          // Simulate API call / Notification delay
                          await new Promise(resolve => setTimeout(resolve, 2000));
                          
                          const newSchedules = { ...scheduledInterviews };
                          schedulingCandidateIds.forEach(id => {
                            newSchedules[id] = { ...interviewForm };
                          });
                          setScheduledInterviews(newSchedules);
                          setIsNotifying(false);
                          setNotificationSent(true);
                          
                          // Wait a bit then close automatically or let user close
                          setTimeout(() => {
                            setSchedulingCandidateIds([]);
                            setNotificationSent(false);
                          }, 3000);
                        }
                      }}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
                    >
                      {isNotifying ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> 
                          <span>Syncing DNA...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          <span>Confirm & Notify</span>
                        </>
                      )}
                    </button>
                  )}
                  {notificationSent && (
                    <div className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2">
                       <UserCheck className="w-4 h-4" /> Notified!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>

      )}

      {/* Bottom Status Bar */}
      <footer className="h-12 border-t border-slate-800 px-8 flex items-center justify-between text-[10px] text-slate-500 bg-slate-950">
        <div>&copy; {new Date().getFullYear()} EduGenome AI • Breaking Recruitment Bias</div>
        <div className="flex gap-4 uppercase">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Gemini API Linked</span>
          <span className="hidden sm:inline">GDPR Compliant</span>
          <span className="hidden sm:inline">Secure SSL</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

