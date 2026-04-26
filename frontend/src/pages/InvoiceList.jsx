import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import StatusBadge from '../components/common/StatusBadge.jsx';
import { SkeletonTable } from '../components/common/Skeleton.jsx';
import { fetchInvoices, setFilter } from '../store/slices/invoicesSlice.js';
import { formatMoney } from '../utils/money.js';

export default function InvoiceList() {
  const dispatch = useDispatch();
  const { list, listStatus, filters } = useSelector((s) => s.invoices);
  const displayCurrency = useSelector((s) => s.ui.currency);

  // Local state for the search input to avoid spamming the API on every keystroke
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Fetch data whenever filters change
  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch, filters]);

  // Handle Enter key for search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      dispatch(setFilter({ search: searchTerm, page: 1 }));
    }
  };

  // The Magic Export Function
  const handleExport = () => {
    // We build the query string so the Excel file matches what you see on screen!
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    // Fallback to localhost if environment variable isn't set
   const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    window.open(`${baseUrl}/invoices/export/excel?${params.toString()}`, '_blank');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>All Invoices</h1>
          <div className="page-header__subtitle">
            Company-wide invoice database — {list.total || 0} total records
          </div>
        </div>
        
        {/* NEW: Export Button perfectly aligned in the header */}
        <div className="row">
          <button className="btn btn--primary" onClick={handleExport} disabled={listStatus === 'loading' || list.total === 0}>
            <span style={{ marginRight: '8px' }}>📥</span>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Action Bar for Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div className="form-control" style={{ margin: 0, flex: 1 }}>
          <input
            type="text"
            className="input"
            placeholder="Search vendor or invoice number... (Press Enter)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        
        <div className="form-control" style={{ margin: 0, width: '200px' }}>
          <select 
            className="input" 
            value={filters.status || ''} 
            onChange={(e) => dispatch(setFilter({ status: e.target.value, page: 1 }))}
          >
            <option value="">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="POSTED">Posted to SAP</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {listStatus === 'loading' ? (
        <SkeletonTable />
      ) : list.items.length === 0 ? (
        <div className="empty-state">
          No invoices found matching your criteria.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Vendor</th>
                <th>Invoice Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link to={`/invoices/${inv.id}`} className="font-mono">
                      {inv.invoice_number || 'Pending...'}
                    </Link>
                  </td>
                  <td>{inv.vendor_name || '—'}</td>
                  <td>{inv.invoice_date ? format(new Date(inv.invoice_date), 'MMM d, yyyy') : '—'}</td>
                  <td>{formatMoney(inv.total_amount, inv.currency, displayCurrency)}</td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td>{format(new Date(inv.created_at), 'MMM d, HH:mm')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/invoices/${inv.id}`} className="btn btn--ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination Controls */}
      {list.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <span className="muted">Page {filters.page} of {list.pages}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn--ghost" 
              disabled={filters.page <= 1}
              onClick={() => dispatch(setFilter({ page: filters.page - 1 }))}
            >
              Previous
            </button>
            <button 
              className="btn btn--ghost" 
              disabled={filters.page >= list.pages}
              onClick={() => dispatch(setFilter({ page: filters.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}