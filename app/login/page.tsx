"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background text-foreground">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />

      <Card className="w-full max-w-md mx-4 relative z-10 bg-accent-1/50 backdrop-blur-sm border-accent-2">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 border-accent-2 text-black placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-100 border-accent-2 text-black placeholder:text-gray-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#00ff8c] text-black hover:bg-[#00cf8a] transition-colors duration-200"
            >
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#00ff8c] hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
