"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  ArrowLeft,
  Trash2,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  RefreshCw,
  AlertTriangle,
  Mail,
  Phone,
  Lock,
  Loader2,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  location: string;
  salary?: string;
  experienceRequired?: string;
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
}

interface Applicant {
  id: string;
  status: string;
  appliedAt: string;
  jobSeeker: {
    id: string;
    fullName: string;
    email: string | null;
    mobile: string;
    currentLocation: string;
    preferredLocation: string | null;
    employmentType: string;
    profileCompletion: number;
    skills: string[];
    experiences: any[];
    isUnlocked: boolean;
  };
}

export default function EmployerJobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jobId: string | null }>({
    open: false,
    jobId: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Applicants dialog state
  const [applicantsDialog, setApplicantsDialog] = useState<{
    open: boolean;
    jobId: string | null;
    jobTitle: string | null;
  }>({
    open: false,
    jobId: null,
    jobTitle: null,
  });
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchJobs();
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

  const fetchJobs = async () => {
    try {
      setLoading(true);

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
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      setDeleting(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          authorization: user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully.",
      });

      setDeleteDialog({ open: false, jobId: null });
      fetchJobs();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleViewApplicants = async (jobId: string, jobTitle: string) => {
    try {
      setLoadingApplicants(true);
      setApplicantsDialog({ open: true, jobId, jobTitle });

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/employer/jobs/${jobId}/applicants`, {
        headers: {
          authorization: user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }

      const data = await response.json();
      setApplicants(data.applicants || []);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast({
        title: "Error",
        description: "Failed to load applicants",
        variant: "destructive",
      });
      setApplicantsDialog({ open: false, jobId: null, jobTitle: null });
    } finally {
      setLoadingApplicants(false);
    }
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

      // Refresh the applicants list to update unlock status
      if (applicantsDialog.jobId) {
        handleViewApplicants(applicantsDialog.jobId, applicantsDialog.jobTitle || "");
      }
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
    const cleanMobile = mobile.replace(/[^0-9]/g, "");
    const message = `Hi ${name}, I found your application on PPS Jobs and would like to discuss the job opportunity.`;
    const whatsappUrl = `https://wa.me/${cleanMobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const activeJobsCount = jobs.filter((job) => job.isActive).length;

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
                <p className="text-sm text-gray-600">My Jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/employer/post-job">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Post New Job
                </Button>
              </Link>
              <Link href="/employer/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{activeJobsCount} / 4</p>
              </div>
              {activeJobsCount >= 4 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-100 px-4 py-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Limit reached</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Posted Yet</h3>
              <p className="text-gray-600 mb-4">Start by posting your first job opening</p>
              <Link href="/employer/post-job">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Post Your First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-green-600">₹</span>
                            <span>{job.salary}</span>
                          </div>
                        )}
                        {job.experienceRequired && (
                          <Badge variant="outline">{job.experienceRequired}</Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <Users className="w-5 h-5" />
                          <span className="font-semibold">{job.applicationCount} Applicants</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 md:min-w-[140px]">
                      {job.applicationCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplicants(job.id, job.title)}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Applicants
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialog({ open: true, jobId: job.id })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, jobId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone and all applications
              will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.jobId && handleDeleteJob(deleteDialog.jobId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Applicants Dialog */}
      <Dialog
        open={applicantsDialog.open}
        onOpenChange={(open) => !open && setApplicantsDialog({ open, jobId: null, jobTitle: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Applicants for {applicantsDialog.jobTitle}</DialogTitle>
                <DialogDescription>
                  {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} found
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            {loadingApplicants ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {applicant.jobSeeker.fullName}
                            </h3>
                            <Badge
                              variant={applicant.jobSeeker.employmentType === "fresher" ? "secondary" : "default"}
                            >
                              {applicant.jobSeeker.employmentType === "fresher" ? "Fresher" : "Experienced"}
                            </Badge>
                            {applicant.jobSeeker.isUnlocked ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{applicant.jobSeeker.currentLocation}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {applicant.jobSeeker.experiences.length > 0 && (
                            <div className="border-l-4 border-green-500 pl-3 py-1 mb-3">
                              <p className="font-semibold text-sm text-gray-900">
                                {applicant.jobSeeker.experiences[0].designation}
                              </p>
                              <p className="text-sm text-green-600">
                                {applicant.jobSeeker.experiences[0].companyName}
                              </p>
                            </div>
                          )}

                          {applicant.jobSeeker.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {applicant.jobSeeker.skills.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {applicant.jobSeeker.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{applicant.jobSeeker.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {applicant.jobSeeker.isUnlocked && (
                            <div className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg space-y-1 mt-3">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <a
                                  href={`mailto:${applicant.jobSeeker.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {applicant.jobSeeker.email || "Not provided"}
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <a
                                  href={`https://wa.me/${applicant.jobSeeker.mobile.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:underline"
                                >
                                  {applicant.jobSeeker.mobile}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex md:flex-col gap-2 md:min-w-[160px]">
                          {applicant.jobSeeker.isUnlocked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() =>
                                handleWhatsAppClick(applicant.jobSeeker.mobile, applicant.jobSeeker.fullName)
                              }
                            >
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              WhatsApp
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              onClick={() => handleUnlockProfile(applicant.jobSeeker.id)}
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Unlock (1 Credit)
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
