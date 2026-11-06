import React, { useState, useEffect } from 'react';
import { KdsTerminalView } from './KdsTerminalView';
import {
  ChefHat,
  Maximize2,
  Minimize2,
  Download,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StandaloneKdsAppProps {
  onBackToErp?: () => void;
}

export const StandaloneKdsApp: React.FC<StandaloneKdsAppProps> = ({ onBackToErp }) => {
  const { tenant } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      setInstallPrompt(null);
    } else {
      alert(
        'To install this Kitchen KDS as an app on this screen / tablet:\n\n1. In Chrome / Edge, tap the 3 dots in the top right.\n2. Tap "Install page as app" or "Add to Home Screen".\n\nIt will open in dedicated fullscreen mode on your kitchen monitor!'
      );
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="kds-shell h-screen w-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans">
      
      {/* Standalone Appliance Control Ribbon */}
      <div className="bg-stone-900/90 border-b border-stone-800/80 px-4 py-1.5 flex items-center justify-between text-xs shrink-0 select-none">
        
        {/* KDS Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center font-display text-xs border border-amber-400/30">
              KDS
            </div>
            <span className="font-bold text-white tracking-tight">
              {tenant?.name || 'Kitchen Display System'}
            </span>
            <span className="text-stone-600">|</span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Station Display Terminal
            </span>
          </div>
        </div>

        {/* Appliance Utilities */}
        <div className="flex items-center gap-2">
          {/* Install to Screen Button */}
          <button
            onClick={handleInstallApp}
            className="py-1 px-3 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
            title="Install this Kitchen Display System as an offline application on this kitchen screen"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Install KDS App</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Touchscreen Fullscreen Mode (F11)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Exit to Web ERP */}
          {onBackToErp && (
            <button
              onClick={onBackToErp}
              className="py-1 px-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
              title="Return to Cloud ERP Management Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to ERP</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Full KDS View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <KdsTerminalView />
      </div>

    </div>
  );
};
