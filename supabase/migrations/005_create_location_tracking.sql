-- Create location updates table for real-time tracking
CREATE TABLE IF NOT EXISTS public.location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy_meters INT,
  speed_kmh DECIMAL(10, 2),
  heading INT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on location_updates
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Drivers can insert their own location
CREATE POLICY "Drivers can insert their own location" ON public.location_updates
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- RLS Policy: Passengers and drivers can view ride locations
CREATE POLICY "Users can view ride locations" ON public.location_updates
  FOR SELECT USING (
    EXISTS(
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_location_updates_ride_id ON public.location_updates(ride_id);
CREATE INDEX idx_location_updates_driver_id ON public.location_updates(driver_id);
CREATE INDEX idx_location_updates_timestamp ON public.location_updates(timestamp DESC);
CREATE INDEX idx_location_updates_created_at ON public.location_updates(created_at DESC);

-- Enable realtime for location_updates (for live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_updates;
