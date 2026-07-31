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
}

export interface MindmapNode {
  id: string;
  text: string;
  parentId: string | null;
  x: number;
  y: number;
  type?: 'root' | 'main' | 'sub';
}

export interface AppData {
  topics: Topic[];
  notes: Note[];
  mindmapNodes?: MindmapNode[];
}
