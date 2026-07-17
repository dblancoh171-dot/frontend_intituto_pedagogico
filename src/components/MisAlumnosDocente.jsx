import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MisAlumnosDocente = ({ profesorId, semestreId }) => {
    const [alumnos, setAlumnos] = useState([]);
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('todos');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDirectorioAlumnos = async () => {
            if (!profesorId || !semestreId) return;
            try {
                // Golpeamos tu nuevo endpoint del backend
                const res = await axios.get('http://localhost:5000/api/profesores/mis-alumnos-vanguardia', {
                    params: { profesor_id: profesorId, semestre_id: semestreId }
                });

                const data = res.data || [];
                setAlumnos(data);

                // Extraemos la lista única de cursos que dicta el profesor para el filtro superior
                const mapeoCursos = {};
                data.forEach(al => {
                    mapeoCursos[al.curso_id] = al.curso_nombre;
                });
                const listaUnicaCursos = Object.keys(mapeoCursos).map(id => ({
                    id: Number(id),
                    nombre: mapeoCursos[id]
                }));
                setCursosDisponibles(listaUnicaCursos);

                setCargando(false);
            } catch (err) {
                console.error("🚨 Error al consultar el pool de alumnos:", err);
                setError("No se pudo sincronizar el listado de alumnos con el servidor.");
                setCargando(false);
            }
        };

        cargarDirectorioAlumnos();
    }, [profesorId, semestreId]);

    // Filtrado interactivo en la RAM local
    const alumnosFiltrados = cursoSeleccionado === 'todos'
        ? alumnos
        : alumnos.filter(al => al.curso_id === Number(cursoSeleccionado));

    // Determina el color del semáforo según el porcentaje de asistencia (Tu regla del 75%)
    const obtenerEstiloAsistencia = (porcentaje) => {
        const valor = porcentaje !== null ? Number(porcentaje) : 100;
        if (valor < 75) return { color: '#dc2626', bg: '#fef2f2', texto: '⚠️ Riesgo de Inhabilitación' };
        if (valor < 85) return { color: '#d97706', bg: '#fffbec', texto: 'Aceptable' };
        return { color: '#16a34a', bg: '#f0fdf4', texto: 'Excelente' };
    };

    if (cargando) return <div style={{ padding: '24px', color: '#64748b', fontWeight: '500' }}>👥 Sincronizando directorio clínico de alumnos con Aiven.io...</div>;
    if (error) return <div style={{ padding: '24px', color: '#ef4444', fontWeight: 'bold' }}>⚠️ {error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', color: '#1e293b', animation: 'fadeIn 0.2s ease' }}>

            {/* 📋 ENCABEZADO Y FILTRO SELECTOR */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>👥 Panel de Control de Alumnos</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Seguimiento general de rendimiento, asistencia y estado final por aula.</p>
                </div>

                {/* Filtro desplegable dinámico */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Filtrar por Aula:</label>
                    <select
                        value={cursoSeleccionado}
                        onChange={(e) => setCursoSeleccionado(e.target.value)}
                        style={{ height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', color: '#1e293b', cursor: 'pointer', backgroundColor: '#fff' }}
                    >
                        <option value="todos">✨ Mostrar Todos los Cursos</option>
                        {cursosDisponibles.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 🖥️ GRILLA ELÁSTICA DE TARJETAS DE ALUMNOS */}
            {alumnosFiltrados.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>No se registran alumnos matriculados bajo este criterio de selección.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {alumnosFiltrados.map((item, index) => {
                        const semaforo = obtenerEstiloAsistencia(item.asistencia_final_porcentaje);
                        const promedio = item.promedio_final !== null ? Number(item.promedio_final).toFixed(2) : '0.00';

                        return (
                            <div key={`${item.estudiante_id}-${index}`} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s' }}>

                                {/* A) Datos Personales del Alumno */}
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700' }}>
                                        {item.apellidos.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.apellidos}, {item.nombres}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>🪪 DNI: {item.dni} | 📧 {item.email}</div>
                                    </div>
                                </div>

                                {/* B) Curso Relacionado */}
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                                    📚 {item.curso_nombre} <span style={{ color: '#0284c7', fontSize: '11px' }}>(Ciclo {item.curso_ciclo})</span>
                                </div>

                                {/* C) Semáforos Métricos: Promedio y Asistencia */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {/* Caja de Promedio */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Promedio Actual</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: Number(promedio) >= 10.5 ? '#16a34a' : '#dc2626' }}>
                                            {promedio}
                                        </div>
                                    </div>

                                    {/* Caja de Asistencia */}
                                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center', backgroundColor: semaforo.bg }}>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '2px' }}>Asistencia</div>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: semaforo.color }}>
                                            {item.asistencia_final_porcentaje !== null ? `${Number(item.asistencia_final_porcentaje).toFixed(0)}%` : '0%'}
                                        </div>
                                    </div>
                                </div>

                                {/* D) Barra de Estado Contractual Final */}
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                    <span style={{ color: '#64748b', fontWeight: '500' }}>Estado Final:</span>
                                    <span style={{
                                        fontWeight: '700',
                                        marginLeft: 'auto',
                                        color: item.estado_aprobacion === 'Aprobado' ? '#16a34a' : item.estado_aprobacion === 'En Curso' ? '#0284c7' : '#dc2626',
                                        backgroundColor: item.estado_aprobacion === 'Aprobado' ? '#f0fdf4' : item.estado_aprobacion === 'En Curso' ? '#eff6ff' : '#fef2f2',
                                        padding: '3px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {item.estado_aprobacion || 'En Curso'}
                                    </span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MisAlumnosDocente;
