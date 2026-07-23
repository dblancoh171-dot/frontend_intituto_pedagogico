import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HistorialAcademico = ({ estudianteId }) => {
    const [historico, setHistorico] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarHistorial = async () => {
            if (!estudianteId) return;
            try {
                const res = await axios.get('http://localhost:5000/api/estudiantes/historial-notas', {
                    params: { estudiante_id: estudianteId }
                });
                setHistorico(res.data || []);
                setCargando(false);
            } catch (err) {
                console.error("🚨 Error al consultar el historial académico:", err);
                setError("No se pudo sincronizar el historial académico con el servidor.");
                setCargando(false);
            }
        };
        cargarHistorial();
    }, [estudianteId]);

    if (cargando) return <div style={{ padding: '24px', color: '#64748b', fontWeight: '500' }}>⏳ Sincronizando historial consolidado de notas con Aiven.io...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>;

    // 🧠 ALTA INGENIERÍA EN RAM: Agrupamos el array plano por Periodos/Semestres de forma dinámica
    const historialAgrupado = Array.isArray(historico) && historico.length > 0
        ? historico.reduce((grupos, curso) => {
            const periodo = curso.semestre_nombre || "Periodo Activo";
            if (!grupos[periodo]) grupos[periodo] = [];
            grupos[periodo].push(curso);
            return grupos;
        }, {})
        : {};

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b', animation: 'fadeIn 0.2s ease' }}>

            {/* 📋 CABECERA INFORMATIVA */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>⏳ Historial Académico</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                    Ficha oficial de asignaturas validadas, créditos acumulados y promedios ponderados por periodo de estudios.
                </p>
            </div>

            {/* 🖥️ VISTA RECTAL COMPACTA: Si no hay registros cerrados, alerta limpia */}
            {Object.keys(historialAgrupado).length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                    No se registran actas ni asignaturas consolidadas cerradas en semestres anteriores para tu matrícula.
                </div>
            ) : (
                // Mapeamos cada periodo como un bloque independiente tipo sábana corporativa
                Object.keys(historialAgrupado).map((periodo) => (
                    <div key={periodo} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '24px' }}>

                        {/* TÍTULO DEL SEMESTRE */}
                        <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#2563eb', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            🗓️ Periodo Académico: {periodo}
                        </div>

                        {/* TABLA OPERATIVA COMPACTA DE MÁXIMA VISIBILIDAD */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>Código</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569' }}>Asignatura Curricular</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Ciclo</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Créditos</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', textAlign: 'center' }}>Promedio Final</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '600', color: '#475569', textAlign: 'right' }}>Condición</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historialAgrupado[periodo].map((curso, index) => {
                                        const nota = Number(curso.promedio_final);
                                        const esAprobado = nota >= 10.5;

                                        return (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#64748b' }}>{curso.curso_codigo || 'N/A'}</td>
                                                <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{curso.curso_nombre}</td>
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{curso.curso_ciclo}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{curso.creditos || '0'}</td>

                                                {/* Celda de Nota con Semáforo */}
                                                <td style={{ padding: '12px', textAlign: 'center', fontWeight: '800', color: esAprobado ? '#16a34a' : '#dc2626' }}>
                                                    {nota.toFixed(2)}
                                                </td>

                                                {/* Celda de Condición */}
                                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        fontSize: '11px',
                                                        color: esAprobado ? '#16a34a' : '#dc2626',
                                                        backgroundColor: esAprobado ? '#f0fdf4' : '#fef2f2',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {curso.estado_aprobacion || (esAprobado ? 'Aprobado' : 'Desaprobado')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HistorialAcademico;
