import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, X, Send, MapPin, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateDistance as getDistance } from "@/services/googleMaps";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  buttons?: { text: string; action: string }[];
}

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState('initial');
  const [fareData, setFareData] = useState({
    vehicleType: '',
    pickup: '',
    dropoff: '',
    distance: 0,
    fare: 0
  });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const vehicleRates = {
    'Tata Ace': 12,
    '3 Wheeler': 8,
    'E Loader': 10,
    'Tata 407': 18,
    'Pickup 8ft': 15,
    'Pickup 14ft': 22
  };



  const initializeChat = () => {
    const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
    setMessages([
      {
        id: 1,
        text: `Hi ${userName}! 👋 How can I help you today?`,
        isBot: true,
        buttons: [
          { text: "💰 Fare Estimate", action: "fare_estimate" },
          { text: "⚡ Same-Day Delivery", action: "same_day_delivery" },
          { text: "📍 Track Order", action: "track_order" },
          { text: "❓ Other Problem", action: "other_problem" }
        ]
      }
    ]);
    setCurrentStep('initial');
  };

  const handleButtonClick = (action: string) => {
    if (action === 'fare_estimate') {
      setMessages(prev => [...prev, 
        { id: Date.now(), text: "💰 Fare Estimate", isBot: false },
        { 
          id: Date.now() + 1, 
          text: "Great! Let me help you get a fare estimate. First, please select your vehicle type:",
          isBot: true 
        }
      ]);
      setCurrentStep('select_vehicle');
    } else if (action === 'same_day_delivery') {
      setMessages(prev => [...prev,
        { id: Date.now(), text: "⚡ Same-Day Delivery", isBot: false },
        { 
          id: Date.now() + 1, 
          text: "🚀 Same-Day Delivery! Get your packages delivered within hours.\n\n✨ Features:\n• 1-6 hour delivery\n• Real-time tracking\n• Secure handling\n• Multiple urgency levels\n\nReady to book your same-day delivery?",
          isBot: true,
          buttons: [
            { text: "📦 Book Same-Day", action: "book_same_day" },
            { text: "💰 Get Estimate", action: "same_day_estimate" }
          ]
        }
      ]);
      setCurrentStep('same_day_options');
    } else if (action === 'book_same_day') {
      window.location.href = '/same-day-delivery';
    } else if (action === 'same_day_estimate') {
      setMessages(prev => [...prev,
        { id: Date.now(), text: "💰 Get Estimate", isBot: false },
        { 
          id: Date.now() + 1, 
          text: "Let me calculate your same-day delivery fare. Please enter your pickup location:",
          isBot: true
        }
      ]);
      setCurrentStep('same_day_pickup');
    } else if (action === 'track_order') {
      setMessages(prev => [...prev,
        { id: Date.now(), text: "📍 Track Order", isBot: false },
        { 
          id: Date.now() + 1, 
          text: "📍 Track your order in real-time!\n\nGet live updates on your delivery including:\n• Current location\n• Driver details\n• Estimated arrival\n• Delivery progress\n\nReady to track your order?",
          isBot: true,
          buttons: [
            { text: "📍 Track Now", action: "track_now" }
          ]
        }
      ]);
      setCurrentStep('track_options');
    } else if (action === 'track_now') {
      window.location.href = '/track';
    } else if (action === 'other_problem') {
      setMessages(prev => [...prev,
        { id: Date.now(), text: "❓ Other Problem", isBot: false },
        { 
          id: Date.now() + 1, 
          text: "I'd be happy to help! Please describe your issue and our support team will assist you shortly. You can also call us at +1 (555) 123-4567 or email support@loadwheels.com",
          isBot: true 
        }
      ]);
      setCurrentStep('support');
    }
  };

  const handleVehicleSelect = (vehicle: string) => {
    setFareData(prev => ({ ...prev, vehicleType: vehicle }));
    setMessages(prev => [...prev,
      { id: Date.now(), text: `Selected: ${vehicle}`, isBot: false },
      { 
        id: Date.now() + 1, 
        text: "Perfect! Now please enter your pickup location in the field below:",
        isBot: true
      }
    ]);
    setCurrentStep('pickup_location');
  };

  const handlePickupSubmit = (pickup: string) => {
    setFareData(prev => ({ ...prev, pickup }));
    setMessages(prev => [...prev,
      { id: Date.now(), text: `Pickup: ${pickup}`, isBot: false },
      { 
        id: Date.now() + 1, 
        text: "Great! Now please enter your drop-off location in the field below:",
        isBot: true
      }
    ]);
    setCurrentStep('dropoff_location');
  };

  const handleDropoffSubmit = async (dropoff: string) => {
    setFareData(prev => ({ ...prev, dropoff }));
    setMessages(prev => [...prev,
      { id: Date.now(), text: `Drop-off: ${dropoff}`, isBot: false },
      { 
        id: Date.now() + 1, 
        text: "Calculating distance and fare... 🚛",
        isBot: true 
      }
    ]);

    // Calculate distance and fare
    const result = await getDistance(fareData.pickup, dropoff);
    const distance = result.distance;
    
    let rate, totalFare, serviceType;
    
    if (currentStep === 'same_day_dropoff') {
      // Same-day delivery pricing
      const baseFare = 15; // Base same-day fee
      const perKmRate = 3;
      const standardFare = baseFare + (distance * perKmRate);
      totalFare = Math.round(standardFare);
      serviceType = 'Same-Day Delivery';
    } else {
      // Regular truck booking
      rate = vehicleRates[fareData.vehicleType as keyof typeof vehicleRates] || 12;
      const baseFare = distance * rate;
      totalFare = Math.round(baseFare + (baseFare * 0.1)); // Add 10% service charge
      serviceType = fareData.vehicleType;
    }

    setFareData(prev => ({ ...prev, distance, fare: totalFare }));
    
    setTimeout(() => {
      const estimateText = currentStep === 'same_day_dropoff' 
        ? `📍 **Same-Day Delivery Estimate**\n\n📦 Service: ${serviceType}\n📍 From: ${fareData.pickup}\n📍 To: ${dropoff}\n📏 Distance: ~${distance} km\n⏱️ Duration: ~${result.duration}\n💰 **Standard Fare: $${totalFare}**\n⚡ Express (+50%): $${Math.round(totalFare * 1.5)}\n🔥 Urgent (+100%): $${Math.round(totalFare * 2)}\n\n*Same-day delivery within 1-6 hours*`
        : `📍 **Fare Estimate**\n\n🚛 Vehicle: ${serviceType}\n📍 From: ${fareData.pickup}\n📍 To: ${dropoff}\n📏 Distance: ~${distance} km\n⏱️ Duration: ~${result.duration}\n💰 **Estimated Fare: $${totalFare}**\n\n*Includes service charges. ${result.success ? 'Based on real-time Google Maps data.' : 'Estimated distance used.'}*`;
      
      const buttons = currentStep === 'same_day_dropoff'
        ? [{ text: "📦 Book Same-Day", action: "book_same_day" }, { text: "🔄 New Estimate", action: "new_estimate" }]
        : [{ text: "📱 Book Now", action: "book_now" }, { text: "🔄 New Estimate", action: "new_estimate" }];
      
      setMessages(prev => [...prev.slice(0, -1),
        { 
          id: Date.now(), 
          text: estimateText,
          isBot: true,
          buttons
        }
      ]);
      setCurrentStep('fare_result');
    }, 2000);
  };

  const handleBookNow = () => {
    window.location.href = '/trucks';
  };

  const handleNewEstimate = () => {
    setFareData({ vehicleType: '', pickup: '', dropoff: '', distance: 0, fare: 0 });
    initializeChat();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (currentStep === 'pickup_location') {
      handlePickupSubmit(inputValue);
    } else if (currentStep === 'dropoff_location') {
      handleDropoffSubmit(inputValue);
    } else if (currentStep === 'same_day_pickup') {
      setFareData(prev => ({ ...prev, pickup: inputValue }));
      setMessages(prev => [...prev,
        { id: Date.now(), text: `Pickup: ${inputValue}`, isBot: false },
        { 
          id: Date.now() + 1, 
          text: "Perfect! Now please enter your delivery location:",
          isBot: true
        }
      ]);
      setCurrentStep('same_day_dropoff');
    } else if (currentStep === 'same_day_dropoff') {
      handleDropoffSubmit(inputValue);
    }
    
    setInputValue('');
  };

  const renderChatInput = () => {
    if (currentStep === 'select_vehicle') {
      return (
        <div className="p-4 border-t">
          <Select onValueChange={handleVehicleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(vehicleRates).map(vehicle => (
                <SelectItem key={vehicle} value={vehicle}>
                  {vehicle} - ${vehicleRates[vehicle as keyof typeof vehicleRates]}/km
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (currentStep === 'pickup_location') {
      return (
        <div className="p-4 border-t">
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter pickup location..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      );
    }

    if (currentStep === 'dropoff_location') {
      return (
        <div className="p-4 border-t">
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter drop-off location..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      );
    }

    if (currentStep === 'same_day_pickup') {
      return (
        <div className="p-4 border-t">
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter pickup location..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      );
    }

    if (currentStep === 'same_day_dropoff') {
      return (
        <div className="p-4 border-t">
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter delivery location..."
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => {
              setIsOpen(true);
              if (messages.length === 0) initializeChat();
            }}
            className="rounded-full w-16 h-16 bg-secondary hover:bg-secondary-hover shadow-xl animate-bounce"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
          <div className="absolute -top-12 right-0 bg-secondary text-secondary-foreground px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg">
            Chat here for approximate fare! 💬
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50">
          <Card className="h-full flex flex-col glass shadow-2xl">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 bg-secondary text-secondary-foreground rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                LoadWheels Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-secondary-foreground hover:bg-secondary-hover"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.isBot 
                        ? 'bg-muted text-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      {message.buttons && (
                        <div className="flex gap-2 mt-3">
                          {message.buttons.map((button, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleButtonClick(button.action)}
                              className="text-xs"
                            >
                              {button.text}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {currentStep === 'fare_result' && (
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={handleBookNow}>
                      📱 Book Now
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleNewEstimate}>
                      🔄 New Estimate
                    </Button>
                  </div>
                )}
                
                {currentStep === 'same_day_options' && (
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={() => handleButtonClick('book_same_day')}>
                      📦 Book Same-Day
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleButtonClick('same_day_estimate')}>
                      💰 Get Estimate
                    </Button>
                  </div>
                )}
                
                {currentStep === 'track_options' && (
                  <div className="flex justify-center">
                    <Button size="sm" onClick={() => handleButtonClick('track_now')}>
                      📍 Track Now
                    </Button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {renderChatInput()}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Chatbot;