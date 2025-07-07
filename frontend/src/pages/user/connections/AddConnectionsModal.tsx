import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import Input from '../../../modals/Input';
import Button from '../../../modals/Button';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const suggestedUsers = [
    {
      id: 5,
      username: 'emily_davis',
      email: 'emily@example.com',
      role: 'Peer',
      isOnline: true
    },
    {
      id: 6,
      username: 'frank_miller',
      email: 'frank@example.com',
      role: 'Mentor',
      isOnline: false
    },
    {
      id: 7,
      username: 'grace_wilson',
      email: 'grace@example.com',
      role: 'Peer',
      isOnline: true
    }
  ];

  const filteredUsers = suggestedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddConnection = (username: string) => {
    console.log('Adding connection:', username);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-lime-200 rounded-2xl max-w-2xl w-full mx-4 relative animate-scale-in shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-lime-300">
          <h2 className="text-2xl font-bold text-gray-800 tracking-wide">ADD NEW CONNECTION</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-lime-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm('e.target.value')}
              className="pl-10 w-full bg-white border-0 rounded-xl py-3 text-base shadow-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>

          {/* Suggested Connections */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                SUGGESTED CONNECTIONS
              </h3>
            </div>

            <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-600 mt-1">{user.role}</div>
                    </div>
                    <Button
                      onClick={() => handleAddConnection(user.username)}
                      className="w-auto px-4 py-2 rounded-md font-medium bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">No users found</div>
                <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="w-auto px-6 py-2 rounded-md font-medium bg-gray-500 hover:bg-gray-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddConnectionModal;
