# AyurDiet Testing Guide

## What Was Wrong (Root Cause Analysis)

### The Problem
When you logged in, you saw only a static welcome message saying "Contact your dietitian" with no features to test.

### Why This Happened

1. **Incorrect Default Role Assignment**
   - When users signed up, everyone was automatically assigned the "patient" role
   - But the app is designed for **Ayurvedic Dietitians** (practitioners) to manage patients
   - Patients are not supposed to sign up directly - dietitians create patient records

2. **Wrong Redirect After Login**
   - After login, Auth.tsx redirected everyone to `/dashboard` (dietitian-only page)
   - Patient users got blocked by role protection
   - They ended up at `/patient` dashboard which was empty

3. **Empty Patient Dashboard**
   - The patient dashboard looks for a patient record in the `patients` table
   - But patient records are created by dietitians, not during signup
   - So new patients saw "Contact your dietitian" message

4. **Limited Sample Data**
   - Only 8 sample foods in the database
   - Not enough to properly test the meal planning features

## What Was Fixed

### 1. Role Selection During Signup ✅

**File**: `src/pages/Auth.tsx`

Added role selection UI where users can choose:
- **Dietitian**: Full access to all features (recommended for testing)
- **Patient**: Limited view, waits for dietitian to add them

The selected role is passed to Supabase metadata during signup, and the database trigger (`assign_default_role()`) creates the appropriate role in the `user_roles` table.

### 2. Smart Login Redirect ✅

**File**: `src/pages/Auth.tsx`

After successful login, the app now:
1. Fetches the user's role from `user_roles` table
2. Redirects based on role:
   - Admin → `/admin`
   - Dietitian → `/dashboard`
   - Patient → `/patient`

### 3. Added 50+ Sample Foods ✅

**File**: `supabase/migrations/20251205000000_add_sample_foods.sql`

Added comprehensive Indian Ayurvedic foods with:
- Complete nutritional data (calories, protein, carbs, fat, fiber)
- Ayurvedic properties:
  - Temperature (Hot/Cold/Neutral)
  - Digestibility (Easy/Moderate/Difficult)
  - Primary taste (Sweet, Sour, Salty, Bitter, Pungent, Astringent)
  - Dosha effects for Vata, Pitta, Kapha (increase/decrease/neutral)

Categories include:
- Grains (Rice, Wheat, Barley, Quinoa, Oats)
- Pulses (Moong, Toor, Masoor, Chana, Black Gram)
- Vegetables (Spinach, Carrot, Tomato, Cucumber, etc.)
- Fruits (Apple, Mango, Papaya, Pomegranate, etc.)
- Dairy (Milk, Yogurt, Paneer, Buttermilk)
- Nuts & Seeds (Almonds, Cashews, Walnuts, etc.)
- Spices & Herbs (Turmeric, Cumin, Ginger, etc.)
- Oils (Ghee, Coconut, Mustard, Olive)

### 4. Updated README with Testing Guide ✅

**File**: `README.md`

Added comprehensive documentation:
- Project overview and features
- Step-by-step setup instructions
- Detailed testing guide for both roles
- Technology stack and architecture
- Project structure
- Troubleshooting section

## How to Test the Application

### RECOMMENDED: Test as a Dietitian (Full Features)

1. **Start the app**: `npm run dev`

2. **Sign Up as Dietitian**:
   - Go to http://localhost:5173/auth
   - Click "Sign Up" tab
   - Select "Dietitian" role
   - Enter details:
     ```
     Full Name: Dr. Test User
     Email: dietitian@test.com
     Password: test123
     ```
   - Click "Create Account"

3. **Sign In**:
   - Use the same credentials to sign in
   - You'll be redirected to the Dietitian Dashboard

