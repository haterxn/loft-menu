import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated()) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="admin-login">
      <div className="login-card">
        <h1>LOFT</h1>
        <p className="subtitle">Панель управления</p>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            className="form-input"
            placeholder="Логин"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}
