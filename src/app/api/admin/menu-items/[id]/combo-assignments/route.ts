import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '@/db/connection';
import { 
  comboMenuItems, 
  menuItems, 
  comboCategories,
  type InsertComboMenuItem 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const db = getDatabase();

export const GET = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await context?.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItemId = parseInt(resolvedParams.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    // Get combo categories assigned to this menu item
    const assignedCategories = await db
      .select({
        id: comboCategories.id,
        name: comboCategories.name,
        description: comboCategories.description,
        isRequired: comboMenuItems.isRequired,
        displayOrder: comboMenuItems.displayOrder,
        assignmentId: comboMenuItems.id,
      })
      .from(comboMenuItems)
      .innerJoin(comboCategories, eq(comboMenuItems.comboCategoryId, comboCategories.id))
      .where(eq(comboMenuItems.menuItemId, menuItemId))
      .orderBy(comboMenuItems.displayOrder, comboCategories.name);

    return NextResponse.json({
      comboCategories: assignedCategories,
      totalCount: assignedCategories.length,
    });
  } catch (error) {
    console.error('Error fetching menu item combo assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item combo assignments' },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await context?.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItemId = parseInt(resolvedParams.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { comboCategoryId, isRequired = true, displayOrder = 0 } = body;

    if (!comboCategoryId || typeof comboCategoryId !== 'number') {
      return NextResponse.json(
        { error: 'Combo category ID is required' },
        { status: 400 }
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

    // Check if combo category exists
    const category = await db
      .select()
      .from(comboCategories)
      .where(eq(comboCategories.id, comboCategoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: 'Combo category not found' },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await db
      .select()
      .from(comboMenuItems)
      .where(
        and(
          eq(comboMenuItems.menuItemId, menuItemId),
          eq(comboMenuItems.comboCategoryId, comboCategoryId)
        )
      )
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: 'Combo category is already assigned to this menu item' },
        { status: 400 }
      );
    }

    const assignmentData: InsertComboMenuItem = {
      menuItemId,
      comboCategoryId,
      isRequired: typeof isRequired === 'boolean' ? isRequired : true,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
    };

    const [newAssignment] = await db
      .insert(comboMenuItems)
      .values(assignmentData)
      .returning();

    return NextResponse.json({
      success: true,
      assignment: newAssignment,
    });
  } catch (error) {
    console.error('Error assigning combo category to menu item:', error);
    return NextResponse.json(
      { error: 'Failed to assign combo category to menu item' },
      { status: 500 }
    );
  }
});

export const DELETE = withAdminAuth(async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await context?.params;
    if (!resolvedParams?.id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const menuItemId = parseInt(resolvedParams.id);
    if (isNaN(menuItemId)) {
      return NextResponse.json(
        { error: 'Invalid menu item ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const comboCategoryId = searchParams.get('comboCategoryId');

    if (!comboCategoryId) {
      return NextResponse.json(
        { error: 'Combo category ID is required' },
        { status: 400 }
      );
    }

    const comboCategoryIdInt = parseInt(comboCategoryId);
    if (isNaN(comboCategoryIdInt)) {
      return NextResponse.json(
        { error: 'Invalid combo category ID' },
        { status: 400 }
      );
    }

    // Check if assignment exists
    const existingAssignment = await db
      .select()
      .from(comboMenuItems)
      .where(
        and(
          eq(comboMenuItems.menuItemId, menuItemId),
          eq(comboMenuItems.comboCategoryId, comboCategoryIdInt)
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
      .delete(comboMenuItems)
      .where(
        and(
          eq(comboMenuItems.menuItemId, menuItemId),
          eq(comboMenuItems.comboCategoryId, comboCategoryIdInt)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Combo category removed from menu item successfully',
    });
  } catch (error) {
    console.error('Error removing combo category from menu item:', error);
    return NextResponse.json(
      { error: 'Failed to remove combo category from menu item' },
      { status: 500 }
    );
  }
});