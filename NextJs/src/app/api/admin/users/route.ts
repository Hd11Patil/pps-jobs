import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const users = await db.user.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        employer: {
          select: {
            companyName: true,
          },
        },
        jobSeeker: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
