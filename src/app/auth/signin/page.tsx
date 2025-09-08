"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Mail, Lock } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("🔐 Tentativo di login con:", formData.email)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      console.log("🔍 Risultato signIn:", result)

      if (result?.error) {
        console.error("❌ Errore signIn:", result.error)
        setError("Credenziali non valide")
      } else if (result?.ok) {
        console.log("✅ Login riuscito, reindirizzamento...")
        router.push("/dashboard")
      } else {
        console.warn("⚠️ Risultato inatteso:", result)
        setError("Errore durante l'accesso")
      }
    } catch (error) {
      console.error("❌ Eccezione durante login:", error)
      setError("Errore durante l'accesso")
    } finally {
      setIsLoading(false)
    }
  }

  // Google SignIn temporaneamente disabilitato
  // const handleGoogleSignIn = async () => {
  //   setIsLoading(true)
  //   try {
  //     await signIn("google", { callbackUrl: "/dashboard" })
  //   } catch (error) {
  //     setError("Errore durante l'accesso con Google")
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Accedi</h1>
          <p className="text-muted-foreground">
            Accedi al tuo account Pricing Monitor
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Benvenuto</CardTitle>
            <CardDescription>
              Inserisci le tue credenziali per accedere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@esempio.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Accesso..." : "Accedi"}
              </Button>
            </form>

            {/* Google Login temporaneamente disabilitato */}
            {/* 
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Oppure continua con
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            */}

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Non hai un account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Registrati
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline">
            ← Torna alla home
          </Link>
        </div>
      </div>
    </div>
  )
}
