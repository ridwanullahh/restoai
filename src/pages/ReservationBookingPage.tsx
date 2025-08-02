import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User, MessageSquare, ArrowLeft, Check } from 'lucide-react';
import { sdk } from '../lib/config';
import { Restaurant, Reservation, WaitlistEntry } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ReservationBookingPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'booking' | 'waitlist' | 'confirmation'>('booking');
  const [confirmationCode, setConfirmationCode] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    specialRequests: ''
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (restaurantSlug) {
      loadRestaurant();
    }
  }, [restaurantSlug]);

  useEffect(() => {
    if (selectedDate && restaurant) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, restaurant]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug && r.active === true)
        .exec();
      
      if (restaurants.length === 0) {
        navigate('/');
        return;
      }
      
      setRestaurant(restaurants[0]);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date: string) => {
    try {
      // Get existing reservations for the date
      const existingReservations = await sdk.queryBuilder<Reservation>('reservations')
        .where(r => r.restaurantId === restaurant?.id && r.date === date && r.status !== 'cancelled')
        .exec();
      
      // Generate time slots (example: 5:00 PM to 10:00 PM, every 30 minutes)
      const slots = [];
      for (let hour = 17; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 22 && minute > 0) break; // Stop at 10:00 PM
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if slot is available (simple logic - in reality, you'd consider table capacity)
          const reservationsAtTime = existingReservations.filter(r => r.time === timeString);
          const totalGuests = reservationsAtTime.reduce((sum, r) => sum + r.partySize, 0);
          
          // Assume restaurant can handle 50 guests total (you'd get this from restaurant settings)
          if (totalGuests < 50) {
            slots.push(timeString);
          }
        }
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    }
  };

  const generateConfirmationCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSubmitting(true);
    
    try {
      const code = generateConfirmationCode();
      
      const reservation = await sdk.insert<Reservation>('reservations', {
        restaurantId: restaurant.id,
        customerInfo: formData.customerInfo,
        date: formData.date,
        time: formData.time,
        partySize: formData.partySize,
        specialRequests: formData.specialRequests || undefined,
        confirmationCode: code,
        status: 'pending'
      });
      
      setConfirmationCode(code);
      setStep('confirmation');
      toast.success('Reservation request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit reservation:', error);
      toast.error('Failed to submit reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setSubmitting(true);
    
    try {
      // Get current waitlist position
      const existingWaitlist = await sdk.queryBuilder<WaitlistEntry>('waitlist')
        .where(w => w.restaurantId === restaurant.id && w.date === formData.date && w.status === 'waiting')
        .exec();
      
      const position = existingWaitlist.length + 1;
      
      await sdk.insert<WaitlistEntry>('waitlist', {
        restaurantId: restaurant.id,
        customerInfo: formData.customerInfo,
        date: formData.date,
        partySize: formData.partySize,
        position,
        estimatedWait: position * 15 // Rough estimate: 15 minutes per position
      });
      
      setStep('confirmation');
      toast.success('Added to waitlist successfully!');
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      toast.error('Failed to join waitlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow bookings up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">The restaurant you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/${restaurantSlug}`)}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-gray-600">Make a Reservation</p>
              </div>
            </div>
            <Link to={`/${restaurantSlug}/menu`}>
              <Button variant="outline">View Menu</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'booking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Table</h2>
                
                <form onSubmit={handleSubmitReservation} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        setSelectedDate(e.target.value);
                      }}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Time Selection */}
                  {formData.date && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Select Time
                      </label>
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setFormData({ ...formData, time: slot })}
                              className={`p-3 text-center border rounded-lg transition-colors ${
                                formData.time === slot
                                  ? 'bg-orange-100 border-orange-500 text-orange-700'
                                  : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                              }`}
                            >
                              {formatTime(slot)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">No available time slots for this date.</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('waitlist')}
                          >
                            Join Waitlist Instead
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Party Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Party Size
                    </label>
                    <select
                      value={formData.partySize}
                      onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                    
                    <Input
                      label="Full Name"
                      icon={<User className="w-4 h-4" />}
                      value={formData.customerInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, name: e.target.value }
                      })}
                      required
                      placeholder="Enter your full name"
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      icon={<Mail className="w-4 h-4" />}
                      value={formData.customerInfo.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, email: e.target.value }
                      })}
                      required
                      placeholder="Enter your email address"
                    />
                    
                    <Input
                      label="Phone Number"
                      type="tel"
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.customerInfo.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, phone: e.target.value }
                      })}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Any special requests, dietary restrictions, or celebrations..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!formData.date || !formData.time || submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? 'Submitting...' : 'Request Reservation'}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'waitlist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Waitlist</h2>
                <p className="text-gray-600 mb-6">
                  No tables are available for your selected date and time. 
                  Join our waitlist and we'll notify you when a table becomes available.
                </p>
                
                <form onSubmit={handleJoinWaitlist} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Party Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Party Size
                    </label>
                    <select
                      value={formData.partySize}
                      onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(size => (
                        <option key={size} value={size}>
                          {size} {size === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                    
                    <Input
                      label="Full Name"
                      icon={<User className="w-4 h-4" />}
                      value={formData.customerInfo.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, name: e.target.value }
                      })}
                      required
                      placeholder="Enter your full name"
                    />
                    
                    <Input
                      label="Email Address"
                      type="email"
                      icon={<Mail className="w-4 h-4" />}
                      value={formData.customerInfo.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, email: e.target.value }
                      })}
                      required
                      placeholder="Enter your email address"
                    />
                    
                    <Input
                      label="Phone Number"
                      type="tel"
                      icon={<Phone className="w-4 h-4" />}
                      value={formData.customerInfo.phone}
                      onChange={(e) => setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, phone: e.target.value }
                      })}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep('booking')}
                      className="flex-1"
                    >
                      Back to Booking
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? 'Joining...' : 'Join Waitlist'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {confirmationCode ? 'Reservation Requested!' : 'Added to Waitlist!'}
                </h2>
                
                {confirmationCode ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Your reservation request has been submitted successfully. 
                      You'll receive a confirmation email shortly.
                    </p>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-800 mb-2">
                        <strong>Confirmation Code:</strong>
                      </p>
                      <p className="text-2xl font-mono font-bold text-orange-900">
                        {confirmationCode}
                      </p>
                    </div>
                    
                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Reservation Details:</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {formatTime(formData.time)}</p>
                        <p><strong>Party Size:</strong> {formData.partySize} guests</p>
                        <p><strong>Name:</strong> {formData.customerInfo.name}</p>
                        <p><strong>Email:</strong> {formData.customerInfo.email}</p>
                        <p><strong>Phone:</strong> {formData.customerInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You've been added to our waitlist. We'll notify you as soon as a table becomes available.
                    </p>
                    
                    <div className="text-left bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Waitlist Details:</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}</p>
                        <p><strong>Party Size:</strong> {formData.partySize} guests</p>
                        <p><strong>Name:</strong> {formData.customerInfo.name}</p>
                        <p><strong>Email:</strong> {formData.customerInfo.email}</p>
                        <p><strong>Phone:</strong> {formData.customerInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link to={`/${restaurantSlug}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Restaurant
                    </Button>
                  </Link>
                  <Link to={`/${restaurantSlug}/menu`} className="flex-1">
                    <Button className="w-full">
                      View Menu
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReservationBookingPage;
