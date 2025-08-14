import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string
      userType?: string
      adminLevel?: string
      department?: string | null
      permissions?: string[]
      loyaltyPoints?: number
      totalSpent?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role?: string
    image?: string | null
    userType?: string
    adminLevel?: string
    department?: string | null
    permissions?: string[]
    loyaltyPoints?: number
    totalSpent?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    name?: string
    userType?: string
    adminLevel?: string
    department?: string | null
    permissions?: string[]
    loyaltyPoints?: number
    totalSpent?: string
  }
}