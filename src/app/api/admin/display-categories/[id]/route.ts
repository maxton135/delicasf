import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { displayCategories, menuItemDisplayCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

export const PUT = withAdminAuth(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  try {
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, displayOrder, isActive } = body;

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

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name conflicts with other categories
    const nameConflict = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.name, name.trim()))
      .limit(1);

    if (nameConflict.length > 0 && nameConflict[0].id !== categoryId) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const updateData = {
      name: name.trim(),
      description: description?.trim() || null,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : existingCategory[0].displayOrder,
      isActive: typeof isActive === 'boolean' ? isActive : existingCategory[0].isActive,
      updatedAt: new Date().toISOString(),
    };

    const [updatedCategory] = await db
      .update(displayCategories)
      .set(updateData)
      .where(eq(displayCategories.id, categoryId))
      .returning();

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating display category:', error);
    return NextResponse.json(
      { error: 'Failed to update display category' },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  try {
    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has assigned items
    const assignedItems = await db
      .select()
      .from(menuItemDisplayCategories)
      .where(eq(menuItemDisplayCategories.displayCategoryId, categoryId))
      .limit(1);

    if (assignedItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with assigned items. Please remove all items first.' },
        { status: 400 }
      );
    }

    await db
      .delete(displayCategories)
      .where(eq(displayCategories.id, categoryId));

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting display category:', error);
    return NextResponse.json(
      { error: 'Failed to delete display category' },
      { status: 500 }
    );
  }
});