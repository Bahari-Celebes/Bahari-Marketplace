import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { register, getRoleRedirect } from "@/lib/auth";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
    const cooperativeId = (form.elements.namedItem('cooperativeId') as HTMLInputElement)?.value;

    try {
      const { user } = await register({ name, email, password, role, cooperativeId: cooperativeId || undefined });
      window.location.href = getRoleRedirect(user.role);
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold font-['Outfit'] text-center">Buat Akun Baru</CardTitle>
        <CardDescription className="text-center">
          Daftarkan akun untuk mengakses BAHARI Intelligence
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Nama Lengkap</label>
            <Input id="name" type="text" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Input id="password" type="password" required minLength={6} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="role">Peran</label>
            <select
              id="role"
              name="role"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih Peran...</option>
              <option value="cooperative_manager">Pengurus Koperasi</option>
              <option value="operator">Operator Koperasi</option>
              <option value="reviewer">Pengawas / Reviewer</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="cooperativeId">ID Koperasi (untuk pengurus & operator)</label>
            <Input id="cooperativeId" type="text" placeholder="UUID koperasi" />
          </div>
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun? <a href="/login" className="text-primary hover:underline font-medium">Masuk di sini</a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
