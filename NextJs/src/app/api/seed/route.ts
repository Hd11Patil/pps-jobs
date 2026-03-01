import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
        admin: {
          email: existingAdmin.email,
          mobile: existingAdmin.mobile,
        },
      });
    }

    // Create default admin user
    const admin = await db.user.create({
      data: {
        email: "admin@ppsjobs.com",
        mobile: "9277492395",
        password: "9277492395",
        role: "admin",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Default admin user created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
      },
      credentials: {
        email: "admin@ppsjobs.com",
        password: "9277492395",
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
