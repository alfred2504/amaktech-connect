import { NextResponse } from "next/server";
import { getCategoryById } from "@/features/categories/actions/get-categories";
import { updateCategory } from "@/features/categories/actions/update-category";
import { deleteCategory } from "@/features/categories/actions/delete-category";

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await updateCategory(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.category);
  } catch (error) {
    console.error("PATCH /api/categories/[id] error:", error);
    if (
      error instanceof Error &&
      error.message.includes("FORBIDDEN")
    ) {
      return NextResponse.json(
        { error: "You don't have permission to update categories" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;
    const result = await deleteCategory(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    if (
      error instanceof Error &&
      error.message.includes("FORBIDDEN")
    ) {
      return NextResponse.json(
        { error: "You don't have permission to delete categories" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
