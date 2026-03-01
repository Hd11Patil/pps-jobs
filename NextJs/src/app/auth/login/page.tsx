"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, User, Lock, ArrowRight, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name || data.user.email || data.user.mobile}!`,
      });

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "employer") {
        router.push("/employer/dashboard");
      } else if (data.user.role === "jobseeker") {
        router.push("/jobseeker/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              PPS Jobs
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to your dashboard</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Mobile</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or mobile"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 text-center mb-4">Register as</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/register?role=employer">
                  <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Employer
                  </Button>
                </Link>
                <Link href="/auth/register?role=jobseeker">
                  <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                    <User className="w-4 h-4 mr-2" />
                    Job Seeker
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-gray-600 hover:text-green-600 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
