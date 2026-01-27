# Lost & Found Portal

A full-stack web application for managing lost and found items on a university campus. Students and staff can report found items and help reunite belongings with their owners.

## 🌟 Features

- **User Authentication**: Separate signup flows for students and staff
- **Report Found Items**: Upload photos, location, and details of found items
- **Browse Items**: View all reported found items with search and filter capabilities
- **My Reports**: Track and manage items you've reported
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── ItemCard.tsx           # Found item display card
│   ├── Navbar.tsx             # Navigation bar component
│   ├── NavLink.tsx            # Navigation link component
│   └── ProtectedRoute.tsx     # Auth-protected route wrapper
├── contexts/
│   └── AuthContext.tsx        # Authentication context provider
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
├── integrations/
│   └── supabase/
│       ├── client.ts          # Supabase client (auto-generated)
│       └── types.ts           # Database types (auto-generated)
├── lib/
│   └── utils.ts               # Utility functions
├── pages/
│   ├── Auth.tsx               # Login/Signup page
│   ├── Dashboard.tsx          # Browse found items
│   ├── Landing.tsx            # Public landing page
│   ├── MyReports.tsx          # User's reported items
│   ├── NotFound.tsx           # 404 page
│   └── ReportFoundItem.tsx    # Report found item form
├── test/
│   ├── example.test.ts        # Example test file
│   └── setup.ts               # Test setup configuration
├── App.tsx                    # Main application component
├── App.css                    # Application styles
├── index.css                  # Global styles & design system
├── main.tsx                   # Application entry point
└── vite-env.d.ts              # Vite type definitions

public/
├── favicon.ico
├── placeholder.svg
└── robots.txt

supabase/
└── config.toml                # Supabase configuration
```

## 🗄️ Database Schema

The database follows DBMS normalization principles (1NF, 2NF, 3NF) for optimal data integrity.

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │    profiles     │       │    students     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK, FK)     │◄──────│ id (PK)         │
│ email           │       │ email           │       │ profile_id (FK) │
│ ...             │       │ full_name       │       │ student_id_no   │
└─────────────────┘       │ role            │       │ semester        │
                          │ avatar_url      │       │ created_at      │
                          │ created_at      │       └─────────────────┘
                          │ updated_at      │
                          └────────┬────────┘       ┌─────────────────┐
                                   │                │      staff      │
                                   │                ├─────────────────┤
                                   │◄───────────────│ id (PK)         │
                                   │                │ profile_id (FK) │
                                   ▼                │ department      │
                          ┌─────────────────┐       │ created_at      │
                          │   found_items   │       └─────────────────┘
                          ├─────────────────┤
                          │ id (PK)         │       ┌─────────────────┐
                          │ reporter_id(FK) │       │   locations     │
                          │ title           │       ├─────────────────┤
                          │ description     │       │ id (PK)         │
                          │ image_url       │       │ name            │
                          │ found_location  │       │ description     │
                          │ deposit_location│       │ created_at      │
                          │ found_date      │       └─────────────────┘
                          │ found_time      │
                          │ status          │
                          │ claimed_by (FK) │
                          │ claimed_at      │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
```

### Tables

#### `profiles`
Base user information table linked to Supabase Auth.

| Column      | Type                      | Description                    |
|-------------|---------------------------|--------------------------------|
| id          | UUID (PK, FK to auth.users)| User identifier               |
| email       | TEXT                      | User's email address           |
| full_name   | TEXT                      | User's full name               |
| role        | user_role ENUM            | 'student' or 'staff'           |
| avatar_url  | TEXT (nullable)           | Profile picture URL            |
| created_at  | TIMESTAMPTZ               | Account creation timestamp     |
| updated_at  | TIMESTAMPTZ               | Last update timestamp          |

#### `students`
Student-specific information (normalized from profiles).

| Column           | Type                 | Description                    |
|------------------|----------------------|--------------------------------|
| id               | UUID (PK)            | Student record identifier      |
| profile_id       | UUID (FK to profiles)| Link to user profile           |
| student_id_number| TEXT (UNIQUE)        | University student ID          |
| semester         | TEXT                 | Current semester               |
| created_at       | TIMESTAMPTZ          | Record creation timestamp      |

#### `staff`
Staff-specific information (normalized from profiles).

| Column      | Type                 | Description                    |
|-------------|----------------------|--------------------------------|
| id          | UUID (PK)            | Staff record identifier        |
| profile_id  | UUID (FK to profiles)| Link to user profile           |
| department  | TEXT                 | Staff department               |
| created_at  | TIMESTAMPTZ          | Record creation timestamp      |

#### `found_items`
Main table for reported found items.

| Column           | Type                 | Description                    |
|------------------|----------------------|--------------------------------|
| id               | UUID (PK)            | Item identifier                |
| reporter_id      | UUID (FK to profiles)| Who reported the item          |
| title            | TEXT                 | Item name/title                |
| description      | TEXT (nullable)      | Detailed description           |
| image_url        | TEXT (nullable)      | Photo of the item              |
| found_location   | TEXT                 | Where item was found           |
| deposit_location | TEXT                 | Where item is stored           |
| found_date       | DATE                 | Date item was found            |
| found_time       | TIME                 | Time item was found            |
| status           | item_status ENUM     | 'found', 'claimed', 'returned' |
| claimed_by       | UUID (FK, nullable)  | Who claimed the item           |
| claimed_at       | TIMESTAMPTZ          | When item was claimed          |
| created_at       | TIMESTAMPTZ          | Report creation timestamp      |
| updated_at       | TIMESTAMPTZ          | Last update timestamp          |

#### `locations`
Predefined campus locations for consistency.

| Column      | Type           | Description                    |
|-------------|----------------|--------------------------------|
| id          | UUID (PK)      | Location identifier            |
| name        | TEXT (UNIQUE)  | Location name                  |
| description | TEXT (nullable)| Location details               |
| created_at  | TIMESTAMPTZ    | Creation timestamp             |

### Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('student', 'staff');

-- Item status
CREATE TYPE item_status AS ENUM ('found', 'claimed', 'returned');
```

### Storage

- **Bucket**: `found-items` (public)
- **Purpose**: Store images of found items
- **Structure**: `{user_id}/{timestamp}.{extension}`

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authenticated users can view all profiles and items
- Users can only modify their own data
- Storage policies restrict file management to authenticated users

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:8080](http://localhost:8080)

## 📝 License

MIT License - feel free to use this project for your university or organization.
