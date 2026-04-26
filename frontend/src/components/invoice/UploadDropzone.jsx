import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';

import { uploadInvoice, fetchStats, fetchInvoices } from '../../store/slices/invoicesSlice.js';
import { startBatch, appendInvoiceToBatch } from '../../store/slices/batchesSlice.js';

// Includes our strict MIME-type validation for PDF support!
const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tif', '.tiff'],
};

export default function UploadDropzone() {
  const dispatch = useDispatch();
  const { uploading, uploadProgress } = useSelector((s) => s.invoices);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles?.length) return;

      try {
        // 1. Open a new batch session in Postgres! 
        // We MUST await and unwrap this so we get the real database ID back
        const batchData = await dispatch(startBatch(acceptedFiles.length)).unwrap();
        const batchId = batchData.id;

        // 2. Upload serially so the progress bar reflects per-file progress accurately
        for (const file of acceptedFiles) {
          try {
            // Await the individual upload to finish via the FastAPI backend
            const result = await dispatch(uploadInvoice(file)).unwrap();
            
            // 3. Append the successfully processed invoice to the active batch
            dispatch(appendInvoiceToBatch({ batchId, invoice: result }));
            
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
          }
        }
      } catch (error) {
        console.error("Failed to initialize upload batch:", error);
      }
      
      // 4. Refresh dashboard stats and the master list after the batch finishes
      dispatch(fetchStats());
      dispatch(fetchInvoices());
    },
    [dispatch],
  );

  // Added isDragReject to visually warn the user if they drag a bad file type
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 25 * 1024 * 1024, // 25 MB limit
    multiple: true,
    disabled: uploading,
  });

  let dropzoneClass = 'dropzone';
  if (isDragActive && !isDragReject) dropzoneClass += ' dropzone--active';
  if (isDragReject) dropzoneClass += ' dropzone--error'; 
  if (uploading) dropzoneClass += ' dropzone--disabled';

  return (
    <div
      {...getRootProps({
        className: dropzoneClass,
      })}
      aria-label="Upload invoice files"
    >
      <input {...getInputProps()} />
      <div className="dropzone__icon">
        {uploading ? '⏳' : isDragReject ? '❌' : '⇪'}
      </div>
      
      <h3>
        {uploading 
          ? 'Uploading and Processing…' 
          : isDragReject 
          ? 'File type not supported!' 
          : 'Drop invoices here, or click to browse'}
      </h3>
      
      <p className="muted">
        Supports PDF, PNG, JPEG and TIFF — up to 25 MB per file
      </p>
      
      {uploading && (
        <div className="progress" aria-label="Upload progress" style={{ marginTop: '16px' }}>
          <div 
            className="progress__bar" 
            style={{ 
              width: `${uploadProgress}%`,
              transition: 'width 0.3s ease-in-out'
            }} 
          />
        </div>
      )}
    </div>
  );
}