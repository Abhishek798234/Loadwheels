import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Truck, Phone, Package, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

interface Booking {
  id: string;
  truck_type: string;
  pickup_location: string;
  delivery_location: string;
  pickup_date: string;
  pickup_time: string;
  contact_name: string;
  contact_phone: string;
  special_instructions: string;
  estimated_weight: string;
  package_type: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-12 bg-gradient-subtle">
        <div className="container max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">Track and manage your truck bookings</p>
          </div>

          {bookings.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't made any bookings yet. Start by booking your first truck!
                </p>
                <Button onClick={() => window.location.href = '/trucks'}>
                  Book a Truck
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="glass">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-secondary" />
                          {booking.truck_type}
                          {booking.service_type === 'same_day_delivery' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Same-Day
                            </Badge>
                          )}
                          {booking.urgency_level && booking.urgency_level !== 'standard' && (
                            <Badge variant="destructive" className={
                              booking.urgency_level === 'urgent' ? 'bg-red-100 text-red-800' :
                              booking.urgency_level === 'express' ? 'bg-yellow-100 text-yellow-800' : ''
                            }>
                              {booking.urgency_level.toUpperCase()}
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Booking ID: {booking.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-secondary mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Pickup</p>
                            <p className="font-medium">{booking.pickup_location}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-secondary mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Delivery</p>
                            <p className="font-medium">{booking.delivery_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar className="h-4 w-4 text-secondary mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Pickup Date & Time</p>
                            <p className="font-medium">
                              {format(new Date(booking.pickup_date), "PPP")} - {booking.pickup_time}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {booking.contact_name && (
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-secondary mt-1" />
                            <div>
                              <p className="text-sm text-muted-foreground">Contact</p>
                              <p className="font-medium">{booking.contact_name}</p>
                              <p className="text-sm">{booking.contact_phone}</p>
                            </div>
                          </div>
                        )}

                        {booking.service_type === 'same_day_delivery' && booking.recipient_name && (
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-orange-500 mt-1" />
                            <div>
                              <p className="text-sm text-muted-foreground">Recipient</p>
                              <p className="font-medium">{booking.recipient_name}</p>
                              <p className="text-sm">{booking.recipient_phone}</p>
                            </div>
                          </div>
                        )}

                        {booking.package_type && (
                          <div className="flex items-start gap-3">
                            <Package className="h-4 w-4 text-secondary mt-1" />
                            <div>
                              <p className="text-sm text-muted-foreground">Package Details</p>
                              <p className="font-medium">{booking.package_type}</p>
                              {booking.estimated_weight && (
                                <p className="text-sm">{booking.estimated_weight}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-secondary mt-1" />
                          <div>
                            <p className="text-sm text-muted-foreground">Booked On</p>
                            <p className="font-medium">
                              {format(new Date(booking.created_at), "PPP")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.special_instructions && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
                        <p className="text-sm">{booking.special_instructions}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-secondary">${booking.total_amount}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/track?id=${booking.id}`}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Track Order
                        </Button>
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Cancel Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default MyBookings;