"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Users,
  Wallet,
  LogOut,
  Building2,
  Plus,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  creditBalance: number;
  expiryDate: string | null;
  unlockedProfiles: number;
}

interface Job {
  id: string;
  title: string;
  location: string;
  salary?: string;
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [employer, setEmployer] = useState<any>(null);

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
        if (user.role !== "employer") {
          router.push("/auth/login");
          return;
        }
        setEmployer(user);
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

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      // Fetch dashboard stats
      const statsRes = await fetch("/api/employer/stats", {
        headers: {
          authorization: user.id,
        },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch recent jobs
      const jobsRes = await fetch("/api/employer/jobs", {
        headers: {
          authorization: user.id,
        },
      });
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

  const calculateDaysLeft = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center ml-4`}>
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

  const daysLeft = stats?.expiryDate ? calculateDaysLeft(stats.expiryDate) : null;

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
                <p className="text-sm text-gray-600">Employer Panel</p>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {employer?.employer?.companyName || "Employer"}!
          </h2>
          <p className="text-gray-600">Manage your jobs, candidates, and credits from here.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/employer/post-job">
            <Button className="w-full h-auto flex-col gap-2 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Plus className="w-6 h-6" />
              <span>Post Job</span>
            </Button>
          </Link>
          <Link href="/employer/jobs">
            <Button variant="outline" className="w-full h-auto flex-col gap-2 py-6">
              <Briefcase className="w-6 h-6" />
              <span>My Jobs</span>
            </Button>
          </Link>
          <Link href="/employer/jobseekers">
            <Button variant="outline" className="w-full h-auto flex-col gap-2 py-6">
              <Users className="w-6 h-6" />
              <span>Search Candidates</span>
            </Button>
          </Link>
          <a
            href="https://wa.me/919137646449?text=Hi, I want to buy credits for my account."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full h-full flex-col gap-2 py-6 border-green-500 text-green-600 hover:bg-green-50">
              <Wallet className="w-6 h-6" />
              <span>Buy Credits</span>
            </Button>
          </a>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Briefcase}
              title="Active Jobs"
              value={stats.activeJobs}
              subtitle="/ 4 max"
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={Users}
              title="Total Applications"
              value={stats.totalApplications}
              color="from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={Wallet}
              title="Credit Balance"
              value={stats.creditBalance}
              subtitle={daysLeft !== null ? `${daysLeft} days left` : "No expiry"}
              color="from-teal-500 to-cyan-600"
            />
            <StatCard
              icon={Eye}
              title="Unlocked Profiles"
              value={stats.unlockedProfiles}
              color="from-cyan-500 to-blue-600"
            />
          </div>
        )}

        {/* Credit Warning */}
        {stats && stats.creditBalance === 0 && (
          <Card className="mb-8 border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900">No Credits Left</p>
                <p className="text-sm text-orange-700">
                  You've used all your credits.{" "}
                  <a
                    href="https://wa.me/919137646449?text=Hi, I want to buy credits for my account."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Buy more credits on WhatsApp
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Job Posts</CardTitle>
              <Link href="/employer/jobs">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
                <Link href="/employer/post-job">
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-green-600">₹</span>
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicationCount} applicants
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Link href={`/employer/jobs`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
