import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminItems from './pages/AdminItems';
import AdminFeedback from './pages/AdminFeedback';
import AdminBookings from './pages/AdminBookings';
import BanquetPage from './pages/BanquetPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/banquet" element={<BanquetPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="items" element={<AdminItems />} />
        <Route path="feedback" element={<AdminFeedback />} />
        <Route path="bookings" element={<AdminBookings />} />
      </Route>
    </Routes>
  );
}
