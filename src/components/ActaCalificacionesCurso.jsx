import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActaCalificacionesCurso = ({ curso, profesorId, semestreId, onRegresar }) => {
    const [alumnos, setAlumnos] = useState([]);
    const [columnasNotas, setColumnasNotas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState({});
    const [cambiosLocales, setCambiosLocales] = useState({});
    const [nombreDocente, setNombreDocente] = useState('Cargando...');


    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '' });


    const [actaCerrada, setActaCerrada] = useState(false);

    const [datosActa, setDatosActa] = useState({ codigo: '', urlPdf: '' });



    const [modalPublicarAbierto, setModalPublicarAbierto] = useState(false); // 🔥 ¡Repara tu error de la línea 273!
    const [evaluacionAPublicar, setEvaluacionAPublicar] = useState('');
    const [publicandoEnRed, setPublicandoEnRed] = useState(false);

    const [modalAlertaFinalAbierto, setModalAlertaFinalAbierto] = useState(false);

    // 📌 Coloca esto justo al inicio del bloque de carga en tu JSX
    const spinnerStyles = (
        <style>{`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}</style>
    );

    // 📌 Agrega este estado arriba junto a tus otros useState
    const [modalFecha, setModalFecha] = useState({ abierto: false, titulo: '', fecha: '', tipo: '' });

    // Función para abrir el modal configurando los datos
    const abrirModalFecha = (tituloEval, fechaString, tipoPlazo) => {
        setModalFecha({
            abierto: true,
            titulo: tituloEval,
            fecha: fechaString,
            tipo: tipoPlazo
        });
    };

    // Formateador completo: "Martes, 21 de Julio de 2026 - 11:59 PM"
    const formatearFechaCompleta = (fechaString) => {
        if (!fechaString) return 'No programada';
        const fecha = new Date(fechaString);

        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let fechaTexto = fecha.toLocaleDateString('es-PE', opciones);
        fechaTexto = fechaTexto.replace(/^\w/, c => c.toUpperCase()); // Capitaliza el día

        let horas = fecha.getHours();
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const ampm = horas >= 12 ? 'PM' : 'AM';
        horas = horas % 12 || 12;

        return `${fechaTexto} a las ${horas}:${minutos} ${ampm}`;
    };





    const ultimaEvaluacionDelArray = columnasNotas.length > 0 ? columnasNotas[columnasNotas.length - 1] : null;

    // Evaluamos si el primer alumno ya tiene registrada esa última nota con bandera de publicación en 1
    const todasLasNotasPublicadas = ultimaEvaluacionDelArray && alumnos.length > 0
        ? alumnos[0].publicados?.[ultimaEvaluacionDelArray.id] === 1
        : false;


    // 🚀 FIRMA DIGITAL MASIVA PROGRESIVA CON BLOQUEO ESTRICTO POR CASILLEROS VACÍOS [30/06/2026]
    const manejarPublicacionOficial = async () => {
        if (!evaluacionAPublicar) {
            setNotificacion({ visible: true, mensaje: "⚠️ Seleccione una unidad didáctica a cerrar." });
            setTimeout(() => setNotificacion({ visible: false, mensaje: '' }), 2000);
            return;
        }

        // 🔍 1. EL ESCÁNER DE VACÍOS: Evaluamos si algún alumno matriculado no registra nota en esta evaluación [30/06/2026]
        let existenCasillerosVacios = false;

        alumnos.forEach(alumno => {
            const claveCelda = `${alumno.estudiante_id || alumno.id}-${evaluacionAPublicar}`;
            const cambioLocal = cambiosLocales[claveCelda];
            // Resguardamos la lectura si el valor viene de la base de datos o de la RAM [30/06/2026]
            const notaFinalCelda = cambioLocal !== undefined ? cambioLocal : alumno.notas?.[String(evaluacionAPublicar)];

            if (notaFinalCelda === undefined || notaFinalCelda === null || notaFinalCelda === '') {
                existenCasillerosVacios = true;
            }
        });

        // 🔒 2. CANDADO DE TOLERANCIA CERO: Si hay vacíos, abortamos de inmediato y avisamos con el Toast [30/06/2026]
        if (existenCasillerosVacios) {
            setNotificacion({
                visible: true,
                mensaje: "❌ Error: No se puede publicar. Existen alumnos con casilleros vacíos en esta evaluación."
            });

            // Cerramos el modal preventivamente para que el profesor complete la grilla
            setModalPublicarAbierto(false);
            setEvaluacionAPublicar('');

            // El aviso se desvanece solo a los 3 segundos
            setTimeout(() => {
                setNotificacion({ visible: false, mensaje: '' });
            }, 4000);

            return; // 🔥 Freno sónico: Bloquea el viaje por red a Express [30/06/2026]

        }

        // INTERCEPCIÓN DE SEGUNDO FACTOR DE SEGURIDAD [30/06/2026]
        setModalPublicarAbierto(false);     // 1. Apagamos el primer modal de selección
        setModalAlertaFinalAbierto(true);   // 2. Encendemos la ventana roja de advertencia irreversible

    };

    // 🚀 FIRMA DIGITAL DEFINITIVA (Disparador final que golpea a Express al presionar el botón rojo)
    const ejecutarFirmaDigitalFinal = async () => {
        try {
            setPublicandoEnRed(true);

            const response = await axios.post('http://localhost:5000/api/notas/publicar-acta', {
                curso_id: curso.curso_id || curso.id,
                semestre_id: semestreId,
                configuracion_nota_id: Number(evaluacionAPublicar)
            });

            setNotificacion({
                visible: true,
                mensaje: `📙 ¡Acta Firmada! Calificaciones cerradas con éxito.`
            });

            setModalAlertaFinalAbierto(false);
            setEvaluacionAPublicar('');
            setPublicandoEnRed(false);

            // Refrescamos la pantalla para pintar el aspecto gris mate con candado 🔒 [30/06/2026]
            setTimeout(() => {
                setNotificacion({ visible: false, mensaje: '' });
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error("🚨 Error crítico en la firma final:", error);
            alert(error.response?.data?.message || "Error de red al intentar firmar el acta.");
            setPublicandoEnRed(false);
        }
    };




    // 📡 CONSUMO DE RED UNIFICADO: Cargamos alumnos, casilleros dinámicos y notas registradas
    // 📡 CONSUMO DE RED 100% DINÁMICO DESDE TU NOTACONTROLLER.JS
    useEffect(() => {
        const cargarDatosActa = async () => {
            try {
                setCargando(true);
                const idCursoSeguro = curso?.curso_id || curso?.id;

                console.log(`-> [AXIOS] Abriendo acta dinámica para Curso: ${idCursoSeguro} | Semestre: ${semestreId}`);

                const response = await axios.get('http://localhost:5000/api/notas/alumnos-curso', {
                    params: { curso_id: idCursoSeguro, semestre_id: semestreId }
                });

                // 🚀 1. CAPTURA DE ALUMNOS (Limpia y única declaración)
                const listaAlumnos = response.data.alumnos || response.data.rows || response.data || [];
                setAlumnos(listaAlumnos);

                // 🔒 2. REGLA DIRECTA DE LA BASE DE DATOS: Seteamos el estado real en frío
                setActaCerrada(!!response.data.actaCerrada);

                // 👨‍🏫 CAPTURA DINÁMICA: Seteamos el nombre real recibido de la base de datos
                setNombreDocente(response.data.profesorNombre || 'Docente por Asignar');

                // 🚀 3. LECTURA Y CONVERSIÓN DE FECHAS DE EVALUACIONES
                const evaluacionesBD = response.data.configuracionNotas || response.data.evaluaciones || response.data.configuracion || [];
                const evaluacionesProcesadas = evaluacionesBD.map(col => ({
                    ...col,
                    fecha_inicio: col.fecha_inicio_ingreso ? new Date(col.fecha_inicio_ingreso) : null,
                    fecha_fin: col.fecha_fin_ingreso ? new Date(col.fecha_fin_ingreso) : null
                }));

                setColumnasNotas(evaluacionesProcesadas);
                setCargando(false);

            } catch (error) {
                console.error("🚨 Error al cargar el acta de notas dinámica:", error);
                setCargando(false);
            }
        };

        if (curso && semestreId) {
            cargarDatosActa();
        }
    }, [curso, semestreId]);





    // 📌 REEMPLAZO EXACTO EN LA PÁGINA 7 DEL PDF
    const handleCierreActaFinalGlobal = async () => {
        if (!ultimaEvaluacionDelArray) {
            alert("Error: No se registran unidades configuradas en la grilla.");
            return;
        }

        const confirmar = window.confirm("¿Está completamente seguro de CERRAR EL ACTA FINAL? Esta acción es irreversible, promediará de forma ponderada dinámicamente y congelará las calificaciones.");
        if (!confirmar) return;

        try {
            // Enlaza directo al endpoint maestro de tu backend
            const response = await axios.post('http://localhost:5000/api/notas/cerrar-acta-final', {
                curso_id: curso.curso_id || curso.id,
                semestre_id: semestreId,
                configuracion_nota_id: Number(ultimaEvaluacionDelArray.id),
                profesor_id: profesorId
            });

            if (response.status === 200) {
                // Seteamos los nuevos estados del candado institucional
                setActaCerrada(true);
                setDatosActa({
                    codigo: response.data.codigo_acta,
                    urlPdf: response.data.url_pdf
                });

                setNotificacion({
                    visible: true,
                    mensaje: `📋 ¡Éxito! ${response.data.message}`
                });

                setTimeout(() => {
                    setNotificacion({ visible: false, mensaje: '' });
                    window.location.reload();
                }, 2500);
            }
        } catch (error) {
            console.error("🚨 Error crítico al consolidar el acta final:", error);

            // Si el backend activa el candado 409 preventivo de duplicados que pusimos en MySQL
            if (error.response && error.response.status === 409) {
                setActaCerrada(true);
                setDatosActa({
                    codigo: error.response.data.codigo_acta,
                    urlPdf: error.response.data.url_pdf
                });
                alert(error.response.data.message);
            } else {
                alert(error.response?.data?.message || "Ocurrió un error de red al intentar cerrar el acta final.");
            }
        }
    };




    // 💾 GUARDADO AL VUELO: Registra o actualiza la nota en caliente al salir del input (onBlur)
    const handleGuardarNotaLocal = (estudianteId, configuracionNotaId, valorNota) => {
        const claveCelda = `${estudianteId}-${configuracionNotaId}`;
        if (valorNota === '') {
            setCambiosLocales(prev => ({
                ...prev,
                [claveCelda]: null
            }));
            return;
        }

        const notaNum = parseFloat(valorNota);

        // 🛡️ ADUANA DEL FRONTEND: Si no es un número o se escapa del rango 0-20, frenamos en seco [01/10]
        if (isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
            console.log(`⚠️ Nota rechazada en Frontend por exceder rango (0-20): ${valorNota}`);
            // Guardamos una marca de error interna para que el input se pinte de rojo
            setCambiosLocales(prev => ({
                ...prev,
                [claveCelda]: 'ERROR_RANGO'
            }));
            return;
        }

        setCambiosLocales(prev => ({
            ...prev,
            [claveCelda]: notaNum
        }));
    };

    // 🧠 CÓMPUTO COMPLETO DE PROMEDIO PROPORCIONAL AL VUELO
    const calcularPromedioPonderado = (alumnoData) => {
        if (!alumnoData) return '0.0';

        let sumaPonderada = 0;
        let porcentajeTotal = 0;

        columnasNotas.forEach(col => {
            const colIdString = String(col.id);

            const notaGuardada =
                alumnoData.notas?.[colIdString] !== undefined ? alumnoData.notas[colIdString] :
                    alumnoData.notas?.[col.id] !== undefined ? alumnoData.notas[col.id] :
                        alumnoData[colIdString] !== undefined ? alumnoData[colIdString] : null;

            if (notaGuardada !== undefined && notaGuardada !== null && notaGuardada !== '') {
                const notaNum = parseFloat(notaGuardada);
                // 🚀 LA CORRECCIÓN SUPREMA: Forzamos que el peso de la BD sea leído como número puro
                const pesoNum = parseFloat(col.peso_porcentaje || 25);

                if (!isNaN(notaNum) && !isNaN(pesoNum)) {
                    sumaPonderada += notaNum * (pesoNum / 100);
                    porcentajeTotal += pesoNum;
                }
            }
        });

        // Retornamos el promedio final formateado a un decimal de tu monitor [01/10]
        return porcentajeTotal > 0 ? sumaPonderada.toFixed(1) : '0.0';
    };

    const ejecutarGuardadoMasivo = async () => {
        const claves = Object.keys(cambiosLocales);
        if (claves.length === 0) {
            setNotificacion({
                visible: true,
                mensaje: "⚠️ No se registran modificaciones nuevas en las notas."
            });

            // Se desvanece de tu pantalla de forma automática a los 2 segundos exactos
            setTimeout(() => {
                setNotificacion({ visible: false, mensaje: '' });
            }, 4000);
            return;
        }

        const loteDeNotas = claves.map(clave => {
            const [estudianteId, configuracionNotaId] = clave.split('-');
            return {
                estudiante_id: Number(estudianteId),
                curso_id: Number(curso.curso_id || curso.id),
                configuracion_nota_id: Number(configuracionNotaId),
                nota: cambiosLocales[clave]
            };
        });

        try {
            console.log("-> [AXIOS] Despachando lote masivo de notas rumbo al Backend...");
            const response = await axios.post('http://localhost:5000/api/notas/registrar', {

                // 🚀 EL CANDADO DEL FRONTEND: Enviamos explícitamente el ID del semestre activo
                semestre_id: Number(semestreId),

                registros: loteDeNotas
            });


            setAlumnos(prevAlumnos => {
                return prevAlumnos.map(alumno => {
                    const idEstudianteSeguro = alumno.estudiante_id || alumno.id;
                    const nuevasNotas = { ...alumno.notas };

                    // Buscamos si este estudiante en específico arrastra modificaciones en el lote
                    columnasNotas.forEach(col => {
                        const claveCelda = `${idEstudianteSeguro}-${col.id}`;
                        if (cambiosLocales[claveCelda] !== undefined) {
                            // Mudamos la nota de la RAM temporal al subobjeto oficial del estudiante
                            nuevasNotas[String(col.id)] = cambiosLocales[claveCelda];
                        }
                    });

                    return {
                        ...alumno,
                        notas: nuevasNotas
                    };
                });
            });


            // 🚀 EL SECRETO RECONFIGURADO: Activamos el aviso temporal en tu monitor [30/06/2026]
            setNotificacion({
                visible: true,
                mensaje: "¡Modificaciones resguardadas con éxito en Aiven.io! ✔️"
            });
            setCambiosLocales({}); // 🧹 Limpiamos la RAM volátil una vez grabados los datos reales en MySQL

            // 🔥 EL TEMPORIZADOR SÓNICO: A los 2000 milisegundos (2 segundos) se desvanece por completo
            setTimeout(() => {
                setNotificacion({ visible: false, mensaje: '' });
            }, 4000);
        } catch (error) {
            console.error("🚨 Error crítico al guardar el lote masivo:", error);
            alert("Error de red al consolidar las calificaciones.");
        }
    };


    // 🛠️ REEMPLAZO COMPLETO PARA TU PANTALLA DE CARGA (LÍNEAS 134-142 APROX.)
    if (cargando) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                backgroundColor: '#ffffff'
            }}>
                {/* 🔑 Inyectamos los Keyframes de CSS en caliente */}
                {spinnerStyles}

                {/* 🌀 EL CÍRCULO CON ROTACIÓN FLUIDA EN TIEMPO REAL */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#1e3a8a', // Azul oscuro institucional
                    borderRadius: '50%',
                    // 🔥 AQUÍ SE ACTIVA EL MOVIMIENTO INFINITO
                    animation: 'spin 0.8s linear infinite'
                }} />

                {/* Texto informativo de tu monitor */}
                <span style={{
                    fontSize: '13.5px',
                    fontWeight: '750',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Sincronizando carga de cátedra...
                </span>
            </div>
        );
    }


    // 🛡️ EL AVISO PROFESIONAL SOLICITADO: Si la BD no arroja columnas, se bloquea y muestra este escudo [01/07/2026]
    if (!cargando && columnasNotas.length === 0) {
        return (
            <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', maxWidth: '500px' }}>
                    <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>⚙️</span>
                    <strong style={{ fontSize: '15px', color: '#1e293b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Estructura de Evaluación No Parametrizada
                    </strong>
                    <p style={{ margin: '8px 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: '1.5', fontWeight: '500' }}>
                        Estimado(a) docente, el sistema no registra las ponderaciones ni los títulos de las evaluaciones oficiales para este periodo académico en Aiven.io. Sírvase esperar la habilitación por parte del Administrador.
                    </p>
                    <button
                        type="button"
                        onClick={onRegresar}
                        style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '13px', fontWeight: '750', cursor: 'pointer' }}
                    >
                        ⬅ Volver al Menú Principal
                    </button>
                </div>
            </div>
        );
    }

    const existeErrorEnGrilla = Object.values(cambiosLocales).includes('ERROR_RANGO');

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '85vh', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>

            {/* 🚀 ENLACE MAESTRO SUPERIOR IZQUIERDO: Ubicación e ícono idénticos a tu monitor [30/06/2026] */}
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <span
                    onClick={onRegresar}
                    style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'color 0.2s'
                    }}
                    // Efecto hover sutil para la experiencia de usuario
                    onMouseEnter={(e) => e.target.style.color = '#0f172a'}
                    onMouseLeave={(e) => e.target.style.color = '#475569'}
                >
                    ← Volver a Cursos para Calificación
                </span>
            </div>

            {/* 📋 SECCIÓN 1: ENCABEZADO SUPERIOR MINIMALISTA CON ACCIONES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '24px', width: '100%' }}>
                <div style={{ textAlign: 'left', flex: '1' }}>
                    {/* Título de control de tu monitor */}
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        REGISTRO DE NOTAS | PROFESOR: {nombreDocente.toUpperCase()}
                    </span>
                    <h1 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                        REGISTRO DE CALIFICACIONES - CURSO: {curso.curso_nombre} ({curso.codigo || `SI-${curso.curso_id}`}) |  - 2026-I
                    </h1>
                </div>

                {/* 🎮 BLOQUE DE BOTONES OPERATIVOS DE TU IMAGEN */}
                {/* 📌 REEMPLAZO SUPREMO: Alineación vertical perfecta para el aviso */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', height: 'fit-content' }}>

                    {/* 🔒 AVISO DE CONTROL COMPACTO: Totalmente recto y con aire visual */}
                    {actaCerrada && (
                        <>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '750',
                                color: '#ef4444',
                                backgroundColor: '#fef2f2',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #fee2e2',
                                textTransform: 'uppercase',
                                display: 'inline-flex',
                                alignItems: 'center',
                                animation: 'fadeIn 0.2s ease-in-out'
                            }}>
                                ⚠️ ACTA CERRADA DEFINITIVAMENTE
                            </span>

                            {/* 🔥 BOTÓN AUXILIAR TEMPORAL SOLICITADO: Imprime el PDF oficial leyendo MySQL */}
                            <button
                                type="button"
                                onClick={() => {
                                    // Forzamos la apertura del stream PDF en una nueva pestaña del navegador limpio
                                    // Asume que para las pruebas, el Acta ID es 1. Puedes mapearlo dinámicamente si tienes el ID en el estado.
                                    window.open(`http://localhost:5000/api/notas/acta-pdf?acta_id=1`, '_blank');
                                }}
                                style={{
                                    backgroundColor: '#1d63ed',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0 20px',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    height: '38px',
                                    boxShadow: '0 2px 4px rgba(29, 99, 237, 0.15)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1d63ed'}
                            >
                                📄 Imprimir Acta Auxiliar
                            </button>
                        </>
                    )}

                    {/* 🔥 LA REGLA DE ORO ESTÉTICA: Absolutamente todos los botones operacionales 
        SOLO se renderizan si el acta está ABIERTA (actaCerrada === false) */}
                    {!actaCerrada && (
                        <>
                            {/* 🔵 BOTÓN AZUL: GUARDAR CAMBIOS */}
                            <button
                                type="button"
                                // 🛠️ CORRECCIÓN: Se bloquea si hay un error en la grilla O si ya se publicaron las 4 notas
                                disabled={existeErrorEnGrilla || todasLasNotasPublicadas}
                                onClick={ejecutarGuardadoMasivo}
                                style={{
                                    backgroundColor: (existeErrorEnGrilla || todasLasNotasPublicadas) ? '#cbd5e1' : '#1d63ed',
                                    color: (existeErrorEnGrilla || todasLasNotasPublicadas) ? '#94a3b8' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0 20px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    // Cursor cambia a "no permitido" si se bloquea
                                    cursor: (existeErrorEnGrilla || todasLasNotasPublicadas) ? 'not-allowed' : 'pointer',
                                    height: '38px',
                                    boxShadow: (existeErrorEnGrilla || todasLasNotasPublicadas) ? 'none' : '0 2px 4px rgba(29, 99, 237, 0.15)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Guardar Cambios
                            </button>

                            {/* 🟠 BOTÓN NARANJA: PUBLICAR NOTAS */}
                            <button
                                type="button"
                                // 🛠️ CORRECCIÓN: Se bloquea si hay un error en la grilla O si ya se publicaron las 4 notas
                                disabled={existeErrorEnGrilla || todasLasNotasPublicadas}
                                onClick={() => setModalPublicarAbierto(true)}
                                style={{
                                    backgroundColor: (existeErrorEnGrilla || todasLasNotasPublicadas) ? '#cbd5e1' : '#f97316',
                                    color: (existeErrorEnGrilla || todasLasNotasPublicadas) ? '#94a3b8' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0 20px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: (existeErrorEnGrilla || todasLasNotasPublicadas) ? 'not-allowed' : 'pointer',
                                    height: '38px',
                                    boxShadow: (existeErrorEnGrilla || todasLasNotasPublicadas) ? 'none' : '0 2px 4px rgba(249, 115, 22, 0.15)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Publicar Notas
                            </button>

                            {/* 🟢 BOTÓN VERDE: CERRAR ACTA FINAL (Solo si todas las notas están publicadas) */}
                            {todasLasNotasPublicadas && (
                                <button
                                    type="button"
                                    onClick={handleCierreActaFinalGlobal}
                                    style={{
                                        backgroundColor: '#10b981',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0 20px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        height: '38px',
                                        boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    📋 Cerrar Acta Final
                                </button>
                            )}
                        </>
                    )}
                </div>

            </div>

            {/* 🎚️ SECCIÓN 2: SÁBANA MATRICIAL EJECUTIVA DE TU MONITOR */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569', width: '50px', textAlign: 'center' }}>ID</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#475569' }}>APELLIDOS Y NOMBRES</th>

                            {/* Casilleros dinámicos del ciclo (Evaluación 1 a 4 de tu monitor) */}
                            {columnasNotas.map((col, idx) => {
                                // 🔍 ESCÁNER DE ENCABEZADO: Evaluamos si el acta de esta evaluación ya fue firmada en MySQL
                                // Miramos si al menos el primer alumno de la lista ya tiene esta nota con bandera = 1
                                const estaEvaluacionPublicada = alumnos.length > 0 && alumnos[0].publicados?.[col.id] === 1;



                                // 🚀 LÓGICA DE CÁLCULO DE DÍAS RESTANTES
                                const ahora = new Date();
                                const fechaCierre = col.fecha_fin_ingreso ? new Date(col.fecha_fin_ingreso) : null;

                                const evaluacionYaPublicada = alumnos.length > 0 && alumnos.some(alumno => {
                                    return alumno.publicados && Number(alumno.publicados[col.id]) === 1;
                                });

                                let diasRestantes = null;
                                let mostrarAlertaCierre = false;

                                if (fechaCierre && fechaCierre > ahora && !evaluacionYaPublicada) {
                                    const diferenciaTiempo = fechaCierre.getTime() - ahora.getTime();
                                    diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

                                    // Alerta activa solo si está en el rango de los 5 días críticos
                                    if (diasRestantes > 0 && diasRestantes <= 5) {
                                        mostrarAlertaCierre = true;
                                    }
                                }

                                return (
                                    <th
                                        key={col.id}
                                        style={{
                                            padding: '12px 8px',
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            color: '#475569',
                                            width: '140px', // 💡 Aumentado ligeramente para evitar saltos de línea forzados por el ancho
                                            textAlign: 'center',
                                            lineHeight: '1.4'
                                        }}
                                    >

                                        {col.nombre_nota}

                                        {/* 📊 Porcentaje en la misma línea */}
                                        <span style={{ display: 'inline-block', fontSize: '11px', color: '#475569', fontWeight: '600', marginLeft: '4px' }}>
                                            ({parseFloat(col.peso_porcentaje).toFixed(0)}%)
                                        </span>




                                        {/* 🗓️ ICONOS DE CALENDARIO COMPACTOS */}
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                                            {/* Calendario Azul (Apertura) */}
                                            <button
                                                type="button"
                                                onClick={() => abrirModalFecha(col.nombre_nota, col.fecha_inicio_ingreso, 'apertura')}
                                                title="Ver Fecha de Apertura"
                                                style={{
                                                    background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                                                    fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'transform 0.1s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <img width="18" height="18" src="https://img.icons8.com/ios/50/228BE6/calendar--v1.png" alt="calendar--v1" />
                                            </button>

                                            {/* Calendario Rojo (Cierre) */}
                                            <button
                                                type="button"
                                                onClick={() => abrirModalFecha(col.nombre_nota, col.fecha_fin_ingreso, 'cierre')}
                                                title="Ver Fecha de Cierre"
                                                style={{
                                                    background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                                                    fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'transform 0.1s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6klEQVR4nO3azQrCMBAE4H08b3bn/U9qfYa6HiJBLbV/pmrJxs7AHDR0k49WRFAkMVfVnQFHA8Kjh/he6vW557eJgzubtJtJIfPbPIdPvfY+vzxIo6oX4Dxye1/a3+jXlcT58awNUA0gKQhPELu3nry1hUECIeasQgh8VQiBcwjjLebgMTF+RjrJfSBC+sl9IEL6+fjCN7/mvl0zQkBIICQHxJxVNg+RmcdgjTUjBIQEQnJAzFll8xCZeQzWWDNCQEggJAfEnFUIga8KIfBV+WdInftQtrSqpwEk/h2iMEzdVNV+5CuIEQ+5AY414SYxLQy+AAAAAElFTkSuQmCC" alt="calendar--v1" width={'18px'}></img>

                                            </button>
                                        </div>



                                        {/* ⚠️ NUEVO: BANNER DINÁMICO DE ADVERTENCIA DE CIERRE */}
                                        {mostrarAlertaCierre && (
                                            <div style={{
                                                marginTop: '8px',
                                                backgroundColor: '#fef3c7', // Fondo amarillo suave idéntico a tu muestra
                                                border: '1px solid #fcd34d',   // Borde ámbar sutil
                                                borderRadius: '6px',
                                                padding: '4px 8px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '4px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {/* Icono de advertencia */}
                                                <span style={{ fontSize: '12px', color: '#b45309' }}>⚠️</span>
                                                {/* Texto informativo */}
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '750',
                                                    color: '#b45309', // Texto marrón/ámbar oscuro institucional
                                                    letterSpacing: '0.1px'
                                                }}>
                                                    Cierra en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}
                                                </span>
                                            </div>
                                        )}



                                        {/* 🔥 EL DETALLE INTERACTIVO: Si la nota está firmada, brota la etiqueta verde en tu monitor [30/06/2026] */}
                                        {estaEvaluacionPublicada && (
                                            <span style={{
                                                display: 'inline-block',
                                                fontSize: '9.5px',
                                                color: '#10b981', // Verde esmeralda brillante de éxito conforme
                                                fontWeight: '800',
                                                marginTop: '4px',
                                                backgroundColor: '#ecfdf5', // Sutil fondo verde menta tipo pastilla capsule
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                letterSpacing: '0.3px',
                                                textTransform: 'uppercase'
                                            }}>
                                                Publicado
                                            </span>
                                        )}
                                    </th>
                                );
                            })}

                            <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: '#1e293b', width: '130px', textAlign: 'center', backgroundColor: '#f1f5f9' }}>
                                CALIFICACIÓN FINAL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos.length === 0 ? (
                            <tr>
                                <td colSpan={columnasNotas.length + 3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                                    No se registran alumnos inscritos para este módulo de cátedra en Aiven.io.
                                </td>
                            </tr>
                        ) : (
                            alumnos.map((alumno, index) => {
                                // Calculamos el promedio ponderado extrayendo los datos reales [01/07/2026]
                                const promedio = calcularPromedioPonderado(alumno);
                                return (
                                    <tr
                                        key={alumno.id || alumno.estudiante_id || index}
                                        style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}
                                    >
                                        {/* 🔢 1. Correlativo ID numérico plano de tu monitor */}
                                        <td style={{ padding: '10px 16px', fontSize: '13px', color: '#0f172a', fontWeight: '600', textAlign: 'center' }}>
                                            {index + 1}
                                        </td>

                                        {/* 👤 2. Avatar de Usuario + Identificador institucional con Apellidos y Nombres */}
                                        <td style={{ padding: '10px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b', border: '1px solid #cbd5e1' }}>
                                                    👤
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                                                    {alumno.apellidos_nombres || `${alumno.apellidos || ''} ${alumno.nombres || ''}`} - {alumno.codigo_estudiante}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 🚀 3. INPUTS ESTILIZADOS CORREGIDOS: Unificación de onBlur y Extracción Flexible Real [01/07/2026] */}
                                        {columnasNotas.map((col, idx) => {

                                            const idEstudianteSeguro = alumno.estudiante_id || alumno.id;
                                            const claveCelda = `${idEstudianteSeguro}-${col.id}`;

                                            const cambioLocal = cambiosLocales[claveCelda];

                                            // 🔥 DETECTOR DE ALERTA: Evaluamos en caliente si el docente violó el rango 0-20 [01/10]
                                            const tieneErrorDeRango = cambioLocal === 'ERROR_RANGO';

                                            const notaEnBD = tieneErrorDeRango ? '' : (cambioLocal !== undefined ? cambioLocal : (alumno.notas?.[String(col.id)] !== undefined ? alumno.notas[String(col.id)] : ''));

                                            // 🔒 DETECTOR DEL CANDADO DE PUBLICACIÓN REAL: Leemos el mapa 'publicados' que Express envía de MySQL
                                            const notaYaPublicadaEnBD = alumno.publicados?.[col.id] === 1;

                                            // ⏱️ RELOJ EN CALIENTE DEL MONITOR: Capturamos la hora actual del sistema del docente
                                            const ahora = new Date();

                                            // 🧠 REGLA DE AMNISTÍA MATEMÁTICA EN TU PANTALLA:
                                            // Ubicamos cuál es la última evaluación del listado paramétrico de Workbench (ej: Evaluación 4)
                                            const ultimaEvaluacionDelCiclo = columnasNotas[columnasNotas.length - 1];

                                            // Evaluamos si el calendario ya cruzó la línea de inicio de la última nota
                                            const yaEstamosEnLaUltimaEvaluacion = ultimaEvaluacionDelCiclo && ultimaEvaluacionDelCiclo.fecha_inicio
                                                ? (ahora >= ultimaEvaluacionDelCiclo.fecha_inicio && ahora <= ultimaEvaluacionDelCiclo.fecha_fin)
                                                : false;

                                            // Evaluación cronológica estándar para la celda individual actual
                                            const fueraDeFechaCronologica = col.fecha_inicio && col.fecha_fin
                                                ? (ahora < col.fecha_inicio || ahora > col.fecha_fin)
                                                : false;


                                            // 🛡️ EL BYPASS LOGÍSTICO: Si ya es la época de la Evaluación 4, anulamos el bloqueo por tiempo pasado
                                            const fueraDeFechaEvaluacion = yaEstamosEnLaUltimaEvaluacion ? false : fueraDeFechaCronologica;

                                            // 🛡️ EL FILTRO SUPREMO DE BLOQUEO: Se congela si ya se publicó en la BD O si está fuera de fecha cronológica
                                            const casillaBloqueada = notaYaPublicadaEnBD || fueraDeFechaEvaluacion || actaCerrada;

                                            // 🧠 EXTRACCIÓN MAESTRA: Busca la nota haciendo match exacto con el configuracion_nota_id de tu imagen (13, 14, 15, 16)
                                            // const notaEnBD =
                                            //     alumno.notas?.[col.id] !== undefined ? alumno.notas[col.id] :
                                            //         alumno[`nota_${col.id}`] !== undefined ? alumno[`nota_${col.id}`] :
                                            //             alumno[`nota${col.id}`] !== undefined ? alumno[`nota${col.id}`] :
                                            //                 alumno.notas?.[`nota${col.id}`] !== undefined ? alumno.notas[`nota${col.id}`] : '';

                                            return (
                                                <td key={col.id} style={{ padding: '8px', textAlign: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="1"
                                                        // 🔥 CAMBIO CLAVE: Cambiamos a value para que React tome el control absoluto del vaciado [01/10]
                                                        value={notaEnBD === null ? '' : notaEnBD}
                                                        disabled={casillaBloqueada}
                                                        // 🎨 ASPECTO DINÁMICO: Muestra un marcador rojo de guía si el número es inválido [01/10]
                                                        placeholder={tieneErrorDeRango ? "0-20 ❌" : (casillaBloqueada ? "🔒" : "")}
                                                        style={{
                                                            width: '75px', height: '34px', textAlign: 'center', borderRadius: '6px',
                                                            border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '13.5px', outline: 'none',
                                                            // 🎨 INTERFAZ SÉNIOR: Si está deshabilitado en la base de datos se opaca en gris mate plano
                                                            backgroundColor: guardando[claveCelda] ? '#f1f5f9' : (fueraDeFechaEvaluacion ? '#f1f5f9' : '#ffffff'),
                                                            color: fueraDeFechaEvaluacion ? '#94a3b8' : '#0f172a',
                                                            cursor: fueraDeFechaEvaluacion ? 'not-allowed' : 'text',
                                                            transition: 'all 0.2s ease',

                                                            // 🔥 INTERFAZ INTELIGENTE CON ALERTA: Si viola el rango, el borde eclosiona en rojo carmín [01/10]
                                                            border: tieneErrorDeRango ? '2px solid #ef4444' : (casillaBloqueada ? '1px solid #e2e8f0' : '1px solid #cbd5e1'),

                                                            // 🎨 FONDO INTELIGENTE: Pinta un tenue fondo rojizo si hay error de digitación [01/10]
                                                            backgroundColor: tieneErrorDeRango ? '#fef2f2' : (casillaBloqueada ? '#f1f5f9' : '#ffffff'),

                                                            // 🎨 COLOR DE TIPOGRAFÍA: Texto rojo si hay error, gris si está publicado, negro si es borrador editable [01/10]
                                                            color: tieneErrorDeRango ? '#ef4444' : (casillaBloqueada ? '#64748b' : '#0f172a'),

                                                            fontWeight: '600',
                                                            fontSize: '13.5px',
                                                            cursor: tieneErrorDeRango ? 'text' : (casillaBloqueada ? 'not-allowed' : 'text')
                                                        }}
                                                        onFocus={(e) => {
                                                            if (!casillaBloqueada && !tieneErrorDeRango) {
                                                                e.target.style.borderColor = '#1d63ed';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(29, 99, 237, 0.15)';
                                                            }
                                                        }}
                                                        // 🔥 REPARACIÓN SUPREMA EN TIEMPO REAL: Cambiamos onBlur por onChange [01/8]
                                                        // Cada vez que el docente escriba o borre un número, se guarda en la RAM al milisegundo
                                                        // 🔥 REPARACIÓN SUPREMA EN TIEMPO REAL
                                                        onChange={(e) => {
                                                            if (!casillaBloqueada) {
                                                                handleGuardarNotaLocal(idEstudianteSeguro, col.id, e.target.value);
                                                            }
                                                        }}

                                                        // 🔥 REPARACIÓN CRÍTICA: Un solo onBlur limpio de sintaxis que gatilla el guardado automático rumbo a Express [01/07/2026]
                                                        onBlur={(e) => {
                                                            // Si la celda no arrastra error, restauramos el color gris neutro por defecto
                                                            if (!tieneErrorDeRango) {
                                                                e.target.style.borderColor = '#cbd5e1';
                                                                e.target.style.boxShadow = 'none';
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            );
                                        })}

                                        {/* 📊 4. COLUMNA MATE GRIS DE CALIFICACIÓN FINAL DE TU MONITOR */}
                                        <td style={{
                                            padding: '10px 16px',
                                            textAlign: 'center',
                                            backgroundColor: '#f1f5f9', // Bloque gris fijo lateral de tu captura
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            color: '#0f172a',
                                            borderLeft: '1px solid #e2e8f0'
                                        }}>
                                            {/* 🚀 LA SOLUCIÓN MAESTRA: Imprimimos la variable directa calculada arriba */}
                                            {promedio}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


            {modalPublicarAbierto && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '460px', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>

                        <div style={{ fontSize: '36px', marginBottom: '12px', textAlign: 'center' }}>📙</div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', textAlign: 'center', textTransform: 'uppercase' }}>
                            Publicación Oficial de Notas
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#475569', textAlign: 'center', lineHeight: '1.5', fontWeight: '500' }}>
                            Esta acción es **irreversible**. Al firmar el acta, las calificaciones se liberarán en la intranet del alumno y la columna elegida se bloqueará de forma permanente.
                        </p>

                        {/* 🎚️ DESPLEGABLE DINÁMICO DE EVALUACIONES VIGENTES */}
                        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                                Seleccione la Unidad Didáctica a Cerrar:
                            </label>
                            <select
                                value={evaluacionAPublicar} // 🔥 Usa tu estado real
                                onChange={(e) => setEvaluacionAPublicar(e.target.value)} // 🔥 Usa tu setter real
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    borderRadius: '6px',
                                    border: '1px solid #cbd5e1',
                                    padding: '0 10px',
                                    fontSize: '13px',
                                    color: '#334155',
                                    backgroundColor: '#ffffff',
                                    fontWeight: '650'
                                }}
                            >
                                <option value="">-- Seleccionar Evaluación Vigente --</option>

                                {/* 📌 FILTRADO DINÁMICO CORREGIDO: SE SINCRONIZA AL 100% CON LAS LLAVES DE TU GRILLA */}
                                {columnasNotas
                                    .filter(columna => {
                                        // 🚀 LA CLAVE ES EL ID PURO: Usamos 'columna.id' tal como lo hace tu grilla principal
                                        const idEvaluacion = columna.id;

                                        // CRUCE CON LA BASE DE DATOS: Evaluamos si el primer alumno ya tiene publicada esta evaluación
                                        const yaEstaPublicadaEnBD = alumnos.length > 0 && alumnos[0].publicados?.[idEvaluacion] === 1;

                                        // Retornamos TRUE únicamente para las que NO están publicadas (como la Evaluación 4)
                                        return !yaEstaPublicadaEnBD;
                                    })
                                    .map((columna, idx) => {
                                        const idEvaluacion = columna.id;

                                        // Mantiene el nombre real que viene parametrizado de la base de datos
                                        const nombreEvaluacion = columna.nombre_nota || `Evaluacion ${idx + 1}`;

                                        return (
                                            <option key={idEvaluacion} value={idEvaluacion}>
                                                {nombreEvaluacion}
                                            </option>
                                        );
                                    })
                                }





                            </select>
                        </div>

                        {/* 🎮 BOTONES DE ACCIÓN DEL MODAL */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                disabled={publicandoEnRed}
                                onClick={() => { setModalPublicarAbierto(false); setEvaluacionAPublicar(''); }}
                                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                disabled={publicandoEnRed || !evaluacionAPublicar}
                                onClick={manejarPublicacionOficial}
                                style={{
                                    backgroundColor: '#f97316', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '10px 22px', fontSize: '13px', fontWeight: '700',
                                    cursor: (!evaluacionAPublicar || publicandoEnRed) ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.15)',
                                    opacity: (!evaluacionAPublicar || publicandoEnRed) ? 0.6 : 1
                                }}
                            >
                                {publicandoEnRed ? "Firmando Acta..." : "Confirmar y Publicar"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 🚨 MODAL DE ADUANA FINAL: CONFIRMACIÓN IRREVERSIBLE DE TU MONITOR [30/06/2026] */}
            {modalAlertaFinalAbierto && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(6px)' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', boxSizing: 'border-box', borderTop: '6px solid #dc2626', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

                        <div style={{ fontSize: '38px', marginBottom: '10px', textAlign: 'center' }}>⚠️</div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: '800', color: '#991b1b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
                            ¿Confirmar Cierre Absoluto?
                        </h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#475569', textAlign: 'center', lineHeight: '1.6', fontWeight: '600' }}>
                            ¡Atención al presionar confirmar, se estampará la fecha de publicación, las notas se congelarán en modo **Solo Lectura** y no podrá modificarlas bajo ninguna circunstancia.
                        </p>

                        {/* 🎮 BOTONES DE ACCIÓN CRÍTICA */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                disabled={publicandoEnRed}
                                onClick={() => { setModalAlertaFinalAbierto(false); setEvaluacionAPublicar(''); }}
                                style={{ flex: 1, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', height: '40px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
                            >
                                Cancelar, Revisar
                            </button>
                            <button
                                type="button"
                                disabled={publicandoEnRed}
                                onClick={ejecutarFirmaDigitalFinal}
                                style={{ flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', height: '40px', fontSize: '13px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)', textTransform: 'uppercase' }}
                            >
                                {publicandoEnRed ? "FIRMANDO..." : "SÍ"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 🍃 AVISO TEMPORAL FLOTANTE PREMIUM ESTILO TOAST DE TU MONITOR [30/06/2026] */}
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                backgroundColor: '#10b981', // Verde esmeralda de éxito rotundo
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '700',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                // 🎨 Animación elástica de entrada y desvanecimiento
                transform: notificacion.visible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
                opacity: notificacion.visible ? 1 : 0,
                pointerEvents: notificacion.visible ? 'auto' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <span>{notificacion.mensaje}</span>
            </div>

            {/* 📌 MODAL ESTILIZADO DE DETALLE DE FECHA ACADÉMICA */}
            {modalFecha.abierto && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    animation: 'fadeIn 0.15s ease'
                }}>
                    <div style={{
                        backgroundColor: '#ffffff', borderRadius: '12px', width: '90%', maxWidth: '420px',
                        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        textAlign: 'center', border: '1px solid #e2e8f0'
                    }}>
                        {/* Icono de cabecera dinámico según el tipo */}
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            backgroundColor: modalFecha.tipo === 'apertura' ? '#eff6ff' : '#fef2f2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px auto', fontSize: '24px'
                        }}>
                            {modalFecha.tipo === 'apertura' ? '📅' : '⏳'}
                        </div>

                        {/* Títulos */}
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                            {modalFecha.titulo}
                        </h3>
                        <p style={{ margin: '0 0 20px 0', fontSize: '12px', fontWeight: '750', color: modalFecha.tipo === 'apertura' ? '#1d63ed' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Plazo oficial de {modalFecha.tipo === 'apertura' ? 'Apertura de Sistema' : 'Cierre de Sistema'}
                        </p>

                        {/* Contenedor de Fecha Completa */}
                        <div style={{
                            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                            padding: '14px', marginBottom: '24px', color: '#334155', fontSize: '14px',
                            fontWeight: '600', lineHeight: '1.5'
                        }}>
                            {formatearFechaCompleta(modalFecha.fecha)}
                        </div>

                        {/* Botón Entendido */}
                        <button
                            type="button"
                            onClick={() => setModalFecha({ ...modalFecha, abierto: false })}
                            style={{
                                width: '100%', height: '40px', backgroundColor: '#1f2937', color: '#ffffff',
                                border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
                                cursor: 'pointer', transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                        >
                            Entendido, Cerrar
                        </button>
                    </div>
                </div>
            )}





        </div>
    );
};

export default ActaCalificacionesCurso;
