import React, { useState } from 'react';
import { Shield, Info, X } from 'lucide-react';
import './SecurityBadge.css';

export default function SecurityBadge({ domain, risk, mechanism }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="security-badge-container">
      <div className="security-badge" onClick={() => setShowDetails(true)}>
        <Shield size={16} color="#62BB46" />
        <span>NIST {domain}</span>
        <Info size={14} className="info-icon" />
      </div>

      {showDetails && (
        <div className="security-modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="security-modal" onClick={(e) => e.stopPropagation()}>
            <div className="security-modal-header">
              <Shield size={24} color="#E30613" />
              <h3>Sécurité NIST : {domain}</h3>
              <button onClick={() => setShowDetails(false)}><X size={20} /></button>
            </div>
            <div className="security-modal-body">
              <div className="security-field">
                <strong>Risque traité :</strong>
                <p>{risk}</p>
              </div>
              <div className="security-field">
                <strong>Mécanisme appliqué :</strong>
                <p>{mechanism}</p>
              </div>
              <div className="security-footer">
                Conformité Portail Ooredoo SP 800-171
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
