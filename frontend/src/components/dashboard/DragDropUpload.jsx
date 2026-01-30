import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DragDropUpload = ({ onFilesSelected, maxFiles = 100 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    ).slice(0, maxFiles);

    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      onFilesSelected(droppedFiles);
    }
  }, [maxFiles, onFilesSelected]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, maxFiles);
    setFiles(selectedFiles);
    onFilesSelected(selectedFiles);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="drag-drop-container">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrag={handleDrag}
        onDragStart={handleDrag}
        onDragEnd={handleDrag}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload-input"
          multiple
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        <motion.div
          className="drop-zone-content"
          animate={{ scale: isDragging ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="48" height="48" fill="none" stroke="#FF7C08" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h4>Drag & Drop Photos Here</h4>
          <p>or <label htmlFor="file-upload-input" className="browse-link">browse</label> to upload</p>
          <span className="file-limit">Upload unlimited images • Max 10MB each</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="uploaded-files"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h5>{files.length} file{files.length > 1 ? 's' : ''} selected</h5>
            <div className="files-list">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  className="file-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="file-icon">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .drag-drop-container {
          margin: 1rem 0;
        }

        @media (min-width: 768px) {
          .drag-drop-container {
            margin: 1.5rem 0;
          }
        }

        .drop-zone {
          border: 2px dashed rgba(255, 124, 8, 0.3);
          border-radius: 12px;
          padding: 2rem 1rem;
          text-align: center;
          background: rgba(255, 124, 8, 0.02);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .drop-zone {
            border-radius: 16px;
            padding: 3rem 2rem;
          }
        }

        .drop-zone.dragging {
          border-color: #FF7C08;
          background: rgba(255, 124, 8, 0.1);
          box-shadow: 0 0 20px rgba(255, 124, 8, 0.2);
        }

        .drop-zone-content svg {
          width: 40px;
          height: 40px;
        }

        @media (min-width: 768px) {
          .drop-zone-content svg {
            width: 48px;
            height: 48px;
          }
        }

        .drop-zone-content h4 {
          margin: 0.75rem 0 0.5rem 0;
          color: #1f2937;
          font-weight: 600;
          font-size: 1rem;
        }

        @media (min-width: 768px) {
          .drop-zone-content h4 {
            margin: 1rem 0 0.5rem 0;
            font-size: 1.125rem;
          }
        }

        [data-theme="dark"] .drop-zone-content h4 {
          color: #ffffff;
        }

        .drop-zone-content p {
          margin: 0.5rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .drop-zone-content p {
            font-size: 0.95rem;
          }
        }

        .browse-link {
          color: #FF7C08;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .file-limit {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: rgba(255, 124, 8, 0.1);
          border-radius: 6px;
          font-size: 0.75rem;
          color: #FF7C08;
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .file-limit {
            margin-top: 0.75rem;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
          }
        }

        .uploaded-files {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 124, 8, 0.2);
          border-radius: 10px;
        }

        @media (min-width: 768px) {
          .uploaded-files {
            margin-top: 1.5rem;
            padding: 1.5rem;
            border-radius: 12px;
          }
        }

        [data-theme="dark"] .uploaded-files {
          background: rgba(0, 0, 0, 0.4);
        }

        .uploaded-files h5 {
          margin: 0 0 0.75rem 0;
          color: #1f2937;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (min-width: 768px) {
          .uploaded-files h5 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
          }
        }

        [data-theme="dark"] .uploaded-files h5 {
          color: #ffffff;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .files-list {
            gap: 0.75rem;
          }
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        @media (min-width: 768px) {
          .file-item {
            gap: 1rem;
            padding: 1rem;
            border-radius: 10px;
          }
        }

        [data-theme="dark"] .file-item {
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 124, 8, 0.2);
        }

        .file-item:hover {
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] .file-item:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .file-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 124, 8, 0.1);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF7C08;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .file-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }
        }

        .file-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          min-width: 0;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .file-info {
            gap: 0.25rem;
          }
        }

        .file-name {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (min-width: 768px) {
          .file-name {
            font-size: 0.95rem;
          }
        }

        [data-theme="dark"] .file-name {
          color: #ffffff;
        }

        .file-size {
          font-size: 0.75rem;
          color: #6b7280;
        }

        @media (min-width: 768px) {
          .file-size {
            font-size: 0.8125rem;
          }
        }

        .remove-file {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 6px;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .remove-file {
            border-radius: 8px;
          }
        }

        .remove-file:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default DragDropUpload;
