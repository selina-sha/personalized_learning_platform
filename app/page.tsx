"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to Personalized Learning Platform
      </h1>

      <div className="flex gap-4">
        <Button onClick={() => router.push("/login")}>Login</Button>
        <Button variant="outline" onClick={() => router.push("/register")}>
          Register
        </Button>
      </div>
    </main>
  );
}
