export interface DocumentMetadata {
  id: string;
  type: "theory" | "problemsheets";
  filename: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
}

export interface DocumentDetail {
  success: boolean;
  metadata: DocumentMetadata;
  content: string;
}

export interface TrackedProblem {
  _id: string;
  userId: string;
  titleSlug: string;
  title: string;
  url: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  attemptCount: number;
  lastAttemptedDate: string;
  notrack?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  leetcodeUsername?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}
