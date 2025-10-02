-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('customer', 'driver', 'admin')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create trucks table
CREATE TABLE public.trucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  truck_type TEXT NOT NULL,
  capacity TEXT NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT true,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create partner applications table (pending approvals)
CREATE TABLE public.partner_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  license_number TEXT NOT NULL,
  id_proof_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  truck_id UUID REFERENCES public.trucks(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TEXT,
  truck_type TEXT NOT NULL,
  package_type TEXT,
  estimated_weight TEXT,
  package_dimensions TEXT,
  recipient_name TEXT,
  recipient_phone TEXT,
  contact_phone TEXT,
  special_instructions TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('standard', 'express', 'urgent')) DEFAULT 'standard',
  service_type TEXT CHECK (service_type IN ('truck_booking', 'same_day_delivery')) DEFAULT 'truck_booking',
  distance_km DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  driver_id UUID REFERENCES public.profiles(id),
  driver_name TEXT,
  driver_phone TEXT,
  current_location TEXT,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  tracking_updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view available trucks" ON public.trucks FOR SELECT USING (available = true);
CREATE POLICY "Drivers can manage own trucks" ON public.trucks FOR ALL USING (auth.uid() = driver_id);

CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Anyone can submit partner applications" ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all applications" ON public.partner_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);
CREATE POLICY "Admins can update applications" ON public.partner_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'), 
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for ID proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('id-proofs', 'id-proofs', true);

-- Storage policies
CREATE POLICY "Anyone can upload ID proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'id-proofs');
CREATE POLICY "Anyone can view ID proofs" ON storage.objects FOR SELECT USING (bucket_id = 'id-proofs');

-- Create tracking updates table
CREATE TABLE public.tracking_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tracking updates
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tracking updates
CREATE POLICY "Users can view tracking for their bookings" ON public.tracking_updates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND customer_id = auth.uid())
);

-- Create admin user (Run this manually after setting up auth)
-- First create the auth user, then run:
-- INSERT INTO public.profiles (id, name, phone, user_type) 
-- VALUES ('admin-user-id-from-auth', 'Admin', '+1234567890', 'admin');