import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Hash, 
  FileText, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  MoreVertical,
  Save,
  X,
  NotebookPen,
  Download,
  Upload,
  Sparkles,
  Send,
  Loader2,
  Settings,
  LogOut,
  Database,
  Copy,
  Check,
  Network,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Topic, Note, AppData } from './types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [data, setData] = useState<AppData>({ topics: [], notes: [] });
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'tree' | 'stats'>('plans');

  // Form states
  const [editNote, setEditNote] = useState<Partial<Note>>({});
  const [newTopicName, setNewTopicName] = useState('');
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  
  // New Prompt Naming state
  const [namingNoteForTopicId, setNamingNoteForTopicId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [importingToTopicId, setImportingToTopicId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // AI Assistant state
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào xu4ns0n! Tôi là Trợ lý Lên Kế hoạch Gemini. Hãy chat với tôi tại đây để thiết kế lộ trình, sơ đồ milestone hoặc lập kế hoạch cho dự án của bạn nhé!',
      timestamp: Date.now()
    }
  ]);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const [aiPanelWidth, setAiPanelWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 280 && newWidth < window.innerWidth * 0.7) {
        setAiPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const STORAGE_KEY = 'prompt_notepad_data';

  // Login states
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // JSON File input ref
  const fileInputJsonRef = React.useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    setTimeout(() => {
      if (loginUsername === 'xu4ns0n' && loginPassword === 'Sondeptrai123@k') {
        sessionStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        setIsLoggingIn(false);
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        setIsLoggingIn(false);
      }
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'make-your-plan-data.json');
    linkElement.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.topics) && Array.isArray(parsed.notes)) {
          saveData(parsed);
          setSelectedNoteId(parsed.notes[0]?.id || null);
          alert('Nhập dữ liệu JSON thành công!');
        } else {
          alert('Định dạng file JSON không hợp lệ. Phải chứa danh sách topics và notes.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + (err as Error).message);
      }
      if (fileInputJsonRef.current) fileInputJsonRef.current.value = '';
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (isAiPanelOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isAiPanelOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Try LocalStorage first for immediate results
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        setData(parsed);
        if (parsed.topics.length > 0) {
          setExpandedTopics({ [parsed.topics[0].id]: true });
        }
        setIsLoading(false);
        // We still fetch from backend to sync if needed, but local is priority
      }

      // 2. Fetch from backend
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        // Only update if local storage was empty or if we want to merge (keeping it simple: backend wins if local is empty)
        if (!localData && json.topics.length > 0) {
          setData(json);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
          setExpandedTopics({ [json.topics[0].id]: true });
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newData: AppData) => {
    // 1. Save to LocalStorage immediately (Synchronous & Reliable)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);

    // 2. Sync with backend (Asynchronous)
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      console.warn('Failed to sync with backend, but data is saved locally.', err);
    }
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      name: newTopicName.trim(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
    const newData = { ...data, topics: [...data.topics, newTopic] };
    saveData(newData);
    setNewTopicName('');
    setShowNewTopicInput(false);
    setExpandedTopics(prev => ({ ...prev, [newTopic.id]: true }));
  };

  const handleCreateNote = (topicId: string) => {
    if (!newNoteTitle.trim()) {
      setNamingNoteForTopicId(null);
      return;
    }
    const newNote: Note = {
      id: crypto.randomUUID(),
      topicId: topicId,
      title: newNoteTitle.trim(),
      content: '',
      updatedAt: Date.now()
    };
    const newData = { ...data, notes: [...data.notes, newNote] };
    saveData(newData);
    setSelectedNoteId(newNote.id);
    setIsEditing(true);
    setEditNote(newNote);
    setExpandedTopics(prev => ({ ...prev, [topicId]: true }));
    setNamingNoteForTopicId(null);
    setNewNoteTitle('');
  };

  const handleUpdateNote = () => {
    const activeNote = data.notes.find(n => n.id === selectedNoteId);
    if (!activeNote) return;
    const updatedNote = { 
      ...activeNote, 
      ...editNote, 
      updatedAt: Date.now() 
    } as Note;
    const newData = {
      ...data,
      notes: data.notes.map(n => n.id === activeNote.id ? updatedNote : n)
    };
    saveData(newData);
    setIsEditing(false);
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([activeNote.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title || 'prompt'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importingToTopicId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const title = file.name.replace(/\.txt$/i, '');
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        topicId: importingToTopicId,
        title: title,
        content: content,
        updatedAt: Date.now()
      };

      const newData = { ...data, notes: [...data.notes, newNote] };
      saveData(newData);
      setSelectedNoteId(newNote.id);
      setIsEditing(false);
      setExpandedTopics(prev => ({ ...prev, [importingToTopicId]: true }));
      setImportingToTopicId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;

    const userMessageText = aiPrompt.trim();
    setAiPrompt('');

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userMessageText,
      timestamp: Date.now()
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const historyText = updatedMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');
      
      const systemInstruction = `You are a project planning and roadmap expert. Help the user write, refine, or structure a project plan, todo list, or milestone roadmap. Respond in a friendly, conversational manner. Use Markdown for formatting tables, lists, and bold text. Make your plan suggestions detailed, actionable, and structured.`;

      const promptText = `${systemInstruction}\n\nLịch sử trò chuyện:\n${historyText}\nUser: ${userMessageText}\nAssistant:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
      });

      const aiResponseText = response.text || '';
      
      const newAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: Date.now()
      };

      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('AI Generation Error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: 'Có lỗi xảy ra khi kết nối với Gemini. Vui lòng kiểm tra API Key của bạn trong file `.env.local`.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyMessageToPlan = (text: string) => {
    if (!activeNote) {
      alert('Vui lòng chọn một kế hoạch bên thanh điều hướng để áp dụng.');
      return;
    }
    const newData = {
      ...data,
      notes: data.notes.map(n => n.id === activeNote.id ? { ...n, content: text, updatedAt: Date.now() } : n)
    };
    saveData(newData);
    alert('Đã áp dụng nội dung vào kế hoạch hiện tại!');
  };

  const handleDeleteNote = (id: string) => {
    const newData = {
      ...data,
      notes: data.notes.filter(n => n.id !== id)
    };
    saveData(newData);
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleDeleteTopic = (id: string) => {
    const newData = {
      topics: data.topics.filter(t => t.id !== id),
      notes: data.notes.filter(n => n.topicId !== id)
    };
    saveData(newData);
  };

  const activeNote = useMemo(() => 
    data.notes.find(n => n.id === selectedNoteId) || null
  , [data.notes, selectedNoteId]);

  const filteredNotesByTopic = (topicId: string) => {
    return data.notes
      .filter(n => n.topicId === topicId)
      .filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black/10 rounded-xl" />
          <div className="h-4 w-24 bg-black/10 rounded" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] text-black p-4 relative overflow-hidden">
        {/* Soft background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-black/5 blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white border border-black/5 p-8 rounded-3xl shadow-xl shadow-black/[0.02] flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <NotebookPen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-black">Make your plan</h2>
              <p className="text-black/40 text-xs mt-1">Vui lòng đăng nhập để bắt đầu lập kế hoạch</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-black/40">Tên đăng nhập</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className="w-full bg-black/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:bg-white focus:border-black/10 focus:ring-1 focus:ring-black/10 transition-all"
                />
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-black/40">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-black/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-sm text-black placeholder:text-black/20 focus:outline-none focus:bg-white focus:border-black/10 focus:ring-1 focus:ring-black/10 transition-all"
                />
                <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs text-center font-medium bg-red-50 border border-red-100 py-2.5 px-3 rounded-xl"
              >
                {loginError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black hover:bg-black/90 disabled:bg-black/40 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      {/* Hidden File Input for JSON Backup Import */}
      <input 
        type="file" 
        ref={fileInputJsonRef} 
        onChange={handleImportJSON} 
        accept=".json" 
        className="hidden" 
        aria-label="Import JSON data"
      />
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".txt" 
        className="hidden" 
        aria-label="Import .txt file"
      />

      {/* Activity Bar (Far Left Navigation Bar) */}
      <nav className="w-16 border-r border-black/5 bg-slate-50 flex flex-col items-center justify-between py-6 shrink-0 z-25 select-none">
        {/* Top Navigation Icons */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          
          <button
            onClick={() => setActiveTab('plans')}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              activeTab === 'plans' 
                ? "bg-white border border-black/10 shadow-sm text-black scale-[1.02]" 
                : "text-black/40 hover:text-black hover:bg-black/5"
            )}
            title="Lập kế hoạch & Viết lách"
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              activeTab === 'tree' 
                ? "bg-white border border-black/10 shadow-sm text-black scale-[1.02]" 
                : "text-black/40 hover:text-black hover:bg-black/5"
            )}
            title="Sơ đồ cây (Phát triển sau)"
          >
            <Network className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              activeTab === 'stats' 
                ? "bg-white border border-black/10 shadow-sm text-black scale-[1.02]" 
                : "text-black/40 hover:text-black hover:bg-black/5"
            )}
            title="Thống kê tần suất (Phát triển sau)"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              isAiPanelOpen 
                ? "bg-emerald-50 border border-emerald-500/15 shadow-sm text-emerald-600 scale-[1.02]" 
                : "text-black/40 hover:text-black hover:bg-black/5"
            )}
            title="Trợ lý AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Action Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* User Profile Avatar */}
          <div 
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm select-none"
            title="Tài khoản: xu4ns0n"
          >
            XS
          </div>
          
          <button 
            onClick={handleExportJSON}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => fileInputJsonRef.current?.click()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
            title="Import JSON"
          >
            <Upload className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </nav>

      {/* Sidebar - Topics & Notes Accordion */}
      {activeTab === 'plans' && (
        <aside className="w-72 border-r border-black/5 bg-white flex flex-col">
          <div className="p-6">
            <h1 className="font-bold text-lg tracking-tight">Make your plan</h1>
          </div>

          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-black/5 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-black/5 focus:outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            <div className="pb-4 px-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black">Dự án</p>
              <button 
                onClick={() => setShowNewTopicInput(true)}
                className="p-1 hover:bg-black/5 rounded-md text-black/40 hover:text-black transition-colors"
                title="Dự án mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewTopicInput && (
              <div className="px-3 py-4 space-y-2 bg-black/5 rounded-xl mb-4">
                <input
                  autoFocus
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateTopic();
                    if (e.key === 'Escape') setShowNewTopicInput(false);
                  }}
                  placeholder="Tên dự án..."
                  className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewTopicInput(false)} className="px-3 py-1 text-[10px] font-bold uppercase text-black/40">Hủy</button>
                  <button onClick={handleCreateTopic} className="px-3 py-1 bg-black text-white rounded-md text-[10px] font-bold uppercase">Thêm</button>
                </div>
              </div>
            )}

            {data.topics.map(topic => (
              <div key={topic.id} className="space-y-1">
                <div className="group relative flex items-center">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-black/5",
                      expandedTopics[topic.id] ? "text-black" : "text-black/60"
                    )}
                  >
                    <motion.div
                      animate={{ rotate: expandedTopics[topic.id] ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-black/20" />
                    </motion.div>
                    <div 
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors duration-300",
                        activeNote?.topicId === topic.id ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-black/10"
                      )} 
                    />
                    <span className="flex-1 text-left truncate">{topic.name}</span>
                  </button>
                  
                  <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setNamingNoteForTopicId(topic.id);
                        setExpandedTopics(prev => ({ ...prev, [topic.id]: true }));
                      }}
                      className="p-1.5 hover:bg-black/5 rounded-md text-black/40 hover:text-black"
                      title="Thêm kế hoạch"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setImportingToTopicId(topic.id);
                        fileInputRef.current?.click();
                      }}
                      className="p-1.5 hover:bg-black/5 rounded-md text-black/40 hover:text-black"
                      title="Nhập .txt"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                      className="p-1.5 hover:bg-black/5 rounded-md text-black/40 hover:text-red-500"
                      title="Xóa dự án"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandedTopics[topic.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-7 space-y-1"
                    >
                      {namingNoteForTopicId === topic.id && (
                        <div className="px-3 py-1.5">
                          <input
                            autoFocus
                            value={newNoteTitle}
                            onChange={e => setNewNoteTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCreateNote(topic.id);
                              if (e.key === 'Escape') setNamingNoteForTopicId(null);
                            }}
                            onBlur={() => {
                              if (!newNoteTitle.trim()) setNamingNoteForTopicId(null);
                            }}
                            placeholder="Tiêu đề kế hoạch..."
                            className="w-full bg-black/5 border border-black/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black/20"
                          />
                        </div>
                      )}
                      {filteredNotesByTopic(topic.id).map(note => (
                        <button
                          key={note.id}
                          onClick={() => {
                            setSelectedNoteId(note.id);
                            setIsEditing(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 group",
                            selectedNoteId === note.id 
                              ? "bg-black/5 text-black font-semibold" 
                              : "text-black/50 hover:text-black hover:bg-black/5"
                          )}
                        >
                          <FileText className={cn("w-3 h-3", selectedNoteId === note.id ? "text-black" : "text-black/20")} />
                          <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                          <Trash2 
                            className="w-3 h-3 opacity-0 group-hover:opacity-100 text-black/20 hover:text-red-500" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                          />
                        </button>
                      ))}
                      {filteredNotesByTopic(topic.id).length === 0 && !namingNoteForTopicId && (
                        <p className="text-[10px] text-black/20 py-2 italic">Chưa có kế hoạch nào</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* Editor / Preview */}
      <main className="flex-1 bg-white flex flex-col overflow-hidden">
        {activeTab === 'plans' && (
          activeNote ? (
            <>
              <header className="h-16 border-b border-black/5 flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                      {data.topics.find(t => t.id === activeNote.topicId)?.name || 'Chung'}
                    </span>
                  </div>
                  <div className="h-4 w-[1px] bg-black/5" />
                  <h2 className="text-sm font-bold truncate max-w-md">{activeNote.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && activeNote && (
                    <>
                      <button
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isAiPanelOpen ? "bg-black text-white" : "hover:bg-black/5 text-black/40 hover:text-black"
                        )}
                        title="Trợ lý AI"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-all"
                        title="Tải về file .txt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateNote}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditNote(activeNote);
                      }}
                      className="flex items-center gap-2 border border-black/10 px-4 py-2 rounded-lg text-sm font-bold hover:bg-black/5 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto relative">
                {isEditing ? (
                  <div className="max-w-4xl mx-auto p-12 space-y-8">
                    <textarea
                      autoFocus
                      value={editNote.content}
                      onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                      placeholder="Viết nội dung kế hoạch tại đây (Hỗ trợ Markdown)..."
                      className="w-full h-[75vh] text-lg leading-relaxed border-none focus:ring-0 focus:outline-none resize-none placeholder:text-black/10 font-mono"
                    />
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto p-12">
                    <div className="markdown-body">
                      <Markdown>{activeNote.content}</Markdown>
                    </div>
                    {activeNote.content === '' && (
                      <div className="flex flex-col items-center justify-center py-20 text-black/20">
                        <FileText className="w-16 h-16 mb-4" />
                        <p className="text-xl font-medium">Kế hoạch này đang trống</p>
                        <button 
                          onClick={() => {
                            setIsEditing(true);
                            setEditNote(activeNote);
                          }}
                          className="mt-6 text-sm font-bold text-black hover:underline"
                        >
                          Bắt đầu soạn thảo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-black/5 rounded-3xl flex items-center justify-center mb-8">
                <FileText className="w-10 h-10 text-black/20" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Chọn một kế hoạch để xem</h2>
              <p className="text-black/40 max-w-xs">
                Chọn một kế hoạch từ thanh bên hoặc tạo mới để bắt đầu.
              </p>
            </div>
          )
        )}

        {activeTab === 'tree' && (
          <div className="flex-1 flex flex-col p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div>
                <h2 className="text-2xl font-black text-black">Sơ đồ cây & Mindmap</h2>
                <p className="text-black/40 text-sm mt-1">Phác thảo lộ trình và chia nhóm ý tưởng dưới dạng trực quan</p>
              </div>
              
              <div className="bg-[#F8F9FA] border border-black/5 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[500px] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
                
                {/* Visual Mock Tree Chart */}
                <div className="flex flex-col items-center gap-12 relative z-10 w-full max-w-lg">
                  <div className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg">
                    Dự án Youtube
                  </div>
                  
                  <div className="flex justify-between w-full relative">
                    {/* Connecting lines */}
                    <div className="absolute top-[-24px] left-1/2 right-1/2 w-0.5 h-6 bg-black/10 -translate-x-1/2" />
                    <div className="absolute top-[-24px] left-[15%] right-[15%] h-0.5 bg-black/10" />
                    
                    <div className="flex flex-col items-center gap-6 w-[45%]">
                      <div className="absolute top-[-24px] left-[15%] w-0.5 h-6 bg-black/10" />
                      <div className="bg-white border border-black/10 text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm w-full">
                        Kênh youtube năng lượng
                      </div>
                      <div className="flex flex-col gap-2 w-4/5 text-left pl-4 border-l-2 border-emerald-500/30">
                        <span className="text-[10px] text-black/50">○ Lên kịch bản 5 video</span>
                        <span className="text-[10px] text-black/50">○ Quay phim cơ bản</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 w-[45%]">
                      <div className="absolute top-[-24px] right-[15%] w-0.5 h-6 bg-black/10" />
                      <div className="bg-white border border-black/10 text-black px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm w-full">
                        Chiến dịch truyền thông
                      </div>
                      <div className="flex flex-col gap-2 w-4/5 text-left pl-4 border-l-2 border-emerald-500/30">
                        <span className="text-[10px] text-black/50">○ Tạo poster quảng bá</span>
                        <span className="text-[10px] text-black/50">○ Đăng bài Facebook</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 max-w-xs relative z-10">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                    Đang phát triển
                  </div>
                  <h3 className="font-bold text-lg mb-1">Thiết kế Sơ đồ Dự án</h3>
                  <p className="text-xs text-black/40">
                    Tính năng vẽ sơ đồ tư duy (mindmap) và liên kết các kế hoạch con dưới dạng cây thư mục trực quan đang được nghiên cứu phát triển.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex-1 flex flex-col p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div>
                <h2 className="text-2xl font-black text-black">Thống kê tần suất</h2>
                <p className="text-black/40 text-sm mt-1">Theo dõi mức độ hoạt động và tiến độ kế hoạch của bạn</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#F8F9FA] border border-black/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Tổng số dự án</span>
                  <p className="text-3xl font-black text-black mt-2">{data.topics.length}</p>
                </div>
                <div className="bg-[#F8F9FA] border border-black/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Tổng số kế hoạch</span>
                  <p className="text-3xl font-black text-black mt-2">{data.notes.length}</p>
                </div>
                <div className="bg-[#F8F9FA] border border-black/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Mức độ hoàn thành</span>
                  <p className="text-3xl font-black text-emerald-600 mt-2">78%</p>
                </div>
              </div>

              <div className="bg-[#F8F9FA] border border-black/5 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <h3 className="font-bold text-sm text-black">Tần suất lập kế hoạch (30 ngày qua)</h3>
                
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const intensity = i % 7 === 0 ? "bg-emerald-500" : i % 5 === 0 ? "bg-emerald-300" : i % 3 === 0 ? "bg-emerald-100" : "bg-black/5";
                    return (
                      <div 
                        key={i} 
                        className={cn("w-6 h-6 rounded-md transition-transform hover:scale-110", intensity)}
                        title={`Ngày ${i + 1}`}
                      />
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-black/5 flex items-center justify-between text-xs text-black/40">
                  <span>Ít hoạt động</span>
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 bg-black/5 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-emerald-100 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-emerald-300 rounded-sm" />
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-sm" />
                  </div>
                  <span>Năng động</span>
                </div>

                <div className="text-center pt-4">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                    Đang phát triển
                  </div>
                  <p className="text-xs text-black/40">
                    Hệ thống phân tích tần suất chỉnh sửa, biểu đồ năng suất viết lách sẽ sớm được tích hợp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chat Sidebar Panel */}
      <AnimatePresence>
        {isAiPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: aiPanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: isResizing ? 0 : 0.3, ease: "easeInOut" }}
            style={{ width: aiPanelWidth }}
            className="border-l border-black/5 bg-[#F8F9FA] flex flex-col h-full overflow-hidden shrink-0 relative"
          >
            {/* Drag Handle */}
            <div 
              onMouseDown={startResizing}
              className={cn(
                "absolute top-0 left-0 w-1.5 h-full cursor-col-resize z-30 transition-colors",
                isResizing ? "bg-emerald-500 w-2" : "hover:bg-emerald-500/30 hover:w-2"
              )}
              style={{ userSelect: 'none' }}
            />
            {/* Chat Header */}
            <div className="h-16 border-b border-black/5 flex items-center justify-between px-6 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-black">Trợ lý Lên Kế hoạch</span>
              </div>
              <button 
                onClick={() => setIsAiPanelOpen(false)}
                className="p-1 hover:bg-black/5 rounded text-black/40 hover:text-black transition-colors cursor-pointer"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col gap-1 w-full",
                    msg.sender === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div 
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-xs shadow-sm relative group max-w-[85%] leading-relaxed",
                      msg.sender === 'user' 
                        ? "bg-black text-white rounded-tr-none" 
                        : "bg-white border border-black/5 text-black rounded-tl-none"
                    )}
                  >
                    {msg.sender === 'ai' ? (
                      <div className="markdown-body text-xs">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}

                    {msg.sender === 'ai' && (
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-2 pt-2 border-t border-black/5 transition-opacity justify-end">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            alert('Đã sao chép nội dung kế hoạch!');
                          }}
                          className="flex items-center gap-1 text-[10px] text-black/40 hover:text-black font-semibold cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          <Copy className="w-3 h-3" />
                          Sao chép
                        </button>
                        <button
                          onClick={() => handleApplyMessageToPlan(msg.text)}
                          className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                          title="Áp dụng vào Kế hoạch đang chọn"
                        >
                          <Check className="w-3 h-3" />
                          Áp dụng
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-black/35 px-1 select-none">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-black/5 bg-white shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc yêu cầu..."
                  disabled={isAiLoading}
                  className="flex-1 bg-black/5 border-transparent rounded-xl px-4 py-2.5 text-xs text-black placeholder:text-black/30 focus:outline-none focus:bg-white focus:border-black/10 focus:ring-1 focus:ring-black/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="bg-black hover:bg-black/90 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
