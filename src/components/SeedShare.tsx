import React, { useState } from 'react';

export interface SeedShareProps { seed?: string; onImport?: (seed: string) => void }

const SeedShare: React.FC<SeedShareProps> = ({ seed, onImport }) => {
  const [input, setInput] = useState('');
  const url = seed ? (typeof window !== 'undefined' ? window.location.href.split('#')[0] + '#seed=' + encodeURIComponent(seed) : '') : '';
  const copy = async () => { if (!url) return; try { await navigator.clipboard.writeText(url); } catch(e) {} };
  return (
    <div aria-label="Seed Share">
      <div>Share URL: <input readOnly value={url} aria-label="Seed URL" /></div>
      <button onClick={copy} disabled={!url}>Copy</button>
      <div>Import: <input value={input} onChange={e=>setInput(e.target.value)} aria-label="Import seed" /></div>
      <button onClick={() => onImport && onImport(input)}>Import</button>
    </div>
  );
};

export default SeedShare;
