interface DataItem {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  level?: string;
  levels?: string;
  students?: number;
  mentors?: number;
  dailyTask?: string;
  sessions?: number;
  sessionsDone?: number;
  topic?: string;
  type?: string;
  status?: string;
  feedbackCount?: number;
  paypalOrderId?: string;
  currency?: string;
  amount?: number;
  completedAt?: string;
  isBlocked?: boolean;
  user?: {
    name: string;
    email: string;
  };
  verificationStatus?: "pending" | "approved" | "rejected";
}

interface DataTableProps {
  data: DataItem[];
  type: "user" | "mentor" | "session" | "dailyTask" | "payment";
  onBlock?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (id: string) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  limit: number;
}

const DataTable = ({
  data,
  type,
  onBlock,
  onDelete,
  onRowClick,
  page,
  setPage,
  total,
  limit,
}: DataTableProps) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "accepted":
      case "completed":
        return "bg-green-100 text-green-800";
      case "blocked":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getBlockButtonStyles = (isBlocked?: boolean) =>
    isBlocked
      ? "bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
      : "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs";

  const renderHeaders = () => {
    switch (type) {
      case "session":
        return (
          <>
            <th className="px-6 py-3">Topic</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Feedback Count</th>
            <th className="px-6 py-3">Actions</th>
          </>
        );
      case "dailyTask":
        return (
          <>
            <th className="px-6 py-3">Topic</th>
            <th className="px-6 py-3">Assigned To</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </>
        );
      case "payment":
        return (
          <>
            <th className="px-6 py-3">Paypal Order Id</th>
            <th className="px-6 py-3">Currency</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </>
        );
      case "mentor":
        return (
          <>
            <th className="px-6 py-3">Mentor</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Sessions Done</th>
            <th className="px-6 py-3">Approval</th>
            <th className="px-6 py-3">Verfication</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Details</th>
          </>
        );
      case "user":
      default:
        return (
          <>
            <th className="px-6 py-3">User Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Level</th>
            <th className="px-6 py-3">Sessions</th>
            <th className="px-6 py-3">Actions</th>
            <th className="px-6 py-3">Details</th>
          </>
        );
    }
  };

  const renderRows = (item: DataItem) => {
    switch (type) {
      case "session":
        return (
          <>
            <td className="px-6 py-4">{item.topic}</td>
            <td className="px-6 py-4">{item.type}</td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4">{item.feedbackCount}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => onRowClick?.(item.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                View
              </button>
            </td>
          </>
        );
      case "dailyTask":
        return (
          <>
            <td className="px-6 py-4">{item.dailyTask}</td>
            <td className="px-6 py-4">
              {item.user?.name ?? "-"} ({item.user?.email ?? "-"})
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status ?? "completed"}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onRowClick?.(item.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                View
              </button>
            </td>
          </>
        );
      case "payment":
        return (
          <>
            <td className="px-6 py-4">{item.paypalOrderId}</td>
            <td className="px-6 py-4">{item.currency}</td>
            <td className="px-6 py-4">₹{item.amount}</td>
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onRowClick?.(item.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
              >
                View
              </button>
            </td>
          </>
        );
      case "mentor":
        return (
          <>
            <td className="px-6 py-4">{item.name}</td>

            <td className="px-6 py-4">{item.email}</td>

            <td className="px-6 py-4">{item.sessions}</td>

            <td className="px-10 py-4 m-4 capitalize">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.verificationStatus
                )}`}
              >
                {item.verificationStatus}
              </span>
            </td>

            <td className="px-6 py-4">
              <button
                onClick={() => onRowClick?.(item.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                View Verification
              </button>
            </td>

            <td>
              <button
                onClick={() => onBlock?.(item.id)}
                className={getBlockButtonStyles(item.isBlocked)}
              >
                {item.isBlocked === true ? "UNBLOCK" : "BLOCK"}
              </button>
            </td>

            <td>
              <button
                onClick={() => onDelete?.(item.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                View
              </button>
            </td>
          </>
        );

      case "user":
      default:
        return (
          <>
            <td className="px-6 py-4">{item.name ? item.name : "-"}</td>
            <td className="px-6 py-4">{item.email}</td>
            <td className="px-6 py-4">
              {item.level ? item.level : item?.levels}
            </td>
            <td className="px-6 py-4">
              {item.sessions ? item.sessions : item.sessionsDone}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onBlock?.(item.id)}
                className={getBlockButtonStyles(item.isBlocked)}
              >
                {item.isBlocked === true ? "UNBLOCK" : "BLOCK"}
              </button>
            </td>
            <td className="px-6 py-4 text-blue-500 text-xl">
              <button onClick={() => onRowClick?.(item.id)}>
                View Details
              </button>
            </td>
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>{renderHeaders()}</tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700 border-t">
                {renderRows(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-gray-950"
        >
          Previous
        </button>
        <span className="text-sm text-gray-300">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() =>
            setPage((prev) => (prev * limit < total ? prev + 1 : prev))
          }
          disabled={page * limit >= total}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 text-gray-900"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;
