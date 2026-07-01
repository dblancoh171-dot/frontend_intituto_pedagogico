import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 🟢 CABECERA BLINDADA: Recibe las propiedades usando guiones bajos estrictos y limpios
const VerSesionesEstudiante = ({ cursoId, cursoNombre, codigoCurso, estudianteId, semestreId, onRegresar }) => {
    const [sesiones, setSesiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [sesionDesplegada, setSesionDesplegada] = useState(null);

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
        <div style={{ padding: '32px', display: 'flex', gap: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* PANEL IZQUIERDO: Tarjeta de Información Fija del Curso */}
            <div style={{ width: '280px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: 'fit-content', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
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


                                    {/* 📝 SECCIÓN 2: TRABAJOS PENDIENTES EN CASCADA REAL */}
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {s.actividades && s.actividades.length > 0 ? (
                                                s.actividades.map((act, idx) => (
                                                    <div
                                                        key={act.id || idx}
                                                        style={{
                                                            padding: '20px 22px',
                                                            border: '1px solid #cbd5e1',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            backgroundColor: '#ffffff',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)'
                                                        }}
                                                    >
                                                        {/* Lado Izquierdo: Ficha del Trabajo */}
                                                        <div style={{ flex: 1, paddingRight: '20px' }}>
                                                            <strong style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                                                                {act.titulo}
                                                            </strong>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0 8px 0' }}>
                                                                <span style={{
                                                                    fontSize: '10.5px',
                                                                    fontWeight: '800',
                                                                    backgroundColor: act.estado === 'COMPLETO' ? '#dcfce7' : '#fef3c7',
                                                                    color: act.estado === 'COMPLETO' ? '#16a34a' : '#d97706',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px'
                                                                }}>
                                                                    {act.estado}
                                                                </span>
                                                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                                                    | Límite: {act.fecha}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.4', maxWidth: '480px' }}>
                                                                <strong>Descripción:</strong> {act.desc || 'Desarrollar según pautas del profesor.'}
                                                            </p>

                                                            {act.archivo_guia ? (
                                                                <div style={{ marginTop: '10px' }}>
                                                                    <a
                                                                        // Apuntamos a la carpeta física de subidas de Express + el nombre del archivo (Ej: 1782675356614.pdf)
                                                                         href={`http://localhost:5000${act.archivo_guia}`}
                                                                        download
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            fontSize: '11.5px',
                                                                            fontWeight: '700',
                                                                            color: '#2563eb',
                                                                            backgroundColor: '#eff6ff',
                                                                            padding: '5px 12px',
                                                                            borderRadius: '4px',
                                                                            textDecoration: 'none',
                                                                            border: '1px solid #dbeafe',
                                                                            transition: 'all 0.15s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                                                    >
                                                                        <span>📄 Descargar Archivo Guía / Pauta ({act.archivo_guia.split('/').pop()})</span>
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                                    📌 Sin archivo guía adjunto para esta evaluación.
                                                                </div>
                                                            )}

                                                        </div>

                                                        {/* Lado Derecho: Zona de Carga + Botón de Envío Visual */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                                                            <div style={{ border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f8fafc' }}>
                                                                <button type="button" style={{ height: '32px', padding: '0 14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>
                                                                    SUBIR ARCHIVO
                                                                </button>
                                                                <span style={{ fontSize: '10.5px', color: '#475569', fontWeight: '500', width: '150px', lineHeight: '1.3' }}>
                                                                    Formatos: {act.tipo_documento || 'PDF/ZIP'}, max 15MB
                                                                </span>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                style={{
                                                                    height: '34px',
                                                                    padding: '0 20px',
                                                                    backgroundColor: '#0284c7',
                                                                    color: '#ffffff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    fontWeight: '700',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '6px',
                                                                    transition: 'background-color 0.15s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                                                            >
                                                                <span>🚀 Confirmar y Enviar Actividad</span>
                                                            </button>
                                                        </div>

                                                    </div>
                                                ))
                                            ) : (
                                                <p style={{ margin: '10px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                                                    No se registran tareas pendientes para esta sesión de aprendizaje.
                                                </p>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    );
                })}

            </div>

        </div>

    );
};

export default VerSesionesEstudiante;
