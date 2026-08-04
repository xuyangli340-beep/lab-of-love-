/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { boolean, foreignKey, index, integer, pgTable, text, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const teamSelection = pgTable("team_selection", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  staffName: varchar("staff_name", { length: 100 }),
  staffInfo: text("staff_info"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_team_selection_user_profile").on(table.userProfileId),
  uniqueIndex("idx_team_selection_role").on(table.userProfileId, table.role),
  foreignKey({
    columns: [table.userProfileId],
    foreignColumns: [userProfileRecord.id],
    name: "team_selection_user_profile_id_fkey",
  }).onDelete("cascade"),
]);

export const candidateResult = pgTable("candidate_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").notNull().unique(),
  poolSize: integer("pool_size").default(10000),
  resultsJson: text("results_json"),
  selectedCandidateId: varchar("selected_candidate_id", { length: 255 }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("candidate_result_user_profile_id_key").on(table.userProfileId),
  foreignKey({
    columns: [table.userProfileId],
    foreignColumns: [userProfileRecord.id],
    name: "candidate_result_user_profile_id_fkey",
  }).onDelete("cascade"),
]);

export const idealPortrait = pgTable("ideal_portrait", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").notNull().unique(),
  title: varchar("title", { length: 255 }),
  summary: text("summary"),
  tags: text("tags").array().default([]),
  heartScoreMin: integer("heart_score_min").default(0),
  heartScoreMax: integer("heart_score_max").default(100),
  stabilityScoreMin: integer("stability_score_min").default(0),
  stabilityScoreMax: integer("stability_score_max").default(100),
  reachabilityScoreMin: integer("reachability_score_min").default(0),
  reachabilityScoreMax: integer("reachability_score_max").default(100),
  userRating: integer("user_rating"),
  userFeedback: text("user_feedback"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("ideal_portrait_user_profile_id_key").on(table.userProfileId),
  foreignKey({
    columns: [table.userProfileId],
    foreignColumns: [userProfileRecord.id],
    name: "ideal_portrait_user_profile_id_fkey",
  }).onDelete("cascade"),
]);

export const preferenceFactor = pgTable("preference_factor", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").notNull(),
  factorName: varchar("factor_name", { length: 255 }),
  weight: integer("weight").default(50),
  isHardConstraint: boolean("is_hard_constraint").default(false),
  isCustom: boolean("is_custom").default(false),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_preference_factor_user_profile").on(table.userProfileId),
  foreignKey({
    columns: [table.userProfileId],
    foreignColumns: [userProfileRecord.id],
    name: "preference_factor_user_profile_id_fkey",
  }).onDelete("cascade"),
]);

export const evidenceItem = pgTable("evidence_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewRecordId: uuid("interview_record_id").notNull(),
  factorName: varchar("factor_name", { length: 255 }),
  evidenceMeaning: text("evidence_meaning"),
  evidenceStrength: integer("evidence_strength").default(0),
  isHardConstraint: boolean("is_hard_constraint").default(false),
  isHighPriority: boolean("is_high_priority").default(false),
  isTradeoffEvidence: boolean("is_tradeoff_evidence").default(false),
  originalQuotes: text("original_quotes").array().default([]),
  tags: text("tags").array().default([]),
  followupQuestions: text("followup_questions").array().default([]),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_evidence_item_record").on(table.interviewRecordId),
  foreignKey({
    columns: [table.interviewRecordId],
    foreignColumns: [interviewRecord.id],
    name: "evidence_item_interview_record_id_fkey",
  }).onDelete("cascade"),
]);

export const interviewAnswer = pgTable("interview_answer", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewRecordId: uuid("interview_record_id").notNull(),
  moduleIndex: integer("module_index").notNull(),
  questionIndex: integer("question_index").notNull(),
  questionText: text("question_text"),
  answerText: text("answer_text"),
  status: varchar("status", { length: 30 }).default('unanswered'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_interview_answer_record").on(table.interviewRecordId),
  index("idx_interview_answer_module").on(table.moduleIndex, table.questionIndex),
  foreignKey({
    columns: [table.interviewRecordId],
    foreignColumns: [interviewRecord.id],
    name: "interview_answer_interview_record_id_fkey",
  }).onDelete("cascade"),
]);

