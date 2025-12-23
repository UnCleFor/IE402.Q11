import React from 'react'
import './SearchResultItem.css';

export default function SearchResultItem({ onClick , result}) {
  return (
    <div className="search-result-item" onClick={onClick}>
      <div className="result-item-content">
        <span className="result-icon">
          {result.type === 'pharmacy' ? '💊' : '🏥'}
        </span>
        <div className="result-details">
          <div className="result-name">
            {result.name || result.details?.pharmacy_name || result.details?.facility_name}
          </div>
          <div className="result-address">
            {result.address}
          </div>
          {result.distance && (
            <div className="result-distance">
              📏 {result.distance.toLocaleString()}m
            </div>
          )}
        </div>
      </div>
    </div>
  );
}