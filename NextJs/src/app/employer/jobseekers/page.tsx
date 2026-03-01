"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  MapPin,
  Search,
  Calendar,
  GraduationCap,
  Code,
  DollarSign,
  Loader2,
  Eye,
  Lock,
  User,
  Filter,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobSeeker {
  id: string;
  fullName: string;
  email: string | null;
  mobile: string;
  currentLocation: string;
  preferredLocation: string | null;
  employmentType: string;
  profileCompletion: number;
  skills: string[];
  latestExperience: any;
  isUnlocked: boolean;
  createdAt: string;
}

export default function EmployerJobSeekersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [employer, setEmployer] = useState<any>(null);
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("all");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    checkAuth();
    fetchJobSeekers();
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
      return;
    }
    setEmployer(user);
  };

  const fetchJobSeekers = async (filters?: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    skills?: string;
  }) => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const params = new URLSearchParams();
      if (filters?.keyword || keyword) params.set("keyword", filters?.keyword || keyword);
      if (filters?.location || location) params.set("location", filters?.location || location);
      if (filters?.employmentType || employmentType !== "all") params.set("employmentType", filters?.employmentType || employmentType);
      if (filters?.skills || skills) params.set("skills", filters?.skills || skills);

      const url = `/api/employer/jobseekers${params.toString() ? `?${params.toString()}` : ""}`;

      const response = await fetch(url, {
        headers: {
          authorization: user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobSeekers(data.jobSeekers || []);
      }
    } catch (error) {
      console.error("Error fetching job seekers:", error);
      toast({
        title: "Error",
        description: "Failed to load job seekers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchJobSeekers({
      keyword,
      location,
      employmentType,
      skills,
    });
  };

  const handleClearFilters = () => {
    setKeyword("");
    setLocation("");
    setEmploymentType("all");
    setSkills("");
    fetchJobSeekers({
      keyword: "",
      location: "",
      employmentType: "all",
      skills: "",
    });
  };

  const handleUnlockProfile = async (jobSeekerId: string) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.push("/auth/login");
        return;
      }
      const user = JSON.parse(userStr);

      const response = await fetch("/api/employer/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: user.id,
        },
        body: JSON.stringify({ jobSeekerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to unlock profile");
      }

      toast({
        title: "Success",
        description: "Profile unlocked successfully! You can now view contact details.",
      });

      // Refresh the jobseekers list to update unlock status
      fetchJobSeekers();
    } catch (error: any) {
      console.error("Error unlocking profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unlock profile",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppClick = (mobile: string, name: string) => {
    // Clean the mobile number (remove spaces, dashes, etc.)
    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    const message = `Hi ${name}, I found your profile on PPS Jobs and would like to discuss a job opportunity.`;
    const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PPS Jobs</h1>
                <p className="text-sm text-gray-600">Employer - Find Candidates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/employer/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Job Seekers</h2>

        {/* Search & Filters */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Keyword</label>
                <Input
                  type="text"
                  placeholder="Name, email..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="City, District, State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Employment Type</label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fresher">Fresher</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Skills</label>
                <Input
                  type="text"
                  placeholder="Search by skills..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {loading ? "Loading..." : `${jobSeekers.length} candidate(s) found`}
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : jobSeekers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobSeekers.map((js) => (
              <Card key={js.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{js.fullName}</CardTitle>
                        <Badge variant={js.employmentType === "fresher" ? "secondary" : "default"} className="mt-1">
                          {js.employmentType === "fresher" ? "Fresher" : "Experienced"}
                        </Badge>
                      </div>
                    </div>
                    {js.isUnlocked ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{js.currentLocation}</span>
                      {js.preferredLocation && js.preferredLocation !== js.currentLocation && (
                        <span className="text-gray-400">→ {js.preferredLocation}</span>
                      )}
                    </div>

                    {js.latestExperience && (
                      <div className="border-l-4 border-green-500 pl-3 py-1">
                        <p className="font-semibold text-sm text-gray-900">{js.latestExperience.designation}</p>
                        <p className="text-sm text-green-600">{js.latestExperience.companyName}</p>
                        {js.latestExperience.lastSalary && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>{js.latestExperience.lastSalary}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {js.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {js.skills.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {js.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{js.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    {js.isUnlocked ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Email:</span>
                            <a href={`mailto:${js.email}`} className="text-blue-600 hover:underline">
                              {js.email || "Not provided"}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Mobile:</span>
                            <a
                              href={`https://wa.me/${js.mobile.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline flex items-center gap-1"
                            >
                              {js.mobile}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleWhatsAppClick(js.mobile, js.fullName)}
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Message on WhatsApp
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        onClick={() => handleUnlockProfile(js.id)}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock Profile (1 Credit)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
