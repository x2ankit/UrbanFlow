-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'cash', 'wallet')),
  stripe_payment_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  driver_earnings DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = passenger_id OR auth.uid() = driver_id
  );

-- RLS Policy: System can create transactions
CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policy: System can update transactions
CREATE POLICY "System can update transactions" ON public.transactions
  FOR UPDATE USING (TRUE)
  WITH CHECK (TRUE);

-- Create indexes
CREATE INDEX idx_transactions_passenger_id ON public.transactions(passenger_id);
CREATE INDEX idx_transactions_driver_id ON public.transactions(driver_id);
CREATE INDEX idx_transactions_ride_id ON public.transactions(ride_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- Create trigger to update updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
