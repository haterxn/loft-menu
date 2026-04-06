import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../api';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) navigate('/admin/login');
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          LOFT <span>Админ-панель</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end>Обзор</NavLink>
          <NavLink to="/admin/categories">Категории</NavLink>
          <NavLink to="/admin/items">Позиции</NavLink>
          <NavLink to="/admin/feedback">Обратная связь</NavLink>
          <NavLink to="/admin/bookings">Бронирование</NavLink>
          <NavLink to="/">Сайт меню</NavLink>
        </nav>
        <div className="admin-logout">
          <button onClick={handleLogout}>Выйти</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
