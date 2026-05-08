import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { AiPanelMode } from '@rapid-cmi5/react-editor';
import { detectIsElectron } from '../utils/appType';

interface AppUiContextType {
  isElectron: boolean;
  aiOpen: boolean;
  terminalOpen: boolean;
  aiThinking: boolean;
  openAiPanel: (mode?: AiPanelMode) => void;
  closeAiPanel: () => void;
  toggleAiPanel: () => void;
  toggleTerminalPanel: () => void;
  setTerminalOpen: (open: boolean) => void;
  setAiThinking: (thinking: boolean) => void;
}

const noop = () => {
  return;
};

export const AppUiContext = createContext<AppUiContextType>({
  isElectron: false,
  aiOpen: false,
  terminalOpen: false,
  aiThinking: false,
  openAiPanel: noop,
  closeAiPanel: noop,
  toggleAiPanel: noop,
  toggleTerminalPanel: noop,
  setTerminalOpen: noop,
  setAiThinking: noop,
});

export function useAppUi() {
  return useContext(AppUiContext);
}

interface AppUiProviderProps {
  children: ReactNode;
}

export function AppUiProvider({ children }: AppUiProviderProps) {
  const isElectron = detectIsElectron();
  const [aiOpen, setAiOpen] = useState(false);
  const [terminalOpenState, setTerminalOpenState] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const openAiPanel = useCallback((_mode?: AiPanelMode) => {
    setTerminalOpenState(false);
    setAiOpen(true);
  }, []);

  const closeAiPanel = useCallback(() => {
    setAiOpen(false);
  }, []);

  const toggleAiPanel = useCallback(() => {
    setAiOpen((open) => {
      if (open) {
        return false;
      }

      setTerminalOpenState(false);
      return true;
    });
  }, []);

  const setTerminalOpen = useCallback((open: boolean) => {
    if (open) {
      setAiOpen(false);
    }
    setTerminalOpenState(open);
  }, []);

  const toggleTerminalPanel = useCallback(() => {
    setTerminalOpenState((open) => {
      if (open) {
        return false;
      }

      setAiOpen(false);
      return true;
    });
  }, []);

  const value = useMemo(
    () => ({
      isElectron,
      aiOpen,
      terminalOpen: terminalOpenState,
      aiThinking,
      openAiPanel,
      closeAiPanel,
      toggleAiPanel,
      toggleTerminalPanel,
      setTerminalOpen,
      setAiThinking,
    }),
    [
      isElectron,
      aiOpen,
      terminalOpenState,
      aiThinking,
      openAiPanel,
      closeAiPanel,
      toggleAiPanel,
      toggleTerminalPanel,
      setTerminalOpen,
    ],
  );

  return (
    <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>
  );
}
