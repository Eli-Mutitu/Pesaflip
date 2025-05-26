"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleUserRound, Building2, KeyRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration - in a real app, this would call an API
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard/overview");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pesaflip</h1>
          <p className="text-neutral-500 mt-1">B2B SME Finance Platform</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-center mb-2">Create your business account</h2>
            <p className="text-center text-neutral-500 mb-8">Set up your business profile to access financial tools</p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <CircleUserRound size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Personal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner's name</Label>
                    <Input 
                      id="ownerName" 
                      type="text" 
                      placeholder="Your full name" 
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
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
                    <Label htmlFor="phone">Phone number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+254 7XX XXX XXX" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Business Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input 
                      id="businessName" 
                      type="text" 
                      placeholder="Your Business Name" 
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business type</Label>
                    <Select value={businessType} onValueChange={setBusinessType} required>
                      <SelectTrigger id="businessType" className="h-11">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="limited_company">Limited Company</SelectItem>
                        <SelectItem value="cooperative">Cooperative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry} required>
                      <SelectTrigger id="industry" className="h-11">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="professional_services">Professional Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of employees</Label>
                    <Select value={employees} onValueChange={setEmployees} required>
                      <SelectTrigger id="employees" className="h-11">
                        <SelectValue placeholder="Select number of employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 employees</SelectItem>
                        <SelectItem value="6-10">6-10 employees</SelectItem>
                        <SelectItem value="11-20">11-20 employees</SelectItem>
                        <SelectItem value="21-50">21-50 employees</SelectItem>
                        <SelectItem value="51-100">51-100 employees</SelectItem>
                        <SelectItem value="100+">100+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                    <KeyRound size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Security</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-11">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Choose a secure password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                    <p className="text-xs text-neutral-500">Must be at least 8 characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Confirm your password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 transition-colors text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2" size={18} />
                      Create account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="bg-neutral-50 p-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-neutral-500">
          By creating an account, you agree to our{" "}
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