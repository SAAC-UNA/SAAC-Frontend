/**
 * Login - Página de inicio de sesión
 * Login con cédula y contraseña
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';
import { SystemIcons } from '@/Components/Ui/Icons/SystemIcons';
import { useToast } from '@/Hooks/useToast';
import styles from './Login.module.css';

export const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ cedula, password });
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
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
      {/* Left Section - Branding Text */}
      <div className={styles['login-branding-section']}>
        <div className={styles['login-branding']}>
          <div className={styles['login-logo']}>SAAC</div>
          <h2 className={styles['login-title']}>Sistema de Acreditación y Autoevaluación de las Carreras</h2>
          <p className={styles['login-subtitle']}>UNA - Universidad Nacional de Costa Rica</p>
        </div>
      </div>

      {/* Right Section - Form Container */}
      <div className={styles['login-form-section']}>
        <div className={styles['login-form-wrapper']}>
          <img 
            src="/Images/Logo-SAAC.png" 
            alt="SAAC Logo" 
            className={styles['login-logo-image']}
          />
          <h1 className={styles['login-form-title']}>Inicio de Sesión</h1>
          
          <form onSubmit={handleSubmit} className={styles['login-form']}>
            <div className={styles['login-input-field']}>
              <div className={styles['login-input-icon']}>
                {SystemIcons.interface.user({ size: 'sm', color: '#a0aec0' })}
              </div>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                disabled={loading}
              />
              <label>Identificación</label>
            </div>

            <div className={styles['login-input-field-password']}>
              <div className={styles['login-input-icon']}>
                {SystemIcons.interface.lock({ size: 'sm', color: '#a0aec0' })}
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <label>Contraseña</label>
              <button
                type="button"
                className={styles['login-toggle-password']}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
              <div className={styles['login-info-tooltip']}>
                {SystemIcons.interface.infoCircle({ size: 'sm', color: '#a0aec0' })}
                <span className={styles['login-tooltip-text']}>
                  Ingrese la contraseña que emplea en los demás sistemas de la universidad
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a href="https://recuperacion.una.ac.cr/" target="_blank" rel="noopener noreferrer" className={styles['login-forgot-password']}>
                ¿Olvidó su contraseña?
              </a>
            </div>

            <div className={styles['login-btn-container']}>
              <button type="submit" className={styles['login-btn']} disabled={loading}>
                {loading ? 'Cargando...' : 'Ingresar'}
              </button>
            </div>
          </form>
        </div>
        
        <footer className={styles['login-footer']}>
          © 2025 — SAAC · Universidad Nacional de Costa Rica
        </footer>
      </div>
    </div>
  );
};