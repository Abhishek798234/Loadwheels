import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Users, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Enterprise = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    pickupLocation: "",
    dropLocation: "",
    vehicleType: "",
    cargoDetails: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Enterprise booking request submitted! Our team will contact you shortly.");
    // TODO: Implement actual booking submission
  };

  const features = [
    {
      icon: Building2,
      title: "Dedicated Account Manager",
      description: "Personal support for all your logistics needs",
    },
    {
      icon: Users,
      title: "Volume Discounts",
      description: "Competitive pricing for regular shipments",
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "24/7 priority assistance for enterprise clients",
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reporting",
      description: "Detailed insights on your logistics operations",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20">
          <div className="container text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Enterprise Solutions
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Streamline your business logistics with our comprehensive enterprise solutions.
              Tailored services for growing businesses.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <Card key={feature.title} className="glass-hover text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-lg bg-secondary/10 transition-all duration-500 group-hover:scale-110">
                        <feature.icon className="h-8 w-8 text-secondary" />
                      </div>
                    </div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Booking Form */}
            <Card className="max-w-3xl mx-auto glass animate-fade-in">
              <CardHeader>
                <CardTitle>Request Enterprise Service</CardTitle>
                <CardDescription>
                  Fill out the form below and our team will get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Acme Corp"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        placeholder="John Doe"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contact@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Input
                        id="pickupLocation"
                        name="pickupLocation"
                        placeholder="123 Main St, City"
                        value={formData.pickupLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropLocation">Drop Location</Label>
                      <Input
                        id="dropLocation"
                        name="dropLocation"
                        placeholder="456 Oak Ave, City"
                        value={formData.dropLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicleType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="light-truck">Light Truck</SelectItem>
                        <SelectItem value="heavy-truck">Heavy Truck</SelectItem>
                        <SelectItem value="multiple">Multiple Vehicles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargoDetails">Cargo Details</Label>
                    <Textarea
                      id="cargoDetails"
                      name="cargoDetails"
                      placeholder="Describe your cargo, weight, special requirements..."
                      value={formData.cargoDetails}
                      onChange={handleChange}
                      rows={4}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-glow"
                    size="lg"
                  >
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Enterprise;
