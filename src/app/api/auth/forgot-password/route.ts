import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await db.user.findFirst({
      where: { email },
    })

    if (user) {
      const token = randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      })

      // Build the reset URL robustly: NEXTAUTH_URL may or may not already
      // include the /mentormatch basePath and may have a trailing slash.
      // Strip both so we never produce /mentormatch/mentormatch or //.
      const base = (process.env.NEXTAUTH_URL || "https://aurimarnogueira.com.br")
        .replace(/\/+$/, "")
        .replace(/\/mentormatch$/, "")
      const resetUrl = `${base}/mentormatch/reset-password?token=${token}`
      await sendPasswordResetEmail(email, resetUrl)
    }

    // Always return success to not reveal if email exists
    return NextResponse.json({
      message: "Se o email existir, um link de redefinição será enviado",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email inválido", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[FORGOT_PASSWORD_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
