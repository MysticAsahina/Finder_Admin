import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function WalletTransactions({ isActive }) {
  const { accessToken } = useContext(AuthContext);
  const [summary, setSummary] = useState({
    totalPassengerFloat: 0,
    totalDriverFloat: 0,
    totalFeesCollected: 0,
    totalCashInVolume: 0,
    totalCashOutVolume: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!accessToken) return;
    try {
      if (showLoading) setLoading(true);
      const [sumRes, txRes] = await Promise.all([
        fetch(`${API_URL}/admin/wallet/summary`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/admin/wallet/transactions${filterType ? `?type=${filterType}` : ''}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin wallet data', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [accessToken, filterType]);

  useEffect(() => {
    if (!isActive) return;
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [isActive, fetchData]);

  const formatCurrency = (val) =>
    (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial & Wallet Overview</h1>
          <p className="text-sm text-gray-500">
            Real-time digital float, fee collections, and transaction audit trails across all users.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger Float</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">₱ {formatCurrency(summary.totalPassengerFloat)}</p>
          <p className="text-xs text-emerald-600 mt-1">Prepaid wallet balances</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Float</p>
          <p className="text-2xl font-extrabold text-orange-600 mt-2">₱ {formatCurrency(summary.totalDriverFloat)}</p>
          <p className="text-xs text-gray-500 mt-1">Pending driver payouts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fees Collected</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">₱ {formatCurrency(summary.totalFeesCollected)}</p>
          <p className="text-xs text-gray-500 mt-1">₱5 + 2% cash-in fees</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash-Out Volume</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">₱ {formatCurrency(summary.totalCashOutVolume)}</p>
          <p className="text-xs text-gray-500 mt-1">Total driver disbursements</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-bold text-gray-800">Transaction Ledger</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Filter Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Transactions</option>
              <option value="cash_in">Cash In (Top-up)</option>
              <option value="cash_out">Cash Out (Disbursement)</option>
              <option value="fare_deduction">Fare Deduction (Passenger)</option>
              <option value="fare_earning">Fare Earning (Driver)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === 'cash_in' || tx.type === 'fare_earning';
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-700">
                        {tx.referenceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : 'System User'}
                        </div>
                        <div className="text-xs text-gray-400">{tx.userId?.mobileNumber}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-xs text-gray-600 font-medium">
                        {tx.userRole}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold capitalize text-gray-700">
                          {tx.type.replace('_', ' ')}
                        </span>
                        <div className="text-[11px] text-gray-400">{tx.description}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isCredit ? 'text-emerald-600' : 'text-orange-600'}>
                          {isCredit ? '+₱ ' : '-₱ '}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {tx.fee > 0 ? `₱ ${formatCurrency(tx.fee)}` : '₱ 0.00'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            tx.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
