"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  ArrowLeft,
  Plus,
  Minus,
  Wallet,
  RefreshCw,
  Calendar,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployerCredit {
  id: string;
  employerId: string;
  companyName: string;
  companyLocation: string;
  balance: number;
  expiryDate: string | null;
  isFreeCreditsUsed: boolean;
}

export default function AdminCreditsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [credits, setCredits] = useState<EmployerCredit[]>([]);
  const [formData, setFormData] = useState({
    employerId: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    checkAuth();
    fetchCredits();
  }, []);

  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/auth/login");
    }
  };

  const fetchCredits = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/credits");

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || []);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "Failed to load credit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredit = async (employerId: string, amount: number, description?: string) => {
    if (!confirm(`Add ${amount} credits to this employer?`)) return;

    setUpdating(`add-${employerId}`);

    try {
      const response = await fetch("/api/admin/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerId,
          amount,
          type: "add",
          description: description || "Manual credit addition by admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add credits");
      }

      toast({
        title: "Success",
        description: "Credits added successfully",
      });

      fetchCredits();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add credits",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDeductCredit = async (employerId: string, amount: number) => {
    if (!confirm(`Deduct ${amount} credits from this employer?`)) return;

    setUpdating(`deduct-${employerId}`);

    try {
      const response = await fetch("/api/admin/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerId,
          amount,
          type: "deduct",
          description: "Manual credit deduction by admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to deduct credits");
      }

      toast({
        title: "Success",
        description: "Credits deducted successfully",
      });

      fetchCredits();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to deduct credits",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleQuickAdd = () => {
    if (!formData.employerId || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please select an employer and enter amount",
        variant: "destructive",
      });
      return;
    }

    handleAddCredit(formData.employerId, parseInt(formData.amount), formData.description);
    setFormData({ employerId: "", amount: "", description: "" });
  };

  const isExpiring = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
                <p className="text-sm text-gray-600">Admin - Credit Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard">
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
        {/* Quick Add Credits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Add Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="employerSelect">Select Employer</Label>
                <select
                  id="employerSelect"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.employerId}
                  onChange={(e) => setFormData({ ...formData, employerId: e.target.value })}
                >
                  <option value="">Select an employer...</option>
                  {credits.map((credit) => (
                    <option key={credit.employerId} value={credit.employerId}>
                      {credit.companyName} ({credit.companyLocation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-64">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Number of credits"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Reason for adding credits"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleQuickAdd}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={!formData.employerId || !formData.amount}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employer Credit Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No employers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    credits.map((credit) => (
                      <TableRow key={credit.id}>
                        <TableCell className="font-medium">{credit.companyName}</TableCell>
                        <TableCell>{credit.companyLocation}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-600" />
                            <span className="text-2xl font-bold text-green-600">{credit.balance}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {credit.expiryDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span>
                                {new Date(credit.expiryDate).toLocaleDateString()}
                              </span>
                              {isExpiring(credit.expiryDate) && (
                                <Badge variant="destructive" className="ml-2">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddCredit(credit.employerId, 10)}
                              disabled={updating === `add-${credit.employerId}`}
                            >
                              {updating === `add-${credit.employerId}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              Add 10
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeductCredit(credit.employerId, 10)}
                              disabled={updating === `deduct-${credit.employerId}`}
                            >
                              {updating === `deduct-${credit.employerId}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              Deduct 10
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
