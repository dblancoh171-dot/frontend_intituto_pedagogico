import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditoriaEntregasAlumnos = ({ cursoId, actividad, onRegresar }) => {
    const [nominaEstudiantes, setNominaEstudiantes] = useState([]);
    const [cargando, setCargando] = useState(true);



    // 🟢 FUNCIÓN DE REFRESCO REUTILIZABLE: Sincroniza la nómina con la BD sin parpadeos
    const recargarDetalleEntregasSilencioso = async () => {
        if (!actividad?.actividad_id || !cursoId) return;
        try {
            console.log(`-> [AXIOS] Actualizando estado de calificaciones desde Aiven.io...`);
            const res = await axios.get('http://localhost:5000/api/entregas/detalle-actividad', {
                params: {
                    actividad_id: Number(actividad?.actividad_id),
                    curso_id: Number(cursoId)
                }
            });
            setNominaEstudiantes(res.data || []);
        } catch (error) {
            console.error("🚨 Error al refrescar el reporte de entregas:", error);
        }
    };

    // El useEffect inicial simplemente invoca a nuestra nueva función
    useEffect(() => {
        const cargaInicial = async () => {
            setCargando(true);
            await recargarDetalleEntregasSilencioso();
            setCargando(false);
        };
        cargaInicial();
    }, [actividad, cursoId]);



    useEffect(() => {
        const cargarDetalleEntregas = async () => {
            try {
                setCargando(true);
                console.log(`-> [AXIOS] Golpeando la BD con la ruta unificada de entregas...`);

                // 🔥 SOLUCIÓN DEFINITIVA: Sincronizamos la URL base exacta de tu backend
                const res = await axios.get('http://localhost:5000/api/entregas/detalle-actividad', {
                    params: {
                        actividad_id: Number(actividad?.actividad_id),
                        curso_id: Number(cursoId)
                    }
                });
                setNominaEstudiantes(res.data || []);
            } catch (error) {
                console.error("🚨 Error al jalar el reporte de entregas:", error);
                setNominaEstudiantes([]);
            } finally {
                setCargando(false);
            }
        };
        if (actividad?.actividad_id && cursoId) cargarDetalleEntregas();
    }, [actividad, cursoId]);

    // Contabilizamos cuántos alumnos del total ya registraron un ID de envío en la BD
    const totalRecepcionados = nominaEstudiantes.filter(e => e.entrega_id !== null).length;

    const totalCalificados = nominaEstudiantes.filter(e => e.estado_evaluacion === 'CALIFICADO').length;

    if (cargando) {
        return <div style={{ padding: '32px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Sincronizando nómina con la BD de Aiven.io...</div>;
    }

    return (
        <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>

            {/* 🏢 ENCABEZADO DE LA NUEVA VENTANA DE AUDITORÍA SOLICITADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '18px', marginBottom: '24px' }}>
                <div>
                    <button
                        type="button"
                        onClick={onRegresar}
                        style={{ backgroundColor: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: 0, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        ⬅ Volver a las Actividades
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                        {/* Número de la sesión */}
                        <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: '#0f172a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                            SESIÓN {String(actividad?.numero_sesion || 1).padStart(2, '0')}
                        </span>
                        {/* Título de la sesión */}
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#475569' }}>
                            {actividad?.sesion_titulo || 'Introducción'}
                        </h4>
                    </div>

                    {/* Título de la actividad */}
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                        Evaluación: {actividad?.actividad_titulo || actividad?.titulo}
                    </h2>
                </div>

                {/* 📊 CANTIDAD DE ELEMENTOS RECEPCIONADOS SOLICITADOS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#2563eb', letterSpacing: '0.3px' }}>CALIFICADOS:</span>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>
                        {totalRecepcionados} / {nominaEstudiantes.length}
                    </strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', padding: '10px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#2563eb', letterSpacing: '0.3px' }}>RECEPCIONADOS:</span>
                    <strong style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>
                        {totalCalificados} / {nominaEstudiantes.length}
                    </strong>
                </div>
            </div>

            {/* 📋 SECCIÓN CENTRAL: NÓMINA REAL DE ESTUDIANTES MATRICULADOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* 🏷️ BARRA DE TÍTULOS DE COLUMNA ADAPTADA A TU MAQUETACIÓN */}
                {nominaEstudiantes.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px',
                        marginBottom: '4px'
                    }}>
                        {/* Cabecera Izquierda: Estudiante (Se alinea con flex: 1) */}
                        <div style={{ flex: 1, paddingLeft: '24px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                👤 Información del Estudiante
                            </span>
                        </div>

                        {/* Cabecera Derecha: Comentario y Archivo (Se alinea con tu flex: '1.4' y gap: '20px') */}
                        <div style={{ flex: '1.4', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>

                            {/* Título para el globo de comentarios */}
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    💬 Comentario Adjunto
                                </span>
                            </div>

                            {/* Título para el enlace de descarga (Caza exacto con tu width: '220px') */}
                            <div style={{ width: '220px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0, marginRight: '5px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '850', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    📁 Documento Enviado
                                </span>
                            </div>
                            {/* 🔥 NUEVO TÍTULO: Registro de calificaciones */}
                            <div style={{ width: '150px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: '850', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    💯 Calificación (0-20)
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {nominaEstudiantes.length === 0 ? (
                    <div style={{ padding: '40px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                        No se registran alumnos matriculados para auditar en este curso.
                    </div>
                ) : (

                    nominaEstudiantes.map((est, idx) => {
                        // Determinamos si el registro de la BD viene marcado como CALIFICADO
                        const estaCalificado = est.estado_evaluacion === 'CALIFICADO';

                        return (
                            <div
                                key={est.estudiante_id}
                                style={{
                                    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 24px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                                }}
                            >
                                {/* Lado Izquierdo: Ficha e Identidad del Estudiante */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, paddingRight: '20px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', width: '20px', textAlign: 'right' }}>{idx + 1}.</span>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: est.entrega_id ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px', color: est.entrega_id ? '#0284c7' : '#475569', fontWeight: 'bold', border: est.entrega_id ? '1px solid #bae6fd' : '1px solid #e2e8f0' }}>
                                        {est.nombre_completo_alumno ? est.nombre_completo_alumno.charAt(0) : 'A'}
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', letterSpacing: '-0.1px' }}>
                                            {est.nombre_completo_alumno}
                                        </strong>

                                        {/* 📊 SECCIÓN DE ESTADOS EVALUATIVOS REACTIVOS SOLICITADA */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                                                Código: {est.codigo_alumno || 'ALU-100'}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>|</span>

                                            {/* Elige dinámicamente el color según la respuesta de MySQL Workbench */}
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '800',
                                                backgroundColor: estaCalificado ? '#dcfce7' : '#fee2e2',
                                                color: estaCalificado ? '#16a34a' : '#ef4444',
                                                padding: '1px 6px',
                                                borderRadius: '4px',
                                                letterSpacing: '0.2px'
                                            }}>
                                                {estaCalificado ? '✔ CALIFICADO' : '⏳ PENDIENTE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Lado Derecho Tradicional */}
                                <div style={{ flex: '2.2', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px' }}>

                                    {/* Bloque Informativo de Comentario */}
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', minWidth: 0 }}>
                                        <span style={{ fontSize: '11.5px', color: est.comentario_alumno ? '#334155' : '#94a3b8', textAlign: 'right', fontStyle: est.comentario_alumno ? 'normal' : 'italic', backgroundColor: est.comentario_alumno ? '#f1f5f9' : 'transparent', padding: est.comentario_alumno ? '6px 12px' : '0', borderRadius: '6px', maxWidth: '260px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={est.comentario_alumno}>
                                            {est.comentario_alumno ? `💬 "${est.comentario_alumno}"` : '📌 Sin notas adjuntas.'}
                                        </span>
                                    </div>

                                    {/* Bloque del Archivo Descargable */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', width: '220px', flexShrink: 0 }}>
                                        {est.entrega_id ? (
                                            <>
                                                <a href={`http://localhost:5000${est.archivo_alumno_url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', fontWeight: '800', color: '#2563eb', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }} title={est.nombre_archivo_estudiante}>
                                                    📄 {est.nombre_archivo_estudiante || 'Abrir Entregable'}
                                                </a>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Enviado: {est.fecha_entrega_formateada}</span>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '800', backgroundColor: '#fef2f2', padding: '5px 12px', borderRadius: '4px', border: '1px solid #fee2e2', textTransform: 'uppercase', letterSpacing: '0.2px' }}>⏳ Sin entrega</span>
                                        )}
                                    </div>

                                    {/* SECCIÓN DE CALIFICACIONES CON MUTACIÓN DE NOMBRE EN EL BOTÓN SOLICITADA */}
                                    <div style={{ width: '160px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, justifyContent: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            placeholder="--"
                                            defaultValue={est.nota !== null ? est.nota : ''}
                                            id={`nota-input-${est.estudiante_id}`}
                                            style={{
                                                width: '64px', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#0f172a', outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.15s ease-in-out'
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.backgroundColor = '#ffffff'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const inputNota = document.getElementById(`nota-input-${est.estudiante_id}`);
                                                const notaValor = inputNota.value;

                                                if (notaValor === '') {
                                                    alert("⚠️ Ingrese una nota válida antes de ejecutar el guardado.");
                                                    return;
                                                }

                                                try {
                                                    console.log("-> [AXIOS] Despachando calificación hacia Express...");
                                                    const res = await axios.put('http://localhost:5000/api/entregas/guardar-nota', {
                                                        actividad_id: actividad?.actividad_id,
                                                        estudiante_id: est.estudiante_id,
                                                        nota: notaValor
                                                    });

                                                    alert(`🎉 ${res.data.message}`);

                                                    // 🔄 REFRESCO SILENCIOSO: Vuelve a jalar los datos para mutar las pastillas de estado en caliente
                                                    await recargarDetalleEntregasSilencioso();

                                                } catch (error) {
                                                    console.error("🚨 Error de red al calificar:", error);
                                                    alert(error.response?.data?.message || "Fallo interno al procesar la nota.");
                                                }
                                            }}
                                            style={{
                                                height: '34px', padding: '0 12px',
                                                // 🎨 UX DINÁMICO: Si ya tiene nota guardada cambia a un tono pizarra secundario para no competir visualmente
                                                backgroundColor: estaCalificado ? '#475569' : '#2563eb',
                                                color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.15s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = estaCalificado ? '#334155' : '#1d4ed8'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = estaCalificado ? '#475569' : '#2563eb'}
                                        >
                                            {/* 🚀 NOMBRE DEL BOTÓN ADAPTATIVO REQUERIDO */}
                                            {estaCalificado ? 'Actualizar' : 'Guardar'}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })


                )}
            </div>


        </div>
    );
};

export default AuditoriaEntregasAlumnos;
