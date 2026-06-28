import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MisCursosProfesor = ({ profesorIdId, onCambiarVista, onAbrirSesiones }) => {
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const semestreId = 1; // ID del semestre de tus pruebas en Workbench

    useEffect(() => {
        const cargarCursosDesdeBD = async () => {
            try {
                // 📡 CONSUMIMOS LAS VARIABLES REALES CALCULADAS EN EL BACKEND
                const res = await axios.get(`http://localhost:5000/api/notas/mis-cursos-docente`, {
                    params: { profesor_id: profesorIdId, semestre_id: semestreId }
                });
                setCursos(res.data);
            } catch (error) {
                console.error("Error al jalar la carga académica de la BD:", error);
                setCursos([]);
            } finally {
                setCargando(false);
            }
        };
        cargarCursosDesdeBD();
    }, [profesorIdId]);

    if (cargando) return <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Sincronizando cronograma institucional con Aiven.io...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.25s ease-in-out', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Encabezado Principal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Mis Cursos - Panel Docente</h1>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Asignaturas vigentes extraídas de la tabla carga_academica.</p>
                </div>
            </div>

            {cursos.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    El docente actual no registra asignaturas a cargo en la tabla de carga académica de este semestre.
                </div>
            ) : (
                /* Contenedor vertical en formato lista */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cursos.map((c) => {
                        // Forzamos valores seguros en caso de que algún campo venga NULL de la base de datos
                        const statusClase = c.estatus_clase || 'Sin clases próximas';
                        const notasPendientes = Number(c.notas_pendientes_count || 0);

                        return (
                            <div
                                key={c.curso_id}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    transition: 'box-shadow 0.15s, transform 0.15s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }}
                            >
                                {/* PARTE SUPERIOR DE LA FILA: Información general e Icono */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                                            📚
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{c.curso_nombre}</h2>
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{c.codigo}</span>
                                            </div>
                                            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                                <strong>Módulo:</strong> Ciclo {c.ciclo} &nbsp;|&nbsp; <strong>Horario:</strong> {c.horario} &nbsp;|&nbsp; <strong>Salón:</strong> {c.aula}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 🔥 BLOQUE DE LAS DOS NOTIFICACIONES COMPLEMENTARIAS DUALES */}
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

                                        {/* 🏷️ ÓVALO 1: Alerta de Horario (Verde brillante si dicta hoy/mañana, Gris si no) */}
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: statusClase.includes('Sin') ? '#f3f4f6' : '#dcfce7',
                                            color: statusClase.includes('Sin') ? '#64748b' : '#15803d'
                                        }}>
                                            ⏰ {statusClase}
                                        </span>

                                        {/* 🏷️ ÓVALO 2: Alerta de Notas Pendientes (Naranja si faltan alumnos, Azul si ya terminó) */}
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            backgroundColor: notasPendientes > 0 ? '#ffedd5' : '#e0f2fe',
                                            color: notasPendientes > 0 ? '#c2410c' : '#0369a1'
                                        }}>
                                            📝 {notasPendientes > 0
                                                ? `Faltan ingresar ${notasPendientes} notas`
                                                : 'Acta de Notas Completa ✓'}
                                        </span>

                                    </div>
                                </div>

                                {/* PARTE INFERIOR DE LA FILA: Botones Duales Corporativos */}
                                <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => onAbrirSesiones({ id: c.curso_id, nombre: c.curso_nombre, codigo: c.codigo })} // 👈 ASEGÚRATE DE AGREGAR 'id: c.curso_id' AQUÍ
                                        style={{
                                            flex: 1,
                                            height: '42px',
                                            backgroundColor: '#0284c7',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13.5px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        📅 Gestionar Asistencia y Sesiones
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onCambiarVista('notas')}
                                        style={{
                                            flex: 1, height: '42px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}
                                    >
                                        📝 Gestionar Calificaciones
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MisCursosProfesor;


