import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MisCalificacionesEstudiante = ({ estudianteId, semestreId, onVerCurso }) => {
    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarCursosAlumno = async () => {
            try {
                setCargando(true);
                const response = await axios.get('http://localhost:5000/api/notas/mis-calificaciones-alumno', {
                    params: { estudiante_id: estudianteId, semestre_id: semestreId }
                });
                setCursos(response.data || []);
                setCargando(false);
            } catch (error) {
                console.error("🚨 Error al jalar cursos del alumno:", error);
                setCargando(false);
            }
        };

        if (estudianteId && semestreId) cargarCursosAlumno();
    }, [estudianteId, semestreId]);

    if (cargando) return <div style={{ padding: '24px', fontSize: '13px', fontWeight: '750', color: '#64748b' }}>Cargando asignaturas...</div>;

    return (
        <div style={{ padding: '4px 24px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {cursos.length === 0 ? (
                    <div style={{ padding: '24px', border: '1px dashed #cbd5e1', borderRadius: '8px', gridColumn: '1/-1', textAlign: 'center', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>
                        No registras asignaturas matriculadas.
                    </div>
                ) : (
                    cursos.map(curso => (
                        <div 
                            key={curso.curso_id}
                            onClick={() => onVerCurso(curso)}
                            style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s ease', cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1d63ed'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div>
                                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10.5px', fontWeight: '750', padding: '3px 8px', borderRadius: '4px' }}>
                                    {curso.codigo_curso}
                                </span>
                                <h3 style={{ margin: '12px 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase' }}>
                                    {curso.curso_nombre}
                                </h3>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Ciclo: {curso.ciclo}</span>
                            </div>
                            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '12px', fontWeight: '750', color: '#1d63ed' }}>Ver Boleta de Notas →</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MisCalificacionesEstudiante;