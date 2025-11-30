/**
 * Login - Página de inicio de sesión
 * Login con cédula y contraseña
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
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
      {/* Left Section - Branding (60%) */}
      <div className={styles['login-branding-section']}>
        <div className={styles['login-branding']}>
          <div className={styles['login-logo']}>SAAC</div>
          <h2 className={styles['login-title']}>Sistema de Acreditación y Autoevaluación de las Carreras</h2>
          <p className={styles['login-subtitle']}>UNA - Universidad Nacional de Costa Rica</p>
        </div>
      </div>

      {/* Right Section - Form (40%) */}
      <div className={styles['login-form-section']}>
        <div className={styles['login-form-wrapper']}>
          <h1 className={styles['login-form-title']}>Inicio de Sesión</h1>
          
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

            <div className={styles['login-input-field-password']}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <label>Contraseña</label>
              <div className={styles['login-info-tooltip']}>
                {SystemIcons.interface.infoCircle({ size: 'sm', color: '#a0aec0' })}
                <span className={styles['login-tooltip-text']}>
                  Ingrese la contraseña que emplea en los demás sistemas de la universidad
                </span>
              </div>
              <button
                type="button"
                className={styles['login-passicon']}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? SystemIcons.interface.eyeSlash({ size: 'sm' }) : SystemIcons.interface.eye({ size: 'sm' })}
              </button>
            </div>

            <a href="https://recuperacion.una.ac.cr/" target="_blank" rel="noopener noreferrer" className={styles['login-forgot-password']}>
              ¿Olvidó su contraseña?
            </a>

            <div className={styles['login-btn-container']}>
              <button type="submit" className={styles['login-btn']} disabled={loading}>
                {loading ? 'Cargando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};