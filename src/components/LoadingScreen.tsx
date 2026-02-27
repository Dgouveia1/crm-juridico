import React from 'react';
import { Sparkles, Scale } from 'lucide-react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="loading-screen">
            {/* Animated particles */}
            <div className="particles">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />
                ))}
            </div>

            {/* Main content */}
            <div className="loading-content">


                {/* Brand text */}
                <div className="brand-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <img src="/logos/logo.png" alt="World Games" style={{ width: '220px', height: 'auto', objectFit: 'contain' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '16px', fontWeight: 900, letterSpacing: '1.5px' }}>
                            <span>COPILOTO IA</span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '2px' }}>V2.0</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="loading-bar-wrap">
                    <div className="loading-bar" />
                </div>

                <p className="loading-status">Carregando processos do e-SAJ...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
