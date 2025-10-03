import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Package, Zap, CheckCircle, ArrowRight, Calendar, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { MapboxLocationPicker } from "@/components/MapboxLocationPicker";
import { calculateDistance, geocodeAddress } from "@/services/mapbox";

const SameDayDelivery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup_location: "",
    delivery_location: "",
    package_type: "",
    package_weight: "",
    package_dimensions: "",
    recipient_name: "",
    recipient_phone: "",
    special_instructions: "",
    preferred_time: "",
    urgency_level: "standard"
  });
  const [fareEstimate, setFareEstimate] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const urgencyLevels = [
    { id: "standard", name: "Standard (4-6 hours)", multiplier: 1, icon: Clock },
    { id: "express", name: "Express (2-3 hours)", multiplier: 1.5, icon: Zap },
    { id: "urgent", name: "Urgent (1-2 hours)", multiplier: 2, icon: Package }
  ];

  const timeSlots = [
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM", 
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM"
  ];

  useEffect(() => {
    if (formData.pickup_location && formData.delivery_location) {
      calculateFare();
    }
  }, [formData.pickup_location, formData.delivery_location, formData.urgency_level, formData.package_weight]);

  const calculateFare = async () => {
    try {
      const pickupCoords = await geocodeAddress(formData.pickup_location);
      const deliveryCoords = await geocodeAddress(formData.delivery_location);
      
      if (!pickupCoords || !deliveryCoords) return;
      
      const dist = await calculateDistance(pickupCoords, deliveryCoords);
      setDistance(dist);
      
      const baseFare = 15; // Base same-day delivery fee
      const perKmRate = 3;
      const weightMultiplier = parseFloat(formData.package_weight) > 10 ? 1.2 : 1;
      const urgencyMultiplier = urgencyLevels.find(u => u.id === formData.urgency_level)?.multiplier || 1;
      
      const fare = (baseFare + (dist * perKmRate)) * weightMultiplier * urgencyMultiplier;
      setFareEstimate(Math.round(fare));
    } catch (error) {
      console.error("Fare calculation error:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to book same-day delivery");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        customer_id: user.id,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        pickup_date: new Date().toISOString().split('T')[0],
        pickup_time: formData.preferred_time,
        truck_type: "Same-Day Delivery",
        package_type: formData.package_type,
        estimated_weight: formData.package_weight,
        package_dimensions: formData.package_dimensions,
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        special_instructions: formData.special_instructions,
        urgency_level: formData.urgency_level,
        total_amount: fareEstimate,
        distance_km: distance,
        status: 'pending',
        service_type: 'same_day_delivery'
      };

      const { error } = await supabase.from('bookings').insert([bookingData]);
      if (error) throw error;

      toast.success("Same-day delivery booked successfully!");
      navigate("/my-bookings");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Zap className="h-10 w-10 text-orange-500" />
            Same-Day Delivery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your packages delivered within hours. Fast, reliable, and tracked in real-time.
          </p>
        </div>

        {/* Features Banner */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="glass text-center">
            <CardContent className="p-4">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">1-6 Hours</h3>
              <p className="text-sm text-muted-foreground">Delivery Time</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="p-4">
              <MapPin className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Real-Time</h3>
              <p className="text-sm text-muted-foreground">GPS Tracking</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="p-4">
              <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold">Secure</h3>
              <p className="text-sm text-muted-foreground">Package Handling</p>
            </CardContent>
          </Card>
          <Card className="glass text-center">
            <CardContent className="p-4">
              <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold">Guaranteed</h3>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-secondary" />
                Book Same-Day Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pickup & Delivery Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup">Pickup Location</Label>
                      <MapboxLocationPicker
                        onLocationSelect={(location) => handleInputChange("pickup_location", location.address || `${location.lat}, ${location.lng}`)}
                        placeholder="Enter pickup address or select on map"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery">Delivery Location</Label>
                      <MapboxLocationPicker
                        onLocationSelect={(location) => handleInputChange("delivery_location", location.address || `${location.lat}, ${location.lng}`)}
                        placeholder="Enter delivery address or select on map"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient">Recipient Name</Label>
                      <Input
                        id="recipient"
                        placeholder="Recipient's full name"
                        value={formData.recipient_name}
                        onChange={(e) => handleInputChange("recipient_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Recipient Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Recipient's phone number"
                        value={formData.recipient_phone}
                        onChange={(e) => handleInputChange("recipient_phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full">
                    Next: Package Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Package Information</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="package-type">Package Type</Label>
                      <Input
                        id="package-type"
                        placeholder="e.g., Documents, Electronics"
                        value={formData.package_type}
                        onChange={(e) => handleInputChange("package_type", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="Package weight"
                        value={formData.package_weight}
                        onChange={(e) => handleInputChange("package_weight", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions (LxWxH cm)</Label>
                      <Input
                        id="dimensions"
                        placeholder="e.g., 30x20x10"
                        value={formData.package_dimensions}
                        onChange={(e) => handleInputChange("package_dimensions", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any special handling instructions..."
                      value={formData.special_instructions}
                      onChange={(e) => handleInputChange("special_instructions", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1">
                      Next: Delivery Options
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Delivery Options</h3>
                  
                  {/* Urgency Level */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Urgency Level</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      {urgencyLevels.map((level) => (
                        <Card
                          key={level.id}
                          className={`cursor-pointer transition-all ${
                            formData.urgency_level === level.id
                              ? "ring-2 ring-secondary bg-secondary/10"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleInputChange("urgency_level", level.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <level.icon className="h-8 w-8 mx-auto mb-2 text-secondary" />
                            <h4 className="font-medium text-sm">{level.name}</h4>
                            <Badge variant="secondary" className="mt-1">
                              +{Math.round((level.multiplier - 1) * 100)}% fee
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Preferred Time Slot</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <Card
                          key={slot}
                          className={`cursor-pointer transition-all ${
                            formData.preferred_time === slot
                              ? "ring-2 ring-secondary bg-secondary/10"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleInputChange("preferred_time", slot)}
                        >
                          <CardContent className="p-3 text-center">
                            <Calendar className="h-5 w-5 mx-auto mb-1 text-secondary" />
                            <span className="text-sm font-medium">{slot}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Fare Summary */}
                  {fareEstimate && (
                    <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">Total Fare</h4>
                            <p className="text-sm text-muted-foreground">
                              Distance: {distance?.toFixed(1)} km • {urgencyLevels.find(u => u.id === formData.urgency_level)?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-secondary">${fareEstimate}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || !fareEstimate}
                      className="flex-1"
                    >
                      {loading ? "Booking..." : "Book Same-Day Delivery"}
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SameDayDelivery;