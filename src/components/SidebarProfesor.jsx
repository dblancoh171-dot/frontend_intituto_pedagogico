import React from 'react';

const SidebarProfesor = ({ profesorFoto, profesorNombre, isColapsado, onToggleColapso, vistaActiva, onCambiarVista }) => {
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
                    <div
                        className={`sidebar-item ${vistaActiva === 'perfil' ? 'profesor-activo' : 'profesor-item'}`}
                        onClick={() => onCambiarVista('perfil')}
                        style={{ cursor: 'pointer' }}
                    >
                        👤 <span>Perfil</span>
                    </div>
                    <div className="sidebar-item profesor-item">📅 <span>Mi Horario</span></div>

                    {/* 📝 PESTAÑA: REGISTRO DE NOTAS (Dinamizada) */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'registro-notas' ? 'profesor-activo' : 'profesor-item'}`}
                        onClick={() => onCambiarVista('registro-notas')}
                        style={{ cursor: 'pointer' }}
                    >
                        📝 <span>Registro de Notas</span>
                    </div>

                    {/* 📚 PESTAÑA: MIS CURSOS */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'cursos' ? 'profesor-activo' : 'profesor-item'}`}
                        onClick={() => onCambiarVista('cursos')}
                        style={{ cursor: 'pointer' }}
                    >
                        📚 <span>Mis Cursos</span>
                    </div>

                    {/* 📥 PESTAÑA: RECEPCIÓN DE ACTIVIDADES */}
                    <div
                        className={`sidebar-item ${vistaActiva === 'recepcion-actividades' ? 'profesor-activo' : 'profesor-item'}`}
                        onClick={() => onCambiarVista('recepcion-actividades')}
                        style={{ cursor: 'pointer', marginTop: '4px' }}
                    >
                        📥 <span>Recepción de Actividades</span>
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
                    flexShrink: 0,
                    overflow: 'hidden', // ◄ Evita que la foto se desborde del círculo
                    border: '1px solid #e2e8f0'
                }}>
                    {/* 📸 AVATAR SINCRONIZADO: Si App.js le pasa la url_foto, la pinta; de lo contrario, deja el emoticón backup */}
                    {profesorFoto ? (
                        <img src={`http://localhost:5000${profesorFoto}`} alt="Nav Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        "👨‍🏫"
                    )}
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

