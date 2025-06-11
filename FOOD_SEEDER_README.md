# 🌱 Food Database Seeder - NutriFlow Pro

This seed script will populate your Supabase database with over **3000+ food types** directly in your production database. The script generates a comprehensive food database with Brazilian foods, international foods, and many variations.

## 📊 What the Seeder Creates

The script generates:

-   **200+ Beef cuts** with different preparations (grilled, roasted, cooked, etc.)
-   **150+ Poultry variations** (chicken, turkey, duck with different cooking methods)
-   **200+ Fish and seafood** (salmon, tilapia, shrimp, etc. with various preparations)
-   **150+ Grains and cereals** (rice, quinoa, oats with different cooking styles)
-   **300+ Vegetables and legumes** (all Brazilian vegetables with different preparations and seasonings)
-   **200+ Fruits** (tropical, citrus, berries with different states: ripe, organic, etc.)
-   **100+ Dairy products** (milk, cheese, yogurt with variations: light, organic, lactose-free)
-   **80+ Nuts and seeds** (cashews, Brazil nuts, almonds with different preparations)
-   **60+ Legumes** (beans, lentils, chickpeas cooked in different ways)
-   **100+ Beverages** (juices, teas, coffees with variations)
-   **200+ Condiments and spices** (olive oil, vinegars, sauces with different types)
-   **80+ Pasta varieties** (spaghetti, penne with different sauces and types)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Use your **SERVICE ROLE KEY** (not the anon key) for bulk operations. You can find it in your Supabase project settings under API.

### 3. Run the Seeder

You have two options to run the seeder:

**Option 1: Using npm/bun scripts (Recommended)**

```bash
npm run seed
# or
bun run seed
```

**Option 2: Direct execution**

```bash
npx tsx scripts/runSeed.ts
# or
bun run scripts/runSeed.ts
```

## 📈 Seeding Process

The script will:

1. **Test database connection** - Verify it can connect to your Supabase database
2. **Check current food count** - Show how many foods are already in the database
3. **Generate food database** - Create 3000+ food variations programmatically
4. **Insert in batches** - Insert foods in small batches (50 at a time) to avoid overwhelming the database
5. **Show progress** - Display real-time progress of the insertion process
6. **Final statistics** - Show total foods added and breakdown by category

## 🎯 Food Categories Generated

| Category     | Approximate Count | Examples                                 |
| ------------ | ----------------- | ---------------------------------------- |
| Proteínas    | 800+              | Beef cuts, poultry, fish, dairy, legumes |
| Carboidratos | 600+              | Rice varieties, pasta, bread, tubers     |
| Vegetais     | 450+              | Vegetables with different preparations   |
| Frutas       | 400+              | Tropical fruits, citrus, berries         |
| Gorduras     | 200+              | Nuts, seeds, oils                        |
| Bebidas      | 200+              | Juices, teas, coffees                    |
| Condimentos  | 350+              | Spices, sauces, oils                     |

## 🔧 Features

-   **Batch Processing**: Inserts foods in small batches to avoid database timeouts
-   **Error Handling**: Continues processing even if some batches fail
-   **Progress Tracking**: Real-time feedback on insertion progress
-   **Nutritional Data**: Complete nutritional information for each food
-   **Brazilian Focus**: Emphasis on Brazilian foods and preparations
-   **Allergen Information**: Includes allergen data for foods
-   **Meal Time Categories**: Foods categorized by appropriate meal times
-   **Organic Options**: Includes organic variations of foods
-   **Cost Levels**: Foods categorized by cost (low, medium, high)
-   **Seasonal Information**: Seasonal availability data
-   **Sustainability Scores**: Environmental impact ratings

## 📋 Sample Output

```
🚀 Starting NutriFlow Pro Food Database Seeder
==================================================
✓ Database connection successful
📊 Current foods in database: 100
🔄 Generating food database...
📝 Generated 3247 food items
✓ Inserted batch 1/65 - 50 foods
✓ Inserted batch 2/65 - 50 foods
...
✓ Inserted batch 65/65 - 47 foods
🎉 Seeding completed! Total foods in database: 3347
📈 Added 3247 new foods

📊 Foods by category:
  Proteínas: 856 items
  Carboidratos: 623 items
  Vegetais: 445 items
  Frutas: 398 items
  Gorduras: 198 items
  Bebidas: 156 items
  Condimentos: 571 items
==================================================
✨ Seeding process completed!
```

## ⚠️ Important Notes

1. **Database Impact**: This script will add 3000+ records to your database. Make sure you have adequate storage.

2. **Service Role Key**: Always use the SERVICE ROLE key, never commit it to version control.

3. **Production Safety**: The script is designed to be safe for production use with proper error handling.

4. **Duplicate Prevention**: The script doesn't prevent duplicates - run it only once or clear the foods table first if needed.

5. **Backup**: Consider backing up your current food data before running the seeder.

## 🛠️ Customization

You can customize the seed data by editing `/scripts/seedFoodDatabase.ts`:

-   Modify food categories in the `foodCategories` object
-   Add/remove preparations and variations
-   Adjust nutritional values
-   Change portion sizes and units
-   Add more allergen information

## 🆘 Troubleshooting

**Connection Issues:**

-   Verify your Supabase URL and service role key
-   Check if your Supabase project is active
-   Ensure your IP is not blocked by Supabase

**Timeout Errors:**

-   The script uses small batches (50 items) to prevent timeouts
-   If timeouts persist, reduce the batch size in the script

**Permission Errors:**

-   Make sure you're using the SERVICE ROLE key, not the anon key
-   Verify the key has write permissions to the foods table

## 📞 Support

If you encounter any issues:

1. Check the console output for specific error messages
2. Verify your environment variables are correct
3. Ensure your Supabase project is accessible
4. Check that the foods table exists and matches the expected schema

---

**Happy Seeding! 🌱**
