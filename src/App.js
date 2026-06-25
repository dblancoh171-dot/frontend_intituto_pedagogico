import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MatriculaForm from './components/MatriculaForm';
import './App.css';

function App() {
  const [nombreParaSidebar, setNombreParaSidebar] = useState("Cargando usuario...");
  
  // 🔥 ESTADO DE INTERACCIÓN: Controla si la hamburguesa está abierta o cerrada
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  return (
      <div className="contenedor-layout">
          {/* Le pasamos el control al Sidebar */}
          <Sidebar 
              estudianteNombre={nombreParaSidebar} 
              isColapsado={sidebarColapsado} 
              onToggleColapso={() => setSidebarColapsado(!sidebarColapsado)} 
          />

          {/* El contenido principal se adaptará solo */}
          <div className="contenido-principal">
              <MatriculaForm onNombreCargado={setNombreParaSidebar} />
          </div>
      </div>
  );
}

export default App;



