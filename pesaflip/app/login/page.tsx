"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login - in a real app, this would call an authentication API
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/overview");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pesaflip</h1>
          <p className="text-neutral-500 mt-1">B2B SME Finance Platform</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Log in to your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@company.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Don't have an account?{" "}
              <Link 
                href="/register" 
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-800">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-800">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
} 