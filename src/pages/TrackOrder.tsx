import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Package, Truck, CheckCircle, AlertCircle, Search, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

interface TrackingData {
  id: string;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  pickup_time: string;
  truck_type: string;
  status: string;
  service_type: string;
  urgency_level: string;
  recipient_name: string;
  recipient_phone: string;
  total_amount: number;
  created_at: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_arrival?: string;
  current_location?: string;
}

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (trackingId) {
      handleTrack();
    }
  }, []);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setNotFound(false);
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', trackingId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setTrackingData(null);
      } else {
        setTrackingData(data);
        // Simulate real-time updates
        simulateLocationUpdates(data);
      }
    } catch (error) {
      setNotFound(true);
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const simulateLocationUpdates = (booking: TrackingData) => {
    // Simulate driver assignment and location updates
    const updates = [
      { driver_name: "John Smith", driver_phone: "+1234567890", current_location: "En route to pickup" },
      { current_location: "Arrived at pickup location" },
      { current_location: "Package collected, heading to destination" },
      { current_location: "Near delivery location" }
    ];

    let updateIndex = 0;
    const interval = setInterval(() => {
      if (updateIndex < updates.length && booking.status !== 'completed') {
        setTrackingData(prev => prev ? { ...prev, ...updates[updateIndex] } : null);
        updateIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30000); // Update every 30 seconds for demo
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'in_progress': return <Truck className="h-5 w-5 text-orange-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const trackingSteps = [
    { id: 'pending', label: 'Order Placed', description: 'Your booking has been received' },
    { id: 'confirmed', label: 'Driver Assigned', description: 'A driver has been assigned to your order' },
    { id: 'in_progress', label: 'In Transit', description: 'Your package is on the way' },
    { id: 'completed', label: 'Delivered', description: 'Package delivered successfully' }
  ];

  const getCurrentStepIndex = (status: string) => {
    return trackingSteps.findIndex(step => step.id === status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <MapPin className="h-10 w-10 text-blue-500" />
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter your tracking ID to get real-time updates on your delivery
            </p>
          </div>

          {/* Search */}
          <Card className="glass mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter your tracking ID (e.g., abc123...)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTrack} disabled={loading}>
                  {loading ? "Tracking..." : <><Search className="h-4 w-4 mr-2" />Track</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Results */}
          {notFound && (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
                <p className="text-muted-foreground">
                  We couldn't find an order with that tracking ID. Please check your ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {trackingData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="glass">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-6 w-6 text-secondary" />
                        Order #{trackingData.id.slice(0, 8)}
                        {trackingData.service_type === 'same_day_delivery' && (
                          <Badge className="bg-orange-100 text-orange-800">Same-Day</Badge>
                        )}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {trackingData.truck_type} • Placed on {new Date(trackingData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(trackingData.status)}>
                      {trackingData.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-green-500 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup</p>
                          <p className="font-medium">{trackingData.pickup_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-red-500 mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery</p>
                          <p className="font-medium">{trackingData.delivery_location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {trackingData.recipient_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Recipient</p>
                          <p className="font-medium">{trackingData.recipient_name}</p>
                          <p className="text-sm">{trackingData.recipient_phone}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-secondary">${trackingData.total_amount}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Tracking */}
              {trackingData.status === 'in_progress' && (
                <Card className="glass border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <Truck className="h-6 w-6" />
                      Live Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trackingData.current_location && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">Current Status</p>
                          <p className="text-sm text-muted-foreground">{trackingData.current_location}</p>
                        </div>
                      </div>
                    )}
                    
                    {trackingData.driver_name && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">Driver: {trackingData.driver_name}</p>
                          <p className="text-sm text-muted-foreground">{trackingData.driver_phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(`tel:${trackingData.driver_phone}`)}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const message = `Hi, I'm tracking my order ${trackingData.id.slice(0, 8)}. Could you please provide an update?`;
                            window.open(`https://wa.me/${trackingData.driver_phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`);
                          }}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Progress Timeline */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Delivery Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingSteps.map((step, index) => {
                      const currentIndex = getCurrentStepIndex(trackingData.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <div key={step.id} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? 'bg-orange-500 text-white animate-pulse'
                                : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <div className="w-2 h-2 bg-current rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {isCurrent && trackingData.current_location && (
                              <p className="text-sm text-orange-600 mt-1">{trackingData.current_location}</p>
                            )}
                          </div>
                          {isCurrent && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Current
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Delivery */}
              {trackingData.status !== 'completed' && trackingData.status !== 'cancelled' && (
                <Card className="glass bg-blue-50/50 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-blue-800">Estimated Delivery</h4>
                        <p className="text-sm text-blue-600">
                          {trackingData.service_type === 'same_day_delivery' 
                            ? `Today by ${trackingData.pickup_time || '6:00 PM'}`
                            : `${new Date(trackingData.pickup_date).toLocaleDateString()} at ${trackingData.pickup_time}`
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;