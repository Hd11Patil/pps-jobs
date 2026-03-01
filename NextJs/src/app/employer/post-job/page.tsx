"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, DollarSign, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PostJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [canPost, setCanPost] = useState(true);
  const [activeJobCount, setActiveJobCount] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    requirements: "",
    salary: "",
    experienceRequired: "",
  });

  useEffect(() => {
    checkAuth();
    checkJobLimit();
  }, []);

  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "employer") {
      router.push("/auth/login");
    }
  };

  const checkJobLimit = async () => {
    try {
      setCheckingLimit(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/employer/jobs", {
        headers: {
          authorization: user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const activeJobs = data.jobs.filter((job: any) => job.isActive).length;
        setActiveJobCount(activeJobs);

        if (activeJobs >= 4) {
          setCanPost(false);
        }
      }
    } catch (error) {
      console.error("Error checking job limit:", error);
    } finally {
      setCheckingLimit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canPost) {
      toast({
        title: "Job Limit Reached",
        description: "You have reached maximum job posting limit (4). Please delete an existing job to post a new one.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: user.id,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to post job");
      }

      toast({
        title: "Job Posted Successfully!",
        description: "Your job has been posted and is now visible to job seekers.",
      });

      router.push("/employer/jobs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
                <p className="text-sm text-gray-600">Post New Job</p>
              </div>
            </div>
            <Link href="/employer/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Limit Warning */}
        {!canPost && (
          <Card className="mb-6 border-2 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">Job Posting Limit Reached</h3>
                  <p className="text-red-700 mb-4">
                    You have reached maximum job posting limit (4). Please delete an existing job to post a new one.
                  </p>
                  <div className="flex items-center justify-between bg-red-100 rounded-lg p-3">
                    <span className="text-red-800 font-medium">Active Jobs: {activeJobCount} / 4</span>
                    <Link href="/employer/jobs">
                      <Button size="sm" variant="destructive">
                        Manage Jobs
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Jobs Counter */}
        {canPost && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-800">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Active Jobs: {activeJobCount} / 4</span>
                </div>
                {activeJobCount >= 3 && (
                  <span className="text-sm text-green-700">
                    Only {4 - activeJobCount} more job posting(s) remaining
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Post Job Form */}
        <Card>
          <CardHeader>
            <CardTitle>Post New Job</CardTitle>
            <CardDescription>
              Fill in the details below to post a new job opening
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={!canPost}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Job Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="location"
                    placeholder="City, District, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                    required
                    disabled={!canPost}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                    <Input
                      id="salary"
                      placeholder="e.g., 5-8 LPA"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="pl-10"
                      disabled={!canPost}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Required</Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 2-3 years, Fresher"
                    value={formData.experienceRequired}
                    onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                    disabled={!canPost}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                  disabled={!canPost}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the skills, qualifications, and requirements..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                  disabled={!canPost}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={loading || !canPost}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
                <Link href="/employer/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
