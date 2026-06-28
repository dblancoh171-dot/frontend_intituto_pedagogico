import React, { useState, useEffect } from 'react';
import axios from 'axios';


const ContenidoClase = ({ sesionNumero, tituloInicial, sesionId, onRegresar }) => {
    const [tituloSesion, setTituloSesion] = useState(tituloInicial || '');
    const [archivosSubidos, setArchivosSubidos] = useState([]);
    const [archivoParaSubir, setArchivoParaSubir] = useState(null); // Guarda el archivo físico en memoria
    const [dragActivo, setDragActivo] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);

    // 🌟 ESTADO CONTROLADOR DE APERTURA DEL MODAL FLOTANTE
    const [mostrarCrearModal, setMostrarCrearModal] = useState(false);

    // 🌟 ESTADO PARA SABER QUÉ BOTONES ESTÁN ACTIVOS / PRESIONADOS
    const [botonesActivos, setBotonesActivos] = useState({ bold: false, italic: false, underline: false });

    // 🌟 ESTADOS REALES DEL FORMULARIO DEL MODAL FLOTANTE
    const [formTitulo, setFormTitulo] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formTipoDoc, setFormTipoDoc] = useState('pdf');
    const [formArchivoGuia, setFormArchivoGuia] = useState(null);
    const [formFecha, setFormFecha] = useState('');
    const [formHora, setFormHora] = useState('18:00');
    const [formPuntaje, setFormPuntaje] = useState(20);

    const [dragActivoModal, setDragActivoModal] = useState(false);


    // 🌟 ESTADO PARA ALMACENAR LA DATA DEL CUADRO DE RESUMEN DERECHO
    const [actividadesProgramadas, setActividadesProgramadas] = useState([]);


    // Handlers exclusivos para la carga de archivos guía en el modal flotante
    const handleDragModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActivoModal(true);
        else if (e.type === "dragleave") setDragActivoModal(false);
    };

    const handleDropModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActivoModal(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Capturamos estrictamente el primer archivo arrastrado por el docente
            setFormArchivoGuia(e.dataTransfer.files[0]);
        }
    };

    const handleBuscarArchivoModal = (e) => {
        if (e.target.files && e.target.files[0]) {
            // Capturamos el archivo seleccionado mediante el explorador de Windows/Mac
            setFormArchivoGuia(e.target.files[0]);
        }
    };


    // 📡 1. Leer las actividades existentes para el cuadro de Resumen
    const cargarActividadesResumen = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/notas/actividades-sesion`, {
                params: { sesion_id: sesionId }
            });
            setActividadesProgramadas(res.data || []);
        } catch (error) {
            console.error("Error al jalar actividades evaluativas:", error);
        }
    };



    // 🔥 FUNCIONALIDAD NATIVA COMPATIBLE CON REACT 19 PARA ESTILOS B, I, U
    const aplicarEstiloTexto = (estilo, valor = null) => {
        const cajaEditable = document.getElementById("editor-descripcion-editable");
        if (!cajaEditable) return;

        // Ejecutamos el comando nativo del navegador
        if (estilo === 'bold') document.execCommand('bold', false, null);
        if (estilo === 'italic') document.execCommand('italic', false, null);
        if (estilo === 'underline') document.execCommand('underline', false, null);
        if (estilo === 'color' && valor) document.execCommand('foreColor', false, valor);

        // Guardamos el HTML resultante en el estado de React
        setFormDescripcion(cajaEditable.innerHTML);

        // Forzamos al navegador a recalcular los estilos activos en ese instante exacto
        setBotonesActivos({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });
    };




    // 🌟 NUEVO: Función que detecta en tiempo real qué estilos están aplicados donde está el cursor
    const verificarBotonesActivos = () => {
        setBotonesActivos({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });
    };



    // 📡 2. Guardar Nueva Actividad Evaluativa (Conectado a tu Backend)
    const handleSavenuevaActividad = async (e) => {
        e.preventDefault();

        if (!formTitulo.trim() || !formFecha) {
            alert("Por favor, completa los campos obligatorios (Título y Fecha Límite).");
            return;
        }

        // Combinamos la fecha y hora en un solo formato DATETIME para MySQL
        const fechaLimiteCompleta = `${formFecha} ${formHora}:00`;

        const formData = new FormData();
        formData.append('sesion_id', Number(sesionId));
        formData.append('titulo', formTitulo.trim());
        formData.append('descripcion', formDescripcion.trim());
        formData.append('tipo_documento', formTipoDoc);
        formData.append('puntuacion_maxima', Number(formPuntaje));
        formData.append('fecha_limite', fechaLimiteCompleta);

        if (formArchivoGuia) {
            formData.append('archivo', formArchivoGuia); // Archivo adjunto opcional
        }

        try {
            await axios.post('http://localhost:5000/api/notas/crear-activity', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("¡Evaluación / Tarea grabada con éxito en Aiven.io!");
            setMostrarCrearModal(false); // Cierra el modal flotante

            // Limpiamos los campos del formulario para la próxima creación
            setFormTitulo(''); setFormDescripcion(''); setFormArchivoGuia(null); setFormFecha('');

            // 🔄 ACTUALIZACIÓN EN CALIENTE: Refrescamos la caja de resumen de la derecha
            cargarActividadesResumen();
        } catch (error) {
            alert("Error al procesar el guardado: " + error.message);
        }
    };


    // 1. Leer los archivos reales ya guardados en la BD al abrir la pantalla
    const cargarMaterialesExistentes = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/notas/sesion-materiales`, {
                params: { sesion_id: sesionId }
            });
            setArchivosSubidos(res.data);
        } catch (error) {
            console.error("Error al traer materiales de la base de datos:", error);
        }
    };

    useEffect(() => {
        if (sesionId) cargarMaterialesExistentes();
    }, [sesionId]);

    // Manejo del Drag & Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActivo(true);
        else if (e.type === "dragleave") setDragActivo(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActivo(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setArchivoParaSubir(e.dataTransfer.files[0]);
        }
    };

    const handleBuscarArchivo = (e) => {
        if (e.target.files && e.target.files[0]) {
            setArchivoParaSubir(e.target.files[0]);
        }
    };

    // 🔥 NUEVO: Limpiar por completo el archivo seleccionado de la memoria del modal
    const handleRemoverArchivoGuiaTemporal = () => {
        setFormArchivoGuia(null); // Regresa el estado a nulo, vaciando la caja
    };

    // 🔥 2. ENVÍO REAL HACIA AIVEN.IO AL CONFIRMAR EL MODAL
    const handleConfirmarGuardado = async () => {

        // Validación preventiva
        if (!tituloSesion || tituloSesion.trim() === '') {
            alert("Por favor, ingresa un título válido para la sesión antes de confirmar.");
            return;
        }

        const formData = new FormData();
        formData.append('sesion_id', sesionId);
        formData.append('titulo', tituloSesion);

        if (archivoParaSubir) {
            formData.append('archivo', archivoParaSubir); // Añadimos el archivo físico arrastrado
        }

        try {
            await axios.post('http://localhost:5000/api/notas/guardar-contenido', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // Encabezado obligatorio para archivos
            });

            setMostrarModal(false);
            setArchivoParaSubir(null);
            alert("¡Título y archivos sincronizados correctamente en tu base de datos de Aiven.io!");
            cargarMaterialesExistentes(); // Refrescamos la lista derecha con el archivo real
            onRegresar();
        } catch (error) {
            alert("Error al guardar en el servidor: " + error.message);
        }
    };



    const handleEliminarMaterialReal = async (materialId) => {
        const confirmar = window.confirm("¿Estás completamente seguro de eliminar este archivo del repositorio institucional?");
        if (!confirmar) return;

        try {
            // Conexión real hacia el nuevo endpoint del backend
            await axios.post('http://localhost:5000/api/notas/eliminar-material', {
                material_id: materialId
            });

            alert("Archivo purgado con éxito.");
            cargarMaterialesExistentes(); // 🔄 Recargamos el visor en caliente directo desde la BD
        } catch (error) {
            alert("Error al eliminar el documento: " + error.message);
        }
    };



    return (
        <div style={{ animation: 'fadeIn 0.2s ease-in-out', maxWidth: '1100px', margin: '0 auto' }}>

            <button type="button" onClick={onRegresar} style={{ backgroundColor: 'transparent', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '15px' }}>
                ← Volver a Sesiones
            </button>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a', whiteSpace: 'nowrap' }}>
                    SESIÓN {sesionNumero} :
                </span>
                <input
                    type="text"
                    value={tituloSesion}
                    onChange={(e) => setTituloSesion(e.target.value)}
                    style={{ flex: 1, height: '40px', padding: '0 12px', fontSize: '14.5px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', color: '#0f172a' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '25px' }}>

                {/* Zona Drag & Drop */}
                <div
                    onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                    style={{ backgroundColor: '#ffffff', border: dragActivo ? '2px dashed #16a34a' : '2px dashed #cbd5e1', borderRadius: '10px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '220px' }}
                >
                    <span style={{ fontSize: '40px' }}>{archivoParaSubir ? '📄' : '📁'}</span>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155', textAlign: 'center' }}>
                        {archivoParaSubir ? `Listo para subir: ${archivoParaSubir.name}` : 'Arrastra y suelta tus archivos de clase aquí'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Soporta formatos PPTX, PDF, DOCX o ZIP</p>
                    <label style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                        Examinar mi PC
                        <input type="file" onChange={handleBuscarArchivo} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Lista Derecha de Documentos en la Base de Datos */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📚 Repositorio de la Sesión ({archivosSubidos.length})
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px' }}>
                        {archivosSubidos.length === 0 ? (
                            <p style={{ margin: 'auto', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>No hay archivos registrados</p>
                        ) : (
                            archivosSubidos.map(arq => (
                                <div key={arq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                    <div style={{ overflow: 'hidden', marginRight: '10px', flex: 1 }}>
                                        <a href={`http://localhost:5000${arq.url_archivo}`} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: '12.5px', fontWeight: '600', color: '#2563eb', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={arq.nombre_archivo}>
                                            📄 {arq.nombre_archivo}
                                        </a>
                                    </div>
                                    {/* 🔥 EL ICONO DE ELIMINACIÓN REAL CONECTADO AL ENDPOINT */}
                                    <button
                                        type="button"
                                        onClick={() => handleEliminarMaterialReal(arq.id)} // 👈 Dispara la purga en la BD
                                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '0 4px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}
                                        title="Eliminar archivo"
                                    >
                                        ❌
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button type="button" onClick={() => setMostrarModal(true)} style={{ height: '42px', padding: '0 24px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    💾 Confirmar y Guardar Sesión
                </button>
            </div>


            {/* 🔥 4. NUEVO CUADRO PANORÁMICO: TRABAJOS Y EVALUACIONES (DEBAJO DE LOS ANTERIORES) */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', marginBottom: '25px', marginTop: '25px' }}>

                {/* Título del Cuadro Principal */}
                <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #000000', paddingBottom: '12px' }}>
                    🎯 TRABAJOS Y EVALUACIONES
                </h3>

                {/* Distribución Interna solicitada */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>

                    {/* A la izquierda: Botón Crear */}
                    <div style={{ flexShrink: 0 }}>
                        <button
                            type="button"
                            onClick={() => setMostrarCrearModal(true)} // 👈 Prende el Modal
                            style={{
                                height: '40px',
                                marginLeft: '40px',
                                marginTop: '40px',
                                padding: '0 24px',
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            Crear
                        </button>
                    </div>

                    {/* A la derecha: Cuadro de Resumen en blanco temporal */}
                    <div style={{ flex: 1, maxWidth: '450px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minHeight: '100px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                            📋 Evaluaciones Programadas ({actividadesProgramadas.length})
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {actividadesProgramadas.length === 0 ? (
                                <p style={{ margin: '15px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                                    Sin trabajos programados para esta sesión.
                                </p>
                            ) : (
                                actividadesProgramadas.map(act => (
                                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '6px' }}>
                                                {act.tipo_documento}
                                            </span>
                                            <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{act.titulo}</strong>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>⏰ Límite: {act.fecha_formateada}</p>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>{act.puntuacion_maxima} pts</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>



            {/* MODAL DE CONFIRMACIÓN */}
            {mostrarModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', width: '380px', textAlign: 'center' }}>
                        <span style={{ fontSize: '36px' }}>❓</span>
                        <h3 style={{ margin: '12px 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>¿Confirmar cambios de la clase?</h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#475569' }}>Se guardará el título editado y el archivo adjunto de forma permanente en la nube.</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setMostrarModal(false)} style={{ flex: 1, height: '36px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Cancelar</button>
                            <button type="button" onClick={handleConfirmarGuardado} style={{ flex: 1, height: '36px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Sí, Guardar</button>
                        </div>
                    </div>
                </div>
            )}



            {/* 🔥 INTERFAZ FLOTANTE: CREAR NUEVA EVALUACIÓN / TAREA (PASO POR PASO) */}
            {mostrarCrearModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, animation: 'fadeIn 0.15s ease-in-out' }}>
                    <div style={{ backgroundColor: '#ffffff', width: '920px', borderRadius: '12px', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* ENCABEZADO Y BOTÓN X DE CIERRE */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                Crear <span style={{ color: '#0284c7' }}>Nueva Evaluación / Tarea</span>
                            </h2>
                            <button type="button" onClick={() => setMostrarCrearModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                        </div>

                        {/* LINEA DE PASOS PROGRESIVOS SIMÉTRICA */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px', fontSize: '12.5px', fontWeight: '600', color: '#64748b' }}>
                            <div style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}><span>1. Detalles Generales</span><div style={{ width: '80px', height: '2px', backgroundColor: '#e2e8f0' }}></div></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>2. Configuración y Archivos</span><div style={{ width: '80px', height: '2px', backgroundColor: '#e2e8f0' }}></div></div>
                            <div>3. Publicación</div>
                        </div>

                        {/* CUERPO CENTRAL EN DOS COLUMNAS DE LA REFERENCIA */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>

                            {/* COLUMNA IZQUIERDA: DETALLES GENERALES */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Título de la Evaluación</label>
                                    <input type="text" value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} placeholder="Ej: Examen Parcial II: Metabolismo" style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Descripción</label>
                                    {/* Barra de Herramientas del Editor de Referencia */}
                                    {/* BARRA DE HERRAMIENTAS INTERACTIVA REAL CON ESTILO CORPORATIVO */}
                                    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderBottom: 'none', padding: '6px 10px', borderRadius: '6px 6px 0 0' }}>
                                        <button
                                            type="button"
                                            onClick={() => aplicarEstiloTexto('bold')}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                border: botonesActivos.bold ? '1px solid #94a3b8' : '1px solid transparent',
                                                // 🔥 Si está marcado, se pinta de color gris oscuro persistente indicando que está presionado
                                                backgroundColor: botonesActivos.bold ? '#cbd5e1' : 'transparent',
                                                fontWeight: '800',
                                                color: '#0f172a',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                transition: 'all 0.15s ease-in-out'
                                            }}
                                            title="Negrita"
                                            onMouseEnter={(e) => { if (!botonesActivos.bold) e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                            onMouseLeave={(e) => { if (!botonesActivos.bold) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            B
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => aplicarEstiloTexto('italic')}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                border: botonesActivos.italic ? '1px solid #94a3b8' : '1px solid transparent',
                                                backgroundColor: botonesActivos.italic ? '#cbd5e1' : 'transparent',
                                                fontStyle: 'italic',
                                                fontFamily: 'serif',
                                                color: '#0f172a',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontSize: '15px',
                                                transition: 'all 0.15s ease-in-out'
                                            }}
                                            title="Cursiva"
                                            onMouseEnter={(e) => { if (!botonesActivos.italic) e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                            onMouseLeave={(e) => { if (!botonesActivos.italic) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            I
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => aplicarEstiloTexto('underline')}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                border: botonesActivos.underline ? '1px solid #94a3b8' : '1px solid transparent',
                                                backgroundColor: botonesActivos.underline ? '#cbd5e1' : 'transparent',
                                                textDecoration: 'underline',
                                                color: '#0f172a',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                transition: 'all 0.15s ease-in-out'
                                            }}
                                            title="Subrayado"
                                            onMouseEnter={(e) => { if (!botonesActivos.underline) e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                                            onMouseLeave={(e) => { if (!botonesActivos.underline) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        >
                                            U
                                        </button>
                                        <div style={{ width: '1px', height: '20px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>

                                        {/* 🔥 NUEVO: BOTÓN SELECTOR DE COLOR DE LETRA */}
                                        <label
                                            type="button"
                                            /* 🔥 EL TRUCO DE INGENIERÍA: e.preventDefault() congela la selección del mouse en la pantalla */
                                            onMouseDown={(e) => e.preventDefault()}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.15s'
                                            }}
                                            title="Color de texto"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <span style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '3px solid #ef4444', padding: '0 2px' }}>A</span>
                                            <input
                                                type="color"
                                                defaultValue="#000000"
                                                /* Cambiamos a onInput para que el color se transmita en tiempo real al arrastrar el mouse en la paleta */
                                                onInput={(e) => aplicarEstiloTexto('color', e.target.value)}
                                                style={{ display: 'none' }}
                                            />
                                        </label>


                                    </div>

                                    <div
                                        id="editor-descripcion-editable"
                                        contentEditable={true} // 👈 Convierte el div en un editor de texto real en vivo
                                        onInput={(e) => setFormDescripcion(e.currentTarget.innerHTML)} // 👈 Envía el contenido formateado oculto al estado
                                        style={{
                                            width: '100%',
                                            height: '110px',
                                            padding: '12px',
                                            fontSize: '13.5px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '0 0 6px 6px',
                                            color: '#0f172a',
                                            backgroundColor: '#ffffff',
                                            overflowY: 'auto',
                                            outline: 'none',
                                            lineHeight: '1.5',
                                            cursor: 'text'
                                        }}
                                        placeholder="Escribe las instrucciones detalladas aquí..."
                                    ></div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Tipo de Documento</label>
                                    <select value={formTipoDoc} onChange={(e) => setFormTipoDoc(e.target.value)} style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                                        <option value="pdf">Documento PDF (.pdf)</option>
                                        <option value="xlsx">Hoja de Cálculo de Excel (.xlsx, .xls)</option>
                                        <option value="docx">Documento de Word (.docx, .doc)</option>
                                        <option value="pptx">Presentación de PowerPoint (.pptx, .ppt)</option>
                                        <option value="zip">Archivo Comprimido (.zip, .rar)</option>
                                    </select>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: CONFIGURACIÓN Y ARCHIVOS */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                                        Subir Archivos Guía o Plantilla (Opcional)
                                    </label>

                                    {/* 🔥 ÁREA INTERACTIVA DRAG AND DROP */}
                                    <div
                                        onDragEnter={handleDragModal}
                                        onDragOver={handleDragModal}
                                        onDragLeave={handleDragModal}
                                        onDrop={handleDropModal}
                                        style={{
                                            border: dragActivoModal ? '2px dashed #16a34a' : '2px dashed #cbd5e1',
                                            borderRadius: '8px',
                                            padding: '24px 12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '10px',
                                            backgroundColor: dragActivoModal ? '#f0fdf4' : '#f8fafc',
                                            transition: 'all 0.15s ease-in-out'
                                        }}
                                    >
                                        {/* Cambia el icono y el texto si ya detectó un documento en memoria */}
                                        <span style={{ fontSize: '24px' }}>{formArchivoGuia ? '📄' : '📤'}</span>

                                        <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textAlign: 'center', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {formArchivoGuia
                                                ? `Listo: ${formArchivoGuia.name}`
                                                : 'Arrastra y suelta tu archivo guía aquí'}
                                        </span>

                                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                            {formArchivoGuia
                                                ? `Tamaño estimado: ${(formArchivoGuia.size / (1024 * 1024)).toFixed(2)} MB`
                                                : 'Formatos admitidos según selección'}
                                        </p>

                                        {/* 🔥 CONFIGURACIÓN DE BOTONES DUALES DE CONTROL TEMPORAL */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>

                                            {/* Botón Explorar alternativo */}
                                            <label style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}>
                                                {formArchivoGuia ? 'Cambiar Archivo' : 'Cargar Archivo'}
                                                <input
                                                    type="file"
                                                    onChange={handleBuscarArchivoModal}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>


                                            {/* 🔥 EL NUEVO BOTÓN QUITAR: Solo aparece si el profesor ya arrastró o seleccionó un archivo */}
                                            {formArchivoGuia && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoverArchivoGuiaTemporal} // 👈 Borra el archivo de la memoria temporal
                                                    style={{
                                                        padding: '6px 14px',
                                                        backgroundColor: '#ffffff',
                                                        color: '#dc2626',
                                                        border: '1px solid #fca5a5',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                                >
                                                    ✕ Quitar
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                                    <span style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Configuración de Entrega</span>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Fecha Límite</label>
                                            <input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a' }} />
                                        </div>
                                        <div style={{ width: '100px' }}>
                                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Hora</label>
                                            <input type="time" value={formHora} onChange={(e) => setFormHora(e.target.value)} defaultValue="18:00" style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a' }} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Puntuación Máxima</label>
                                    <input type="number" value={formPuntaje} onChange={(e) => setFormPuntaje(e.target.value)} defaultValue="20" min="0" max="20" style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }} />
                                </div>
                            </div>

                        </div>

                        {/* BOTONES INFERIOR DUALES DE ACCIÓN */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => setMostrarCrearModal(false)} style={{ height: '38px', padding: '0 20px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                            <button type="button" onClick={handleSavenuevaActividad} style={{ height: '38px', padding: '0 20px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(22,163,74,0.15)' }}>
                                💾 Confirmar
                            </button>
                        </div>

                    </div>
                </div>
            )}



        </div>
    );
};

export default ContenidoClase;

