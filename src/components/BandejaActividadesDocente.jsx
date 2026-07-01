import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BandejaActividadesDocente = ({ cursoId, cursoNombre, codigoCurso, onRegresar }) => {
    const [actividades, setActividades] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarActividadesCurso = async () => {
            try {
                setCargando(true);
                console.log(`-> [AXIOS] Solicitando evaluaciones programadas para el Curso ID: ${cursoId}`);

                const res = await axios.get('http://localhost:5000/api/cursos/actividades-por-curso', {
                    params: { curso_id: cursoId }
                });

                setActividades(res.data || []);
            } catch (error) {
                console.error("🚨 Error al jalar las actividades del curso:", error);
                setActividades([]);
            } finally {
                setCargando(false);
            }
        };

        if (cursoId) cargarActividadesCurso();
    }, [cursoId]);

    if (cargando) {
        return <div style={{ padding: '32px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Cargando agenda evaluativa...</div>;
    }

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

            {/* Cabecera del Módulo con Retorno */}
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                <button
                    type="button"
                    onClick={onRegresar}
                    style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    ⬅ Volver al Catálogo de Recepción
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
                    {cursoNombre} <span style={{ color: '#3b82f6', fontSize: '15px', fontWeight: '500' }}>({codigoCurso || 'SI101'})</span>
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0 0' }}>
                    A continuación se listan de forma descriptiva los trabajos y pautas programadas para este ciclo académico.
                </p>
            </div>

            {actividades.length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '2px solid #e2e8f0',
                    paddingBottom: '10px'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '800',
                        color: '#1e293b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        📋 Actividades Programadas en el Curso
                    </h3>

                    {/* Contador reactivo compacto tipo esfera para dar feedback visual */}
                    <span style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {actividades.length}
                    </span>
                </div>
            )}

            {/* 📋 FLUJO CONDICIONAL SOLICITADO */}
            {actividades.length === 0 ? (
                /* ❌ ESCENARIO A: No hay actividades creadas en la base de datos */
                <div style={{
                    padding: '40px',
                    backgroundColor: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                    marginTop: '20px'
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#475569' }}>
                        No hay actividades programadas
                    </h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Esta asignatura no registra evaluaciones ni tareas vigentes programadas en ninguna sesión de clase.
                    </p>
                </div>
            ) : (
                /* 💎 ESCENARIO B: Renderizado descriptivo de las tarjetas evaluativas reales */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {actividades.map((act) => (
                        <div
                            key={act.actividad_id}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 0 0 rgba(0, 0, 0, 0)',
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                willChange: 'transform, box-shadow'
                            }}

                            // 🎨 EFECTO HOVER CALIBRADO: Eleva la tarjeta 3 píxeles y genera un relieve tridimensional tenue
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#bbd6f5';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}

                        >
                            {/* Barra de cabecera interna de la tarjeta */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    backgroundColor: String(act.tipo_documento).toLowerCase() === 'docx' ? '#eff6ff' : '#fee2e2',
                                    color: String(act.tipo_documento).toLowerCase() === 'docx' ? '#2563eb' : '#ef4444',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase'
                                }}>
                                    {act.tipo_documento}
                                </span>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                    📆 Sesión {String(act.numero_sesion).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Detalle Descriptivo */}
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14.5px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                                    {act.actividad_titulo}
                                </h4>
                                <span style={{ fontSize: '11.5px', color: '#d97706', fontWeight: '600' }}>
                                    ⏳ Límite: {act.fecha_limite_formateada}
                                </span>
                                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.4', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                                    <strong>Descripción:</strong> {act.desc || 'Desarrollar de acuerdo a las pautas establecidas por cátedra.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BandejaActividadesDocente;
