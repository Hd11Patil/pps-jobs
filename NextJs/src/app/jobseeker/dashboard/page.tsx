"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  LogOut,
  Briefcase,
  MapPin,
  Calendar,
  GraduationCap,
  Code,
  RefreshCw,
  CheckCircle2,
  FileText,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  fullName: string;
  currentLocation: string;
  preferredLocation: string | null;
  employmentType: string;
  profileCompletion: number;
  skills: string[];
  experiences: number;
  experienceDetails: any[];
  appliedJobs: number;
}

export default function JobSeekerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [jobSeeker, setJobSeeker] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/auth/login");
        return;
      }
      
      // Validate it's valid JSON before parsing
      try {
        const user = JSON.parse(userStr);
        if (user && user.id && user.role) {
          if (user.role !== "jobseeker") {
            router.push("/auth/login");
            return;
          }
          setJobSeeker(user);
        } else {
          console.error("Invalid user data, redirecting to login");
          router.push("/auth/login");
        }
      } catch (parseError) {
        console.error("Invalid user data in localStorage, clearing:", parseError);
        localStorage.removeItem("user");
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/auth/login");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      // Fetch dashboard data
      const response = await fetch("/api/jobseeker/dashboard", {
        headers: {
          authorization: user.id,
        },
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPS Jobs</h1>
                <p className="text-sm text-gray-600">Job Seeker Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/jobs">
                  Browse Jobs
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {data?.fullName || "Job Seeker"}!
          </h2>
          <p className="text-gray-600">Manage your profile and track your job applications.</p>
        </div>

        {/* Profile Completion */}
        {data && (
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Profile Completion</h3>
                    <p className="text-sm text-gray-600">Complete your profile to get better job matches</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{data.profileCompletion}%</span>
              </div>
              <Progress value={data.profileCompletion} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Applied Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.appliedJobs}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skills Added</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.skills.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.experiences}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button className="w-full h-auto flex-col gap-2 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" asChild>
            <Link href="/jobseeker/applied-jobs">
              <Briefcase className="w-6 h-6" />
              <span>Applied Jobs</span>
            </Link>
          </Button>
          <Button variant="outline" className="w-full h-auto flex-col gap-2 py-6" asChild>
            <Link href="/jobs">
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                <span>Browse Jobs</span>
              </div>
            </Link>
          </Button>
          <Link href="/jobseeker/experience">
            <Button variant="outline" className="w-full h-auto flex-col gap-2 py-6">
              <GraduationCap className="w-6 h-6" />
              <span>Manage Experience</span>
            </Button>
          </Link>
        </div>

        {/* Profile Summary */}
        {data && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900">{data.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Location</p>
                  <p className="font-semibold text-gray-900">{data.currentLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preferred Location</p>
                  <p className="font-semibold text-gray-900">{data.preferredLocation || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Employment Type</p>
                  <Badge variant={data.employmentType === "fresher" ? "secondary" : "default"}>
                    {data.employmentType === "fresher" ? "Fresher" : "Experienced"}
                  </Badge>
                </div>
              </div>

              {data.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {data && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              {data.experienceDetails && data.experienceDetails.length > 0 ? (
                <div className="space-y-4">
                  {data.experienceDetails.map((exp, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900">{exp.designation}</h4>
                      <p className="text-green-600 font-medium">{exp.companyName}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                        {exp.dateOfJoining && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(exp.dateOfJoining).toLocaleDateString()}
                              {exp.lastWorkingDate && ` - ${new Date(exp.lastWorkingDate).toLocaleDateString()}`}
                              {exp.currentlyWorking && " - Present"}
                            </span>
                          </div>
                        )}
                        {exp.lastSalary && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{exp.lastSalary}</span>
                          </div>
                        )}
                        {exp.currentlyWorking && (
                          <Badge variant="default" className="bg-green-500">
                            Currently Working
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No experience added yet</p>
                  <Link href="/jobseeker/experience">
                    <Button variant="outline" size="sm" className="mt-4">
                      Add Experience
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
