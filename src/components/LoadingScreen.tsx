import React, { useState, useEffect } from 'react';
import { Sparkles, Scale, BookOpen, Shield, Gavel, FileText } from 'lucide-react';

const phrases = [
    "Sincronizando ambiente seguro...",
    "Buscando atualizações no e-SAJ...",
    "Analisando jurisprudências...",
    "Mapeando prazos urgentes...",
    "Preparando Gestão Processual...",
    "Carregando Inteligência Artificial..."
];

// Configuration for floating background icons
const ICONS = [Scale, BookOpen, Shield, Gavel, FileText];
const floaters = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    Icon: ICONS[i % ICONS.length],
    size: Math.random() * 40 + 20, // 20px to 60px
    left: `${Math.random() * 100}%`,
    duration: `${Math.random() * 15 + 15}s`, // 15s to 30s
    delay: `-${Math.random() * 20}s`
}));

const LoadingScreen: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % phrases.length);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-screen">
            {/* Glowing orb background */}
            <div className="loading-glow" />

            {/* Floating legal icons background */}
            {floaters.map(({ id, Icon, size, left, duration, delay }) => (
                <Icon
                    key={id}
                    className="legal-floater"
                    size={size}
                    style={{ left, animationDuration: duration, animationDelay: delay }}
                />
            ))}

            {/* Main Content */}
            <div className="loading-content">
                <div className="loading-logo-wrap">
                    <img src="/logos/logo.png" alt="Mamprin Advogados" style={{ width: '280px', height: 'auto', objectFit: 'contain' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '18px', fontWeight: 900, letterSpacing: '1.5px' }}>
                            <Sparkles size={16} />
                            <span>COPILOTO IA</span>
                            <Sparkles size={16} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '2px' }}>V2.0</span>
                    </div>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="loading-bar-wrap">
                        <div className="loading-bar" />
                    </div>

                    <div className="loading-texts">
                        {phrases.map((phrase, i) => {
                            let statusClass = 'loading-phrase exit';
                            if (i === index) statusClass = 'loading-phrase active';
                            else if (i > index) statusClass = 'loading-phrase'; // waiting to come down

                            return (
                                <div key={phrase} className={statusClass}>
                                    {phrase}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
