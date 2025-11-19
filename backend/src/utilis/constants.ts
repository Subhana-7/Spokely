export const ROLES = {
  USER: "user",
  MENTOR: "mentor",
};

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const MESSAGES = {
  SUCCESS: {
    SIGNUP: "Signup successful. Please verify your email.",
    LOGIN: "Login successful",
    LOGOUT: "Logout successful",
    OTP_SENT: "OTP sent to your email",
    OTP_VERIFIED: "OTP verified successfully",
    OTP_RESENT: "OTP resent successfully",
    PASSWORD_RESET: "Password reset successful",
    PASSWORD_UPDATED: "Password changed successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    ROLE_UPDATED: "User role updated successfully",
    SESSIONS_FETCHED: "Sessions fetched successfully",
    USER_FETCHED: "User data fetched successfully",
    PASSWORD_CHANGED: "New password updated successfully",
    PAYMENT_CAPTURED: "Payment captured successfully",
    SUBSCRIPTION_CREATED: "Subscription created successfully",
    SUBSCRIPTION_CAPTURED: "Subscription captured successfully",
    DOCUMENT_RESUBMITTED: "Document resubmitted successfully",
    TOKEN_REFRESHED: "Token refreshed",
    PASSWORD_RESET_OTP_SENT: "Password reset OTP sent to email",
    USER_BLOCKED: "User successfully blocked",
    USER_UNBLOCKED: "User successfully unblocked",
    MENTOR_BLOCKED: "Mentor successfully blocked",
    MENTOR_UNBLOCKED: "Mentor successfully unblocked",
    PAYMENT_CREATED: "Payment order created successfully",
    WALLET_FETCHED: "Wallet fetched successfully",
    MENTOR_LISTING: "Mentors fetched successfully",
  },
  ERROR: {
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "Email already exists",
    USER_NOT_FOUND: "User not found",
    PASSWORD_MISMATCH: "Password and confirm password do not match",
    INVALID_INPUT: "Required fields are missing or invalid",
    INVALID_ROLE: "Invalid role selected",
    BLOCKED_USER: "You are blocked from accessing this service",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "You do not have permission to perform this action",
    SERVER_ERROR: "Internal server error",
    INVALID_TOKEN: "Invalid or expired token",
    OTP_INVALID: "Invalid OTP",
    OTP_EXPIRED: "OTP has expired",
    ALREADY_VERIFIED: "User is already verified",
    SELF_CONNECTION: "You can't connect with yourself",
    CONNECTION_EXISTS: "Connection already exists",
    PASSWORD_NOT_CHANGED: "Password is not changed",
    NOT_FOUND: "Data not found",
    SUBSCRIPTION_FAILED: "Subscription failed",
  },
  SESSION: {
    CREATED: "Session created",
    CREATE_FAILED: "Failed to create session",
    UPDATED: "Session updated",
    UPDATE_FAILED: "Failed to update session",
    NOT_FOUND: "Session not found",
    FETCH_FAILED: "Failed to fetch session",
    PARTICIPATION_CANCELLED: "Participation cancelled",
    CANCELLED: "Session cancelled",
    FLAGGED: "Session flagged",
    OUTSIDE_TIMEFRAME: "Not within session timeframe",
    TOKEN_FAILED: "Failed to generate token",
    FEEDBACK_ADDED: "Feedback added",
    PARTICIPANT_LIMIT_EXCEEDED:
      "Exceeded participant limit for this session type",
    INVITE_TOO_LATE: "Too late to accept/reject this session",
    FEEDBACK_NOT_ALLOWED: "Can only give feedback on completed sessions",
    FEEDBACK_ALREADY_GIVEN: "Feedback already given to this user",
    FLAG_NOT_ALLOWED: "Can only flag completed sessions",
  },
};


// User + Mentor account statuses
export const ACCOUNT_STATUS = {
  BLOCKED: "blocked",
  UNBLOCKED: "unBlocked",
};

// Session statuses
export const SESSION_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Payment statuses
export const PAYMENT_STATUS = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PENDING: "PENDING",
};

// Subscription
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  CANCELLED: "CANCELLED",
};

// Connection statuses
export const CONNECTION_STATUS = {
  ACCEPTED: "accepted",
  PENDING: "pending",
  REJECTED: "rejected",
};

// Sort options
export const SORT_BY = {
  STUDENTS: "students",
  SESSIONS: "sessions",
};

// Query defaults
export const QUERY_STATUS = {
  ALL: "all",
};
