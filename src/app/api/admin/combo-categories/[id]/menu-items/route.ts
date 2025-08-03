import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { 
  menuItemComboCategories, 
  menuItems, 
  comboCategories,
  type InsertMenuItemComboCategory 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const db = getDatabase();

export const GET = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
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

    // Get menu items assigned to this combo category
    const assignedItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        isActive: menuItems.isActive,
        isSoldOut: menuItems.isSoldOut,
        assignmentId: menuItemComboCategories.id,
      })
      .from(menuItemComboCategories)
      .innerJoin(menuItems, eq(menuItemComboCategories.menuItemId, menuItems.id))
      .where(eq(menuItemComboCategories.comboCategoryId, categoryId))
      .orderBy(menuItems.name);

    return NextResponse.json({
      menuItems: assignedItems,
      totalCount: assignedItems.length,
    });
  } catch (error) {
    console.error('Error fetching combo category menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch combo category menu items' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
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
    const { menuItemId } = body;

    if (!menuItemId || typeof menuItemId !== 'number') {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    // Check if combo category exists
    const category = await db
      .select()
      .from(comboCategories)
      .where(eq(comboCategories.id, categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: 'Combo category not found' },
        { status: 404 }
      );
    }

    // Check if menu item exists
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

    // Check if assignment already exists
    const existingAssignment = await db
      .select()
      .from(menuItemComboCategories)
      .where(
        and(
          eq(menuItemComboCategories.menuItemId, menuItemId),
          eq(menuItemComboCategories.comboCategoryId, categoryId)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: 'Menu item is already assigned to this combo category' },
        { status: 400 }
      );
    }

    const assignmentData: InsertMenuItemComboCategory = {
      menuItemId,
      comboCategoryId: categoryId,
    };

    const [newAssignment] = await db
      .insert(menuItemComboCategories)
      .values(assignmentData)
      .returning();

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
    });
  } catch (error) {
    console.error('Error assigning menu item to combo category:', error);
    return NextResponse.json(
      { error: 'Failed to assign menu item to combo category' },
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

    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');

    if (!menuItemId) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItemIdInt = parseInt(menuItemId);
    if (isNaN(menuItemIdInt)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await db
      .select()
      .from(menuItemComboCategories)
      .where(
        and(
          eq(menuItemComboCategories.menuItemId, menuItemIdInt),
          eq(menuItemComboCategories.comboCategoryId, categoryId)
        )
      )
      .limit(1);

    if (existingAssignment.length === 0) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    await db
      .delete(menuItemComboCategories)
      .where(
        and(
          eq(menuItemComboCategories.menuItemId, menuItemIdInt),
          eq(menuItemComboCategories.comboCategoryId, categoryId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Menu item removed from combo category successfully',
    });
  } catch (error) {
    console.error('Error removing menu item from combo category:', error);
    return NextResponse.json(
      { error: 'Failed to remove menu item from combo category' },
      { status: 500 }
    );
  }
});