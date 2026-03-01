"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ArrowLeft, Plus, Trash2, Loader2, Calendar, CheckCircle2, Badge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  id?: string;
  companyName: string;
  designation: string;
  lastSalary: string;
  dateOfJoining: string;
  lastWorkingDate: string;
  currentlyWorking: boolean;
}

export default function JobSeekerExperiencePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Experience>({
    companyName: "",
    designation: "",
    lastSalary: "",
    dateOfJoining: "",
    lastWorkingDate: "",
    currentlyWorking: false,
  });

  useEffect(() => {
    checkAuth();
    fetchExperiences();
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

  const fetchExperiences = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/jobseeker/experience", {
        headers: {
          authorization: user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExperiences(data.experiences || []);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast({
        title: "Error",
        description: "Failed to load experiences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateExperience = (exp: Experience): boolean => {
    if (!exp.companyName || !exp.designation || !exp.dateOfJoining) {
      toast({
        title: "Validation Error",
        description: "Company Name, Designation, and Date of Joining are required",
        variant: "destructive",
      });
      return false;
    }

    if (!exp.currentlyWorking && !exp.lastWorkingDate) {
      toast({
        title: "Validation Error",
        description: "Last Working Date is required when not currently working",
        variant: "destructive",
      });
      return false;
    }

    if (experiences.length >= 5 && !newExperience.id) {
      toast({
        title: "Limit Reached",
        description: "Maximum 5 experience entries allowed",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddExperience = async () => {
    if (!validateExperience(newExperience)) return;

    setSaving(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch("/api/jobseeker/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: user.id,
        },
        body: JSON.stringify(newExperience),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add experience");
      }

      toast({
        title: "Success",
        description: "Experience added successfully",
      });

      // Reset form and fetch updated list
      setNewExperience({
        companyName: "",
        designation: "",
        lastSalary: "",
        dateOfJoining: "",
        lastWorkingDate: "",
        currentlyWorking: false,
      });

      fetchExperiences();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add experience",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (expId: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/jobseeker/experience/${expId}`, {
        method: "DELETE",
        headers: {
          authorization: user.id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }

      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });

      fetchExperiences();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    }
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
                <p className="text-sm text-gray-600">Manage Experience</p>
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add Experience Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Experience</CardTitle>
            <CardDescription>
              Add your work experience to improve your profile (Max 5 entries)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., ABC Corp"
                  value={newExperience.companyName}
                  onChange={(e) => setNewExperience({ ...newExperience, companyName: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  placeholder="e.g., Software Engineer"
                  value={newExperience.designation}
                  onChange={(e) => setNewExperience({ ...newExperience, designation: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastSalary">Last Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                  <Input
                    id="lastSalary"
                    placeholder="e.g., 8 LPA"
                    value={newExperience.lastSalary}
                    onChange={(e) => setNewExperience({ ...newExperience, lastSalary: e.target.value })}
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={newExperience.dateOfJoining}
                    onChange={(e) => setNewExperience({ ...newExperience, dateOfJoining: e.target.value })}
                    className="pl-10"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastWorkingDate">Last Working Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="lastWorkingDate"
                    type="date"
                    value={newExperience.lastWorkingDate}
                    onChange={(e) => setNewExperience({ ...newExperience, lastWorkingDate: e.target.value })}
                    className="pl-10"
                    disabled={saving || newExperience.currentlyWorking}
                  />
                </div>
              </div>

              <div className="flex items-center space-y-2 pt-6">
                <Checkbox
                  id="currentlyWorking"
                  checked={newExperience.currentlyWorking}
                  onCheckedChange={(checked) => setNewExperience({ ...newExperience, currentlyWorking: checked })}
                  disabled={saving}
                />
                <Label htmlFor="currentlyWorking" className="cursor-pointer">
                  Currently Working Here
                </Label>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleAddExperience}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Experience List */}
        <Card>
          <CardHeader>
            <CardTitle>Work Experience ({experiences.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            {experiences.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No experience added yet
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{exp.designation}</h3>
                        {exp.currentlyWorking && (
                          <Badge className="bg-green-100 text-green-700">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-1">{exp.companyName}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>Joined: {new Date(exp.dateOfJoining).toLocaleDateString()}</div>
                        {exp.lastSalary && <div>Salary: ₹{exp.lastSalary}</div>}
                        {exp.lastWorkingDate && (
                          <div>Until: {new Date(exp.lastWorkingDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExperience(exp.id!)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
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
