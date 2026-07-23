import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MiHorarioEstudiante = ({ usuarioId }) => {
    const [agenda, setAgenda] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // 📦 ESTADOS PARA EL MODAL INTERACTIVO DETALLADO
    const [modalAbierto, setModalAbierto] = useState(false);
    const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
    const [posicionModal, setPosicionModal] = useState({ x: 220, y: 150 });
    const [arrastrando, setArrastrando] = useState(false);

    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

    useEffect(() => {
        const cargarHorarioEstudiante = async () => {
            if (!usuarioId) return;
            try {
                const res = await axios.get('http://localhost:5000/api/estudiantes/mi-agenda-clases', {
                    params: { usuario_id: usuarioId }
                });
                setAgenda(res.data || []);
                setCargando(false);
            } catch (err) {
                console.error("🚨 Error al consultar la agenda estudiantil:", err);
                setError("No se pudo sincronizar el horario escolar con el servidor.");
                setCargando(false);
            }
        };
        cargarHorarioEstudiante();
    }, [usuarioId]);

    // MOTOR DE ARRASTRE PARA LA MANIJA DEL MODAL DETALLADO
    const iniciarArrastre = (e) => {
        setArrastrando(true);
        const contenedor = e.currentTarget.parentElement;
        const rect = contenedor.getBoundingClientRect();
        
        const moverElemento = (moveEvent) => {
            setPosicionModal({
                x: moveEvent.clientX - (e.clientX - rect.left),
                y: moveEvent.clientY - (e.clientY - rect.top)
            });
        };

        const detenerArrastre = () => {
            document.removeEventListener('mousemove', moverElemento);
            document.removeEventListener('mouseup', detenerArrastre);
            setArrastrando(false);
        };

        document.addEventListener('mousemove', moverElemento);
        document.addEventListener('mouseup', detenerArrastre);
    };

    const formatearHora = (horaStr) => {
        if (!horaStr) return '';
        return horaStr.substring(0, 5);
    };

    if (cargando) return <div style={{ padding: '24px', color: '#64748b' }}>📅 Cargando tu cronograma semanal desde Aiven.io...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444' }}>⚠️ {error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b', position: 'relative' }}>
            
            {/* 📋 CABECERA INFORMATIVA */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>📅 Mi Horario y Agenda de Clases</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Distribución oficial de asignaturas, bloques de tiempo y aulas físicas para tu matrícula del periodo activo.
                </p>
            </div>

            {/* 🖥️ GRILLA DE 6 COLUMNAS RESPONSIVAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                {diasSemana.map((dia) => {
                    const clasesDelDia = agenda.filter(item => item.dia_semana.toLowerCase() === dia);

                    return (
                        <div key={dia} style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ textTransform: 'capitalize', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                                {dia === 'miercoles' ? 'Miércoles' : dia === 'sabado' ? 'Sábado' : dia}
                            </div>

                            {clasesDelDia.length === 0 ? (
                                <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>Sin clases</div>
                            ) : (
                                clasesDelDia.map((clase) => (
                                    <div 
                                        key={clase.horario_id} 
                                        onClick={() => {
                                            setCursoSeleccionado(clase);
                                            setModalAbierto(true);
                                        }}
                                        style={{ 
                                            backgroundColor: '#ffffff', 
                                            borderRadius: '8px', 
                                            padding: '12px', 
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                                            border: '1px solid #e2e8f0',
                                            borderLeft: '4px solid #2563eb',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.15s ease, box-shadow 0.15s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.08)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
                                    >
                                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
                                            🔑 {clase.curso_codigo || 'N/A'}
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                                            ⏱️ {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                                            {clase.curso_nombre}
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e293b', backgroundColor: '#eff6ff', padding: '3px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', alignSelf: 'flex-start' }}>
                                            📍 {clase.aula}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
                        {/* 🛸 MODAL FLOTANTE MOVIBLE: DETALLE ESPECÍFICO DE ASIGNATURA */}
            {modalAbierto && cursoSeleccionado && (
                <div style={{ position: 'fixed', top: `${posicionModal.y}px`, left: `${posicionModal.x}px`, width: '420px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', zIndex: 2500, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    
                    {/* BARRA DE AGARRE (MANIJA DE ENTRADA) */}
                    <div 
                        onMouseDown={iniciarArrastre}
                        style={{ backgroundColor: '#2563eb', padding: '14px 18px', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', color: '#ffffff' }}
                    >
                        <span style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'uppercase' }}>📋 Ficha Detallada del Curso</span>
                        <button type="button" onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#ffffff', fontWeight: 'bold' }}>×</button>
                    </div>

                    {/* CUERPO INFORMÁTICO DEL SÍLABO */}
                    <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Código Oficial:</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{cursoSeleccionado.curso_codigo}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Nombre Curricular:</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>{cursoSeleccionado.curso_nombre}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Ciclo:</div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Ciclo {cursoSeleccionado.curso_ciclo || 'I'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Ambiente / Aula:</div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>📍 {cursoSeleccionado.aula}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Día de Dictado:</div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>{cursoSeleccionado.dia_semana}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Horario Programado:</div>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>⏱️ {formatearHora(cursoSeleccionado.hora_inicio)} - {formatearHora(cursoSeleccionado.hora_fin)}</div>
                            </div>
                        </div>

                        {/* 👨‍🏫 DATO EXCLUSIVO: PROFESOR ENCARGADO DE LA CÁTEDRA */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>👨‍🏫 Catedrático Encargado:</div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                                {cursoSeleccionado.profesor_nombre || "Cargando docente..."}
                            </div>
                        </div>

                        {/* BOTÓN DE CIERRE EXTRA */}
                        <button 
                            type="button" 
                            onClick={() => setModalAbierto(false)} 
                            style={{ padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '6px', transition: 'background-color 0.15s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        >
                            Entendido, Cerrar Ficha
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiHorarioEstudiante;
