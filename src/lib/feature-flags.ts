export const featureFlags = {
  magicLink: process.env.ENABLE_MAGIC_LINK === "true",
  publicRegistration: process.env.ENABLE_PUBLIC_REGISTRATION !== "false",
  billing: process.env.ENABLE_BILLING === "true",
  pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === "true",
}
