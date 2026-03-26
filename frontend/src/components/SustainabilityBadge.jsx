import React from 'react';
import { Leaf, ShieldCheck, Award } from 'lucide-react';

const SustainabilityBadge = ({ score, certified, size = 'md' }) => {
  const getLevel = () => {
    if (score >= 75) return { label: 'Platinum Eco', class: 'high', icon: '🌟' };
    if (score >= 50) return { label: 'Gold Eco', class: 'medium', icon: '🌿' };
    return { label: 'Eco Friendly', class: 'low', icon: '🌱' };
  };

  const level = getLevel();

  if (size === 'sm') {
    return (
      <span className={`sustainability-badge ${level.class}`}>
        {level.icon} {score}% {certified && <ShieldCheck size={14} />}
      </span>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#ecfdf5', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Leaf size={24} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#064e3b' }}>
            {level.label}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#059669' }}>
            Sustainability Score: {score}%
          </div>
        </div>
        {certified && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', background: '#059669', color: 'white',
            borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
          }}>
            <Award size={14} /> Certified
          </div>
        )}
      </div>
      <div className="sustainability-meter">
        <div className="sustainability-meter-fill" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default SustainabilityBadge;
