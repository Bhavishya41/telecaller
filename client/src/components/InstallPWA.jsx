import React, { useEffect, useState } from 'react';

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      console.log('we are being triggered :D');
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setSupportsPWA(false);
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm w-full mx-4">
        <div className="bg-zinc-800 p-3 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 12H8"/><path d="M12 8v8"/></svg>
        </div>
        <div className="flex-1">
            <h4 className="text-white font-medium text-sm">Install App</h4>
            <p className="text-zinc-400 text-xs">Add to Home Screen for quick access</p>
        </div>
        <button 
            onClick={onClick}
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
        >
            Install
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
