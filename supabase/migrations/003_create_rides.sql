-- Create ride requests table (pending requests before matching)
CREATE TABLE IF NOT EXISTS public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  pickup_address VARCHAR(500) NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address VARCHAR(500) NOT NULL,
  estimated_distance DECIMAL(10, 2),
  estimated_duration_minutes INT,
  estimated_fare DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ride_requests
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Passengers can view their own requests
CREATE POLICY "Passengers can view their own requests" ON public.ride_requests
  FOR SELECT USING (auth.uid() = passenger_id);

-- RLS Policy: Drivers can view pending requests (for matching)
CREATE POLICY "Drivers can view pending requests" ON public.ride_requests
  FOR SELECT USING (
    (SELECT user_type FROM public.user_profiles WHERE id = auth.uid()) = 'driver'
    AND status = 'pending'
  );

-- RLS Policy: Passengers can create requests
CREATE POLICY "Passengers can create ride requests" ON public.ride_requests
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- RLS Policy: Passengers can cancel their own requests
CREATE POLICY "Passengers can cancel their own requests" ON public.ride_requests
  FOR UPDATE USING (auth.uid() = passenger_id)
  WITH CHECK (auth.uid() = passenger_id);

-- Create indexes
CREATE INDEX idx_ride_requests_passenger_id ON public.ride_requests(passenger_id);
CREATE INDEX idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX idx_ride_requests_expires_at ON public.ride_requests(expires_at);
CREATE INDEX idx_ride_requests_requested_at ON public.ride_requests(requested_at);

-- Create rides table (matched rides)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_request_id UUID REFERENCES public.ride_requests(id) ON DELETE SET NULL,
  passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  pickup_address VARCHAR(500) NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_address VARCHAR(500) NOT NULL,
  distance_km DECIMAL(10, 2),
  duration_minutes INT,
  fare DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_transit', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rides
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Passengers and drivers can view their own rides
CREATE POLICY "Users can view their own rides" ON public.rides
  FOR SELECT USING (
    auth.uid() = passenger_id OR auth.uid() = driver_id
  );

-- RLS Policy: Only allow creating rides (matching logic handled in backend)
CREATE POLICY "Only system can create rides" ON public.rides
  FOR INSERT WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'passenger'
    )
  );

-- RLS Policy: Drivers can update ride status
CREATE POLICY "Drivers can update ride status" ON public.rides
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

-- Create indexes
CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_created_at ON public.rides(created_at);

-- Create trigger to update updated_at
CREATE TRIGGER update_rides_updated_at
BEFORE UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
