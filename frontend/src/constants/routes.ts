export const CONNECTION_ROUTES = {
  base: "/users/connections",
  send: "/send",
  requests: "/requests",
  accept: "/accept",
  reject: "/reject",
  list: "/list",
  sentRequests: "/sent-requests",
};

export const ADMIN_ROUTES = {
  base: "/admin",
  login: "/login",
  logout: "/logout",
  users: "/users",
  mentors: "/mentors",
  sessions: "/sessions",
  status: "/status",
  verification: "/verification",
  approve: "/approve",
  reject: "/reject",
  refreshToken: "/refresh-token",
};

export const USER_ROUTES = {
  base: "/users",
  signup: "/signup",
  login: "/login",
  logout: "/logout",
  refreshToken: "/refresh-token",
  sendOTP: "/send-otp",
  verifyOTP: "/verify-otp",
  sendForgotPasswordOTP: "/send-forgot-password-otp",
  verifyForgotPasswordOTP: "/verify-forgot-password-otp",
  resetPassword: "/reset-password",
  home: "/home",
  edit: "/edit",
  changePassword: "/change-password",
  peerProfile: "/peer/profile",
  mentorLising:"/mentor/listing"
};

export const MENTOR_ROUTES = {
  base: "/mentors",
  signup: "/signup",
  login: "/login",
  logout: "/logout",
  refreshToken: "/refresh-token",
  sendOTP: "/send-otp",
  verifyOTP: "/verify-otp",
  sendForgotPasswordOTP: "/send-forgot-password-otp",
  verifyForgotPasswordOTP: "/verify-forgot-password-otp",
  resetPassword: "/reset-password",
  home: "/home",
  edit: "/edit",
  changePassword: "/change-password",
  mentorProfile: "/mentor-profile",
  resubmitDocument: "/re-submit",
};

export const CHAT_ROUTES = {
  base: "/chat",
  messages: "/messages",
  all: "/all",
};

export const PAYMENT_ROUTES = {
  base: "/payment",
  create: "/create",
  capture: "/capture",
  createSubscription: "/create-subscription",
  captureSubscription: "/capture-subscription",
  wallet:"/wallet",
};

export const SESSION_ROUTES = {
  base: "/users/session",
  schedule: "/schedule",
  list: "/list",
  details: "/details",
  update: "",
  respond: "/respond",
  cancelParticipation: "/cancel-participation",
  cancelSession: "/cancel-session",
  flag: "/flag",
  token: "/token",
  publicSessions: "/public-sessions",
  feedback: "/feedback",
  adminList: "/list-session",
  adminDetails: "/admin",
};

export const SUBSCRIPTION_ROUTES = {
  base: "/subscription",
  mentorPlans: "/mentor",
  savePlans: "/mentor/plans",
  subscribe: "/subscribe",
  mySubscriptions: "/my-subscriptions",
  mentorStudents: "/mentor-students",
};

export const NOTIFICATION_ROUTES = {
  base:"/notifications",
  read:"/read",
}