import React from 'react';

const BandejaDocentePendiente = () => {
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
                {/* Icono de bandeja de entrada institucional */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    📥
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
                    Bandeja de Entregas Cerrada Preventivamente
                </h2>
                
                {/* Mensaje descriptivo con su respectivo diferencial pedagógico */}
                <p style={{ 
                    margin: '0 0 24px 0', 
                    fontSize: '14.5px', 
                    color: '#475569', 
                    lineHeight: '1.6',
                    fontWeight: '500'
                }}>
                    Estimado(a) docente, el repositorio digital de recepción y auditoría de trabajos se encuentra **temporalmente inactivo**. El calendario institucional exige la apertura oficial de las cátedras y el registro de sílabos antes de habilitar la asignación de actividades académicas.
                </p>

                {/* Tag Informativo de Control */}
                <div style={{ 
                    backgroundColor: '#fff7ed', 
                    border: '1px solid #ffedd5', 
                    borderRadius: '10px', 
                    padding: '14px 20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{ fontSize: '18px' }}>🛡️</span>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        Estado del Módulo: En Reserva
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BandejaDocentePendiente;
