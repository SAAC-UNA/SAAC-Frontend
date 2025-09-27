// /**
//  * App.tsx - Estructura escalable recomendada
//  * Organizada por módulos para mejor mantenimiento
//  */

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { NavigationProvider } from './Context/NavigationContext';
// import { Layout } from './Components/Layout/Index';
// import { 
//   HomePage, 
//   // Módulo de Roles
//   RolesCreatePage, 
//   RolesListPage, 
//   RolesEditPage,
//   // Módulo de Usuarios  
//   UsersPage,
//   UsersCreatePage,
//   UsersEditPage,
//   // Módulo de Cursos (futuro)
//   CoursesPage,
//   CoursesCreatePage
// } from './Pages/Index';

// const App: React.FC = () => {
//   return (
//     <Router>
//       <NavigationProvider>
//         <Layout>
//           <Routes>
//             {/* Página principal */}
//             <Route path="/" element={<HomePage />} />
            
//             {/* === MÓDULO DE ROLES === */}
//             <Route path="/roles">
//               <Route path="crear" element={<RolesCreatePage />} />
//               <Route path="listar" element={<RolesListPage />} />
//               <Route path="editar/:id" element={<RolesEditPage />} />
//             </Route>
            
//             {/* === MÓDULO DE USUARIOS === */}
//             <Route path="/usuarios">
//               <Route index element={<UsersPage />} />
//               <Route path="crear" element={<UsersCreatePage />} />
//               <Route path="editar/:id" element={<UsersEditPage />} />
//             </Route>
            
//             {/* === MÓDULO DE CURSOS (futuro) === */}
//             <Route path="/cursos">
//               <Route index element={<CoursesPage />} />
//               <Route path="crear" element={<CoursesCreatePage />} />
//               <Route path="editar/:id" element={<CoursesEditPage />} />
//             </Route>
            
//             {/* Ruta 404 */}
//             <Route path="*" element={<NotFoundPage />} />
//           </Routes>
//         </Layout>
//       </NavigationProvider>
//     </Router>
//   );
// };

// export default App;