import { useEffect, useRef, useState } from "react";
import { GameState, exportGameState, importGameState } from "../utils/serialize";

export const STORAGE_KEY = "faro.gameState";
const EVENT_NAME = "faro.gameState.changed";

export function saveToLocalStorage(state: GameState) {
  const payload = exportGameState(state, true);
  window.localStorage.setItem(STORAGE_KEY, payload);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }));
}

export function loadFromLocalStorage(): GameState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return importGameState(raw); } catch { return null; }
}

export function subscribePersistence(cb: (state: GameState | null) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail || null);
  window.addEventListener(EVENT_NAME, handler as EventListener);
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
}

export default function usePersistence(initial?: GameState) {
  const [state, setState] = useState<GameState | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) setState(loaded);
    else if (initial) setState(initial);
    mounted.current = true;

    const unsub = subscribePersistence(s => setState(s));
    return () => { unsub(); };
  }, []);

  const save = (newState: GameState) => {
    setState(newState);
    saveToLocalStorage(newState);
  };

  const load = (): GameState | null => {
    const s = loadFromLocalStorage();
    setState(s);
    return s;
  };

  return { state, save, load, subscribe: subscribePersistence };
}
