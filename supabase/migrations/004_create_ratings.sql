-- Create driver ratings table
CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on driver_ratings
ALTER TABLE public.driver_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Passengers can view driver ratings
CREATE POLICY "Anyone can view driver ratings" ON public.driver_ratings
  FOR SELECT USING (TRUE);

-- RLS Policy: Passengers can create ratings
CREATE POLICY "Passengers can create driver ratings" ON public.driver_ratings
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- RLS Policy: Passengers can update their own ratings
CREATE POLICY "Passengers can update their own ratings" ON public.driver_ratings
  FOR UPDATE USING (auth.uid() = passenger_id)
  WITH CHECK (auth.uid() = passenger_id);

-- Create indexes
CREATE INDEX idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_passenger_id ON public.driver_ratings(passenger_id);
CREATE INDEX idx_driver_ratings_ride_id ON public.driver_ratings(ride_id);

-- Create passenger ratings table
CREATE TABLE IF NOT EXISTS public.passenger_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on passenger_ratings
ALTER TABLE public.passenger_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view passenger ratings
CREATE POLICY "Anyone can view passenger ratings" ON public.passenger_ratings
  FOR SELECT USING (TRUE);

-- RLS Policy: Drivers can create ratings
CREATE POLICY "Drivers can create passenger ratings" ON public.passenger_ratings
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- RLS Policy: Drivers can update their own ratings
CREATE POLICY "Drivers can update their own ratings" ON public.passenger_ratings
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Create indexes
CREATE INDEX idx_passenger_ratings_passenger_id ON public.passenger_ratings(passenger_id);
CREATE INDEX idx_passenger_ratings_driver_id ON public.passenger_ratings(driver_id);
CREATE INDEX idx_passenger_ratings_ride_id ON public.passenger_ratings(ride_id);
