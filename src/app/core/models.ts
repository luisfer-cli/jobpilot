export interface Profile {
  id: number;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface WorkExperience {
  id?: number;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  id?: number;
  name: string;
  level: string;
  category: string;
}

export interface Language {
  id?: number;
  name: string;
  level: string;
}

export interface Certification {
  id?: number;
  name: string;
  issuer: string;
  date: string;
}

export interface Project {
  id?: number;
  name: string;
  description: string;
  link: string;
}

export interface CvData {
  profile: Profile;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
}

export interface JobOfferStructured {
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  seniority: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  niceToHave: string[];
  skills: string[];
  applicationUrl: string;
}

export type OfferStatus =
  | "guardada"
  | "aplicada"
  | "entrevista"
  | "oferta"
  | "rechazada";

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  rawText: string;
  structured: string;
  status: OfferStatus;
  salary: string;
  url: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedCv {
  id?: number;
  jobOfferId?: number;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experiences: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
  createdAt?: string;
}

export interface CoverLetter {
  id?: number;
  jobOfferId?: number;
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  createdAt?: string;
}

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "coding";

export interface TestQuestion {
  questionType: QuestionType;
  question: string;
  options: string[];
  correctAnswers: string[];
  hint: string;
  explanation: string;
}

export interface TechnicalTest {
  id?: number;
  jobOfferId?: number | null;
  title: string;
  estimatedTime: string;
  instructions: string;
  questions: TestQuestion[];
  createdAt?: string;
}

export interface StoredTest {
  id: number;
  jobOfferId: number | null;
  title: string;
  content: string;
  createdAt: string;
}

export interface AtsAnalysis {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface TestConfig {
  questionCount?: string;
  difficulty?: string;
  estimatedTime?: string;
}

export interface AiProviderInfo {
  key: string;
  name: string;
  baseUrl: string;
}

export const AI_PROVIDERS: AiProviderInfo[] = [
  { key: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
  { key: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { key: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { key: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1" },
  { key: "mistral", name: "Mistral AI", baseUrl: "https://api.mistral.ai/v1" },
  { key: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1" },
  { key: "perplexity", name: "Perplexity", baseUrl: "https://api.perplexity.ai" },
  { key: "custom", name: "Personalizado", baseUrl: "" },
];

export function baseUrlForProvider(key: string): string {
  return AI_PROVIDERS.find((p) => p.key === key)?.baseUrl ?? "";
}

export interface AppSettings {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  theme: "light" | "dark";
}

export type SidebarMode = "expanded" | "collapsed" | "hidden";
