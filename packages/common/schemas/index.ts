// ─── Auth Schemas ─────────────────────────────────────────────────
export {
  signInSchema,
  signUpSchema,
} from "./auth.schema.js";
export type { SignInInput, SignUpInput } from "./auth.schema.js";

// ─── API Response Schemas ─────────────────────────────────────────
export {
  apiResponseSchema,
  apiErrorSchema,
} from "./api.schema.js";
export type { ApiResponse, ApiError } from "./api.schema.js";

// ─── User Schemas ─────────────────────────────────────────────────
export {
  userSchema,
  userProfileSchema,
} from "./user.schema.js";
export type { User, UserProfile } from "./user.schema.js";

// ─── Academic Structure Schemas ───────────────────────────────────
export {
  createDepartmentSchema,
  updateDepartmentSchema,
  createProgramSchema,
  updateProgramSchema,
  createBatchSchema,
  updateBatchSchema,
  createSectionSchema,
  createSemesterSchema,
  createSubjectSchema,
  updateSubjectSchema,
} from "./academic.schema.js";
export type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateProgramInput,
  UpdateProgramInput,
  CreateBatchInput,
  UpdateBatchInput,
  CreateSectionInput,
  CreateSemesterInput,
  CreateSubjectInput,
  UpdateSubjectInput,
} from "./academic.schema.js";

// ─── Attendance Schemas ───────────────────────────────────────────
export {
  markAttendanceSchema,
  attendanceQuerySchema,
  regularizeAttendanceSchema,
} from "./attendance.schema.js";
export type {
  MarkAttendanceInput,
  AttendanceQueryInput,
  RegularizeAttendanceInput,
} from "./attendance.schema.js";

// ─── Leave Schemas ────────────────────────────────────────────────
export {
  createLeaveSchema,
  updateLeaveStatusSchema,
  leaveQuerySchema,
} from "./leave.schema.js";
export type {
  CreateLeaveInput,
  UpdateLeaveStatusInput,
  LeaveQueryInput,
} from "./leave.schema.js";

// ─── Exam & Result Schemas ────────────────────────────────────────
export {
  createExamSchema,
  updateExamSchema,
  enterMarksSchema,
  examQuerySchema,
} from "./exam.schema.js";
export type {
  CreateExamInput,
  UpdateExamInput,
  EnterMarksInput,
  ExamQueryInput,
} from "./exam.schema.js";

// ─── Timetable Schemas ───────────────────────────────────────────
export {
  createTimetableSlotSchema,
  updateTimetableSlotSchema,
  bulkCreateTimetableSchema,
  timetableQuerySchema,
} from "./timetable.schema.js";
export type {
  CreateTimetableSlotInput,
  UpdateTimetableSlotInput,
  BulkCreateTimetableInput,
  TimetableQueryInput,
} from "./timetable.schema.js";

// ─── Hostel Schemas ──────────────────────────────────────────────
export {
  createHostelSchema,
  updateHostelSchema,
  createRoomSchema,
  updateRoomSchema,
  allocateRoomSchema,
  createGatePassSchema,
  updateGatePassStatusSchema,
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "./hostel.schema.js";
export type {
  CreateHostelInput,
  UpdateHostelInput,
  CreateRoomInput,
  UpdateRoomInput,
  AllocateRoomInput,
  CreateGatePassInput,
  UpdateGatePassStatusInput,
  CreateComplaintInput,
  UpdateComplaintStatusInput,
} from "./hostel.schema.js";

// ─── Announcement Schemas ────────────────────────────────────────
export {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  announcementQuerySchema,
} from "./announcement.schema.js";
export type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementQueryInput,
} from "./announcement.schema.js";

// ─── Calendar Schemas ────────────────────────────────────────────
export {
  createEventSchema,
  updateEventSchema,
  calendarQuerySchema,
} from "./calendar.schema.js";
export type {
  CreateEventInput,
  UpdateEventInput,
  CalendarQueryInput,
} from "./calendar.schema.js";
