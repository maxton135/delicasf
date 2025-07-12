import { SquareClient, SquareEnvironment } from "square";
import { NextResponse } from 'next/server';

// Helper function to convert Square response to plain object
function convertToPlainObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle BigInt
  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(convertToPlainObject);
  }

  // Handle objects
  if (typeof obj === 'object') {
    const plainObj: any = {};
    for (const key in obj) {
      plainObj[key] = convertToPlainObject(obj[key]);
    }
    return plainObj;
  }

  // Return primitives as is
  return obj;
}

export async function GET() {
  try {
    // Get environment variables with validation
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    
    if (!accessToken) {
      console.error('SQUARE_ACCESS_TOKEN environment variable is required');
      return NextResponse.json(
        { error: 'Square API configuration missing' },
        { status: 500 }
      );
    }
    
    const client = new SquareClient({
      environment: environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      token: accessToken,
    });

    // Fetch all catalog items without category filtering
    const response = await client.catalog.searchItems({
      limit: 100,
      sortOrder: 'ASC'
    });

    // Convert the response to a plain object that can be serialized
    const jsonResponse = convertToPlainObject(response);

    // Create an object to store items by category
    const itemsByCategory: { [key: string]: any[] } = {};

    // Organize items by category (using category names from itemData if available)
    if (jsonResponse.items) {
      jsonResponse.items.forEach((item: any) => {
        if (item.itemData && item.itemData.categories && item.itemData.categories.length > 0) {
          // Item has categories - use the category ID as the category name for now
          // TODO: In a future update, we can enhance this to fetch actual category names
          item.itemData.categories.forEach((category: { id: string }) => {
            const categoryName = `Category ${category.id}`;
            if (!itemsByCategory[categoryName]) {
              itemsByCategory[categoryName] = [];
            }
            itemsByCategory[categoryName].push(item);
          });
        } else {
          // Item has no categories
          if (!itemsByCategory['Uncategorized']) {
            itemsByCategory['Uncategorized'] = [];
          }
          itemsByCategory['Uncategorized'].push(item);
        }
      });
    }

    console.log('All items organized by category:', itemsByCategory);
    console.log('Total categories found:', Object.keys(itemsByCategory).length);

    return NextResponse.json(itemsByCategory);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
} 