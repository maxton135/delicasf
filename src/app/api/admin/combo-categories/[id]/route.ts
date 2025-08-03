import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { comboCategories, menuItemComboCategories, comboMenuItems, type InsertComboCategory } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

export const PUT = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await context?.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryId = parseInt(resolvedParams.id);
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
      .from(comboCategories)
      .where(eq(comboCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if name already exists (excluding current category)
    const duplicateCategory = await db
      .select()
      .from(comboCategories)
      .where(eq(comboCategories.name, name))
      .limit(1);

    if (duplicateCategory.length > 0 && duplicateCategory[0].id !== categoryId) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }

    const categoryData: Partial<InsertComboCategory> = {
      name: name.trim(),
      description: description?.trim() || null,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      updatedAt: new Date().toISOString(),
    };

    const [updatedCategory] = await db
      .update(comboCategories)
      .set(categoryData)
      .where(eq(comboCategories.id, categoryId))
      .returning();

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating combo category:', error);
    return NextResponse.json(
      { error: 'Failed to update combo category' },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await context?.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryId = parseInt(resolvedParams.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(comboCategories)
      .where(eq(comboCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category is being used by any menu items
    const menuItemAssignments = await db
      .select()
      .from(menuItemComboCategories)
      .where(eq(menuItemComboCategories.comboCategoryId, categoryId))
      .limit(1);

    const comboAssignments = await db
      .select()
      .from(comboMenuItems)
      .where(eq(comboMenuItems.comboCategoryId, categoryId))
      .limit(1);

    if (menuItemAssignments.length > 0 || comboAssignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is assigned to menu items or combos' },
        { status: 400 }
      );
    }

    await db
      .delete(comboCategories)
      .where(eq(comboCategories.id, categoryId));

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting combo category:', error);
    return NextResponse.json(
      { error: 'Failed to delete combo category' },
      { status: 500 }
    );
  }
});