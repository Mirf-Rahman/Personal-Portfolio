// Portfolio data types - matching database schema

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  iconUrl?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  titleFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  technologies: string[];
  imageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  positionFr?: string | null;
  description: string;
  descriptionFr?: string | null;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  location: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  degreeFr?: string | null;
  field: string;
  fieldFr?: string | null;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  description?: string | null;
  descriptionFr?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hobby {
  id: string;
  name: string;
  nameFr?: string | null;
  description?: string | null;
  descriptionFr?: string | null;
  iconUrl?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  position?: string | null;
  company?: string | null;
  content: string;
  contentFr?: string | null;
  imageUrl?: string | null;
  approved: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Resume {
  id: string;
  fileUrl: string;
  fileName: string;
  language: string;
  uploadedAt: Date;
}

export interface ContactInfo {
  id: string;
  email: string;
  linkedIn?: string | null;
  github?: string | null;
  updatedAt: Date;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: ValidationError[];
}

// Rate limit error
export interface RateLimitError extends ApiError {
  code: "RATE_LIMIT_EXCEEDED";
  retryAfter?: number;
}
