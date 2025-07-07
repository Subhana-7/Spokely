
import React, { useState } from 'react';
import DashboardHeader from '../DashBoardComponents.jsx/Header';
import ConnectionsTable from './ConnectionsTable';
import Button from '../../../modals/Button';
import  Input  from '../../../modals/Input';
import AddConnectionModal from './AddConnectionsModal';
import { Search, Plus } from 'lucide-react';

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const connections = [
    {
      id: 1,
      username: 'alice_smith',
      email: 'alice@example.com',
      avatar: '/placeholder.svg',
      role: 'Mentor',
      sessions: 23
    },
    {
      id: 2,
      username: 'bob_wilson',
      email: 'bob@example.com',
      avatar: '/placeholder.svg',
      role: 'Peer',
      sessions: 15
    },
    {
      id: 3,
      username: 'clara_jones',
      email: 'clara@example.com',
      avatar: '/placeholder.svg',
      role: 'Peer',
      sessions: 8
    },
    {
      id: 4,
      username: 'david_brown',
      email: 'david@example.com',
      avatar: '/placeholder.svg',
      role: 'Mentor',
      sessions: 31
    }
  ];

  const filteredConnections = connections.filter(connection =>
    connection.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
  <>
    {/* Blurred background when modal is open */}
    <div className={`min-h-screen bg-sky-100 transition-all duration-300 ${isAddModalOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-lime-200 rounded-2xl p-8 shadow-lg">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800 tracking-wide">CONNECTIONS</h1>

            <div className="relative">
              <Button 
                variant="secondary" 
                className="bg-olive-600 hover:bg-olive-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={20} className="mr-2" />
                Add Connection
              </Button>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">1</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by username....."
              value={searchTerm}
              onChange={(e) => setSearchTerm('e.target.value')}
              className="pl-10 w-full bg-white border-0 rounded-xl py-3 text-base shadow-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            />
          </div>

          {/* Connections Table */}
          <ConnectionsTable connections={filteredConnections} />
        </div>
      </div>
    </div>

    {/* Modal on top */}
    <AddConnectionModal 
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
    />
  </>
);
};

export default Connections;
