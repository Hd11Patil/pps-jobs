"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Building2, Search, Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string;
  experienceRequired?: string;
  createdAt: string;
  employer: { companyName: string };
}

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "");
  const [searchLocation, setSearchLocation] = useState(searchParams.get("location") || "");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchJobs();
  }, [searchParams]);

  const checkAuth = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { setUser(null); return; }
      try {
        const userData = JSON.parse(userStr);
        if (userData && userData.id && userData.role) { setUser(userData); } 
        else { setUser(null); }
      } catch { localStorage.removeItem("user"); setUser(null); }
    } catch { setUser(null); }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const keyword = searchParams.get("keyword") || "";
      const location = searchParams.get("location") || "";
      let url = "/api/jobs";
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (location) params.set("location", location);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load jobs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("keyword", searchKeyword);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleApply = async (jobId: string) => {
    if (!user) { router.push("/auth/register?role=jobseeker"); return; }
    if (user.role !== "jobseeker") {
      toast({ title: "Not Eligible", description: "Only job seekers can apply to jobs", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: user.id },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to apply");
      toast({ title: "Application Submitted!", description: "You have successfully applied to this job." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to apply", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPS Jobs</h1>
                <p className="text-sm text-gray-600">Find Your Dream Job</p>
              </div>
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === "jobseeker" && (
                  <Link href="/jobseeker/dashboard">
                    <Button variant="outline" size="sm"><User className="w-4 h-4 mr-2" />Dashboard</Button>
                  </Link>
                )}
                {user.role === "employer" && (
                  <Link href="/employer/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin/dashboard"><Button variant="outline" size="sm">Admin Panel</Button></Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="text" placeholder="Job title, keywords, or company" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="pl-10" onKeyPress={(e) => e.key === "Enter" && handleSearch()} />
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input type="text" placeholder="City, District, or State" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="pl-10" onKeyPress={(e) => e.key === "Enter" && handleSearch()} />
                </div>
              </div>
              <Button onClick={handleSearch} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Search className="w-5 h-5 mr-2" />Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{searchKeyword || searchLocation ? "Search Results" : "All Jobs"}</h2>
            <p className="text-gray-600">{loading ? "Loading..." : `${jobs.length} job(s) found`}</p>
          </div>
          {!searchKeyword && !searchLocation && (
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-4">{searchKeyword || searchLocation ? "Try adjusting your search criteria" : "No jobs are currently posted. Check back later!"}</p>
              {searchKeyword || searchLocation ? (
                <Button variant="outline" onClick={() => router.push("/jobs")}>View All Jobs</Button>
              ) : (
                <Link href="/"><Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">Go to Homepage</Button></Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4" />
                        <span>{job.employer.companyName}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{job.location}</span></div>
                        {job.salary && <div className="flex items-center gap-1"><span className="font-semibold text-green-600">₹</span><span>{job.salary}</span></div>}
                        {job.experienceRequired && <Badge variant="outline">{job.experienceRequired}</Badge>}
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(job.createdAt).toLocaleDateString()}</span></div>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex md:flex-col gap-2 md:min-w-[140px]">
                      {user && user.role === "jobseeker" ? (
                        <Button onClick={() => handleApply(job.id)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                          Apply Now<ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Link href="/auth/register?role=jobseeker">
                          <Button variant="outline" className="w-full">Register to Apply</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PPS Jobs. All rights reserved. Founded by Mr. Shivam Pathak.</p>
        </div>
      </footer>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsContent />
    </Suspense>
  );
}