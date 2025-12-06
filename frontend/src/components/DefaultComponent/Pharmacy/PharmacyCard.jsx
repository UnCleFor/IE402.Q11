import React from "react";
import "./PharmacyCard.css";

export default function PharmacyCard({ pharmacy }) {
  return (
    <div className="pharmacy-card">
      <h3 className="pharmacy-name">{pharmacy.pharmacy_name}</h3>

      <div className="pharmacy-info">
        <p><strong>Địa chỉ:</strong> {pharmacy.address}</p>
      </div>

      <button className="pharmacy-btn">
        Xem chi tiết
      </button>
    </div>
  );
}
