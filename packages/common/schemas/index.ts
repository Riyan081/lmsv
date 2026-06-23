// ─── Schemas ──────────────────────────────────────────────────────
export {
  userSchema,
  userProfileSchema,
} from "./user.schema.js";
export type { User, UserProfile } from "./user.schema.js";

export {
  signInSchema,
  signUpSchema,
} from "./auth.schema.js";
export type { SignInInput, SignUpInput } from "./auth.schema.js";

export {
  apiResponseSchema,
  apiErrorSchema,
} from "./api.schema.js";
export type { ApiResponse, ApiError } from "./api.schema.js";
