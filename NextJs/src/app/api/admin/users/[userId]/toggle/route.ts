import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deactivating admin
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot deactivate admin account" },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
