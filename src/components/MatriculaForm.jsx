import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatriculaForm = ({ onNombreCargado, estudianteIdFijo }) => {
    // ID de prueba fijo (Simula a Ana María con ID 1)
    const [estudianteId] = useState(estudianteIdFijo);
    const [semestreId] = useState(1);
    const [cicloAMatricular, setCicloAMatricular] = useState(1);

    // Estados para los datos del backend
    const [alumnoYaMatriculado, setAlumnoYaMatriculado] = useState(false);
    const [estudianteInfo, setEstudianteInfo] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [ciclosPermitidos, setCiclosPermitidos] = useState([]);
    const [esAutomatica, setEsAutomatica] = useState(false); // 🔥 NUEVO: Detecta si es automática
    const [fueraDeFecha, setFueraDeFecha] = useState(false);
    const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);
    const [selectedCursos, setSelectedCursos] = useState({});
    const [totalCargosPendientes, setTotalCargosPendientes] = useState(0);


    const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);

    // 1. Cargar perfil del estudiante y calcular las reglas de su matrícula
    useEffect(() => {
        const cargarPerfilYValidarCiclos = async () => {
            try {
                const perfilRes = await axios.get(`http://localhost:5000/api/estudiantes/perfil/${estudianteId}`);

                // 🔥 TRUCO DE INGENIERÍA: Si el backend manda un arreglo, extraemos la primera fila directo
                const estudiante = Array.isArray(perfilRes.data) ? perfilRes.data[0] : perfilRes.data;
                setEstudianteInfo(estudiante);

                if (onNombreCargado && estudiante) {
                    onNombreCargado(`${estudiante.nombres} ${estudiante.apellidos}`);
                }

                // Consolidamos la llamada adaptada a tus nuevas columnas del backend
                const notasRes = await axios.get(`http://localhost:5000/api/cursos/disponibles`, {
                    params: {
                        estudiante_id: estudianteId,
                        // Si ciclo_actual viene nulo o indefinido del perfil, forzamos ciclo 1 de respaldo
                        ciclo_a_matricular: estudiante.ciclo_actual || estudiante.ciclo_cursado || 1,
                        carrera_id: estudiante.carrera_id || 1
                    }
                });

                const listaCursos = notasRes.data.cursos || [];
                const cantidadJalados = listaCursos.filter(c => c.tipo === 'cargo').length;
                let opcionesDeCiclo = [];

                // Evaluamos usando el nombre de columna correcto
                const cicloOrigen = Number(estudiante.ciclo_actual || estudiante.ciclo_cursado || 1);

                if (cicloOrigen === 1) {
                    opcionesDeCiclo = [1];
                    setEsAutomatica(false);
                } else if (cantidadJalados >= 3) {
                    opcionesDeCiclo = [cicloOrigen];
                    setEsAutomatica(false);
                } else {
                    const cicloSiguiente = cicloOrigen + 1;
                    if (cicloSiguiente <= 10) opcionesDeCiclo.push(cicloSiguiente);
                    setEsAutomatica(false);
                }

                setCiclosPermitidos(opcionesDeCiclo); // 👈 Corregido el nombre legítimo

                if (opcionesDeCiclo.length > 0) {
                    setCicloAMatricular(opcionesDeCiclo[0]); // 👈 Extrae el número directo (Ej: 1)
                }

                const fechaActual = new Date();
                const fechaLimiteMatricula = new Date("2026-07-30T23:59:59");
                if (fechaActual > fechaLimiteMatricula) {
                    setFueraDeFecha(true);
                } else {
                    setFueraDeFecha(false);
                }
            } catch (error) {
                console.error("🚨 Error al calcular la matrícula del alumno:", error);
            }
        };
        cargarPerfilYValidarCiclos();
    }, [estudianteId]);


    // 2. Cargar cursos (Trae los normales del ciclo + los cargos si existen)
    useEffect(() => {
        if (!estudianteInfo || !estudianteInfo.carrera_id) return;
        const cargarCursos = async () => {
            try {
                console.log("-> [AXIOS] Solicitando asignaturas elegibles con parámetros limpios...");

                const response = await axios.get(`http://localhost:5000/api/cursos/disponibles`, {
                    // 🔥 LA CORRECCIÓN CLAVE: Cambiamos los espacios por guiones bajos estrictos 
                    // para que hagan match perfecto con lo que tu cursoController espera leer en el backend
                    params: {
                        estudiante_id: estudianteId, // 👈 Con guión bajo
                        ciclo_a_matricular: cicloAMatricular, // 👈 Con guión bajo
                        carrera_id: estudianteInfo.carrera_id // || 1👈 Con guión bajo
                    }
                });

                const dataCursos = response.data.cursos || [];
                setCursos(dataCursos);
                setAlumnoYaMatriculado(response.data.yaMatriculado || false);
                setTotalCargosPendientes(response.data.totalCargosPendientes || 0);

                const seleccionInicial = {};
                dataCursos.forEach(c => {
                    if (c.obligatorio) seleccionInicial[c.id] = true;
                });
                setSelectedCursos(seleccionInicial);

            } catch (error) {
                console.error("Error al traer los cursos:", error);
            }
        };
        cargarCursos();
    }, [cicloAMatricular, estudianteId, estudianteInfo]);

    // 3. Procesar el formulario de matrícula
    const gestionarMatricula = async (e) => {
        e.preventDefault();
        setMensajeFeedback({ texto: '', tipo: '' });

        // Abrir ventana de confirmación
        setMostrarModalConfirmar(true);
    };


    //Paso B: Se ejecuta únicamente si el usuario presiona "Sí, Continuar" en la ventana flotante
    const confirmarYEnviarMatricula = async () => {
        setMostrarModalConfirmar(false); // Cerramos la ventana de pregunta
        setCargando(true);

        // 🔥 1. CAPTURAR LOS IDS DE LOS CURSOS SELECCIONADOS
        const cursosParaEnviar = cursos
            .filter(curso => selectedCursos[curso.id] === true)
            .map(curso => curso.id);

        try {
            const response = await axios.post('http://localhost:5000/api/matriculas/matricular', {
                estudiante_id: estudianteId,
                semestre_id: semestreId,
                ciclo_a_matricular: Number(cicloAMatricular),
                cursos_seleccionados: cursosParaEnviar // 🔥 2. INYECTAR EL ARREGLO AL BACKEND
            });

            setMensajeFeedback({
                texto: `¡Éxito! ${response.data.message}. Condición: ${response.data.condicion.toUpperCase()}`,
                tipo: 'exito'
            });

            // 🔥 ACTIVA EL SEGUNDO MENSAJE FLOTANTE DE ÉXITO
            setMostrarModalExito(true);

            // Refrescar perfil tras matricular con éxito
            const repoPerfil = await axios.get(`http://localhost:5000/api/estudiantes/perfil/${estudianteId}`);
            setEstudianteInfo(repoPerfil.data);

        } catch (error) {
            const msg = error.response?.data?.message || "Error inesperado al matricular.";
            setMensajeFeedback({ texto: msg, tipo: 'error' });
        } finally {
            setCargando(false);
        }
    };



    // --- FUNCIÓN PARA MANEJAR EL CLICK EN LAS CASILLAS (CHECKBOX) ---
    const handleCheckboxChange = (cursoId, esObligatorio) => {
        if (esObligatorio) return; // Si es obligatorio (regular) no permite desmarcar
        setSelectedCursos(prev => ({
            ...prev,
            [cursoId]: !prev[cursoId]
        }));
    };

    // --- CÁLCULO DE CRÉDITOS Y VALIDADOR DE REGLAS DE CARGO ---
    const cursosSeleccionadosLista = (cursos || []).filter(c => selectedCursos[c.id]);

    const ocultarTotales = fueraDeFecha && !alumnoYaMatriculado;

    const totalCursosMostrados = ocultarTotales ? 0 : cursosSeleccionadosLista.length;
    const totalCreditosMostrados = ocultarTotales ? 0 : cursosSeleccionadosLista.reduce((sum, c) => sum + c.creditos, 0);

    const cargosSeleccionadosCount = cursosSeleccionadosLista.filter(c => c.tipo === 'cargo').length;

    // Regla de Oro: Si tiene 3 deudas o más, está obligado a seleccionar al menos 1 cargo
    const violandoReglaDeDeuda = totalCargosPendientes >= 3 && cargosSeleccionadosCount === 0;

    const matriculadoDentroDelPlazo = alumnoYaMatriculado && !fueraDeFecha;

    return (
        <div className="container">
            {/* Encabezado General */}
            <div className="header">
                <h1>Proceso de Matrícula Académica</h1>
                <p>Instituto Pedagógico Superior</p>
            </div>


            {!fueraDeFecha ? (
                <>

                    {/* PANEL SUPERIOR: Ficha de Datos del Estudiante */}
                    <div style={{ marginBottom: '32px' }}>
                        {/* Título Oficial de la Sección */}
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1e293b',
                            letterSpacing: '-0.3px',
                            borderBottom: '2px solid #f1f5f9',
                            paddingBottom: '8px'
                        }}>
                            Datos del Estudiante
                        </h3>

                        {/* Contenedor Flexbox para distribución Horizontal */}
                        <div style={{
                            display: 'flex',
                            gap: '20px',
                            width: '100%',
                            alignItems: 'center'
                        }}>
                            {/* Campo 1: ID / Código */}
                            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>
                                    ID Estudiante / Código
                                </label>
                                <input
                                    type="text"
                                    className="input-deshabilitado"
                                    style={{
                                        height: '38px',
                                        padding: '0 12px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '13.5px',
                                        color: '#64748b',
                                        cursor: 'not-allowed'
                                    }}
                                    value={estudianteInfo ? (estudianteInfo.codigo_estudiante || `EST-00${estudianteInfo.estudiante_id}`) : 'Cargando...'}
                                    readOnly
                                />
                            </div>

                            {/* Campo 2: Nombre Completo */}
                            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    className="input-deshabilitado"
                                    style={{
                                        height: '38px',
                                        padding: '0 12px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '13.5px',
                                        color: '#64748b',
                                        cursor: 'not-allowed'
                                    }}
                                    value={estudianteInfo ? `${estudianteInfo.nombres} ${estudianteInfo.apellidos}` : 'Cargando...'}
                                    readOnly
                                />
                            </div>

                            {/* Campo 3: Estatus / Especialidad */}
                            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12.5px', fontWeight: '600', color: '#475569' }}>
                                    Estatus Académico / Especialidad
                                </label>
                                <input
                                    type="text"
                                    className="input-deshabilitado"
                                    style={{
                                        height: '38px',
                                        padding: '0 12px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '13.5px',
                                        color: '#64748b',
                                        cursor: 'not-allowed'
                                    }}
                                    value={estudianteInfo ? `CICLO ${estudianteInfo.ciclo_actual || 1} - ${estudianteInfo.carrera || 'Educación Inicial'}` : 'Cargando...'}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>


                    {/* PEGA ESTO ABAJO DEL PANEL DE DATOS DEL ESTUDIANTE */}
                    {fueraDeFecha && (
                        <div className="alerta-tiempo-vencido">
                            <span>⏰</span>
                            <div>
                                <strong>PROCESO DE MATRÍCULA CONCLUIDO:</strong> El plazo regular establecido por la dirección académica para el periodo 2026-I finalizó el <strong>24/06/2026 a las 23:59</strong>. El sistema se encuentra en modo lectura. Comuníquese con la oficina de Registro Central.
                            </div>
                        </div>
                    )}



                    {/* Mensajes de Alerta del Servidor */}
                    {mensajeFeedback.texto && (
                        <div className={`alerta ${mensajeFeedback.tipo === 'exito' ? 'alerta-exito' : 'alerta-error'}`}>
                            {mensajeFeedback.texto}
                        </div>
                    )}



                    {/* Formulario de Tres Columnas */}


                    <form onSubmit={gestionarMatricula}>

                        {matriculadoDentroDelPlazo ? (
                            /* 🏷️ EL AVISO DE TAMAÑO RELATIVO: Se muestra si ya está matriculado y aún hay tiempo */
                            <div style={{
                                width: 'auto',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '16px 20px',
                                marginBottom: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
                            }}>
                                <span style={{ fontSize: '18px', backgroundColor: '#dcfce7', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontWeight: 'bold' }}>✔</span>

                                <div style={{ textAlign: 'left' }}>
                                    <strong style={{ fontSize: '14px', color: '#16a34a', display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                        Proceso de Inscripción Concluido con Éxito
                                    </strong>
                                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#166534', fontWeight: '500', lineHeight: '1.4' }}>
                                        Estimado estudiante, el sistema registra que tu ficha de matrícula para el periodo académico **2026-I** ha sido procesada correctamente en la base de datos institucional. La carga de asignaturas se encuentra guardada y resguardada.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* 📋 Si NO se ha matriculado (o si el plazo ya venció), se renderiza tu panel de control original */
                            <div className="panel-control" style={{ marginBottom: '25px', width: 'auto' }}>
                                <h2 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', marginTop: 0 }}>
                                    SELECCIÓN DE SEMESTRE Y CICLO
                                </h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    <div className="grupo-campo">
                                        <label>Semestre Académico:</label>
                                        <select className="input-deshabilitado" disabled>
                                            <option>2026-I (Semestre Impar)</option>
                                        </select>
                                    </div>

                                    <div className="grupo-campo">
                                        <label>Ciclo a Matricular:</label>
                                        <select
                                            value={cicloAMatricular}
                                            onChange={(e) => setCicloAMatricular(Number(e.target.value))}
                                            disabled={fueraDeFecha}
                                            className={fueraDeFecha ? "select-bloqueado" : ""}
                                        >
                                            {ciclosPermitidos.map((ciclo) => (
                                                <option key={ciclo} value={ciclo}>
                                                    Ciclo {ciclo} {estudianteInfo && estudianteInfo.ciclo_actual === 1 ? '(Ingresante)' : ciclo === estudianteInfo.ciclo_actual ? '(Repetir Ciclo)' : '(Siguiente Nivel)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* APERTURA DEL CONTENEDOR EN GRID PARA LA TABLA ABAJO (Mantenlo tal cual) */}
                        <div style={{ display: 'grid', gridTemplateColumns: esAutomatica ? '1fr' : '2.5fr 1fr', gap: '20px', alignItems: 'start', marginTop: '20px' }}>


                            {/* COLUMNA 2: Tabla Central de Cursos Disponibles */}

                            <div className={fueraDeFecha ? "panel-tabla tabla-bloqueada-fechas" : "panel-tabla"}
                                style={{
                                    // 🎨 UX DE ATENUACIÓN: Opaca la grilla a un 60% mate, denotando un estado de "Modo Lectura Seguro" [01/07/2026]
                                    opacity: matriculadoDentroDelPlazo ? 0.60 : 1,

                                    // 🔒 CANDADO DE SEGURIDAD INTERACTIVA: Bloquea físicamente los checkboxes y el hover de las filas para proteger los datos de Aiven.io [01/07/2026]
                                    pointerEvents: matriculadoDentroDelPlazo ? 'none' : 'auto',

                                    // Transición suavizada para un acabado estético de primer nivel
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {/* Título alineado elegantemente en texto plano */}
                                <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000000', borderBottom: '2px solid #333333', paddingBottom: '6px', height: '23px' }}>
                                    CURSOS DISPONIBLES (Ciclo {cicloAMatricular})
                                </h2>
                                <table className="tabla-cursos" style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#eef2f6' }}>
                                            <th style={{ padding: '12px', width: '40px' }}>Sel.</th>
                                            <th>Código</th>
                                            <th>Nombre del Curso</th>
                                            <th>Ciclo</th>
                                            <th>Créditos</th>
                                            <th>Horario</th>
                                            <th>Docente</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cursos.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                                                    No hay asignaturas cargadas para este ciclo.
                                                </td>
                                            </tr>
                                        ) : (
                                            cursos.map((curso) => {
                                                const checked = !!selectedCursos[curso.id];
                                                return (
                                                    <tr
                                                        key={curso.id}
                                                        className={curso.tipo === 'cargo' ? 'fila-cargo' : 'fila-normal'}
                                                        style={{ backgroundColor: checked && curso.tipo === 'regular' ? '#eff6ff' : undefined }}
                                                    >
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                disabled={curso.obligatorio}
                                                                onChange={() => handleCheckboxChange(curso.id, curso.obligatorio)}
                                                                style={{ cursor: curso.obligatorio ? 'not-allowed' : 'pointer' }}
                                                            />
                                                        </td>
                                                        <td style={{ fontSize: '12px', color: '#6b7280' }}>{curso.codigo}</td>
                                                        <td style={{ fontWeight: '500' }}>{curso.nombre}</td>
                                                        <td style={{ fontWeight: 'bold', fontSize: '13px' }}>C-{curso.ciclo}</td>
                                                        <td>{curso.creditos}</td>
                                                        <td style={{ fontSize: '11px', color: '#4b5563', maxWidth: '220px', lineHeight: '1.3' }}>{curso.horario}</td>
                                                        <td style={{ fontSize: '13px', color: '#4b5563' }}>{curso.docente}</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>



                            {/* COLUMNA 3: Resumen de Matrícula Plano a la Derecha */}
                            {!esAutomatica && (
                                <div style={{
                                    backgroundColor: fueraDeFecha ? '#f8fafc' : '#ffffff', // Fondo gris suave si está bloqueado
                                    borderColor: fueraDeFecha ? '#cbd5e1' : '#e5e7eb',     // Borde un poco más oscuro o neutro
                                    opacity: fueraDeFecha ? 0.75 : 1,                      // Opacidad para indicar modo lectura
                                    cursor: fueraDeFecha ? 'not-allowed' : 'default'
                                }}>
                                    {/* Cuadro del Resumen Minimalista */}
                                    <div className="panel-resumen-derecho">
                                        <h2 style={{
                                            fontSize: '15px',
                                            fontWeight: 'bold',
                                            margin: '0 0 10px 0',
                                            color: fueraDeFecha ? '#64748b' : '#000000', // Texto del título gris si venció
                                            borderBottom: fueraDeFecha ? '2px solid #94a3b8' : '2px solid #333333',
                                            paddingBottom: '6px'
                                        }}>
                                            RESUMEN DE MATRÍCULA
                                        </h2>
                                        <div style={{ fontSize: '14px', lineHeight: '2', color: fueraDeFecha ? '#64748b' : '#334155' }}>
                                            <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>Cursos Seleccionados:</strong>
                                                <span style={{ fontWeight: 'bold' }}>{totalCursosMostrados}</span>
                                            </p>
                                            <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                                <strong>Total Créditos:</strong>
                                                <span style={{ fontWeight: 'bold' }}>{totalCreditosMostrados}</span>
                                            </p>
                                            <p style={{ fontSize: '12px', color: fueraDeFecha ? '#94a3b8' : '#6b7280', margin: '10px 0 0 0', lineHeight: '1.4' }}>
                                                {fueraDeFecha ? "Carga académica consolidada (Modo lectura)." : "Actualización a cursos en tiempo real."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BOTÓN GENERAL DE PROCESAMIENTO AL FINAL DE LA COLUMNA */}
                                    <button
                                        type="button"
                                        disabled={cargando || violandoReglaDeDeuda || fueraDeFecha || alumnoYaMatriculado}
                                        className="btn-enviar"
                                        style={{
                                            height: '42px',
                                            fontSize: '14px',
                                            borderRadius: '6px',
                                            marginTop: '5px',
                                            cursor: (fueraDeFecha || alumnoYaMatriculado) ? 'not-allowed' : 'pointer',

                                            // 🎨 CAMBIO DE COLOR DINÁMICO: 
                                            // Si ya está matriculado, se pinta de color Verde Éxito Institucional.
                                            // Si no se matriculó y ya cerró el proceso, se queda en gris apagado.
                                            backgroundColor: (fueraDeFecha || alumnoYaMatriculado) ? '#94a3b8' : '#10b981',
                                            border: 'none',
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifycontent: 'center',
                                            gap: '8px'
                                        }}
                                        onClick={() => !fueraDeFecha && setMostrarModalConfirmar(true)}
                                    >
                                        {cargando ? (
                                            'Procesando...'
                                        ) : alumnoYaMatriculado ? (
                                            // 📝 TEXTO DINÁMICO CONFIRMATORIO PARA EL ALUMNO
                                            <>🛡️ Estudiante Matriculado</>
                                        ) : fueraDeFecha ? (
                                            'Proceso Concluido'
                                        ) : (
                                            'Finalizar e Inscribir'
                                        )}
                                    </button>

                                    {violandoReglaDeDeuda && (
                                        <p style={{ color: '#b91c1c', fontSize: '11px', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }}>
                                            ⚠️ Alerta: Tienes {totalCargosPendientes} cursos desaprobados acumulados. Debes seleccionar al menos un curso por la tarde.
                                        </p>
                                    )}
                                </div>
                            )}


                        </div>



                    </form >
                </>
            ) : (
                /* 🔒 SECCIÓN FUERA DE FECHA: Lo único que brotará en tu monitor abajo de la cabecera principal */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* ⚠️ Tu aviso rojo de Proceso Concluido se mantiene firme en la cumbre */}
                    <div className="alerta-tiempo-vencido">
                        <span>⏰</span>
                        <div>
                            <strong>PROCESO DE MATRÍCULA CONCLUIDO:</strong> El plazo regular establecido por la dirección académica para el periodo 2026-I finalizó el <strong>24/06/2026 a las 23:59</strong>. El sistema se encuentra en modo lectura. Comuníquese con la oficina de Registro Central.
                        </div>
                    </div>

                    {/* Tarjeta institucional con el Candado de Acceso Restringido */}
                    <div style={{
                        padding: '40px 32px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1',
                        borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
                    }}>
                        <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔒</span>
                        <strong style={{ fontSize: '15px', color: '#475569', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Acceso Restringido al Formulario
                        </strong>
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '500', lineHeight: '1.4' }}>
                            Las compuertas de inscripción digital han sido cerradas de forma automatizada por el servidor. Para cualquier consulta excepcional, sírvase coordinar de forma presencial en las ventanillas de atención académica.
                        </p>
                    </div>

                </div>
            )}
            {/* MODAL DE CONFIRMACIÓN */}
            {mostrarModalConfirmar && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            padding: '25px',
                            borderRadius: '10px',
                            width: '400px',
                            textAlign: 'center'
                        }}
                    >
                        <h3>Confirmar Matrícula</h3>

                        <p>
                            ¿Desea finalizar e inscribir los cursos seleccionados?
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: '20px'
                            }}
                        >
                            <button
                                onClick={() => setMostrarModalConfirmar(false)}
                                style={{
                                    padding: '10px 20px'
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={confirmarYEnviarMatricula}
                                style={{
                                    padding: '10px 20px'
                                }}
                            >
                                Sí, Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* MODAL DE ÉXITO */}
            {
                mostrarModalExito && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999
                        }}
                    >
                        <div
                            style={{
                                background: '#fff',
                                padding: '25px',
                                borderRadius: '10px',
                                width: '400px',
                                textAlign: 'center'
                            }}
                        >
                            <h3>Matrícula Exitosa</h3>

                            <p>
                                El estudiante ha sido matriculado correctamente.
                            </p>

                            <button
                                onClick={() => setMostrarModalExito(false)}
                                style={{
                                    marginTop: '15px',
                                    padding: '10px 20px'
                                }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                )
            }



        </div >
    );
};

export default MatriculaForm;



