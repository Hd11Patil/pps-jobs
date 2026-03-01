import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Type parameter is required" },
        { status: 400 }
      );
    }

    let csv = "";
    let filename = "";

    if (type === "employers") {
      // Export employers
      const employers = await db.employer.findMany({
        include: {
          user: {
            select: {
              email: true,
              mobile: true,
              createdAt: true,
            },
          },
          credit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      filename = "employers-export.csv";
      csv = "Company Name,Location,Email,Mobile,Employee Count,Credits,Registration Date\n";
      csv += employers.map((e) => {
        const registrationDate = e.user.createdAt ? new Date(e.user.createdAt).toLocaleDateString() : "N/A";
        const credits = e.credit?.balance || 0;
        return `"${e.companyName}","${e.companyLocation}","${e.user.email || "N/A"}","${e.user.mobile}","${e.employeeCount || "N/A"}","${credits}","${registrationDate}"`;
      }).join("\n");
    } else if (type === "jobseekers") {
      // Export job seekers
      const jobSeekers = await db.jobSeeker.findMany({
        include: {
          user: {
            select: {
              email: true,
              mobile: true,
              createdAt: true,
            },
          },
          experiences: true,
          skills: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      filename = "jobseekers-export.csv";
      csv = "Full Name,Email,Mobile,Current Location,Preferred Location,Employment Type,Profile Completion,Registration Date\n";
      csv += jobSeekers.map((js) => {
        const registrationDate = js.user.createdAt ? new Date(js.user.createdAt).toLocaleDateString() : "N/A";
        const skills = js.skills.map((s) => s.name).join("; ");
        const experienceCount = js.experiences.length;
        return `"${js.fullName}","${js.email || "N/A"}","${js.mobile}","${js.currentLocation}","${js.preferredLocation || "N/A"}","${js.employmentType}","${js.profileCompletion}%","${registrationDate}"`;
      }).join("\n");
    } else if (type === "jobs") {
      // Export jobs
      const jobs = await db.job.findMany({
        include: {
          employer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      filename = "jobs-export.csv";
      csv = "Job Title,Company,Location,Salary,Experience Required,Status,Posted Date\n";
      csv += jobs.map((job) => {
        const postedDate = new Date(job.createdAt).toLocaleDateString();
        const status = job.isActive ? "Active" : "Inactive";
        return `"${job.title}","${job.employer.companyName}","${job.location}","${job.salary || "N/A"}","${job.experienceRequired || "N/A"}","${status}","${postedDate}"`;
      }).join("\n");
    } else if (type === "credits") {
      // Export credit transactions
      const transactions = await db.creditTransaction.findMany({
        include: {
          employer: {
            select: {
              companyName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      filename = "credit-usage-export.csv";
      csv = "Company,Transaction Type,Amount,Description,Date\n";
      csv += transactions.map((t) => {
        const date = new Date(t.createdAt).toLocaleDateString();
        return `"${t.employer.companyName}","${t.type}","${t.amount}","${t.description || "N/A"}","${date}"`;
      }).join("\n");
    } else {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    // Return CSV as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
