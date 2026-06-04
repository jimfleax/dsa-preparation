export interface DocumentMetadata {
  id: string;
  type: 'theory' | 'problemsheets';
  filename: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface DocumentDetail {
  success: boolean;
  metadata: DocumentMetadata;
  content: string;
}
