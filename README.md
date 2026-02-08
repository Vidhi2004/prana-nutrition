# AyurDiet - Ayurvedic Diet Management System

A comprehensive cloud-based practice management software for Ayurvedic dietitians. Combines modern nutrition science with traditional Ayurvedic principles including doshas, rasas (six tastes), food temperatures, and digestibility.

## Features

- **Patient Management**: Comprehensive patient profiles with health parameters
- **Food Database**: 50+ Indian Ayurvedic foods with complete nutritional data and dosha effects
- **Diet Chart Creation**: Design personalized meal plans with automated nutrient analysis
- **AI Ayurvedic Assistant**: Get AI-powered meal recommendations based on dosha constitution
- **Dosha Quiz**: Help patients discover their Ayurvedic constitution
- **Weekly Meal Calendar**: Drag-and-drop meal planning interface with AI suggestions
- **Role-Based Access**: Separate dashboards for dietitians, patients, and admins

## Quick Start

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account (for database)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd prana-nutrition

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Step 5: Run database migrations (in Supabase dashboard or CLI)
# All migrations are in supabase/migrations/

# Step 6: Start the development server
npm run dev
```

## Testing the Application

### Step 1: Create Test Accounts

The app has role-based access. Create accounts for different roles:

**Option A: Sign up as a Dietitian (Recommended for testing all features)**

1. Go to the signup page
2. Select "Dietitian" as your role
3. Enter your details:
   - Full Name: Dr. Test User
   - Email: dietitian@test.com
   - Password: test123
4. After signup, sign in with the same credentials
5. You'll be redirected to the Dietitian Dashboard

**Option B: Sign up as a Patient**

1. Select "Patient" as your role during signup
2. You'll see a patient dashboard with limited features
3. Patients need to be added by dietitians to see their diet plans

### Step 2: Explore Dietitian Features

Once logged in as a dietitian, you can:

1. **View Dashboard**: See stats for patients, diet charts, and foods
2. **Browse Food Database**: 
   - Click "View Food Database"
   - Browse 50+ foods with Ayurvedic properties
   - See dosha effects (Vata, Pitta, Kapha)
3. **Add a Patient**:
   - Click "Add New Patient"
   - Fill in details like age, gender, dietary habits
   - Add health parameters
4. **Create Diet Chart**:
   - Click "Create New Diet Chart"
   - Select a patient
   - Add food items with meal types and quantities
   - See automatic calorie calculations
5. **Use AI Assistant**:
   - Click "Open AI Assistant"
   - Try "Meal Planning" for full day plans
   - Try "Dosha Balance" for personalized food recommendations
   - Select your dosha (Vata/Pitta/Kapha)
6. **Dosha Quiz**:
   - Take the interactive quiz to discover your constitution
   - Get personalized recommendations
7. **Weekly Meal Calendar**:
   - Drag and drop foods into daily meal slots
   - Get AI-powered food suggestions
   - See total calories per day

### Step 3: Test Patient Features

Create a patient account to see the patient experience:

1. Sign up as a patient
2. The dashboard will show a welcome message
3. Once a dietitian creates a patient record matching your email, you'll see:
   - Your health profile
   - Diet plans created by your dietitian
   - Meal details and nutritional info

### Database Sample Data

The database comes pre-loaded with:
- 50+ Indian Ayurvedic foods
- Complete nutritional information
- Dosha effects (Vata decrease/increase, Pitta, Kapha)
- Six tastes (Rasa): Sweet, Sour, Salty, Bitter, Pungent, Astringent
- Food temperature (Hot/Cold/Neutral)
- Digestibility (Easy/Moderate/Difficult)

## Development Workflow

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications

### Backend (Supabase)
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level authorization
- **Supabase Auth** - User authentication
- **Edge Functions** - Serverless functions for AI assistant
- **Real-time subscriptions** - Live data updates

### Architecture

```
Frontend (React)
    ↓
Supabase Client
    ↓
├─ Auth (User Management)
├─ Database (PostgreSQL with RLS)
│   ├─ profiles
│   ├─ user_roles
│   ├─ patients
│   ├─ foods
│   ├─ diet_charts
│   ├─ diet_chart_items
│   └─ meal_calendar
└─ Edge Functions
    └─ ayurvedic-assistant (AI)
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── NavLink.tsx      # Custom navigation link
│   └── RoleBasedRoute.tsx # Route protection
├── pages/               # Application pages
│   ├── Auth.tsx         # Login/Signup
│   ├── DietitianDashboard.tsx
│   ├── PatientDashboard.tsx
│   ├── Patients.tsx
│   ├── Foods.tsx
│   ├── DietChartNew.tsx
│   ├── AyurvedicAssistant.tsx
│   ├── DoshaQuiz.tsx
│   └── MealCalendar.tsx
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client & types
└── lib/                # Utility functions

supabase/
├── migrations/         # Database schema migrations
└── functions/         # Edge functions
    └── ayurvedic-assistant/
```

## Deployment

### Deploy to Vercel/Netlify

```sh
# Build the project
npm run build

# The dist/ folder contains the production build
# Deploy dist/ to your hosting platform
```

### Environment Variables

Set these in your hosting platform:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Database Setup

1. Create a Supabase project
2. Run all migrations in `supabase/migrations/` in order
3. Deploy the Edge Function in `supabase/functions/ayurvedic-assistant/`

## Troubleshooting

### "No role found" error after signup

**Solution**: The database trigger should automatically assign a role. If not:
1. Check that the migration `20251113151006_e8b9777c...sql` ran successfully
2. Manually insert a role in the `user_roles` table

### Empty patient dashboard

**Expected behavior**: Patients need to be added by a dietitian. The patient dashboard shows:
- "Contact your dietitian" if no patient record exists
- Patient info and diet plans once a dietitian creates their record

### Food database is empty

**Solution**: Run the latest migration `20251205000000_add_sample_foods.sql` to add 50+ sample foods

### AI Assistant not working

**Solution**: 
1. Ensure the Edge Function is deployed
2. Check that `VITE_SUPABASE_URL` and API keys are correct
3. Verify the Edge Function URL in `supabase/config.toml`

## Contributing

This is a practice management system for Ayurvedic dietitians. Contributions are welcome!

## License

MIT License

## Support

For issues or questions, please open a GitHub issue.
