import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const freePlan = await prisma.plan.upsert({
    where: { tier: "FREE" },
    update: {},
    create: {
      name: "Free",
      tier: "FREE",
      price: 0,
      maxUsers: 50,
      maxMentors: 10,
      maxLibraryMb: 500,
      features: {
        email_notifications: true,
        dashboard: true,
        library: true,
        skills_management: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { tier: "STARTER" },
    update: {},
    create: {
      name: "Starter",
      tier: "STARTER",
      price: 9900,
      maxUsers: 200,
      maxMentors: 50,
      maxLibraryMb: 5000,
      features: {
        email_notifications: true,
        dashboard: true,
        library: true,
        skills_management: true,
        custom_branding: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { tier: "PROFESSIONAL" },
    update: {},
    create: {
      name: "Professional",
      tier: "PROFESSIONAL",
      price: 29900,
      maxUsers: 1000,
      maxMentors: 200,
      maxLibraryMb: 50000,
      features: {
        email_notifications: true,
        push_notifications: true,
        dashboard: true,
        library: true,
        skills_management: true,
        custom_branding: true,
        advanced_reports: true,
        api_access: true,
      },
    },
  })

  await prisma.plan.upsert({
    where: { tier: "ENTERPRISE" },
    update: {},
    create: {
      name: "Enterprise",
      tier: "ENTERPRISE",
      price: 0,
      maxUsers: 999999,
      maxMentors: 999999,
      maxLibraryMb: 999999,
      features: {
        email_notifications: true,
        push_notifications: true,
        dashboard: true,
        library: true,
        skills_management: true,
        custom_branding: true,
        advanced_reports: true,
        api_access: true,
        sso: true,
        dedicated_support: true,
      },
    },
  })

  const tenant = await prisma.tenant.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "MentorMatch Demo",
      slug: "default",
      brandColor: "#6366f1",
    },
  })

  await prisma.subscription.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      planId: freePlan.id,
      active: true,
    },
  })

  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@mentormatch.com" },
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

  const globalSkills = [
    "Liderança",
    "Gestão de Projetos",
    "Comunicação",
    "Desenvolvimento de Software",
    "Marketing Digital",
    "Finanças",
    "Design",
    "Data Science",
    "Produto",
    "Vendas",
    "Recursos Humanos",
    "Estratégia",
  ]

  for (const skillName of globalSkills) {
    await prisma.skill.upsert({
      where: { name_tenantId: { name: skillName, tenantId: tenant.id } },
      update: {},
      create: {
        name: skillName,
        tenantId: tenant.id,
        global: true,
      },
    })
  }

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
