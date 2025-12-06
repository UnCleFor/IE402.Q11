import React, { useEffect, useState } from "react";
import PharmacyCard from "../../components/DefaultComponent/Pharmacy/PharmacyCard";
import axios from "axios";
import "./PharmacyPage.css";

export default function PharmacyPage() {
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/pharmacy")
      .then(res => setPharmacies(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="pharmacy-page-container">
      <h2 className="pharmacy-page-title">Danh sách nhà thuốc</h2>

      <div className="pharmacy-list">
        {pharmacies.map(ph => (
          <PharmacyCard key={ph.pharmacy_id} pharmacy={ph} />
        ))}
      </div>
    </div>
  );
}
