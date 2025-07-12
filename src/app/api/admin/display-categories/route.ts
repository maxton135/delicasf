import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { displayCategories, type InsertDisplayCategory } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

export const GET = withAdminAuth(async () => {
  try {
    const categories = await db
      .select()
      .from(displayCategories)
      .orderBy(displayCategories.displayOrder, displayCategories.name);

    return NextResponse.json({
      displayCategories: categories,
      totalCount: categories.length,
    });
  } catch (error) {
    console.error('Error fetching display categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch display categories' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, displayOrder } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Category name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingCategory = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.name, name))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const categoryData: InsertDisplayCategory = {
      name: name.trim(),
      description: description?.trim() || null,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: true,
    };

    const [newCategory] = await db
      .insert(displayCategories)
      .values(categoryData)
      .returning();

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error('Error creating display category:', error);
    return NextResponse.json(
      { error: 'Failed to create display category' },
      { status: 500 }
    );
  }
});