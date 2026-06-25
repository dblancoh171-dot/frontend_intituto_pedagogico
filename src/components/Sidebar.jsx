import React from 'react';

const Sidebar = ({ estudianteNombre, isColapsado, onToggleColapso }) => {
    return (
        <div className={`sidebar ${isColapsado ? 'colapsado' : ''}`}>
            {/* Parte Superior Actualizada: Hamburguesa + Título */}
            <div>
                <div className="sidebar-header">
                    <button type="button" className="btn-hamburguesa" onClick={onToggleColapso}>
                        ☰
                    </button>
                    <div className="sidebar-titulo-contenedor">
                        <span className="sidebar-titulo-largo">SISTEMA ACADÉMICO</span>
                        <span className="sidebar-titulo-corto">SA</span>
                    </div>
                </div>


                {/* Listado de Opciones del Menú */}
                <div className="sidebar-menu">

                    <div className="sidebar-item">📊 <span>Dashboard</span></div>
                    <div className="sidebar-item">👥 <span>Matrícula</span></div>
                    <div className="sidebar-item activo">📘 <span>Proceso Matrícula</span></div>
                    <div className="sidebar-item">📝 <span>Mis Cursos</span></div>
                    <div className="sidebar-item">⏳ <span>Historial Académico</span></div>
                    <div className="sidebar-item">💳 <span>Mis Pagos</span></div>
                    <div className="sidebar-item">⚙️ <span>Configuración</span></div>

                </div>
            </div>

            {/* Parte Inferior: Ficha del Usuario Conectado */}
            <div className="sidebar-perfil">
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                }}>
                    👤
                </div>

                {/* Texto alineado al costado derecho */}
                <div className="sidebar-usuario-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                        {estudianteNombre || "Cargando..."}
                    </h4>
                </div>

            </div>
        </div>
    );
};

export default Sidebar;
