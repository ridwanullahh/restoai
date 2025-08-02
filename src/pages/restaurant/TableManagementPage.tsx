import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Timer,
  Coffee,
  Utensils
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out-of-order';
  section: string;
  position: { x: number; y: number };
  currentReservation?: {
    id: string;
    customerName: string;
    partySize: number;
    startTime: string;
    estimatedDuration: number;
  };
  lastCleaned?: string;
  notes?: string;
}

interface TableStats {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  turnoverRate: number;
  avgOccupancyTime: number;
}

const TableManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [tables, setTables] = useState<Table[]>([]);
  const [stats, setStats] = useState<TableStats>({
    totalTables: 0,
    availableTables: 0,
    occupiedTables: 0,
    reservedTables: 0,
    turnoverRate: 0,
    avgOccupancyTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'floor'>('grid');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    section: '',
    notes: ''
  });

  const sections = ['dining-room', 'patio', 'bar', 'private-room'];
  const statuses = ['available', 'occupied', 'reserved', 'cleaning', 'out-of-order'];

  useEffect(() => {
    if (currentRestaurant) {
      loadTables();
      
      // Refresh data every 30 seconds
      const interval = setInterval(loadTables, 30000);
      return () => clearInterval(interval);
    }
  }, [currentRestaurant]);

  const loadTables = async () => {
    try {
      setLoading(true);
      
      // Load tables
      const tablesData = await sdk.queryBuilder<Table>('tables')
        .where(table => table.restaurantId === currentRestaurant?.id)
        .sort('number')
        .exec();

      // Load current reservations to update table status
      const today = new Date().toISOString().split('T')[0];
      const reservations = await sdk.queryBuilder('reservations')
        .where((reservation: any) => 
          reservation.restaurantId === currentRestaurant?.id &&
          reservation.date === today &&
          ['confirmed', 'seated'].includes(reservation.status)
        )
        .exec();

      // Update tables with current reservation info
      const updatedTables = tablesData.map(table => {
        const currentReservation = reservations.find((r: any) => r.tableNumber === table.number);
        
        if (currentReservation) {
          const reservationTime = new Date(`${currentReservation.date}T${currentReservation.time}`);
          const now = new Date();
          const isCurrentlyReserved = Math.abs(now.getTime() - reservationTime.getTime()) < 30 * 60 * 1000; // 30 minutes window
          
          return {
            ...table,
            status: currentReservation.status === 'seated' ? 'occupied' : 
                   isCurrentlyReserved ? 'reserved' : table.status,
            currentReservation: currentReservation.status === 'seated' || isCurrentlyReserved ? {
              id: currentReservation.id,
              customerName: currentReservation.customerInfo.name,
              partySize: currentReservation.partySize,
              startTime: currentReservation.time,
              estimatedDuration: 90 // minutes
            } : undefined
          };
        }
        
        return table;
      });

      setTables(updatedTables);

      // Calculate stats
      const totalTables = updatedTables.length;
      const availableTables = updatedTables.filter(t => t.status === 'available').length;
      const occupiedTables = updatedTables.filter(t => t.status === 'occupied').length;
      const reservedTables = updatedTables.filter(t => t.status === 'reserved').length;

      setStats({
        totalTables,
        availableTables,
        occupiedTables,
        reservedTables,
        turnoverRate: 3.2, // Calculate from historical data
        avgOccupancyTime: 75 // Calculate from historical data
      });

    } catch (error) {
      console.error('Failed to load tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, newStatus: Table['status']) => {
    try {
      await sdk.update('tables', tableId, { 
        status: newStatus,
        lastCleaned: newStatus === 'available' ? new Date().toISOString() : undefined
      });
      
      toast.success(`Table status updated to ${newStatus}`);
      await loadTables();
    } catch (error) {
      console.error('Failed to update table status:', error);
      toast.error('Failed to update table status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const tableData = {
        restaurantId: currentRestaurant.id,
        number: formData.number,
        capacity: parseInt(formData.capacity),
        section: formData.section,
        status: 'available' as const,
        position: { x: Math.random() * 800, y: Math.random() * 600 }, // Random position for floor plan
        notes: formData.notes
      };

      if (editingTable) {
        await sdk.update('tables', editingTable.id, tableData);
        toast.success('Table updated successfully!');
      } else {
        await sdk.insert('tables', tableData);
        toast.success('Table added successfully!');
      }

      await loadTables();
      setIsAddTableModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save table:', error);
      toast.error('Failed to save table');
    }
  };

  const resetForm = () => {
    setFormData({ number: '', capacity: '', section: '', notes: '' });
    setEditingTable(null);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity.toString(),
      section: table.section,
      notes: table.notes || ''
    });
    setIsAddTableModalOpen(true);
  };

  const handleDelete = async (table: Table) => {
    if (!confirm(`Are you sure you want to delete Table ${table.number}?`)) return;

    try {
      await sdk.delete('tables', table.id);
      toast.success('Table deleted successfully!');
      await loadTables();
    } catch (error) {
      console.error('Failed to delete table:', error);
      toast.error('Failed to delete table');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'cleaning': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'out-of-order': return 'bg-gray-100 border-gray-300 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Users className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'cleaning': return <Coffee className="w-4 h-4" />;
      case 'out-of-order': return <AlertCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSection = sectionFilter === 'all' || table.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSection && matchesStatus;
  });

  const getOccupancyDuration = (startTime: string) => {
    const start = new Date(`${new Date().toISOString().split('T')[0]}T${startTime}`);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    return minutes;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600">Monitor and manage restaurant seating</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'floor' ? 'default' : 'outline'}
              onClick={() => setViewMode('floor')}
              size="sm"
            >
              Floor Plan
            </Button>
          </div>
          <Button 
            onClick={() => setIsAddTableModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Table
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Tables</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.availableTables}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Occupied</p>
            <p className="text-2xl font-bold text-red-600">{stats.occupiedTables}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Reserved</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.reservedTables}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
            <p className="text-2xl font-bold text-blue-600">{stats.turnoverRate}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
            <p className="text-2xl font-bold text-purple-600">{stats.avgOccupancyTime}m</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <Select
            options={[
              { value: 'all', label: 'All Sections' },
              ...sections.map(s => ({ value: s, label: s.replace('-', ' ').toUpperCase() }))
            ]}
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          />
          
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              ...statuses.map(s => ({ value: s, label: s.replace('-', ' ').toUpperCase() }))
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Tables Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                hover 
                className={`border-2 ${getStatusColor(table.status)} cursor-pointer`}
                onClick={() => {
                  setSelectedTable(table);
                  setIsTableModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Table {table.number}</h3>
                    <p className="text-sm text-gray-600">{table.section.replace('-', ' ')}</p>
                    <div className="flex items-center mt-2">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{table.capacity} seats</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(table.status)} icon={getStatusIcon(table.status)}>
                      {table.status}
                    </Badge>
                  </div>
                </div>

                {table.currentReservation && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                    <p className="font-medium text-gray-900">{table.currentReservation.customerName}</p>
                    <p className="text-sm text-gray-600">
                      {table.currentReservation.partySize} guests • 
                      {table.status === 'occupied' && 
                        ` ${getOccupancyDuration(table.currentReservation.startTime)}m occupied`
                      }
                      {table.status === 'reserved' && 
                        ` Reserved for ${table.currentReservation.startTime}`
                      }
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {table.status === 'occupied' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'cleaning');
                      }}
                      className="flex-1"
                      variant="outline"
                    >
                      Clear Table
                    </Button>
                  )}
                  
                  {table.status === 'cleaning' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'available');
                      }}
                      className="flex-1"
                    >
                      Mark Clean
                    </Button>
                  )}
                  
                  {table.status === 'available' && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'occupied');
                      }}
                      className="flex-1"
                    >
                      Seat Guests
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(table);
                    }}
                    icon={<Edit className="w-4 h-4" />}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Floor Plan View */}
      {viewMode === 'floor' && (
        <Card className="p-8">
          <div className="relative bg-gray-50 rounded-lg" style={{ height: '600px', width: '100%' }}>
            <div className="absolute inset-0 p-4">
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  className={`absolute w-16 h-16 rounded-lg border-2 ${getStatusColor(table.status)} flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow`}
                  style={{
                    left: `${(table.position.x / 800) * 100}%`,
                    top: `${(table.position.y / 600) * 100}%`
                  }}
                  onClick={() => {
                    setSelectedTable(table);
                    setIsTableModalOpen(true);
                  }}
                >
                  <div className="text-center">
                    <p className="text-xs font-bold">{table.number}</p>
                    <p className="text-xs">{table.capacity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Table Details Modal */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setSelectedTable(null);
        }}
        title={`Table ${selectedTable?.number}`}
        size="lg"
      >
        {selectedTable && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Capacity</h3>
                <p className="text-gray-600">{selectedTable.capacity} guests</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Section</h3>
                <p className="text-gray-600">{selectedTable.section.replace('-', ' ')}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Status</h3>
                <Badge className={getStatusColor(selectedTable.status)} icon={getStatusIcon(selectedTable.status)}>
                  {selectedTable.status}
                </Badge>
              </div>
              {selectedTable.lastCleaned && (
                <div>
                  <h3 className="font-medium text-gray-900">Last Cleaned</h3>
                  <p className="text-gray-600">
                    {new Date(selectedTable.lastCleaned).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {selectedTable.currentReservation && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Current Reservation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedTable.currentReservation.customerName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedTable.currentReservation.partySize} guests • {selectedTable.currentReservation.startTime}
                  </p>
                  {selectedTable.status === 'occupied' && (
                    <p className="text-sm text-gray-600 mt-1">
                      Occupied for {getOccupancyDuration(selectedTable.currentReservation.startTime)} minutes
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedTable.notes && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900">Notes</h3>
                <p className="text-gray-600">{selectedTable.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsTableModalOpen(false);
                  setSelectedTable(null);
                }}
              >
                Close
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  handleEdit(selectedTable);
                  setIsTableModalOpen(false);
                }}
                icon={<Edit className="w-4 h-4" />}
              >
                Edit Table
              </Button>
              
              {selectedTable.status === 'occupied' && (
                <Button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'cleaning');
                    setIsTableModalOpen(false);
                  }}
                >
                  Clear Table
                </Button>
              )}
              
              {selectedTable.status === 'cleaning' && (
                <Button
                  onClick={() => {
                    updateTableStatus(selectedTable.id, 'available');
                    setIsTableModalOpen(false);
                  }}
                >
                  Mark Clean
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Table Modal */}
      <Modal
        isOpen={isAddTableModalOpen}
        onClose={() => {
          setIsAddTableModalOpen(false);
          resetForm();
        }}
        title={editingTable ? 'Edit Table' : 'Add Table'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Table Number"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
            />
            
            <Input
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </div>
          
          <Select
            label="Section"
            options={sections.map(s => ({ value: s, label: s.replace('-', ' ').toUpperCase() }))}
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          />
          
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special notes about this table..."
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddTableModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTable ? 'Update' : 'Add'} Table
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default TableManagementPage;
