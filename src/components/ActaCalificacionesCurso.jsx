import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActaCalificacionesCurso = ({ curso, profesorId, semestreId, onRegresar }) => {
    const [alumnos, setAlumnos] = useState([]);
    const [columnasNotas, setColumnasNotas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState({});
    const [cambiosLocales, setCambiosLocales] = useState({});

    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '' });


    const [modalPublicarAbierto, setModalPublicarAbierto] = useState(false); // 🔥 ¡Repara tu error de la línea 273!
    const [evaluacionAPublicar, setEvaluacionAPublicar] = useState('');
    const [publicandoEnRed, setPublicandoEnRed] = useState(false);

    const [modalAlertaFinalAbierto, setModalAlertaFinalAbierto] = useState(false);


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
                    params: {
                        curso_id: idCursoSeguro,
                        semestre_id: semestreId
                    }
                });

                // 🚀 CAPTURA FIEL DE ALUMNOS MATRICULADOS
                const listaAlumnos = response.data.alumnos || response.data.rows || response.data || [];
                setAlumnos(listaAlumnos);

                // 🚀 LECTURA ESTRICTA DE LA BASE DE DATOS: 
                // Capturamos únicamente lo que viene de forma real de MySQL [01/07/2026]
                const evaluacionesBD = response.data.configuracionNotas || response.data.evaluaciones || response.data.configuracion || [];
                setColumnasNotas(evaluacionesBD);

                // Mapeamos el arreglo transformando los strings de fecha del Backend en objetos Date válidos
                const evaluacionesProcesadas = evaluacionesBD.map(col => ({
                    ...col,
                    // Convertimos la celda de Workbench a Date. Si viene nulo, nacerá abierto por seguridad.
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


    if (cargando) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', border: '4px solid #cbd5e1', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Abriendo registro de evaluación...</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                    {/* Título de control de tu monitor */}
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        REGISTRO DE NOTAS | PROFESOR: Dr. Alejandro Rivas
                    </span>
                    <h1 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                        REGISTRO DE CALIFICACIONES - CURSO: {curso.curso_nombre} ({curso.codigo || `SI-${curso.curso_id}`}) |  - 2026-I
                    </h1>
                </div>

                {/* 🎮 BLOQUE DE BOTONES OPERATIVOS DE TU IMAGEN */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* 🔵 BOTÓN AZUL: GUARDAR CAMBIOS */}
                    <button
                        type="button"
                        // 🔥 El botón se congela físicamente si hay un error de rango (0-20) en la grilla
                        disabled={existeErrorEnGrilla}
                        onClick={ejecutarGuardadoMasivo}
                        style={{
                            backgroundColor: existeErrorEnGrilla ? '#cbd5e1' : '#1d63ed',
                            color: existeErrorEnGrilla ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            // Cambia el cursor a modo prohibitivo si la grilla está rota
                            cursor: existeErrorEnGrilla ? 'not-allowed' : 'pointer',
                            height: '38px',
                            boxShadow: existeErrorEnGrilla ? 'none' : '0 2px 4px rgba(29, 99, 237, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Guardar Cambios
                    </button>
                    {/* 🟠 BOTÓN NARANJA: PUBLICAR NOTAS */}
                    <button
                        type="button"
                        // 🔥 También se congela si hay un error de rango en tu monitor
                        disabled={existeErrorEnGrilla}
                        onClick={() => setModalPublicarAbierto(true)}
                        style={{
                            backgroundColor: existeErrorEnGrilla ? '#cbd5e1' : '#f97316',
                            color: existeErrorEnGrilla ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 20px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: existeErrorEnGrilla ? 'not-allowed' : 'pointer',
                            height: '38px',
                            boxShadow: existeErrorEnGrilla ? 'none' : '0 2px 4px rgba(249, 115, 22, 0.2)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Publicar Notas
                    </button>

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

                                return (
                                    <th
                                        key={col.id}
                                        style={{
                                            padding: '12px 8px',
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            color: '#475569',
                                            width: '120px',
                                            textAlign: 'center',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        {col.nombre_nota || `EVALUACIÓN ${idx + 1}`}

                                        {/* 📊 Porcentaje dinámico extraído de Workbench */}
                                        <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>
                                            ({parseFloat(col.peso_porcentaje || 25).toFixed(0)}%)
                                        </span>

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
                                                    A00{alumno.estudiante_id || index + 1} - {alumno.apellidos_nombres || `${alumno.apellidos || ''} ${alumno.nombres || ''}`}
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
                                            const casillaBloqueada = notaYaPublicadaEnBD || fueraDeFechaEvaluacion;

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
                                value={evaluacionAPublicar}
                                onChange={(e) => setEvaluacionAPublicar(e.target.value)}
                                style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13.5px', fontWeight: '600', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none' }}
                            >
                                <option value="">-- Seleccionar Evaluación Vigente --</option>
                                {columnasNotas.map(col => (
                                    <option key={col.id} value={col.id}>{col.nombre_nota}</option>
                                ))}
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
        </div>
    );
};

export default ActaCalificacionesCurso;
