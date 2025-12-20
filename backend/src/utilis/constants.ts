export const ROLES = {
  USER: "user",
  MENTOR: "mentor",
  ADMIN: "admin",
} as const;

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
    MENTOR_FETCHED: "Mentor listing fetched successfully",
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
    INTERNAL_ERROR: "Internal Error",
    FETCH_MENTOR_STUDENT: "Failed to fetch mentor students",
    FETCH_SUBSCRIPTION_HISTORY: "Failed to fetch subscription history",
    ACCOUNT_BLOCKED: "Your account has been blocked. Contact support.",
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
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const SESSION_TYPE = {
  PUBLIC: "public",
  PRIVATE: "private",
  PEER_TO_PEER: "peer-to-peer",
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PENDING: "PENDING",
  CREATED: "CREATED",
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;

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

export const CONNECTION_MESSAGES = {
  REQUEST: {
    SENT: "Connection request sent successfully",
    EXISTS: "Connection already exists",
    SELF: "You cannot connect with yourself",
    ACCEPTED: "Connection request accepted",
    REJECTED: "Connection request rejected",
    EMPTY: "No Connections found",
  },
  ERROR: {
    NOT_FOUND: "Connection not found",
    UNAUTHORIZED: "Unauthorized",
  },
};

export const NOTIFICATION_TYPE = {
  SUCCESS: "success",
  ERROR: "error",
  INFO: "info",
} as const;

export const NOTIFICATION_MESSAGES = {
  CONNECTION_REQUEST: {
    TITLE: "New Connection Request",
    MESSAGE: "You have received a new connection request. Check it out.",
  },
  REQUEST_ACCEPTED: {
    TITLE: "Connection Request Accepted",
    MESSAGE: "Your connection request has been accepted.",
  },
  REQUEST_REJECTED: {
    TITLE: "Connection Request Rejected",
    MESSAGE: "Your connection request has been rejected.",
  },
};

export const DAILY_TASK_MESSAGES = {
  ERROR: {
    EMPTY_FEEDBACK: "AI returned an empty feedback response",
    PARSE_FAILED: "Failed to parse AI feedback",
    TASK_NOT_FOUND: "Daily task not found",
    TODAYS_TASK_NOT_FOUND: "No daily task found for today",
  },
  SUCCESS: {
    FEEDBACK_GENERATED: "Feedback generated successfully",
  },
};

export const EMAIL_MESSAGES = {
  VERIFICATION: {
    SUBJECT: "Spokely Mentor Verification Status",

    APPROVED: `Hi,

Your mentor profile has been approved! You can now start using Spokely as a mentor.

Welcome aboard!

- Team Spokely`,

    REJECTED: (reason: string) => `Hi,

We're sorry to inform you that your mentor profile was rejected.
Reason: ${reason}

You may reapply with updated details.

- Team Spokely`,

    PENDING: `Hi,

Thank you for applying to be a mentor on Spokely. Your application is under review.
We will notify you once it’s processed.

- Team Spokely`,
  },

  OTP: {
    SUBJECT: "Spokely OTP Verification Code",
    TEXT: (otp: string) => `Hi,

Your OTP code is: ${otp}
It is valid for 10 minutes.

- Team Spokely`,
  },

  OTP_FORGOT_PASSWORD: {
    SUBJECT: "Password Reset Code",
    TEXT: (otp: string) =>
      `Your password reset verification code is ${otp}. It expires in 10 minutes.`,
  },
};

export const MENTOR_MESSAGES = {
  ERROR: {
    INVALID_PASSWORD:
      "Password must contain uppercase, lowercase, number, symbol, and be at least 8 characters",
    MENTOR_NOT_FOUND: "Mentor not found",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
  },
  SUCCESS: {
    OTP_VERIFICATION: "OTP verified successfully",
    PASSWORD_UPDATED: "Password reset successful",
  },
};

export const VERIFICATION_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
} as const;

export const EMAIL_ERRORS = {
  INVALID_VERIFICATION_STATUS: "Invalid verification status",
} as const;

export const EMAIL_PROVIDER = {
  GMAIL: "gmail",
} as const;

export const DEFAULT_VALUES = {
  NOT_SPECIFIED: "Not specified",
} as const;

export const TASK_TYPES = {
  WRITING: "writing",
  READING: "reading",
  SPEAKING: "speaking",
  LISTENING: "listening",
} as const;

export const DAILY_TASK_LEVEL_HINT = {
  EASY: "Keep it very simple, max 1–2 lines.",
  MEDIUM: "Slightly more detailed but still concise.",
  HARD: "Give a more challenging but short task.",
} as const;

export const DAILY_TASK_PROMPTS = {
  TRAINER_HEADER:
    "You are a Communication Trainer. Evaluate the student responses.",
  RETURN_JSON_ONLY: "Return JSON only.",
  PARAGRAPH_SENTENCE_COUNT: "10-12 sentences",
  QUESTIONS_COUNT: 5,
} as const;

