"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, User, ArrowRight, Mail, Phone, Building, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("employer");

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "jobseeker" || role === "employer") {
      setActiveTab(role);
    }
  }, [searchParams]);

  const [employerData, setEmployerData] = useState({
    companyName: "",
    companyLocation: "",
    companyAddress: "",
    companyDomain: "",
    spocName: "",
    mobile: "",
    employeeCount: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [jobSeekerData, setJobSeekerData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    currentLocation: "",
    preferredLocation: "",
    employmentType: "fresher",
    password: "",
    confirmPassword: "",
  });

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (employerData.password !== employerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register/employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to PPS Jobs! You have received 10 free credits valid for 30 days.",
      });

      // Store user data and redirect
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/employer/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJobSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (jobSeekerData.password !== jobSeekerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register/jobseeker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobSeekerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to PPS Jobs! Complete your profile to get better job matches.",
      });

      // Store user data and redirect
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/jobseeker/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              PPS Jobs
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join PPS Jobs and start your journey</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Choose your account type and fill in the details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employer" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Employer
                </TabsTrigger>
                <TabsTrigger value="jobseeker" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Job Seeker
                </TabsTrigger>
              </TabsList>

              {/* Employer Registration */}
              <TabsContent value="employer">
                <form onSubmit={handleEmployerSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="Your Company Name"
                        value={employerData.companyName}
                        onChange={(e) => setEmployerData({ ...employerData, companyName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyLocation">Company Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="companyLocation"
                          placeholder="City, District, State"
                          value={employerData.companyLocation}
                          onChange={(e) => setEmployerData({ ...employerData, companyLocation: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Input
                      id="companyAddress"
                      placeholder="Full Address"
                      value={employerData.companyAddress}
                      onChange={(e) => setEmployerData({ ...employerData, companyAddress: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyDomain">Company Domain</Label>
                      <Input
                        id="companyDomain"
                        placeholder="e.g., Technology, Healthcare"
                        value={employerData.companyDomain}
                        onChange={(e) => setEmployerData({ ...employerData, companyDomain: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Select
                        value={employerData.employeeCount}
                        onValueChange={(value) => setEmployerData({ ...employerData, employeeCount: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="500+">500+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spocName">SPOC Person Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="spocName"
                        placeholder="Contact Person Name"
                        value={employerData.spocName}
                        onChange={(e) => setEmployerData({ ...employerData, spocName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employerEmail">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="employerEmail"
                          type="email"
                          placeholder="company@example.com"
                          value={employerData.email}
                          onChange={(e) => setEmployerData({ ...employerData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employerMobile">Mobile Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="employerMobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={employerData.mobile}
                          onChange={(e) => setEmployerData({ ...employerData, mobile: e.target.value })}
                          className="pl-10"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employerPassword">Password *</Label>
                      <Input
                        id="employerPassword"
                        type="password"
                        placeholder="Create password"
                        value={employerData.password}
                        onChange={(e) => setEmployerData({ ...employerData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employerConfirmPassword">Confirm Password *</Label>
                      <Input
                        id="employerConfirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={employerData.confirmPassword}
                        onChange={(e) => setEmployerData({ ...employerData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">Free Credits!</p>
                      <p>You will receive 10 free credits valid for 30 days upon registration.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register as Employer"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </TabsContent>

              {/* Job Seeker Registration */}
              <TabsContent value="jobseeker">
                <form onSubmit={handleJobSeekerSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="fullName"
                        placeholder="Your Full Name"
                        value={jobSeekerData.fullName}
                        onChange={(e) => setJobSeekerData({ ...jobSeekerData, fullName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobseekerEmail">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="jobseekerEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={jobSeekerData.email}
                          onChange={(e) => setJobSeekerData({ ...jobSeekerData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobseekerMobile">Mobile Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="jobseekerMobile"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={jobSeekerData.mobile}
                          onChange={(e) => setJobSeekerData({ ...jobSeekerData, mobile: e.target.value })}
                          className="pl-10"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentLocation">Current Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="currentLocation"
                          placeholder="City, District, State"
                          value={jobSeekerData.currentLocation}
                          onChange={(e) => setJobSeekerData({ ...jobSeekerData, currentLocation: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredLocation">Preferred Job Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="preferredLocation"
                          placeholder="City, District, State"
                          value={jobSeekerData.preferredLocation}
                          onChange={(e) => setJobSeekerData({ ...jobSeekerData, preferredLocation: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select
                      value={jobSeekerData.employmentType}
                      onValueChange={(value) => setJobSeekerData({ ...jobSeekerData, employmentType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fresher">Fresher</SelectItem>
                        <SelectItem value="experienced">Experienced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobseekerPassword">Password *</Label>
                      <Input
                        id="jobseekerPassword"
                        type="password"
                        placeholder="Create password"
                        value={jobSeekerData.password}
                        onChange={(e) => setJobSeekerData({ ...jobSeekerData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobseekerConfirmPassword">Confirm Password *</Label>
                      <Input
                        id="jobseekerConfirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={jobSeekerData.confirmPassword}
                        onChange={(e) => setJobSeekerData({ ...jobSeekerData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-emerald-800">
                      <p className="font-semibold">Welcome Aboard!</p>
                      <p>Complete your profile after registration to get better job matches from top employers.</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register as Job Seeker"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign in here
                </Link>
              </p>
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