4. **Test Features**:

   **a) Food Database**
   - Click "View Food Database"
   - You'll see 50+ foods with filters
   - Search for foods by name
   - Filter by category (Grains, Vegetables, etc.)
   - View Ayurvedic properties and dosha effects

   **b) Add a Patient**
   - Click "Add New Patient"
   - Fill in patient details:
     ```
     Name: John Doe
     Age: 35
     Gender: Male
     Contact: john@example.com
     Dietary Habit: Vegetarian
     Height: 175 cm
     Weight: 70 kg
     ```
   - Add any medical history/allergies
   - Click "Add Patient"

   **c) View Patients**
   - Click "View All Patients"
   - See the patient you just added
   - Click on patient name to see detailed profile

   **d) Create Diet Chart**
   - Click "Create New Diet Chart"
   - Select the patient you created
   - Add meal items:
     ```
     Meal Type: Breakfast
     Food: Moong Dal
     Quantity: 100g
     ```
   - Add multiple items for different meals
   - See automatic calorie and nutrient calculations
   - Click "Create Diet Chart"

   **e) AI Ayurvedic Assistant** (if Edge Function is deployed)
   - Click "Open AI Assistant"
   - Try "Meal Planning" tab:
     - Select dosha (e.g., Vata)
     - Choose meal type (Full Day Plan)
     - Add preferences (e.g., "vegetarian, no spicy")
     - Click "Generate Meal Plan"
   - Try "Dosha Balance" tab:
     - Select your dosha
     - Click "Get Food Recommendations"
     - See foods that balance your dosha

   **f) Dosha Quiz**
   - Click "Start Quiz"
   - Answer questions about your body type, digestion, etc.
   - Get your dosha constitution result
   - See personalized recommendations

   **g) Weekly Meal Calendar**
   - Click "Open Calendar"
   - See current week layout
   - Select a dosha in the sidebar
   - Click "Get Suggestions" to see AI-recommended foods
   - Drag foods from the sidebar into meal slots
   - Drop them on breakfast/lunch/dinner/snacks
   - See total calories per day
   - Navigate between weeks with arrows

### Optional: Test as a Patient

1. **Sign Up as Patient**:
   - Create another account
   - Select "Patient" role
   - Email: patient@test.com
   - Password: test123

2. **Sign In as Patient**:
   - You'll see the patient dashboard
   - Initially shows "Contact your dietitian" message

3. **Create Patient Record (as Dietitian)**:
   - Sign out and log back in as dietitian
   - Add a new patient with email: patient@test.com
   - Create a diet chart for this patient

4. **View as Patient**:
   - Sign out and log back in as patient
   - Now you'll see:
     - Your health profile
     - Diet plans created by your dietitian
     - Meal details and nutrition info

## Database Schema Quick Reference

### Key Tables

- **profiles**: User profiles (name, contact)
- **user_roles**: Role assignments (admin/dietitian/patient)
- **patients**: Patient records created by dietitians
- **foods**: Food database with Ayurvedic properties
- **diet_charts**: Diet plans for patients
- **diet_chart_items**: Individual food items in diet charts
- **meal_calendar**: Weekly meal planning data

### Role Permissions

**Dietitian Can**:
- View and manage their own patients
- Create diet charts for their patients
- Access food database
- Use all AI features
- Use meal calendar

**Patient Can**:
- View their own health profile (if created by dietitian)
- View diet charts created for them
- Access food database
- Use Dosha Quiz

**Admin Can**:
- Manage all users
- View all patients and diet charts
- Manage food database
- Full system access

## Troubleshooting

### "After signup, I still see empty page"

**Cause**: You might have signed up as a patient.

**Solution**: Sign up again with a different email and select "Dietitian" role.

### "Food database shows only 8 foods"

**Cause**: New migration not applied yet.

**Solution**: 
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/20251205000000_add_sample_foods.sql`
3. Run the migration
4. Refresh the app

### "AI Assistant shows error"

**Cause**: Edge Function not deployed or environment variables missing.

**Solution**:
1. Ensure `VITE_SUPABASE_URL` and keys are set
2. Deploy the Edge Function: `supabase/functions/ayurvedic-assistant/`
3. Check function logs in Supabase Dashboard

### "Can't see patients I created"

**Cause**: RLS policies block access if role is incorrect.

**Solution**: 
1. Check your role in Supabase → Table Editor → user_roles
2. Ensure you have 'dietitian' role

## Next Steps

Now that the app is properly set up, you can:

1. **Add More Data**: Import your own food database
2. **Customize Recipes**: Add meal recipes with multiple ingredients
3. **Enhanced AI**: Improve AI prompts for better recommendations
4. **Reports**: Add PDF export for diet charts
5. **Mobile App**: Build React Native version
6. **Analytics**: Add patient progress tracking

## Support

If you encounter any issues:
1. Check the console for errors (F12 in browser)
2. Verify environment variables are set
3. Ensure all migrations ran successfully
4. Check Supabase logs for backend errors

Happy testing! 🌿



