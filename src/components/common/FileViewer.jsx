import React from 'react';
import { ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import { isImage, isPdf } from '../../services/uploadService';

const styles = {
  thumb: {
    width: 80, height: 80, borderRadius: 8, objectFit: 'cover',
    border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc',
  },
  docBox: {
    width: 80, height: 80, borderRadius: 8, border: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', background: '#f8fafc',
    gap: 4,
  },
  wrapper: {
    display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start',
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    maxWidth: 90,
  },
  name: {
    fontSize: 10, color: '#64748b', textAlign: 'center',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    maxWidth: 80,
  },
};

const getFileUrl = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  if (file.url) return file.url;
  if (file.dataUrl) return file.dataUrl;
  if (file.key) return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/view?key=${encodeURIComponent(file.key)}`;
  return '';
};

const getFileName = (file) => {
  if (!file) return 'File';
  if (typeof file === 'string') return file.split('/').pop() || 'File';
  return file.name || file.fileName || file.originalName || 'File';
};

const FileThumb = ({ file, size = 80 }) => {
  const url = getFileUrl(file);
  const name = getFileName(file);

  if (!url) {
    return (
      <div style={{ ...styles.docBox, width: size, height: size }}>
        <FileText size={size * 0.3} color="#94a3b8" />
        <span style={{ fontSize: 8, color: '#94a3b8' }}>No file</span>
      </div>
    );
  }

  if (isImage(name) || url.startsWith('data:image/')) {
    return (
      <img
        src={url}
        alt={name}
        style={{ ...styles.thumb, width: size, height: size }}
        onClick={() => window.open(url, '_blank')}
        title="Click to view full size"
      />
    );
  }

  if (isPdf(name)) {
    return (
      <div
        style={{ ...styles.docBox, width: size, height: size }}
        onClick={() => window.open(url, '_blank')}
        title="Click to open PDF"
      >
        <FileText size={size * 0.35} color="#ef4444" />
        <span style={{ fontSize: size * 0.1, color: '#ef4444', fontWeight: 700 }}>PDF</span>
      </div>
    );
  }

  return (
    <div
      style={{ ...styles.docBox, width: size, height: size }}
      onClick={() => window.open(url, '_blank')}
      title="Click to open file"
    >
      <ExternalLink size={size * 0.3} color="#6366f1" />
      <span style={{ fontSize: size * 0.1, color: '#64748b', fontWeight: 600 }}>Open</span>
    </div>
  );
};

export const FileViewer = ({ files, size = 80 }) => {
  if (!files) return null;

  const list = Array.isArray(files) ? files : [files];
  const valid = list.filter(Boolean);

  if (valid.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      {valid.map((file, i) => (
        <div key={i} style={styles.item}>
          <FileThumb file={file} size={size} />
          <span style={styles.name} title={getFileName(file)}>
            {getFileName(file)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FileViewer;
