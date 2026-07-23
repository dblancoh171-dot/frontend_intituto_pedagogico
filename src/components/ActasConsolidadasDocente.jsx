import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActasConsolidadasDocente = ({ profesorId, semestreId }) => {
    const [actas, setActas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarActas = async () => {
            try {
                setCargando(true);
                // 📡 Consumimos el endpoint que mapeamos en Express
                const res = await axios.get('http://localhost:5000/api/notas/actas-consolidadas', {
                    params: {
                        semestre_id: semestreId,
                        profesor_id: profesorId
                    }
                });
                setActas(res.data || []);
            } catch (error) {
                console.error("🚨 Error al jalar las actas consolidadas:", error);
            } finally {
                setCargando(false);
            }
        };

        if (semestreId) {
            cargarActas();
        }
    }, [profesorId, semestreId]);

    if (cargando) {
        return (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                Cargando historial de actas consolidadas...
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ marginBottom: '25px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    HISTORIAL DE ACTAS CONSOLIDADAS
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                    Consulta los promedios y el estado de rendimiento de las actas cerradas definitivamente.
                </p>
            </div>

            {actas.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
                    🗂️ Aún no registras actas finales cerradas de forma definitiva en este periodo.
                </div>
            ) : (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* 📌 REEMPLAZO SIMÉTRICO DE LA GRILA CON COLUMNA PDF */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                                <th style={{ padding: '14px 20px', width: '40px', textAlign: 'center' }}>N°</th>
                                <th style={{ padding: '14px 20px' }}>Código Acta</th>
                                <th style={{ padding: '14px 20px' }}>Asignatura</th>
                                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Ciclo Académico</th>
                                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Alumnos</th>
                                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Fecha Cierre</th>
                                {/* 📄 NUEVA CABECERA DE REPORTE */}
                                <th style={{ padding: '14px 20px', textAlign: 'center' }}>Documento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actas.map((acta, index) => {
                                const numeroOrdenReal = index + 1;

                                return (

                                    <tr key={acta.acta_id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', transition: 'background-color 0.15s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>

                                        {/* 🔢 CELDA DE ÍNDICE DINÁMICO (Pintará 1, 2, 3...) */}
                                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                                            {numeroOrdenReal}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: '700', color: '#1e3a8a', fontFamily: 'monospace' }}>
                                            {acta.codigo_acta}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: '600' }}>
                                            {acta.curso_nombre} - <span style={{ fontSize: '11px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 'bold' }}>{acta.curso_codigo}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 'bold' }}>{acta.ciclo_academico}</td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 'bold' }}>{acta.total_estudiantes}</td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center', color: '#64748b', fontSize: '12.5px', fontWeight: 'bold' }}>{acta.fecha_cierre}</td>

                                        {/* 📄 BOTÓN INTERACTIVO: Disparador del Módulo de Impresión Externo */}
                                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                            {!acta.url_pdf ? (

                                                /* 📤 ESTADO 1: NINGÚN DOCUMENTO SUBIDO (Agrupamos en un contenedor flexible vertical) */
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>

                                                    <label style={{
                                                        backgroundColor: '#ffffff', color: '#2563eb', border: '1px dashed #cbd5e1',
                                                        borderRadius: '6px', padding: '6px 14px', fontSize: '12.5px', fontWeight: '600',
                                                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        transition: 'all 0.15s ease'
                                                    }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#2563eb'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                                    >
                                                        ➕ Subir Acta
                                                        <input
                                                            type="file"
                                                            // 🚀 REGLA 1: Forzamos al explorador de archivos a mostrar únicamente archivos .pdf
                                                            accept=".pdf"
                                                            style={{ display: 'none' }}
                                                            onChange={async (e) => {
                                                                if (!e.target.files || e.target.files.length === 0) return;

                                                                const archivoSeleccionado = e.target.files[0];

                                                                // 🚀 REGLA 2: Validación estricta de tipo en el cliente
                                                                if (archivoSeleccionado.type !== "application/pdf") {
                                                                    alert("🚨 Error: El archivo seleccionado debe ser estrictamente un documento en formato PDF.");
                                                                    e.target.value = ""; // Reseteamos el selector
                                                                    return;
                                                                }

                                                                // 🚀 REGLA 3: Validación estricta de peso máximo (10MB)
                                                                const pesoEnMB = archivoSeleccionado.size / (1024 * 1024);
                                                                if (pesoEnMB > 10) {
                                                                    alert(`🚨 Operación denegada: El archivo pesa ${pesoEnMB.toFixed(2)}MB. El tamaño máximo permitido es de 10MB.`);
                                                                    e.target.value = ""; // Reseteamos el selector
                                                                    return;
                                                                }

                                                                // Si supera todos los filtros, procede a empaquetar y subir
                                                                const formData = new FormData();
                                                                formData.append('documento_acta', archivoSeleccionado);

                                                                try {
                                                                    const res = await axios.put(`http://localhost:5000/api/notas/actas-consolidadas/${acta.acta_id}/documento?accion=subir`, formData, {
                                                                        headers: { 'Content-Type': 'multipart/form-data' }
                                                                    });
                                                                    alert(res.data.message);
                                                                    window.location.reload();
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("🚨 Error de red: No se pudo subir el archivo físico al servidor.");
                                                                }
                                                            }}
                                                        />
                                                    </label>

                                                    {/* 💡 AVISO VISUAL SOLICITADO PERFECTAMENTE INTEGRADO */}
                                                    <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.1px' }}>
                                                        Solo PDF (Máx. 10 MB)
                                                    </span>

                                                </div>

                                            ) : (
                                                /* 🛠️ ESTADO 2: EL DOCUMENTO YA EXISTE EN MYSQL (Muestra Controles) */
                                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>

                                                    {/* 📄 BLOQUE IZQUIERDO: ICONO PDF + TEXTO DE AVISO DEBAJO */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                                        <a
                                                            href={`http://localhost:5000${acta.url_pdf}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            // 🚀 CONTROL HOVER NATIVO: Al pasar el mouse, el navegador mostrará un cartelito con el nombre completo
                                                            title={acta.url_pdf.split('/').pop()}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                textDecoration: 'underline',
                                                                color: '#0f172a',
                                                                fontSize: '12.5px',
                                                                fontWeight: '600',
                                                                fontFamily: 'sans-serif',
                                                                transition: 'color 0.15s ease',
                                                                // 🛡️ Candado estructural para evitar desbordes en celdas cortas
                                                                maxWidth: '220px'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.color = '#2563eb'}
                                                            onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}
                                                        >
                                                            {/* Icono de PDF vectorial que ya tenías */}
                                                            <div style={{
                                                                width: '24px', height: '28px', backgroundColor: '#ffffff',
                                                                border: '2px solid #ef4444', borderRadius: '4px', position: 'relative',
                                                                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                                                alignItems: 'center', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                flexShrink: 0 // 🔥 Evita que el icono se aplaste si el texto es muy largo
                                                            }}>
                                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '0 0 0 2px' }} />
                                                                <div style={{ width: '100%', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '7px', fontWeight: '900', textAlign: 'center', padding: '1px 0', lineHeight: '1' }}>PDF</div>
                                                            </div>

                                                            {/* 🚀 TRUNCADO INTELIGENTE: El texto se acorta solo y pone "..." si excede el ancho máximo */}
                                                            <span style={{
                                                                cursor: 'pointer',
                                                                color: '#52a0df',
                                                                maxWidth: '120px',          // Ajusta este ancho (en píxeles) para que corte más o menos
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',   // 🔥 Añade los puntos suspensivos de forma automática
                                                                whiteSpace: 'nowrap',       // 🔥 Evita que el texto salte a una segunda línea
                                                                display: 'inline-block',
                                                                verticalAlign: 'middle'
                                                            }}>
                                                                {acta.url_pdf.split('/').pop()}
                                                            </span>
                                                        </a>

                                                        {/* 🚀 AVISO UBICADO EXACTAMENTE DEBAJO DEL ICONO PDF Y ENLACE */}
                                                        <span style={{
                                                            fontSize: '10px',
                                                            color: '#94a3b8',
                                                            fontWeight: '700',
                                                            whiteSpace: 'nowrap',
                                                            letterSpacing: '0.1px'
                                                        }}>
                                                            Solo PDF (Máx. 10 MB)
                                                        </span>
                                                    </div>

                                                    {/* 🛠️ BLOQUE DERECHO: BOTONES DE ACCIÓN (EDITAR Y ELIMINAR ALINEADOS) */}
                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                        {/* ✏️ BOTÓN EDITAR */}
                                                        <label style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 1px 2px rgba(217,119,6,0.05)' }}>
                                                            ✏️ Editar
                                                            <input
                                                                type="file"
                                                                accept=".pdf"
                                                                style={{ display: 'none' }}
                                                                onChange={async (e) => {
                                                                    if (!e.target.files || e.target.files.length === 0) return;
                                                                    const archivoNuevo = e.target.files[0];

                                                                    if (archivoNuevo.type !== "application/pdf") {
                                                                        alert("🚨 Error: Debe ser un PDF.");
                                                                        return;
                                                                    }

                                                                    const pesoEnMB = archivoNuevo.size / (1024 * 1024);
                                                                    if (pesoEnMB > 10) {
                                                                        alert(`🚨 Excede el límite de 10MB.`);
                                                                        return;
                                                                    }

                                                                    const formData = new FormData();
                                                                    formData.append('documento_acta', archivoNuevo);
                                                                    try {
                                                                        await axios.put(`http://localhost:5000/api/notas/actas-consolidadas/${acta.acta_id}/documento?accion=subir`, formData, {
                                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                                        });
                                                                        alert("¡Documento reemplazado con éxito!");
                                                                        window.location.reload();
                                                                    } catch (err) { alert("🚨 Error al modificar archivo."); }
                                                                }}
                                                            />
                                                        </label>

                                                        {/* ❌ BOTÓN ELIMINAR */}
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                const confirmar = window.confirm("¿Está seguro de eliminar el acta?");
                                                                if (!confirmar) return;
                                                                try {
                                                                    await axios.put(`http://localhost:5000/api/notas/actas-consolidadas/${acta.acta_id}/documento?accion=eliminar`);
                                                                    window.location.reload();
                                                                } catch (err) { alert("🚨 Error al procesar la baja."); }
                                                            }}
                                                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 1px 2px rgba(220,38,38,0.05)' }}
                                                        >
                                                            ❌ Eliminar
                                                        </button>
                                                    </div>

                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
};

export default ActasConsolidadasDocente;