export const DAILY_TASK_GENERATION = {
  WRITING_INSTRUCTION: "short question or instruction",
  READING_INSTRUCTION: "instruction",
} as const;

export type DailyTaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

export const CONNECTION_ERRORS = {
  NOT_FOUND: "Connection not found",
} as const;

export const PAYPAL_INTENT = {
  CAPTURE: "CAPTURE",
} as const;

export const CURRENCY = {
  USD: "USD",
  INR: "INR",
} as const;

export const SUBSCRIPTION_MESSAGES = {
  SUCCESS: {
    TITLE: "Subscription Successful",
    MESSAGE:
      "Your new subscription is successful. Enjoy our subscription features.",
  },
  FAILED: {
    TITLE: "Subscription Request Failed",
    MESSAGE: "Your subscription request failed due to payment failure.",
  },
  ERROR: {
    FAILED_TO_FETCH: "Failed to fetch subscriptions",
  },
} as const;

export const PAYMENT_CONSTANTS = {
  OAUTH_GRANT_TYPE: "grant_type=client_credentials",
  PAYPAL_OAUTH_URL: "/v1/oauth2/token",
  PAYPAL_ORDER_URL: "/v2/checkout/orders",
  CAPTURE_SUFFIX: "/capture",
  WALLET_DESCRIPTION: (userId: string, topic: string) =>
    `Payment received from ${userId} for session: ${topic}`,
  LOG_SESSION: "Session Type / Fee / CreatedBy:",
  LOG_PAYMENT: "Payment wallet credit:",
} as const;

export const SESSION_STRINGS = {
  DEFAULTS: {
    MAX_PARTICIPANTS: 2,
    P2P_MAX: 6,
    PRIVATE_MAX: 12,
    PUBLIC_MAX: 24,
    REGEX_OPTIONS: "i",
    AGORA_CHANNEL_PREFIX: "session_",
  },
  NOTIFICATIONS: {
    TITLES: {
      PRIVATE_INVITE: "New Private Session Invitation",
      PEER_INVITE: "Peer-to-Peer Session Invite",
      SESSION_CREATED: "Session Created Successfully",
    },
    MESSAGES: {
      PRIVATE_INVITE: (topic: string) =>
        `You've been invited to a private session: "${topic}" by your mentor.`,
      PEER_INVITE: (topic: string) =>
        `You’ve been invited to join a session: "${topic}".`,
      SESSION_CREATED: (topic: string) =>
        `Your session "${topic}" has been created.`,
    },
  },
  WALLET: {
    REFUND_PUBLIC_SESSION: "Refund for cancelled public session",
  },
  LOGS: {
    CREATE_SESSION: "CREATE_SESSION",
    MENTOR_ID: "MENTOR_ID",
    SESSION_STATUS_UPDATE: "SESSION_STATUS_UPDATE",
  },
} as const;

export const PLAN_TYPES = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  BIWEEKLY: "BIWEEKLY",
  TRIWEEKLY: "TRIWEEKLY",
} as const;

export const SUBSCRIPTION_STRINGS = {
  PAYMENT_DESCRIPTION: `Subscription payment from student`,

  NOTIFICATIONS: {
    TITLE: "New Student Subscription",
    MESSAGE: "A new student has subscribed to you. Congratulations.",
  },
  ERRORS: {
    CREATE_FAILED: "Failed to create subscription",
    PRICE_MISSING: "Subscription price is not defined",
  },
} as const;

export const SESSION_AUTO_CREATE_STRINGS = {
  TOPIC: "Subscription Session",
  DESCRIPTION: "Auto-scheduled session",
  CREATED_BY_MODEL: "Mentor",
} as const;

export const CRON_STRINGS = {
  DAILY_SUBSCRIPTION_JOB: "Running daily subscription cron...",
} as const;

/* ===============================
   USER MODULE CONSTANTS
   =============================== */

export const USER_STRINGS = {
  ROLE: {
    USER: "user",
    MENTOR: "mentor",
  },
  OTP: {
    NOT_VERIFIED: "OTP not verified. Please verify OTP first.",
  },
  PASSWORD: {
    INVALID_FORMAT:
      "Password must contain uppercase, lowercase, number, symbol, and be at least 8 characters",
  },
  PROFILE: {
    DEFAULT_GOOGLE_NAME: "Google User",
  },
  ERRORS: {
    GOOGLE_EMAIL_MISSING: "Google profile missing email",
  },
} as const;

/* ===============================
   EMAIL / OTP TEMPLATES
   =============================== */

export const EMAIL_TEMPLATES = {
  OTP: {
    SUBJECT: "Your OTP Code",
    TEXT: (otp: string) =>
      `Your verification code is ${otp}. It expires in 10 minutes.`,
  },
  FORGOT_PASSWORD: {
    SUBJECT: "Password Reset Code",
    TEXT: (otp: string) =>
      `Your password reset verification code is ${otp}. It expires in 10 minutes.`,
  },
} as const;

