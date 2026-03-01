import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ImportedJobSeeker {
  name: string;
  contactNo: string;
  emailId?: string;
  companyName?: string;
  lastDesignation?: string;
  lastSalary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { error: "Only CSV and Excel files are supported" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim() !== "");

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "File is empty or only contains headers" },
        { status: 400 }
      );
    }

    // Parse headers from first line
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s/g, ""));

    // Helper function to get column value by various possible header names
    const getColumnValue = (row: string[], possibleNames: string[]): string => {
      for (const name of possibleNames) {
        const index = headers.indexOf(name);
        if (index !== -1 && row[index]) {
          return row[index].trim();
        }
      }
      return "";
    };

    let imported = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const columns = lines[i].split(",").map(col => col.trim());

        if (columns.length === 0 || (columns.length === 1 && columns[0] === "")) {
          continue;
        }

        // Extract values with flexible header matching
        const data: ImportedJobSeeker = {
          name: getColumnValue(columns, ["name", "fullname", "fullname", "name"]),
          contactNo: getColumnValue(columns, ["contactno", "contact", "phone", "mobile", "mobileno", "phoneno"]),
          emailId: getColumnValue(columns, ["emailid", "email", "emailaddress", "emailid"]),
          companyName: getColumnValue(columns, ["companyname", "company", "lastcompany", "employer"]),
          lastDesignation: getColumnValue(columns, ["lastdesignation", "designation", "jobtitle", "position"]),
          lastSalary: getColumnValue(columns, ["lastsalary", "salary", "currentsalary"]),
        };

        // Validate required fields
        if (!data.name || !data.contactNo) {
          failed++;
          errors.push(`Row ${i + 1}: Missing name or contact number`);
          continue;
        }

        // Check if user already exists by mobile
        const existingUser = await db.user.findFirst({
          where: { mobile: data.contactNo },
          include: { jobSeeker: true },
        });

        if (existingUser) {
          // Update existing job seeker
          if (existingUser.jobSeeker) {
            await db.jobSeeker.update({
              where: { id: existingUser.jobSeeker.id },
              data: {
                fullName: data.name,
                email: data.emailId || existingUser.jobSeeker.email,
              },
            });

            // Add experience if company name is provided
            if (data.companyName) {
              await db.experience.create({
                data: {
                  jobSeekerId: existingUser.jobSeeker.id,
                  companyName: data.companyName,
                  designation: data.lastDesignation || "Not Specified",
                  lastSalary: data.lastSalary || null,
                  currentlyWorking: false,
                },
              });
            }

            updated++;
          } else {
            failed++;
            errors.push(`Row ${i + 1}: User exists but is not a job seeker`);
          }
        } else {
          // Create new user and job seeker
          const newUser = await db.user.create({
            data: {
              mobile: data.contactNo,
              email: data.emailId || null,
              password: "123456", // Default password
              role: "jobseeker",
              isActive: true,
            },
          });

          const newJobSeeker = await db.jobSeeker.create({
            data: {
              userId: newUser.id,
              fullName: data.name,
              email: data.emailId || null,
              mobile: data.contactNo,
              currentLocation: "Not Specified",
              employmentType: data.companyName ? "experienced" : "fresher",
              profileCompletion: data.companyName ? 40 : 20,
            },
          });

          // Add experience if company name is provided
          if (data.companyName) {
            await db.experience.create({
              data: {
                jobSeekerId: newJobSeeker.id,
                companyName: data.companyName,
                designation: data.lastDesignation || "Not Specified",
                lastSalary: data.lastSalary || null,
                currentlyWorking: false,
              },
            });
          }

          imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        failed++;
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors only
      details: `${imported} new users imported, ${updated} users updated, ${failed} failed`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
