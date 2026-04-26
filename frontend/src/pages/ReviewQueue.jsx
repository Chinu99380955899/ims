import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import classNames from 'classnames';

import StatusBadge from '../components/common/StatusBadge.jsx';
import { SkeletonTable } from '../components/common/Skeleton.jsx';
import { fetchInvoices, setFilter } from '../store/slices/invoicesSlice.js';
import { formatMoney } from '../utils/money.js';
import { REVIEW_STATUSES, STATUS_LABELS, STATUS_COLORS } from '../constants/status.js';

// Build the tabs dynamically from your centralized status constants
const TABS = [
  { id: '', label: 'All', color: '#64748b' },
  ...REVIEW_STATUSES.map(status => ({
    id: status,
    label: STATUS_LABELS[status],
    color: STATUS_COLORS[status]
  }))
];

export default function ReviewQueue() {
  const dispatch = useDispatch();
  const { list, listStatus } = useSelector((s) => s.invoices);
  const displayCurrency = useSelector((s) => s.ui.currency);
  
  const [activeTab, setActiveTab] = useState('REVIEW_REQUIRED');

  useEffect(() => {
    dispatch(setFilter({ status: activeTab, page: 1, size: 50 }));
    dispatch(fetchInvoices());
  }, [dispatch, activeTab]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Review queue</h1>
          <div className="page-header__subtitle">
            Invoices awaiting human action — {list.total || 0} total
          </div>
        </div>
      </div>

      {/* NEW: Using the customized 'status-pills' CSS from your friend's update */}
      <div className="status-pills">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id || 'all'}
              onClick={() => setActiveTab(tab.id)}
              className={classNames('status-pill', { 'status-pill--active': isActive })}
              style={{ '--pill-color': tab.color }}
            >
              {tab.label}
              {isActive && <span className="status-pill__count">{list.total || 0}</span>}
            </button>
          );
        })}
      </div>

      {listStatus === 'loading' ? (
        <SkeletonTable />
      ) : list.items.length === 0 ? (
        <div className="empty-state">
          🎉 Queue is empty — no invoices match the current filter.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Confidence</th>
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
                      {inv.invoice_number || 'Pending'}
                    </Link>
                  </td>
                  <td>{inv.vendor_name || '—'}</td>
                  <td>{formatMoney(inv.total_amount, inv.currency, displayCurrency)}</td>
                  <td>
                    <span className={inv.confidence_score > 0.8 ? 'text-success' : 'text-warning'}>
                      {(inv.confidence_score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td>{format(new Date(inv.created_at), 'MMM d, HH:mm')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link to={`/invoices/${inv.id}`} className="btn btn--success btn--sm">Approve</Link>
                        <Link to={`/invoices/${inv.id}`} className="btn btn--danger btn--sm">Reject</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}