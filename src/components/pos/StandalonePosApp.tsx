import React from 'react';
import { PosTerminalView } from './PosTerminalView';
import { useAuth } from '../../context/AuthContext';

export const StandalonePosApp: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="pos-shell h-screen w-screen flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans">
      <PosTerminalView onSignOut={logout} />
    </div>
  );
};
