import React from 'react';

type Props = {
  seed?: string;
  setSeed?: (s: string) => void;
  onClearSaved?: () => void;
  onImportFile?: (file: File | null) => void;
};

export default function SeedControls({ seed = '', setSeed = () => {}, onClearSaved = () => {}, onImportFile = () => {} }: Props) {
  return (
    <section className="seed-controls" aria-label="seed controls">
      <label className="seed-label">Seed:
        <input id="seed" aria-label="Seed input" value={seed} onChange={e => setSeed(e.target.value)} className="seed-input" data-testid="seed-input" />
      </label>
      <button aria-label="Generate new seed" onClick={() => setSeed(seed + '-' + Date.now())} className="seed-button" data-testid="new-seed-button">New Seed</button>
      <button aria-label="Reset to demo seed" onClick={() => { setSeed('demo-seed-1'); }} className="seed-button" data-testid="reset-seed-button">Reset to Demo Seed</button>
      <button aria-label="Clear saved" onClick={onClearSaved} className="seed-button" data-testid="clear-saved-button">Clear Saved</button>
      <label htmlFor="faro-import-file" className="import-label">Import JSON
        <input
          id="faro-import-file"
          type="file"
          accept="application/json"
          onChange={e => onImportFile(e.target.files ? e.target.files[0] : null)}
          className="import-input"
          data-testid="faro-import-input"
        />
      </label>
    </section>
  );
}
