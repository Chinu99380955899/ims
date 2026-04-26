/**
 * Upload Invoices page — dedicated upload + batch analytics view.
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

import UploadDropzone from '../components/invoice/UploadDropzone.jsx';
import BatchPieChart from '../components/invoice/BatchPieChart.jsx';
import BatchSlicerPanel from '../components/invoice/BatchSlicerPanel.jsx';
import BatchHistoryFilter from '../components/invoice/BatchHistoryFilter.jsx';
import {
  appendInvoiceToBatch,
  selectActiveBatch,
  selectAllBatches,
  setActiveBatch,
  startBatch,
} from '../store/slices/batchesSlice.js';
import { STATUSES } from '../constants/status.js';

/* --- Demo data generator for the chart --- */
const DEMO_VENDORS = ['Acme Corp', 'Globex Inc.', 'Initech', 'Umbrella Co.', 'Stark Industries'];
const DEMO_CITIES = ['Mumbai', 'Bengaluru', 'Delhi', 'Pune', 'Hyderabad'];

function makeDemoInvoices() {
  const dist = { UPLOADED: 2, PROCESSING: 3, AUTO_APPROVED: 4, REVIEW_REQUIRED: 5, APPROVED: 3, POSTED: 4, REJECTED: 1, FAILED: 2 };
  const out = [];
  let n = 1;
  for (const status of STATUSES) {
    const count = dist[status] || 0;
    for (let i = 0; i < count; i++) {
      out.push({
        id: `demo_${n}_${status.toLowerCase()}`,
        invoice_number: `INV-${String(1000 + n).padStart(5, '0')}`,
        vendor_name: DEMO_VENDORS[(n - 1) % DEMO_VENDORS.length],
        status,
        currency: 'USD',
        total_amount: Math.round((50 + Math.random() * 4950) * 100) / 100,
        confidence_score: Math.round((0.7 + Math.random() * 0.3) * 1000) / 1000,
        created_at: new Date(Date.now() - n * 3600000).toISOString(),
      });
      n++;
    }
  }
  return out;
}

export default function UploadInvoices() {
  const dispatch = useDispatch();
  const batches = useSelector(selectAllBatches);
  const activeBatch = useSelector(selectActiveBatch);
  const activeBatchId = useSelector((s) => s?.batches?.activeBatchId);

  const [slicerStatus, setSlicerStatus] = useState(null);

  const onSelectBatch = (id) => dispatch(setActiveBatch(id));

 const onLoadDemo = async () => {
    const invoices = makeDemoInvoices();
    // Await the API call!
    const action = await dispatch(startBatch(invoices.length)).unwrap(); 
    const batchId = action.id; // Use .id directly from the unwrapped payload
    for (const inv of invoices) {
      dispatch(appendInvoiceToBatch({ batchId, invoice: inv }));
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Upload Invoices</h1>
          <div className="page-header__subtitle">
            Drop files to start a new batch — track each batch's status distribution below.
          </div>
        </div>
        <button type="button" className="btn btn--ghost" onClick={onLoadDemo}>
          Load demo batch
        </button>
      </div>

      <div className="card">
        <UploadDropzone />
      </div>

      <div className="card section">
        <div className="card__header-row">
          <div>
            <h2 className="card__title">Status distribution</h2>
            {activeBatch && (
              <div className="card__subtitle">
                {format(new Date(activeBatch.timestamp), 'MMM d, yyyy · HH:mm')} ·{' '}
                {activeBatch.invoices.length}/{activeBatch.totalInvoices} invoices
              </div>
            )}
          </div>
          <BatchHistoryFilter
            batches={batches}
            activeBatchId={activeBatchId}
            onSelect={onSelectBatch}
          />
        </div>

        {!activeBatch || activeBatch.invoices.length === 0 ? (
          <div className="empty-state">
            No batch data yet — drop some invoices above, or click{' '}
            <strong>Load demo batch</strong> to see the chart.
          </div>
        ) : (
          <BatchPieChart
            invoices={activeBatch.invoices}
            onSegmentClick={(status) => setSlicerStatus(status)}
          />
        )}
      </div>

      <BatchSlicerPanel
        status={slicerStatus}
        invoices={activeBatch?.invoices || []}
        onClose={() => setSlicerStatus(null)}
      />
    </>
  );
}