import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Clock, Truck, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const selectedTruck = searchParams.get('truck') || 'Tata Ace';
  
  const [bookingData, setBookingData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    contactName: "",
    contactPhone: "",
    specialInstructions: "",
    estimatedWeight: "",
    packageType: ""
  });

  const truckPricing = {
    "Tata Ace": { basePrice: 65, capacity: "750kg", image: "🚐" },
    "3 Wheeler": { basePrice: 40, capacity: "500kg", image: "🛺" },
    "E Loader": { basePrice: 50, capacity: "600kg", image: "⚡" },
    "Tata 407": { basePrice: 175, capacity: "2000kg", image: "🚚" },
    "Pickup 8ft": { basePrice: 135, capacity: "1500kg", image: "🚙" },
    "Pickup 14ft": { basePrice: 250, capacity: "3000kg", image: "🚛" }
  };

  const currentTruck = truckPricing[selectedTruck as keyof typeof truckPricing];

  useEffect(() => {
    if (!user) {
      toast.error("Please login to book a truck");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePrice = () => {
    const basePrice = currentTruck?.basePrice || 65;
    const timeMultiplier = bookingData.pickupTime.includes("Express") ? 1.5 : 1;
    return Math.round(basePrice * timeMultiplier);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !bookingData.pickupLocation || !bookingData.deliveryLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          customer_id: user?.id,
          truck_type: selectedTruck,
          pickup_location: bookingData.pickupLocation,
          delivery_location: bookingData.deliveryLocation,
          pickup_date: selectedDate.toISOString(),
          pickup_time: bookingData.pickupTime,
          contact_name: bookingData.contactName,
          contact_phone: bookingData.contactPhone,
          special_instructions: bookingData.specialInstructions,
          estimated_weight: bookingData.estimatedWeight,
          package_type: bookingData.packageType,
          total_amount: calculatePrice(),
          status: 'pending'
        });

      if (error) throw error;

      setStep(4);
      toast.success("Booking confirmed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Pickup & Delivery Details</h2>
              <p className="text-muted-foreground">Where should we pick up and deliver your items?</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  Pickup Location *
                </Label>
                <Input
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={bookingData.pickupLocation}
                  onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                  className="glass"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-secondary" />
                  Delivery Location *
                </Label>
                <Input
                  id="delivery"
                  placeholder="Enter delivery address"
                  value={bookingData.deliveryLocation}
                  onChange={(e) => handleInputChange("deliveryLocation", e.target.value)}
                  className="glass"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Weight</Label>
                  <Select onValueChange={(value) => handleInputChange("estimatedWeight", value)}>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select weight range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50kg">0-50 kg</SelectItem>
                      <SelectItem value="50-100kg">50-100 kg</SelectItem>
                      <SelectItem value="100-500kg">100-500 kg</SelectItem>
                      <SelectItem value="500kg+">500+ kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Package Type</Label>
                  <Select onValueChange={(value) => handleInputChange("packageType", value)}>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="household">Household Items</SelectItem>
                      <SelectItem value="office">Office Equipment</SelectItem>
                      <SelectItem value="commercial">Commercial Goods</SelectItem>
                      <SelectItem value="fragile">Fragile Items</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Schedule Your Pickup</h2>
              <p className="text-muted-foreground">When would you like us to pick up your items?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-secondary" />
                  Pickup Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start glass">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    Pickup Time *
                  </Label>
                  <Select onValueChange={(value) => handleInputChange("pickupTime", value)}>
                    <SelectTrigger className="glass">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00-12:00">Morning (9:00 AM - 12:00 PM)</SelectItem>
                      <SelectItem value="12:00-15:00">Afternoon (12:00 PM - 3:00 PM)</SelectItem>
                      <SelectItem value="15:00-18:00">Evening (3:00 PM - 6:00 PM)</SelectItem>
                      <SelectItem value="Express">Express (Within 2 hours) +50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    placeholder="Your name"
                    value={bookingData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                    className="glass"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    placeholder="Your phone number"
                    value={bookingData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    className="glass"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    placeholder="Any special handling instructions..."
                    value={bookingData.specialInstructions}
                    onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                    className="glass"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
              <p className="text-muted-foreground">Review your booking details before confirming</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-secondary" />
                    Vehicle Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Vehicle:</span>
                    <span className="font-medium">{selectedTruck}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{currentTruck?.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base Price:</span>
                    <span className="font-medium">${currentTruck?.basePrice}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-secondary" />
                    Trip Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">From:</span>
                    <p className="font-medium">{bookingData.pickupLocation}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">To:</span>
                    <p className="font-medium">{bookingData.deliveryLocation}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date & Time:</span>
                    <p className="font-medium">
                      {selectedDate ? format(selectedDate, "PPP") : "Not selected"} - {bookingData.pickupTime}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-secondary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total Amount:</span>
                  <span className="text-secondary">${calculatePrice()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Includes all taxes and fees. Payment on delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-green-600">Booking Confirmed!</h2>
              <p className="text-lg text-muted-foreground">
                Your booking has been successfully submitted. We'll contact you shortly to confirm the details.
              </p>
            </div>
            <div className="space-y-4">
              <Button onClick={() => navigate("/")} size="lg" className="bg-secondary hover:bg-secondary-hover">
                Back to Home
              </Button>
              <Button onClick={() => navigate("/bookings")} variant="outline" size="lg">
                View My Bookings
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-12 bg-gradient-subtle">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : navigate("/trucks")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step > 1 ? "Previous Step" : "Back to Trucks"}
            </Button>

            {step < 4 && (
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                      step >= stepNum ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-24 h-1 mx-2 ${
                        step > stepNum ? 'bg-secondary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card className="glass animate-fade-in">
            <CardContent className="p-8">
              {renderStep()}
              
              {step < 4 && (
                <div className="flex justify-between mt-8">
                  <div />
                  <Button
                    onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
                    disabled={loading || (step === 1 && (!bookingData.pickupLocation || !bookingData.deliveryLocation))}
                    size="lg"
                    className="bg-secondary hover:bg-secondary-hover"
                  >
                    {loading ? "Processing..." : step === 3 ? "Confirm Booking" : "Continue"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;