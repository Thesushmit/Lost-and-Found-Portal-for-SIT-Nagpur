-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('student', 'staff');

-- Create enum for item status
CREATE TYPE public.item_status AS ENUM ('found', 'claimed', 'returned');

-- Profiles table (1NF, 2NF, 3NF compliant - base user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Students table (normalized - student-specific attributes)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id_number TEXT NOT NULL UNIQUE,
  semester TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_profile UNIQUE (profile_id)
);

-- Staff table (normalized - staff-specific attributes)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_staff_profile UNIQUE (profile_id)
);

-- Locations table (normalized - reusable location data)
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Found items table (main entity)
CREATE TABLE public.found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  found_location TEXT NOT NULL,
  deposit_location TEXT NOT NULL,
  found_date DATE NOT NULL,
  found_time TIME NOT NULL,
  status item_status NOT NULL DEFAULT 'found',
  claimed_by UUID REFERENCES public.profiles(id),
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_found_items_reporter ON public.found_items(reporter_id);
CREATE INDEX idx_found_items_status ON public.found_items(status);
CREATE INDEX idx_found_items_found_date ON public.found_items(found_date DESC);
CREATE INDEX idx_students_profile ON public.students(profile_id);
CREATE INDEX idx_staff_profile ON public.staff(profile_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Students table is viewable by all authenticated users"
  ON public.students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own student record"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own student record"
  ON public.students FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- RLS Policies for staff
CREATE POLICY "Staff table is viewable by all authenticated users"
  ON public.staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own staff record"
  ON public.staff FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own staff record"
  ON public.staff FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

-- RLS Policies for locations
CREATE POLICY "Locations are viewable by all authenticated users"
  ON public.locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert locations"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for found_items
CREATE POLICY "Found items are viewable by all authenticated users"
  ON public.found_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can report found items"
  ON public.found_items FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can update their own reported items"
  ON public.found_items FOR UPDATE
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can delete their own reported items"
  ON public.found_items FOR DELETE
  TO authenticated
  USING (reporter_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_found_items_updated_at
  BEFORE UPDATE ON public.found_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default locations
INSERT INTO public.locations (name, description) VALUES
  ('Main Library', 'Central library building'),
  ('Student Center', 'Main student activity center'),
  ('Cafeteria', 'Main dining hall'),
  ('Admin Building', 'Administrative offices'),
  ('Science Block', 'Science department building'),
  ('Arts Building', 'Arts and humanities building'),
  ('Sports Complex', 'Gymnasium and sports facilities'),
  ('Parking Lot', 'Main campus parking area'),
  ('Lost & Found Office', 'Official lost and found collection point');
