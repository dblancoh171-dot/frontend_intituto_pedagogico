import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import SidebarProfesor from './components/SidebarProfesor';
import MatriculaForm from './components/MatriculaForm';
import MisCursosProfesor from './components/MisCursosProfesor'; // 🔥 Agregamos el nuevo archivo

//import RegistroNotasForm from './components/RegistroNotasForm';
import './App.css';

function App() {
  // 🧪 SIMULADOR DE INICIO DE SESIÓN DIRECTO
  // Cambia este ID (ej: 1, 4 o 5) para probar cómo reacciona cada alumno independiente
  // 🧪 SIMULADOR DE SESIÓN COMPLETO (Elegir un Rol y un ID para probar)

  const [rolActivo, setRolActivo] = useState('profesor'); // 👈 'estudiante' o 'profesor'

  const [estudianteIdId, setEstudianteIdId] = useState(1);
  const [profesorIdId, setProfesorIdId] = useState(2); // 👈 Cambia aquí: 1 (Juan) o 2 (Rosa)

  // 🔥 CONTROL DE PESTAÑAS: Forzamos la selección inicial del sub-menú en 'perfil'
  const [subSeccionActiva, setSubSeccionActiva] = useState('perfil');
  const [nombreParaSidebar, setNombreParaSidebar] = useState("Cargando...");
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  // 🔄 REGLA DE RESET: Cada vez que cambies a mano el ID de pruebas, 
  // el sistema regresará la vista activa de forma obligatoria a 'perfil'
  useEffect(() => {
    setSubSeccionActiva('perfil');
    setNombreParaSidebar("Cargando..."); // Limpiador preventivo

    // 📡 APERTURA INTELIGENTE: Traemos los datos de identidad al cargar la sesión
    if (rolActivo === 'estudiante') {
      axios.get(`http://localhost:5000/api/estudiantes/perfil/${estudianteIdId}`)
        .then(res => {
          if (res.data) {
            // Unificamos nombres y apellidos en caliente desde Aiven.io
            setNombreParaSidebar(`${res.data.nombres} ${res.data.apellidos}`);
          }
        })
        .catch(err => console.error("Error al sincronizar perfil del estudiante:", err));
    } else if (rolActivo === 'profesor') {
      // Si la sesión es de rol docente, consultamos su tabla correspondiente
      axios.get(`http://localhost:5000/api/profesores/perfil/${profesorIdId}`)
        .then(res => {
          if (res.data) {
            setNombreParaSidebar(`${res.data.nombres} ${res.data.apellidos}`);
          }
        })
        .catch(err => {
          // Respaldo preventivo si aún no creas el endpoint de profesores
          setNombreParaSidebar(profesorIdId === 1 ? "Juan Marcos Mendoza" : "Rosa Elvira García Torres");
        });
    }
  }, [estudianteIdId, profesorIdId, rolActivo]);

  // 📡 EFECTO EXCLUSIVO: Traer el nombre real del profesor desde el Backend
  useEffect(() => {
    if (rolActivo === 'profesor') {
      // Usaremos tu endpoint de perfiles (crearemos una ruta rápida para profesores o usamos una existente)
      axios.get(`http://localhost:5000/api/profesores/perfil/${profesorIdId}`)
        .then(res => {
          if (res.data) setNombreParaSidebar(`${res.data.nombres} ${res.data.apellidos}`);
        })
        .catch(err => {
          // Respaldo manual en caso de que aún no levantes el endpoint de lectura
          setNombreParaSidebar(profesorIdId === 1 ? "Juan Marcos Mendoza" : "Rosa Elvira García Torres");
        });
    }
  }, [profesorIdId, rolActivo]);

  return (
    <div className="contenedor-layout">

      {/* COLUMNA IZQUIERDA: Sidebar Dinámico */}
      {rolActivo === 'estudiante' ? (
        <Sidebar
          estudianteNombre={nombreParaSidebar}
          isColapsado={sidebarColapsado}
          onToggleColapso={() => setSidebarColapsado(!sidebarColapsado)}
          vistaActiva={subSeccionActiva} // Enviamos cuál opción debe brillar en azul
          onCambiarVista={setSubSeccionActiva} // Permite dar clics para cambiar de pantalla
        />
      ) : (
        <SidebarProfesor
          profesorNombre={nombreParaSidebar} // 🔥 AHORA ES DINÁMICO
          isColapsado={sidebarColapsado}
          onToggleColapso={() => setSidebarColapsado(!sidebarColapsado)}
          vistaActiva={subSeccionActiva} // 🔥 ENVIAMOS LA VISTA DE CONTROL
          onCambiarVista={setSubSeccionActiva} // 🔥 ENVIAMOS EL CONMUTADOR
        />
      )}

      {/* COLUMNA DERECHA: Área de Trabajo Fluida */}
      <div className="contenido-principal">
        {rolActivo === 'estudiante' ? (
          subSeccionActiva === 'perfil' ? (
            /* 👤 Componente de Ficha del Alumno (Crea un div temporal o tu componente si ya lo tienes) */
            <div className="panel-control" key={`perf-${estudianteIdId}`}>
              <h2>PERFIL ACADÉMICO DEL ESTUDIANTE</h2>
              <p style={{ marginTop: '15px', color: '#475569' }}>
                Bienvenido al portal institucional. Aquí se desplegará tu información de contacto, ficha de matrícula vigente y estados de cuenta generales.
              </p>
              <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>
                👤 Identificación en sesión: {nombreParaSidebar} (ID: {estudianteIdId})
              </div>
            </div>
          ) : (
            /* 📘 Formulario de Matrícula Blindado contra Nulos */
            /* 🔥 EL TRUCO KEY: Al cambiar estudianteIdId, destruye los estados viejos y se resetea */
            <MatriculaForm
              key={`matr-${estudianteIdId}`}
              estudianteIdFijo={estudianteIdId}
              onNombreCargado={setNombreParaSidebar}
            />
          )
        ) : (
          // <RegistroNotasForm />

          /* 👨‍🏫 SECCIÓN DEL PROFESOR DINÁMICA CON 3 PESTAÑAS */
          subSeccionActiva === 'perfil' ? (
            <div className="panel-control" key={`perf-prof-${profesorIdId}`}>
              <h2>PERFIL PROFESIONAL DEL DOCENTE</h2>
              <p style={{ marginTop: '15px', color: '#475569' }}>Bienvenido al módulo de gestión pedagógica superior. Aquí se desglosan tus datos institucionales de cátedra.</p>
              <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: 'bold', color: '#16a34a' }}>
                👨‍🏫 Sesión Activa: {nombreParaSidebar} (ID de Profesor: {profesorIdId})
              </div>
            </div>
          ) : subSeccionActiva === 'cursos' ? (
            /* 🔥 PESTAÑA CONECTADA: Si pulsa "Mis Cursos" se renderiza la lista ejecutiva horizontal */
            <MisCursosProfesor
              profesorIdId={profesorIdId}
              onCambiarVista={setSubSeccionActiva}
            />
          ) : (
            /* Pestaña de Notas (Por el momento en texto plano hasta crear su formulario) */
            <div className="panel-control">
              <h2>REGISTRO DE CALIFICACIONES OFICIALES</h2>
              <p style={{ marginTop: '15px', color: '#475569' }}>Selecciona tu asignatura asignada en este periodo para abrir el acta de evaluación.</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}

export default App;




