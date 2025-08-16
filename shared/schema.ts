import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  date,
  boolean,
  pgEnum,
  jsonb,
  index,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", ["applicant", "admin", "board"]);

// Application status enum
export const applicationStatusEnum = pgEnum("application_status", [
  "draft", "submitted", "shortlisted", "interviewed", "rejected", "hired"
]);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("applicant"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Counties
export const counties = pgTable("counties", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 11 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Constituencies
export const constituencies = pgTable("constituencies", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 11 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  countyId: integer("county_id").notNull().references(() => counties.id),
});

// Wards
export const wards = pgTable("wards", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 11 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  constituencyId: integer("constituency_id").notNull().references(() => constituencies.id),
});

// Departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Designations
export const designations = pgTable("designations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 250 }).notNull(),
  jobGroup: varchar("job_group", { length: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Awards (education levels)
export const awards = pgTable("awards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Specializations
export const specializations = pgTable("specializations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses offered
export const coursesOffered = pgTable("courses_offered", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  specializationId: integer("specialization_id").notNull().references(() => specializations.id),
  awardId: integer("award_id").notNull().references(() => awards.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professions
export const professions = pgTable("professions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Institutions
export const institutions = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Applicants
export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  salutation: varchar("salutation", { length: 8 }),
  firstName: varchar("first_name", { length: 100 }),
  surname: varchar("surname", { length: 100 }),
  otherName: varchar("other_name", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  phoneVerified: boolean("phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  altPhoneNumber: varchar("alt_phone_number", { length: 20 }),
  nationalId: varchar("national_id", { length: 50 }),
  idPassportNumber: varchar("id_passport_number", { length: 50 }),
  idPassportType: varchar("id_passport_type", { length: 20 }), // 'national_id', 'passport', 'alien_id'
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  nationality: varchar("nationality", { length: 100 }),
  countyId: integer("county_id").references(() => counties.id),
  constituencyId: integer("constituency_id").references(() => constituencies.id),
  wardId: integer("ward_id").references(() => wards.id),
  address: varchar("address", { length: 250 }),
  ethnicity: varchar("ethnicity", { length: 50 }),
  religion: varchar("religion", { length: 50 }),
  isPwd: boolean("is_pwd"),
  pwdNumber: varchar("pwd_number", { length: 100 }),
  isEmployee: boolean("is_employee"),
  kraPin: varchar("kra_pin", { length: 50 }),
  professionId: integer("profession_id").references(() => professions.id),
  profileCompletionPercentage: integer("profile_completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  description: text("description"),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  designationId: integer("designation_id").notNull().references(() => designations.id),
  requirements: jsonb("requirements"), // Store qualification requirements
  applicationDeadline: date("application_deadline"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  status: applicationStatusEnum("status").default("draft"),
  submittedOn: date("submitted_on"),
  remarks: text("remarks"),
  interviewDate: date("interview_date"),
  interviewScore: integer("interview_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Education records
export const educationRecords = pgTable("education_records", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  institutionId: integer("institution_id").notNull().references(() => institutions.id),
  courseId: integer("course_id").references(() => coursesOffered.id),
  awardId: integer("award_id").notNull().references(() => awards.id),
  yearCompleted: integer("year_completed"),
  grade: varchar("grade", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employment history
export const employmentHistory = pgTable("employment_history", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  employer: varchar("employer", { length: 200 }).notNull(),
  position: varchar("position", { length: 150 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(false),
  duties: text("duties"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referees
export const referees = pgTable("referees", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  name: varchar("name", { length: 150 }).notNull(),
  position: varchar("position", { length: 150 }),
  organization: varchar("organization", { length: 200 }),
  email: varchar("email", { length: 100 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  relationship: varchar("relationship", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document uploads
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicant_id").notNull().references(() => applicants.id),
  type: varchar("type", { length: 50 }).notNull(), // 'id', 'certificate', 'transcript', etc.
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notices
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 250 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("general"), // 'announcement', 'update', 'general'
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  applicant: one(applicants, {
    fields: [users.id],
    references: [applicants.userId],
  }),
  createdJobs: many(jobs),
  createdNotices: many(notices),
}));

export const applicantsRelations = relations(applicants, ({ one, many }) => ({
  user: one(users, {
    fields: [applicants.userId],
    references: [users.id],
  }),
  county: one(counties, {
    fields: [applicants.countyId],
    references: [counties.id],
  }),
  constituency: one(constituencies, {
    fields: [applicants.constituencyId],
    references: [constituencies.id],
  }),
  ward: one(wards, {
    fields: [applicants.wardId],
    references: [wards.id],
  }),
  profession: one(professions, {
    fields: [applicants.professionId],
    references: [professions.id],
  }),
  applications: many(applications),
  educationRecords: many(educationRecords),
  employmentHistory: many(employmentHistory),
  referees: many(referees),
  documents: many(documents),
}));

export const countiesRelations = relations(counties, ({ many }) => ({
  constituencies: many(constituencies),
  applicants: many(applicants),
}));

export const constituenciesRelations = relations(constituencies, ({ one, many }) => ({
  county: one(counties, {
    fields: [constituencies.countyId],
    references: [counties.id],
  }),
  wards: many(wards),
  applicants: many(applicants),
}));

export const wardsRelations = relations(wards, ({ one, many }) => ({
  constituency: one(constituencies, {
    fields: [wards.constituencyId],
    references: [constituencies.id],
  }),
  applicants: many(applicants),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  department: one(departments, {
    fields: [jobs.departmentId],
    references: [departments.id],
  }),
  designation: one(designations, {
    fields: [jobs.designationId],
    references: [designations.id],
  }),
  createdBy: one(users, {
    fields: [jobs.createdBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  applicant: one(applicants, {
    fields: [applications.applicantId],
    references: [applicants.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicantSchema = createInsertSchema(applicants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// OTP verification table
export const otpVerification = pgTable("otp_verification", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  attempts: integer("attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for OTP
export const insertOtpSchema = createInsertSchema(otpVerification).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type OtpVerification = typeof otpVerification.$inferSelect;
export type User = typeof users.$inferSelect;
export type Applicant = typeof applicants.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Notice = typeof notices.$inferSelect;
export type County = typeof counties.$inferSelect;
export type Constituency = typeof constituencies.$inferSelect;
export type Ward = typeof wards.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Designation = typeof designations.$inferSelect;
export type Award = typeof awards.$inferSelect;
export type Specialization = typeof specializations.$inferSelect;
export type CourseOffered = typeof coursesOffered.$inferSelect;
export type EducationRecord = typeof educationRecords.$inferSelect;
export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type Referee = typeof referees.$inferSelect;
export type Document = typeof documents.$inferSelect;
