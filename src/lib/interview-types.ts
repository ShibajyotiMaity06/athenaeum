export type InterviewDifficulty = "Easy" | "Medium" | "Hard";

export interface InterviewSource {
  title: string;
  url: string;
  domain?: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  difficulty: InterviewDifficulty;
  answer: string;
  sources: InterviewSource[];
}

export interface UniqueSource {
  title: string;
  url: string;
  domain: string;
  count: number;
}

export interface InterviewStack {
  slug: string;
  name: string;
  headline: string;
  description: string;
  icon: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  questions: InterviewQuestion[];
  sources: UniqueSource[];
}

export const FREE_QUESTIONS_LIMIT = 5;
