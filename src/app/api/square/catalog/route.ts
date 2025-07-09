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

const categoryToIdMapping = {
  "Deli": "HQ6IE4GLIF57OJEE4OQCELM5",
  "Sushi": "FKZBKY23IQZHT7LCD4HZL7SD",
  "Salads": "ZO5JJUKO2LOG7OHTPFKTZ442",
  "Soups": "F6GVCTDXOAOF4TUNGBWYAPFY",
  "Combos": "AB4PUQ5RJEEEZHC3B7GTTJKK"
}

export async function GET(categoryId: string) {
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

    const response = await client.catalog.searchItems({
      categoryIds: Object.values(categoryToIdMapping),
    });

    // Convert the response to a plain object that can be serialized
    const jsonResponse = convertToPlainObject(response);

    // Create an object to store items by category
    const itemsByCategory: { [key: string]: any[] } = {};

    // Initialize empty arrays for each category
    Object.keys(categoryToIdMapping).forEach(category => {
      itemsByCategory[category] = [];
    });

    // Organize items by category
    if (jsonResponse.items) {
      jsonResponse.items.forEach((item: any) => {
        const itemCategories = item.itemData.categories;
        itemCategories.forEach((category: { id: string }) => {
          const categoryId = category.id;
          if (Object.values(categoryToIdMapping).includes(categoryId)) {
            const categoryName = Object.keys(categoryToIdMapping).find(
              key => categoryToIdMapping[key as keyof typeof categoryToIdMapping] === categoryId
            );
            if (categoryName) {
              itemsByCategory[categoryName].push(item);
            }
          }
        });
      });
    }

    console.log('Items organized by category:', itemsByCategory);

    return NextResponse.json(itemsByCategory);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
} 