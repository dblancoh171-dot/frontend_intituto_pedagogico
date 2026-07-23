import React from 'react';

const Sidebar = ({ estudianteFoto, estudianteNombre, isColapsado, onToggleColapso, vistaActiva, onCambiarVista }) => {
    return (
        <div className={`sidebar ${isColapsado ? 'colapsado' : ''}`}>

            <div >
                <div className="sidebar-header">
                    <button type="button" className="btn-hamburguesa" onClick={onToggleColapso}>
                        ☰
                    </button>
                    <div className="sidebar-titulo-contenedor">
                        <span className="sidebar-titulo-largo">SISTEMA ACADÉMICO</span>
                        <span className="sidebar-titulo-corto">SA</span>
                    </div>
                </div>

                {/* Listado de Opciones del Alumno Interactivas */}
                <div className="sidebar-menu">

                    {/* 🔥 PESTAÑA PERFIL */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'perfil' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('perfil')}
                    >
                        👤 <span>Mi Perfil</span>
                    </div>
                    <div
                        className={`sidebar-item ${vistaActiva === 'horario' ? 'estudiante-activo' : 'estudiante-item'}`}
                        onClick={() => onCambiarVista('horario')}
                        style={{ cursor: 'pointer' }}
                    >
                        📅 <span>Mi Horario</span>
                    </div>

                    {/* 🔥 PESTAÑA MATRÍCULA */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'matricula' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('matricula')}
                    >
                        📘 <span>Proceso Matrícula</span>
                    </div>

                    {/* 🔥 PESTAÑA MIS CURSOS (Sesiones y Materiales) */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'cursos' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('cursos')}
                        style={{ cursor: 'pointer' }}
                    >
                        📝 <span>Mis Cursos</span>
                    </div>

                    {/* ========================================================================= */}
                    {/* 🔥 REPARACIÓN SÓNICA: Sincronizado al 100% con la compuerta de tu App.js [01/24, 01/25] */}
                    {/* ========================================================================= */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'calificaciones' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('calificaciones')}
                        style={{ cursor: 'pointer' }}
                    >
                        📙 <span>Mis Calificaciones</span>
                    </div>
                    {/* ========================================================================= */}

                    <div
                        className={`sidebar-item ${vistaActiva === 'historial' ? 'estudiante-activo' : 'estudiante-item'}`}
                        onClick={() => onCambiarVista('historial')}
                        style={{ cursor: 'pointer' }}
                    >
                        ⏳ <span>Historial Académico</span>
                    </div>
                    <div className="sidebar-item">💳 <span>Mis Pagos</span></div>
                    <div className="sidebar-item">⚙️ <span>Configuración</span></div>
                </div>
            </div>

            <div className="sidebar-perfil" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderTop: '1px solid #f1f5f9', margin: '0 12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, overflow: 'hidden', border: '1px solid #cbd5e1' }}>

                    {/* 📸 CLONACIÓN MULTIMEDIA SINCRÓNICA */}
                    {estudianteFoto ? (
                        <img src={`http://localhost:5000${estudianteFoto}`} alt="Nav Estudiante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        "👤"
                    )}

                </div>
                <div className="sidebar-usuario-info">
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        {estudianteNombre || "Cargando..."}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;