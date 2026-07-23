import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MisCursosEstudiante = ({ estudianteId, semestreId, onAbrirCurso }) => {
    const [misCursos, setMisCursos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarCargosAcademicosConsolidados = async () => {
            try {
                setCargando(true);
                const res = await axios.get('http://localhost:5000/api/matriculas/mis-cursos', {
                    params: { estudiante_id: estudianteId, semestre_id: semestreId }
                });
                setMisCursos(res.data || []);
            } catch (error) {
                console.error("🚨 Error al traer las asignaturas matriculadas:", error);
            } finally {
                setCargando(false);
            }
        };

        if (estudianteId && semestreId) {
            cargarCargosAcademicosConsolidados();
        }
    }, [estudianteId, semestreId]);

    if (cargando) {
        return <div style={{ padding: '30px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Cargando asignaturas oficiales...</div>;
    }

    return (
        <div style={{ padding: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>Mis Cursos Matriculados</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                A continuación se detallan las asignaturas vigentes correspondientes a tu periodo académico consolidado.
            </p>

            {misCursos.length === 0 ? (
                <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No registras ninguna matrícula aprobada para el presente semestre académico.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {misCursos.map((c) => (
                        <div
                            key={c.curso_id}
                            // 🔥 EVENTO CLICK: Al tocar cualquier parte de la tarjeta, abre sus sesiones
                            onClick={() => onAbrirCurso(c)}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                cursor: 'pointer', // Icono de manito interactiva
                                // ✨ HOVER Y CONTROL DE TRANSICIÓN EN LÍNEA
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                            }}
                            // 🎨 EFECTO HOVER SUTIL: Eleva la tarjeta 3 píxeles y difumina una sombra suave grisácea
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div>
                                <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                    {c.curso_codigo}
                                </span>
                                <h3 style={{ margin: '8px 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                                    {c.curso_nombre}
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                                    Ciclo: {c.ciclo} || Créditos: {c.creditos}
                                </span>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                                    <strong>👨‍🏫 Docente:</strong> {c.docente_nombre}
                                </div>
                                <div style={{ fontSize: '12.5px', color: '#334155' }}>
                                    <strong>⏰ Horario:</strong> <span style={{ color: '#475569' }}>{c.horario_completo}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MisCursosEstudiante;
