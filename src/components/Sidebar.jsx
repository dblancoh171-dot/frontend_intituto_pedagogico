import React from 'react';

const Sidebar = ({ estudianteNombre, isColapsado, onToggleColapso, vistaActiva, onCambiarVista }) => {
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
                    <div className="sidebar-item">📊 <span>Dashboard</span></div>

                    {/* 🔥 PESTAÑA PERFIL: Ilumina si vistaActiva es 'perfil' */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'perfil' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('perfil')}
                    >
                        👤 <span>Mi Perfil</span>
                    </div>

                    {/* 🔥 PESTAÑA MATRÍCULA: Ilumina si vistaActiva es 'matricula' */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'matricula' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('matricula')}
                    >
                        📘 <span>Proceso Matrícula</span>
                    </div>

                    <div
                        className={`sidebar-item ${vistaActiva === 'cursos' ? 'activo' : ''}`}
                        onClick={() => onCambiarVista('cursos')}
                        style={{ cursor: 'pointer' }} // Hace que aparezca la mano al pasar el mouse
                    >
                        📝 <span>Mis Cursos</span>
                    </div>
                    <div className="sidebar-item">⏳ <span>Historial Académico</span></div>
                    <div className="sidebar-item">💳 <span>Mis Pagos</span></div>
                    <div className="sidebar-item">⚙️ <span>Configuración</span></div>
                </div>
            </div>

            <div className="sidebar-perfil" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderTop: '1px solid #f1f5f9', margin: '0 12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    👤
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

