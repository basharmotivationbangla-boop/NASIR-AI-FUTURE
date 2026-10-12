import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InventionIdea } from '../types';
import { getInventions, saveInvention, deleteInvention } from '../services/db';
import {
  FlaskConical,
  Atom,
  Code2,
  Cpu,
  Lightbulb,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  Download,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ScienceAndInventionPage: React.FC = () => {
  const { language, addNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'science' | 'code' | 'robotics' | 'inventions'>('science');

  // 1. Science Simulation State (Gravitational Orbit Simulation)
  const [gravityStrength, setGravityStrength] = useState(1.5);
  const [orbitVelocity, setOrbitVelocity] = useState(2.2);
  const [trailLength, setTrailLength] = useState(80);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2. Coding Academy State
  const [codeSnippet, setCodeSnippet] = useState(
    `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #060913; color: #38bdf8; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
    .box { padding: 24px; border: 2px solid #6366f1; border-radius: 16px; background: rgba(30, 27, 75, 0.4); text-align: center; box-shadow: 0 0 25px rgba(99, 102, 241, 0.5); }
    h1 { margin: 0 0 8px; font-size: 24px; }
    p { margin: 0; color: #cbd5e1; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🚀 NASIR AI FUTURE</h1>
    <p>Live Code Sandbox Active</p>
  </div>
</body>
</html>`
  );
  const [codeOutputSrc, setCodeOutputSrc] = useState('');

  // 3. Invention Notebook State
  const [inventions, setInventions] = useState<InventionIdea[]>([]);
  const [selectedInvention, setSelectedInvention] = useState<InventionIdea | null>(null);
  const [isEditingInvention, setIsEditingInvention] = useState(false);

  // Load Inventions
  const loadInventions = async () => {
    const list = await getInventions();
    setInventions(list);
    if (list.length > 0 && !selectedInvention) {
      setSelectedInvention(list[0]);
    }
  };

  useEffect(() => {
    loadInventions();
  }, []);

  // Run Sandbox code into iframe
  const handleRunCode = () => {
    setCodeOutputSrc(codeSnippet);
    addNotification('Code Compiled', 'Live preview sandbox re-rendered.', 'success');
  };

  useEffect(() => {
    handleRunCode();
  }, []);

  // Physics Simulation Animation Frame Loop
  useEffect(() => {
    if (activeTab !== 'science') return;

    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 600;
    canvas.height = 360;

    let planetX = canvas.width / 2 + 120;
    let planetY = canvas.height / 2;
    let vx = 0;
    let vy = orbitVelocity;
    const starX = canvas.width / 2;
    const starY = canvas.height / 2;
    const trails: Array<{ x: number; y: number }> = [];

    let animId: number;

    const render = () => {
      // Background
      ctx.fillStyle = 'rgba(6, 9, 19, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Central Star
      ctx.beginPath();
      ctx.arc(starX, starY, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Physics calculation
      const dx = starX - planetX;
      const dy = starY - planetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = (gravityStrength * 400) / (dist * dist + 10);
      const ax = (dx / dist) * force;
      const ay = (dy / dist) * force;

      vx += ax;
      vy += ay;
      planetX += vx;
      planetY += vy;

      // Store trail
      trails.push({ x: planetX, y: planetY });
      if (trails.length > trailLength) trails.shift();

      // Draw trails
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < trails.length; i++) {
        if (i === 0) ctx.moveTo(trails[i].x, trails[i].y);
        else ctx.lineTo(trails[i].x, trails[i].y);
      }
      ctx.stroke();

      // Orbiting Planet
      ctx.beginPath();
      ctx.arc(planetX, planetY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, gravityStrength, orbitVelocity, trailLength]);

  const handleCreateNewInvention = async () => {
    const newInv: InventionIdea = {
      id: 'inv_' + Date.now(),
      title: 'New Futuristic Invention Concept',
      category: 'CleanTech & AI Hardware',
      problem: 'Formulate the real-world engineering problem statement here...',
      solution: 'Describe your proposed technical mechanism or algorithm...',
      materials: ['Microcontroller (ESP32)', 'Solid-state battery', 'Carbon-fiber chassis'],
      steps: ['Feasibility simulation', 'Schematic modeling', 'Bench testing'],
      testLogs: 'Initial hypothesis benchmarked.',
      status: 'ideation',
      updatedAt: new Date().toISOString(),
    };
    await saveInvention(newInv);
    setInventions([newInv, ...inventions]);
    setSelectedInvention(newInv);
    setIsEditingInvention(true);
    addNotification('Invention Entry Added', 'Ready to document your new patent idea.', 'success');
  };

  const handleSaveInvention = async () => {
    if (!selectedInvention) return;
    await saveInvention(selectedInvention);
    setInventions((prev) =>
      prev.map((item) => (item.id === selectedInvention.id ? selectedInvention : item))
    );
    setIsEditingInvention(false);
    addNotification('Invention Saved', 'Invention documentation saved in local database.', 'success');
  };

  const handleDeleteInvention = async (id: string) => {
    await deleteInvention(id);
    const updated = inventions.filter((i) => i.id !== id);
    setInventions(updated);
    setSelectedInvention(updated[0] || null);
    addNotification('Invention Deleted', 'Entry removed.', 'info');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <FlaskConical className="w-7 h-7 text-teal-400" />
          <span>Science, Coding, Robotics & Invention Lab</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore interactive scientific simulations, write and execute code in real-time, inspect robotics hardware schematics, and file invention patents.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs sm:text-sm font-semibold gap-2 overflow-x-auto">
        {(
          [
            { id: 'science', label: 'Science Academy & Orbit Sim', icon: Atom },
            { id: 'code', label: 'Coding Academy Sandbox', icon: Code2 },
            { id: 'robotics', label: 'Robotics Laboratory', icon: Cpu },
            { id: 'inventions', label: 'Invention & Patent Notebook', icon: Lightbulb },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-teal-400 text-teal-300 bg-slate-900/60 rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Science Academy: Orbital Gravitational Physics Simulation */}
      {activeTab === 'science' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-sky-400" />
                <span>2-Body Gravitational Orbit & Mechanics Simulator</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300">
                Interactive Canvas 60 FPS
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
              <canvas ref={simCanvasRef} className="w-full h-80 block" />
            </div>

            {/* Simulation controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Central Gravity Constant (G)</span>
                  <span className="font-mono text-amber-400">{gravityStrength.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={gravityStrength}
                  onChange={(e) => setGravityStrength(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Orbital Velocity (Vo)</span>
                  <span className="font-mono text-sky-400">{orbitVelocity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={orbitVelocity}
                  onChange={(e) => setOrbitVelocity(parseFloat(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Orbital Trail Length</span>
                  <span className="font-mono text-teal-400">{trailLength} pts</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Atom className="w-4 h-4 text-teal-400" />
              <span>Scientific Principle Guide</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>Newton's Law of Universal Gravitation:</strong> Every particle attracts every other particle with a force proportional to the product of their masses and inversely proportional to the square of the distance between their centers (F = G · (m₁ · m₂) / r²).
              </p>
              <p>
                <strong>Escape Velocity & Circular Velocity:</strong> When velocity reaches equilibrium with central pull, a stable elliptical orbit forms. If velocity exceeds escape threshold (v ≥ √(2GM/r)), the trajectory becomes hyperbolic.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-sky-300 font-mono">
                Tip: Try adjusting gravity to 2.8 and velocity to 3.2 to see how the eccentricity of the orbital path shifts!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Coding Academy: Interactive Live Sandbox */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>Interactive Code Sandbox</span>
              </span>
              <button
                onClick={handleRunCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </button>
            </div>

            <textarea
              rows={14}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div className="lg:col-span-6 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Live Sandboxed Output</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                Sandboxed iFrame
              </span>
            </div>

            <div className="w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
              <iframe
                srcDoc={codeOutputSrc}
                title="Live Code Sandbox"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Robotics Laboratory */}
      {activeTab === 'robotics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-white">LIDAR & Ultrasonic Distance Arrays</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              HC-SR04 ultrasonic sensor operates via 40 kHz acoustic pulse reflection. Equation: Distance (cm) = (Echo Time in µs × 0.0343) / 2.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-sky-300">
              Trigger: 10µs HIGH pulse<br/>Echo: Measure pulseIn(ECHO_PIN, HIGH)
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-white">IMU Gyroscope & Accelerometer (MPU-6050)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides 6-axis motion tracking for balance robots and drone stabilization via I2C interface (SDA/SCL) and complementary filtering.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-300">
              Address: 0x68 / 0x69<br/>Sample rate: 1 kHz Digital Low-Pass
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-white">Brushless Motor & ESC Drivers</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Electronic Speed Controllers (ESC) use 3-phase MOSFET bridge inverter circuits to drive BLDC stator coils synchronously with PWM signals.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-indigo-300">
              Protocol: DShot600 / Oneshot125<br/>PWM Range: 1000µs – 2000µs
            </div>
          </div>
        </div>
      )}

      {/* 4. Invention & Patent Notebook */}
      {activeTab === 'inventions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Inventions */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Filed Concepts ({inventions.length})
              </span>
              <button
                onClick={handleCreateNewInvention}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> + New Idea
              </button>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto">
              {inventions.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvention(inv);
                    setIsEditingInvention(false);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedInvention?.id === inv.id
                      ? 'bg-teal-500/15 border-teal-500/50 text-teal-200'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{inv.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between">
                    <span>{inv.category}</span>
                    <span className="uppercase text-sky-400 font-bold">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Invention Details / Editor */}
          <div className="lg:col-span-8 p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            {selectedInvention ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="min-w-0 pr-2">
                    <input
                      type="text"
                      disabled={!isEditingInvention}
                      value={selectedInvention.title}
                      onChange={(e) =>
                        setSelectedInvention({ ...selectedInvention, title: e.target.value })
                      }
                      className="w-full bg-transparent font-bold text-base text-white focus:outline-none disabled:opacity-90"
                    />
                    <div className="text-[11px] text-teal-400 font-mono">
                      Category: {selectedInvention.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditingInvention ? (
                      <button
                        onClick={handleSaveInvention}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsEditingInvention(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInvention(selectedInvention.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete invention"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Problem Statement
                  </label>
                  <textarea
                    disabled={!isEditingInvention}
                    rows={2}
                    value={selectedInvention.problem}
                    onChange={(e) =>
                      setSelectedInvention({ ...selectedInvention, problem: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 disabled:opacity-80 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Proposed Technical Solution */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Proposed Solution
                  </label>
                  <textarea
                    disabled={!isEditingInvention}
                    rows={3}
                    value={selectedInvention.solution}
                    onChange={(e) =>
                      setSelectedInvention({ ...selectedInvention, solution: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 disabled:opacity-80 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Bill of Materials */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Required Materials / Components
                  </label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedInvention.materials.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-sky-300 font-mono"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Test Observations & Logs */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Experimental Observations & Bench Tests
                  </label>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedInvention.testLogs}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select an invention on the left or create a new patent entry.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
