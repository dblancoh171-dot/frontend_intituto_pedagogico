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

    const [actividadVistaRapida, setActividadVistaRapida] = useState(null);


    // 🌟 ESTADO PARA ALMACENAR LA DATA DEL CUADRO DE RESUMEN DERECHO
    const [actividadesProgramadas, setActividadesProgramadas] = useState([]);

    const [actividadEditando, setActividadEditando] = useState(null);

    const [archivoExistenteBD, setArchivoExistenteBD] = useState(null);


    // 🌟 ESTADOS EXCLUSIVOS PARA CONTROLAR EL MOVIMIENTO LIBRE DEL MODAL
    const [posicionModal, setPosicionModal] = useState({ x: 0, y: 0 }); // Guarda los pixeles de desplazamiento
    const [arrastrandoModal, setArrastrandoModal] = useState(false);   // Sabe si el click está hundido
    const [offsetMouse, setOffsetMouse] = useState({ x: 0, y: 0 });     // Evita que el modal salte al hacer click



    // 🌟 ESTADOS EXCLUSIVOS PARA CONTROLAR EL MOVIMIENTO LIBRE DEL MODAL DE CREAR
    const [posCrear, setPosCrear] = useState({ x: 0, y: 0 }); // Pixeles de desplazamiento de Crear
    const [dragCrear, setDragCrear] = useState(false);       // Sabe si el click está hundido en Crear
    const [offsetCrear, setOffsetCrear] = useState({ x: 0, y: 0 }); // Evita saltos del mouse en Crear



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



    // 🔥 MANEJADORES DE MOVIMIENTO LIBRE PARA EL MODAL (DRAGGABLE)
    const handleMouseDownModal = (e) => {
        // Solo se activa si hace click izquierdo convencional
        if (e.button !== 0) return;
        setArrastrandoModal(true);

        // Calculamos el desfase inicial entre el puntero del mouse y la esquina del modal
        setOffsetMouse({
            x: e.clientX - posicionModal.x,
            y: e.clientY - posicionModal.y
        });
    };

    const handleMouseMoveModal = (e) => {
        if (!arrastrandoModal) return; // Si el profesor no tiene el click hundido, no hace nada

        // Actualizamos las coordenadas en vivo mientras arrastra el ratón por el monitor
        setPosicionModal({
            x: e.clientX - offsetMouse.x,
            y: e.clientY - offsetMouse.y
        });
    };

    const handleMouseUpModal = () => {
        setArrastrandoModal(false); // Apagamos el interruptor en cuanto el profesor suelta el click
    };

    // Asegurar que si el modal se cierra, su posición regrese al centro de la pantalla
    const handleCerrarFichaTecnica = () => {
        setActividadVistaRapida(null);
        setPosicionModal({ x: 0, y: 0 }); // Resetea las coordenadas
        setArrastrandoModal(false);
    };



    // 🔥 MANEJADORES DE MOVIMIENTO LIBRE EXCLUSIVOS PARA EL MODAL DE CREAR (DRAGGABLE)
    const handleMouseDownCrear = (e) => {
        if (e.button !== 0) return; // Solo clic izquierdo convencional
        setDragCrear(true);
        setOffsetCrear({
            x: e.clientX - posCrear.x,
            y: e.clientY - posCrear.y
        });
    };

    const handleMouseMoveCrear = (e) => {
        if (!dragCrear) return;
        setPosCrear({
            x: e.clientX - offsetCrear.x,
            y: e.clientY - offsetCrear.y
        });
    };

    const handleMouseUpCrear = () => {
        setDragCrear(false);
    };

    // Asegurar el reseteo de posición al cerrar el formulario de creación
    const handleCerrarModalCrearConReset = () => {
        setMostrarCrearModal(false);
        setPosCrear({ x: 0, y: 0 }); // Regresa el formulario al centro exacto de la pantalla
        setDragCrear(false);
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
        if (e && typeof e.preventDefault === 'function') e.preventDefault();

        if (!formTitulo || formTitulo.trim() === '') {
            alert("Por favor, ingresa un título.");
            return;
        }
        if (!formFecha) {
            alert("Por favor, selecciona una fecha límite.");
            return;
        }

        const fechaLimiteCompleta = `${formFecha} ${formHora || '18:00'}:00`;
        const formData = new FormData();
        formData.append('titulo', formTitulo.trim());
        formData.append('descripcion', formDescripcion ? formDescripcion.trim() : '');
        formData.append('tipo_documento', formTipoDoc);
        formData.append('puntuacion_maxima', Number(formPuntaje || 20));
        formData.append('fecha_limite', fechaLimiteCompleta);

        if (formArchivoGuia) {
            formData.append('archivo', formArchivoGuia);
        }

        try {
            // 🔥 COMPORTAMIENTO INTERACTIVO DUAL CONTRA TU BACKEND
            if (actividadEditando) {
                // MODO EDICIÓN: Agregamos la llave primaria del registro
                formData.append('id', Number(actividadEditando.id));

                await axios.post('http://localhost:5000/api/notas/actualizar-actividad-cronograma', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("¡Evaluación actualizada con éxito en Aiven.io!");
            } else {
                // MODO CREACIÓN TRADICIONAL
                formData.append('sesion_id', Number(sesionId));
                await axios.post('http://localhost:5000/api/notas/crear-actividad', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("¡Trabajo programado y guardado con éxito!");
            }

            setMostrarCrearModal(false);
            setActividadEditando(null); // 🔥 Limpiamos el estado de edición al salir

            // Limpieza de casillas
            setFormTitulo(''); setFormDescripcion(''); setFormArchivoGuia(null); setFormFecha('');
            cargarActividadesResumen();
        } catch (error) {
            alert("Error al procesar: " + error.message);
        }
    };



    const handleEditarActividadClick = (act) => {
        setActividadEditando(act);
        setFormTitulo(act.titulo);
        setFormDescripcion(act.descripcion || '');
        setFormTipoDoc(act.tipo_documento);
        setFormPuntaje(act.puntuacion_maxima);

        // Mapeo inalterable de tiempos directos de MySQL
        if (act.fecha_plana && act.hora_plana) {
            setFormFecha(act.fecha_plana);
            setFormHora(act.hora_plana);
        } else {
            setFormFecha('');
            setFormHora('18:00');
        }

        // 📡 NUEVO: Guardamos la URL o el nombre del archivo que ya existe en la base de datos
        if (act.archivo_adjunto_url) {
            // Extraemos solo el nombre original limpio cortando la marca de tiempo de Multer
            const nombreLimpio = act.archivo_adjunto_url.split('/').pop();
            setArchivoExistenteBD({
                nombre: nombreLimpio,
                url: act.archivo_adjunto_url
            });
        } else {
            setArchivoExistenteBD(null); // Si no tenía archivo, nace vacío
        }

        setFormArchivoGuia(null); // Reseteamos la memoria de nuevos arrastres temporales
        setMostrarCrearModal(true);
    };



    // 🔥 FUNCIONALIDAD: Borrar actividad evaluativa de la base de datos
    const handleEliminarActividadReal = async (actividadId) => {
        const confirmar = window.confirm("¿Estás completamente seguro de eliminar esta evaluación del cronograma académico?");
        if (!confirmar) return;

        try {
            await axios.post('http://localhost:5000/api/notas/eliminar-actividad-cronograma', {
                id: actividadId
            });

            alert("Evaluación eliminada correctamente.");
            cargarActividadesResumen(); // 🔄 Recargamos el resumen de la derecha en caliente
        } catch (error) {
            alert("Error al eliminar la actividad: " + error.message);
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
        if (!sesionId) return;

        const inicializarDatosPantalla = async () => {
            try {
                await cargarMaterialesExistentes();
                await cargarActividadesResumen();
            } catch (error) {
                console.error("Error al inicializar los datos de la sesión:", error);
            }
        };

        inicializarDatosPantalla();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sesionId]); // 👈 Colocando esa línea de comentario arriba, la advertencia amarilla se esfuma para siempre

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


            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', marginBottom: '25px' }}>

                {/* 🔥 EL NUEVO TÍTULO OFICIAL SOLICITADO */}
                <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                    📚 MATERIALES DE LA SESIÓN
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '25px' }}>

                    {/* Zona Drag & Drop */}
                    <div
                        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                        style={{
                            backgroundColor: dragActivo ? '#f0fdf4' : (archivoParaSubir ? '#f8fafc' : '#ffffff'),
                            border: dragActivo ? '2px dashed #16a34a' : '2px dashed #cbd5e1',
                            borderRadius: '10px',
                            padding: '30px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            minHeight: '220px',
                            transition: 'all 0.15s ease-in-out'
                        }}
                    >
                        {/* ICONO DINÁMICO */}
                        <span style={{ fontSize: '32px' }}>{archivoParaSubir ? '📄' : '📁'}</span>

                        {/* TEXTO INFORMATIVO DEL NOMBRE */}
                        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: '600', color: '#334155', textAlign: 'center', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {archivoParaSubir
                                ? `Nuevo para subir: ${archivoParaSubir.name || (archivoParaSubir[0] ? archivoParaSubir[0].name : 'Archivo seleccionado')}`
                                : 'Arrastra y suelta tus archivos de clase aquí'}
                        </p>

                        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                            {archivoParaSubir ? 'Se registrará en el repositorio al presionar el botón verde de abajo' : 'Soporta formatos PPTX, PDF, DOCX o ZIP'}
                        </p>

                        {/* 🔥 LOS DOS BOTONES UNIFICADOS IGUALES A TU IMAGEN */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            {/* Botón Cambiar / Cargar */}
                            <label style={{ padding: '8px 16px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}>
                                {archivoParaSubir ? 'Cambiar Archivo' : 'Examinar mi PC'}
                                <input
                                    type="file"
                                    onChange={handleBuscarArchivo}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            {/* Botón Quitar Temporal (Solo aparece si cargó un archivo en memoria) */}
                            {archivoParaSubir && (
                                <button
                                    type="button"
                                    onClick={() => setArchivoParaSubir(null)} // 🧼 Limpia la memoria del archivo de arriba de inmediato
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ffffff',
                                        color: '#dc2626',
                                        border: '1px solid #fca5a5',
                                        borderRadius: '6px',
                                        fontSize: '12.5px',
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
                            // 🔒 CANDADO ACADÉMICO: Si ya registras 5 o más evaluaciones, el botón se apaga físicamente en el Frontend
                            disabled={actividadesProgramadas.length >= 5}
                            onClick={() => {
                                // Doble seguro de software ante manipulaciones de teclado o consola
                                if (actividadesProgramadas.length >= 5) {
                                    alert("⚠️ Control Institucional: Se ha alcanzado el límite estricto de máximo 5 actividades evaluativas para esta sesión de clase.");
                                    return;
                                }

                                // 🧼 PURGA DE ESTADOS: Vaciamos absolutamente toda la memoria antes de abrir
                                setActividadEditando(null);
                                setFormTitulo('');
                                setFormDescripcion('');
                                setFormTipoDoc('pdf');
                                setFormFecha('');
                                setFormHora('18:00');
                                setFormPuntaje(20);
                                setFormArchivoGuia(null);
                                setArchivoExistenteBD(null);

                                const cajaEditable = document.getElementById("editor-descripcion-editable");
                                if (cajaEditable) {
                                    cajaEditable.innerHTML = '';
                                }

                                // 🔓 APERTURA LIMPIA
                                setMostrarCrearModal(true);
                            }}
                            style={{
                                height: '40px',
                                marginLeft: '40px',
                                marginTop: '40px',
                                padding: '0 24px',
                                // 🎨 UX DINÁMICO: Si llega al límite muta a un gris mate institucional, de lo contrario mantiene su azul rey
                                backgroundColor: actividadesProgramadas.length >= 5 ? '#cbd5e1' : '#0284c7',
                                color: actividadesProgramadas.length >= 5 ? '#94a3b8' : '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                // 🛑 CURSOR ADAPTATIVO: Cambia al icono de prohibición si la acción está congelada
                                cursor: actividadesProgramadas.length >= 5 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            {/* 📝 TEXTO ADAPTATIVO: Le avisa en tiempo real al docente el estado del candado */}
                            {actividadesProgramadas.length >= 5 ? '🔒 Límite Alcanzado' : 'Crear'}
                        </button>
                    </div>

                    {/* A la derecha: Cuadro de Resumen en blanco temporal */}
                    <div style={{ flex: 1, maxWidth: '450px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minHeight: '100px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
                            📋 Evaluaciones Programadas ({actividadesProgramadas.length})
                        </h4>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            maxHeight: actividadesProgramadas.length >= 3 ? '195px' : 'none', // 🔥 Altura exacta calculada para albergar 2 tarjetas completas cómodamente
                            overflowY: actividadesProgramadas.length >= 3 ? 'scroll' : 'visible', // 🔥 Prende la barra de desplazamiento solo a partir de la 3era}}>
                            paddingRight: actividadesProgramadas.length >= 3 ? '6px' : '0' // Respiro visual derecho para que la barra no choque con los puntos
                        }}>
                            {actividadesProgramadas.length === 0 ? (
                                <p style={{ margin: '15px 0', fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>
                                    Sin trabajos programados para esta sesión.
                                </p>
                            ) : (
                                actividadesProgramadas.map(act => (
                                    <div
                                        key={act.id}
                                        onClick={() => setActividadVistaRapida(act)} // 👈 Al tocar la tarjeta, abre la ficha técnica
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 14px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            flexShrink: 0,
                                            cursor: 'pointer', // Indica que es interactivo
                                            transition: 'transform 0.15s, box-shadow 0.15s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '6px' }}>
                                                {act.tipo_documento}
                                            </span>
                                            <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{act.titulo}</strong>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>⏰ Límite: {act.fecha_formateada}</p>
                                        </div>
                                        {/* LADO DERECHO: Puntaje + Botones de Acción rápidos alineados horizontalmente */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>
                                                {act.puntuacion_maxima} pts
                                            </span>

                                            {/* Contenedor Dual de Iconos */}
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {/* ✏️ Botón Editar */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditarActividadClick(act);
                                                    }}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', padding: '4px', borderRadius: '4px', transition: 'background-color 0.15s' }}
                                                    title="Editar evaluación"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    ✏️
                                                </button>

                                                {/* 🗑️ Botón Eliminar */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEliminarActividadReal(act.id);
                                                    }}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', padding: '4px', borderRadius: '4px', transition: 'background-color 0.15s' }}
                                                    title="Eliminar evaluación"
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>



            {/* MODAL DE CONFIRMACIÓN */}
            {
                mostrarModal && (
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
                )
            }



            {/* 🔥 INTERFAZ FLOTANTE: CREAR NUEVA EVALUACIÓN / TAREA (PASO POR PASO) */}
            {
                mostrarCrearModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, animation: 'fadeIn 0.15s ease-in-out' }}>
                        <div
                            onMouseMove={handleMouseMoveCrear} // 👈 Captura el desplazamiento del ratón por el área
                            onMouseUp={handleMouseUpCrear}     // 👈 Captura si el docente soltó el clic
                            style={{
                                backgroundColor: '#ffffff',
                                width: '920px',
                                borderRadius: '12px',
                                padding: '28px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                position: 'relative',

                                // 🔥 LA MAGIA VISUAL: Desplaza el formulario alterando sus propios estados independientes
                                transform: `translate(${posCrear.x}px, ${posCrear.y}px)`,
                                transition: dragCrear ? 'none' : 'transform 0.1s ease-out' // Elimina el lag al arrastrar
                            }}
                        >

                            {/* ENCABEZADO Y BOTÓN X DE CIERRE */}
                            <div
                                onMouseDown={handleMouseDownCrear} // 👈 Al hundir el clic aquí, se engancha el arrastre
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #e2e8f0',
                                    paddingBottom: '14px',

                                    // 🔥 INDICADOR DE UX PREMIUM: Muestra la mano de agarre al pasar el cursor
                                    cursor: dragCrear ? 'grabbing' : 'grab',
                                    userSelect: 'none' // Evita el molesto sombreado azul del texto al arrastrar
                                }}
                            >
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                    {actividadEditando ? (
                                        // Modo Edición: Se activa si diste clic en el lápiz
                                        <>Editar <span style={{ color: '#0284c7' }}>Evaluación / Tarea Activa</span></>
                                    ) : (
                                        // Modo Creación: Se activa si diste clic en el botón azul "Crear"
                                        <>Crear <span style={{ color: '#0284c7' }}>Nueva Evaluación / Tarea</span></>
                                    )}
                                </h2>

                                {/* Actualiza el botón X para que use nuestra nueva función de borrado de coordenadas */}
                                <button
                                    type="button"
                                    onClick={handleCerrarModalCrearConReset}
                                    style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✕
                                </button>
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
                                            contentEditable={true}
                                            onInput={(e) => setFormDescripcion(e.currentTarget.innerHTML)}
                                            onKeyUp={verificarBotonesActivos}
                                            onClick={verificarBotonesActivos}

                                            // 🔥 LA CORRECCIÓN CLAVE: Inyecta el texto original (con negritas/colores) al presionar el lápiz
                                            dangerouslySetInnerHTML={{ __html: formDescripcion }}

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
                                        ></div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Tipo de Documento</label>
                                        <select
                                            value={formTipoDoc} // 👈 Vinculado al estado de edición
                                            onChange={(e) => setFormTipoDoc(e.target.value)}
                                            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', backgroundColor: '#ffffff' }}
                                        >
                                            <option value="pdf">Documento PDF (.pdf)</option>
                                            <option value="xlsx">Hoja de Cálculo de Excel (.xlsx)</option>
                                            <option value="docx">Documento de Word (.docx)</option>
                                            <option value="pptx">Presentación de PowerPoint (.pptx)</option>
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
                                                backgroundColor: dragActivoModal ? '#f0fdf4' : (formArchivoGuia || archivoExistenteBD ? '#f8fafc' : '#ffffff'),
                                                transition: 'all 0.15s ease-in-out'
                                            }}
                                        >
                                            {/* ICONO INTERACTIVO SEGÚN ESTADO */}
                                            <span style={{ fontSize: '24px' }}>
                                                {formArchivoGuia || archivoExistenteBD ? '📄' : '📤'}
                                            </span>

                                            {/* TEXTO DE RESPUESTA DINÁMICO */}
                                            <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600', textAlign: 'center', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {formArchivoGuia ? (
                                                    // Si es un archivo nuevo recién arrastrado, se muestra solo el texto temporal
                                                    <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '600' }}>
                                                        Nuevo para subir: {formArchivoGuia.name}
                                                    </span>
                                                ) : archivoExistenteBD ? (
                                                    // 🟢 SI ES EL ARCHIVO ORIGINAL DE LA BD: Lo volvemos un hipervínculo cliqueable de alta gama
                                                    <a
                                                        href={`http://localhost:5000${archivoExistenteBD.url}`} // 👈 Conexión directa a tu servidor local
                                                        target="_blank" // 👈 Abre de forma obligatoria en una pestaña nueva para no cerrar tu sistema
                                                        rel="noreferrer"
                                                        style={{
                                                            fontSize: '12.5px',
                                                            color: '#2563eb', // Color azul corporativo de enlace de descarga
                                                            fontWeight: '700',
                                                            textDecoration: 'underline', // Línea subrayada clásica para indicar que es cliqueable
                                                            cursor: 'pointer',
                                                            display: 'inline-block'
                                                        }}
                                                        title="Haga clic aquí para abrir y visualizar el documento original"
                                                    >
                                                        📄 {archivoExistenteBD.nombre}
                                                    </a>
                                                ) : (
                                                    // Si no hay nada
                                                    <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: '500' }}>
                                                        Arrastra y suelta tu archivo guía aquí
                                                    </span>
                                                )}
                                            </span>

                                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                                                {archivoExistenteBD && !formArchivoGuia
                                                    ? '🟢 Archivo alojado actualmente en el repositorio virtual'
                                                    : formArchivoGuia
                                                        ? 'Reemplazará al documento anterior al guardar'
                                                        : 'Formatos admitidos según selección'}
                                            </p>

                                            {/* CONTROLES DUALES "CAMBIAR" O "QUITAR" REACIVOS */}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>

                                                {/* Botón Cambiar / Cargar */}
                                                <label style={{ padding: '6px 14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                                    {formArchivoGuia || archivoExistenteBD ? 'Cambiar Archivo' : 'Cargar Archivo'}
                                                    <input
                                                        type="file"
                                                        onChange={handleBuscarArchivoModal}
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>

                                                {/* Botón Quitar (Funciona tanto para el nuevo temporal como para el de la BD) */}
                                                {(formArchivoGuia || archivoExistenteBD) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (formArchivoGuia) {
                                                                setFormArchivoGuia(null); // Quita el archivo que acabas de arrastrar
                                                            } else {
                                                                // Si quita el de la BD, vaciamos el estado y mandaremos la orden de limpiar la columna
                                                                setArchivoExistenteBD(null);
                                                            }
                                                        }}
                                                        style={{ padding: '6px 14px', backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
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
                                                <input
                                                    type="date"
                                                    value={formFecha} // 👈 Jala la fecha mapeada de MySQL (AAAA-MM-DD)
                                                    onChange={(e) => setFormFecha(e.target.value)}
                                                    style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                                />
                                            </div>
                                            <div style={{ width: '100px' }}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Hora</label>
                                                <input type="time" value={formHora} onChange={(e) => setFormHora(e.target.value)} style={{ width: '100%', height: '34px', padding: '0 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Puntuación Máxima</label>
                                        <input
                                            type="number"
                                            value={formPuntaje} // 👈 Jala el puntaje original (ej: 20)
                                            onChange={(e) => setFormPuntaje(e.target.value)}
                                            min="0"
                                            max="20"
                                            style={{ width: '100%', height: '36px', padding: '0 12px', fontSize: '13.5px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a', fontWeight: '600' }}
                                        />
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
                )
            }



            {/* 🔥 INTERFAZ FLOTANTE: VISTA RÁPIDA / FICHA TÉCNICA DE LA EVALUACIÓN */}
            {actividadVistaRapida && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, animation: 'fadeIn 0.15s ease-in-out' }}>
                    <div
                        onMouseMove={handleMouseMoveModal} // 👈 Escucha si el mouse se desplaza por el área
                        onMouseUp={handleMouseUpModal}     // 👈 Escucha si el docente soltó el click afuera
                        style={{
                            backgroundColor: '#ffffff',
                            width: '680px',
                            borderRadius: '14px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',

                            // 🔥 EL TRUCO VISUAL: Mueve el modal en vivo alterando los pixeles de los estados
                            transform: `translate(${posicionModal.x}px, ${posicionModal.y}px)`,
                            transition: arrastrandoModal ? 'none' : 'transform 0.1s ease-out' // Quita la transición al arrastrar para que no tenga lag
                        }}
                    >

                        {/* ENCABEZADO ESTILIZADO CON COLOR DE FONDO INSTITUCIONAL */}
                        <div
                            onMouseDown={handleMouseDownModal} // 👈 Al hundir el click aquí, se activa el gancho de arrastre
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#0f172a',
                                padding: '18px 24px',
                                color: '#ffffff',

                                // 🔥 INDICADOR DE UX: Le muestra al profesor el icono de la cruz de mover al pasar el mouse
                                cursor: arrastrandoModal ? 'grabbing' : 'grab',
                                userSelect: 'none' // Evita que se sombree el texto del título en azul mientras arrastras
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '20px' }}>🎯</span>
                                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Detalles de la Actividad Programada
                                </h2>
                            </div>

                            {/* Asegúrate de que tu botón X llame ahora a nuestra nueva función limpiadora de cierre */}
                            <button
                                type="button"
                                onClick={handleCerrarFichaTecnica}
                                style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* CUERPO CENTRAL DE LA FICHA */}
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* BLOQUE 1: TÍTULO Y TIPO DE DOCUMENTO */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Título Oficial</span>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                                        {actividadVistaRapida.titulo}
                                    </h3>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: actividadVistaRapida.tipo_documento === 'pdf' ? '#e0f2fe' : '#f0fdf4', color: actividadVistaRapida.tipo_documento === 'pdf' ? '#0369a1' : '#16a34a', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                    📁 Archivo {actividadVistaRapida.tipo_documento}
                                </span>
                            </div>

                            {/* BLOQUE 2: PANEL DE CONTROL DE PLAZOS Y NOTA (DISEÑO HORIZONTAL CREATIVO) */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '14px' }}>
                                {/* Tarjeta Cronológica */}
                                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>⏰</span>
                                    <div>
                                        <span style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Plazo de Recepción</span>
                                        <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>{actividadVistaRapida.fecha_formateada}</strong>
                                    </div>
                                </div>
                                {/* Tarjeta Calificación */}
                                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>Escala Máxima</span>
                                    <strong style={{ fontSize: '18px', color: '#15803d', fontWeight: '800' }}>{actividadVistaRapida.puntuacion_maxima} Pts</strong>
                                </div>
                            </div>

                            {/* BLOQUE 3: INSTRUCCIONES / DESCRIPCIÓN CON RENDERIZADO HTML EN VIVO */}
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Instrucciones para el Alumnado</span>
                                <div
                                    style={{ width: '100%', minHeight: '90px', maxHeight: '180px', overflowY: 'auto', padding: '14px', backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13.5px', color: '#334155', lineHeight: '1.6' }}
                                    // 🔥 INTERPRETA LAS NEGRIZAS Y COLORES GUARDADOS DE LA BD DE FORMA LEGÍTIMA
                                    dangerouslySetInnerHTML={{ __html: actividadVistaRapida.descripcion || '<p style="color:#94a3b8; font-style:italic;">No se ingresaron instrucciones detalladas para este trabajo.</p>' }}
                                />
                            </div>

                            {/* BLOQUE 4: ADJUNTO REPOSITORIO (SI EXISTE) */}
                            {actividadVistaRapida.archivo_adjunto_url && (
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>📄</span>
                                        <div>
                                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Documento de Insumo Adjunto</span>
                                            <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#334155', maxWidth: '350px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {actividadVistaRapida.archivo_adjunto_url.split('/').pop()}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={`http://localhost:5000${actividadVistaRapida.archivo_adjunto_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ height: '34px', padding: '0 16px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(2,132,199,0.15)' }}
                                    >
                                        📥 Abrir Documento
                                    </a>
                                </div>
                            )}

                        </div>

                        {/* PIE DE PÁGINA CON BOTÓN DE ENTIENDO */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                type="button"
                                onClick={() => setActividadVistaRapida(null)}
                                style={{ height: '36px', padding: '0 20px', backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.15s' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                            >
                                Entendido
                            </button>
                        </div>

                    </div>
                </div>
            )}




        </div >
    );
};

export default ContenidoClase;

