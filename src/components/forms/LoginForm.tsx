import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { login, getRoleRedirect } from "@/lib/auth";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const { user } = await login(email, password);
      window.location.href = getRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold font-['Outfit'] text-center">Selamat Datang Kembali</CardTitle>
        <CardDescription className="text-center">
          Masukkan email dan password untuk masuk ke akun Anda
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <a href="#" className="text-sm text-primary hover:underline">Lupa password?</a>
            </div>
            <Input id="password" type="password" required />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun? <a href="/register" className="text-primary hover:underline font-medium">Daftar sekarang</a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
