import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BandejaCursosEvaluacion = ({ profesorIdId, onAbrirBandejaCurso }) => {
    const [cursosAsignados, setCursosAsignados] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarCatalogoDocente = async () => {
            try {
                setCargando(true);
                console.log("-> [AXIOS] Golpeando la BD con parámetros limpios...");

                // 🔥 CONEXIÓN RECTIFICADA CON GUIONES BAJOS PARA CONECTAR AL BACKEND
                const res = await axios.get('http://localhost:5000/api/notas/mis-cursos-docente', {
                    params: {
                        profesor_id: Number(profesorIdId),
                        semestre_id: 1
                    }
                });

                setCursosAsignados(res.data || []);
            } catch (error) {
                console.error("🚨 Error al recuperar catálogo de evaluación:", error);
                setCursosAsignados([]);
            } finally {
                setCargando(false);
            }
        };
        if (profesorIdId) cargarCatalogoDocente();
    }, [profesorIdId]);

    if (cargando) {
        return <div style={{ padding: '32px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Cargando catálogo de evaluación...</div>;
    }

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* 🔥 TÍTULO TOTALMENTE ADAPTADO Y EXCLUSIVO */}
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                Recepción de Actividades Evaluativas
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px' }}>
                Selecciona una asignatura para auditar y calificar las tareas digitales remitidas por los estudiantes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cursosAsignados.length === 0 ? (
                    <div style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
                        No registras cargas académicas asignadas para evaluación en este periodo.
                    </div>
                ) : (
                    cursosAsignados.map((c, index) => {
                        // 🛡️ CONTROL DE IDENTIFICADORES ÚNICOS: Buscamos todas las combinaciones de ID posibles de tu consulta SQL
                        const llaveUnica = c.id || c.curso_id || c.carga_id || `curso-eval-${index}`;

                        // 🛡️ CONTROL DE NOMBRE DE ASIGNATURA: Soportamos tu alias 'curso_nombre' o 'nombre'
                        const nombreAsignatura = c.curso_nombre || c.nombre_curso || c.nombre || 'Asignatura Institucional';

                        return (
                            <div
                                key={llaveUnica} // 🚀 ¡ESTA ES LA LÍNEA CLAVE QUE BORRA EL COMPORTAMIENTO ROJO DE LA CONSOLA!
                                onClick={() => onAbrirBandejaCurso(c)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#a8aeb5'; // 👈 ¡Fondo sutil impecable!
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff'; // Regresa al blanco puro original
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                {/* Estructura Interna Minimalista */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                        📚
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* 🔥 RECTIFICADO: Ahora el nombre emergerá de forma nítida al costado del código */}
                                        <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '700', color: '#0f172a' }}>
                                            {nombreAsignatura}
                                        </h3>
                                        <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                            {c.codigo || `SI${llaveUnica}`}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 'bold', paddingRight: '8px' }}>
                                    ➜
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BandejaCursosEvaluacion;
