import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatriculaForm = () => {
    // ID de prueba fijo (Simula a Ana María con ID 1)
    const [estudianteId] = useState(4);
    const [semestreId] = useState(1);
    const [cicloAMatricular, setCicloAMatricular] = useState(1);

    // Estados para los datos del backend
    const [estudianteInfo, setEstudianteInfo] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [ciclosPermitidos, setCiclosPermitidos] = useState([]);
    const [esAutomatica, setEsAutomatica] = useState(false); // 🔥 NUEVO: Detecta si es automática
    const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);
    const [selectedCursos, setSelectedCursos] = useState({});
    const [totalCargosPendientes, setTotalCargosPendientes] = useState(0);


    const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);


    // 1. Cargar perfil del estudiante y calcular las reglas de su matrícula
    // 1. Cargar perfil del estudiante y calcular las reglas de su matrícula
    useEffect(() => {
        const cargarPerfilYValidarCiclos = async () => {
            try {
                // Traer datos del alumno de Aiven.io
                const perfilRes = await axios.get(`http://localhost:5000/api/estudiantes/perfil/${estudianteId}`);
                const estudiante = perfilRes.data;
                setEstudianteInfo(estudiante);

                // REGLA DE ORO DE 1ER CICLO: Si es ingresante, su matrícula es AUTOMÁTICA
                if (estudiante.ciclo_actual === 1) {
                    setEsAutomatica(true);
                    setCiclosPermitidos([1]);
                    setCicloAMatricular(1);
                    return; // Frenamos aquí el flujo, no necesita evaluar notas anteriores
                }

                // Si es de ciclo 2 a más, consultamos sus notas previas para calcular restricciones
                const notasRes = await axios.get(`http://localhost:5000/api/cursos/disponibles`, {
                    params: {
                        estudiante_id: estudianteId,
                        ciclo_a_matricular: estudiante.ciclo_actual,
                        carrera_id: estudiante.carrera_id
                    }
                });

                // 🔥 CORRECCIÓN: Extraemos el arreglo interno 'cursos' de forma segura
                const listaCursos = notasRes.data.cursos || [];

                // Contamos cuántos cursos tiene desaprobados en el ciclo que acaba de terminar
                const cantidadJalados = listaCursos.filter(c => c.tipo === 'cargo').length;

                let opcionesDeCiclo = [];

                if (cantidadJalados >= 3) {
                    // REGLA 3 JALADOS: Repite el ciclo completo por completo obligatoriamente
                    opcionesDeCiclo = [estudiante.ciclo_actual];
                } else {
                    // REGLA 0, 1 o 2 JALADOS: Avanza con éxito al ciclo inmediato superior
                    const cicloSiguiente = estudiante.ciclo_actual + 1;
                    if (cicloSiguiente <= 10) {
                        opcionesDeCiclo.push(cicloSiguiente);
                    } else {
                        opcionesDeCiclo.push(10);
                    }
                }

                setEsAutomatica(false);
                setCiclosPermitidos(opcionesDeCiclo);

                // Configura por defecto la primera opción válida calculada
                if (opcionesDeCiclo.length > 0) {
                    setCicloAMatricular(opcionesDeCiclo[0]);
                }

            } catch (error) {
                console.error("Error al calcular la matrícula del alumno:", error);
            }
        };
        cargarPerfilYValidarCiclos();
    }, [estudianteId]);


    // 2. Cargar cursos (Trae los normales del ciclo + los cargos si existen)
    useEffect(() => {
        if (!estudianteInfo) return;
        const cargarCursos = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cursos/disponibles`, {
                    params: { estudiante_id: estudianteId, ciclo_a_matricular: cicloAMatricular, carrera_id: estudianteInfo.carrera_id }
                });

                const dataCursos = response.data.cursos || [];
                setCursos(dataCursos);
                setTotalCargosPendientes(response.data.totalCargosPendientes || 0);

                // Marcar por defecto los cursos que son obligatorios (regulares)
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
    const cursosSeleccionadosLista = cursos.filter(c => selectedCursos[c.id]);
    const totalCreditos = cursosSeleccionadosLista.reduce((sum, c) => sum + c.creditos, 0);
    const cargosSeleccionadosCount = cursosSeleccionadosLista.filter(c => c.tipo === 'cargo').length;

    // Regla de Oro: Si tiene 3 deudas o más, está obligado a seleccionar al menos 1 cargo
    const violandoReglaDeDeuda = totalCargosPendientes >= 3 && cargosSeleccionadosCount === 0;



    return (
        <div className="container">
            {/* Encabezado General */}
            <div className="header">
                <h1>Proceso de Matrícula Académica</h1>
                <p>Instituto Pedagógico Superior</p>
            </div>

            {/* PANEL SUPERIOR: Ficha de Datos del Estudiante */}
            <div className="panel-control" style={{ marginBottom: '25px', width: 'auto' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', marginTop: 0 }}>
                    DATOS DEL ESTUDIANTE
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                    <div className="grupo-campo">
                        <label>ID Estudiante</label>
                        <input
                            type="text"
                            className="input-deshabilitado"
                            value={estudianteInfo ? `EST-00${estudianteInfo.id}` : 'Cargando...'}
                            readOnly
                        />
                    </div>
                    <div className="grupo-campo">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            className="input-deshabilitado"
                            value={estudianteInfo ? `${estudianteInfo.nombres} ${estudianteInfo.apellidos}` : 'Cargando...'}
                            readOnly
                        />
                    </div>
                    <div className="grupo-campo">
                        <label>Estatus Académico / Especialidad</label>
                        <input
                            type="text"
                            className="input-deshabilitado"
                            value={estudianteInfo ? `CICLO ${estudianteInfo.ciclo_actual} - ${estudianteInfo.carrera}` : 'Cargando...'}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            {/* Mensajes de Alerta del Servidor */}
            {mensajeFeedback.texto && (
                <div className={`alerta ${mensajeFeedback.tipo === 'exito' ? 'alerta-exito' : 'alerta-error'}`}>
                    {mensajeFeedback.texto}
                </div>
            )}

            {/* Formulario de Tres Columnas */}
            <form onSubmit={gestionarMatricula}>

                {/* CONTENEDOR UNIFICADO: Proceso de Matrícula */}
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
                            {esAutomatica ? (
                                <input type="text" className="input-deshabilitado" value="Ciclo 1 (Automática - Ingresante)" readOnly />
                            ) : (
                                <select value={cicloAMatricular} onChange={(e) => setCicloAMatricular(Number(e.target.value))}>
                                    {ciclosPermitidos.map((ciclo) => (
                                        <option key={ciclo} value={ciclo}>
                                            Ciclo {ciclo} {estudianteInfo && ciclo === estudianteInfo.ciclo_actual ? '(Repetir Ciclo)' : '(Siguiente Nivel)'}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* APERTURA DEL CONTENEDOR EN GRID PARA LA TABLA ABAJO (Mantenlo tal cual) */}
                <div style={{ display: 'grid', gridTemplateColumns: esAutomatica ? '1fr' : '2.5fr 1fr', gap: '20px', alignItems: 'start', marginTop: '20px' }}>


                    {/* COLUMNA 2: Tabla Central de Cursos Disponibles */}

                    <div className="panel-tabla" style={{ overflow: 'hidden' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '10px' }}>
                            {/* Cuadro del Resumen Minimalista */}
                            <div className="panel-resumen-derecho">
                                <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000000', borderBottom: '2px solid #333333', paddingBottom: '6px' }}>
                                    RESUMEN DE MATRÍCULA
                                </h2>
                                <div style={{ fontSize: '14px', lineHeight: '2' }}>
                                    <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>Cursos Seleccionados:</strong>
                                        <span style={{ fontWeight: 'bold' }}>{cursosSeleccionadosLista.length}</span>
                                    </p>
                                    <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <strong>Total Créditos:</strong>
                                        <span style={{ fontWeight: 'bold' }}>{totalCreditos}</span>
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '10px 0 0 0', lineHeight: '1.4' }}>
                                        Actualización a cursos en tiempo real.
                                    </p>
                                </div>
                            </div>

                            {/* BOTÓN GENERAL DE PROCESAMIENTO AL FINAL DE LA COLUMNA */}
                            <button
                                type="button"
                                disabled={cargando || violandoReglaDeDeuda}
                                className="btn-enviar"
                                onClick={() => setMostrarModalConfirmar(true)}
                            >
                                {cargando ? 'Procesando...' : 'Finalizar e Inscribir'}
                            </button>

                            {violandoReglaDeDeuda && (
                                <p style={{ color: '#b91c1c', fontSize: '11px', fontWeight: 'bold', lineHeight: '1.4', margin: 0 }}>
                                    ⚠️ Alerta: Tienes {totalCargosPendientes} cursos desaprobados acumulados. Debes seleccionar al menos un curso por la tarde.
                                </p>
                            )}
                        </div>
                    )}


                </div>


            </form>

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
            )}

            {/* MODAL DE ÉXITO */}
            {mostrarModalExito && (
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
            )}



        </div>
    );
};

export default MatriculaForm;



