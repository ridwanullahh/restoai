import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star,
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import { SkeletonList } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'chef' | 'server' | 'host' | 'cashier' | 'cleaner';
  status: 'active' | 'inactive' | 'on-leave';
  hireDate: string;
  hourlyRate: number;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  schedule: {
    monday: { start: string; end: string; off: boolean };
    tuesday: { start: string; end: string; off: boolean };
    wednesday: { start: string; end: string; off: boolean };
    thursday: { start: string; end: string; off: boolean };
    friday: { start: string; end: string; off: boolean };
    saturday: { start: string; end: string; off: boolean };
    sunday: { start: string; end: string; off: boolean };
  };
  performance: {
    rating: number;
    reviews: number;
    punctuality: number;
  };
  avatar?: string;
}

interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed';
  hoursWorked?: number;
}

const StaffManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'server',
    hourlyRate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  });

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'manager', label: 'Manager' },
    { value: 'chef', label: 'Chef' },
    { value: 'server', label: 'Server' },
    { value: 'host', label: 'Host' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'cleaner', label: 'Cleaner' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'on-leave', label: 'On Leave' }
  ];

  useEffect(() => {
    if (currentRestaurant) {
      loadStaff();
      loadShifts();
    }
  }, [currentRestaurant]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const staffData = await sdk.queryBuilder<StaffMember>('staff')
        .where(member => member.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setStaff(staffData);
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const shiftsData = await sdk.queryBuilder<Shift>('shifts')
        .where(shift => shift.date === today)
        .exec();
      setShifts(shiftsData);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'server',
      hourlyRate: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: ''
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const staffData = {
        restaurantId: currentRestaurant.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as StaffMember['role'],
        status: 'active' as const,
        hireDate: new Date().toISOString(),
        hourlyRate: parseFloat(formData.hourlyRate),
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship
        },
        schedule: {
          monday: { start: '09:00', end: '17:00', off: false },
          tuesday: { start: '09:00', end: '17:00', off: false },
          wednesday: { start: '09:00', end: '17:00', off: false },
          thursday: { start: '09:00', end: '17:00', off: false },
          friday: { start: '09:00', end: '17:00', off: false },
          saturday: { start: '09:00', end: '17:00', off: false },
          sunday: { start: '09:00', end: '17:00', off: true }
        },
        performance: {
          rating: 5.0,
          reviews: 0,
          punctuality: 100
        }
      };

      if (editingStaff) {
        await sdk.update('staff', editingStaff.id, staffData);
        toast.success('Staff member updated successfully!');
      } else {
        await sdk.insert('staff', staffData);
        toast.success('Staff member added successfully!');
      }

      await loadStaff();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save staff member:', error);
      toast.error('Failed to save staff member');
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      hourlyRate: member.hourlyRate.toString(),
      address: member.address,
      emergencyContactName: member.emergencyContact.name,
      emergencyContactPhone: member.emergencyContact.phone,
      emergencyContactRelationship: member.emergencyContact.relationship
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (member: StaffMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} from staff?`)) return;

    try {
      await sdk.delete('staff', member.id);
      toast.success('Staff member removed successfully!');
      await loadStaff();
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      toast.error('Failed to remove staff member');
    }
  };

  const updateStatus = async (member: StaffMember, newStatus: StaffMember['status']) => {
    try {
      await sdk.update('staff', member.id, { status: newStatus });
      toast.success(`Staff status updated to ${newStatus}`);
      await loadStaff();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'chef': return 'bg-red-100 text-red-800';
      case 'server': return 'bg-blue-100 text-blue-800';
      case 'host': return 'bg-green-100 text-green-800';
      case 'cashier': return 'bg-yellow-100 text-yellow-800';
      case 'cleaner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on-leave': return 'warning';
      default: return 'default';
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const todayShifts = shifts.filter(shift => 
    staff.some(member => member.id === shift.staffId)
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        </div>
        <SkeletonList items={5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your restaurant team and schedules</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Today's Shifts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Duty Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayShifts.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.filter(s => s.status === 'on-leave').length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">
                {staff.length > 0 
                  ? (staff.reduce((sum, s) => sum + s.performance.rating, 0) / staff.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <Star className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          
          <Select
            options={roles}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          
          <Select
            options={statuses}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-4">
            {staff.length === 0 
              ? 'Start by adding your first staff member!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {staff.length === 0 && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Staff Member
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStaff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      name={member.name}
                      src={member.avatar}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleColor(member.role)} size="sm">
                          {member.role}
                        </Badge>
                        <Badge variant={getStatusColor(member.status)} size="sm">
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(member)}
                      icon={<Edit className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(member)}
                      icon={<Trash2 className="w-4 h-4" />}
                      className="text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {member.phone}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${member.hourlyRate}/hour
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Hired {new Date(member.hireDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    {member.performance.rating}/5 rating
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center space-x-2">
                      {member.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(member, 'on-leave')}
                        >
                          Set Leave
                        </Button>
                      )}
                      {member.status === 'on-leave' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(member, 'active')}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsScheduleModalOpen(true);
                        }}
                        icon={<Clock className="w-4 h-4" />}
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            
            <Select
              label="Role"
              options={roles.slice(1)} // Remove 'all' option
              value={formData.role}
              onChange={handleInputChange}
              name="role"
            />
            
            <Input
              label="Hourly Rate ($)"
              name="hourlyRate"
              type="number"
              step="0.01"
              value={formData.hourlyRate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
              />
              
              <Input
                label="Contact Phone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
              />
              
              <Input
                label="Relationship"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleInputChange}
                placeholder="e.g., Spouse, Parent"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingStaff ? 'Update' : 'Add'} Staff Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedStaff(null);
        }}
        title={`Schedule for ${selectedStaff?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Manage weekly schedule for {selectedStaff?.name}
          </p>
          
          {selectedStaff && Object.entries(selectedStaff.schedule).map(([day, schedule]) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900 w-20 capitalize">{day}</span>
                {schedule.off ? (
                  <Badge variant="error">Day Off</Badge>
                ) : (
                  <span className="text-gray-600">
                    {schedule.start} - {schedule.end}
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          ))}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsScheduleModalOpen(false);
                setSelectedStaff(null);
              }}
            >
              Close
            </Button>
            <Button>
              Save Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default StaffManagementPage;
