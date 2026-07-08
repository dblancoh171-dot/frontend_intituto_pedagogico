import React from 'react';

const ActasNotasPendiente = () => {
    return (
        <div style={{ 
            padding: '40px', backgroundColor: '#f8fafc', minHeight: '85vh', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <div style={{ 
                backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', 
                padding: '48px 40px', textAlign: 'center', maxWidth: '580px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💯</div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                    Actas de Evaluación No Disponibles
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14.5px', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                    Estimado(a) docente, el Registro de Calificaciones Oficiales se encuentra **cerrado preventivamente**. El ingreso de notas por casilleros se habilitará de forma automatizada una vez iniciado el período oficial de clases.
                </p>
                <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '10px', padding: '14px 20px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#c2410c', textTransform: 'uppercase' }}>
                        Módulo Bloqueado: Fase Académica de Matrícula Activa
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ActasNotasPendiente;