export const interviewRecord = pgTable("interview_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").notNull(),
  fullTranscript: text("full_transcript"),
  audioUrl: text("audio_url"),
  status: varchar("status", { length: 50 }).default('in_progress'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  index("idx_interview_record_user_profile").on(table.userProfileId),
  foreignKey({
    columns: [table.userProfileId],
    foreignColumns: [userProfileRecord.id],
    name: "interview_record_user_profile_id_fkey",
  }).onDelete("cascade"),
]);

export const userProfileRecord = pgTable("user_profile_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  nickname: varchar("nickname", { length: 100 }),
  gender: varchar("gender", { length: 20 }),
  age: integer("age"),
  occupation: varchar("occupation", { length: 255 }),
  workCity: varchar("work_city", { length: 100 }),
  settleCity: varchar("settle_city", { length: 100 }),
  hometown: varchar("hometown", { length: 100 }),
  familyCity: varchar("family_city", { length: 100 }),
  height: integer("height"),
  weight: integer("weight"),
  annualIncome: varchar("annual_income", { length: 100 }),
  workNature: varchar("work_nature", { length: 100 }),
  maritalStatus: varchar("marital_status", { length: 50 }),
  loveExperience: varchar("love_experience", { length: 50 }),
  mbti: varchar("mbti", { length: 10 }),
  zodiac: varchar("zodiac", { length: 20 }),
  selfTags: text("self_tags").array().default([]),
  hobbies: text("hobbies").array().default([]),
  targetGender: varchar("target_gender", { length: 20 }),
  targetAgeMin: integer("target_age_min"),
  targetAgeMax: integer("target_age_max"),
  targetHeightMin: integer("target_height_min"),
  targetHeightMax: integer("target_height_max"),
  minEducation: varchar("min_education", { length: 50 }),
  undergradSchoolPref: varchar("undergrad_school_pref", { length: 100 }),
  masterSchoolPref: varchar("master_school_pref", { length: 100 }),
  overseasPref: varchar("overseas_pref", { length: 50 }),
  regionMode: varchar("region_mode", { length: 50 }),
  incomeRequirement: varchar("income_requirement", { length: 100 }),
  marriagePlan: varchar("marriage_plan", { length: 100 }),
  stylePreference: varchar("style_preference", { length: 100 }),
  highestEducation: varchar("highest_education", { length: 50 }),
  undergradSchool: varchar("undergrad_school", { length: 255 }),
  undergradSchoolTier: varchar("undergrad_school_tier", { length: 100 }),
  undergradMajor: varchar("undergrad_major", { length: 255 }),
  masterSchool: varchar("master_school", { length: 255 }),
  masterSchoolTier: varchar("master_school_tier", { length: 100 }),
  masterMajor: varchar("master_major", { length: 255 }),
  phdSchool: varchar("phd_school", { length: 255 }),
  phdSchoolTier: varchar("phd_school_tier", { length: 100 }),
  phdResearch: varchar("phd_research", { length: 255 }),
  owner: userProfile("owner").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  // Complex index: CREATE UNIQUE INDEX idx_user_profile_record_owner ON user_profile_record USING btree (((owner).user_id)),
]);

// table aliases
export const candidateResultTable = candidateResult;
export const evidenceItemTable = evidenceItem;
export const idealPortraitTable = idealPortrait;
export const interviewAnswerTable = interviewAnswer;
export const interviewRecordTable = interviewRecord;
export const preferenceFactorTable = preferenceFactor;
export const teamSelectionTable = teamSelection;
export const userProfileRecordTable = userProfileRecord;
