import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../modals/Button";
import {
  MessageCircle,
  Ban,
  Trash2,
  User,
  Users,
  Clock,
  Mail,
  CheckCircle,
} from "lucide-react";

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
  console.log(connections);
  const navigate = useNavigate();

  const handleBlock = (username: string) =>
    console.log("Blocking user:", username);
  const handleRemove = (username: string) =>
    console.log("Removing user:", username);

  const handleChat = (id: string, role: string) => {
    const roleLower = role.toLowerCase();
    navigate(`/user/chat/${id}?role=${roleLower}`);
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200/50">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <User size={16} /> Contact
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Users size={16} /> Role
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Clock size={16} /> Sessions
          </div>
          <div className="hidden md:block">Status</div>
          <div className="hidden md:block text-center">Actions</div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {connections.map((connection, index) => (
          <div
            key={connection.id}
            className={`p-8 ${
              index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"
            } hover:bg-blue-50/40 transition-all duration-300 group`}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              <Link
                to={`/user-profile/${connection.id}`}
                className="flex items-center gap-4 hover:opacity-80 transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {connection.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {connection.username}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail size={12} />
                    {connection.email}
                  </div>
                </div>
              </Link>

              <div className="md:block">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    connection.role === "Mentor"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {connection.role}
                </span>
                <div className="md:hidden text-sm text-gray-500 mt-2">
                  {connection.sessions} sessions completed
                </div>
              </div>

              <div className="hidden md:block">
                <div className="text-2xl font-bold text-gray-900">
                  {connection.sessions}
                </div>
                <div className="text-sm text-gray-500">sessions</div>
              </div>

              <div className="hidden md:block">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle size={12} /> Active
                </span>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-center justify-start">
                <Button
                  onClick={() => handleChat(connection.id, connection.role)}
                  variant="primary"
                  className="px-4 py-2 text-sm bg-black"
                >
                  <MessageCircle size={16} className="mr-2" /> Chat
                </Button>
                <Button
                  onClick={() => handleBlock(connection.username)}
                  variant="warning"
                  className="px-4 py-2 text-sm"
                >
                  <Ban size={16} className="mr-2" /> Block
                </Button>
                <Button
                  onClick={() => handleRemove(connection.username)}
                  variant="danger"
                  className="px-4 py-2 text-sm"
                >
                  <Trash2 size={16} className="mr-2" /> Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {connections.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Users size={32} className="text-gray-400" />
          </div>
          <div className="text-gray-500 text-xl font-medium mb-2">
            No connections found
          </div>
          <div className="text-gray-400 text-sm">
            Try adjusting your search criteria or add new connections
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsTable;
