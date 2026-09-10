import React, { useEffect, useState } from 'react';
import './IntroStamp.css';

const IntroStamp = ({ onComplete }) => {
  const [phase, setPhase] = useState('initial');

  useEffect(() => {
    // Ultra-smooth 60fps Animation Sequence
    const timer1 = setTimeout(() => setPhase('stamp'), 100);
    const timer2 = setTimeout(() => setPhase('shine'), 850);
    const timer3 = setTimeout(() => setPhase('fly'), 1800);
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`intro-stamp-backdrop phase-${phase}`}>
      <div className="stamp-radial-glow"></div>
      <div className="stamp-shockwave-ring"></div>
      <div className="stamp-center-box">
        <div className="stamp-logo-wrap">
          <img
            src="/logo.png"
            alt="Jewel Street Logo"
            className="stamp-logo-img"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="stamp-text-group">
            <h1 className="stamp-brand-name">
              JEWEL STREET
              <span className="stamp-brand-subtitle">HAUTE JOAILLERIE</span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroStamp;
