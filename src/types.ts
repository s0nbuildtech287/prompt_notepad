export interface Topic {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  topicId: string;
  parentNoteId?: string;
  title: string;
  content: string;
  updatedAt: number;
  isPinned?: boolean;
}

export interface MindmapNode {
  id: string;
  text: string;
  parentId: string | null;
  x: number;
  y: number;
  type?: 'root' | 'main' | 'sub';
  noteId?: string;
  topicId?: string;
  isCompleted?: boolean;
  priority?: number;
}

export interface AppData {
  topics: Topic[];
  notes: Note[];
  mindmapNodes?: MindmapNode[];
}
