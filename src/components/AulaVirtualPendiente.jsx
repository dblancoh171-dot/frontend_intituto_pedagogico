import React from 'react';

const AulaVirtualPendiente = ({ fechaInicioClases }) => {
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
                {/* Icono animado o flotante */}
                <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px',
                    animation: 'float 3s ease-in-out infinite' 
                }}>
                    📚
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
                    Aula Virtual en Fase de Preparación
                </h2>
                
                {/* Mensaje descriptivo institucional */}
                <p style={{ 
                    margin: '0 0 24px 0', 
                    fontSize: '14.5px', 
                    color: '#475569', 
                    lineHeight: '1.6',
                    fontWeight: '500'
                }}>
                    Estimado(a) estudiante, el periodo de clases para el ciclo académico <strong style={{ color: '#2563eb' }}>2026-I</strong> aún no ha iniciado de forma oficial. Actualmente nos encontramos consolidando las actas de matrícula y la asignación de horarios docentes.
                </p>

                {/* Tarjeta de Cuenta Regresiva Visual */}
                <div style={{ 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe', 
                    borderRadius: '10px', 
                    padding: '14px 20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '18px' }}>📅</span>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Fecha Oficial de Apertura: {fechaInicioClases}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AulaVirtualPendiente;
