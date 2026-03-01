"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Wallet,
  Lock,
  Building2,
  UserCheck,
  AlertCircle,
  TrendingUp,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalEmployers: number;
  totalJobSeekers: number;
  activeCredits: number;
  expiredCredits: number;
  totalJobs: number;
  activeJobs: number;
  deactivatedJobs: number;
  totalUnlocks: number;
}

interface User {
  id: string;
  email: string | null;
  mobile: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  employer?: {
    companyName: string;
  };
  jobSeeker?: {
    fullName: string;
  };
}

interface Job {
  id: string;
  title: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  employer: {
    companyName: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    
    // Validate it's valid JSON before parsing
    try {
      const user = JSON.parse(userStr);
      if (user && user.id && user.role) {
        if (user.role !== "admin") {
          router.push("/auth/login");
          return;
        }
        setAdmin(user);
      } else {
        console.error("Invalid user data, redirecting to login");
        router.push("/auth/login");
      }
    } catch (parseError) {
      console.error("Invalid user data in localStorage, clearing:", parseError);
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch recent users
      const usersRes = await fetch("/api/admin/users?limit=10");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData.users || []);
      }

      // Fetch recent jobs
      const jobsRes = await fetch("/api/admin/jobs?limit=10");
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setRecentJobs(jobsData.jobs || []);
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

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to update user status");

      toast({
        title: "Success",
        description: `User ${currentStatus ? "deactivated" : "activated"} successfully`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to update job status");

      toast({
        title: "Success",
        description: `Job ${currentStatus ? "deactivated" : "activated"} successfully`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                <p className="text-sm text-gray-600">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/admin/credits">
            <Button variant="outline" className="gap-2">
              <Wallet className="w-4 h-4" />
              Manage Credits
            </Button>
          </Link>
          <Link href="/admin/export">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Building2}
              title="Total Employers"
              value={stats.totalEmployers}
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={UserCheck}
              title="Total Job Seekers"
              value={stats.totalJobSeekers}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={Briefcase}
              title="Total Jobs"
              value={stats.totalJobs}
              color="from-teal-500 to-cyan-600"
            />
            <StatCard
              icon={Lock}
              title="Total Unlocks"
              value={stats.totalUnlocks}
              color="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon={Wallet}
              title="Active Credits"
              value={stats.activeCredits}
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={AlertCircle}
              title="Expired Credits"
              value={stats.expiredCredits}
              color="from-red-500 to-orange-600"
            />
            <StatCard
              icon={Check}
              title="Active Jobs"
              value={stats.activeJobs}
              color="from-emerald-500 to-green-600"
            />
            <StatCard
              icon={X}
              title="Deactivated Jobs"
              value={stats.deactivatedJobs}
              color="from-gray-500 to-gray-600"
            />
          </div>
        )}

        {/* Tabs for Recent Data */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name/Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.role === "employer"
                              ? user.employer?.companyName
                              : user.jobSeeker?.fullName}
                          </TableCell>
                          <TableCell>
                            {user.email && <div>{user.email}</div>}
                            {user.mobile && <div className="text-sm text-gray-600">{user.mobile}</div>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "employer" ? "default" : "secondary"}>
                              {user.role === "employer" ? "Employer" : "Job Seeker"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "default" : "destructive"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? (
                                <X className="w-4 h-4 text-red-600" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No jobs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.employer.companyName}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge variant={job.isActive ? "default" : "destructive"}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleJobStatus(job.id, job.isActive)}
                            >
                              {job.isActive ? (
                                <X className="w-4 h-4 text-red-600" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
