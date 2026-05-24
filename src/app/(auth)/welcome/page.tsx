import Link from "next/link"
import { PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function WelcomePage() {
  return (
    <Card className="text-center">
      <CardHeader className="space-y-4 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">
          Cadastro realizado com sucesso!
        </CardTitle>
        <CardDescription className="text-base">
          Seu perfil está sendo analisado. Você receberá uma notificação quando
          for aprovado.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Link href="/t/default/mentor">
          <Button className="w-full">Ir para o Dashboard</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
