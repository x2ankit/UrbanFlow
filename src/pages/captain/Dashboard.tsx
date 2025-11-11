import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { HelpChat } from "@/components/shared/HelpChat";
import {
  User,
  LogOut,
  DollarSign,
  Clock,
  MapPin,
  Navigation,
  TrendingUp,
  Car,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const CaptainDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);

  const stats = [
    {
      label: "Today's Earnings",
      value: "$142.50",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      label: "Total Rides",
      value: "8",
      icon: Car,
      color: "text-primary",
    },
    {
      label: "Hours Online",
      value: "6.5h",
      icon: Clock,
      color: "text-muted-foreground",
    },
  ];

  const rideRequests = [
    {
      id: 1,
      passenger: "Sarah Johnson",
      pickup: "Downtown Plaza",
      destination: "Airport Terminal 2",
      distance: "12.5 km",
      fare: "$45.50",
    },
    {
      id: 2,
      passenger: "Mike Chen",
      pickup: "Central Station",
      destination: "Business District",
      distance: "5.2 km",
      fare: "$18.00",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold">UrbanFlow Driver</h1>
              <Badge variant={isOnline ? "default" : "secondary"} className="gap-2">
                {isOnline ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Online
                  </>
                ) : (
                  "Offline"
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <User className="h-3 w-3" />
                John Captain
              </Badge>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Online Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="shadow-elegant-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Availability Status</CardTitle>
                      <CardDescription>
                        Toggle to start receiving ride requests
                      </CardDescription>
                    </div>
                    <Switch
                      checked={isOnline}
                      onCheckedChange={setIsOnline}
                      className="scale-125"
                    />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid md:grid-cols-3 gap-4"
            >
              {stats.map((stat, index) => (
                <Card key={index} className="shadow-elegant">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Ride Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="shadow-elegant-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Available Ride Requests
                  </CardTitle>
                  <CardDescription>
                    {isOnline
                      ? "Accept rides to start earning"
                      : "Go online to see ride requests"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isOnline ? (
                    rideRequests.map((ride) => (
                      <div
                        key={ride.id}
                        className="p-4 border border-border rounded-xl space-y-4 hover:border-primary transition-smooth"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">{ride.passenger}</p>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <p className="font-medium">Pickup</p>
                                  <p className="text-muted-foreground">{ride.pickup}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-accent mt-0.5" />
                                <div>
                                  <p className="font-medium">Destination</p>
                                  <p className="text-muted-foreground">
                                    {ride.destination}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-semibold">{ride.fare}</p>
                            <p className="text-xs text-muted-foreground">{ride.distance}</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button className="flex-1 gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2">
                            <XCircle className="h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Turn on your availability to see ride requests
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-semibold">$876.50</p>
                    <p className="text-sm text-muted-foreground mt-1">This week</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Rides</span>
                      <span className="font-medium">42</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours Online</span>
                      <span className="font-medium">28.5h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg per Ride</span>
                      <span className="font-medium">$20.87</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Vehicle Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Vehicle Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Make</span>
                    <span className="font-medium">Toyota</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">Camry 2022</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plate</span>
                    <span className="font-medium">ABC-1234</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <HelpChat />
    </div>
  );
};

export default CaptainDashboard;
