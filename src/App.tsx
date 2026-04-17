import { useState, useMemo, useEffect } from 'react';
import './App.css';
import estimationData from './data/estimationGuide.json';
import { ChatAiService } from './services/ChatAiService';
import type { ChatAiResponse } from './services/ChatAiService';
import { BrainCircuit, CheckCircle2, AlertCircle, Info, Settings, X } from 'lucide-react';

function App() {
  const [jiraDescription, setJiraDescription] = useState('');
  const [aiResponse, setAiResponse] = useState<ChatAiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMultipliers, setActiveMultipliers] = useState<string[]>([]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [tempApiUrl, setTempApiUrl] = useState('');

  useEffect(() => {
    // Load API URL from localStorage on mount
    const savedUrl = ChatAiService.getApiUrl();
    setApiUrl(savedUrl);
    setTempApiUrl(savedUrl);
  }, []);

  const handleSaveApiUrl = () => {
    ChatAiService.setApiUrl(tempApiUrl);
    setApiUrl(tempApiUrl);
    setShowSettings(false);
  };

  const toggleBenchmark = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleMultiplier = (id: string) => {
    setActiveMultipliers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totals = useMemo(() => {
    let min = 0;
    let max = 0;

    selectedIds.forEach(id => {
      const item = estimationData.benchmarks.find(b => b.id === id);
      if (item) {
        min += item.min;
        max += item.max;
      }
    });

    const multiplierTotal = activeMultipliers.reduce((acc, id) => {
      const m = estimationData.multipliers.find(mult => mult.id === id);
      return acc + (m ? m.value : 0);
    }, 0);

    return {
      min: min * (1 + multiplierTotal),
      max: max * (1 + multiplierTotal)
    };
  }, [selectedIds, activeMultipliers]);

  const handleAnalyze = async () => {
    if (!jiraDescription.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await ChatAiService.analyzeJira(jiraDescription);
      setAiResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group benchmarks by category
  const categories = Array.from(new Set(estimationData.benchmarks.map(b => b.category)));

  return (
    <div className="app-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/favicon.svg" alt="Logo" width="32" />
            <h1 style={{ margin: 0, fontSize: '20px' }}>OutSystems Estimation Selector</h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <Settings size={16} /> Settings
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Left Pane: Jira Input & AI */}
        <section className="left-pane">
          <h2><BrainCircuit size={20} color="#2563eb" /> Jira Task Analyzer</h2>
          <div className="jira-input-group">
            <textarea 
              placeholder="Paste Jira task description here (e.g. As a user, I want to see a dashboard of my orders...)"
              value={jiraDescription}
              onChange={(e) => setJiraDescription(e.target.value)}
            />
            <button className="analyze-btn" onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Identify Potential Features'}
            </button>
          </div>

          {error && (
            <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '4px', marginTop: '1rem', fontSize: '14px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {aiResponse && (
            <div className="ai-results">
              <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" /> AI Assumptions
              </h3>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                {aiResponse.output}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px', textAlign: 'right' }}>
                Powered by ChatAI | Model: {aiResponse.model || 'Unknown'}
              </div>
            </div>
          )}
        </section>

        {/* Right Pane: Estimation Guide Checklist */}
        <section className="right-pane">
          <h2><CheckCircle2 size={20} color="#2563eb" /> Estimation Guide Checklist</h2>
          
          {categories.map(category => (
            <div key={category} className="guide-category">
              <div className="category-title">{category}</div>
              <div className="benchmark-list">
                {estimationData.benchmarks.filter(b => b.category === category).map(benchmark => (
                  <div 
                    key={benchmark.id} 
                    className={`benchmark-item ${selectedIds.includes(benchmark.id) ? 'selected' : ''}`}
                    onClick={() => toggleBenchmark(benchmark.id)}
                  >
                    <input type="checkbox" checked={selectedIds.includes(benchmark.id)} readOnly />
                    <div className="benchmark-info">
                      <div className="benchmark-name">
                        {benchmark.task}
                        <span className="effort-badge">
                          {benchmark.min === benchmark.max ? `${benchmark.min}h` : `${benchmark.min}-${benchmark.max}h`}
                        </span>
                      </div>
                      <div className="benchmark-desc">{benchmark.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="multipliers-section">
            <h3 style={{ fontSize: '14px', color: '#1e293b' }}>Complexity Multipliers</h3>
            {estimationData.multipliers.map(multiplier => (
              <label key={multiplier.id} className="multiplier-item" style={{ cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={activeMultipliers.includes(multiplier.id)} 
                  onChange={() => toggleMultiplier(multiplier.id)}
                />
                <div style={{ fontSize: '14px' }}>
                  <strong>{multiplier.name}</strong> 
                  <span style={{ color: '#64748b', marginLeft: '5px' }}>{multiplier.description}</span>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef9c3', borderRadius: '4px', fontSize: '13px', display: 'flex', gap: '10px' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Note:</strong> Estimates include Unit Testing and Peer Review. 
              Add a 10-15% Refactoring Buffer for complex architectures.
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Sum */}
      <footer className="footer-sum">
        <div className="sum-item">
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>SELECTED TASKS</div>
          <div style={{ fontWeight: 'bold' }}>{selectedIds.length} items</div>
        </div>
        <div className="sum-item">
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>TOTAL EFFORT (MIN)</div>
          <div className="sum-value">{totals.min.toFixed(1)} hrs</div>
        </div>
        <div className="sum-item" style={{ borderLeft: '1px solid #475569', paddingLeft: '4rem' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>TOTAL EFFORT (MAX)</div>
          <div className="sum-value" style={{ color: '#93c5fd' }}>{totals.max.toFixed(1)} hrs</div>
        </div>
        <button 
          className="analyze-btn" 
          style={{ background: '#10b981', marginLeft: '2rem' }}
          onClick={() => window.print()}
        >
          Export to PDF
        </button>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>API Configuration</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '14px' }}>
                ChatAI API URL
              </label>
              {apiUrl && (
                <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '0.5rem' }}>
                  ✓ URL currently configured
                </div>
              )}
              <input
                type="text"
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                placeholder="https://dev.outsystems.byte.enterprises/FujitsuChatAI_API/rest/OpenAIWrapper/v1/chat/completions"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '0.5rem' }}>
                This URL will be saved to your browser's local storage
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiUrl}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
