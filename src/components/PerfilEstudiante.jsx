import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PerfilEstudiante = ({ estudianteId, onFotoActualizada }) => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // 📦 ESTADOS PARA EL MODAL MOVIBLE DE CONTACTO
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formContacto, setFormContacto] = useState({ telefono: '', direccion: '' });
    const [posicionModal, setPosicionModal] = useState({ x: 680, y: 240 });
    const [arrastrando, setArrastrando] = useState(false);

    useEffect(() => {
        const cargarPerfilEstudiante = async () => {
            if (!estudianteId) return;
            try {
                // Golpeamos tu endpoint calibrado de estudiantes
                const res = await axios.get('http://localhost:5000/api/estudiantes/perfil-completo', {
                    params: { estudiante_id: estudianteId }
                });

                // Como tu controlador devuelve rows, extraemos el índice cero
                const datos = Array.isArray(res.data) ? res.data[0] : res.data;
                setPerfil(datos);
                setCargando(false);
            } catch (err) {
                console.error("🚨 Error al sincronizar el perfil del alumno:", err);
                setError(err.response?.data?.message || "No se pudo conectar con el servidor para extraer el perfil.");
                setCargando(false);
            }
        };

        cargarPerfilEstudiante();
    }, [estudianteId]);


    // 🚀 MOTOR DE ARRASTRE FLUIDO POR HARDWARE
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

    // 📡 GATILLO DE ENVÍO AXIOS (PUT)
    const handleGuardarContacto = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/estudiantes/actualizar-contacto', {
                usuario_id: perfil.usuario_id,
                telefono: formContacto.telefono,
                direccion: formContacto.direccion
            });
            alert(res.data.message);
            setModalAbierto(false);
            window.location.reload(); // Recarga sónica de la ficha
        } catch (err) {
            alert("Error al intentar guardar los cambios de contacto.");
        }
    };

    if (cargando) return <div style={{ padding: '24px', color: '#64748b', fontWeight: '500' }}>🔄 Sincronizando tu legajo estudiantil con Aiven.io...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>;
    if (!perfil) return <div style={{ padding: '24px', color: '#64748b' }}>No hay información disponible.</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b', animation: 'fadeIn 0.2s ease' }}>

            {/* 🏛️ 1. FICHA SUPERIOR CON AVATAR INTERACTIVO Y FOTO SINCRONIZADA */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>

                {/* 📦 BÚNKER MULTIMEDIA DE ANCLAJE */}
                <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                    <div style={{ width: '95px', height: '95px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', color: '#94a3b8', border: '3px solid #e2e8f0', overflow: 'hidden' }}>
                        {perfil.url_foto ? (
                            <img src={`http://localhost:5000${perfil.url_foto}`} alt="Avatar Estudiante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            "🎓"
                        )}
                    </div>

                    {/* 📷 Camarita Flotante para Editar/Subir Foto */}
                    <label
                        htmlFor="input-foto-alumno"
                        style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#2563eb', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 10, userSelect: 'none' }}
                        title="Subir fotografía"
                    >
                        📷
                    </label>
                    <input
                        id="input-foto-alumno"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            const archivo = e.target.files[0];
                            const formData = new FormData();
                            formData.append('usuario_id', perfil.usuario_id);
                            formData.append('foto', archivo);

                            try {
                                // Apuntamos al endpoint de carga masiva de avatar (reutilizando tu controlador)
                                const res = await axios.post('http://localhost:5000/api/estudiantes/upload-avatar', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                alert(`¡Éxito! ${res.data.message}`);
                                window.location.reload();
                            } catch (err) {
                                alert("Error al subir la imagen de perfil.");
                            }
                        }}
                        style={{ display: 'none' }}
                    />

                    {/* ❌ Botón para remover foto si ya existe una activa */}
                    {perfil.url_foto && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (!window.confirm("¿Deseas eliminar tu foto de perfil actual?")) return;
                                try {
                                    const res = await axios.post('http://localhost:5000/api/estudiantes/delete-avatar', {
                                        usuario_id: perfil.usuario_id
                                    });
                                    window.location.reload();
                                } catch (err) {
                                    alert("Error al remover la foto.");
                                }
                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#ef4444', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 11 }}
                            title="Eliminar foto"
                        >
                            ❌
                        </button>
                    )}
                </div>

                {/* 📝 DATOS CONTRACTUALES E IDENTIDAD */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{perfil.apellidos}, {perfil.nombres}</h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}> Matrícula Institucional: <span style={{ color: '#2563eb', fontWeight: '700' }}>{perfil.codigo_estudiante || 'PRE-MATRÍCULA'}</span></p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '13px' }}>
                        <div>🪪 <strong>DNI:</strong> {perfil.dni}</div>
                        <div>📧 <strong>Correo Electrónico:</strong> {perfil.email}</div>
                        <div>📱 <strong>Teléfono Móvil:</strong> {perfil.telefono || 'No registrado'}</div>
                        <div>📍 <strong>Dirección Residencial:</strong> {perfil.direccion || 'No registrada'}</div>
                    </div>
                </div>
            </div>

            {/* 🗂️ TARJETAS OPERATIVAS DEL RÉCORD DEL ALUMNO */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Periodo y Ciclo Actual</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>Ciclo {perfil.cycle_actual || perfil.ciclo_actual || 'I'}</div>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 🚀 ENGANCHADO: Abre tu modal movible de contacto */}
                    <button
                        onClick={() => setModalAbierto(true)}
                        style={{ backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%', height: '42px' }}
                    >
                        ✏️ Actualizar Datos de Contacto
                    </button>
                </div>
            </div>

            {/* 🛸 3. MODAL FLOTANTE MOVIBLE EXCLUSIVO: CONTACTO DE ALUMNO */}
            {modalAbierto && (
                <div style={{ position: 'fixed', top: `${posicionModal.y}px`, left: `${posicionModal.x}px`, width: '380px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', zIndex: 2200, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

                    {/* BARRA DE AGARRE (MANIJA DE ARRASTRE) */}
                    <div
                        onMouseDown={iniciarArrastre}
                        style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                    >
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>✏️ Editar Datos de Contacto</span>
                        <button type="button" onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
                    </div>

                    {/* CUERPO DEL FORMULARIO ATÓMICO */}
                    <form style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Teléfono Móvil:</label>
                            <input
                                type="text"
                                value={formContacto.telefono}
                                maxLength={9}
                                onChange={(e) => {
                                    const soloNumeros = e.target.value.replace(/\D/g, ''); // Elimina letras y caracteres especiales
                                    setFormContacto({ ...formContacto, telefono: soloNumeros });
                                }}
                                placeholder="Ej: 987654321"
                                style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Dirección Residencial:</label>
                            <input
                                type="text"
                                value={formContacto.direccion}
                                onChange={(e) => setFormContacto({ ...formContacto, direccion: e.target.value })}
                                placeholder="Ej: Av. Las Begonias 456"
                                style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }}
                            />
                        </div>

                        {/* BOTONERA DE CONTROL */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                            <button type="button" onClick={() => setModalAbierto(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                            <button type="button" onClick={handleGuardarContacto} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Guardar Cambios</button>
                        </div>
                    </form>
                </div>
            )}

        </div>
    );
};

export default PerfilEstudiante;
