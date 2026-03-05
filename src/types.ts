export interface Topic {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  topicId: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface AppData {
  topics: Topic[];
  notes: Note[];
}
