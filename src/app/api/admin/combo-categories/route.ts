import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { comboCategories, type InsertComboCategory } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

export const GET = withAdminAuth(async () => {
  try {
    const categories = await db
      .select()
      .from(comboCategories)
      .orderBy(comboCategories.displayOrder, comboCategories.name);

    return NextResponse.json({
      comboCategories: categories,
      totalCount: categories.length,
    });
  } catch (error) {
    console.error('Error fetching combo categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch combo categories' },
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
      .from(comboCategories)
      .where(eq(comboCategories.name, name))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const categoryData: InsertComboCategory = {
      name: name.trim(),
      description: description?.trim() || null,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: true,
    };

    const [newCategory] = await db
      .insert(comboCategories)
      .values(categoryData)
      .returning();

    return NextResponse.json({
      success: true,
      category: newCategory,
    });
  } catch (error) {
    console.error('Error creating combo category:', error);
    return NextResponse.json(
      { error: 'Failed to create combo category' },
      { status: 500 }
    );
  }
});