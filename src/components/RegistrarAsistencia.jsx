import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RegistrarAsistencia = ({ sesionNumero, cursoNombre, cursoId, sesionId, onRegresar }) => {
    const [alumnos, setAlumnos] = useState([]);
    const [asistencias, setAsistencias] = useState({});
    const [cargando, setCargando] = useState(true);

    const [yaExisteRegistro, setYaExisteRegistro] = useState(false);
    //const semestreId = 1; // ID de tu semestre institucional activo

    // 📡 1. LECTURA DE ALUMNOS MATRICULADOS DESDE AIVEN.IO
    // 📡 1. LECTURA DE ALUMNOS MATRICULADOS DESDE AIVEN.IO (REPARADO)
    useEffect(() => {
        // 🧼 REPARADO: Cambiado cursold por cursoId (Con I mayúscula matching con tus props)
        if (!sesionId || !cursoId) {
            setCargando(false);
            return;
        }

        const cargarTodoElAulaAsistencia = async () => {
            setCargando(true); // Encendemos la carga limpia antes de golpear la red
            console.log(`-> [AIVEN.IO] Sincronizando Asistencia. Curso: ${cursoId} | Sesión: ${sesionId}`);

            try {
                // 📡 LLAMADA 1: Solicitud de la nómina enviando ambos parámetros obligatorios
                const resAlumnos = await axios.get(`http://localhost:5000/api/notas/alumnos-curso`, {
                    params: {
                        curso_id: Number(cursoId), // ◄ REPARADO: Con I mayúscula conforme a tus props
                        semestre_id: 1 // ◄ 🛡️ ADUANA CRUCIAL: Inyectamos tu semestre activo para romper el 400 de tu API
                    }
                });

                // Asimilamos el array desestructurado según el formato de la Página 3 de tu PDF
                const listaAlumnos = resAlumnos.data?.alumnos || resAlumnos.data || [];
                setAlumnos(listaAlumnos);

                // 📡 LLAMADA 2: Consulta del histórico real guardado de ESTA SESIÓN ESPECÍFICA
                const resHistorial = await axios.get(`http://localhost:5000/api/notas/obtener-asistencias-guardadas`, {
                    params: { sesion_id: Number(sesionId) }
                });
                const historialGuardado = resHistorial.data || [];

                const mapaAsistencias = {};

                if (historialGuardado.length > 0) {
                    // CASO A: YA EXISTE ASISTENCIA TOMADA PARA ESTA SESIÓN
                    setYaExisteRegistro(true);
                    historialGuardado.forEach(hist => {
                        mapaAsistencias[hist.estudiante_id] = hist.asistio === 1;
                    });
                } else {
                    // CASO B: LA SESIÓN ESTÁ LIMPIA. Nadie tiene asistencia tomada aún
                    setYaExisteRegistro(false);
                    listaAlumnos.forEach(al => {
                        const idClave = al.estudiante_id || al.id;
                        mapaAsistencias[idClave] = false;
                    });
                }

                setAsistencias(mapaAsistencias);

            } catch (error) {
                console.error("🚨 Error crítico de red al sincronizar con el servidor:", error);
                setAlumnos([]);
            } finally {
                // 🔓 LIBERACIÓN GARANTIZADA
                setCargando(false);
            }
        };

        cargarTodoElAulaAsistencia();
    }, [cursoId, sesionId]); // Sincronizado con tus variables reales


    // 2. Conmutar el cuadro individual de asistencia (✓)
    const handleCuadroClick = (estudianteId) => {
        setAsistencias(prev => ({
            ...prev,
            [estudianteId]: !prev[estudianteId]
        }));
    };

    // 🔥 3. ACCIÓN MASIVA: Marcar todos los alumnos del aula con aspa verde (true)
    const handleMarcarTodos = () => {
        const mapaCompleto = {};
        alumnos.forEach(al => {
            mapaCompleto[al.estudiante_id] = true;
        });
        setAsistencias(mapaCompleto);
    };

    // 🔥 4. ACCIÓN MASIVA: Limpiar o desmarcar absolutamente todos los casilleros (false)
    const handleLimpiarTodo = () => {
        const mapaVacio = {};
        alumnos.forEach(al => {
            mapaVacio[al.estudiante_id] = false;
        });
        setAsistencias(mapaVacio);
    };


    const handleGuardarAsistenciaFinal = async () => {
        // Estructuramos un arreglo limpio convirtiendo nuestro mapa { id: true } en filas legibles
        const listaParaEnviar = alumnos.map(al => ({
            estudiante_id: al.estudiante_id || al.id,
            asistio: asistencias[al.estudiante_id || al.id] ? 1 : 0 // 1 = Presente, 0 = Falta
        }));

        console.log("-> Despachando control de asistencia a Node.js:", {
            sesion_id: sesionId || 1,
            asistencias: listaParaEnviar
        });

        try {
            await axios.post('http://localhost:5000/api/notas/guardar-asistencia', {
                sesion_id: Number(sesionId || 1),
                registros: listaParaEnviar
            });

            alert("¡Control de asistencia del día guardado con éxito en Aiven.io!");
            onRegresar(); // 🔄 Retorna automáticamente al catálogo de tus clases
        } catch (error) {
            console.error("Error al guardar asistencia:", error);
            alert("Error al guardar en el servidor: " + error.message);
        }
    };

    if (cargando) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Sincronizando nómina oficial de alumnos con la nube...</div>;
    }

    return (
        <div style={{ animation: 'fadeIn 0.25s ease-in-out', maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>

            {/* BOTÓN REGRESAR */}
            <button
                type="button"
                onClick={onRegresar}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '15px' }}
            >
                ← Volver a Sesiones
            </button>

            {/* ENCABEZADO PANORÁMICO CON ACCIONES EN MASA */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '24px',
                marginBottom: '25px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e2e8f0'
            }}>

                {/* COLUMNA IZQUIERDA: TÍTULO INSTITUCIONAL FIJO */}
                <div style={{ flexShrink: 0, maxWidth: '400px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: '1.2' }}>
                        Toma de Asistencia Oficial del Aula
                    </h1>
                    <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#1e3a8a', fontWeight: '600' }}>
                        📅 Sesión N° {String(sesionNumero || 1).padStart(2, '0')} &nbsp;|&nbsp; 📚 Materia: {cursoNombre}
                    </p>
                </div>

                {/* COLUMNA DERECHA: BLOQUE VERTICAL (AVISO ARRIBA + BOTONES ABAJO) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, alignItems: 'flex-end' }}>

                    {/* PARTE SUPERIOR: AVISO VERDE RECTANGULAR ESTIRADO */}
                    {yaExisteRegistro && (
                        <div
                            style={{
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                color: '#16a34a',
                                fontSize: '12.5px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'right',
                                gap: '8px',
                                boxSizing: 'border-box',
                                lineHeight: '1.3'
                            }}
                        >
                            📢 <span>Asistencia guardada previamente. Puede modificar y actualizar los cambios.</span>
                        </div>
                    )}

                    {/* PARTE INFERIOR: LOS DOS BOTONES MASIVOS LIBRES DE DEFORMACIÓN */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={handleMarcarTodos}
                            style={{
                                height: '36px',
                                padding: '0 18px',
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 4px rgba(22,163,74,0.1)'
                            }}
                        >
                            ✓ Marcar Todos
                        </button>

                        <button
                            type="button"
                            onClick={handleLimpiarTodo}
                            style={{
                                height: '36px',
                                padding: '0 18px',
                                backgroundColor: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                            ✕ Limpiar Todo
                        </button>
                    </div>

                </div>

            </div>

            {/* ALERTA EN CASO DE NO HABER ALUMNOS MATRICULADOS */}
            {alumnos.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    ⚠️ No se registran estudiantes matriculados en esta asignatura dentro de la base de datos.
                </div>
            ) : (
                /* 📋 LISTADO VERTICAL REAL PROVENIENTE DE MYSQL */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {alumnos.map((al, indice) => {
                        // 📡 IMPRESIÓN DE AUDITORÍA: Abre F12 en Chrome para ver cómo viajan tus columnas en vivo
                        console.log(`-> Alumno [${indice}] recibido de Aiven.io:`, al);

                        // 🔥 EL TRUCO DE INGENIERÍA: Doble lectura de seguridad por si MySQL o Express cambian las llaves
                        const idClaveReal = al.estudiante_id || al.id;
                        const idCodigo = al.codigo_estudiante;
                        const nombreReal = al.nombres || 'Estudiante';
                        const apellidoReal = al.apellidos || 'Matriculado';

                        // Sincronizamos la marca verde con la llave segura
                        const marcado = asistencias[String(idClaveReal)]; 

                        return (
                            <div
                                key={idClaveReal}
                                onClick={() => handleCuadroClick(idClaveReal)}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '16px 24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.1s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                {/* Datos Personales del Alumno listados con las variables seguras */}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                        {apellidoReal}, {nombreReal}
                                    </h3>
                                    <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                                        Código: {idCodigo }
                                    </p>
                                </div>

                                {/* EL CUADRITO DE MARCA VERDE DE ASISTENCIA */}
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    border: marcado ? '2px solid #16a34a' : '2px solid #cbd5e1',
                                    backgroundColor: marcado ? '#16a34a' : '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease-in-out'
                                }}>
                                    {marcado && (
                                        <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '900' }}>✓</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '25px' }}>
                <button
                    type="button"
                    onClick={handleGuardarAsistenciaFinal}
                    style={{
                        height: '42px', padding: '0 28px',
                        // Cambiamos el color de fondo a un verde esmeralda institucional si es una actualización
                        backgroundColor: yaExisteRegistro ? '#16a34a' : '#0f172a',
                        color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out'
                    }}
                >
                    {/* 🔥 LA MAGIA DEL TEXTO CONTEXTUAL DUAL */}
                    {yaExisteRegistro ? '🔄 Actualizar Asistencia Guardada' : '💾 Guardar Asistencia del Día'}
                </button>
            </div>

        </div >
    );
};

export default RegistrarAsistencia;


