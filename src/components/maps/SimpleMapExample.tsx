import { MapComponent } from '@/components/maps/MapComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export const SimpleMapExample = () => {
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log('Location selected:', location);
    // Do something with the location
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Location
          </CardTitle>
          <CardDescription>
            Click "Use My Current Location" or search for an address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapComponent 
            onLocationSelect={handleLocationSelect}
            showDirections={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};
