import React from 'react';
import { useAuth } from '@/Context/AuthContext';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Bienvenido al Sistema de Acreditación y Autoevaluación de Carreras
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Información del usuario</h2>
          <p><span className="font-medium">Nombre:</span> {user?.nombre}</p>
          <p><span className="font-medium">Rol:</span> {user?.roles[0]?.name}</p>
          {user?.careers && user.careers.length > 0 && (
            <p><span className="font-medium">Carrera:</span> {user.careers[0].nombre}</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Acciones disponibles</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Gestionar la estructura del repositorio de evidencias</li>
            <li>Ver y administrar procesos de acreditación</li>
            <li>Gestionar ciclos de autoevaluación</li>
          </ul>
        </div>
      </div>
    </div>
  );
};