import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DollarSign, Calendar, Users, Award, Upload, X, FileImage } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Partner = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
  });
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setIdProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setIdProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setIdProofFile(null);
    setIdProofPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProofFile) {
      toast.error("Please upload your driver's ID proof");
      return;
    }

    try {
      let idProofUrl = null;
      
      // Try to upload ID proof image
      try {
        const fileExt = idProofFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Attempting to upload file:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('id-proofs')
          .upload(fileName, idProofFile);

        if (uploadError) {
          console.error('Storage upload failed:', uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          // Continue without file upload
        } else {
          idProofUrl = uploadData.path;
          console.log('File uploaded successfully:', idProofUrl);
          toast.success('ID proof uploaded successfully!');
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        toast.error('Storage not configured properly');
      }

      // Submit application
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          vehicle_type: formData.vehicleType,
          vehicle_number: formData.vehicleNumber,
          license_number: formData.licenseNumber,
          id_proof_url: idProofUrl
        });

      if (error) throw error;

      console.log('Submitting application with ID proof URL:', idProofUrl);
      toast.success("Application submitted! We'll review it within 2-3 business days.");
      // Reset form
      setFormData({
        name: "", email: "", phone: "", city: "",
        vehicleType: "", vehicleNumber: "", licenseNumber: ""
      });
      removeFile();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn More",
      description: "Only 2% platform fee - keep 98% of your earnings",
    },
    {
      icon: Calendar,
      title: "Flexible Schedule",
      description: "Work on your own terms and set your availability",
    },
    {
      icon: Users,
      title: "Growing Network",
      description: "Access to thousands of customers needing transport",
    },
    {
      icon: Award,
      title: "Support & Training",
      description: "Dedicated partner support and onboarding assistance",
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
              Become a Delivery Partner
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Join our network of professional delivery partners and grow your business with LoadWheels.
              Fair pricing, flexible hours, and steady work.
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of successful delivery partners earning more with LoadWheels
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <Card key={benefit.title} className="glass-hover text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-lg bg-secondary/10">
                        <benefit.icon className="h-8 w-8 text-secondary" />
                      </div>
                    </div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Registration Form */}
            <Card className="max-w-3xl mx-auto glass animate-fade-in">
              <CardHeader>
                <CardTitle>Partner Registration</CardTitle>
                <CardDescription>
                  Fill out the form below to start your journey as a LoadWheels partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Your city"
                        value={formData.city}
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
                        <SelectValue placeholder="Select your vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="3-wheeler">3 Wheeler</SelectItem>
                        <SelectItem value="tata-ace">Tata Ace</SelectItem>
                        <SelectItem value="e-loader">E Loader</SelectItem>
                        <SelectItem value="pickup-8ft">Pickup 8ft</SelectItem>
                        <SelectItem value="pickup-14ft">Pickup 14ft</SelectItem>
                        <SelectItem value="tata-407">Tata 407</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Registration Number</Label>
                      <Input
                        id="vehicleNumber"
                        name="vehicleNumber"
                        placeholder="ABC-1234"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">Driver's License Number</Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        placeholder="DL-123456789"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idProof">Driver's ID Proof *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-4">
                      {!idProofPreview ? (
                        <>
                          <div className="flex justify-center">
                            <Upload className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Upload Driver's License or ID</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('idProof')?.click()}
                          >
                            Choose File
                          </Button>
                          <input
                            id="idProof"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <img
                              src={idProofPreview}
                              alt="ID Proof Preview"
                              className="max-h-32 rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={removeFile}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                            <FileImage className="h-4 w-4" />
                            <span>{idProofFile?.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold">Platform Fee Structure</h4>
                    <p className="text-sm text-muted-foreground">
                      LoadWheels charges only a 2% platform fee on each completed trip. This means you keep 98% of your earnings!
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-glow"
                    size="lg"
                  >
                    Submit Application
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to our terms and conditions. Our team will review your application and contact you within 2-3 business days.
                  </p>
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

export default Partner;
