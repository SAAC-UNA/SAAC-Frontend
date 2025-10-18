/**
 * Login - Página de inicio de sesión
 * Login con cédula y contraseña
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import styles from './Login.module.css';

export const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ cedula, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Login rápido para testing - Usando datos del seeder
  // const quickLogin = async (role: 'SuperUsuario' | 'AdminInge' | 'AdminQuimi') => {
  //   const credentials = {
  //     SuperUsuario: { cedula: '101010101', password: 'password' },
  //     AdminInge: { cedula: '203948609', password: 'password' },
  //     AdminQuimi: { cedula: '402290552', password: 'password' }
  //   };

  //   setLoading(true);
    
  //   try {
  //     await login(credentials[role]);
  //     navigate('/');
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-container']}>
        <div className={styles['login-heading']}>SAAC-UNA</div>
        <p style={{ color: '#718096', fontSize: '14px', marginBottom: '20px', marginTop: '-10px' }}>
          Sistema de Acreditación y Autoevaluación de las Carreras
        </p>

        <form onSubmit={handleSubmit} className={styles['login-form']}>
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#fed7d7',
              color: '#c53030',
              border: '1px solid #fc8181',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className={styles['login-input-field']}>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              required
              disabled={loading}
            />
            <label>Cédula</label>
          </div>

          <div className={styles['login-input-field']}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <label>Contraseña</label>
            <span 
              className={styles['login-passicon']}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>

          <div className={styles['login-btn-container']}>
            <button type="submit" className={styles['login-btn']} disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};