import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Clock, Trash2, Users, Calendar, Phone, MessageCircle, Bell, Send, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

interface PartnerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  id_proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [activeSection, setActiveSection] = useState<'applications' | 'bookings' | 'partners'>('applications');
  const [bookings, setBookings] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchBookings();
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      // Get approved partners directly from applications
      const { data: approvedApps, error: appsError } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('status', 'approved');

      if (appsError) throw appsError;

      setPartners(approvedApps || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:customer_id (name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      console.log('Attempting to delete application:', id);
      
      const { data, error } = await supabase
        .from('partner_applications')
        .delete()
        .eq('id', id)
        .select();

      console.log('Delete result:', { data, error });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      if (data && data.length === 0) {
        toast.error('No application found to delete');
        return;
      }

      toast.success('Application deleted successfully');
      fetchApplications();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ 
          status, 
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      if (status === 'approved') {
        // Move to profiles table as driver
        const app = applications.find(a => a.id === id);
        if (app) {
          await supabase.from('profiles').insert({
            name: app.name,
            email: app.email,
            phone: app.phone,
            user_type: 'driver'
          });
        }
      }

      toast.success(`Application ${status} successfully`);
      fetchApplications();
      fetchPartners(); // Refresh partners list
      setSelectedApp(null);
      setAdminNotes("");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleWhatsApp = (phone: string, booking: any) => {
    const message = `Hi! Your LoadWheels booking details:\n\nPickup: ${booking.pickup_location}\nDrop-off: ${booking.delivery_location}\nVehicle: ${booking.truck_type}\nDate: ${new Date(booking.pickup_date).toLocaleDateString()}\nTime: ${booking.pickup_time}\n\nTotal: $${booking.total_amount}\n\nThank you for choosing LoadWheels!`;
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const sendWebNotification = async (customerId: string, message: string) => {
    toast.success('Web notification sent to customer');
    console.log('Notification sent to:', customerId, message);
  };

  const sendBookingToPartners = async (bookingId: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Send WhatsApp and web notifications to all partners
      partners.forEach(partner => {
        // Send WhatsApp message
        const message = `🚛 New Booking Available!\n\nPickup: ${booking.pickup_location}\nDrop-off: ${booking.delivery_location}\nVehicle: ${booking.truck_type}\nDate: ${new Date(booking.pickup_date).toLocaleDateString()}\nAmount: $${booking.total_amount}\n\nIf your vehicle is available, please accept this booking and notify us immediately!\n\nLoadWheels Team`;
        const whatsappUrl = `https://wa.me/${partner.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      });

      const requests = partners.map(partner => ({
        booking_id: bookingId,
        partner_id: partner.id,
        status: 'sent'
      }));

      const { error } = await supabase
        .from('partner_booking_requests')
        .insert(requests);

      if (error) throw error;

      toast.success(`Booking sent to ${partners.length} partners via WhatsApp`);
      
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);
        
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sendPartnerWhatsApp = (partner: any, booking: any) => {
    const message = `🚛 Booking Request for ${partner.name}\n\nPickup: ${booking.pickup_location}\nDrop-off: ${booking.delivery_location}\nVehicle: ${booking.truck_type}\nDate: ${new Date(booking.pickup_date).toLocaleDateString()}\nTime: ${booking.pickup_time}\nAmount: $${booking.total_amount}\n\nIf available, please confirm and notify us!`;
    const whatsappUrl = `https://wa.me/${partner.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const callPartner = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const notifyPartner = (partnerId: string, partnerName: string) => {
    toast.success(`Web notification sent to ${partnerName}`);
    console.log('Partner notification sent to:', partnerId);
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    const { data } = supabase.storage.from('id-proofs').getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredApplications = applications.filter(app => app.status === activeTab);

  const getStatusCounts = () => {
    return {
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        {/* Section Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeSection === 'applications' ? 'default' : 'outline'}
            onClick={() => setActiveSection('applications')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Partner Applications
          </Button>
          <Button
            variant={activeSection === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveSection('bookings')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Vehicle Bookings
          </Button>
          <Button
            variant={activeSection === 'partners' ? 'default' : 'outline'}
            onClick={() => setActiveSection('partners')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Connected Partners ({partners.length})
          </Button>
        </div>
        
        {activeSection === 'applications' && (
          <>
            {/* Status Tabs */}
            <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pending')}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Pending ({statusCounts.pending})
          </Button>
          <Button
            variant={activeTab === 'approved' ? 'default' : 'outline'}
            onClick={() => setActiveTab('approved')}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approved ({statusCounts.approved})
          </Button>
          <Button
            variant={activeTab === 'rejected' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rejected')}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Rejected ({statusCounts.rejected})
          </Button>
        </div>
        
        <div className="grid gap-6">
          {filteredApplications.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-8 text-center text-muted-foreground">
                No {activeTab} applications found.
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => (
            <Card key={app.id} className="glass">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{app.name}</CardTitle>
                    <p className="text-muted-foreground">{app.email} • {app.phone}</p>
                  </div>
                  <Badge variant={
                    app.status === 'pending' ? 'secondary' :
                    app.status === 'approved' ? 'default' : 'destructive'
                  }>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>City:</strong> {app.city}</div>
                  <div><strong>Vehicle:</strong> {app.vehicle_type}</div>
                  <div><strong>Vehicle No:</strong> {app.vehicle_number}</div>
                  <div><strong>License:</strong> {app.license_number}</div>
                </div>
                
                {app.id_proof_url ? (
                  <div>
                    <p className="text-sm font-medium mb-2">ID Proof:</p>
                    <img 
                      src={getImageUrl(app.id_proof_url)} 
                      alt="ID Proof" 
                      className="max-h-32 rounded border cursor-pointer"
                      onClick={() => window.open(getImageUrl(app.id_proof_url), '_blank')}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'block';
                      }}
                    />
                    <div className="text-sm text-muted-foreground hidden">
                      Image failed to load. File path: {app.id_proof_url}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No ID proof uploaded
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {app.status === 'pending' && (
                    <Button
                      onClick={() => setSelectedApp(app)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  )}
                  {app.status === 'rejected' && (
                    <Button
                      onClick={() => handleDelete(app.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
          </>
        )}

        {activeSection === 'bookings' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Connected Partners - Left Side */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Connected Partners ({partners.length})
              </h3>
              
              {partners.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-4 text-center text-muted-foreground text-sm">
                    No partners available
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {partners.map((partner) => (
                    <Card key={partner.id} className="glass">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{partner.name}</h4>
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div><strong>Vehicle:</strong> {partner.vehicle_type}</div>
                            <div><strong>Number:</strong> {partner.vehicle_number}</div>
                            <div><strong>City:</strong> {partner.city}</div>
                          </div>
                          <div className="flex gap-1 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const message = `Hi ${partner.name}! New booking opportunities available. Check your dashboard!`;
                                const whatsappUrl = `https://wa.me/${partner.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }}
                              className="text-green-600 hover:bg-green-50 text-xs px-2 py-1 h-auto"
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => callPartner(partner.phone)}
                              className="text-blue-600 hover:bg-blue-50 text-xs px-2 py-1 h-auto"
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Bookings - Right Side */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold">Vehicle Bookings</h2>
              
              {bookings.length === 0 ? (
                <Card className="glass">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No bookings found.
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
                              <Calendar className="h-5 w-5 text-secondary" />
                              {booking.truck_type} - {booking.profiles?.name || 'Unknown'}
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
                            <p className="text-muted-foreground">
                              Booking ID: {booking.id.slice(0, 8)}...
                            </p>
                          </div>
                          <Badge variant={
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'completed' ? 'default' : 'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div><strong>Customer:</strong> {booking.profiles?.name || 'N/A'}</div>
                          <div><strong>Phone:</strong> {booking.contact_phone || booking.profiles?.phone || 'N/A'}</div>
                          <div><strong>Pickup:</strong> {booking.pickup_location}</div>
                          <div><strong>Delivery:</strong> {booking.delivery_location}</div>
                          <div><strong>Date:</strong> {new Date(booking.pickup_date).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {booking.pickup_time}</div>
                          {booking.service_type === 'same_day_delivery' && booking.recipient_name && (
                            <>
                              <div><strong>Recipient:</strong> {booking.recipient_name}</div>
                              <div><strong>Recipient Phone:</strong> {booking.recipient_phone || 'N/A'}</div>
                            </>
                          )}
                          <div><strong>Package:</strong> {booking.package_type || 'N/A'}</div>
                          <div><strong>Weight:</strong> {booking.estimated_weight || 'N/A'}</div>
                          {booking.package_dimensions && (
                            <div><strong>Dimensions:</strong> {booking.package_dimensions}</div>
                          )}
                          {booking.distance_km && (
                            <div><strong>Distance:</strong> {booking.distance_km} km</div>
                          )}
                        </div>
                        
                        {booking.special_instructions && (
                          <div>
                            <strong>Instructions:</strong>
                            <p className="text-muted-foreground mt-1">{booking.special_instructions}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-lg font-bold text-secondary">
                            Total: ${booking.total_amount}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {/* Communication Buttons */}
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleWhatsApp(booking.contact_phone || booking.profiles?.phone, booking)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleCall(booking.contact_phone || booking.profiles?.phone)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => sendWebNotification(booking.customer_id, `Your booking ${booking.id.slice(0, 8)} has been updated`)}
                                className="text-purple-600 hover:bg-purple-50"
                              >
                                <Bell className="h-3 w-3 mr-1" />
                                Notify
                              </Button>
                            </div>
                            
                            {/* Booking Actions */}
                            <div className="flex gap-1">
                              {booking.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => sendBookingToPartners(booking.id)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Send to Partners
                                </Button>
                              )}
                              
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    const newStatus = booking.status === 'pending' ? 'confirmed' :
                                                    booking.status === 'confirmed' ? 'in_progress' : 'completed';
                                    supabase.from('bookings')
                                      .update({ status: newStatus })
                                      .eq('id', booking.id)
                                      .then(() => {
                                        toast.success(`Status updated to ${newStatus}`);
                                        fetchBookings();
                                      });
                                  }}
                                  className="text-green-600 hover:bg-green-50"
                                >
                                  Update Status
                                </Button>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => window.open(`/track?id=${booking.id}`, '_blank')}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                Track
                              </Button>
                              
                              {booking.status === 'pending' && (
                                <Button size="sm" variant="destructive" onClick={() => {
                                  supabase.from('bookings')
                                    .update({ status: 'cancelled' })
                                    .eq('id', booking.id)
                                    .then(() => {
                                      toast.success('Booking cancelled');
                                      fetchBookings();
                                    });
                                }}>
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'partners' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Connected Partners</h2>
            
            {partners.length === 0 ? (
              <Card className="glass">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No connected partners found.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {partners.map((partner) => (
                  <Card key={partner.id} className="glass">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-secondary" />
                            {partner.name}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            Partner ID: {partner.id.slice(0, 8)}...
                          </p>
                        </div>
                        <Badge variant="default">
                          Active Partner
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Name:</strong> {partner.name}</div>
                        <div><strong>Phone:</strong> {partner.phone || 'N/A'}</div>
                        <div><strong>City:</strong> {partner.city}</div>
                        <div><strong>Vehicle Type:</strong> {partner.vehicle_type}</div>
                        <div><strong>Vehicle Number:</strong> {partner.vehicle_number}</div>
                        <div><strong>License:</strong> {partner.license_number}</div>
                        <div><strong>Joined:</strong> {new Date(partner.application_date).toLocaleDateString()}</div>
                        <div><strong>Status:</strong> <span className="text-green-600">Active Driver</span></div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Available for bookings
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const message = `Hi ${partner.name}! We have new booking opportunities available. Please check your LoadWheels partner dashboard for details. If you have vehicles available, please let us know!`;
                              const whatsappUrl = `https://wa.me/${partner.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => callPartner(partner.phone)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => notifyPartner(partner.id, partner.name)}
                            className="text-purple-600 hover:bg-purple-50"
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Notify
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedApp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Review Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{selectedApp.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedApp.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(selectedApp.id, 'approved')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(selectedApp.id, 'rejected')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
                
                <Button
                  onClick={() => setSelectedApp(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;