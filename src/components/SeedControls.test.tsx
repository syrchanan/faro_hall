import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SeedControls from './SeedControls';

describe('SeedControls', () => {
  test('renders seed input and buttons and calls handlers', () => {
    const setSeed = jest.fn();
    const onClearSaved = jest.fn();
    const onImportFile = jest.fn();

    const { getByTestId, getByLabelText } = render(
      <SeedControls seed="initial" setSeed={setSeed} onClearSaved={onClearSaved} onImportFile={onImportFile} />
    );

    const seedInput = getByTestId('seed-input') as HTMLInputElement;
    expect(seedInput.value).toBe('initial');

    const resetBtn = getByTestId('reset-seed-button');
    fireEvent.click(resetBtn);
    expect(setSeed).toHaveBeenCalledWith('demo-seed-1');

    const clearBtn = getByTestId('clear-saved-button');
    fireEvent.click(clearBtn);
    expect(onClearSaved).toHaveBeenCalled();

    const fileInput = getByTestId('faro-import-input') as HTMLInputElement;
    const file = new File([JSON.stringify({ test: true })], 'test.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onImportFile).toHaveBeenCalled();
  });
});
