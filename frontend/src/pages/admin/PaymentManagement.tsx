import { useEffect, useState } from "react";
import DataTable from "../../components/admin/DataTables";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import { data } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getPayments } from "../../services/adminService";

interface PaymentItem {
  id: string;
  paypalOrderId: string;
  status: string;
  amount: number;
  currency: string;
}

const PaymentManagement = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 5;

  const navigate = useNavigate()

  // ✅ Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const res = await getPayments()
        const data = await res.data;
        setPayments(data.data); 
      } catch (err: any) {
        setError(err.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  console.log(payments)


  // ✅ Filter + Search logic
  const filteredPayments = payments.filter((p) => {
    const matchSearch =
      p.paypalOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.currency.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "All" ||
      p.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * limit,
    page * limit
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "created":
        return "bg-blue-100 text-blue-800";
      case "cancel":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(window.location.href = `/payment/${id}`)
  };

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="rounded-t-3xl pt-12 pb-8 px-8">
          <h2 className="text-3xl font-bold text-white mb-8">
            Payment Management
          </h2>

          <div className="bg-white rounded-lg p-6 text-black">
            {/* Search & Filter */}
            <SearchFilterBar
              searchPlaceholder="Search by PayPal Order ID or currency"
              filterOptions={["All", "Created", "Completed", "Cancel"]}
              onSearch={(val) => {
                setSearchQuery(val);
                setPage(1);
              }}
              onFilter={(val) => {
                setFilterStatus(val);
                setPage(1);
              }}
            />

            {/* Loading / Error */}
            {loading ? (
              <p className="text-center py-6 text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-center py-6 text-red-500">{error}</p>
            ) : (
              <>
                {/* Payment Table */}
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-gray-700 font-semibold">
                      <tr>
                        <th className="px-6 py-3">PayPal Order ID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Currency</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedPayments.length > 0 ? (
                        paginatedPayments.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 font-medium">
                              {p.paypalOrderId}
                            </td>
                            <td className="px-6 py-4">{p.amount}</td>
                            <td className="px-6 py-4">{p.currency}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  p.status
                                )}`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewDetails(p.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center text-gray-500 py-6"
                          >
                            No matching records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(filteredPayments.length / limit)}
                  </span>

                  <button
                    onClick={() =>
                      setPage((prev) =>
                        prev * limit < filteredPayments.length ? prev + 1 : prev
                      )
                    }
                    disabled={page * limit >= filteredPayments.length}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
