import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { menuItemDisplayCategories, displayCategories, menuItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const db = getDatabase();

export const GET = withAdminAuth(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  try {
    const menuItemId = parseInt(params.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    // Get assigned display categories for this menu item
    const assignedCategories = await db
      .select({
        id: displayCategories.id,
        name: displayCategories.name,
        description: displayCategories.description,
        displayOrder: displayCategories.displayOrder,
        isActive: displayCategories.isActive,
      })
      .from(menuItemDisplayCategories)
      .innerJoin(displayCategories, eq(menuItemDisplayCategories.displayCategoryId, displayCategories.id))
      .where(eq(menuItemDisplayCategories.menuItemId, menuItemId))
      .orderBy(displayCategories.displayOrder, displayCategories.name);

    return NextResponse.json({
      menuItemId,
      assignedCategories,
    });
  } catch (error) {
    console.error('Error fetching menu item display categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item display categories' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  try {
    const menuItemId = parseInt(params.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { displayCategoryId } = body;

    if (!displayCategoryId || typeof displayCategoryId !== 'number') {
      return NextResponse.json(
        { error: 'Display category ID is required' },
        { status: 400 }
      );
    }

    // Verify menu item exists
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, menuItemId))
      .limit(1);

    if (menuItem.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Verify display category exists
    const displayCategory = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.id, displayCategoryId))
      .limit(1);

    if (displayCategory.length === 0) {
      return NextResponse.json(
        { error: 'Display category not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await db
      .select()
      .from(menuItemDisplayCategories)
      .where(
        and(
          eq(menuItemDisplayCategories.menuItemId, menuItemId),
          eq(menuItemDisplayCategories.displayCategoryId, displayCategoryId)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: 'Menu item is already assigned to this category' },
        { status: 400 }
      );
    }

    // Create the assignment
    const [newAssignment] = await db
      .insert(menuItemDisplayCategories)
      .values({
        menuItemId,
        displayCategoryId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
    });
  } catch (error) {
    console.error('Error assigning menu item to display category:', error);
    return NextResponse.json(
      { error: 'Failed to assign menu item to display category' },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  try {
    const menuItemId = parseInt(params.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const displayCategoryId = searchParams.get('displayCategoryId');

    if (!displayCategoryId || isNaN(parseInt(displayCategoryId))) {
      return NextResponse.json(
        { error: 'Display category ID is required' },
        { status: 400 }
      );
    }

    const categoryId = parseInt(displayCategoryId);

    // Find and delete the assignment
    const deletedAssignment = await db
      .delete(menuItemDisplayCategories)
      .where(
        and(
          eq(menuItemDisplayCategories.menuItemId, menuItemId),
          eq(menuItemDisplayCategories.displayCategoryId, categoryId)
        )
      )
      .returning();

    if (deletedAssignment.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu item removed from display category',
    });
  } catch (error) {
    console.error('Error removing menu item from display category:', error);
    return NextResponse.json(
      { error: 'Failed to remove menu item from display category' },
      { status: 500 }
    );
  }
});