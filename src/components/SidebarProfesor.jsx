import React from 'react';

const SidebarProfesor = ({ profesorNombre, isColapsado, onToggleColapso, vistaActiva, onCambiarVista }) => {
    return (
        /* Inyectamos el estado condicional de colapso */
        <div className={`sidebar ${isColapsado ? 'colapsado' : ''}`}>

            {/* Parte Superior: Hamburguesa + Título Responsivo */}
            <div>
                <div className="sidebar-header">
                    <button type="button" className="btn-hamburguesa" onClick={onToggleColapso}>
                        ☰
                    </button>
                    <div className="sidebar-titulo-contenedor">
                        <span className="sidebar-titulo-largo">PANEL DOCENTE</span>
                        <span className="sidebar-titulo-corto prof-badge">SP</span>
                    </div>
                </div>

                {/* Listado de Opciones Exclusivas del Profesor */}
                <div className="sidebar-menu">
                    <div className="sidebar-item profesor-item">📊 <span>Inicio (Dashboard)</span></div>
                    <div className="sidebar-item profesor-item">📅 <span>Mi Horario</span></div>

                    {/* Opción activa iluminada en verde esmeralda */}
                    <div className="sidebar-item profesor-activo">📝 <span>Registro de Notas</span></div>
                    <div
                        className={`sidebar-item ${vistaActiva === 'cursos' ? 'profesor-activo' : 'profesor-item'}`}
                        onClick={() => onCambiarVista('cursos')} // 👈 Envía la orden a App.js
                    >
                        📚 <span>Mis Cursos</span>
                    </div>

                    <div className="sidebar-item profesor-item">👥 <span>Mis Alumnos</span></div>
                    <div className="sidebar-item profesor-item">🗂️ <span>Actas Consolidadas</span></div>
                    <div className="sidebar-item profesor-item">⚙️ <span>Configuración</span></div>
                </div>
            </div>

            {/* Parte Inferior: Ficha del Docente Logueado (Fija al fondo) */}
            <div className="sidebar-perfil" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 16px', borderTop: '1px solid #f1f5f9', margin: '0 12px' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                }}>
                    👨‍🏫
                </div>
                <div className="sidebar-usuario-info">
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b' }}>
                        {profesorNombre || "Juan Marcos Mendoza"}
                    </h4>
                </div>
            </div>

        </div>
    );
};

export default SidebarProfesor;
