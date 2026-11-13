import { useState, useMemo, useEffect } from 'react';
import { MOCK_CUSTOMERS, CLUSTERS_INFO } from '../../services/mockData';
import { fetchCustomersFromApi, updateCustomerApi } from '../../services/api';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  RefreshCw,
  Database,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Lock,
  Loader2
} from 'lucide-react';

export default function CustomersView() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Edit Customer Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
    gender: 'Male',
    age: '',
    annualIncome: '',
    spendingScore: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [toastFeedback, setToastFeedback] = useState(null);

  const loadData = () => {
    setIsLoading(true);
    fetchCustomersFromApi({
      search: search.trim(),
      cluster: clusterFilter,
      gender: genderFilter
    })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => ({
            id: c.customerId || c.id,
            rawId: c.id,
            customerId: c.customerId || c.id,
            gender: c.gender,
            age: c.age,
            annualIncome: c.annualIncome,
            spendingScore: c.spendingScore,
            cluster: c.cluster !== null && c.cluster !== undefined ? c.cluster : 'Unassigned'
          }));
          setCustomers(mapped);
          setIsLiveBackend(true);
        } else if (Array.isArray(data) && data.length === 0) {
          setCustomers([]);
          setIsLiveBackend(true);
        }
      })
      .catch(() => {
        setIsLiveBackend(false);
        setCustomers(MOCK_CUSTOMERS);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    fetchCustomersFromApi({
      search: search.trim(),
      cluster: clusterFilter,
      gender: genderFilter
    })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((c) => ({
            id: c.customerId || c.id,
            rawId: c.id,
            customerId: c.customerId || c.id,
            gender: c.gender,
            age: c.age,
            annualIncome: c.annualIncome,
            spendingScore: c.spendingScore,
            cluster: c.cluster !== null && c.cluster !== undefined ? c.cluster : 'Unassigned'
          }));
          setCustomers(mapped);
          setIsLiveBackend(true);
        } else if (Array.isArray(data) && data.length === 0) {
          setCustomers([]);
          setIsLiveBackend(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLiveBackend(false);
        setCustomers(MOCK_CUSTOMERS);
      });

    return () => {
      isMounted = false;
    };
  }, [search, clusterFilter, genderFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredData = useMemo(() => {
    const list = isLiveBackend ? customers : MOCK_CUSTOMERS;
    return list.filter((c) => {
      const matchesCluster = clusterFilter === 'all' || String(c.cluster) === clusterFilter;
      const matchesGender = genderFilter === 'all' || c.gender.toLowerCase() === genderFilter.toLowerCase();
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        String(c.age).includes(q) ||
        String(c.annualIncome).includes(q) ||
        String(c.spendingScore).includes(q);

      return matchesCluster && matchesGender && matchesSearch;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [customers, isLiveBackend, search, clusterFilter, genderFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const exportCurrentTable = () => {
    const headers = ['CustomerID,Gender,Age,AnnualIncome_k,SpendingScore_1_100,ClusterID,ClusterName'];
    const rows = filteredData.map((c) => {
      const cluster = CLUSTERS_INFO.find((info) => info.id === c.cluster);
      return `${c.id},${c.gender},${c.age},${c.annualIncome},${c.spendingScore},${c.cluster},"${cluster?.name || 'Unassigned'}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `customers_export_${isLiveBackend ? 'live_db' : 'demo'}_${Date.now()}.csv`;
    link.click();
  };

  // Open Edit Modal with Customer Data
  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setEditForm({
      gender: cust.gender || 'Male',
      age: cust.age !== undefined && cust.age !== null ? String(cust.age) : '',
      annualIncome: cust.annualIncome !== undefined && cust.annualIncome !== null ? String(cust.annualIncome) : '',
      spendingScore: cust.spendingScore !== undefined && cust.spendingScore !== null ? String(cust.spendingScore) : ''
    });
    setFormErrors({});
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Validate form fields matching backend DTO rules
  const validateEditForm = () => {
    const errors = {};
    if (!editForm.gender || !['Male', 'Female', 'Other'].includes(editForm.gender)) {
      errors.gender = 'Gender must be Male, Female, or Other';
    }
    const ageNum = Number(editForm.age);
    if (editForm.age === '' || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
      errors.age = 'Age must be an integer between 1 and 120';
    }
    const incomeNum = Number(editForm.annualIncome);
    if (editForm.annualIncome === '' || isNaN(incomeNum) || incomeNum < 0) {
      errors.annualIncome = 'Annual Income must be 0 or greater';
    }
    const scoreNum = Number(editForm.spendingScore);
    if (editForm.spendingScore === '' || isNaN(scoreNum) || !Number.isInteger(scoreNum) || scoreNum < 1 || scoreNum > 100) {
      errors.spendingScore = 'Spending Score must be an integer between 1 and 100';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Edit Form to Backend
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsSaving(true);
    setModalError(null);

    const clusterVal =
      editingCustomer.cluster === 'Unassigned' ||
      editingCustomer.cluster === -1 ||
      editingCustomer.cluster === null ||
      editingCustomer.cluster === undefined
        ? null
        : Number(editingCustomer.cluster);

    const payload = {
      customerId: editingCustomer.id,
      gender: editForm.gender,
      age: parseInt(editForm.age, 10),
      annualIncome: parseFloat(editForm.annualIncome),
      spendingScore: parseInt(editForm.spendingScore, 10),
      cluster: clusterVal
    };

    const targetId = editingCustomer.rawId || editingCustomer.id;

    try {
      const updated = await updateCustomerApi(targetId, payload);

      // Update customer state ONLY after successful API response
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                gender: updated.gender || payload.gender,
                age: updated.age !== undefined ? updated.age : payload.age,
                annualIncome: updated.annualIncome !== undefined ? updated.annualIncome : payload.annualIncome,
                spendingScore: updated.spendingScore !== undefined ? updated.spendingScore : payload.spendingScore,
                cluster: updated.cluster !== undefined && updated.cluster !== null ? updated.cluster : c.cluster
              }
            : c
        )
      );

      setIsEditModalOpen(false);
      setToastFeedback({
        type: 'success',
        message: `Customer ${editingCustomer.id} record updated successfully.`
      });

      setTimeout(() => {
        setToastFeedback(null);
      }, 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to update customer record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banner */}
      {toastFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-lg transition-all ${
            toastFeedback.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastFeedback.message}</span>
          </div>
          <button
            onClick={() => setToastFeedback(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Notice & Data Source Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#13131a] border border-[#8b5cf6]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Customer Records Management</h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isLiveBackend
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveBackend ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isLiveBackend ? 'Live MongoDB Database' : 'Demo Dataset (Offline Fallback)'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isLiveBackend
                ? 'Displaying real customer entities loaded from MongoDB collection.'
                : 'Spring Boot backend is offline. Displaying local benchmark dataset (N=200).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#181824] hover:bg-[#201f30] text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="Reload from MongoDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8b5cf6] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={exportCurrentTable}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export ({filteredData.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#13131a] border border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, Age, Income..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0d0c1d] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#8b5cf6]"
            />
          </div>

          {/* Cluster filter */}
          <select
            value={clusterFilter}
            onChange={(e) => {
              setClusterFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#0d0c1d] border border-white/10 text-xs text-white focus:outline-hidden focus:border-[#8b5cf6] cursor-pointer"
          >
            <option value="all">All Clusters</option>
            {CLUSTERS_INFO.map((c) => (
              <option key={c.id} value={String(c.id)}>
                C{c.id}: {c.shortName}
              </option>
            ))}
          </select>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#0d0c1d] border border-white/10 text-xs text-white focus:outline-hidden focus:border-[#8b5cf6] cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="text-xs text-gray-400">
          Showing <span className="text-white font-bold">{filteredData.length}</span> results
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="overflow-hidden rounded-xl bg-[#13131a] border border-white/10 shadow-lg">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 space-y-2">
            <Database className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-semibold text-white">No customer records found</p>
            <p>Upload a CSV file in the Dataset tab to populate MongoDB with customer data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d0c1d] text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('gender')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Gender</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('age')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Age</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('annualIncome')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Annual Income ($k)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('spendingScore')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Spending Score (1-100)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('cluster')}
                    className="py-3 px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned Cluster</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((cust) => {
                  const cluster = CLUSTERS_INFO.find((c) => String(c.id) === String(cust.cluster));
                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {cust.id}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            cust.gender === 'Female'
                              ? 'bg-pink-500/10 text-pink-400'
                              : cust.gender === 'Male'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {cust.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-medium">
                        {cust.age}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold font-mono">
                        ${cust.annualIncome}k
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold font-mono">{cust.spendingScore}</span>
                          <div className="w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cust.spendingScore}%`,
                                backgroundColor: cluster?.color || '#8b5cf6'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {cluster ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${cluster.color}18`,
                              color: cluster.color,
                              border: `1px solid ${cluster.color}35`
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: cluster.color }}
                            />
                            C{cust.cluster}: {cluster.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-gray-400 bg-white/5 border border-white/10">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#c084fc] hover:text-white border border-[#8b5cf6]/30 hover:border-[#8b5cf6]/60 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                          title={`Edit Customer ${cust.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-[#0d0c1d] border-t border-white/5 text-xs text-gray-400">
            <div>
              Page <span className="text-white font-semibold">{page}</span> of{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#13131a] border border-[#8b5cf6]/30 shadow-2xl overflow-hidden text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0d0c1d]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Edit Customer Record
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Modifying demographic and purchasing attributes
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isSaving && setIsEditModalOpen(false)}
                disabled={isSaving}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Modal Error Banner */}
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{modalError}</span>
                </div>
              )}

              {/* Customer ID (Read-only) */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Customer ID (Read-only)</span>
                </label>
                <input
                  type="text"
                  value={editingCustomer.id}
                  disabled
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090b] border border-white/5 text-xs font-mono text-gray-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Customer ID is an immutable primary key to prevent data integrity conflicts.
                </p>
              </div>

              {/* Grid: Gender and Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Gender <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => {
                      setEditForm({ ...editForm, gender: e.target.value });
                      if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 focus:border-[#8b5cf6] text-xs text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.gender}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Age (Years: 1–120) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={editForm.age}
                    onChange={(e) => {
                      setEditForm({ ...editForm, age: e.target.value });
                      if (formErrors.age) setFormErrors({ ...formErrors, age: '' });
                    }}
                    placeholder="e.g. 35"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 focus:border-[#8b5cf6] text-xs text-white focus:outline-hidden"
                  />
                  {formErrors.age && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.age}
                    </p>
                  )}
                </div>
              </div>

              {/* Grid: Annual Income & Spending Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Annual Income */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Annual Income ($k: ≥ 0) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editForm.annualIncome}
                    onChange={(e) => {
                      setEditForm({ ...editForm, annualIncome: e.target.value });
                      if (formErrors.annualIncome) setFormErrors({ ...formErrors, annualIncome: '' });
                    }}
                    placeholder="e.g. 60.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 focus:border-[#8b5cf6] text-xs text-white focus:outline-hidden"
                  />
                  {formErrors.annualIncome && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.annualIncome}
                    </p>
                  )}
                </div>

                {/* Spending Score */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Spending Score (1–100) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editForm.spendingScore}
                    onChange={(e) => {
                      setEditForm({ ...editForm, spendingScore: e.target.value });
                      if (formErrors.spendingScore) setFormErrors({ ...formErrors, spendingScore: '' });
                    }}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0c1d] border border-white/10 focus:border-[#8b5cf6] text-xs text-white focus:outline-hidden"
                  />
                  {formErrors.spendingScore && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.spendingScore}
                    </p>
                  )}
                </div>
              </div>

              {/* Preserved Cluster Info */}
              <div className="p-3 rounded-xl bg-[#09090b] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-gray-400">Current Assigned Cluster:</span>
                <span className="font-semibold text-purple-300">
                  {editingCustomer.cluster !== 'Unassigned' && editingCustomer.cluster !== -1
                    ? `Cluster ${editingCustomer.cluster}`
                    : 'Unassigned'}
                </span>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 text-white shadow-lg shadow-[#8b5cf6]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
