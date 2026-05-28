import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "MENTEE"
      status: string
      tenantId: string
      tenantSlug: string
      onboardingDone: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "MENTEE"
    status?: string
    tenantId?: string
    tenantSlug?: string
    onboardingDone?: boolean
  }
}
