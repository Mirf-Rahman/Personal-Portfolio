import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

// Skills table
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  iconUrl: text("icon_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  titleFr: text("title_fr"),
  description: text("description").notNull(),
  descriptionFr: text("description_fr"),
  technologies: text("technologies").array().notNull().default([]),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  featured: boolean("featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Work Experience table
export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  positionFr: text("position_fr"),
  description: text("description").notNull(),
  descriptionFr: text("description_fr"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  current: boolean("current").notNull().default(false),
  location: text("location").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Education table
export const education = pgTable("education", {
  id: uuid("id").primaryKey().defaultRandom(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  degreeFr: text("degree_fr"),
  field: text("field").notNull(),
  fieldFr: text("field_fr"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  current: boolean("current").notNull().default(false),
  description: text("description"),
  descriptionFr: text("description_fr"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hobbies table
export const hobbies = pgTable("hobbies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameFr: text("name_fr"),
  description: text("description"),
  descriptionFr: text("description_fr"),
  iconUrl: text("icon_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  position: text("position"),
  company: text("company"),
  content: text("content").notNull(),
  contentFr: text("content_fr"),
  imageUrl: text("image_url"),
  approved: boolean("approved").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Messages table
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Resume table
export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  language: text("language").notNull().default("en"), // "en" or "fr"
  isActive: boolean("is_active").notNull().default(true),
  version: integer("version").notNull().default(1),
  fileSize: integer("file_size").notNull(), // in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contact Info table (single row table for site-wide contact info)
export const contactInfo = pgTable("contact_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  linkedIn: text("linkedin"),
  github: text("github"),
  photoUrl: text("photo_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
