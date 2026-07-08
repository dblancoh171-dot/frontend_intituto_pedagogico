import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import SidebarProfesor from './components/SidebarProfesor';
import MatriculaForm from './components/MatriculaForm';
import MisCursosEstudiante from './components/MisCursosEstudiante';
import MisCursosProfesor from './components/MisCursosProfesor'; // 🔥 Agregamos el nuevo archivo
import VerSesionesEstudiante from './components/VerSesionesEstudiante';
import GestionarSesiones from './components/GestionarSesiones';
import ContenidoClase from './components/ContenidoClase';
import RegistrarAsistencia from './components/RegistrarAsistencia';
import BandejaCursosEvaluacion from './components/BandejaCursosEvaluacion';
import BandejaActividadesDocente from './components/BandejaActividadesDocente';
import AuditoriaEntregasAlumnos from './components/AuditoriaEntregasAlumnos';
import AulaVirtualPendiente from './components/AulaVirtualPendiente';
import CargaDocentePendiente from './components/CargaDocentePendiente';
import BandejaDocentePendiente from './components/BandejaDocentePendiente';
import RegistroNotasDocente from './components/RegistroNotasDocente';
import MatriculaCerrada from './components/MatriculaCerrada';
import ActasNotasPendiente from './components/ActasNotasPendiente';
import ActaCalificacionesCurso from './components/ActaCalificacionesCurso';


//import RegistroNotasForm from './components/RegistroNotasForm';
import './App.css';

