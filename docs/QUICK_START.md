# 🚀 Quick Start Guide - Food Database Seeder

## Step-by-Step Instructions

### 1. **Setup Environment** (First time only)

```bash
npm run setup
```

This will ask for your Supabase credentials and create a `.env` file.

### 2. **Test Database Connection** (Recommended)

```bash
npm run test-db
```

This verifies your connection and permissions before running the seeder.

### 3. **Run the Seeder**

```bash
npm run seed
```

This will populate your database with 3000+ food items.

## 📋 Complete Command Reference

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm run setup`      | Interactive setup for environment variables |
| `npm run test-db`    | Test database connection and permissions    |
| `npm run seed`       | Run the complete food database seeder       |
| `npm run seed:foods` | Direct execution of seeder (advanced users) |

## 🔍 What You Need

1. **Supabase Project URL** - Found in Project Settings → API

    - Format: `https://your-project-ref.supabase.co`

2. **Service Role Key** - Found in Project Settings → API
    - This is NOT the `anon` key - use the `service_role` key
    - Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🎯 Expected Results

After running the seeder, you should see:

-   **Current count**: Shows foods already in your database
-   **Progress updates**: Real-time batch insertion progress
-   **Final statistics**: Total foods added and category breakdown
-   **3000+ new foods** added to your database

## 🆘 Troubleshooting

**"Missing environment variables"**
→ Run `npm run setup` first

**"Connection failed"**
→ Check your Supabase URL and ensure project is active

**"Insert permission failed"**
→ Make sure you're using the SERVICE ROLE key, not anon key

**"Timeout errors"**
→ The script uses small batches to prevent this, but you can reduce batch size if needed

## ✅ Verification

After seeding, you can verify the results by:

1. Checking your Supabase dashboard
2. Running `npm run test-db` again to see the new count
3. Testing your food search functionality in the app

---

**Ready to populate your database with 3000+ foods? Start with `npm run setup`! 🌱**
