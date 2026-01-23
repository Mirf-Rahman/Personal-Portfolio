// Portfolio data types

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 1-100
  iconUrl?: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  titleFr?: string;
  description: string;
  descriptionFr?: string;
  technologies: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  positionFr?: string;
  description: string;
  descriptionFr?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  location: string;
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  degreeFr?: string;
  field: string;
  fieldFr?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  descriptionFr?: string;
  order: number;
}

export interface Hobby {
  id: string;
  name: string;
  nameFr?: string;
  description?: string;
  descriptionFr?: string;
  iconUrl?: string;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  content: string;
  contentFr?: string;
  imageUrl?: string;
  approved: boolean;
  order: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Resume {
  id: string;
  fileUrl: string;
  fileName: string;
  language: "en" | "fr";
  uploadedAt: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  twitter?: string;
}
