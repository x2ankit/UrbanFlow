import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// ============ User Profile Functions ============

export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(updates: Record<string, any>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// ============ Driver Profile Functions ============

export async function getDriverProfile(driverId: string) {
  try {
    const { data, error } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', driverId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    return null;
  }
}

export async function updateDriverLocation(latitude: number, longitude: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('driver_profiles')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
      })
      .eq('id', user.id)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
}

export async function toggleDriverOnlineStatus(isOnline: boolean) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('driver_profiles')
      .update({ is_online: isOnline })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating online status:', error);
    throw error;
  }
}

// ============ Ride Request Functions ============

export async function createRideRequest(
  pickupLat: number,
  pickupLng: number,
  pickupAddress: string,
  dropoffLat: number,
  dropoffLng: number,
  dropoffAddress: string,
  estimatedFare?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('ride_requests')
      .insert({
        passenger_id: user.id,
        pickup_latitude: pickupLat,
        pickup_longitude: pickupLng,
        pickup_address: pickupAddress,
        dropoff_latitude: dropoffLat,
        dropoff_longitude: dropoffLng,
        dropoff_address: dropoffAddress,
        estimated_fare: estimatedFare,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ride request:', error);
    throw error;
  }
}

export async function getAvailableRideRequests() {
  try {
    const { data, error } = await supabase
      .from('ride_requests')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ride requests:', error);
    return [];
  }
}

export async function cancelRideRequest(requestId: string) {
  try {
    const { data, error } = await supabase
      .from('ride_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error cancelling ride request:', error);
    throw error;
  }
}

// ============ Ride Functions ============

export async function createRide(
  passengerId: string,
  driverId: string,
  pickupLat: number,
  pickupLng: number,
  pickupAddress: string,
  dropoffLat: number,
  dropoffLng: number,
  dropoffAddress: string,
  fare: number
) {
  try {
    const { data, error } = await supabase
      .from('rides')
      .insert({
        passenger_id: passengerId,
        driver_id: driverId,
        pickup_latitude: pickupLat,
        pickup_longitude: pickupLng,
        pickup_address: pickupAddress,
        dropoff_latitude: dropoffLat,
        dropoff_longitude: dropoffLng,
        dropoff_address: dropoffAddress,
        fare,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ride:', error);
    throw error;
  }
}

export async function getCurrentRide(userId: string) {
  try {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
      .in('status', ['accepted', 'in_transit'])
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  } catch (error) {
    console.error('Error fetching current ride:', error);
    return null;
  }
}

export async function updateRideStatus(rideId: string, status: 'accepted' | 'in_transit' | 'completed' | 'cancelled') {
  try {
    const updates: any = { status };
    if (status === 'in_transit') updates.started_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('rides')
      .update(updates)
      .eq('id', rideId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ride status:', error);
    throw error;
  }
}

export async function getRideHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching ride history:', error);
    return [];
  }
}

// ============ Location Tracking Functions ============

export async function recordLocationUpdate(
  rideId: string,
  latitude: number,
  longitude: number,
  accuracy?: number,
  speed?: number
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('location_updates')
      .insert({
        ride_id: rideId,
        driver_id: user.id,
        latitude,
        longitude,
        accuracy_meters: accuracy,
        speed_kmh: speed,
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording location update:', error);
    throw error;
  }
}

export async function getLatestDriverLocation(rideId: string) {
  try {
    const { data, error } = await supabase
      .from('location_updates')
      .select('*')
      .eq('ride_id', rideId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching driver location:', error);
    return null;
  }
}

// ============ Rating Functions ============

export async function submitDriverRating(
  rideId: string,
  driverId: string,
  rating: number,
  comment?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('driver_ratings')
      .insert({
        ride_id: rideId,
        passenger_id: user.id,
        driver_id: driverId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting driver rating:', error);
    throw error;
  }
}

export async function getDriverRatings(driverId: string) {
  try {
    const { data, error } = await supabase
      .from('driver_ratings')
      .select('*')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching driver ratings:', error);
    return [];
  }
}

// ============ Transaction Functions ============

export async function createTransaction(
  rideId: string,
  passengerId: string,
  driverId: string,
  amount: number,
  paymentMethod: 'card' | 'cash' | 'wallet',
  driverEarnings?: number
) {
  try {
    const platformFee = amount * 0.15; // 15% platform fee
    const finalDriverEarnings = driverEarnings || (amount - platformFee);

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ride_id: rideId,
        passenger_id: passengerId,
        driver_id: driverId,
        amount,
        payment_method: paymentMethod,
        driver_earnings: finalDriverEarnings,
        platform_fee: platformFee,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// ============ Notifications Functions ============

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  rideId?: string,
  data?: any
) {
  try {
    const { data: notifData, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        ride_id: rideId,
        data,
      })
      .select()
      .single();

    if (error) throw error;
    return notifData;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// ============ Real-time Subscriptions ============

export function subscribeToLocationUpdates(rideId: string, callback: (location: any) => void) {
  const subscription = supabase
    .channel(`ride_${rideId}_locations`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `ride_id=eq.${rideId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
}

export function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  const subscription = supabase
    .channel(`user_${userId}_notifications`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
}

export function subscribeToRideUpdates(rideId: string, callback: (ride: any) => void) {
  const subscription = supabase
    .channel(`ride_${rideId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `id=eq.${rideId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return subscription;
}
