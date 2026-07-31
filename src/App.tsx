import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Minus,
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
  BarChart2,
  Calendar,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Palette,
  Smile,
  Quote,
  Sun,
  Moon,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Topic, Note, AppData, MindmapNode } from './types';

const remarkListBullet = () => {
  return (tree: any) => {
    const traverse = (node: any) => {
      if (node.type === 'list' && !node.ordered) {
        if (!node.data) node.data = {};
        if (!node.data.hProperties) node.data.hProperties = {};
        node.data.hProperties['data-bullet'] = node.bullet;
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(tree);
  };
};

const PLAN_TEMPLATES = [
  {
    id: 'milestone',
    title: 'Lộ trình Milestone Dự án',
    description: 'Bố cục phân chia theo giai đoạn (Phase 1, 2, 3) kèm Milestone đánh dấu bằng biểu tượng màu sắc nổi bật.',
    icon: 'milestone',
    content: `# 🚀 Lộ trình Milestone Dự án: [Tên Dự Án]

*   Trạng thái: 🟡 Đang lập kế hoạch
*   Mục tiêu cốt lõi: [Mô tả ngắn gọn mục tiêu]
*   Thời gian thực hiện: [Tháng/Năm]

---

## 📍 Giai đoạn 1: Chuẩn bị & Nghiên cứu (Khởi động)
- [ ] Xác định yêu cầu chi tiết và phạm vi dự án
- [ ] Phân tích đối thủ cạnh tranh và khảo sát người dùng
- [ ] Thiết lập tài nguyên, cấu trúc thư mục làm việc
- 🔴 **Milestone 1:** Hoàn thành tài liệu đặc tả dự án (SRS)

## 📍 Giai đoạn 2: Thiết kế & Xây dựng (Thực thi)
- [ ] Phác thảo sơ đồ mindmap / sơ đồ cây tổng quan
- [ ] Thiết kế giao diện chi tiết (Wireframes/UI Mockups)
- [ ] Triển khai các tính năng cốt lõi theo thứ tự ưu tiên
- 🔵 **Milestone 2:** Phát hành phiên bản thử nghiệm đầu tiên (MVP)

## 📍 Giai đoạn 3: Kiểm thử & Ra mắt (Bàn giao)
- [ ] Thu thập phản hồi từ người dùng thử
- [ ] Sửa các lỗi phát sinh và tối ưu hóa hiệu năng
- [ ] Đóng gói và phát hành chính thức
- 🟢 **Milestone 3:** Bàn giao và vận hành chính thức`
  },
  {
    id: 'weekly',
    title: 'Kế hoạch Tuần / Tháng',
    description: 'Bố cục chia việc theo tuần (Tuần 1, 2), xác định Tiêu điểm trọng tâm (Core Focus) và Chỉ số đo lường hiệu suất (KPIs).',
    icon: 'weekly',
    content: `# 📅 Kế hoạch làm việc: [Tuần/Tháng ...]

*   Tiêu điểm trọng tâm: 🎯 [Ghi mục tiêu quan trọng nhất tuần này]
*   Chỉ số đo lường (KPI): [Ví dụ: Viết xong 3 bài plan, hoàn thành 5 đầu việc...]

---

## 📌 Danh sách công việc theo tuần

### 🍏 Tuần 1: Khởi động & Triển khai nhanh
- [ ] Nhiệm vụ quan trọng số 1
- [ ] Nhiệm vụ quan trọng số 2
- [ ] Họp tiến độ giữa tuần

### 🍏 Tuần 2: Tăng tốc & Hoàn thiện
- [ ] Tiếp tục triển khai các công việc còn tồn đọng
- [ ] Tối ưu hóa kết quả và đóng gói
- [ ] Báo cáo kết quả cuối tuần

---

## 📝 Ghi chú & Bài học kinh nghiệm
> [Ghi lại các vướng mắc hoặc kinh nghiệm rút ra sau tuần làm việc]`
  },
  {
    id: 'swot',
    title: 'Phân tích SWOT & Chiến lược',
    description: 'Phân tích SWOT (Điểm mạnh, Điểm yếu, Cơ hội, Thách thức) và kế hoạch hành động chiến lược chi tiết dạng danh sách dễ viết.',
    icon: 'swot',
    content: `# 📊 Phân tích SWOT & Kế hoạch Chiến lược

*   Đối tượng phân tích: [Tên sản phẩm / Dự án / Bản thân]
*   Ngày thực hiện: [Ngày/Tháng/Năm]

---

## 🔍 Phân tích các yếu tố (SWOT)

### 🌟 Điểm mạnh (Strengths)
- [Viết điểm mạnh thứ nhất của bạn tại đây]
- [Viết điểm mạnh thứ hai]

### ⚠️ Điểm yếu (Weaknesses)
- [Viết điểm yếu thứ nhất của bạn tại đây]
- [Viết điểm yếu thứ hai]

### 🚀 Cơ hội (Opportunities)
- [Viết cơ hội bên ngoài bạn có thể tận dụng]
- [Viết cơ hội thứ hai]

### ⚡ Thách thức (Threats)
- [Viết thách thức/khó khăn bên ngoài cần phòng tránh]
- [Viết thách thức thứ hai]

---

## 💡 Kế hoạch hành động (Action Plan)
1.  **Phát huy điểm mạnh để đón đầu cơ hội:** [Chiến lược hành động...]
2.  **Khắc phục điểm yếu để giảm thiểu thách thức:** [Chiến lược phòng thủ...]`
  }
];

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
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [activePopover, setActivePopover] = useState<'color' | 'emoji' | null>(null);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameNoteTitle, setRenameNoteTitle] = useState('');
  const [renamingTopicId, setRenamingTopicId] = useState<string | null>(null);
  const [renameTopicName, setRenameTopicName] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Mindmap States
  const mindmapNodes = data.mindmapNodes || [];
  const setMindmapNodes = (newNodes: MindmapNode[] | ((prev: MindmapNode[]) => MindmapNode[])) => {
    setData(prev => {
      const nextNodes = typeof newNodes === 'function' ? newNodes(prev.mindmapNodes || []) : newNodes;
      const newData = { ...prev, mindmapNodes: nextNodes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      // Async save to backend
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      }).catch(err => console.error(err));
      return newData;
    });
  };

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [renamingMNodeId, setRenamingMNodeId] = useState<string | null>(null);
  const [renameMNodeText, setRenameMNodeText] = useState('');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Theme State & effect
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('prompt_notepad_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('prompt_notepad_theme', theme);
  }, [theme]);

  const getBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlX = startX + (endX - startX) * 0.5;
    return `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
  };

  const getNodeDepth = (node: MindmapNode): number => {
    let depth = 0;
    let current = node;
    const visited = new Set<string>();
    while (current.parentId && !visited.has(current.id)) {
      visited.add(current.id);
      const parent = mindmapNodes.find(n => n.id === current.parentId);
      if (!parent) break;
      depth++;
      current = parent;
    }
    return depth;
  };

  const getNodeStyles = (node: MindmapNode) => {
    const depth = getNodeDepth(node);
    const styles = [
      {
        bgClass: "bg-slate-900 border-slate-950 text-white dark:bg-white dark:border-white/10 dark:text-slate-950 font-bold shadow-md",
        lineColor: theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)',
        dotColor: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)'
      },
      {
        bgClass: "bg-white border-indigo-500/50 text-indigo-700 font-semibold shadow-sm hover:border-indigo-500 dark:bg-slate-900 dark:border-indigo-400/40 dark:text-indigo-400 dark:hover:border-indigo-400",
        lineColor: theme === 'dark' ? 'rgba(129,140,248,0.65)' : 'rgba(99,102,241,0.65)',
        dotColor: theme === 'dark' ? 'rgba(129,140,248,0.85)' : 'rgba(99,102,241,0.85)'
      },
      {
        bgClass: "bg-white border-emerald-500/50 text-emerald-700 font-medium shadow-sm hover:border-emerald-500 dark:bg-slate-900 dark:border-emerald-400/40 dark:text-emerald-400 dark:hover:border-emerald-400",
        lineColor: theme === 'dark' ? 'rgba(52,211,153,0.65)' : 'rgba(16,185,129,0.65)',
        dotColor: theme === 'dark' ? 'rgba(52,211,153,0.85)' : 'rgba(16,185,129,0.85)'
      },
      {
        bgClass: "bg-white border-amber-500/50 text-amber-700 font-medium shadow-sm hover:border-amber-500 dark:bg-slate-900 dark:border-amber-400/40 dark:text-amber-400 dark:hover:border-amber-400",
        lineColor: theme === 'dark' ? 'rgba(251,191,36,0.65)' : 'rgba(245,158,11,0.65)',
        dotColor: theme === 'dark' ? 'rgba(251,191,36,0.85)' : 'rgba(245,158,11,0.85)'
      },
      {
        bgClass: "bg-white border-slate-300 text-slate-500 shadow-sm hover:border-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500",
        lineColor: theme === 'dark' ? 'rgba(100,116,139,0.5)' : 'rgba(148,163,184,0.5)',
        dotColor: theme === 'dark' ? 'rgba(100,116,139,0.8)' : 'rgba(148,163,184,0.8)'
      }
    ];
    return styles[Math.min(depth, styles.length - 1)];
  };

  const handleAddRootNode = () => {
    const newNode: MindmapNode = {
      id: 'mnode_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      text: 'Ý tưởng mới',
      parentId: null,
      x: 150 - panOffset.x,
      y: 200 - panOffset.y,
      type: 'root'
    };
    setMindmapNodes(prev => [...prev, newNode]);
  };

  const handleAddSubNode = (parentId: string) => {
    const parent = mindmapNodes.find(n => n.id === parentId);
    if (!parent) return;
    const newNode: MindmapNode = {
      id: 'mnode_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      text: 'Nhánh con mới',
      parentId,
      x: parent.x + 220,
      y: parent.y + (Math.random() * 80 - 40),
      type: 'sub'
    };
    setMindmapNodes(prev => [...prev, newNode]);
  };

  const handleDeleteMNode = (nodeId: string) => {
    setMindmapNodes(prev => {
      const idsToDelete = new Set<string>([nodeId]);
      let sizeBefore = 0;
      while (idsToDelete.size !== sizeBefore) {
        sizeBefore = idsToDelete.size;
        prev.forEach(n => {
          if (n.parentId && idsToDelete.has(n.parentId)) {
            idsToDelete.add(n.id);
          }
        });
      }
      return prev.filter(n => !idsToDelete.has(n.id));
    });
  };

  const handleRenameMNode = (nodeId: string, newText: string) => {
    setMindmapNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, text: newText.trim() || 'Nhánh không tên' };
      }
      return n;
    }));
    setRenamingMNodeId(null);
  };

  const handleSyncFromProject = () => {
    const newNodes: MindmapNode[] = [];
    let currentY = 80;
    
    data.topics.forEach((topic, tIdx) => {
      const topicNodeId = `topic_${topic.id}`;
      newNodes.push({
        id: topicNodeId,
        text: topic.name,
        parentId: null,
        x: 100,
        y: currentY,
        type: 'root'
      });
      
      const notes = data.notes.filter(n => n.topicId === topic.id);
      notes.forEach((note, nIdx) => {
        newNodes.push({
          id: `note_${note.id}`,
          text: note.title || 'Không tiêu đề',
          parentId: topicNodeId,
          x: 340,
          y: currentY + (nIdx * 60) - ((notes.length - 1) * 30),
          type: 'sub'
        });
      });
      
      currentY += Math.max(notes.length * 60, 100);
    });
    
    setMindmapNodes(newNodes);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.popover-container')) {
        setActivePopover(null);
      }
    };
    if (activePopover) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activePopover]);

  // Form states
  const [editNote, setEditNote] = useState<Partial<Note>>({});
  const [newTopicName, setNewTopicName] = useState('');
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  
  // New Prompt Naming state
  const [namingNoteForTopicId, setNamingNoteForTopicId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [importingToTopicId, setImportingToTopicId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatFileInputRef = React.useRef<HTMLInputElement>(null);

  // AI Assistant state
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào xu4ns0n! Tôi là Trợ lý Lên Kế hoạch OpenAI. Hãy đính kèm tệp tin và chat với tôi tại đây để thiết kế lộ trình, sơ đồ milestone hoặc thảo luận lập kế hoạch dự án nhé!',
      timestamp: Date.now()
    }
  ]);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log("handleFileUpload: File upload event triggered", e.target.files);
      if (!activeNote) {
        alert('Vui lòng chọn một kế hoạch bên Navigator trước khi đính kèm/tải tệp lên!');
        return;
      }
      const files = e.target.files;
      if (!files || files.length === 0) {
        console.log("handleFileUpload: No files selected");
        return;
      }
      
      const totalFiles = files.length;
      const newNotes: Note[] = [];
      let processedCount = 0;
      
      Array.from(files).forEach(file => {
        console.log("handleFileUpload: Reading file:", file.name, "size:", file.size);
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            console.log("handleFileUpload: Successfully read file content, character count:", text.length);
            
            const finalParentId = activeNote.parentNoteId ? activeNote.parentNoteId : activeNote.id;
            const newFileNote: Note = {
              id: 'note_file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
              topicId: activeNote.topicId,
              parentNoteId: finalParentId,
              title: `📄 ${file.name}`,
              content: text,
              updatedAt: Date.now()
            };
            
            newNotes.push(newFileNote);
            processedCount++;
            
            console.log("handleFileUpload: processedCount =", processedCount, "totalFiles =", totalFiles);
            if (processedCount === totalFiles) {
              console.log("handleFileUpload: All files processed, updating state", newNotes);
              setData(prev => {
                const updatedNotes = [...prev.notes, ...newNotes];
                const newData = { ...prev, notes: updatedNotes };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
                
                // Sync to backend API
                fetch('/api/data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newData),
                })
                .then(res => console.log("handleFileUpload: Backend sync success", res.status))
                .catch(err => console.error("handleFileUpload: Backend sync error", err));
                
                return newData;
              });
              
              alert(`Đã tải lên thành công ${totalFiles} tệp tài liệu dưới dạng kế hoạch con!`);
            }
          } catch (innerErr) {
            console.error("handleFileUpload: Error processing file data", innerErr);
            alert('Lỗi xử lý dữ liệu tệp: ' + (innerErr as Error).message);
          }
        };
        
        reader.onerror = (event) => {
          console.error("handleFileUpload: FileReader error event", event);
          alert('Không thể đọc tệp từ hệ thống: ' + event.target?.error?.message);
        };
        
        reader.readAsText(file);
      });
    } catch (err) {
      console.error("handleFileUpload: Top level error catch", err);
      alert('Lỗi khi tải tệp lên: ' + (err as Error).message);
    } finally {
      e.target.value = '';
    }
  };

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

  const handleToggleChecklist = (index: number) => {
    if (!activeNote) return;
    
    const regex = /([-*+]\s+\[)([ xX])(\])/g;
    let matchIndex = 0;
    let newContent = activeNote.content.replace(regex, (match, p1, p2, p3) => {
      if (matchIndex === index) {
        const newChecked = p2 === ' ' ? 'x' : ' ';
        matchIndex++;
        return `${p1}${newChecked}${p3}`;
      }
      matchIndex++;
      return match;
    });
    
    setData(prev => {
      const updatedNotes = prev.notes.map(n => {
        if (n.id === activeNote.id) {
          return { ...n, content: newContent };
        }
        return n;
      });
      const newData = { ...prev, notes: updatedNotes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
  };

  const handleMarkdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      e.preventDefault();
      
      const container = e.currentTarget;
      const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
      const index = checkboxes.indexOf(target);
      if (index !== -1) {
        handleToggleChecklist(index);
      }
    }
  };

  const handleApplyTemplate = (noteId: string, templateContent: string) => {
    setData(prev => {
      const updatedNotes = prev.notes.map(n => {
        if (n.id === noteId) {
          return { ...n, content: templateContent };
        }
        return n;
      });
      const newData = { ...prev, notes: updatedNotes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    
    setEditNote({
      ...activeNote,
      content: templateContent
    });
    setIsEditing(true);
  };

  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value || '';
    
    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;
    
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setEditNote(prev => ({
      ...prev,
      content: newContent
    }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

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

  const handleRenameNote = (noteId: string) => {
    if (!renameNoteTitle.trim()) {
      setRenamingNoteId(null);
      return;
    }
    
    setData(prev => {
      const updatedNotes = prev.notes.map(n => {
        if (n.id === noteId) {
          return { ...n, title: renameNoteTitle.trim() };
        }
        return n;
      });
      const newData = { ...prev, notes: updatedNotes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    
    setRenamingNoteId(null);
  };

  const handleRenameTopic = (topicId: string) => {
    if (!renameTopicName.trim()) {
      setRenamingTopicId(null);
      return;
    }
    
    setData(prev => {
      const updatedTopics = prev.topics.map(t => {
        if (t.id === topicId) {
          return { ...t, name: renameTopicName.trim() };
        }
        return t;
      });
      const newData = { ...prev, topics: updatedTopics };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      return newData;
    });
    
    setRenamingTopicId(null);
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
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('Khóa API OpenAI chưa được thiết lập. Vui lòng cập nhật OPENAI_API_KEY trong file `.env.local` của bạn.');
      }

      const systemInstruction = `You are a project planning and roadmap expert. Help the user write, refine, or structure a project plan, todo list, or milestone roadmap. Respond in a friendly, conversational manner. Use Markdown for formatting tables, lists, and bold text. Make your plan suggestions detailed, actionable, and structured.`;

      // Structure messages list in OpenAI Chat Completions API format
      const openAiMessages = [
        { role: 'system', content: systemInstruction }
      ];

      // Feed historical conversation messages (excluding the last user message, since we will attach context to it)
      chatMessages.forEach(msg => {
        openAiMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Prepare Context details
      let contextText = '';
      
      // 1. Current Active Note Context
      if (activeNote) {
        contextText += `[KẾ HOẠCH CON HIỆN TẠI ĐANG CHỌN MỞ]\nTiêu đề: ${activeNote.title}\nNội dung:\n${activeNote.content}\n\n`;

        // 2. Child notes (uploaded files) context of the active note
        const childNotes = data.notes.filter(n => n.parentNoteId === activeNote.id);
        if (childNotes.length > 0) {
          contextText += `[CÁC TỆP TIN ĐÃ TẢI LÊN ĐÍNH KÈM DƯỚI KẾ HOẠCH NÀY]\n`;
          childNotes.forEach(file => {
            contextText += `Tên tệp: ${file.title}\nNội dung:\n${file.content}\n---\n`;
          });
          contextText += '\n';
        }
      }

      // Final user prompt context
      const finalPromptText = `${contextText}Yêu cầu của tôi: ${userMessageText}`;
      openAiMessages.push({
        role: 'user',
        content: finalPromptText
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP error! Status: ${response.status}`);
      }

      const resData = await response.json();
      const aiResponseText = resData.choices?.[0]?.message?.content || '';

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
        text: `Có lỗi xảy ra: ${(error as Error).message}`,
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
      notes: data.notes.filter(n => n.id !== id && n.parentNoteId !== id)
    };
    saveData(newData);
    
    const wasActiveNoteDeleted = selectedNoteId === id;
    const wasActiveParentDeleted = data.notes.find(n => n.id === selectedNoteId)?.parentNoteId === id;
    
    if (wasActiveNoteDeleted || wasActiveParentDeleted) {
      setSelectedNoteId(null);
    }
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
      .filter(n => n.topicId === topicId && !n.parentNoteId)
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] dark:bg-[#020617] text-black dark:text-white p-4 relative overflow-hidden">
        {/* Soft background glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-black/5 dark:bg-slate-800/10 blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-8 rounded-3xl shadow-xl shadow-black/[0.02] flex flex-col gap-6"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <NotebookPen className="w-7 h-7 text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-black dark:text-white">Make your plan</h2>
              <p className="text-black/40 dark:text-white/40 text-xs mt-1">Vui lòng đăng nhập để bắt đầu lập kế hoạch</p>
            </div>
          </div>
 
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/45">Tên đăng nhập</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-sm text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-black/10 dark:focus:border-white/10 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
                />
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" />
              </div>
            </div>
 
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 dark:text-white/45">Mật khẩu</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-xl pl-10 pr-4 py-3 text-sm text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-black/10 dark:focus:border-white/10 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
                />
                <Settings className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" />
              </div>
            </div>
 
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 dark:text-red-400 text-xs text-center font-medium bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 py-2.5 px-3 rounded-xl"
              >
                {loginError}
              </motion.div>
            )}
 
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 disabled:bg-black/40 dark:disabled:bg-white/45 text-white dark:text-black py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/10 dark:shadow-white/5 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
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
      <nav className="w-16 border-r border-black/5 dark:border-r-white/5 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-between py-6 shrink-0 z-25 select-none">
        {/* Top Navigation Icons */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-9 h-9 bg-black dark:bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <NotebookPen className="w-5 h-5 text-white dark:text-black" />
          </div>
          
          <button
            onClick={() => setActiveTab('plans')}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              activeTab === 'plans' 
                ? "bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 shadow-sm text-black dark:text-white scale-[1.02]" 
                : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
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
                ? "bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 shadow-sm text-black dark:text-white scale-[1.02]" 
                : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title="Sơ đồ cây & Mindmap"
          >
            <Network className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              activeTab === 'stats' 
                ? "bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 shadow-sm text-black dark:text-white scale-[1.02]" 
                : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title="Thống kê tần suất"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer",
              isAiPanelOpen 
                ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm text-emerald-600 dark:text-emerald-400 scale-[1.02]" 
                : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            )}
            title="Trợ lý AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Action Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Dark Mode Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          >
            {theme === 'light' ? (
              <Moon className="w-4.5 h-4.5" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            )}
          </button>

          {/* User Profile Avatar */}
          <div 
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm select-none"
            title="Tài khoản: xu4ns0n"
          >
            XS
          </div>
          
          <button 
            onClick={handleExportJSON}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-4.5 h-4.5" />
          </button>
          
          <button 
            onClick={() => fileInputJsonRef.current?.click()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Import JSON"
          >
            <Upload className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-50 dark:text-red-400/80 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-all cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </nav>

      {/* Sidebar - Topics & Notes Accordion */}
      {activeTab === 'plans' && (
        <aside className="w-72 border-r border-black/5 dark:border-r-white/5 bg-white dark:bg-slate-950 flex flex-col">
          <div className="p-6">
            <h1 className="font-bold text-lg tracking-tight text-black dark:text-white">Make your plan</h1>
          </div>

          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 focus:outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            <div className="pb-4 px-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white/80">Dự án</p>
              <button 
                onClick={() => setShowNewTopicInput(true)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                title="Dự án mới"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showNewTopicInput && (
              <div className="px-3 py-4 space-y-2 bg-black/5 dark:bg-white/5 rounded-xl mb-4">
                <input
                  autoFocus
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateTopic();
                    if (e.key === 'Escape') setShowNewTopicInput(false);
                  }}
                  placeholder="Tên dự án..."
                  className="w-full bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewTopicInput(false)} className="px-3 py-1 text-[10px] font-bold uppercase text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">Hủy</button>
                  <button onClick={handleCreateTopic} className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded-md text-[10px] font-bold uppercase hover:bg-black/90 dark:hover:bg-white/90">Thêm</button>
                </div>
              </div>
            )}

            {data.topics.map(topic => (
              <div key={topic.id} className="space-y-1">
                <div className="group relative flex items-center">
                  {renamingTopicId === topic.id ? (
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg">
                      <ChevronRight className="w-4 h-4 text-black/20 dark:text-white/25 shrink-0" />
                      <input
                        autoFocus
                        value={renameTopicName}
                        onChange={e => setRenameTopicName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameTopic(topic.id);
                          if (e.key === 'Escape') setRenamingTopicId(null);
                        }}
                        onBlur={() => handleRenameTopic(topic.id)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 font-normal text-black dark:text-white"
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={cn(
                          "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5",
                          expandedTopics[topic.id] ? "text-black dark:text-white" : "text-black/60 dark:text-white/50"
                        )}
                      >
                        <motion.div
                          animate={{ rotate: expandedTopics[topic.id] ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-black/20 dark:text-white/20" />
                        </motion.div>
                        <div 
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors duration-300",
                            activeNote?.topicId === topic.id ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-black/10 dark:bg-white/15"
                          )} 
                        />
                        <span 
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRenamingTopicId(topic.id);
                            setRenameTopicName(topic.name);
                          }}
                          className="flex-1 text-left truncate py-0.5"
                        >
                          {topic.name}
                        </span>
                      </button>
                      
                      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setNamingNoteForTopicId(topic.id);
                            setExpandedTopics(prev => ({ ...prev, [topic.id]: true }));
                          }}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                          title="Thêm kế hoạch"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setRenamingTopicId(topic.id);
                            setRenameTopicName(topic.name);
                          }}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                          title="Đổi tên dự án"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setImportingToTopicId(topic.id);
                            fileInputRef.current?.click();
                          }}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                          title="Nhập .txt"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-black/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400"
                          title="Xóa dự án"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {expandedTopics[topic.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-10 space-y-1"
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
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20"
                          />
                        </div>
                      )}
                      {filteredNotesByTopic(topic.id).map(note => {
                        const isRenaming = renamingNoteId === note.id;
                        const childNotes = data.notes.filter(n => n.parentNoteId === note.id);
                        if (childNotes.length > 0) {
                          console.log("Sidebar: Found childNotes for", note.title, childNotes);
                        }
                        return (
                          <React.Fragment key={note.id}>
                            <div
                              className={cn(
                                "w-full rounded-md text-xs transition-all flex items-center gap-2 group px-3 py-1.5",
                                selectedNoteId === note.id 
                                  ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-semibold" 
                                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                              )}
                            >
                              <FileText className={cn("w-3 h-3 shrink-0", selectedNoteId === note.id ? "text-black dark:text-white" : "text-black/20 dark:text-white/20")} />
                              
                              {isRenaming ? (
                                <input
                                  autoFocus
                                  value={renameNoteTitle}
                                  onChange={e => setRenameNoteTitle(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleRenameNote(note.id);
                                    if (e.key === 'Escape') setRenamingNoteId(null);
                                  }}
                                  onBlur={() => handleRenameNote(note.id)}
                                  className="flex-1 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 font-normal text-black dark:text-white"
                                />
                              ) : (
                                <>
                                  <span 
                                    onClick={() => {
                                      setSelectedNoteId(note.id);
                                      setIsEditing(false);
                                    }}
                                    onDoubleClick={() => {
                                      setRenamingNoteId(note.id);
                                      setRenameNoteTitle(note.title || '');
                                    }}
                                    className="flex-1 truncate cursor-pointer py-0.5"
                                  >
                                    {note.title || 'Untitled'}
                                  </span>
                                  
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingNoteId(note.id);
                                        setRenameNoteTitle(note.title || '');
                                      }}
                                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white cursor-pointer"
                                      title="Đổi tên"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note.id);
                                      }}
                                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/30 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
                                      title="Xóa kế hoạch"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Render child notes (uploaded files) indented directly under this note */}
                            {childNotes.length > 0 && (
                              <div className="pl-6 space-y-0.5 border-l border-black/5 dark:border-white/5 ml-4 mb-1.5">
                                {childNotes.map(childNote => (
                                  <div
                                    key={childNote.id}
                                    className={cn(
                                      "w-full rounded-md text-[11px] transition-all flex items-center gap-2 group px-2 py-1",
                                      selectedNoteId === childNote.id
                                        ? "bg-black/5 dark:bg-white/5 text-black dark:text-white font-semibold animate-pulse"
                                        : "text-black/45 dark:text-white/45 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                    )}
                                  >
                                    <FileText className={cn("w-2.5 h-2.5 shrink-0", selectedNoteId === childNote.id ? "text-emerald-500" : "text-black/20 dark:text-white/20")} />
                                    <span
                                      onClick={() => {
                                        setSelectedNoteId(childNote.id);
                                        setIsEditing(false);
                                      }}
                                      className="flex-1 truncate cursor-pointer py-0.5"
                                    >
                                      {childNote.title}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(childNote.id);
                                      }}
                                      className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/20 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Xóa tài liệu"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {filteredNotesByTopic(topic.id).length === 0 && !namingNoteForTopicId && (
                        <p className="text-[10px] text-black/20 dark:text-white/30 py-2 italic">Chưa có kế hoạch nào</p>
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
      <main className="flex-1 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
        {activeTab === 'plans' && (
          activeNote ? (
            <>
              <header className="h-16 border-b border-black/5 dark:border-b-white/5 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/45">
                      {data.topics.find(t => t.id === activeNote.topicId)?.name || 'Chung'}
                    </span>
                  </div>
                  <div className="h-4 w-[1px] bg-black/5 dark:bg-white/10" />
                  <h2 className="text-sm font-bold truncate max-w-md text-black dark:text-white">{activeNote.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-2">
                      <button
                        onClick={() => setEditorViewMode('edit')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                          editorViewMode === 'edit' 
                            ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm" 
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        )}
                      >
                        Viết
                      </button>
                      <button
                        onClick={() => setEditorViewMode('preview')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                          editorViewMode === 'preview' 
                            ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm" 
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        )}
                      >
                        Xem trước
                      </button>
                      <button
                        onClick={() => setEditorViewMode('split')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                          editorViewMode === 'split' 
                            ? "bg-white dark:bg-slate-800 text-black dark:text-white shadow-sm" 
                            : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                        )}
                      >
                        Song song
                      </button>
                    </div>
                  )}

                  {!isEditing && activeNote && (
                    <>
                      <button
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                        className={cn(
                          "p-2 rounded-lg transition-all cursor-pointer",
                          isAiPanelOpen 
                            ? "bg-black dark:bg-white text-white dark:text-black" 
                            : "hover:bg-black/5 dark:hover:bg-white/5 text-black/40 dark:text-white/45 hover:text-black dark:hover:text-white"
                        )}
                        title="Trợ lý AI"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-black/40 dark:text-white/45 hover:text-black dark:hover:text-white transition-all cursor-pointer"
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
                        className="px-4 py-2 text-sm font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateNote}
                        className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-black/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
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
                      className="flex items-center gap-2 border border-black/10 dark:border-white/10 px-4 py-2 rounded-lg text-sm font-bold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-hidden relative flex flex-col">
                {isEditing ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Format Toolbar */}
                    <div className="flex flex-wrap items-center gap-1.5 px-6 py-3 border-b border-black/5 dark:border-b-white/5 bg-[#F8F9FA] dark:bg-slate-900 overflow-visible select-none shrink-0">
                      {/* Heading Selector */}
                      <div className="flex items-center gap-0.5 border-r border-black/5 dark:border-r-white/5 pr-2">
                        <button
                          onClick={() => insertTextAtCursor('# ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-[10px] font-black cursor-pointer"
                          title="Tiêu đề 1"
                        >
                          H1
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('## ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-[10px] font-black cursor-pointer"
                          title="Tiêu đề 2"
                        >
                          H2
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('### ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-[10px] font-black cursor-pointer"
                          title="Tiêu đề 3"
                        >
                          H3
                        </button>
                      </div>

                      {/* Text styles */}
                      <div className="flex items-center gap-0.5 border-r border-black/5 dark:border-r-white/5 pr-2">
                        <button
                          onClick={() => insertTextAtCursor('**', '**')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="In đậm"
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('*', '*')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="In nghiêng"
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('<u>', '</u>')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-xs font-bold underline cursor-pointer"
                          title="Gạch chân"
                        >
                          U
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('~~', '~~')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-xs font-bold line-through cursor-pointer"
                          title="Gạch ngang"
                        >
                          S
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('`', '`')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-[10px] font-mono bg-black/5 dark:bg-white/5 px-1 cursor-pointer"
                          title="Code inline"
                        >
                          &lt;&gt;
                        </button>
                      </div>

                      {/* Lists */}
                      <div className="flex items-center gap-0.5 border-r border-black/5 dark:border-r-white/5 pr-2">
                        <button
                          onClick={() => insertTextAtCursor('- ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Danh sách gạch đầu dòng (Dashes)"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('* ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Danh sách chấm tròn (Bullet)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('1. ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Danh sách đánh số"
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('- [ ] ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Danh sách công việc"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Colors Dropdown */}
                      <div className="flex items-center gap-0.5 border-r border-black/5 dark:border-r-white/5 pr-2 relative popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopover(activePopover === 'color' ? null : 'color');
                          }}
                          className={cn(
                            "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer",
                            activePopover === 'color' ? "bg-black/5 dark:bg-white/5 text-black dark:text-white" : ""
                          )}
                          title="Màu chữ"
                          type="button"
                        >
                          <Palette className="w-4 h-4" />
                        </button>
                        {activePopover === 'color' && (
                          <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-xl p-2 shadow-xl flex gap-1.5 z-40">
                            {[
                              { name: 'Đen', color: '#000000' },
                              { name: 'Đỏ', color: '#EF4444' },
                              { name: 'Cam', color: '#F97316' },
                              { name: 'Lục', color: '#10B981' },
                              { name: 'Lam', color: '#3B82F6' },
                              { name: 'Tím', color: '#8B5CF6' },
                              { name: 'Xám', color: '#6B7280' }
                            ].map(item => (
                              <button
                                key={item.color}
                                onClick={() => {
                                  insertTextAtCursor(`<span style="color: ${item.color}">`, '</span>');
                                  setActivePopover(null);
                                }}
                                className="w-5 h-5 rounded-full border border-black/10 dark:border-white/15 cursor-pointer hover:scale-110 transition-transform"
                                style={{ backgroundColor: item.color }}
                                title={item.name}
                                type="button"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Emojis Group */}
                      <div className="flex items-center gap-0.5 border-r border-black/5 dark:border-r-white/5 pr-2 relative popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePopover(activePopover === 'emoji' ? null : 'emoji');
                          }}
                          className={cn(
                            "p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer",
                            activePopover === 'emoji' ? "bg-black/5 dark:bg-white/5 text-black dark:text-white" : ""
                          )}
                          title="Biểu tượng cảm xúc (Emojis)"
                          type="button"
                        >
                          <Smile className="w-4 h-4" />
                        </button>
                        {activePopover === 'emoji' && (
                          <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-xl p-2 shadow-xl grid grid-cols-4 gap-1.5 z-40 w-36">
                            {['🚀', '💡', '✅', '📌', '📅', '🎯', '📝', '❌', '👍', '🌟', '🔥', '❤️'].map(emoji => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  insertTextAtCursor(emoji, '');
                                  setActivePopover(null);
                                }}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-base cursor-pointer text-center text-black dark:text-white"
                                title={emoji}
                                type="button"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Media and extras */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => insertTextAtCursor('> ', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Trích dẫn"
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('[Tên liên kết](', ')')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          title="Chèn liên kết"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => insertTextAtCursor('\n---\n', '')}
                          className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors text-xs font-bold cursor-pointer"
                          title="Đường phân cách ngang"
                        >
                          HR
                        </button>
                      </div>
                    </div>

                    {/* Editor Content Area */}
                    <div className="flex-1 flex overflow-hidden bg-white dark:bg-slate-900">
                      {(editorViewMode === 'edit' || editorViewMode === 'split') && (
                        <div className={cn(
                          "h-full p-8 overflow-y-auto flex flex-col",
                          editorViewMode === 'split' ? "w-1/2 border-r border-black/5 dark:border-r-white/5" : "w-full"
                        )}>
                          <textarea
                            ref={textareaRef}
                            autoFocus
                            value={editNote.content}
                            onChange={e => setEditNote({ ...editNote, content: e.target.value })}
                            placeholder="Viết nội dung kế hoạch tại đây (Hỗ trợ Markdown)..."
                            className="w-full h-full text-sm leading-relaxed border-none focus:ring-0 focus:outline-none resize-none text-black dark:text-white placeholder:text-black/10 dark:placeholder:text-white/20 font-mono bg-transparent"
                          />
                        </div>
                      )}
                      
                      {(editorViewMode === 'preview' || editorViewMode === 'split') && (
                        <div className={cn(
                          "h-full p-8 overflow-y-auto",
                          editorViewMode === 'split' ? "w-1/2 bg-[#F8F9FA]/40 dark:bg-slate-950/20" : "w-full"
                        )}>
                          <div className="markdown-body">
                            <Markdown remarkPlugins={[remarkGfm, remarkListBullet]} rehypePlugins={[rehypeRaw]}>
                              {editNote.content}
                            </Markdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-12 w-full">
                    <div className="max-w-4xl mx-auto w-full">
                      <div className="markdown-body" onClick={handleMarkdownClick}>
                        <Markdown 
                          remarkPlugins={[remarkGfm, remarkListBullet]} 
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            input: ({node, ...props}) => {
                              if (props.type === 'checkbox') {
                                return (
                                  <input
                                    type="checkbox"
                                    checked={props.checked}
                                    onChange={() => {}}
                                    className={props.className}
                                    style={{ cursor: 'pointer' }}
                                  />
                                );
                              }
                              return <input {...props} />;
                            }
                          }}
                        >
                          {activeNote.content}
                        </Markdown>
                      </div>
                      {activeNote.content === '' && (
                        <div className="flex flex-col items-center py-12 px-6">
                          <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                            <FileText className="w-8 h-8 text-black/30 dark:text-white/30" />
                          </div>
                          <h3 className="text-xl font-bold text-black dark:text-white mb-2">Kế hoạch này đang trống</h3>
                          <p className="text-sm text-black/40 dark:text-white/40 text-center max-w-md mb-10">
                            Bắt đầu viết kế hoạch bằng cách tự viết từ đầu hoặc chọn một mẫu khung sườn chuyên nghiệp dưới đây:
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
                            {PLAN_TEMPLATES.map(tpl => {
                              const IconComponent = tpl.id === 'milestone' ? Network : tpl.id === 'weekly' ? Calendar : BarChart2;
                              return (
                                <button
                                  key={tpl.id}
                                  onClick={() => handleApplyTemplate(activeNote.id, tpl.content)}
                                  className="group border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 bg-[#F8F9FA]/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 rounded-2xl p-6 text-left transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer flex flex-col items-start"
                                >
                                  <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black flex items-center justify-center text-black/55 dark:text-white/55 mb-4 transition-colors shrink-0">
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  <h4 className="font-bold text-sm text-black dark:text-white mb-1">{tpl.title}</h4>
                                  <p className="text-xs text-black/40 dark:text-white/45 leading-relaxed">{tpl.description}</p>
                                </button>
                              );
                            })}
                          </div>
                          
                          <button 
                            onClick={() => {
                              setIsEditing(true);
                              setEditNote(activeNote);
                            }}
                            className="px-6 py-2.5 bg-black dark:bg-white hover:scale-[1.02] active:scale-[0.98] text-white dark:text-black rounded-xl text-xs font-bold shadow-lg shadow-black/5 dark:shadow-white/5 transition-all cursor-pointer"
                          >
                            Tự viết từ đầu (Khung trống)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-8">
                <FileText className="w-10 h-10 text-black/20 dark:text-white/20" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Chọn một kế hoạch để xem</h2>
              <p className="text-black/40 dark:text-white/40 max-w-xs">
                Chọn một kế hoạch từ thanh bên hoặc tạo mới để bắt đầu.
              </p>
            </div>
          )
        )}

        {activeTab === 'tree' && (
          <div className="flex-1 flex flex-col overflow-hidden relative select-none bg-[#F8F9FA] dark:bg-[#0B0F19]">
            {/* Header bar */}
            <div className="h-16 border-b border-black/5 dark:border-b-white/5 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0 relative z-20">
              <div>
                <h2 className="text-sm font-bold text-black dark:text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-black/50 dark:text-white/50" />
                  Sơ đồ cây & Mindmap tương tác
                </h2>
                <p className="text-[10px] text-black/40 dark:text-white/45">Kéo thả tự do, tạo nhánh chính/phụ và đồng bộ hóa tiến độ</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncFromProject}
                  className="px-3.5 py-1.5 border border-black/5 dark:border-white/5 hover:border-black/15 dark:hover:border-white/15 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold text-black/75 dark:text-white/75 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
                  title="Tự động đồng bộ sơ đồ từ danh sách dự án bên trái"
                >
                  <Network className="w-3.5 h-3.5 text-emerald-500" />
                  Đồng bộ từ Dự án
                </button>
                
                <button
                  onClick={handleAddRootNode}
                  className="px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm nhánh chính
                </button>
                
                {mindmapNodes.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ sơ đồ hiện tại không?')) {
                        setMindmapNodes([]);
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-black/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                    title="Xóa toàn bộ sơ đồ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mindmap Canvas Board */}
            <div 
              id="mindmap-board"
              className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                const target = e.target as HTMLElement;
                if (target.id === 'mindmap-board' || target.tagName === 'svg') {
                  setIsPanning(true);
                  setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
                }
              }}
              onPointerMove={(e) => {
                const board = document.getElementById('mindmap-board');
                if (!board) return;
                const rect = board.getBoundingClientRect();
                
                if (draggedNodeId) {
                  const x = e.clientX - rect.left - dragOffset.x - panOffset.x;
                  const y = e.clientY - rect.top - dragOffset.y - panOffset.y;
                  setMindmapNodes(prev => prev.map(n => {
                    if (n.id === draggedNodeId) {
                      return { ...n, x, y };
                    }
                    return n;
                  }));
                } else if (isPanning) {
                  setPanOffset({
                    x: e.clientX - panStart.x,
                    y: e.clientY - panStart.y
                  });
                }
              }}
              onPointerUp={() => {
                setDraggedNodeId(null);
                setIsPanning(false);
              }}
              onPointerLeave={() => {
                setDraggedNodeId(null);
                setIsPanning(false);
              }}
            >
              {/* Dot grid background */}
              <div 
                className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none transition-all duration-75"
                style={{ 
                  backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
                }}
              />

              {/* Connecting lines SVG layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {mindmapNodes.map(node => {
                  if (!node.parentId) return null;
                  const parent = mindmapNodes.find(n => n.id === node.parentId);
                  if (!parent) return null;

                  const parentW = parent.type === 'root' ? 180 : 160;
                  const parentH = 40;
                  const childW = node.type === 'root' ? 180 : 160;
                  const childH = 40;

                  let startX, startY, endX, endY;
                  if (node.x > parent.x + (parentW / 2)) {
                    startX = parent.x + parentW + panOffset.x;
                    startY = parent.y + (parentH / 2) + panOffset.y;
                    endX = node.x + panOffset.x;
                    endY = node.y + (childH / 2) + panOffset.y;
                  } else {
                    startX = parent.x + panOffset.x;
                    startY = parent.y + (parentH / 2) + panOffset.y;
                    endX = node.x + childW + panOffset.x;
                    endY = node.y + (childH / 2) + panOffset.y;
                  }

                  const nodeStyle = getNodeStyles(node);
                  return (
                    <g key={`link_${node.id}`}>
                      <path 
                        d={getBezierPath(startX, startY, endX, endY)} 
                        fill="none" 
                        stroke={nodeStyle.lineColor} 
                        strokeWidth={node.parentId ? '2' : '2.5'} 
                        strokeDasharray={node.parentId ? '6 4' : undefined}
                      />
                      <circle cx={startX} cy={startY} r="3.5" fill={nodeStyle.lineColor} />
                      <circle cx={endX} cy={endY} r="3.5" fill={nodeStyle.dotColor} />
                    </g>
                  );
                })}
              </svg>

              {/* Rendering interactive nodes */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {mindmapNodes.map(node => {
                  const isNodeRenaming = renamingMNodeId === node.id;
                  const nodeStyle = getNodeStyles(node);
                  const isRoot = !node.parentId;
                  const nodeWidth = isRoot ? 180 : 160;
                  
                  return (
                    <div
                      key={node.id}
                      className={cn(
                        "absolute rounded-2xl flex items-center justify-between pointer-events-auto px-4 py-2 border transition-all duration-75 group shadow-sm select-none",
                        nodeStyle.bgClass
                      )}
                      style={{ 
                        left: node.x + panOffset.x, 
                        top: node.y + panOffset.y,
                        width: `${nodeWidth}px`,
                        height: '40px',
                        cursor: draggedNodeId === node.id ? 'grabbing' : 'grab'
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (isNodeRenaming) return;
                        setDraggedNodeId(node.id);
                        
                        const board = document.getElementById('mindmap-board');
                        if (board) {
                          const rect = board.getBoundingClientRect();
                          setDragOffset({
                            x: e.clientX - rect.left - node.x - panOffset.x,
                            y: e.clientY - rect.top - node.y - panOffset.y
                          });
                        }
                      }}
                    >
                      {isNodeRenaming ? (
                        <input
                          autoFocus
                          value={renameMNodeText}
                          onChange={(e) => setRenameMNodeText(e.target.value)}
                          onBlur={() => handleRenameMNode(node.id, renameMNodeText)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameMNode(node.id, renameMNodeText);
                            if (e.key === 'Escape') setRenamingMNodeId(null);
                          }}
                          className={cn(
                            "w-full bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-xs font-normal text-center rounded",
                            isRoot ? "text-white" : "text-inherit"
                          )}
                          style={{ outline: 'none' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span 
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRenamingMNodeId(node.id);
                            setRenameMNodeText(node.text);
                          }}
                          className="flex-1 truncate text-center cursor-pointer"
                        >
                          {node.text}
                        </span>
                      )}

                      {!isNodeRenaming && (
                        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-lg p-1 shadow-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSubNode(node.id);
                            }}
                            className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            title="Thêm nhánh con"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingMNodeId(node.id);
                              setRenameMNodeText(node.text);
                            }}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white cursor-pointer"
                            title="Đổi tên"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMNode(node.id);
                            }}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500 cursor-pointer"
                            title="Xóa nhánh"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Instructions / Empty state overlay */}
              {mindmapNodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                  <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                    <Network className="w-8 h-8 text-black/30 dark:text-white/30" />
                  </div>
                  <h3 className="text-base font-bold text-black dark:text-white mb-1">Mindmap của bạn đang trống</h3>
                  <p className="text-xs text-black/40 dark:text-white/40 max-w-sm mb-6 leading-relaxed">
                    Bạn có thể tự tạo nhánh chính hoặc đồng bộ hóa trực tiếp từ cấu trúc Dự án & Kế hoạch bên cột trái.
                  </p>
                  
                  <div className="flex gap-3 pointer-events-auto">
                    <button
                      onClick={handleSyncFromProject}
                      className="px-4 py-2 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-slate-900 text-black/70 dark:text-white/70 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Network className="w-3.5 h-3.5 text-emerald-500" />
                      Đồng bộ từ Dự án
                    </button>
                    
                    <button
                      onClick={handleAddRootNode}
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm nhánh chính
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="flex-1 flex flex-col p-12 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="max-w-4xl mx-auto w-full space-y-8">
              <div>
                <h2 className="text-2xl font-black text-black dark:text-white">Thống kê tần suất</h2>
                <p className="text-black/40 dark:text-white/45 text-sm mt-1">Theo dõi mức độ hoạt động và tiến độ kế hoạch của bạn</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#F8F9FA] dark:bg-slate-950 border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">Tổng số dự án</span>
                  <p className="text-3xl font-black text-black dark:text-white mt-2">{data.topics.length}</p>
                </div>
                <div className="bg-[#F8F9FA] dark:bg-slate-950 border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">Tổng số kế hoạch</span>
                  <p className="text-3xl font-black text-black dark:text-white mt-2">{data.notes.length}</p>
                </div>
                <div className="bg-[#F8F9FA] dark:bg-slate-950 border border-black/5 dark:border-white/5 p-6 rounded-3xl">
                  <span className="text-xs text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">Tổng số sơ đồ</span>
                  <p className="text-3xl font-black text-black dark:text-white mt-2">{mindmapNodes.length}</p>
                </div>
              </div>

              <div className="bg-[#F8F9FA] dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <h3 className="font-bold text-sm text-black dark:text-white">Tần suất lập kế hoạch (30 ngày qua)</h3>
                
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const intensity = i % 7 === 0 ? "bg-emerald-500" : i % 5 === 0 ? "bg-emerald-300 dark:bg-emerald-600" : i % 3 === 0 ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-black/5 dark:bg-white/5";
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
            className="border-l border-black/5 dark:border-l-white/5 bg-[#F8F9FA] dark:bg-slate-950 flex flex-col h-full overflow-hidden shrink-0 relative"
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
            <div className="h-16 border-b border-black/5 dark:border-b-white/5 flex items-center justify-between px-6 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-black dark:text-white">Trợ lý Lên Kế hoạch</span>
              </div>
              <button 
                onClick={() => setIsAiPanelOpen(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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
                        ? "bg-black dark:bg-white text-white dark:text-black rounded-tr-none" 
                        : "bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-black dark:text-white rounded-tl-none"
                    )}
                  >
                    {msg.sender === 'ai' ? (
                      <div className="markdown-body text-xs">
                        <Markdown remarkPlugins={[remarkGfm, remarkListBullet]} rehypePlugins={[rehypeRaw]}>
                          {msg.text}
                        </Markdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}

                    {msg.sender === 'ai' && (
                      <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-2 pt-2 border-t border-black/5 dark:border-t-white/5 transition-opacity justify-end">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            alert('Đã sao chép nội dung kế hoạch!');
                          }}
                          className="flex items-center gap-1 text-[10px] text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white font-semibold cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          <Copy className="w-3 h-3" />
                          Sao chép
                        </button>
                        <button
                          onClick={() => handleApplyMessageToPlan(msg.text)}
                          className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold cursor-pointer"
                          title="Áp dụng vào Kế hoạch đang chọn"
                        >
                          <Check className="w-3 h-3" />
                          Áp dụng
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-black/35 dark:text-white/30 px-1 select-none">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-black/5 dark:border-t-white/5 bg-white dark:bg-slate-900 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Nhập câu hỏi hoặc yêu cầu..."
                  disabled={isAiLoading}
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-black/10 dark:focus:border-white/10 focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
                />
                
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  disabled={isAiLoading}
                  className={cn(
                    "p-2.5 rounded-xl border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer",
                    isAiLoading && "opacity-40 pointer-events-none"
                  )}
                  title="Đính kèm tệp văn bản dưới dạng kế hoạch con (.txt, .md, .json, .csv...)"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={chatFileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={isAiLoading}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,.csv,.js,.ts,.tsx,.html,.css"
                />

                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="bg-black dark:bg-white hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-40 text-white dark:text-black p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white dark:text-black" />
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
