/**
 * LMS module constants for activity logging and permissions.
 */
export const MODULES = {
  AUTH: "auth",
  DEPARTMENT: "department",
  STUDENT: "student",
  FACULTY: "faculty",
  ATTENDANCE: "attendance",
  LEAVE: "leave",
  EXAM: "exam",
  HOSTEL: "hostel",
  TIMETABLE: "timetable",
  ANNOUNCEMENT: "announcement",
  CALENDAR: "calendar",
  SYSTEM: "system",
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

export const ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  APPROVE: "approve",
  REJECT: "reject",
  LOGIN: "login",
  LOGOUT: "logout",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

/** Attendance status options */
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

/** Leave types */
export const LEAVE_TYPES = {
  MEDICAL: "medical",
  PERSONAL: "personal",
  EMERGENCY: "emergency",
  OTHER: "other",
} as const;

export type LeaveType = (typeof LEAVE_TYPES)[keyof typeof LEAVE_TYPES];

/** Leave status */
export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

/** Exam types */
export const EXAM_TYPES = {
  INTERNAL: "internal",
  MIDTERM: "midterm",
  ENDSEM: "endsem",
  SUPPLEMENTARY: "supplementary",
} as const;

export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];

/** Subject types */
export const SUBJECT_TYPES = {
  THEORY: "theory",
  PRACTICAL: "practical",
  ELECTIVE: "elective",
} as const;

export type SubjectType = (typeof SUBJECT_TYPES)[keyof typeof SUBJECT_TYPES];

/** Hostel types */
export const HOSTEL_TYPES = {
  BOYS: "boys",
  GIRLS: "girls",
} as const;

export type HostelType = (typeof HOSTEL_TYPES)[keyof typeof HOSTEL_TYPES];

/** Gate pass status */
export const GATE_PASS_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type GatePassStatus = (typeof GATE_PASS_STATUS)[keyof typeof GATE_PASS_STATUS];

/** Complaint status */
export const COMPLAINT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
} as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUS)[keyof typeof COMPLAINT_STATUS];

/** Complaint categories */
export const COMPLAINT_CATEGORIES = {
  PLUMBING: "plumbing",
  ELECTRICAL: "electrical",
  FURNITURE: "furniture",
  CLEANING: "cleaning",
  OTHER: "other",
} as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[keyof typeof COMPLAINT_CATEGORIES];

/** Academic event types */
export const EVENT_TYPES = {
  HOLIDAY: "holiday",
  EXAM_PERIOD: "exam_period",
  EVENT: "event",
  SEMINAR: "seminar",
  WORKSHOP: "workshop",
  SPORTS: "sports",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/** Announcement types */
export const ANNOUNCEMENT_TYPES = {
  GLOBAL: "global",
  DEPARTMENT: "department",
  CLASS: "class",
  HOSTEL: "hostel",
} as const;

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[keyof typeof ANNOUNCEMENT_TYPES];

/** Days of the week (for timetable) */
export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Gender options */
export const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;

export type Gender = (typeof GENDERS)[keyof typeof GENDERS];
