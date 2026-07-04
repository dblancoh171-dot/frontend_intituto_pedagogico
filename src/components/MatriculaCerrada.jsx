import React from 'react';

const MatriculaCerrada = ({ fechaLimiteReal }) => {
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
                maxWidth: '600px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Icono del reloj de arena / candado institucional */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    ⏳
                </div>
                
                {/* Título de la Ventana Central */}
                <h2 style={{ 
                    margin: '0 0 12px 0', 
                    fontSize: '20px', 
                    fontWeight: '800', 
                    color: '#0f172a',
                    letterSpacing: '-0.3px',
                    textTransform: 'uppercase'
                }}>
                    Proceso de Matrícula Concluido
                </h2>
                
                {/* Mensaje descriptivo institucional */}
                <p style={{ 
                    margin: '0 0 24px 0', 
                    fontSize: '14.5px', 
                    color: '#475569', 
                    lineHeight: '1.6',
                    fontWeight: '500'
                }}>
                    El plazo regular establecido por la dirección académica para el periodo institucional <strong style={{ color: '#ef4444' }}>2026-I</strong> ha finalizado. El sistema de registro digital se encuentra cerrado de forma automatizada por el servidor.
                </p>

                {/* Tarjeta de Advertencia de Alerta Roja Dinámica */}
                <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fee2e2', 
                    borderRadius: '10px', 
                    padding: '16px 20px',
                    textAlign: 'left',
                    marginBottom: '20px'
                }}>
                    <span style={{ fontSize: '13px', fontWeight: '850', color: '#b91c1c', display: 'block', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.3px' }}>
                        ⏰ Cronograma Oficial de Cierre:
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#991b1b', lineHeight: '1.4', display: 'block' }}>
                        Finalizó el <strong>{fechaLimiteReal}</strong>. Las compuertas de inscripción se encuentran en modo lectura. Para casos excepcionales, comuníquese con la oficina de Registro Central.
                    </span>
                </div>

                {/* Pastilla secundaria de control administrativo */}
                <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🖨 Acceso Restringido al Formulario
                </div>
            </div>
        </div>
    );
};

export default MatriculaCerrada;
