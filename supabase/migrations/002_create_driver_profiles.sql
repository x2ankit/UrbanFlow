-- Create driver profile extension table
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INT,
  vehicle_color VARCHAR(50),
  vehicle_plate VARCHAR(50) UNIQUE,
  vehicle_capacity INT DEFAULT 4,
  is_verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  total_rides INT DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on driver_profiles
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Drivers can view their own profile
CREATE POLICY "Drivers can view their own profile" ON public.driver_profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Drivers can update their own profile
CREATE POLICY "Drivers can update their own profile" ON public.driver_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policy: Anyone can view verified driver info (for matching)
CREATE POLICY "Anyone can view verified driver info" ON public.driver_profiles
  FOR SELECT USING (is_verified = TRUE);

-- Create indexes
CREATE INDEX idx_driver_profiles_is_online ON public.driver_profiles(is_online);
CREATE INDEX idx_driver_profiles_is_verified ON public.driver_profiles(is_verified);
CREATE INDEX idx_driver_profiles_license_number ON public.driver_profiles(license_number);

-- Create trigger to update updated_at
CREATE TRIGGER update_driver_profiles_updated_at
BEFORE UPDATE ON public.driver_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
