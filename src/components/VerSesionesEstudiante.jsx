import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerSesionesEstudiante = ({ cursoId, cursoNombre, codigoCurso, estudianteId, semestreId, onRegresar }) => {
    const [sesiones, setSesiones] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarCronograma = async () => {
            try {
                setCargando(true);
                const res = await axios.get('http://localhost:5000/api/cursos/cronograma-estudiante', {
                    params: { curso_id: cursoId, semestre_id: semestreId, estudiante_id: estudianteId }
                });
                setSesiones(res.data || []);
            } catch (error) {
                console.error("🚨 Error al recuperar el cronograma de clases:", error);
            } finally {
                setCargando(false);
            }
        };
        if (cursoId && estudianteId) cargarCronograma();
    }, [cursoId, estudianteId, semestreId]);

    if (cargando) {
        return <div style={{ padding: '32px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Cargando agenda de clases...</div>;
    }

    return (
        <div style={{ padding: '32px' }}>
            {/* Cabecera del Curso */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div>
                    <button type="button" onClick={onRegresar} style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0, marginBottom: '8px', display: 'block' }}>
                        ⬅ Volver a Mis Cursos
                    </button>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {cursoNombre} <span style={{ color: '#3b82f6', fontSize: '15px', fontWeight: '500' }}>({codigoCurso})</span>
                    </h2>
                </div>
            </div>

            {/* Listado de Sesiones Vertical */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sesiones.length === 0 ? (
                    <div style={{ padding: '24px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
                        No se registran sesiones dictadas para esta firma académica.
                    </div>
                ) : (
                    sesiones.map((s) => (
                        <div key={s.sesion_id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#2563eb', fontWeight: '800' }}>
                                    {String(s.numero_sesion).padStart(2, '0')}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{s.sesion_titulo || 'Tema por Definir'}</h4>
                                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>📅 Fecha: {s.fecha_clase_formateada}</span>
                                </div>
                            </div>

                            {/* Sección Controladora Derecha (Material + Asistencia) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {/* 📁 Botón de Descarga de Materiales Condicional */}
                                {s.url_material ? (
                                    <a 
                                        href={`http://localhost:5000${s.url_material}`} 
                                        download={s.nombre_material}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ height: '34px', padding: '0 14px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        📥 Descargar Material
                                    </a>
                                ) : (
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Sin Archivos Adjuntos</span>
                                )}

                                {/* 🏷️ Pastilla de Asistencia Personalizada (Badge) */}
                                <div style={{
                                    fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px',
                                    backgroundColor: s.mi_asistencia === 'asistio' ? '#dcfce7' : s.mi_asistencia === 'falto' ? '#fee2e2' : '#f1f5f9',
                                    color: s.mi_asistencia === 'asistio' ? '#16a34a' : s.mi_asistencia === 'ef4444' ? '#ef4444' : '#64748b'
                                }}>
                                    {s.mi_asistencia === 'asistio' ? '✔ Asistió' : s.mi_asistencia === 'falto' ? '❌ Faltó' : '⏳ No Registrada'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VerSesionesEstudiante;
