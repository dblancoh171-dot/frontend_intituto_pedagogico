import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PerfilDocente = ({ profesorId, onFotoActualizada }) => {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    // 📦 ESTADOS PARA LOS MODALES FORMULARIOS
    const [modalGrado, setModalGrado] = useState({ abierto: false, modo: 'añadir', id: null });
    const [modalExp, setModalExp] = useState({ abierto: false, modo: 'añadir', id: null });

    // 📝 ESTADOS DE LOS FORMULARIOS (Campos limpios)
    const [formGrado, setFormGrado] = useState({ nivel_grado: 'Bachiller', nombre_mencion: '', institucion_emisora: '', ano_graduacion: new Date().getFullYear(), archivoPdf: null });
    const [formExp, setFormExp] = useState({ institucion_empresa: '', cargo_ocupado: '', fecha_inicio: '', fecha_fin: '', archivoPdf: null });

    // 🚀 LÓGICA RECTAL NATIVA PARA VENTANAS MOVIBLES
    const [posicionGrado, setPosicionGrado] = useState({ x: 100, y: 100 });
    const [posicionExp, setPosicionExp] = useState({ x: 150, y: 120 });
    const [arrastrando, setArrastrando] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });


    const resetearFormularioGrado = () => {
        setFormGrado({ nivel_grado: 'Bachiller', nombre_mencion: '', institucion_emisora: '', ano_graduacion: new Date().getFullYear(), archivoPdf: null });
        setModalGrado({ abierto: false, modo: 'añadir', id: null });
    };

    const resetearFormularioExp = () => {
        setFormExp({ institucion_empresa: '', cargo_ocupado: '', fecha_inicio: '', fecha_fin: '', archivoPdf: null });
        setModalExp({ abierto: false, modo: 'añadir', id: null });
    };


    const iniciarArrastre = (e, setPosicion) => {
        setArrastrando(true);
        // Calculamos el desfase entre el clic y la esquina del modal
        const contenedor = e.currentTarget.parentElement;
        const rect = contenedor.getBoundingClientRect();
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });

        // Eventos globales para mover libremente por toda la pantalla
        const moverElemento = (moveEvent) => {
            setPosicion({
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



    const prepararEdicionGrado = (item) => {
        setFormGrado({
            nivel_grado: item.nivel_grado,
            nombre_mencion: item.nombre_mencion,
            institucion_emisora: item.institucion_emisora,
            ano_graduacion: item.ano_graduacion,
            archivoPdf: null // El archivo nuevo se deja limpio hasta que elija uno
        });
        setModalGrado({ abierto: true, modo: 'editar', id: item.id });
    };

    const handleEliminarGrado = async (id) => {
        const confirmar = window.confirm("¿Está seguro de eliminar este grado académico? Esta acción destruirá el registro de forma permanente en la base de datos.");
        if (!confirmar) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/profesores/grado/${id}`);
            alert(`¡Éxito! ${res.data.message}`);
            window.location.reload(); // Refresco sónico para limpiar la grilla
        } catch (err) {
            alert(err.response?.data?.message || "Error al intentar eliminar el registro.");
        }
    };

    const prepararEdicionExp = (item) => {
        // Formateamos las fechas al formato estándar de los inputs HTML (YYYY-MM-DD)
        const fInicio = item.fecha_inicio ? item.fecha_inicio.substring(0, 10) : '';
        const fFin = item.fecha_fin ? item.fecha_fin.substring(0, 10) : '';

        setFormExp({
            institucion_empresa: item.institucion_empresa,
            cargo_ocupado: item.cargo_ocupado,
            fecha_inicio: fInicio,
            fecha_fin: fFin,
            archivoPdf: null
        });
        setModalExp({ abierto: true, modo: 'editar', id: item.id });
    };

    const handleEliminarExp = async (id) => {
        const confirmar = window.confirm("¿Está seguro de eliminar este registro de trayectoria laboral?");
        if (!confirmar) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/profesores/experiencia/${id}`);
            alert(`¡Éxito! ${res.data.message}`);
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || "Error al intentar remover la experiencia.");
        }
    };


    // =========================================================================
    // 📡 ENVÍO AXIOS: GUARDAR NUEVO GRADO ACADÉMICO (Añadir)
    // =========================================================================
    const handleGuardarGrado = async (e) => {
        e.preventDefault();

        if (!formGrado.nombre_mencion || !formGrado.institucion_emisora) {
            alert("Por favor, complete la mención y la universidad emisora.");
            return;
        }

        const formData = new FormData();
        formData.append('profesor_id', profesorId);
        formData.append('nivel_grado', formGrado.nivel_grado);
        formData.append('nombre_mencion', formGrado.nombre_mencion);
        formData.append('institucion_emisora', formGrado.institucion_emisora);
        formData.append('ano_graduacion', Number(formGrado.ano_graduacion));

        if (formGrado.archivoPdf) {
            formData.append('sustentoPdf', formGrado.archivoPdf); // Captura el archivo binario real indexado
        }

        try {
            // 🧠 SEMAFAFORO OPERATIVO: Evaluamos si el modal esta en modo añadir o editar
            if (modalGrado.modo === 'añadir') {
                const res = await axios.post('http://localhost:5000/api/profesores/grado', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(`¡Éxito! ${res.data.message}`);
            } else {
                // Dispara un PUT enviando el ID del registro en la URL
                const res = await axios.put(`http://localhost:5000/api/profesores/grado/${modalGrado.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(`¡Éxito! ${res.data.message}`);
            }

            setModalGrado({ abierto: false, modo: 'añadir', id: null });
            window.location.reload();
        } catch (err) {
            console.error("🚨 Error al procesar grado académico:", err);
            alert(err.response?.data?.message || "Ocurrió un error al procesar el grado.");
        }
    };

    // =========================================================================
    // 📡 ENVÍO AXIOS: GUARDAR NUEVA EXPERIENCIA LABORAL (Añadir)
    // =========================================================================
    const handleGuardarExperiencia = async (e) => {
        e.preventDefault();

        if (!formExp.institucion_empresa || !formExp.cargo_ocupado || !formExp.fecha_inicio) {
            alert("Por favor, complete la empresa, el cargo y la fecha de inicio.");
            return;
        }

        const formData = new FormData();
        formData.append('profesor_id', profesorId);
        formData.append('institucion_empresa', formExp.institucion_empresa);
        formData.append('cargo_ocupado', formExp.cargo_ocupado);
        formData.append('fecha_inicio', formExp.fecha_inicio);
        formData.append('fecha_fin', formExp.fecha_fin);

        if (formExp.archivoPdf) {
        formData.append('sustentoPdf', formExp.archivoPdf);
    }

        try {
            // 🧠 SEMAFORO OPERATIVO: Evaluamos el modo de la trayectoria laboral
            if (modalExp.modo === 'añadir') {
                const res = await axios.post('http://localhost:5000/api/profesores/experiencia', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(`¡Éxito! ${res.data.message}`);
            } else {
                // Dispara un PUT enviando el ID del registro en la URL
                const res = await axios.put(`http://localhost:5000/api/profesores/experiencia/${modalExp.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(`¡Éxito! ${res.data.message}`);
            }

            setModalExp({ abierto: false, modo: 'añadir', id: null });
            window.location.reload();
        } catch (err) {
            console.error("🚨 Error al procesar trayectoria laboral:", err);
            alert(err.response?.data?.message || "Ocurrió un error al procesar la experiencia.");
        }
    };

    useEffect(() => {
        const cargarLegajoDesdeBD = async () => {
            if (!profesorId) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/profesores/perfil-completo`, {
                    params: { profesor_id: profesorId }
                });
                setPerfil(res.data);
                setCargando(false);
            } catch (err) {
                console.error("🚨 Error de comunicación con la API del perfil:", err);
                setError(err.response?.data?.message || "No se pudo conectar con el servidor para extraer el perfil.");
                setCargando(false);
            }
        };

        cargarLegajoDesdeBD();
    }, [profesorId]);

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return 'Presente';
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaStr).toLocaleDateString('es-PE', opciones);
    };

    if (cargando) return <div style={{ padding: '24px', color: '#64748b', fontWeight: '500' }}>🔄 Sincronizando legajo con la base de datos de Aiven.io...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>;
    if (!perfil) return <div style={{ padding: '24px', color: '#64748b' }}>No hay información disponible.</div>;

    const { datos_personales, estudios_grados, estudios_experiencia } = perfil;

    return (
        <div style={{ color: '#1e293b' }}>

            {/* 🏛️ 1. TARJETA SUPERIOR: DATOS GENERALES CON AVATAR MAQUETADO DE ALTA FIDELIDAD */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>

                {/* 📦 BÚNKER DE CONTENCIÓN MULTIMEDIA: Todos los botones deben vivir estrictamente AQUÍ adentro */}
                <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>

                    {/* Círculo contenedor del avatar */}
                    <div style={{ width: '95px', height: '95px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', color: '#94a3b8', border: '3px solid #e2e8f0', overflow: 'hidden' }}>
                        {datos_personales.url_foto ? (
                            <img src={`http://localhost:5000${datos_personales.url_foto}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            "👨‍🏫"
                        )}
                    </div>

                    {/* 📷 Botón flotante Editar/Subir Foto: Ahora anclado perfectamente abajo a la derecha */}
                    <label
                        htmlFor="input-foto-perfil"
                        style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#0284c7', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 10, userSelect: 'none' }}
                        title="Subir o cambiar fotografía"
                    >
                        📷
                    </label>
                    <input
                        id="input-foto-perfil"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            const archivo = e.target.files[0];
                            const formData = new FormData();
                            formData.append('usuario_id', datos_personales.usuario_id);
                            formData.append('foto', archivo);

                            try {
                                const res = await axios.post('http://localhost:5000/api/profesores/upload-avatar', formData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                alert(`¡Éxito! ${res.data.message}`);

                                // 🔄 DISPARAMOS EL REFRESCO EN CADENA HACIA EL SIDEBAR
                                if (onFotoActualizada) onFotoActualizada();
                            } catch (err) {
                                alert("Error al subir la imagen.");
                            }

                        }}
                        style={{ display: 'none' }}
                    />

                    {/* ❌ Botón flotante para Eliminar Foto: Anclado arriba a la derecha del círculo */}
                    {datos_personales.url_foto && (
                        <button
                            type="button"
                            onClick={async () => {
                                const confirmar = window.confirm("¿Está seguro de eliminar su fotografía de perfil actual?");
                                if (!confirmar) return;
                                try {
                                    const res = await axios.post('http://localhost:5000/api/profesores/delete-avatar', {
                                        usuario_id: datos_personales.usuario_id
                                    });
                                    alert(res.data.message);

                                    // 🔄 DISPARAMOS EL REFRESCO EN CADENA HACIA EL SIDEBAR
                                    if (onFotoActualizada) onFotoActualizada();
                                } catch (err) {
                                    alert("Error al borrar la foto.");
                                }

                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: '#ef4444', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 11 }}
                            title="Eliminar foto actual"
                        >
                            ❌
                        </button>
                    )}
                </div>{/* ◄ FIN DEL BÚNKER DE CONTENCIÓN MULTIMEDIA */}


                {/* 📝 BLOQUE DE INFORMACIÓN PERSONAL (Lado derecho del avatar) */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{datos_personales.nombres} {datos_personales.apellidos}</h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>Código Docente: <span style={{ color: '#0284c7', fontWeight: '700' }}>{datos_personales.codigo_docente || 'SIN ASIGNAR'}</span></p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '13px' }}>
                        <div>📧 <strong>Correo:</strong> {datos_personales.email}</div>
                        <div>📱 <strong>Teléfono:</strong> {datos_personales.telefono || 'No registrado'}</div>
                        <div>🪪 <strong>DNI:</strong> {datos_personales.dni}</div>
                        <div>📍 <strong>Dirección:</strong> {datos_personales.direccion || 'No registrada'}</div>
                    </div>
                </div>

            </div>

            {/* CONTENEDOR ELÁSTICO DE DOS COLUMNAS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                {/* 🎓 COLUMNA GRADOS */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🎓 Títulos y Grados Académicos</span>
                        {/* 🟢 BOTÓN AÑADIR GRADO */}
                        <button
                            onClick={() => setModalGrado({ abierto: true, modo: 'añadir', id: null })}
                            style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            ➕ Añadir
                        </button>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {estudios_grados.map((item) => (
                            <div key={item.id} style={{ borderLeft: '3px solid #10b981', paddingLeft: '14px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.nivel_grado} en {item.nombre_mencion}</div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{item.institucion_emisora} — <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.ano_graduacion}</span></div>
                                    {item.url_adjunto_pdf && (
                                        <a href={`http://localhost:5000${item.url_adjunto_pdf}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0284c7', textDecoration: 'none', fontWeight: '600', marginTop: '6px' }}>
                                            📄 Ver Sustento PDF
                                        </a>
                                    )}
                                </div>

                                {/* 🛠️ BOTONERA DE ACCIÓN OPERATIVA PARA GRADOS */}
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                                    <button
                                        onClick={() => prepararEdicionGrado(item)} // ◄ CAMBIO: Carga los datos en el formulario
                                        style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}
                                        title="Editar este récord"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleEliminarGrado(item.id)} // ◄ CAMBIO: Dispara el delete con Axios
                                        style={{ backgroundColor: '#f1f5f9', color: '#dc2626', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}
                                        title="Eliminar este récord"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 💼 COLUMNA B: TRAYECTORIA Y EXPERIENCIA LABORAL */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>💼 Trayectoria y Experiencia Laboral</span>
                        {/* 🟢 BOTÓN AÑADIR EXPERIENCIA */}
                        <button
                            onClick={() => setModalExp({ abierto: true, modo: 'añadir', id: null })}
                            style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            ➕ Añadir
                        </button>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {estudios_experiencia.map((item) => (
                            <div key={item.id} style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.cargo_ocupado}</div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{item.institucion_empresa}</div>
                                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>📅 {formatearFecha(item.fecha_inicio)} al {formatearFecha(item.fecha_fin)}</div>
                                    {item.url_adjunto_pdf && (
                                        <a href={`http://localhost:5000${item.url_adjunto_pdf}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0284c7', textDecoration: 'none', fontWeight: '600', marginTop: '6px' }}>
                                            📄 Ver Constancia PDF
                                        </a>
                                    )}
                                </div>

                                {/* 🛠️ BOTONERA DE ACCIÓN OPERATIVA PARA EXPERIENCIA */}
                                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                                    <button
                                        onClick={() => prepararEdicionExp(item)} // ◄ CAMBIO: Carga los datos en el formulario
                                        style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}
                                        title="Editar este récord"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleEliminarExp(item.id)} // ◄ CAMBIO: Dispara el delete con Axios
                                        style={{ backgroundColor: '#f1f5f9', color: '#dc2626', border: 'none', borderRadius: '4px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' }}
                                        title="Eliminar este récord"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>


            {/* 🎓 MODAL FLOTANTE MOVIBLE: GRADOS ACADÉMICOS */}
            {
                modalGrado.abierto && (
                    <div style={{ position: 'fixed', top: `${posicionGrado.y}px`, left: `${posicionGrado.x}px`, width: '420px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex: 2000, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'fadeIn 0.15s ease' }}>

                        {/* BARRA DE AGARRE SUPERIOR (MANIJA DE ARRASTRE) */}
                        <div
                            onMouseDown={(e) => iniciarArrastre(e, setPosicionGrado)}
                            style={{ backgroundColor: '#abbed1', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                        >
                            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                                {modalGrado.modo === 'añadir' ? '➕ Añadir Grado Académico' : '✏️ Editar Grado Académico'}
                            </span>
                            <button type="button" onClick={resetearFormularioGrado} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
                        </div>

                        {/* CUERPO DEL FORMULARIO */}
                        <form style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Nivel del Grado:</label>
                                <select value={formGrado.nivel_grado} onChange={(e) => setFormGrado({ ...formGrado, nivel_grado: e.target.value })} style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }}>
                                    <option value="Bachiller">Bachiller</option>
                                    <option value="Licenciado">Licenciado</option>
                                    <option value="Magister">Magíster</option>
                                    <option value="Doctor">Doctor</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Nombre de la Mención:</label>
                                <input type="text" value={formGrado.nombre_mencion} onChange={(e) => setFormGrado({ ...formGrado, nombre_mencion: e.target.value })} placeholder="Ej: Ciencias Matemáticas" style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Institución Emisora:</label>
                                <input type="text" value={formGrado.institucion_emisora} onChange={(e) => setFormGrado({ ...formGrado, institucion_emisora: e.target.value })} placeholder="Ej: Universidad UNE La Cantuta" style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Año de Graduación:</label>
                                <input type="number" value={formGrado.ano_graduacion} onChange={(e) => setFormGrado({ ...formGrado, ano_graduacion: e.target.value })} style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Sustento Diploma (PDF):</label>
                                {/* 🚀 REPARADO: Ahora captura el índice [0] del archivo binario real */}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFormGrado({ ...formGrado, archivoPdf: e.target.files[0] })}
                                    style={{ fontSize: '12px', color: '#475569' }}
                                />
                            </div>

                            {/* BOTONES DE ACCIÓN */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={resetearFormularioGrado} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>

                                {/* 🚀 ENGRANE MAESTRO: Ejecuta la función de inserción con Axios al hacer clic */}
                                <button
                                    type="button"
                                    onClick={handleGuardarGrado}
                                    style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Guardar Récord
                                </button>
                            </div>
                        </form>
                    </div>
                )
            }



            {/* 💼 MODAL FLOTANTE MOVIBLE: EXPERIENCIA LABORAL */}
            {modalExp.abierto && (
                <div style={{ position: 'fixed', top: `${posicionExp.y}px`, left: `${posicionExp.x}px`, width: '420px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', zIndex: 2000, border: '1px solid #e2e8f0', overflow: 'hidden', animation: 'fadeIn 0.15s ease' }}>

                    {/* BARRA DE AGARRE SUPERIOR (MANIJA DE ARRASTRE) */}
                    <div
                        onMouseDown={(e) => iniciarArrastre(e, setPosicionExp)}
                        style={{ backgroundColor: '#aac8e6', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
                    >
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                            {modalExp.modo === 'añadir' ? '➕ Añadir Trayectoria Laboral' : '✏️ Editar Trayectoria Laboral'}
                        </span>
                        <button type="button" onClick={resetearFormularioExp} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
                    </div>

                    {/* CUERPO DEL FORMULARIO */}
                    <form style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Institución / Empresa:</label>
                            <input type="text" value={formExp.institucion_empresa} onChange={(e) => setFormExp({ ...formExp, institucion_empresa: e.target.value })} placeholder="Ej: Colegio San Francisco" style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Cargo Ocupado:</label>
                            <input type="text" value={formExp.cargo_ocupado} onChange={(e) => setFormExp({ ...formExp, cargo_ocupado: e.target.value })} placeholder="Ej: Coordinador Pedagógico" style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Fecha Inicio:</label>
                                <input type="date" value={formExp.fecha_inicio} onChange={(e) => setFormExp({ ...formExp, fecha_inicio: e.target.value })} style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', width: '100%' }} />
                            </div>
                            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Fecha Fin (Opcional):</label>
                                <input type="date" value={formExp.fecha_fin} onChange={(e) => setFormExp({ ...formExp, fecha_fin: e.target.value })} style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', width: '100%' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Constancia Laboral (PDF):</label>

                            {/* 🚀 REPARACIÓN: Extrae el binario real del índice [0] de la lista de archivos */}
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setFormExp({ ...formExp, archivoPdf: e.target.files[0] });
                                    }
                                }}
                                style={{ fontSize: '12px', color: '#475569' }}
                            />
                        </div>


                        {/* BOTONES DE ACCIÓN */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={resetearFormularioExp} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>

                            {/* 🚀 ENGRANE MAESTRO: Ejecuta la función de inserción con Axios al hacer clic */}
                            <button
                                type="button"
                                onClick={handleGuardarExperiencia}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Guardar Récord
                            </button>
                        </div>
                    </form>
                </div>
            )}


        </div>
    );
};





export default PerfilDocente;
