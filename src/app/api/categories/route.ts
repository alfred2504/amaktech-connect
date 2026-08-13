import { NextResponse } from "next/server";
import { getCategories } from "@/features/categories/actions/get-categories";
import { createCategory } from "@/features/categories/actions/create-category";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const categories = await getCategories({
      search: search || undefined,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createCategory(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      result.category,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    if (
      error instanceof Error &&
      error.message.includes("FORBIDDEN")
    ) {
      return NextResponse.json(
        { error: "You don't have permission to create categories" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
