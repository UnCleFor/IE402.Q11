import React from 'react'
import './NearestResultItem.css';

export default function NearestResultItem({ result, index, onClick }) {
    return (
        <div className="nearest-result-item" onClick={onClick}>
      <div className="result-item-content">
        <span className="result-icon">
          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📍'}
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
    )
}