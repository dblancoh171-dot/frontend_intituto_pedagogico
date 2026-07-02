import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🟢 CABECERA BLINDADA: Recibe las propiedades usando guiones bajos estrictos y limpios
const VerSesionesEstudiante = ({ cursoId, cursoNombre, codigoCurso, estudianteId, semestreId, onRegresar }) => {
    const [sesiones, setSesiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sesionDesplegada, setSesionDesplegada] = useState(null);

    const [dragActivoActividad, setDragActivoActividad] = useState({});
    const [archivosCargadosActividad, setArchivosCargadosActividad] = useState({});

    const [comentariosActividad, setComentariosActividad] = useState({});

    const [subiendoActividad, setSubiendoActividad] = useState({});

    // 🟢 FUNCIÓN EXCLUSIVA DE REFRESCO EXTRÍDA PARA SER REUTILIZABLE
    const cargarCronogramaDetallado = async () => {
        if (!cursoId || !estudianteId) return;
        try {
            console.log(`-> [AXIOS] Refrescando ventana de datos de forma silenciosa...`);
            const res = await axios.get('http://localhost:5000/api/cursos/cronograma-estudiante', {
                params: {
                    curso_id: Number(cursoId),
                    semestre_id: Number(semestreId || 1),
                    estudiante_id: Number(estudianteId)
                }
            });
            setSesiones(res.data || []);

            // Poblamos los comentarios previos de la BD
            const comentariosIniciales = {};
            res.data.forEach(sesion => {
                if (sesion.actividades) {
                    sesion.actividades.forEach(act => {
                        if (act.comentario_previo) {
                            comentariosIniciales[act.id] = act.comentario_previo;
                        }
                    });
                }
            });
            setComentariosActividad(comentariosIniciales);
        } catch (error) {
            console.error("🚨 Error al recuperar el cronograma:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const cargarCronogramaDetallado = async () => {
            // 🔥 CORRECCIÓN CLAVE: Evaluamos las variables legítimas de la cabecera
            if (!cursoId || !estudianteId) {
                console.log("-> [PAUSA] Esperando identificadores válidos para la consulta.");
                return;
            }
            try {
                setCargando(true);
                console.log(`-> [AXIOS] Conectando a la BD. Curso: ${cursoId} | Alumno: ${estudianteId}`);

                // 🚀 PARÁMETROS LIMPIOS CON GUIONES BAJOS PARA EXPRESS
                const res = await axios.get('http://localhost:5000/api/cursos/cronograma-estudiante', {
                    params: {
                        curso_id: Number(cursoId),
                        semestre_id: Number(semestreId || 1),
                        estudiante_id: Number(estudianteId)
                    }
                });
                setSesiones(res.data || []);

                // 🚀 NUEVO: Mapeamos los comentarios previos de la BD para habilitar la edición instantánea
                const comentariosIniciales = {};
                res.data.forEach(sesion => {
                    if (sesion.actividades) {
                        sesion.actividades.forEach(act => {
                            if (act.comentario_previo) {
                                comentariosIniciales[act.id] = act.comentario_previo;
                            }
                        });
                    }
                });
                setComentariosActividad(comentariosIniciales);
            } catch (error) {
                console.error("🚨 Error al recuperar el cronograma interactivo:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarCronogramaDetallado();
    }, [cursoId, estudianteId, semestreId]);
    if (cargando) {
        return <div style={{ padding: '32px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Cargando aula virtual...</div>;
    }

    return (
        <div style={{ padding: '12px', display: 'flex', gap: '24px', backgroundColor: '#b1b4b8', minHeight: '100vh' }}>
            {/* PANEL IZQUIERDO: Tarjeta de Información Fija del Curso */}
            <div style={{ width: '200px', backgroundColor: '#ffffff', border: '1px solid #cccaca', borderRadius: '12px', padding: '20px', height: 'fit-content', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                <button type="button" onClick={onRegresar} style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⬅ Volver a Mis Cursos
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{cursoNombre}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '16px' }}>Código: {codigoCurso}</span>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Semestre actual</span>
                    <strong style={{ fontSize: '13.5px', color: '#334155', display: 'block', marginBottom: '12px' }}>2026-II</strong>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Docente</span>
                    <strong style={{ fontSize: '13.5px', color: '#334155' }}>Ing. Roberto Chávez</strong>
                </div>
            </div>

            {/* PANEL DERECHO: Acordeón Dinámico de Sesiones en Cascada */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sesiones.map((s) => {
                    const estaAbierto = sesionDesplegada === s.sesion_id;
                    return (
                        <div key={s.sesion_id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            {/* 🗓️ CABECERA DE LA SESIÓN EN DOS NIVELES COHESIVOS */}
                            <div
                                onClick={() => setSesionDesplegada(estaAbierto ? null : s.sesion_id)}
                                style={{ padding: '18px 24px', backgroundColor: estaAbierto ? '#2563eb' : '#ffffff', color: estaAbierto ? '#ffffff' : '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: estaAbierto ? 'none' : '1px solid #e2e8f0', transition: 'all 0.2s ease-in-out', userSelect: 'none', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, paddingRight: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: '800', whiteSpace: 'nowrap' }}>{estaAbierto ? '▼' : '▶'} Sesión {String(s.numero_sesion).padStart(2, '0')}:</span>
                                        <strong style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>{s.sesion_titulo ? s.sesion_titulo.replace(/^Sesión\s+\d+:\s*/i, '').trim() : 'Tema de Clase'}</strong>
                                    </div>
                                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: estaAbierto ? 'rgba(255,255,255,0.85)' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>📅 Fecha de Clase:</span>
                                        <span style={{ fontWeight: '700' }}>{s.fecha_clase_formateada || 'Por definir'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexShrink: 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: estaAbierto ? 'rgba(255,255,255,0.80)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actividades:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px', backgroundColor: !s.url_material ? '#f1f5f9' : '#fee2e2', color: !s.url_material ? '#64748b' : '#ef4444' }}>{!s.url_material ? 'No Asignado' : 'Incompleto'}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: '700', color: estaAbierto ? 'rgba(255,255,255,0.80)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asistencia:</span>
                                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.3px', backgroundColor: s.mi_asistencia === 'asistio' ? '#dcfce7' : s.mi_asistencia === 'falto' ? '#fee2e2' : '#fef3c7', color: s.mi_asistencia === 'asistio' ? '#16a34a' : s.mi_asistencia === 'falto' ? '#ef4444' : '#d97706' }}>{s.mi_asistencia === 'asistio' ? 'Asistió' : s.mi_asistencia === 'falto' ? 'Faltó' : 'Pendiente'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 📂 CUERPO INTERNO DESPLEGABLE */}
                            {estaAbierto && (
                                <div style={{ padding: '24px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid #e2e8f0' }}>
                                    {/* 📋 REPOSITORIO DE ARCHIVOS */}
                                    <div>
                                        <h4 style={{
                                            margin: '0 0 14px 0',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            color: '#334155',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px'
                                        }}>
                                            📁 1. Repositorio de Archivos
                                        </h4>
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            {s.url_material ? (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    width: '340px',
                                                    padding: '12px 16px',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#ffffff',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        {/* Icono de tipo de archivo institucional (PDF) */}
                                                        <div style={{
                                                            width: '34px',
                                                            height: '38px',
                                                            backgroundColor: '#fee2e2',
                                                            borderRadius: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            color: '#ef4444'
                                                        }}>
                                                            PDF
                                                        </div>
                                                        <div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: '700',
                                                                color: '#1e293b',
                                                                maxWidth: '190px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {s.nombre_material || 'Clase_Adjunta.pdf'}
                                                            </div>
                                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                                2.4 MB
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Botón de acción con enlace directo de descarga al Backend */}
                                                    <a
                                                        href={`http://localhost:5000${s.url_material}`}
                                                        download
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: '#2563eb',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#ffffff',
                                                            textDecoration: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s ease'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                                    >
                                                        📥
                                                    </a>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    No se adjuntaron documentos de lectura para esta sesión.
                                                </span>
                                            )}
                                        </div>
                                    </div>


                                    {/* 📝 SECCIÓN 2: TRABAJOS PENDIENTES CON CONTROL ESTRICTO DE FECHA VENCIDA */}
                                    {/* 🎚️ EL CONTENEDOR INDUSTRIAL CON SCROLL ACTIVO (MODIFICADO) */}

                                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
                                        <h4 style={{
                                            margin: '0 0 14px 0',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            color: '#334155',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px'
                                        }}>
                                            2. Trabajos Pendientes / Evaluaciones
                                        </h4>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px',

                                            // 🔥 REGLA DE ORO DE TU REQUERIMIENTO:
                                            // Si el arreglo registra más de 2 actividades creadas por el docente, fijamos un alto máximo rígido.
                                            // Cada tarjeta mide aproximadamente 165px de alto + los gaps intermedios.
                                            maxHeight: s.actividades && s.actividades.length > 2 ? '365px' : 'none',

                                            // 🚀 DESBORDAMIENTO INTELIGENTE: Pone la barra de scroll vertical SOLO si los elementos superan el maxHeight
                                            overflowY: s.actividades && s.actividades.length > 2 ? 'auto' : 'visible',

                                            // Espaciado interno derecho extra para que las tarjetas no se peguen a la barra de scroll
                                            paddingRight: s.actividades && s.actividades.length > 2 ? '8px' : '0',

                                            // Estilizado limpio para navegadores modernos
                                            scrollBehavior: 'smooth'
                                        }}>
                                            {s.actividades && s.actividades.length > 0 ? (
                                                s.actividades.map((act, idx) => {
                                                    const esDragActivo = !!dragActivoActividad[act.id];
                                                    const archivoAsignado = archivosCargadosActividad[act.id];

                                                    const llaveAtomicaActividad = `act-sesion-${s.sesion_id}-tarea-${act.id || idx}-idx-${idx}`;

                                                    // ⏳ DETECTOR CRÍTICO DE TIEMPO EXTRAÍDO DESDE MYSQL:
                                                    // Tu Backend envía la fecha formateada en texto (Ej: "30 Jun 2026, 18:00")
                                                    // Creamos un formateador rápido para reconstruir el objeto Date real y compararlo con el reloj actual [01/07/2026]
                                                    const parsearFechaMySQL = (fechaStr) => {
                                                        if (!fechaStr) return new Date();
                                                        // Si tu backend ya manda un formato convertible o ISO directo, Date.parse lo lee.
                                                        // Mapeamos de respaldo convirtiendo los meses en español a números si fuera necesario
                                                        const meses = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
                                                        const partes = fechaStr.toLowerCase().replace(/,/g, '').split(' ');
                                                        if (partes.length >= 4) {
                                                            const dia = parseInt(partes[0], 10);
                                                            const mes = meses[partes[1]] || 0;
                                                            const anio = parseInt(partes[2], 10);
                                                            const horaPartes = partes[3].split(':');
                                                            const hora = parseInt(horaPartes[0], 10);
                                                            const min = parseInt(horaPartes[1], 10);
                                                            return new Date(anio, mes, dia, hora, min);
                                                        }
                                                        return new Date(fechaStr); // Respaldo nativo
                                                    };

                                                    const fechaLimiteDate = parsearFechaMySQL(act.fecha);
                                                    const fechaActual = new Date(); // Captura la fecha y hora de la computadora en este instante [01/07/2026]

                                                    // 🚨 CONDICIÓN DE BLOQUEO: Sabe si el plazo de entrega ya se extinguió en el monitor
                                                    const estaFueraDeTiempo = fechaActual > fechaLimiteDate;

                                                    // Manejador de Archivos Local
                                                    const procesarArchivoHijo = (file) => {
                                                        if (!file || estaFueraDeTiempo) return; // Doble seguro ante bloqueos
                                                        const nombreArchivo = file.name;
                                                        const extension = nombreArchivo.substring(nombreArchivo.lastIndexOf('.')).toLowerCase();
                                                        const extensionesPermitidas = ['.pdf', '.zip'];
                                                        if (act.tipo_documento === 'docx') extensionesPermitidas.push('.docx', '.doc');

                                                        if (!extensionesPermitidas.includes(extension)) {
                                                            alert(`❌ Formato Rechazado: Para esta actividad solo se aceptan documentos ${String(act.tipo_documento).toUpperCase()}.`);
                                                            return;
                                                        }
                                                        if (file.size > 15 * 1024 * 1024) {
                                                            alert("⚠️ El archivo supera el límite máximo permitido de 15MB.");
                                                            return;
                                                        }
                                                        setArchivosCargadosActividad(prev => ({ ...prev, [act.id]: file }));
                                                    };

                                                    return (
                                                        <div
                                                            key={llaveAtomicaActividad}
                                                            style={{
                                                                padding: '20px 22px',
                                                                border: estaFueraDeTiempo ? '1px solid #fca5a5' : '1px solid #cbd5e1', // Borde rojo tenue si expiró
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                backgroundColor: estaFueraDeTiempo ? '#fff5f5' : '#ffffff',
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)',
                                                                opacity: subiendoActividad[act.id] ? 0.55 : 1,
                                                                pointerEvents: subiendoActividad[act.id] ? 'none' : 'auto',
                                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }}
                                                        >
                                                            {/* 📋 EVALUACIÓN DE ESCENARIOS A NIVEL DE INTERFAZ DE USUARIO (UI) */}
                                                            {estaFueraDeTiempo ? (
                                                                /* ❌ ESCENARIO 01: EL TIEMPO LÍMITE VENCIÓ (Oculta zona de subida y muestra la alerta) */
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '4px 0' }}>
                                                                    {/* Icono de advertencia en un círculo carmín */}
                                                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                                                        🚫
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                            <strong style={{ fontSize: '14.5px', fontWeight: '800', color: '#991b1b' }}>
                                                                                {act.titulo}
                                                                            </strong>
                                                                            <span style={{ fontSize: '10.5px', fontWeight: '900', backgroundColor: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.3px' }}>
                                                                                ENTREGA FUERA DE TIEMPO
                                                                            </span>
                                                                        </div>
                                                                        <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#7f1d1d', fontWeight: '600' }}>
                                                                            ⚠️ El plazo límite establecido para el envío de esta actividad finalizó el día <span style={{ textDecoration: 'underline' }}>{act.fecha}</span>. La plataforma ha congelado la recepción de archivos digitales de forma automática.
                                                                        </p>

                                                                        {/* 📊 NOTA DEL MAESTRO: Visible al cerrarse el límite de la actividad */}
                                                                        <div style={{
                                                                            marginTop: '12px',
                                                                            padding: '10px 14px',
                                                                            backgroundColor: act.nota !== null ? '#f0fdf4' : '#f1f5f9',
                                                                            border: act.nota !== null ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                                                                            borderRadius: '6px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px'
                                                                        }}>
                                                                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                                                                                💯 Calificación:
                                                                            </span>
                                                                            <strong style={{
                                                                                fontSize: '13.5px',
                                                                                fontWeight: '800',
                                                                                color: act.nota !== null ? '#16a34a' : '#64748b'
                                                                            }}>
                                                                                {act.nota !== null ? Number(act.nota).toFixed(0) : 'Ninguna'}
                                                                            </strong>
                                                                        </div>

                                                                    </div>
                                                                </div>

                                                            ) : (

                                                                /* 💎 ESCENARIO 02: TIEMPO VIGENTE (Muestra el contenido regular completo de tu monitor) */
                                                                <>
                                                                    {/* Lado Izquierdo: Ficha informativa de la Tarea / Actividad */}
                                                                    <div style={{ flex: 1, paddingRight: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                                                                        <div>
                                                                            {/* 🏷️ EL NUEVO NIVEL SUPERIOR: Enumerador Correlativo de Actividades */}
                                                                            <span style={{
                                                                                fontSize: '11px',
                                                                                fontWeight: '800',
                                                                                color: '#2563eb', // Azul institucional nítido
                                                                                textTransform: 'uppercase',
                                                                                letterSpacing: '0.5px',
                                                                                display: 'block',
                                                                                marginBottom: '2px'
                                                                            }}>
                                                                                Actividad {idx + 1}:
                                                                            </span>

                                                                            <strong style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'block', letterSpacing: '-0.2px' }}>
                                                                                {act.titulo}
                                                                            </strong>

                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 8px 0' }}>
                                                                                <span style={{
                                                                                    fontSize: '10.5px',
                                                                                    fontWeight: '900',
                                                                                    backgroundColor: archivoAsignado ? '#dcfce7' : (act.estado === 'COMPLETO' ? '#e0f2fe' : '#fef3c7'),
                                                                                    color: archivoAsignado ? '#16a34a' : (act.estado === 'COMPLETO' ? '#0369a1' : '#d97706'),
                                                                                    padding: '2px 6px',
                                                                                    borderRadius: '4px',
                                                                                    letterSpacing: '0.2px',
                                                                                    // 👇 REEMPLAZA O AGREGA ESTAS LÍNEAS
                                                                                    display: 'inline-flex',
                                                                                    flexDirection: 'column',
                                                                                    alignItems: 'center',
                                                                                    textAlign: 'center',
                                                                                    width: 'fit-content'
                                                                                }}>
                                                                                    {archivoAsignado ? 'LISTO PARA REENVIAR' : (act.estado === 'COMPLETO' ? '✔ ENTREGADO (EDITABLE)' : '⏳ PENDIENTE')}
                                                                                </span>
                                                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                                                                    | Límite: {act.fecha}
                                                                                </span>
                                                                            </div>

                                                                            <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: '1.4', maxWidth: '480px' }}>
                                                                                <strong>Descripción:</strong> {act.desc || 'Desarrollar según pautas del profesor.'}
                                                                            </p>

                                                                            {/* 📊 NOTA DEL MAESTRO EN TIEMPO VIGENTE (Soporte dinámico) */}
                                                                            {act.estado === 'COMPLETO' && (
                                                                                <div style={{ marginTop: '10px', padding: '8px 12px', backgroundColor: act.nota !== null ? '#f0fdf4' : '#f1f5f9', border: act.nota !== null ? '1px solid #bbf7d0' : '1px solid #e2e8f0', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                                                                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>💯 Calificación:</span>
                                                                                    <strong style={{ fontSize: '13px', fontWeight: '800', color: act.nota !== null ? '#16a34a' : '#64748b' }}>
                                                                                        {act.nota !== null ? Number(act.nota).toFixed(0) : 'Ninguna'}
                                                                                    </strong>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Enlace Condicional Seguro para Descargar el Archivo Guía / Rúbrica */}
                                                                        {act.archivo_guia && (
                                                                            <div style={{ marginTop: '12px' }}>
                                                                                <a
                                                                                    href={`http://localhost:5000${act.archivo_guia}`}
                                                                                    target="_blank" rel="noopener noreferrer"
                                                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '5px 12px', borderRadius: '4px', textDecoration: 'none', border: '1px solid #dbeafe', cursor: 'pointer' }}
                                                                                >
                                                                                    <span>📄 Abrir y Guardar Archivo Guía / Pauta</span>
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Lado Derecho: Zona de Carga, Entrada de Comentario y Botón de Confirmación Real */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0, width: '450px' }}>

                                                                        {/* 🗚 CASILLERO DRAG & DROP INTERACTIVO */}
                                                                        <div
                                                                            onDragOver={(e) => { e.preventDefault(); setDragActivoActividad(prev => ({ ...prev, [act.id]: true })); }}
                                                                            onDragLeave={(e) => { e.preventDefault(); setDragActivoActividad(prev => ({ ...prev, [act.id]: false })); }}
                                                                            onDrop={(e) => {
                                                                                e.preventDefault();
                                                                                setDragActivoActividad(prev => ({ ...prev, [act.id]: false }));

                                                                                // 🔥 CORRECCIÓN 1: Extracción estricta del primer archivo arrastrado
                                                                                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                                                                    procesarArchivoHijo(e.dataTransfer.files[0]);
                                                                                }
                                                                            }}
                                                                            style={{ border: esDragActivo ? '1px dashed #2563eb' : '1px solid #cbd5e1', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: esDragActivo ? '#f0f9ff' : '#f8fafc', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' }}
                                                                        >
                                                                            <input
                                                                                type="file"
                                                                                id={`file-input-${act.id}`}
                                                                                style={{ display: 'none' }}
                                                                                accept={act.tipo_documento === 'docx' ? '.docx,.doc' : '.pdf'}
                                                                                onChange={(e) => {
                                                                                    // 🔥 CORRECCIÓN 2 (EL ERROR CRÍTICO DE TU PANTALLA): Extraemos el archivo individual [0] del explorador
                                                                                    if (e.target.files && e.target.files.length > 0) {
                                                                                        procesarArchivoHijo(e.target.files[0]);
                                                                                    }
                                                                                }}
                                                                            />

                                                                            {/* 🔥 COLUMNA INTEGRAL DE FORMATO: Agrupa el icono y la etiqueta de peso solicitado */}
                                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                                                                {/* Icono Reactivo PDF/DOCX de tu monitor */}
                                                                                <div style={{
                                                                                    width: '42px', height: '44px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase',
                                                                                    backgroundColor: String(act.tipo_documento).toLowerCase() === 'docx' ? '#eff6ff' : '#fee2e2',
                                                                                    color: String(act.tipo_documento).toLowerCase() === 'docx' ? '#2563eb' : '#ef4444',
                                                                                    border: String(act.tipo_documento).toLowerCase() === 'docx' ? '1px solid #bfdbfe' : '1px solid #fca5a5'
                                                                                }}>
                                                                                    {act.tipo_documento || 'PDF'}
                                                                                </div>

                                                                                {/* 🏷️ EL NUEVO INDICADOR SOLICITADO: Fijo, visible y centrado abajo del icono */}
                                                                                <span style={{
                                                                                    fontSize: '9.5px',
                                                                                    fontWeight: '800',
                                                                                    color: '#64748b',
                                                                                    textTransform: 'uppercase',
                                                                                    letterSpacing: '0.2px',
                                                                                    backgroundColor: '#e2e8f0',
                                                                                    padding: '1px 5px',
                                                                                    borderRadius: '3px',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    Max 15Mb
                                                                                </span>
                                                                            </div>

                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                <button type="button" onClick={() => document.getElementById(`file-input-${act.id}`).click()} style={{ height: '32px', padding: '0 14px', backgroundColor: archivoAsignado ? '#475569' : '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>
                                                                                    {archivoAsignado ? '🔄 Cambiar' : 'SUBIR ARCHIVO'}
                                                                                </button>
                                                                                {archivoAsignado && (
                                                                                    <button type="button" title="Retirar documento" onClick={() => setArchivosCargadosActividad(prev => { const copia = { ...prev }; delete copia[act.id]; return copia; })} style={{ height: '32px', width: '32px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>🗑️</button>
                                                                                )}
                                                                            </div>

                                                                            <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {archivoAsignado ? (
                                                                                    /* 📎 Caso A: El alumno acaba de arrastrar o seleccionar un archivo nuevo en su computadora */
                                                                                    <strong
                                                                                        title={archivoAsignado.name} // 🔥 Muestra el nombre completo del nuevo archivo al pasar el mouse
                                                                                        style={{ color: '#16a34a' }}
                                                                                    >
                                                                                        📎 {archivoAsignado.name}
                                                                                    </strong>
                                                                                ) : act.archivo_alumno_url ? (
                                                                                    /* 📄 Caso B: Muestra el nombre real de la BD garantizando siempre la extensión visible */
                                                                                    (() => {
                                                                                        const nombreBase = act.nombre_real_alumno || 'Trabajo_Entregado';
                                                                                        let nombreCompletoConExtension = nombreBase;

                                                                                        if (!nombreBase.includes('.')) {
                                                                                            const urlMin = act.archivo_alumno_url.toLowerCase();
                                                                                            const extensionReal = urlMin.endsWith('.docx') ? '.docx'
                                                                                                : urlMin.endsWith('.doc') ? '.doc'
                                                                                                    : urlMin.endsWith('.zip') ? '.zip'
                                                                                                        : '.pdf';
                                                                                            nombreCompletoConExtension = `${nombreBase}${extensionReal}`;
                                                                                        }

                                                                                        return (
                                                                                            <a
                                                                                                href={`http://localhost:5000${act.archivo_alumno_url}`}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                                title={nombreCompletoConExtension} // 🔥 EL CAMBIO CLAVE: Hace aparecer el cartel flotante nativo con el nombre completo sin recortes
                                                                                                style={{
                                                                                                    color: '#0284c7',
                                                                                                    textDecoration: 'underline',
                                                                                                    fontWeight: '700',
                                                                                                    cursor: 'pointer',
                                                                                                    display: 'inline-flex',
                                                                                                    alignItems: 'center'
                                                                                                }}
                                                                                            >
                                                                                                📎 {nombreCompletoConExtension}
                                                                                            </a>
                                                                                        );
                                                                                    })()
                                                                                ) : (
                                                                                    /* 📂 Caso C: El casillero está totalmente inmaculado y esperando entrega */
                                                                                    "Arrastra o haz clic aquí"
                                                                                )}
                                                                            </span>




                                                                        </div>

                                                                        {/* 📝 NUEVA CAJA DE COMENTARIOS PARA EL DOCENTE (Aumenta estéticamente el alto) */}
                                                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                            <label htmlFor={`comment-${act.id}`} style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                                                                                ✍️ Agregar comentario para el docente:
                                                                            </label>
                                                                            <textarea
                                                                                id={`comment-${act.id}`}
                                                                                rows="2"
                                                                                placeholder="Escribe aquí alguna nota aclaratoria o mensaje sobre tu entrega si es necesario..."
                                                                                value={comentariosActividad[act.id] || ''}
                                                                                onChange={(e) => setComentariosActividad(prev => ({ ...prev, [act.id]: e.target.value }))}
                                                                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'sans-serif', resize: 'none', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none', transition: 'border-color 0.15s' }}
                                                                                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                                                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                                                            />
                                                                        </div>


                                                                        {/* ⏳ EL NUEVO INDICADOR SOLICITADO: Subido última vez (CONDICIONAL) */}
                                                                        {act.fecha_entrega_formateada && (
                                                                            <div style={{
                                                                                width: '100%',
                                                                                textAlign: 'left',
                                                                                fontSize: '11px',
                                                                                fontWeight: '600',
                                                                                color: '#64748b',
                                                                                marginTop: '2px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '4px'
                                                                            }}>
                                                                                <span>📅 Subido última vez:</span>
                                                                                <strong style={{ color: '#0f172a', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                                                                    {act.fecha_entrega_formateada}
                                                                                </strong>
                                                                            </div>
                                                                        )}


                                                                        {/* 🚀 BOTÓN CONFIRMAR AHORA 100% FUNCIONAL Y CONECTADO MEDIANTE AXIOS */}
                                                                        {/* 🚀 BOTÓN CONFIRMAR: ENVÍA EL FORMULARIO BINARIO Y GATILLA EL REFRESCO INMEDIATO DE DATOS */}
                                                                        <button
                                                                            type="button"
                                                                            // 🔥 CONTROL DE BLOQUEO INTERNO: Si ya se está subiendo el archivo, se deshabilita el clic para evitar duplicados
                                                                            disabled={!archivoAsignado || !!subiendoActividad[act.id]}
                                                                            onClick={async () => {
                                                                                if (!archivoAsignado || subiendoActividad[act.id]) return;

                                                                                try {
                                                                                    // ⏳ ACTIVAMOS EL LETRERO DE ESPERA EN TU MONITOR
                                                                                    setSubiendoActividad(prev => ({ ...prev, [act.id]: true }));
                                                                                    console.log("-> [AXIOS] Subiendo paquete binario Form-Data...");

                                                                                    const formData = new FormData();
                                                                                    formData.append('archivo_entregable', archivoAsignado);
                                                                                    formData.append('actividad_id', act.id);
                                                                                    formData.append('estudiante_id', estudianteId);
                                                                                    formData.append('comentario_alumno', comentariosActividad[act.id] || '');

                                                                                    const res = await axios.post('http://localhost:5000/api/entregas/enviar-trabajo', formData, {
                                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                                    });

                                                                                    alert(`🎉 ${res.data.message}`);

                                                                                    // Limpiamos los casilleros de esta actividad en memoria
                                                                                    setArchivosCargadosActividad(prev => { const c = { ...prev }; delete c[act.id]; return c; });

                                                                                    // 🔄 RECARGA SILENCIOSA: Sincroniza la ventana con los datos frescos de la BD
                                                                                    await cargarCronogramaDetallado();

                                                                                } catch (error) {
                                                                                    console.error("🚨 Fallo en la red al enviar la actividad:", error);
                                                                                    alert(error.response?.data?.message || "Hubo un error al procesar el envío en el servidor.");
                                                                                } finally {
                                                                                    // 🏁 LIBERAMOS EL ESTADO DE ESPERA TRAS CONCLUIR EL PROCESO
                                                                                    setSubiendoActividad(prev => ({ ...prev, [act.id]: false }));
                                                                                }
                                                                            }}
                                                                            style={{
                                                                                height: '36px',
                                                                                width: '100%',
                                                                                // 🎨 UX DINÁMICO DE COLORES: Cambia a gris pizarra de espera mientras se realiza la subida
                                                                                backgroundColor: subiendoActividad[act.id] ? '#64748b' : (archivoAsignado ? '#0284c7' : '#cbd5e1'),
                                                                                color: archivoAsignado || subiendoActividad[act.id] ? '#ffffff' : '#94a3b8',
                                                                                border: 'none',
                                                                                borderRadius: '6px',
                                                                                fontSize: '12.5px',
                                                                                fontWeight: '700',
                                                                                // 🛑 CURSOR ADAPTATIVO: Muestra el reloj de arena si está procesando la red
                                                                                cursor: subiendoActividad[act.id] ? 'wait' : (archivoAsignado ? 'pointer' : 'not-allowed'),
                                                                                boxShadow: archivoAsignado && !subiendoActividad[act.id] ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none',
                                                                                transition: 'all 0.15s ease-in-out',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gap: '6px'
                                                                            }}
                                                                        >
                                                                            {/* 🧠 EL MENSAJE DINÁMICO SOLICITADO: Cambia el texto en vivo según el estado de la red */}
                                                                            {subiendoActividad[act.id] ? (
                                                                                <span>⏳ Subiendo actividad... Por favor, espere.</span>
                                                                            ) : (
                                                                                <span>🚀 {act.estado === 'COMPLETO' ? 'Actualizar e Invalidar Entrega Previa' : 'Confirmar y Enviar Actividad'}</span>
                                                                            )}
                                                                        </button>

                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <p style={{ margin: '10px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                                                    No se registran tareas pendientes para esta sesión de aprendizaje.
                                                </p>
                                            )}
                                        </div >


                                    </div>

                                </div>
                            )
                            }
                        </div>
                    );
                })}

            </div>

        </div >

    );
};

export default VerSesionesEstudiante;
