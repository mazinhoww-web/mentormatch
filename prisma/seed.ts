import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // ─── Plans ──────────────────────────────────────────────────
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      description: "Plano gratuito para comecar",
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 50,
      maxConnections: 100,
      maxLibraryItems: 10,
      maxAdmins: 1,
      features: {
        basic_analytics: true,
        email_notifications: true,
        dashboard: true,
        library: true,
        skills_management: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "Para pequenas equipes",
      priceMonthly: 299,
      priceYearly: 2990,
      maxUsers: 200,
      maxConnections: 500,
      maxLibraryItems: 50,
      maxAdmins: 3,
      features: {
        basic_analytics: true,
        email_notifications: true,
        push_notifications: true,
        priority_support: true,
        dashboard: true,
        library: true,
        skills_management: true,
        custom_branding: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "Para empresas em crescimento",
      priceMonthly: 799,
      priceYearly: 7990,
      maxUsers: 1000,
      maxConnections: 999999,
      maxLibraryItems: 500,
      maxAdmins: 10,
      features: {
        advanced_analytics: true,
        email_notifications: true,
        push_notifications: true,
        priority_support: true,
        dashboard: true,
        library: true,
        skills_management: true,
        custom_branding: true,
        api_access: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      description: "Para grandes organizacoes",
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 999999,
      maxConnections: 999999,
      maxLibraryItems: 999999,
      maxAdmins: 999999,
      features: {
        all_features: true,
        dedicated_support: true,
        sla: true,
        custom_integrations: true,
        sso: true,
        api_access: true,
      },
    },
  })

  // ─── Skills (20 with categories) ─────────────────────────────
  const skillsData = [
    // Technology
    { name: "JavaScript", category: "Technology" },
    { name: "Python", category: "Technology" },
    { name: "React", category: "Technology" },
    { name: "Node.js", category: "Technology" },
    { name: "Cloud Computing", category: "Technology" },
    // Design
    { name: "UX Design", category: "Design" },
    { name: "UI Design", category: "Design" },
    { name: "Design Thinking", category: "Design" },
    { name: "Figma", category: "Design" },
    // Management
    { name: "Lideranca", category: "Management" },
    { name: "Gestao de Projetos", category: "Management" },
    { name: "Gestao de Pessoas", category: "Management" },
    { name: "Agile/Scrum", category: "Management" },
    // Marketing
    { name: "Marketing Digital", category: "Marketing" },
    { name: "Growth", category: "Marketing" },
    { name: "SEO", category: "Marketing" },
    { name: "Branding", category: "Marketing" },
    // Career
    { name: "Comunicacao", category: "Career" },
    { name: "Mentoria de Carreira", category: "Career" },
    { name: "Transicao de Carreira", category: "Career" },
  ]

  for (const skillData of skillsData) {
    await prisma.skill.upsert({
      where: { name: skillData.name },
      update: {},
      create: {
        name: skillData.name,
        category: skillData.category,
        usageCount: 0,
        isActive: true,
      },
    })
  }

  // ─── Default Tenant ─────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "MentorMatch Demo",
      slug: "default",
      brandColor: "#6366f1",
      secondaryColor: "#e11d48",
      maxUsers: 50,
      maxConnections: 100,
      maxLibraryItems: 10,
      planId: freePlan.id,
    },
  })

  // ─── Admin User ─────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email_tenantId: { email: "admin@mentormatch.com", tenantId: tenant.id } },
    update: {},
    create: {
      email: "admin@mentormatch.com",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
      status: "APPROVED",
      tenantId: tenant.id,
      bio: "Administrador da plataforma MentorMatch Demo.",
    },
  })

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
