"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  CheckCircle2,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppliedJob {
  id: string;
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  status: string;
  salary?: string;
  experienceRequired?: string;
  appliedDate: string;
  jobUrl: string;
}

export default function JobSeekerAppliedJobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);

  useEffect(() => {
    checkAuth();
    fetchAppliedJobs();
  }, []);

  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "jobseeker") {
      router.push("/auth/login");
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/jobseeker/applied-jobs", {
        headers: {
          authorization: user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load applied jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      applied: { label: "Applied", color: "default" },
      viewed: { label: "Viewed", color: "secondary" },
      shortlisted: { label: "Shortlisted", color: "default" },
      rejected: { label: "Rejected", color: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.applied;
    return <Badge variant={config.color === "default" ? "default" : "secondary"} className={config.color === "destructive" ? "" : ""}>
      {config.label}
    </Badge>;
  };

  if (loading) {
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
                <p className="text-sm text-gray-600">My Applied Jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/jobseeker/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Applied Jobs</h2>
            <p className="text-gray-600">
              {loading ? "Loading..." : `${appliedJobs.length} job(s)`}
            </p>
          </div>
        </div>

        {/* Applied Jobs Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : appliedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applied Jobs Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't applied to any jobs yet. Start browsing jobs and apply to your dream positions!
              </p>
              <Link href="/jobs">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appliedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="min-w-[200px]">
                          <div>
                            <p className="font-medium text-gray-900">{job.jobTitle}</p>
                            <Link 
                              href={`/jobs`}
                              className="text-green-600 hover:underline text-sm"
                            >
                              <Eye className="w-4 h-4 inline-block ml-2" />
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.companyName}</p>
                            <p className="text-sm text-gray-600">{job.jobLocation}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {job.salary && <div>₹{job.salary}</div>}
                            {job.experienceRequired && (
                              <Badge variant="outline">{job.experienceRequired}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(job.appliedDate).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
