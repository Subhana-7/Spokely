import React from "react";
import Button from "../../../modals/Button";
import { MessageCircle, Ban, Trash2 } from "lucide-react";

interface Connection {
  id: string;
  username: string;
  email: string;
  role: string;
  sessions: number;
}

interface ConnectionsTableProps {
  connections: Connection[];
}

const ConnectionsTable: React.FC<ConnectionsTableProps> = ({ connections }) => {
  const handleBlock = (username: string) => {
    console.log("Blocking user:", username);
  };

  const handleChat = (username: string) => {
    console.log("Opening chat with:", username);
  };

  const handleRemove = (username: string) => {
    console.log("Removing user:", username);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
          <div>USERNAME</div>
          <div className="hidden md:block">ROLE</div>
          <div className="hidden md:block">SESSIONS</div>
          <div className="hidden md:block">ACTIONS</div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {connections.map((connection, index) => (
          <div
            key={connection.id}
            className={`p-6 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-gray-100 transition-colors duration-150`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <div className="font-medium text-gray-900">
                  {connection.username}
                </div>
                <div className="text-sm text-gray-500">{connection.email}</div>
              </div>

              <div className="md:block">
                <div className="text-gray-800 font-medium">
                  {connection.role}
                </div>
                <div className="md:hidden text-sm text-gray-500 mt-1">
                  {connection.sessions} sessions
                </div>
              </div>

              <div className="hidden md:block">
                <span className="text-lg font-semibold text-gray-900">
                  {connection.sessions}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-start justify-center">
                <Button
                  onClick={() => handleBlock(connection.username)}
                  className="w-auto px-3 py-1 rounded-md font-medium bg-orange-500 hover:bg-orange-600 text-white text-xs flex items-center"
                >
                  <Ban size={14} className="mr-1" />
                  Block
                </Button>

                <Button
                  onClick={() => handleChat(connection.username)}
                  className="w-auto px-3 py-1 rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white text-xs flex items-center"
                >
                  <MessageCircle size={14} className="mr-1" />
                  Chat
                </Button>

                <Button
                  onClick={() => handleRemove(connection.username)}
                  className="w-auto px-3 py-1 rounded-md font-medium bg-red-500 hover:bg-red-600 text-white text-xs flex items-center"
                >
                  <Trash2 size={14} className="mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {connections.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No connections found</div>
          <div className="text-gray-400 text-sm mt-2">
            Try adjusting your search criteria
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsTable;
