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
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Topic, Note, AppData } from './types';

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
  const [aiResponse, setAiResponse] = useState('');

  const STORAGE_KEY = 'prompt_notepad_data';

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are a prompt engineering expert. Help the user write or improve a prompt. 
        User request: ${aiPrompt}
        
        Provide only the prompt text as the output.`,
      });
      setAiResponse(response.text || '');
    } catch (error) {
      console.error('AI Generation Error:', error);
      setAiResponse('Error generating prompt. Please check your API key or try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiPrompt = () => {
    if (!activeNote) return;
    const newData = {
      ...data,
      notes: data.notes.map(n => n.id === activeNote.id ? { ...n, content: aiResponse, updatedAt: Date.now() } : n)
    };
    saveData(newData);
    setAiResponse('');
    setAiPrompt('');
    setIsAiPanelOpen(false);
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        accept=".txt" 
        className="hidden" 
        aria-label="Import .txt file"
      />
      {/* Sidebar - Topics & Notes Accordion */}
      <aside className="w-72 border-r border-black/5 bg-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <NotebookPen className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Prompt Notepad</h1>
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black">Collections</p>
            <button 
              onClick={() => setShowNewTopicInput(true)}
              className="p-1 hover:bg-black/5 rounded-md text-black/40 hover:text-black transition-colors"
              title="New Topic"
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
                placeholder="Topic name..."
                className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowNewTopicInput(false)} className="px-3 py-1 text-[10px] font-bold uppercase text-black/40">Cancel</button>
                <button onClick={handleCreateTopic} className="px-3 py-1 bg-black text-white rounded-md text-[10px] font-bold uppercase">Add</button>
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
                    title="Add Prompt"
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
                    title="Import .txt"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                    className="p-1.5 hover:bg-black/5 rounded-md text-black/40 hover:text-red-500"
                    title="Delete Topic"
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
                          placeholder="Prompt title..."
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
                      <p className="text-[10px] text-black/20 py-2 italic">No prompts yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-black/40 hover:text-black transition-colors text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Editor / Preview */}
      <main className="flex-1 bg-white flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            <header className="h-16 border-b border-black/5 flex items-center justify-between px-8">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                    {data.topics.find(t => t.id === activeNote.topicId)?.name || 'General'}
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
                      title="AI Assistant"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-2 hover:bg-black/5 rounded-lg text-black/40 hover:text-black transition-all"
                      title="Download as .txt"
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
              <AnimatePresence>
                {isAiPanelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 right-12 left-12 z-20 bg-white border border-black/10 shadow-xl rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-black/60 font-medium">
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>Gemini AI Assistant</span>
                      </div>
                      <button aria-label='xsp' onClick={() => setIsAiPanelOpen(false)} className="p-1 hover:bg-black/5 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask Gemini to write or improve a prompt..."
                        className="flex-1 bg-black/5 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                      />
                      <button
                        onClick={handleAiGenerate}
                        disabled={isAiLoading || !aiPrompt.trim()}
                        className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black/80 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Generate
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="space-y-4">
                        <div className="bg-black/5 rounded-xl p-4 text-sm max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                          {aiResponse}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setAiResponse('')}
                            className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black"
                          >
                            Discard
                          </button>
                          <button
                            onClick={applyAiPrompt}
                            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black/80"
                          >
                            Apply to Prompt
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isEditing ? (
                <div className="max-w-4xl mx-auto p-12 space-y-8">
                  <textarea
                    autoFocus
                    value={editNote.content}
                    onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                    placeholder="Write your prompt here (Markdown supported)..."
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
                      <p className="text-xl font-medium">This prompt is empty</p>
                      <button 
                        onClick={() => {
                          setIsEditing(true);
                          setEditNote(activeNote);
                        }}
                        className="mt-6 text-sm font-bold text-black hover:underline"
                      >
                        Start writing
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
            <h2 className="text-2xl font-bold mb-2">Select a prompt to view</h2>
            <p className="text-black/40 max-w-xs">
              Choose a prompt from the sidebar or create a new one to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
