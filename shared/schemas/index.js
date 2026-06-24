import { z } from "zod";
import { priorities, resourceTypes, sessionStatuses, taskStatuses, topicStatuses } from "../constants/index.js";

const text = z.string().trim();
const title = text.min(1, "Title is required").max(160);
const tags = z.array(text.min(1)).default([]);
const date = z.string().default("");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must contain at least 6 characters")
});

export const schemas = {
  notes: z.object({ title, content: text.default(""), tags, pinned: z.boolean().default(false) }),
  roadmaps: z.object({ title, description: text.default(""), steps: z.array(z.object({ id: z.string(), title, done: z.boolean().default(false) })).default([]) }),
  checklists: z.object({ title, items: z.array(z.object({ id: z.string(), text: title, done: z.boolean().default(false) })).default([]) }),
  topics: z.object({ title, description: text.default(""), status: z.enum(topicStatuses).default("Not Started"), priority: z.enum(priorities).default("Medium"), tags }),
  remember: z.object({ question: title, answer: text.min(1, "Answer is required"), tags, confidence: z.coerce.number().min(1).max(5).default(1) }),
  diary: z.object({ title, content: text.default(""), mood: text.default("Focused"), entryDate: date }),
  tasks: z.object({ title, description: text.default(""), status: z.enum(taskStatuses).default("Pending"), priority: z.enum(priorities).default("Medium"), dueDate: date, tags }),
  goals: z.object({ title, current: z.coerce.number().min(0).default(0), target: z.coerce.number().positive(), unit: text.default(""), deadline: date }),
  customModules: z.object({ name: title, items: z.array(z.object({ id: z.string(), title, description: text.default(""), status: z.enum(taskStatuses).default("Pending"), priority: z.enum(priorities).default("Medium") })).default([]) }),
  resources: z.object({ title, url: z.string().url("Enter a valid URL"), type: z.enum(resourceTypes).default("Article"), topic: text.default(""), tags, completed: z.boolean().default(false) }),
  studySessions: z.object({ title, topic: text.default(""), plannedDate: date, duration: z.coerce.number().int().positive().max(600), notes: text.default(""), status: z.enum(sessionStatuses).default("Planned") })
};

export const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: text.default(""),
  status: text.default(""),
  priority: text.default(""),
  tag: text.default(""),
  date: text.default(""),
  sort: text.default("-updatedAt")
});
