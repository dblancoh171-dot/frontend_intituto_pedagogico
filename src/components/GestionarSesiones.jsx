import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GestionarSesiones = ({ cursoNombre, codigoCurso, cursoId, onRegresar, onAbrirContenido }) => {
    const [sesiones, setSesiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const semestreId = 1; // ID de tu semestre activo

    // 📡 1. FUNCIÓN DE CARGA REAL DESDE LA BASE DE DATOS


    // Recargar al abrir el componente
    useEffect(() => {

        if (!cursoId) {
            setCargando(false);
            return;
        }

        const cargarSesionesBD = async () => {
            try {
                // 📡 SINCRO REAL: Apuntamos al endpoint que calcula tus óvalos cronológicos de la BD
                const res = await axios.get(`http://localhost:5000/api/notas/sesiones-curso`, {
                    params: { curso_id: cursoId, semestre_id: semestreId }
                });

                // Si el backend te devuelve los cursos, tomamos la carga relacional
                setSesiones(res.data || []);
            } catch (error) {
                console.error("Error al conectar las sesiones de la BD:", error);
                setSesiones([]);
            } finally {
                setCargando(false);
            }
        };

        cargarSesionesBD();
    }, [cursoId]);

    if (cargando) return <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Consultando sesiones en Aiven.io...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.25s ease-in-out', maxWidth: '1100px', margin: '0 auto' }}>

            <button
                type="button"
                onClick={onRegresar}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
                ← Volver al Catálogo de Cursos
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Control de Sesiones y Clases</h1>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '4px' }}>{codigoCurso}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#1e3a8a', fontWeight: '600' }}>📚 Asignatura: {cursoNombre}</p>
                </div>
            </div>

            {/* 🔥 ALERTA DE BANDEJA VACÍA SEGURA CONTRE BLOQUEOS */}
            {sesiones.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    ⚠️ No se encontraron sesiones planificadas para este curso en la base de datos de Aiven.io.
                </div>
            ) : (

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {sesiones.map((s, index) => (
                        <div
                            key={`sesion-${s.id || index}-${s.numero_sesion}`}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '20px 24px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                                {/* El óvalo azul con el número de sesión (Se mantiene igual) */}
                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#2563eb', fontWeight: 'bold' }}>
                                    {s.numero_sesion}
                                </div>

                                {/* 🔥 LA CORRECCIÓN CLAVE: Inyectamos el texto de forma estática y formateamos el número a 2 dígitos */}
                                <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: '#1e293b' }}>
                                    Sesión {String(s.numero_sesion).padStart(2, '0')}: {s.titulo}
                                </h3>

                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    /* 🔥 PASAMOS LOS DATOS REALES DE LA FILA ACTUALIZADA EN LA BD */
                                    onClick={() => onAbrirContenido({ id: s.id, numero: s.numero_sesion, titulo: s.titulo })}
                                    style={{
                                        flex: 1, height: '38px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}
                                >
                                    📁 Contenido Clase
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onAbrirContenido({
                                        id: s.id,
                                        numero: s.numero_sesion,
                                        titulo: s.titulo,
                                        tipoAccion: 'asistencia' // 👈 Le avisa a App.js que debe mutar de página entera
                                    })}
                                    style={{
                                        flex: 1,
                                        height: '38px',
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '12.5px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    👥 Registrar Asistencia
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default GestionarSesiones;


