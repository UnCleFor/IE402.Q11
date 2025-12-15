import React from 'react';
import './HomePage.css';
import HeroSection from './HeroSection/HeroSection';
import SearchSection from './SearchSection/SearchSection';
import MapSection from './MapSection/MapSection';
import StatsSection from './StatsSection/StatsSection';
import ServicesSection from './ServicesSection/ServicesSection';
import EmergencyContacts from './EmergencyContacts/EmergencyContacts';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Banner với tìm kiếm */}
      <HeroSection />
      
      {/* Bản đồ tương tác */}
      <MapSection />
      
      {/* Tìm kiếm nâng cao */}
      <SearchSection />
      
      {/* Thống kê y tế */}
      <StatsSection />
      
      {/* Dịch vụ y tế */}
      <ServicesSection />
      
      {/* Liên hệ khẩn cấp */}
      <EmergencyContacts />
    </div>
  );
};

export default HomePage;