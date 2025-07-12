import { NextResponse } from 'next/server';
import { getDatabase } from '@/db/connection';
import { displayCategories, menuItemDisplayCategories, menuItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const db = getDatabase();

export async function GET() {
  try {
    // Get all display categories
    const categories = await db
      .select()
      .from(displayCategories)
      .orderBy(displayCategories.displayOrder, displayCategories.name);

    // Get all menu items
    const items = await db
      .select()
      .from(menuItems)
      .orderBy(menuItems.name);

    // Get all category assignments
    const assignments = await db
      .select({
        assignmentId: menuItemDisplayCategories.id,
        menuItemId: menuItemDisplayCategories.menuItemId,
        displayCategoryId: menuItemDisplayCategories.displayCategoryId,
        menuItemName: menuItems.name,
        menuItemSquareId: menuItems.squareId,
        menuItemIsActive: menuItems.isActive,
        menuItemIsSoldOut: menuItems.isSoldOut,
        categoryName: displayCategories.name,
        categoryIsActive: displayCategories.isActive,
      })
      .from(menuItemDisplayCategories)
      .innerJoin(menuItems, eq(menuItemDisplayCategories.menuItemId, menuItems.id))
      .innerJoin(displayCategories, eq(menuItemDisplayCategories.displayCategoryId, displayCategories.id))
      .orderBy(displayCategories.name, menuItems.name);

    // Count items per category
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await db
          .select()
          .from(menuItemDisplayCategories)
          .innerJoin(menuItems, eq(menuItemDisplayCategories.menuItemId, menuItems.id))
          .where(eq(menuItemDisplayCategories.displayCategoryId, category.id));

        const activeItemCount = await db
          .select()
          .from(menuItemDisplayCategories)
          .innerJoin(menuItems, eq(menuItemDisplayCategories.menuItemId, menuItems.id))
          .where(and(
            eq(menuItemDisplayCategories.displayCategoryId, category.id),
            eq(menuItems.isActive, true),
            eq(menuItems.isSoldOut, false)
          ));

        return {
          ...category,
          totalItems: itemCount.length,
          activeItems: activeItemCount.length,
        };
      })
    );

    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.isActive).length,
        totalMenuItems: items.length,
        activeMenuItems: items.filter(i => i.isActive && !i.isSoldOut).length,
        totalAssignments: assignments.length,
      },
      displayCategories: categoryStats,
      menuItems: items.map(item => ({
        id: item.id,
        name: item.name,
        squareId: item.squareId,
        isActive: item.isActive,
        isSoldOut: item.isSoldOut,
        assignedCategories: assignments
          .filter(a => a.menuItemId === item.id)
          .map(a => ({
            categoryId: a.displayCategoryId,
            categoryName: a.categoryName,
            categoryIsActive: a.categoryIsActive,
          })),
      })),
      categoryAssignments: assignments,
    });
  } catch (error) {
    console.error('Error in debug menu endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch debug data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}