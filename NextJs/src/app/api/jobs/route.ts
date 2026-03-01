import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword")?.toLowerCase() || "";
    const location = searchParams.get("location")?.toLowerCase() || "";

    // Build where clause for search
    const where: any = {
      isActive: true,
    };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { requirements: { contains: keyword } },
        { employer: { companyName: { contains: keyword } } },
      ];
    }

    if (location) {
      where.location = {
        contains: location,
      };
    }

    const jobs = await db.job.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employer: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
