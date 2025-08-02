import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, Check, X, AlertCircle, Search, Filter } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { Reservation, WaitlistEntry } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const ReservationsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reservations
      const reservationsData = await sdk.queryBuilder<Reservation>('reservations')
        .where(r => r.restaurantId === currentRestaurant?.id)
        .sort('date', 'desc')
        .exec();
      setReservations(reservationsData);
      
      // Load waitlist
      const waitlistData = await sdk.queryBuilder<WaitlistEntry>('waitlist')
        .where(w => w.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .exec();
      setWaitlist(waitlistData);
    } catch (error) {
      console.error('Failed to load reservations data:', error);
      toast.error('Failed to load reservations data');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: Reservation['status']) => {
    try {
      await sdk.update('reservations', reservationId, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      toast.success(`Reservation ${status} successfully!`);
      await loadData();
    } catch (error) {
      console.error('Failed to update reservation status:', error);
      toast.error('Failed to update reservation status');
    }
  };

  const updateWaitlistStatus = async (waitlistId: string, status: WaitlistEntry['status']) => {
    try {
      await sdk.update('waitlist', waitlistId, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      toast.success(`Waitlist entry ${status} successfully!`);
      await loadData();
    } catch (error) {
      console.error('Failed to update waitlist status:', error);
      toast.error('Failed to update waitlist status');
    }
  };

  const assignTable = async (reservationId: string, tableNumber: string) => {
    try {
      await sdk.update('reservations', reservationId, {
        tableNumber,
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Table assigned successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to assign table:', error);
      toast.error('Failed to assign table');
    }
  };

  const sendReminder = async (reservation: Reservation) => {
    try {
      // In a real app, this would send an email/SMS reminder
      await sdk.update('reservations', reservation.id, {
        reminderSent: true,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Reminder sent successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to send reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  const getFilteredReservations = () => {
    let filtered = reservations;
    
    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(r => r.date === today);
        break;
      case 'tomorrow':
        filtered = filtered.filter(r => r.date === tomorrow);
        break;
      case 'week':
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(r => r.date >= today && r.date <= weekFromNow);
        break;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerInfo.phone.includes(searchTerm) ||
        r.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredWaitlist = () => {
    let filtered = waitlist;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.customerInfo.phone.includes(searchTerm)
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'seated': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      case 'waiting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const filteredReservations = getFilteredReservations();
  const filteredWaitlist = getFilteredWaitlist();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reservations & Waitlist</h1>
          <p className="text-gray-600">Manage table reservations and waitlist entries.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{reservations.length}</span> reservations
            <span className="mx-2">•</span>
            <span className="font-medium">{waitlist.length}</span> waitlist entries
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'reservations'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reservations ({reservations.length})
        </button>
        <button
          onClick={() => setActiveTab('waitlist')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'waitlist'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Waitlist ({waitlist.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or confirmation code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {activeTab === 'reservations' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </>
              ) : (
                <>
                  <option value="waiting">Waiting</option>
                  <option value="seated">Seated</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
          
          {activeTab === 'reservations' && (
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'reservations' ? (
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-600">
                {reservations.length === 0 
                  ? 'No reservations have been made yet.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </Card>
          ) : (
            filteredReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.customerInfo.name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                          {reservation.status === 'pending' && (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(reservation.time)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{reservation.partySize} guests</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{reservation.customerInfo.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {reservation.customerInfo.email}
                          </div>
                          <div>
                            Confirmation: {reservation.confirmationCode}
                          </div>
                          {reservation.tableNumber && (
                            <div>
                              Table: {reservation.tableNumber}
                            </div>
                          )}
                        </div>
                        
                        {reservation.specialRequests && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>Special Requests:</strong> {reservation.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(reservation.createdAt)}
                        {reservation.reminderSent && (
                          <span className="ml-4 text-green-600">• Reminder sent</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              icon={<Check className="w-4 h-4" />}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              icon={<X className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        
                        {reservation.status === 'confirmed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'seated')}
                            >
                              Mark Seated
                            </Button>
                            {!reservation.reminderSent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => sendReminder(reservation)}
                              >
                                Send Reminder
                              </Button>
                            )}
                          </>
                        )}
                        
                        {reservation.status === 'seated' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          >
                            Mark Completed
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWaitlist.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No waitlist entries found</h3>
              <p className="text-gray-600">
                {waitlist.length === 0 
                  ? 'No customers are currently on the waitlist.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </Card>
          ) : (
            filteredWaitlist.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.customerInfo.name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                          <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Position #{entry.position}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(entry.date)}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{entry.partySize} guests</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{entry.customerInfo.phone}</span>
                          </div>
                          {entry.estimatedWait && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{entry.estimatedWait} min wait</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {entry.customerInfo.email}
                          </div>
                          <div>
                            Added: {formatDate(entry.createdAt)}
                          </div>
                          {entry.notificationSent && (
                            <span className="text-green-600">• Notified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        {entry.status === 'waiting' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateWaitlistStatus(entry.id, 'seated')}
                              icon={<Check className="w-4 h-4" />}
                            >
                              Seat Now
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateWaitlistStatus(entry.id, 'cancelled')}
                              icon={<X className="w-4 h-4" />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Reservation Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedReservation(null);
        }}
        title="Reservation Details"
      >
        {selectedReservation && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <p className="text-gray-900">{selectedReservation.customerInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReservation.status)}`}>
                  {selectedReservation.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <p className="text-gray-900">
                  {formatDate(selectedReservation.date)} at {formatTime(selectedReservation.time)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Size
                </label>
                <p className="text-gray-900">{selectedReservation.partySize} guests</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{selectedReservation.customerInfo.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{selectedReservation.customerInfo.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmation Code
                </label>
                <p className="text-gray-900 font-mono">{selectedReservation.confirmationCode}</p>
              </div>
              {selectedReservation.tableNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <p className="text-gray-900">{selectedReservation.tableNumber}</p>
                </div>
              )}
            </div>
            
            {selectedReservation.specialRequests && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <p className="text-gray-900">{selectedReservation.specialRequests}</p>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                <p>Created: {formatDate(selectedReservation.createdAt)}</p>
                {selectedReservation.updatedAt && (
                  <p>Last updated: {formatDate(selectedReservation.updatedAt)}</p>
                )}
                {selectedReservation.reminderSent && (
                  <p className="text-green-600">Reminder sent</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedReservation(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ReservationsPage;
