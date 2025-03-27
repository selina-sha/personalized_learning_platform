'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        role: formData.get('role'),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md p-4 shadow-md">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-semibold">Register</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input name="firstName" id="firstName" required />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input name="lastName" id="lastName" required />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input name="username" id="username" required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" name="email" id="email" required />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input type="password" name="password" id="password" required />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select name="role" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </SelectContent>
              </Select>
              {/* Hidden input to pass selected role to FormData */}
              <input type="hidden" name="role" id="hiddenRole" />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full">Register</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
