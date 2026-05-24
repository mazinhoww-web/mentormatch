import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
      status: string
      tenantId: string
      tenantSlug: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    status?: string
    tenantId?: string
    tenantSlug?: string
  }
}
