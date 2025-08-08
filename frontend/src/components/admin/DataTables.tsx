import Button from "../../modals/Button";

interface DataItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level?: string;
  students?: number;
  dailyTask?: string;
  status?: string;
  sessions: number;
  mentors?: number;
  isBlocked?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
}

interface DataTableProps {
  data: DataItem[];
  type: "user" | "mentor";
  onBlock?: (id: string) => void;
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
  onRowClick,
  page,
  setPage,
  total,
  limit,
}: DataTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getBlockButtonStyles = (isBlocked: boolean) => {
    if (isBlocked) {
      return "bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs";
    } else {
      return "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3">User Info</th>
              <th className="px-6 py-3">
                {type === "user" ? "Level" : "Students"}
              </th>
              <th className="px-6 py-3">
                {type === "user" ? "Daily Task" : "Status"}
              </th>
              <th className="px-6 py-3">Sessions</th>
              {type === "user" && <th className="px-6 py-3">Mentors</th>}
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 border-t">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm overflow-hidden">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        item.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  {type === "user" ? (
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">
                      {item.level}
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {item.students}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {type === "user" ? (
                    <span className="text-gray-600">{item.dailyTask}</span>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status || ""
                      )}`}
                    >
                      {item.status}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">
                    {item.sessions}
                  </span>
                </td>

                {type === "user" ? (
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {item.mentors}
                    </span>
                  </td>
                ) : (
                  <td className="px-6 py-4">
                    <Button
                      variant="secondary"
                      onClick={() => onRowClick?.(item.id)}
                    >
                      {item.verificationStatus}
                    </Button>
                  </td>
                )}

                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      className={getBlockButtonStyles(item.isBlocked || false)}
                      onClick={() => onBlock?.(item.id)}
                    >
                      {item.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button />
      </div>

      {/* Pagination Controls - placed outside the bordered table */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {Math.ceil(total / limit)}
        </span>

        <button
          onClick={() =>
            setPage((prev) => (prev * limit < total ? prev + 1 : prev))
          }
          disabled={page * limit >= total}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;
