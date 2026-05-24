import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  })

export const mentorProfileSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  headline: z.string().min(5, "Título profissional obrigatório"),
  bio: z.string().min(20, "Bio deve ter pelo menos 20 caracteres"),
  education: z.string().optional(),
  experience: z.string().optional(),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsapp: z.string().min(10, "WhatsApp obrigatório"),
  teachingSkills: z.array(z.string()).min(1, "Selecione pelo menos 1 habilidade"),
})

export const menteeProfileSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  headline: z.string().optional(),
  bio: z.string().min(10, "Conte um pouco sobre você"),
  education: z.string().optional(),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  whatsapp: z.string().min(10, "WhatsApp obrigatório"),
  learningSkills: z.array(z.string()).min(1, "Selecione pelo menos 1 habilidade"),
})

export const connectionRequestSchema = z.object({
  mentorId: z.string(),
  message: z.string().min(10, "Descreva por que deseja ser mentorado").max(500),
})

export const libraryItemSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  fileType: z.enum(["PDF", "VIDEO", "ARTICLE", "OTHER"]),
})

export const skillSchema = z.object({
  name: z.string().min(2, "Nome da habilidade obrigatório"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type MentorProfileInput = z.infer<typeof mentorProfileSchema>
export type MenteeProfileInput = z.infer<typeof menteeProfileSchema>
export type ConnectionRequestInput = z.infer<typeof connectionRequestSchema>
export type LibraryItemInput = z.infer<typeof libraryItemSchema>
export type SkillInput = z.infer<typeof skillSchema>
