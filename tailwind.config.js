// tailwind.config.js - MÍNIMO NECESARIO para tu proyecto existente
/** @type {import('tailwindcss').Config} */
module.exports = {
  // CRÍTICO: Le dice a Tailwind dónde buscar las clases que usas
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    // Ya tienes todo en @theme en tu CSS, así que podemos dejarlo vacío
    // o agregar solo extensiones específicas si necesitas
    extend: {
      // Opcional: Si quieres usar algunos plugins específicos
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'ripple': 'ripple-effect 0.65s ease-out forwards',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      }
    },
  },
  
  // Solo plugins esenciales que necesites
  plugins: [
    // Si usas formularios con estilos especiales
    // require('@tailwindcss/forms'),
    
    // Para scrollbars personalizadas (útil para el sidebar)
    // require('tailwind-scrollbar'),
  ],
};
