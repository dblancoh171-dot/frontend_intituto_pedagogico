import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MiHorarioDocente = ({ profesorId, semestreId }) => {
    const [clases, setClases] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Array de días lícitos para mapear las columnas en tu monitor
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    useEffect(() => {
        const cargarHorarioDesdeBD = async () => {
            if (!profesorId || !semestreId) return;
            try {
                // Golpeamos tu nuevo endpoint de Express enviando los parámetros
                const res = await axios.get('http://localhost:5000/api/horarios/mi-agenda', {
                    params: { profesor_id: profesorId, semestre_id: semestreId }
                });
                setClases(res.data || []);
                setCargando(false);
            } catch (err) {
                console.error("🚨 Error al consultar la agenda horaria:", err);
                setError("No se pudo sincronizar el horario con el servidor.");
                setCargando(false);
            }
        };

        cargarHorarioDesdeBD();
    }, [profesorId, semestreId]);

    // Formateador rápido para quitar los segundos inválidos de la base de datos (08:00:00 -> 08:00)
    const limpiarHora = (horaStr) => {
        if (!horaStr) return '';
        return horaStr.substring(0, 5);
    };

    if (cargando) return <div style={{ padding: '24px', color: '#64748b', fontWeight: '500' }}>📅 Cargando cronograma de cátedra desde la base de datos...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b', animation: 'fadeIn 0.2s ease' }}>
            
            {/* 📋 CABECERA INFORMATIVA */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>📅 Mi Agenda y Horario Escolar</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Visualización oficial de bloques asignados para el periodo académico activo.
                </p>
            </div>

            {/* 🖥️ GRILLA DE 6 COLUMNAS ELÁSTICAS (Lunes a Sábado) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                {diasSemana.map((dia) => {
                    // Filtramos en la RAM las clases que corresponden a este día de la semana
                    const clasesDelDia = clases.filter(c => c.dia_semana.toLowerCase() === dia);

                    return (
                        <div key={dia} style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            
                            {/* TÍTULO DE LA COLUMNA */}
                            <div style={{ textTransform: 'capitalize', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '4px' }}>
                                {dia === 'miercoles' ? 'Miércoles' : dia === 'sabado' ? 'Sábado' : dia}
                            </div>

                            {/* TARJETAS DE CURSOS ASIGNADOS */}
                            {clasesDelDia.length === 0 ? (
                                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>Libre de cátedra</div>
                            ) : (
                                clasesDelDia.map((item) => (
                                    <div 
                                        key={item.horario_id} 
                                        style={{ 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '8px', 
                                            padding: '12px', 
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                            borderLeft: '4px solid #0284c7', // Borde azul corporativo
                                            border: '1px solid #e2e8f0',
                                            borderLeftWidth: '4px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            transition: 'transform 0.15s ease'
                                        }}
                                    >
                                        {/* Hora del Bloque */}
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                                            ⏱️ {limpiarHora(item.hora_inicio)} - {limpiarHora(item.hora_fin)}
                                        </div>
                                        
                                        {/* Nombre del Curso */}
                                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                                            {item.curso_nombre}
                                        </div>

                                        {/* Ciclo del Curso */}
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                                            Ciclo: {item.curso_ciclo || 'I'}
                                        </div>

                                        {/* Aula Física */}
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', backgroundColor: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', alignSelf: 'flex-start' }}>
                                            📍 {item.aula}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MiHorarioDocente;