function App() {
  // 🧪 SIMULADOR DE INICIO DE SESIÓN DIRECTO
  // Cambia este ID (ej: 1, 4 o 5) para probar cómo reacciona cada alumno independiente
  // 🧪 SIMULADOR DE SESIÓN COMPLETO (Elegir un Rol y un ID para probar)

  const [rolActivo, setRolActivo] = useState('profesor'); // 👈 'estudiante' o 'profesor'

  const [estudianteIdId, setEstudianteIdId] = useState(4);
  const [profesorIdId, setProfesorIdId] = useState(1); // 👈 Cambia aquí: 1 (Juan) o 2 (Rosa)

  // 🔥 CONTROL DE PESTAÑAS: Forzamos la selección inicial del sub-menú en 'perfil'
  const [subSeccionActiva, setSubSeccionActiva] = useState('perfil');
  const [nombreParaSidebar, setNombreParaSidebar] = useState("Cargando...");
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  const [cursoParaSesiones, setCursoParaSesiones] = useState(null);

  const [sesionParaContenido, setSesionParaContenido] = useState(null);

  const [cursoSeleccionadoEstudiante, setCursoSeleccionadoEstudiante] = useState(null);

  const [actividadParaEvaluar, setActividadParaEvaluar] = useState(null);

  const [cursoNotaActivo, setCursoNotaActivo] = useState(null);

  const [semestreIdActivo, setSemestreIdActivo] = useState(1);


  // 🟢 AGREGA ESTE ESTADO JUNTO A TU VARIABLE fasesCalendario EN APP.JS:
  const [fechaInicioReal, setFechaInicioReal] = useState("Cargando fecha...");
  const [fechaLimiteReal, setFechaLimiteReal] = useState("Cargando plazo...");


  const [fasesCalendario, setFasesCalendario] = useState({
    deshabilitarCursosAlumno: false,
    deshabilitarNotasAlumno: false,
    deshabilitarRegistroNotasDocente: false,
    deshabilitarRecepcionActividadesDocente: false
  });

  // 📡 CONSULTA SÍNCRONA DE CRONOGRAMA: Se ejecuta al levantar el portal
  useEffect(() => {
    const consultarFasesCalendario = async () => {
      try {
        console.log("-> [AXIOS] Evaluando etapas vigentes del calendario con la base de datos...");
        // Golpeamos el endpoint que lee las 4 columnas de tu tabla semestres de MySQL Workbench
        const res = await axios.get('http://localhost:5000/api/cursos/estado-calendario', {
          params: { semestre_id: semestreIdActivo } // Apunta al id 1 (periodo 2026-I) de tu monitor
        });
        if (res.data && res.data.fases) {
          setFasesCalendario(res.data.fases);

          // 🚀 TRUCO DE TRADUCCIÓN: Formateamos de forma ejecutiva la fecha real de Workbench (Ej: "15 de agosto de 2026")
          if (res.data.fechas_oficiales?.apertura_clases) {
            const fechaObj = new Date(res.data.fechas_oficiales.apertura_clases);
            const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
            setFechaInicioReal(fechaObj.toLocaleDateString('es-PE', opciones));
          }

          if (res.data.fechas_oficiales?.limite_matricula) {
            const fechaLimiteObj = new Date(res.data.fechas_oficiales.limite_matricula);

            // 📅 1. Formateamos la fecha (Ej: "12 de Julio de 2026")
            const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
            const fechaTexto = fechaLimiteObj.toLocaleDateString('es-PE', opcionesFecha);

            // ⏰ 2. Formateamos la hora nativa de la BD (Ej: "23:59" o "18:00")
            const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };
            const horaTexto = fechaLimiteObj.toLocaleTimeString('es-PE', opcionesHora);

            // Concatonamos ambas variables en una sola cadena limpia
            setFechaLimiteReal(`${fechaTexto} a las ${horaTexto}`);
          }

        }
      } catch (error) {
        console.error("🚨 Error al jalar las directrices del cronograma institucional:", error);
      }
    };
    consultarFasesCalendario();
  }, []);

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
      axios.get(`http://localhost:5000/api/notas/profesores/perfil/${profesorIdId}`)
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
          profesorNombre={nombreParaSidebar}
          isColapsado={sidebarColapsado}
          onToggleColapso={() => setSidebarColapsado(!sidebarColapsado)}
          vistaActiva={subSeccionActiva}
          // 🚀 EL SECRETO: Cada vez que el docente pulse una pestaña del menú, limpiamos la RAM
          onCambiarVista={(nuevaVista) => {
            setCursoNotaActivo(null); // 🔥 Resetea el curso seleccionado para que siempre abra el catálogo de tarjetas
            setSubSeccionActiva(nuevaVista);
          }}
        />
      )}


      {/* COLUMNA DERECHA: Área de Trabajo Fluida */}
      <div className="contenido-principal">
        {rolActivo === 'estudiante' ? (
          subSeccionActiva === 'perfil' ? (
            /* 👤 Componente de Ficha del Alumno (Crea un div temporal o tu componente si ya lo tienes) */
            <div className="panel-control" key={`perf-est-${estudianteIdId}`}>
              <h2>PERFIL ACADÉMICO DEL ESTUDIANTE</h2>
              <p style={{ marginTop: '15px', color: '#475569' }}>
                Bienvenido al portal institucional. Aquí se desplegará tu información de contacto, ficha de matrícula vigente y estados de cuenta generales.
              </p>
              <div style={{ marginTop: '20px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>
                Documento / Código detectado en sesión: {nombreParaSidebar} (ID: {estudianteIdId})
              </div>
            </div>


          ) : subSeccionActiva === 'cursos' ? (
            /* 📚 FILTRO RECONFIGURADO: Si las clases aún no inician (Etapa Matrícula / Procesamiento) */
            fasesCalendario.deshabilitarCursosAlumno ? (
              /* ⏳ Escenario A: Abre la hermosa e independiente ventana de aviso en pantalla completa */
              <AulaVirtualPendiente
                fechaInicioClases={fechaInicioReal}
              />
            ) : (
              /* 📖 Escenario B: Las clases ya iniciaron -> Carga tu grilla original con tus 7 materias */
              <MisCursosEstudiante
                estudianteId={estudianteIdId}
                semestreId={semestreIdActivo}
                onAbrirCurso={(curso) => {
                  setCursoSeleccionadoEstudiante(curso);
                  setSubSeccionActiva('sesiones-estudiante');
                }}
              />
            )

          ) : subSeccionActiva === 'sesiones-estudiante' ? (
            /* 📋 NUEVA VISTA: Cronograma de clases de este curso específico para el alumno */
            <VerSesionesEstudiante
              cursoId={cursoSeleccionadoEstudiante?.curso_id}
              cursoNombre={cursoSeleccionadoEstudiante?.curso_nombre}
              codigoCurso={cursoSeleccionadoEstudiante?.codigo_curso}
              estudianteId={estudianteIdId}
              semestreId={semestreIdActivo}
              onRegresar={() => setSubSeccionActiva('cursos')}
            />
          ) : subSeccionActiva === 'calificaciones' ? (
            <div className="panel-control">
              <h2>REPORTE CONSOLIDADO DE CALIFICACIONES</h2>
            </div>

          ) : (
            /* 📘 Formulario de Matrícula Blindado contra Nulos */
            /* 🔥 EL TRUCO KEY: Al cambiar estudianteIdId, destruye los estados viejos y se resetea */
            fasesCalendario?.periodoMatriculaVencido ? (

              /* ESTADO 1: El plazo del calendario ya expiró por completo en la Base de Datos */
              /* (Se acabó el límite y punto, desmonta todo y muestra la ventana de MatriculaCerrada) */
              <MatriculaCerrada
                fechaLimiteReal={fechaLimiteReal}
              />
            ) : (
              /* 📘 Escenario B: Dentro de la fecha legal -> Carga tu formulario regular limpio de alertas [01/07/2026] */
              <MatriculaForm
                key={`matr-${estudianteIdId}`}
                estudianteIdFijo={estudianteIdId}
                fechaLimiteBD={fechaLimiteReal}
                onNombreCargado={setNombreParaSidebar}
                // Muta la subsección automáticamente a 'cursos' si el estudiante se inscribe con éxito en red [01/07/2026]
                onMatriculaExitosa={() => setSubSeccionActiva('cursos')}
                alumnoYaMatriculado={fasesCalendario?.deshabilitarCursosAlumno || false}

                onMatriculaExitosa={() => setSubSeccionActiva('cursos')}
              />
            )
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
            /* 🚀 UNIFICACIÓN DE INTEGRIDAD: Evaluamos la bandera deshabilitarCursosAlumno que ya está activa en TRUE */
            fasesCalendario.deshabilitarCursosAlumno ? (
              /* ⏳ Escenario A: Período de matrícula/procesamiento activo -> Carga la ventana premium con tu aviso */
              <CargaDocentePendiente
                fechaInicioClases={fechaInicioReal}
              />
            ) : (
              /* 📚 Escenario B: Las clases ya iniciaron -> Carga tu panel de tarjetas original de forma libre */
              <MisCursosProfesor
                profesorIdId={profesorIdId}
                onCambiarVista={setSubSeccionActiva}
                onAbrirSesiones={(curso) => {
                  setCursoParaSesiones(curso);
                  setSubSeccionActiva('sesiones');
                }}
              />
            )
          ) : subSeccionActiva === 'recepcion-actividades' ? (
            /* 🚀 FILTRO EN CALIENTE: Si las clases aún no inician, desviamos al aviso diferencial [01/07/2026] */
            fasesCalendario.deshabilitarCursosAlumno ? (
              <BandejaDocentePendiente />
            ) : (
              /* 📁 Si el ciclo ya arrancó de forma formal, despliega la bandeja de cursos regular [01/07/2026] */
              <BandejaCursosEvaluacion
                profesorIdId={profesorIdId}
                onAbrirBandejaCurso={(curso) => {
                  setCursoParaSesiones(curso);
                  setSubSeccionActiva('evaluar-actividades');
                }}
              />
            )
          ) : subSeccionActiva === 'evaluar-actividades' ? (
            <BandejaActividadesDocente
              cursoId={cursoParaSesiones?.id || cursoParaSesiones?.curso_id || cursoParaSesiones?.carga_id}
              cursoNombre={cursoParaSesiones?.curso_nombre || cursoParaSesiones?.nombre}
              codigoCurso={cursoParaSesiones?.codigo}
              onRegresar={() => setSubSeccionActiva('recepcion-actividades')}

              // 🔥 LA SOLUCIÓN CLAVE: Inyectamos la función puente que faltaba en tu monitor
              onAbrirAuditoria={(act) => {
                setActividadParaEvaluar(act);
                setSubSeccionActiva('auditar-entrega');
              }}
            />
          ) : subSeccionActiva === 'auditar-entrega' ? (
            /* 📥 NUEVO COMPONENTE EN PANTALLA COMPLETA */
            <AuditoriaEntregasAlumnos
              cursoId={cursoParaSesiones?.id || cursoParaSesiones?.curso_id || cursoParaSesiones?.carga_id}
              actividad={actividadParaEvaluar}
              onRegresar={() => setSubSeccionActiva('evaluar-actividades')}
            />
          ) : subSeccionActiva === 'sesiones' ? (
            <GestionarSesiones
              cursoNombre={cursoParaSesiones?.nombre}
              codigoCurso={cursoParaSesiones?.codigo}
              cursoId={cursoParaSesiones?.id}
              onRegresar={() => setSubSeccionActiva('cursos')}
              // 🔥 CAPTURAMOS LA SESIÓN ELEGIDA DESDE EL HIJO Y CAMBIAMOS LA VISTA
              onAbrirContenido={(sesion) => {
                setSesionParaContenido(sesion);
                // Evaluamos el tipo de acción enviado por el botón
                if (sesion.tipoAccion === 'asistencia') {
                  setSubSeccionActiva('asistencia'); // 👈 Activa la pestaña dedicada limpia
                } else {
                  setSubSeccionActiva('contenido-clase');
                }
              }}
            />
          ) : subSeccionActiva === 'contenido-clase' ? (
            /* 🔥 NUEVA PESTAÑA: Panel de Edición y Materiales */
            <ContenidoClase
              sesionNumero={sesionParaContenido?.numero}
              tituloInicial={sesionParaContenido?.titulo}
              sesionId={sesionParaContenido?.id}
              onRegresar={() => setSubSeccionActiva('sesiones')}
            />
          ) : subSeccionActiva === 'asistencia' ? (
            <RegistrarAsistencia
              sesionNumero={sesionParaContenido?.numero || sesionParaContenido?.numero_sesion}
              cursoNombre={cursoParaSesiones?.nombre}

              // 🔥 LA CORRECCIÓN DEFINITIVA: Jala el ID real del curso activo desde la sesión seleccionada 
              // o desde el catálogo general. Eliminamos los números fijos (como 17 o 1) para que sea 100% dinámico.
              cursoId={sesionParaContenido?.curso_id || cursoParaSesiones?.id}

              sesionId={sesionParaContenido?.id}
              onRegresar={() => setSubSeccionActiva('sesiones')}
            />
          ) : (subSeccionActiva === 'notas' || subSeccionActiva === 'registro-notas' || subSeccionActiva === 'calificaciones') ? (
            /* 🚀 COMPORTAMIENTO BLINDADO: El módulo opera estrictamente si la subsección es 'notas' */
            fasesCalendario.deshabilitarCursosAlumno ? (
              <ActasNotasPendiente />
            ) : (
              /* Decidimos de forma reactiva qué ventana pintar en pantalla completa [01/07/2026] */
              cursoNotaActivo ? (
                /* Ventana B: Sábana de Notas con los alumnos matriculados de tu base de datos */
                <ActaCalificacionesCurso
                  curso={cursoNotaActivo}
                  profesorId={profesorIdId}
                  semestreId={semestreIdActivo}
                  onRegresar={() => setCursoNotaActivo(null)} // ⬅ Resetea el estado local al pulsar el enlace de regreso
                />
              ) : (
                /* Ventana A: El catálogo general de tarjetas de asignaturas de tu monitor */
                <RegistroNotasDocente
                  profesorId={profesorIdId}
                  semestreId={semestreIdActivo}
                  onSeleccionarCurso={(curso) => {
                    console.log("-> Curso seleccionado para evaluar:", curso);
                    setCursoNotaActivo(curso);
                  }}
                />
              )
            ) 
          ): (
            /* 🚀 CIERRE MATE DE LA CASCADA: Si no coincide con ninguna vista de arriba, no pinta nada roto */
            null
          ))}
      </div>

    </div>
  );
}

export default App;




