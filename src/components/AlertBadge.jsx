import React from 'react';
import './AlertBadge.css';

export default function AlertBadge({ severity }) {
  return (
    <span className={`alert-badge severity-${severity}`}>
      {severity}
    </span>
  );
}
