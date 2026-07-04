import React from 'react';

const CargaDocentePendiente = ({ fechaInicioClases }) => {
    return (
        <div style={{ 
            padding: '40px', 
            backgroundColor: '#f8fafc', 
            minHeight: '85vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <div style={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '16px', 
                padding: '48px 40px', 
                textAlign: 'center', 
                maxWidth: '580px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Icono animado del maletín/clases */}
                <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px'
                }}>
                    👨‍🏫
                </div>
                
                {/* Título de la Ventana Central */}
                <h2 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '20px', 
                    fontWeight: '800', 
                    color: '#0f172a',
                    letterSpacing: '-0.3px',
                    textTransform: 'uppercase'
                }}>
                    Carga Académica en Preparación
                </h2>
                
                {/* Mensaje descriptivo institucional */}
                <p style={{ 
                    margin: '0 0 24px 0', 
                    fontSize: '14.5px', 
                    color: '#475569', 
                    lineHeight: '1.6',
                    fontWeight: '500'
                }}>
                    Estimado(a) docente, el periodo de gestión pedagógica para el ciclo académico <strong style={{ color: '#16a34a' }}>2026-I</strong> se encuentra en fase de reserva. Actualmente el sistema procesa los cierres de actas de matrícula y la distribución oficial de las aulas.
                </p>

                {/* Tarjeta de Recordatorio Visual con Fecha Real */}
                <div style={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '10px', 
                    padding: '14px 20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Activación de Aulas y Asistencia: {fechaInicioClases}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CargaDocentePendiente;
