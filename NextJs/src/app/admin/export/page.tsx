"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Briefcase,
  ArrowLeft,
  Download,
  Upload,
  Users,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminExportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
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

  const handleExport = async (type: "employers" | "jobseekers" | "jobs" | "credits") => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/export?type=${type}`);

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `${type} data exported successfully`,
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      const fileName = file.name.toLowerCase();
      const validExtension = fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      
      if (!validExtension) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import data");
      }

      setImportResult(data);
      toast({
        title: "Import Completed",
        description: data.details,
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

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
                <p className="text-sm text-gray-600">Admin - Import & Export</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Import & Export</h2>

        {/* Export Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 py-6 h-full"
                onClick={() => handleExport("employers")}
                disabled={loading}
              >
                <Building2 className="w-8 h-8 text-green-600" />
                <span className="font-semibold">Export Employers</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 py-6 h-full"
                onClick={() => handleExport("jobseekers")}
                disabled={loading}
              >
                <Users className="w-8 h-8 text-green-600" />
                <span className="font-semibold">Export Job Seekers</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 py-6 h-full"
                onClick={() => handleExport("jobs")}
                disabled={loading}
              >
                <Briefcase className="w-8 h-8 text-green-600" />
                <span className="font-semibold">Export Jobs</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 py-6 h-full"
                onClick={() => handleExport("credits")}
                disabled={loading}
              >
                <Upload className="w-8 h-8 text-green-600" />
                <span className="font-semibold">Export Credit Usage</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Job Seekers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Supported file formats:</strong> CSV, Excel (.xlsx, .xls)<br/>
                <strong>Required columns:</strong> Name, Contact No, Email ID (optional)<br/>
                <strong>Optional columns for experienced candidates:</strong> Company Name, Last Designation, Last Salary
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <FileText className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400">CSV or Excel files only</p>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setImportResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Job Seekers
                </>
              )}
            </Button>

            {importResult && (
              <Alert className={importResult.failed > 0 ? "border-orange-500" : "border-green-500"}>
                {importResult.failed > 0 ? (
                  <XCircle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{importResult.details}</p>
                    <div className="text-sm">
                      <span className="text-green-600">✓ {importResult.imported} new users imported</span><br/>
                      <span className="text-blue-600">✓ {importResult.updated} users updated</span>
                      {importResult.failed > 0 && (
                        <span className="text-orange-600"><br/>✗ {importResult.failed} failed</span>
                      )}
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600">View errors</summary>
                        <ul className="mt-2 text-xs text-red-600 space-y-1">
                          {importResult.errors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