/* ===============================
   PASSWORD RULES
   =============================== */

export const PASSWORD_RULES = {
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
} as const;

/* ===============================
   GOOGLE AUTH CONSTANTS
   =============================== */

export const GOOGLE_AUTH_STRINGS = {
  DEFAULT_PROFILE_NAME: "Google User",
  DEFAULT_PROFILE_PICTURE: "",
  ROLE: "user",
  MODEL_NAME: "Google",
} as const;

/* ===============================
   HOME DASHBOARD STRINGS
   =============================== */

export const HOME_STATS_STRINGS = {
  NOT_FOUND: "User not found",
} as const;

/* ===============================
   VALIDATION STRINGS
   =============================== */

export const VALIDATION_STRINGS = {
  INVALID_INPUT: "Invalid or missing input fields",
} as const;

/* ===============================
   MENTOR LISTING FILTER STRINGS
   =============================== */

export const MENTOR_FILTER_STRINGS = {
  VERIFIED: "approved",
  NOT_BLOCKED: false,
} as const;

/* ===============================
   EMAIL PROVIDER CONSTANT
   =============================== */

export const EMAIL_PROVIDER_CONSTANTS = {
  GMAIL: "gmail",
} as const;

/* ===============================
   ADMIN MODULE CONSTANTS
   =============================== */

export const ADMIN_MESSAGES = {
  ERROR: {
    DASHBOARD_LOAD_FAILED: "Failed to load admin dashboard stats",
    SESSION_FETCH_FAILED: "Failed to fetch sessions",
    INVALID_REPORT_TYPE:
      "Invalid type. Must be one of: session, mentor, user, dailyTask, payment",
    REPORT_GENERATION_FAILED: "Failed to generate report",
  },
  SUCCESS: {
    REPORT_GENERATED: "Report generated successfully",
  },
} as const;

export const COOKIE_KEYS = {
  AUTH: "auth-token",
  REFRESH: "refresh-token",
  ROLE: "role",
  NODE_ENV: "production",
  SAME_SITE: "none",
  PATH: "/",
  DOMAIN: "spokely.live",
} as const;

export const ADMIN_QUERY = {
  PAGE: 1,
  LIMIT: 10,
  SEARCH: "",
  STATUS_ALL: "all",
  TYPE: "all",
} as const;

export const REPORT_TYPES = {
  SESSION: "session",
  MENTOR: "mentor",
  USER: "user",
  DAILY_TASK: "dailyTask",
  PAYMENT: "payment",
} as const;

export const REPORT_TYPE_LIST = Object.values(REPORT_TYPES);

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

export const LOG_STRINGS = {
  REPORT_ERROR: "Error in getReports:",
  DASHBOARD_ERROR: "Error fetching admin dashboard stats:",
} as const;

export const GOOGLE_AUTH_MESSAGES = {
  ERROR_NO_USER: "No user found after Google authentication",
  ERROR_AUTH_FAILED: "Google authentication failed",
} as const;

export const REDIRECT_URLS = {
  DEFAULT_CLIENT: process.env.CLIENT_SIDE_URL,
  GOOGLE_AUTH_FAILED: "error=google_auth_failed",
  USER_HOME: "/user/home",
} as const;

export const USER_MESSAGES = {
  TOKEN_REFRESHED: "Access token refreshed",
} as const;

export const USER_QUERY = {
  PAGE: 1,
  LIMIT: 10,
  SEARCH: "",
} as const;

export const REPORT_COLUMNS: Record<
  string,
  { key: string; label: string; width: number }[]
> = {
  user: [
    { key: "name", label: "Name", width: 120 },
    { key: "email", label: "Email", width: 150 },
    { key: "phone", label: "Phone", width: 90 },
    { key: "isBlocked", label: "Blocked", width: 60 },
    { key: "sessionsDone", label: "Sessions", width: 60 },
    { key: "createdAt", label: "Created", width: 100 },
  ],
  mentor: [
    { key: "name", label: "Name", width: 120 },
    { key: "email", label: "Email", width: 150 },
    { key: "document.verificationStatus", label: "Status", width: 70 },
    { key: "isBlocked", label: "Blocked", width: 60 },
    { key: "tags", label: "Tags", width: 150 },
  ],
  session: [
    { key: "topic", label: "Topic", width: 160 },
    { key: "type", label: "Type", width: 100 },
    { key: "status", label: "Status", width: 140 },
    { key: "createdAt", label: "Created", width: 100 },
  ],
  payment: [
    { key: "userEmail", label: "User", width: 140 },
    { key: "amount", label: "Amount", width: 80 },
    { key: "status", label: "Status", width: 70 },
    { key: "createdAt", label: "Created", width: 100 },
  ],
  dailyTask: [
    { key: "user", label: "User", width: 100 },
    { key: "level", label: "Level", width: 50 },
    { key: "task", label: "Task", width: 200 },
    { key: "completed", label: "Done", width: 40 },
  ],
};
