import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatriculaForm = () => {
    const [estudianteId] = useState(1); 
    const [semestreId] = useState(1);   
    const [cicloAMatricular, setCicloAMatricular] = useState(1);

    const [cursos, setCursos] = useState([]);
    const [mensajeFeedback, setMensajeFeedback] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarCursos = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cursos/disponibles`, {
                    params: { estudiante_id: estudianteId, ciclo_a_matricular: cicloAMatricular }
                });
                setCursos(response.data);
            } catch (error) {
                console.error("Error al traer los cursos:", error);
            }
        };
        cargarCursos();
    }, [cicloAMatricular, estudianteId]);

    const gestionarMatricula = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeFeedback({ texto: '', tipo: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/matriculas/matricular', {
                estudiante_id: estudianteId,
                semestre_id: semestreId,
                ciclo_a_matricular: Number(cicloAMatricular)
            });

            setMensajeFeedback({
                texto: `¡Éxito! ${response.data.message}. Condición: ${response.data.condicion.toUpperCase()}`,
                tipo: 'exito'
            });
        } catch (error) {
            const msg = error.response?.data?.message || "Error inesperado al matricular.";
            setMensajeFeedback({ texto: msg, tipo: 'error' });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="container">
            {/* Encabezado */}
            <div className="header">
                <h1>Proceso de Matrícula Académica</h1>
                <p>Instituto Pedagógico Superior</p>
            </div>

            {/* Mensajes de Alerta */}
            {mensajeFeedback.texto && (
                <div className={`alerta ${mensajeFeedback.tipo === 'exito' ? 'alerta-exito' : 'alerta-error'}`}>
                    {mensajeFeedback.texto}
                </div>
            )}

            <form onSubmit={gestionarMatricula} className="grid-matricula">
                {/* Panel Configuración */}
                <div className="panel-control">
                    <h2>Selección de Periodo</h2>
                    
                    <div className="grupo-campo">
                        <label>Semestre Actual</label>
                        <select className="input-deshabilitado" disabled>
                            <option>2026-I (Semestre Impar)</option>
                        </select>
                    </div>

                    <div className="grupo-campo">
                        <label>Ciclo a Solicitar</label>
                        <select 
                            value={cicloAMatricular} 
                            onChange={(e) => setCicloAMatricular(e.target.value)}
                        >
                            {[...Array(10)].map((_, i) => (
                                <option key={i+1} value={i+1}>Ciclo {i+1}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={cargando} className="btn-enviar">
                        {cargando ? 'Procesando...' : 'Finalizar e Inscribir'}
                    </button>
                </div>

                {/* Tabla de Cursos */}
                <div className="panel-tabla">
                    <h2>Mallas y Cursos Disponibles</h2>
                    
                    <table className="tabla-cursos">
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                <th>Ciclo</th>
                                <th>Estado / Requisito</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.length === 0 ? (
                                <tr>
                                    <td colSpan="3" style={{textAlign: 'center', color: '#9ca3af'}}>
                                        No hay asignaturas cargadas para este ciclo.
                                    </td>
                                </tr>
                            ) : (
                                cursos.map((curso) => {
                                    const esJalado = curso.estadoVisual === 'jalado_bloqueado';
                                    const claseFila = esJalado ? 'fila-bloqueada' : 'fila-normal';
                                    
                                    let claseBadge = 'badge-disponible';
                                    if (curso.estadoVisual === 'aprobado') claseBadge = 'badge-aprobado';
                                    if (esJalado) claseBadge = 'badge-bloqueado';

                                    return (
                                        <tr key={curso.id} className={claseFila}>
                                            <td style={{fontWeight: '500'}}>{curso.nombre}</td>
                                            <td style={{color: '#6b7280'}}>Ciclo {curso.ciclo}</td>
                                            <td>
                                                <span className={`badge ${claseBadge}`}>
                                                    {curso.mensaje}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
};

export default MatriculaForm;
