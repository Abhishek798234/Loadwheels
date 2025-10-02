import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { toast } from "sonner";

const Trucks = () => {
  const navigate = useNavigate();
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

  const lightTrucks = [
    { name: "Tata Ace", capacity: "750kg", price: "$50-80/trip", image: "🚐" },
    { name: "3 Wheeler", capacity: "500kg", price: "$30-50/trip", image: "🛺" },
    { name: "E Loader", capacity: "600kg", price: "$40-60/trip", image: "⚡" },
  ];

  const heavyTrucks = [
    { name: "Tata 407", capacity: "2000kg", price: "$150-200/trip", image: "🚚" },
    { name: "Pickup 8ft", capacity: "1500kg", price: "$120-150/trip", image: "🚙" },
    { name: "Pickup 14ft", capacity: "3000kg", price: "$200-300/trip", image: "🚛" },
  ];

  const handleBook = (truckName: string) => {
    setSelectedTruck(truckName);
    toast.success(`${truckName} selected! Proceeding to booking...`);
    navigate(`/booking?truck=${encodeURIComponent(truckName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 py-12 bg-gradient-subtle">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Truck</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our wide range of vehicles based on your cargo needs
            </p>
          </div>

          <Tabs defaultValue="light" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 glass">
              <TabsTrigger value="light" className="transition-all duration-500">Light Trucks (Below 750kg)</TabsTrigger>
              <TabsTrigger value="heavy" className="transition-all duration-500">Heavy Trucks (Above 750kg)</TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {lightTrucks.map((truck, index) => (
                  <Card
                    key={truck.name}
                    className="glass-hover group cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleBook(truck.name)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="text-6xl text-center transition-all duration-500 group-hover:scale-110">{truck.image}</div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold group-hover:text-secondary transition-all duration-500">
                          {truck.name}
                        </h3>
                        <p className="text-muted-foreground">Capacity: {truck.capacity}</p>
                        <p className="text-lg font-semibold text-secondary">{truck.price}</p>
                      </div>
                      <Button className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground transition-all duration-500 hover:scale-105">
                        Select Vehicle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="heavy" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {heavyTrucks.map((truck, index) => (
                  <Card
                    key={truck.name}
                    className="glass-hover group cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleBook(truck.name)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="text-6xl text-center transition-all duration-500 group-hover:scale-110">{truck.image}</div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold group-hover:text-secondary transition-all duration-500">
                          {truck.name}
                        </h3>
                        <p className="text-muted-foreground">Capacity: {truck.capacity}</p>
                        <p className="text-lg font-semibold text-secondary">{truck.price}</p>
                      </div>
                      <Button className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground transition-all duration-500 hover:scale-105">
                        Select Vehicle
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Card className="mt-12 max-w-5xl mx-auto glass animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="font-semibold mb-2">Need help choosing?</h3>
                  <p className="text-muted-foreground">
                    Our team is available 24/7 to help you select the right vehicle for your needs.
                    Contact us at support@loadwheels.com or call +1 (555) 123-4567.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Trucks;
