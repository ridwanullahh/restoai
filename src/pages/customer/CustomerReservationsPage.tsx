import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { sdk } from '../../lib/config';
import { Customer, Reservation } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { SkeletonList } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

interface CustomerReservationsPageProps {
  customer: Customer | null;
}

const CustomerReservationsPage: React.FC<CustomerReservationsPageProps> = ({ customer }) => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (customer) {
      loadReservations();
    }
  }, [customer]);

  const loadReservations = async () => {
    try {
      setLoading(true);

      const reservationsData = await sdk.queryBuilder<Reservation>('reservations')
        .where(r => r.customerInfo.email === customer?.email)
        .sort('date', 'desc')
        .exec();

      // Add real-time status updates for upcoming reservations
      const now = new Date();
      const updatedReservations = reservationsData.map(reservation => {
        const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
        const hoursUntil = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Auto-update status based on time
        if (hoursUntil < 0 && reservation.status === 'confirmed') {
          // Past reservation that wasn't updated
          return { ...reservation, status: 'completed' as const };
        }

        return reservation;
      });

      setReservations(updatedReservations);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    
    try {
      setCancelling(true);
      
      await sdk.update('reservations', selectedReservation.id, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Reservation cancelled successfully');
      setIsCancelModalOpen(false);
      setSelectedReservation(null);
      await loadReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      toast.error('Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'seated': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'seated': return <Users className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'no-show': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const isUpcoming = (reservation: Reservation) => {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
    return reservationDateTime > new Date() && reservation.status !== 'cancelled';
  };

  const canCancel = (reservation: Reservation) => {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
    const hoursUntilReservation = (reservationDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilReservation > 2 && (reservation.status === 'pending' || reservation.status === 'confirmed');
  };

  const canModify = (reservation: Reservation) => {
    const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
    const hoursUntilReservation = (reservationDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilReservation > 24 && (reservation.status === 'pending' || reservation.status === 'confirmed');
  };

  const upcomingReservations = reservations.filter(isUpcoming);
  const pastReservations = reservations.filter(r => !isUpcoming(r));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        </div>
        <SkeletonList items={5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-600">Manage your table reservations</p>
        </div>
        <Link to={`/${restaurantSlug}/reservations`}>
          <Button icon={<Plus className="w-5 h-5" />}>
            New Reservation
          </Button>
        </Link>
      </div>

      {/* Upcoming Reservations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Reservations ({upcomingReservations.length})
        </h2>
        
        {upcomingReservations.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming reservations</h3>
            <p className="text-gray-600 mb-4">Book a table to enjoy our delicious food!</p>
            <Link to={`/${restaurantSlug}/reservations`}>
              <Button>Make Reservation</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="border-l-4 border-l-orange-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(reservation.date)}
                          </h3>
                          <Badge 
                            variant={getStatusColor(reservation.status)}
                            icon={getStatusIcon(reservation.status)}
                          >
                            {reservation.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatTime(reservation.time)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {reservation.partySize} guests
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {reservation.confirmationCode}
                          </div>
                        </div>
                        
                        {reservation.specialRequests && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Special Requests:</strong> {reservation.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
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
                        
                        {canModify(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit className="w-4 h-4" />}
                          >
                            Modify
                          </Button>
                        )}
                        
                        {canCancel(reservation) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setIsCancelModalOpen(true);
                            }}
                            icon={<Trash2 className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Reservations ({pastReservations.length})
          </h2>
          
          <div className="space-y-4">
            {pastReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="opacity-75">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(reservation.date)}
                          </h3>
                          <Badge 
                            variant={getStatusColor(reservation.status)}
                            icon={getStatusIcon(reservation.status)}
                          >
                            {reservation.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatTime(reservation.time)}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {reservation.partySize} guests
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {reservation.confirmationCode}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
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
                        
                        <Link to={`/${restaurantSlug}/reservations`}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            Book Again
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
        size="lg"
      >
        {selectedReservation && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {formatDate(selectedReservation.date)}
              </h3>
              <p className="text-lg text-gray-600">
                {formatTime(selectedReservation.time)} • {selectedReservation.partySize} guests
              </p>
              <Badge 
                variant={getStatusColor(selectedReservation.status)}
                icon={getStatusIcon(selectedReservation.status)}
                size="lg"
                className="mt-2"
              >
                {selectedReservation.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedReservation.customerInfo.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedReservation.customerInfo.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedReservation.customerInfo.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Reservation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Confirmation: {selectedReservation.confirmationCode}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Created: {new Date(selectedReservation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedReservation.specialRequests && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Special Requests</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedReservation.specialRequests}</p>
                </div>
              </div>
            )}
            
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
              
              {canCancel(selectedReservation) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsCancelModalOpen(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Reservation
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedReservation(null);
        }}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel your reservation for{' '}
            <strong>
              {selectedReservation && formatDate(selectedReservation.date)} at{' '}
              {selectedReservation && formatTime(selectedReservation.time)}
            </strong>
            ?
          </p>
          
          <p className="text-sm text-gray-600">
            This action cannot be undone. You'll need to make a new reservation if you change your mind.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelModalOpen(false);
                setSelectedReservation(null);
              }}
            >
              Keep Reservation
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelReservation}
              disabled={cancelling}
              className="text-red-600 hover:text-red-700"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomerReservationsPage;
