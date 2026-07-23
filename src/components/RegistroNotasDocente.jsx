import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegistroNotasDocente = ({ profesorId, semestreId, onSeleccionarCurso }) => {
    const [cursosAsignados, setCursosAsignados] = useState([]);
    const [cargando, setCargando] = useState(true);

    // 📌 Coloca esto justo al inicio del bloque de carga en tu JSX
    const spinnerStyles = (
        <style>{`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}</style>
    );

    // 📡 CONSUMO DE RED: Jalamos los cursos asignados al profesor desde tu endpoint en Express
    useEffect(() => {
        const traerCursosProfesor = async () => {
            try {
                setCargando(true);
                console.log(`-> [AXIOS] Cargando catálogo de asignaturas para Profesor: ${profesorId}`);

                // Golpeamos tu endpoint que ya calcula horarios y alertas en el Backend
                const response = await axios.get('http://localhost:5000/api/notas/mis-cursos-docente', {
                    params: {
                        profesor_id: profesorId,
                        semestre_id: semestreId
                    }
                });

                setCursosAsignados(response.data || []);
                setCargando(false);
            } catch (error) {
                console.error("🚨 Error al recuperar los cursos del docente:", error);
                setCargando(false);
            }
        };

        if (profesorId) {
            traerCursosProfesor();
        }
    }, [profesorId, semestreId]);

    // ⏳ PANTALLA DE CARGA CORPORATIVA (Skeleton Loader)
    // 🛠️ REEMPLAZO COMPLETO PARA TU PANTALLA DE CARGA (LÍNEAS 134-142 APROX.)
    if (cargando) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                backgroundColor: '#ffffff'
            }}>
                {/* 🔑 Inyectamos los Keyframes de CSS en caliente */}
                {spinnerStyles}

                {/* 🌀 EL CÍRCULO CON ROTACIÓN FLUIDA EN TIEMPO REAL */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#1e3a8a', // Azul oscuro institucional
                    borderRadius: '50%',
                    // 🔥 AQUÍ SE ACTIVA EL MOVIMIENTO INFINITO
                    animation: 'spin 0.8s linear infinite'
                }} />

                {/* Texto informativo de tu monitor */}
                <span style={{
                    fontSize: '13.5px',
                    fontWeight: '750',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Sincronizando carga de cátedra...
                </span>
            </div>
        );
    }


    return (
        <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '85vh', boxSizing: 'border-box' }}>

            {/* 🏆 ENCABEZADO METICULOSO */}
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Registro de Calificaciones Oficiales
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
                    Seleccione la asignatura correspondiente para realizar la apertura del acta de evaluación institucional.
                </p>
            </div>

            {/* 🎚️ CUADRÍCULA DE TARJETAS RESPONSIVAS */}
            {cursosAsignados.length === 0 ? (
                <div style={{ padding: '40px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center' }}>
                    <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>📋</span>
                    <strong style={{ fontSize: '14px', color: '#475569', display: 'block', textTransform: 'uppercase' }}>Sin Cátedras Registradas</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>El sistema no reporta cursos asignados a tu cuenta para el presente semestre.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {cursosAsignados.map((item) => (
                        <div
                            key={item.curso_id}
                            style={{
                                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                                padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                            }}
                        >
                            {/* Información del Curso (Lado Izquierdo) */}
                            <div style={{ textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ fontSize: '28px', backgroundColor: '#f1f5f9', width: '52px', height: '52px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    📖
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '750', color: '#1e293b' }}>
                                            {item.curso_nombre}
                                        </h3>
                                        <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                            {item.codigo || `SI-${item.curso_id}`}
                                        </span>
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                        Módulo: Ciclo {item.ciclo} || Horario: <span style={{ fontStyle: 'italic', color: '#334155' }}>{item.horario}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Botón de Acción Directa (Lado Derecho) */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => onSeleccionarCurso(item)}
                                    style={{
                                        backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                                        borderRadius: '6px', padding: '10px 18px', fontSize: '13px',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', gap: '6px', transition: 'background-color 0.2s'
                                    }}
                                >
                                    📝 Abrir Acta de Notas
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegistroNotasDocente;
