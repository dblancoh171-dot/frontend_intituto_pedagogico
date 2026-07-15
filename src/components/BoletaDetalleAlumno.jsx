import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BoletaDetalleAlumno = ({ estudianteId, curso, semestreId, onRegresar }) => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [asistencia, setAsistencia] = useState({ asistencias: 0, tardanzas: 0, faltas: 0, total_clases: 0 });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatosBoletaYAsistencia = async () => {
            try {
                setCargando(true);

                // 📡 REALIZAMOS LAS DOS CONSULTAS EN PARALELO RUMBO A EXPRESS
                const [resNotas, resAsis] = await Promise.all([
                    // 1. Carga de Calificaciones (Añadimos /notas para que Express haga match)
                    axios.get('http://localhost:5000/api/notas/boleta-detallada-alumno', {
                        params: {
                            estudiante_id: Number(estudianteId),
                            curso_id: Number(curso.curso_id),
                            semestre_id: Number(semestreId)
                        }
                    }),
                    // 2. Carga de Asistencia para la Dona (Añadimos /notas también aquí)
                    axios.get('http://localhost:5000/api/notas/asistencia-dona-alumno', {
                        params: {
                            estudiante_id: Number(estudianteId),
                            curso_id: Number(curso.curso_id)
                        }
                    })
                ]);

                console.log("-> [SISTEMA] Evaluaciones recuperadas en bruto:", resNotas.data);

                // 🛡️ ADUANA REFORZADA: Si viene como objeto con sub-propiedad o matriz pura, lo extraemos con éxito
                const datosNotasSeguros = Array.isArray(resNotas.data)
                    ? resNotas.data
                    : (resNotas.data.boleta || resNotas.data.evaluaciones || []);

                setEvaluaciones(datosNotasSeguros);
                setAsistencia(resAsis.data || { asistencias: 0, tardanzas: 0, faltas: 0, total_clases: 0 });
                setCargando(false);

            } catch (error) {
                console.error("🚨 Error crítico de sincronización de red en el alumno:", error);
                setCargando(false);
            }
        };

        if (estudianteId && curso?.curso_id && semestreId) {
            cargarDatosBoletaYAsistencia();
        }
    }, [estudianteId, curso, semestreId]);

    // 🧮 Matemáticas de Calificaciones
    const notasPublicadas = evaluaciones.filter(e => e.estado === 'Publicada' && e.nota !== null);

    let promedioActual = 0;
    let sumaPesosActuales = 0;

    notasPublicadas.forEach(e => {
        promedioActual += (parseFloat(e.nota) * (parseFloat(e.peso) / 100));
        sumaPesosActuales += (parseFloat(e.peso) / 100);
    });

    const promedioFinalCalculado = sumaPesosActuales > 0 ? (promedioActual / sumaPesosActuales) : 0;
    const todasLasNotasEstanPublicadas = evaluaciones.length > 0 && evaluaciones.every(e => e.estado === 'Publicada');

    // 🧮 Matemáticas de Asistencia (Anillo SVG)
    const clasesTotales = Number(asistencia.total_clases) || 0; // Tus 20 sesiones oficiales [11/07/2026]

    // Sesiones Contabilizadas: El total de clases donde el profesor ya pasó lista física (Asistió + Faltó)
    const sesionesContabilizadas = Number(asistencia.asistencias) + Number(asistencia.faltas);

    // Sesiones Pendientes: La resta matemática del sílabo institucional
    const sesionesPendientes = clasesTotales > sesionesContabilizadas
        ? clasesTotales - sesionesContabilizadas
        : 0;

    // Tu porcentaje se evalúa estrictamente sobre lo contabilizado (clases dictadas)
    const porcentajeAsistencia = sesionesContabilizadas > 0
        ? Math.round((Number(asistencia.asistencias) / sesionesContabilizadas) * 100)
        : 0;

    // El semáforo de 3 colores con umbral del 75% que calibramos antes
    let colorDona = '#cbd5e1'; // Plomo por defecto
    if (sesionesContabilizadas > 0) {
        if (porcentajeAsistencia >= 75) {
            colorDona = '#10b981'; // Verde (>= 75%)
        } else {
            colorDona = '#ef4444'; // Rojo (< 75%)
        }
    }

    // Geometría del anillo SVG con el arco de contingencia del 3% si es cero
    const radio = 50;
    const circunferencia = 2 * Math.PI * radio;
    let porcentajeParaDibuja = porcentajeAsistencia;
    if (sesionesContabilizadas > 0 && porcentajeAsistencia === 0) {
        porcentajeParaDibuja = 3;
    }
    const strokeDashoffset = sesionesContabilizadas > 0
        ? circunferencia - (porcentajeParaDibuja / 100) * circunferencia
        : 0;

    if (cargando) return <div style={{ padding: '24px', fontSize: '13px', fontWeight: '750', color: '#64748b' }}>Sincronizando libreta oficial...</div>;

    return (
        <div style={{ padding: '4px 24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>

            {/* ⬅️ BOTÓN DE RETORNO ESTILIZADO */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <button
                    onClick={onRegresar}
                    style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    ← Volver al Listado de Asignaturas
                </button>
            </div>

            {/* 🏷️ DETALLE DE ENCABEZADO */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    Detalle de Curso: {curso.curso_nombre} (CÓD: {curso.codigo})
                </h3>
            </div>

            {/* 🟩 CONTENEDOR DEL PROMEDIO ACTUAL GRANDE */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', textAlign: 'left', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promedio Actual</h4>
                <div style={{ fontSize: '32px', fontWeight: '900', color: promedioFinalCalculado >= 10.5 ? '#10b981' : '#ef4444', margin: '4px 0' }}>
                    {notasPublicadas.length > 0 ? promedioFinalCalculado.toFixed(1) : '--'}
                </div>
                <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>
                    Estado: <strong style={{ color: promedioFinalCalculado >= 10.5 ? '#10b981' : '#ef4444' }}>
                        {notasPublicadas.length > 0 ? "Aprobado (Parcialmente)" : "Sin calificaciones publicadas"}
                    </strong>
                </span>
            </div>

            {/* 🔥 CONTENEDOR FLEXBOX: Divide tu pantalla en Tabla (75%) y Dona (25%) */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}>

                {/* 📊 SECCIÓN IZQUIERDA: TU TABLA DE NOTAS INTEGRAL COMPLETA */}
                <div style={{ flex: '7.5', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                    <h4 style={{ textAlign: 'left', margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                        Reporte de Notas Globales (Ciclo 2024-II)
                    </h4>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Evaluación</th>
                                <th style={{ textAlign: 'center', padding: '12px', width: '110px' }}>Estado</th>
                                <th style={{ textAlign: 'center', padding: '12px', width: '120px' }}>Fecha Publ.</th>
                                <th style={{ textAlign: 'center', padding: '12px', width: '150px' }}>Nota (Escala 0-20)</th>
                                <th style={{ textAlign: 'center', padding: '12px', width: '90px' }}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evaluaciones.map((ev, index) => {
                                const esPendiente = ev.estado === 'Pendiente';
                                const idEvaluacionSeguro = ev.configuracion_nota_id || ev.id || index;

                                const nombreBaseBD = ev.evaluacion_nombre || `Nota Global ${index + 1}`;
                                const nombreFinalDinamico = nombreBaseBD.includes('Unidad')
                                    ? nombreBaseBD
                                    : `Nota Global ${index + 1} (Unidad ${index + 1}) - ${nombreBaseBD}`;

                                return (
                                    <tr key={idEvaluacionSeguro} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        {/* 🚀 REPARACIÓN DE LECTURA DE PESO DIRECTO DE TU CAPTURA DE WORKBENCH */}
                                        <td style={{ textAlign: 'left', padding: '14px 12px', fontWeight: '600', color: '#1e293b', lineHeight: '1.4' }}>
                                            {nombreFinalDinamico} <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '500' }}>({ev.peso_porcentaje || ev.peso || 25}%)</span>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px' }}>
                                            <span style={{
                                                display: 'inline-block', fontSize: '11px', fontWeight: '750', padding: '3px 8px', borderRadius: '4px',
                                                backgroundColor: esPendiente ? '#f1f5f9' : '#ecfdf5',
                                                color: esPendiente ? '#64748b' : '#10b981',
                                                textTransform: 'uppercase'
                                            }}>
                                                {ev.estado}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontWeight: '500' }}>
                                            {esPendiente ? '--' : (ev.fecha_pub || '-')}
                                        </td>
                                        <td style={{
                                            textAlign: 'center', padding: '12px', fontWeight: '800', fontSize: '14px',
                                            color: esPendiente ? '#94a3b8' : (parseFloat(ev.nota) >= 10.5 ? '#1d63ed' : '#ef4444')
                                        }}>
                                            {esPendiente ? '--' : parseFloat(ev.nota).toFixed(1)}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px', fontSize: '16px' }}>
                                            {esPendiente ? (
                                                <span style={{ color: '#94a3b8', opacity: 0.6 }}>🔒</span>
                                            ) : (
                                                <span
                                                    style={{ cursor: 'pointer', color: '#1d63ed', display: 'inline-block', transition: 'transform 0.1s' }}
                                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                >
                                                    🔍
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* 🔒 FILA DE PROMEDIO FINAL */}
                            <tr style={{ backgroundColor: '#f8fafc', fontWeight: '700' }}>
                                <td style={{ textAlign: 'left', padding: '16px 12px', color: '#0f172a' }}>
                                    PROMEDIO FINAL
                                    <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                                        (Calculado solo si las 4 notas están presentes)
                                    </span>
                                </td>
                                <td colSpan={3} style={{ textAlign: 'right', padding: '12px', color: '#f97316', fontSize: '12px', fontWeight: '700', verticalAlign: 'middle' }}>
                                    {!todasLasNotasEstanPublicadas && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            ⚠️ Faltan notas para promedio final
                                        </span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center', padding: '12px', fontSize: '15px', fontWeight: '900', color: todasLasNotasEstanPublicadas ? '#10b981' : '#94a3b8', verticalAlign: 'middle' }}>
                                    {todasLasNotasEstanPublicadas ? promedioFinalCalculado.toFixed(1) : '—'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 🍩 SECCIÓN DERECHA: EL CUADRO DE ASISTENCIA COMPLETO */}
                <div style={{ flex: '2.5', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxSizing: 'border-box' }}>
                    <h4 style={{ textAlign: 'left', margin: '0 0 4px 0', fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Resumen Asistencia</h4>
                    <p style={{ textAlign: 'left', margin: '0 0 24px 0', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Asistencia acumulada.</p>

                    <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Anillo de fondo gris tenue */}
                            <circle cx="65" cy="65" r={radio} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                            {/* Anillo de progreso dinámico tricolor con pequeño espacio inicial */}
                            <circle
                                cx="65" cy="65" r={radio} fill="transparent"
                                stroke={colorDona}
                                strokeWidth="12"
                                strokeDasharray={circunferencia}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                        {/* 🚀 TEXTO CENTRAL REPARADO: Sincronizado a 'sesionesContabilizadas' */}
                        <div style={{ position: 'absolute', fontSize: '22px', fontWeight: '900', color: colorDona }}>
                            {sesionesContabilizadas > 0 ? `${porcentajeAsistencia}%` : '—'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600' }}>
                            <span style={{ color: '#475569' }}>✔️ Clases Asistidas:</span>
                            <strong style={{ color: '#10b981' }}>{asistencia.asistencias}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600' }}>
                            <span style={{ color: '#475569' }}>❌ Faltas Registradas:</span>
                            <strong style={{ color: '#ef4444' }}>{asistencia.faltas}</strong>
                        </div>

                        {/* 📊 NUEVA FILA: SESIONES CONTABILIZADAS (CLASES DICTADAS) */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600', borderTop: '1px dotted #e2e8f0', paddingTop: '8px' }}>
                            <span style={{ color: '#475569' }}>📅 Sesiones Contabilizadas:</span>
                            <strong style={{ color: '#1d63ed' }}>{sesionesContabilizadas}</strong>
                        </div>

                        {/* ⏳ NUEVA FILA: SESIONES PENDIENTES */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '600' }}>
                            <span style={{ color: '#475569' }}>⏳ Sesiones Pendientes:</span>
                            <strong style={{ color: '#64748b' }}>{sesionesPendientes}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ color: '#0f172a' }}>Total de Sesiones:</span>
                            <span style={{ color: '#0f172a' }}>{clasesTotales}</span>
                        </div>

                    </div>
                </div>

            </div> {/* 🟩 FIN DEL CONTENEDOR FLEXBOX */}
        </div>
    );
};

export default BoletaDetalleAlumno;