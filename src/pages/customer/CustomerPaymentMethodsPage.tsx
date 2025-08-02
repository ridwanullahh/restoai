import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Edit, Shield } from 'lucide-react';
import { Customer } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

interface CustomerPaymentMethodsPageProps {
  customer: Customer | null;
}

const CustomerPaymentMethodsPage: React.FC<CustomerPaymentMethodsPageProps> = ({ customer }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: ''
  });

  const getCardIcon = (brand: string) => {
    return <CreditCard className="w-6 h-6" />;
  };

  const handleAddCard = () => {
    // In a real app, this would integrate with a payment processor like Stripe
    console.log('Adding new card:', newCard);
    setIsAddModalOpen(false);
    setNewCard({ number: '', expiryMonth: '', expiryYear: '', cvc: '', name: '' });
  };

  const handleDeleteCard = (cardId: string) => {
    setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
  };

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(prev => 
      prev.map(card => ({ ...card, isDefault: card.id === cardId }))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600">Manage your saved payment methods</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Payment Method
        </Button>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Your payment information is secure</h3>
              <p className="text-sm text-blue-700">
                We use industry-standard encryption to protect your payment details.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <Card className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
          <p className="text-gray-600 mb-4">Add a payment method to make ordering easier</p>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Payment Method</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getCardIcon(method.brand)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {method.brand} •••• {method.last4}
                          </h3>
                          {method.isDefault && (
                            <Badge variant="success" size="sm">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(method.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                        disabled={method.isDefault}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Payment Method Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Payment Method"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Cardholder Name"
            value={newCard.name}
            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            placeholder="John Doe"
            required
          />
          
          <Input
            label="Card Number"
            value={newCard.number}
            onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
            placeholder="1234 5678 9012 3456"
            required
          />
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Expiry Month"
              value={newCard.expiryMonth}
              onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
              placeholder="MM"
              required
            />
            
            <Input
              label="Expiry Year"
              value={newCard.expiryYear}
              onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
              placeholder="YYYY"
              required
            />
            
            <Input
              label="CVC"
              value={newCard.cvc}
              onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
              placeholder="123"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCard}>
              Add Payment Method
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomerPaymentMethodsPage;
