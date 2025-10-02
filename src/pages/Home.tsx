import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Truck, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import videoFile from "@/assets/1001.mp4";
import serviceMoving from "@/assets/Screenshot 2025-10-01 230451.png";
import serviceDelivery from "@/assets/bike.png";
import serviceTracking from "@/assets/Untitled.png";

const Home = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Moving Loads",
      description: "Professional moving services for all your cargo needs with various truck sizes.",
      icon: serviceMoving,
      path: "/trucks",
    },
    {
      title: "Same-Day Delivery",
      description: "Get your packages delivered within hours with our express same-day service.",
      icon: serviceDelivery,
      path: "/same-day-delivery",
    },
    {
      title: "Real-Time Tracking",
      description: "Track your shipments in real-time with our advanced GPS tracking system.",
      icon: serviceTracking,
      path: "/track",
    },
  ];

  const features = [
    "2% platform fee - competitive pricing",
    "Verified delivery partners",
    "Insurance covered shipments",
    "24/7 customer support",
    "Multiple vehicle options",
    "Enterprise solutions available",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source
              src={videoFile}
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-hero opacity-20" />
        </div>
        
        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl space-y-8 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Your Trusted Transport & 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary"> Logistics</span> Partner
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              Connect with verified delivery partners for all your transportation needs. Fast, reliable, and professional service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-glow text-lg px-8 py-6"
                onClick={() => navigate("/trucks")}
              >
                Book a Truck
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass-hover text-foreground text-lg px-8 py-6"
                onClick={() => navigate("/partner")}
              >
                Become a Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive logistics solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className="glass-hover group cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(service.path)}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-center animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="h-28 w-28 object-contain transition-all duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-center group-hover:text-secondary transition-all duration-500">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why Choose LoadWheels?
              </h2>
              <p className="text-lg text-muted-foreground">
                We provide a seamless platform connecting customers with professional delivery partners across the region.
              </p>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-gradient-hero hover:opacity-90"
                onClick={() => navigate("/register")}
              >
                Get Started Today
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="glass-hover animate-glow">
                <CardContent className="p-6 space-y-2">
                  <Truck className="h-10 w-10 text-secondary" />
                  <h3 className="text-3xl font-bold text-foreground">500+</h3>
                  <p className="text-muted-foreground">Verified Partners</p>
                </CardContent>
              </Card>
              <Card className="glass-hover animate-glow" style={{ animationDelay: '0.5s' }}>
                <CardContent className="p-6 space-y-2">
                  <Clock className="h-10 w-10 text-secondary" />
                  <h3 className="text-3xl font-bold text-foreground">24/7</h3>
                  <p className="text-muted-foreground">Support Available</p>
                </CardContent>
              </Card>
              <Card className="glass-hover animate-glow" style={{ animationDelay: '1s' }}>
                <CardContent className="p-6 space-y-2">
                  <MapPin className="h-10 w-10 text-secondary" />
                  <h3 className="text-3xl font-bold text-foreground">50+</h3>
                  <p className="text-muted-foreground">Cities Covered</p>
                </CardContent>
              </Card>
              <Card className="glass-hover animate-glow" style={{ animationDelay: '1.5s' }}>
                <CardContent className="p-6 space-y-2">
                  <CheckCircle className="h-10 w-10 text-secondary" />
                  <h3 className="text-3xl font-bold text-foreground">10K+</h3>
                  <p className="text-muted-foreground">Happy Customers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-light rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="container text-center space-y-8 relative z-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust LoadWheels for their logistics needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-glow text-lg px-8 py-6"
              onClick={() => navigate("/trucks")}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-hover text-foreground text-lg px-8 py-6"
              onClick={() => navigate("/partner")}
            >
              Become a Partner
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Home;
