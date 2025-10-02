import { Link } from "react-router-dom";
import { Truck, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 glass">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-gradient-hero p-2 animate-glow">
                <Truck className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Load<span className="text-secondary">Wheels</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for all transport and logistics needs. Fast, reliable, and professional service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-secondary transition-all duration-500">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="text-sm text-muted-foreground hover:text-secondary transition-all duration-500">
                  Enterprise Solutions
                </Link>
              </li>
              <li>
                <Link to="/trucks" className="text-sm text-muted-foreground hover:text-secondary transition-all duration-500">
                  Book a Truck
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-sm text-muted-foreground hover:text-secondary transition-all duration-500">
                  Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Moving Loads</li>
              <li className="text-sm text-muted-foreground">Same-Day Delivery</li>
              <li className="text-sm text-muted-foreground">Real-Time Tracking</li>
              <li className="text-sm text-muted-foreground">Enterprise Solutions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@loadwheels.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Logistics Ave, City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LoadWheels. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
