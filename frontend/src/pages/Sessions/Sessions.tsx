import { useEffect, useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import Button from '../../modals/Button';
import Input from '../../modals/Input';
import Card from '../../components/common/Cards';
import Badge from '../../components/common/Badge';
import DashboardHeader from '../user/DashBoardComponents.jsx/Header';
import { getSessions } from '../../services/sessionService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Sessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  function hanldeScheduleButton() {
    try {
      navigate('/user/schedule-session')
    } catch (error) {
      console.log('error navigating schedule button',error)
    }
  }

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await getSessions();
        const data = res.data?.sessions || res.data;

        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.warn("Unexpected session data:", data);
          setSessions([]); 
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load sessions');
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) =>
    session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sessions</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by topic or type..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                All
              </button>
              <Button variant="primary" className="bg-blue-500 hover:bg-blue-600">
                Public Sessions
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">No sessions found.</p>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session._id} className="relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={session.status}>
                    {session.status?.toUpperCase()}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-lime-600 font-medium mb-2">
                    {session.startTime ? new Date(session.startTime).toLocaleString() : 'No time set'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {session.topic}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {session.type}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {session.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="primary"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm py-2"
                    >
                      {session.status === 'completed' ? 'View Session' : 'Join Session'}
                    </Button>
                    <Button variant="secondary" className="flex-1 text-sm py-2">
                      {session.status === 'completed' ? 'View Details' : 'Reschedule'}
                    </Button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Members:</strong> {session.participants?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <button onClick={hanldeScheduleButton} className="fixed bottom-8 right-8 bg-lime-500 hover:bg-lime-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Sessions;
