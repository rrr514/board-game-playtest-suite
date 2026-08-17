import React from 'react';
import { useGame } from '../context/GameContext';
import { getRelativeSector, getAdjacentSectors } from '../utils/defaultConfig';
import { Shield, Flame, Skull, Zap, Target } from 'lucide-react';

export default function Board() {
  const { boss, heroes, config, activeHero, turnPhase, handleMovementChoice, setHeroStartingSector, gameStatus, aggroHeroId } = useGame();

  // Arena Dimensions & Math
  const size = 520;
  const center = size / 2;
  const outerRadius = 220;
  const innerRadius = 90;

  const validAdjacentSectors = activeHero ? getAdjacentSectors(activeHero.sector) : [];
  const isSetupPhase = turnPhase === 'setup';
  const isMovementPhase = turnPhase === 'movement' && gameStatus === 'playing' && activeHero && !activeHero.isKo;

  // Sector angles: Sector 0 (North: 225° to 315°), Sector 1 (East: 315° to 45°), Sector 2 (South: 45° to 135°), Sector 3 (West: 135° to 225°)
  const sectors = [
    { id: 0, name: "North", angle: 270, label: "Front / Sector 0", path: "M 260 260 L 104 104 A 220 220 0 0 1 415 104 Z" },
    { id: 1, name: "East", angle: 0, label: "Right Flank / Sector 1", path: "M 260 260 L 415 104 A 220 220 0 0 1 415 415 Z" },
    { id: 2, name: "South", angle: 90, label: "Back / Sector 2", path: "M 260 260 L 415 415 A 220 220 0 0 1 104 415 Z" },
    { id: 3, name: "West", angle: 180, label: "Left Flank / Sector 3", path: "M 260 260 L 104 415 A 220 220 0 0 1 104 104 Z" }
  ];

  // Helper to calculate position offset in arc for hero tokens
  const getHeroCoordinates = (sectorId, heroIndexInSector, totalInSector) => {
    const baseAngles = [270, 0, 90, 180];
    const baseAngle = baseAngles[sectorId];
    // Spread heroes slightly inside their sector arc
    const spread = totalInSector > 1 ? (heroIndexInSector - (totalInSector - 1) / 2) * 26 : 0;
    const finalAngleRad = ((baseAngle + spread) * Math.PI) / 180;
    const distance = 160;
    return {
      x: center + distance * Math.cos(finalAngleRad),
      y: center + distance * Math.sin(finalAngleRad)
    };
  };

  // Group heroes by sector
  const heroesBySector = { 0: [], 1: [], 2: [], 3: [] };
  heroes.forEach((h) => {
    if (heroesBySector[h.sector]) {
      heroesBySector[h.sector].push(h);
    }
  });

  return (
    <div className="board-container">
      <div className="board-header">
        <h3 className="board-title">
          <Target className="icon-pulse text-amber" size={20} />
          Battlefield Arena
        </h3>
        <span className="board-subtitle">
          Boss Facing: <strong>Sector {boss.facingSector} ({config.sectors[boss.facingSector]?.name})</strong>
        </span>
      </div>

      <div className="svg-wrapper">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {/* Gradients */}
            <radialGradient id="arenaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
            </radialGradient>

            <radialGradient id="bossGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.0" />
            </radialGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Circle */}
          <circle cx={center} cy={center} r={outerRadius} fill="url(#arenaGlow)" stroke="#334155" strokeWidth="3" />

          {/* Sectors Rendering */}
          {sectors.map((s) => {
            const isFacing = boss.facingSector === s.id;
            const relativePos = getRelativeSector(s.id, boss.facingSector);
            const isExposed = relativePos === 'front' || relativePos === 'back';
            const isActiveHeroSector = activeHero && activeHero.sector === s.id;
            const isAdjacentMoveTarget = isMovementPhase && validAdjacentSectors.includes(s.id);
            const isStayTarget = isMovementPhase && isActiveHeroSector;

            // Sector Fill Colors
            let fillColor = "rgba(30, 41, 59, 0.4)";
            let strokeColor = "#334155";
            if (isAdjacentMoveTarget) {
              fillColor = "rgba(16, 185, 129, 0.2)"; // Green highlight for valid move
              strokeColor = "#34d399";
            } else if (isStayTarget) {
              fillColor = "rgba(245, 158, 11, 0.2)"; // Amber highlight for stay
              strokeColor = "#fbbf24";
            } else if (isFacing) {
              fillColor = "rgba(239, 68, 68, 0.22)"; // Red front facing sector
              strokeColor = "#f87171";
            } else if (isExposed) {
              fillColor = "rgba(245, 158, 11, 0.12)"; // Gold rear exposed sector
              strokeColor = "#f59e0b";
            } else if (isActiveHeroSector) {
              fillColor = "rgba(59, 130, 246, 0.15)";
              strokeColor = "#60a5fa";
            }

            const handleSectorClick = () => {
              if (isSetupPhase && activeHero) {
                setHeroStartingSector(activeHero.id, s.id);
                return;
              }
              if (!isMovementPhase) return;
              if (isAdjacentMoveTarget) {
                handleMovementChoice('move', s.id);
              } else if (isStayTarget) {
                handleMovementChoice('stay', s.id);
              }
            };

            return (
              <g
                key={s.id}
                className="sector-group"
                style={{ cursor: (isSetupPhase || isAdjacentMoveTarget || isStayTarget) ? 'pointer' : 'default' }}
                onClick={handleSectorClick}
              >
                {/* Sector Wedge */}
                <path
                  d={s.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isAdjacentMoveTarget ? "3" : isFacing ? "2.5" : "1.5"}
                  strokeDasharray={isFacing ? "none" : isAdjacentMoveTarget ? "none" : "4 4"}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Sector Labels & Vulnerability Tag */}
                <text
                  x={center + 195 * Math.cos((s.angle * Math.PI) / 180)}
                  y={center + 195 * Math.sin((s.angle * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="sector-label-text"
                >
                  {s.name} {isFacing ? "(FRONT 🔥)" : relativePos === 'back' ? "(REAR 🎯)" : "(FLANK 🛡️)"}
                </text>

                {/* Interactive Click Prompt in Setup Phase */}
                {isSetupPhase && (
                  <text
                    x={center + 110 * Math.cos((s.angle * Math.PI) / 180)}
                    y={center + 110 * Math.sin((s.angle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#60a5fa"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    🎯 SET STARTING SECTOR
                  </text>
                )}

                {/* Interactive Click Prompt in Movement Phase */}
                {isAdjacentMoveTarget && (
                  <text
                    x={center + 110 * Math.cos((s.angle * Math.PI) / 180)}
                    y={center + 110 * Math.sin((s.angle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#34d399"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ⚡ CLICK TO MOVE
                  </text>
                )}

                {isStayTarget && (
                  <text
                    x={center + 110 * Math.cos((s.angle * Math.PI) / 180)}
                    y={center + 110 * Math.sin((s.angle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fbbf24"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    🛑 CLICK TO STAY
                  </text>
                )}

                {!isMovementPhase && !isSetupPhase && (
                  <text
                    x={center + 135 * Math.cos((s.angle * Math.PI) / 180)}
                    y={center + 135 * Math.sin((s.angle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isExposed ? "#fbbf24" : "#94a3b8"}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {isExposed ? "EXPOSED (100%)" : "PROTECTED (0%)"}
                  </text>
                )}
              </g>
            );
          })}


          {/* Boss Center Ring & Facing Cone */}
          <g transform={`translate(${center}, ${center})`}>
            {/* Facing Pointer Cone */}
            <g transform={`rotate(${sectors[boss.facingSector].angle})`}>
              <polygon points="0,-12 110,-35 110,35" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="105" y2="0" stroke="#f87171" strokeWidth="3" strokeDasharray="3 3" />
            </g>

            {/* Boss Circle */}
            <circle r={innerRadius} fill="#1e1e38" stroke="#ef4444" strokeWidth="3" filter="url(#glowEffect)" />
            <circle r={innerRadius - 6} fill="none" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="6 4" />

            {/* Boss Details inside ring */}
            <text y="-25" textAnchor="middle" fill="#f87171" fontSize="15" fontWeight="bold" fontFamily="Cinzel, serif">
              🐉 {boss.name}
            </text>

            {/* Boss HP Bar */}
            <rect x="-50" y="-10" width="100" height="12" rx="6" fill="#0f172a" stroke="#475569" />
            <rect
              x="-48"
              y="-8"
              width={Math.max(0, (boss.hp / boss.maxHp) * 96)}
              height="8"
              rx="4"
              fill={boss.hp > boss.maxHp * 0.4 ? "#ef4444" : "#dc2626"}
            />
            <text y="-1" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              {boss.hp} / {boss.maxHp} HP
            </text>

            {/* Struggle Indicator */}
            <text y="20" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">
              ⚡ Struggle: {boss.struggle} / {config.boss.struggleThreshold}
            </text>
          </g>

          {/* Hero Tokens */}
          {Object.keys(heroesBySector).map((secIdStr) => {
            const secId = parseInt(secIdStr, 10);
            const heroList = heroesBySector[secId];
            return heroList.map((hero, idx) => {
              const pos = getHeroCoordinates(secId, idx, heroList.length);
              const isActive = activeHero && activeHero.id === hero.id;

              return (
                <g key={hero.id} transform={`translate(${pos.x}, ${pos.y})`} className="hero-token-group">
                  {/* Token Glow backdrop */}
                  {isActive && (
                    <circle r="26" fill="rgba(59, 130, 246, 0.4)" stroke="#60a5fa" strokeWidth="2.5" className="pulse-circle" />
                  )}

                  {/* Hero Token Base */}
                  <circle
                    r="20"
                    fill={hero.isKo ? "#334155" : isActive ? "#2563eb" : "#1e293b"}
                    stroke={hero.isKo ? "#64748b" : isActive ? "#93c5fd" : "#475569"}
                    strokeWidth="2"
                  />

                  {/* Hero Avatar / Initials */}
                  <text y="4" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                    {hero.name.split(' ')[0][0]}
                  </text>

                  {/* Status Badges around token */}
                  {hero.id === aggroHeroId && (
                    <g transform="translate(0, -22)" title="Holds Aggro Token">
                      <circle r="10" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />
                      <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="11">🎯</text>
                    </g>
                  )}
                  {hero.isKo && (
                    <g transform="translate(12, -12)">
                      <circle r="9" fill="#991b1b" />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="10">💀</text>
                    </g>
                  )}
                  {hero.isBurned && !hero.isKo && (
                    <g transform="translate(-12, -12)">
                      <circle r="9" fill="#c2410c" />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="10">🌋</text>
                    </g>
                  )}
                  {hero.isThreatened && !hero.isKo && (
                    <g transform="translate(12, 12)">
                      <circle r="9" fill="#d97706" />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="10">🔥</text>
                    </g>
                  )}
                  {hero.block > 0 && !hero.isKo && (
                    <g transform="translate(-12, 12)">
                      <circle r="9" fill="#2563eb" />
                      <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">{hero.block}</text>
                    </g>
                  )}

                  {/* Name Tag below token */}
                  <rect x="-35" y="24" width="70" height="15" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#334155" />
                  <text y="34" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="500">
                    {hero.name.split(' ')[0]} ({hero.hp}HP)
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>
    </div>
  );
}
