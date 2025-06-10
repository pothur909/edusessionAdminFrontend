'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface ZoomConfig {
  leaveUrl: string;
  success: () => void;
  error: (error: Error) => void;
}

interface JoinConfig {
  signature: string;
  sdkKey: string;
  meetingNumber: string;
  passWord: string;
  userName: string;
  userEmail: string;
  success: () => void;
  error: (error: Error) => void;
}

interface ZoomMtgType {
  setZoomJSLib: (path: string, dir: string) => Promise<void>;
  preLoadWasm: () => Promise<void>;
  init: (config: ZoomConfig) => void;
  join: (config: JoinConfig) => void;
}

declare global {
  interface Window {
    ZoomMtg: ZoomMtgType;
  }
}

export default function ZoomPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [landscapePrompt, setLandscapePrompt] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing...');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Debug logging function
  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  const loadZoomSDK = async () => {
    try {
      addDebugLog('Starting Zoom SDK initialization...');
  
      // Load Zoom CSS
      const cssLinks = [
        'https://source.zoom.us/2.18.0/css/bootstrap.css',
        'https://source.zoom.us/2.18.0/css/react-select.css'
      ];
  
      cssLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      });
  
      // Load dependencies first
      const dependencies = [
        'https://source.zoom.us/2.18.0/lib/vendor/react.min.js',
        'https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js',
        'https://source.zoom.us/2.18.0/lib/vendor/redux.min.js',
        'https://source.zoom.us/2.18.0/lib/vendor/redux-thunk.min.js',
        'https://source.zoom.us/2.18.0/lib/vendor/lodash.min.js'
      ];
  
      for (const src of dependencies) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = false; // important to preserve order
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            addDebugLog(`Loaded dependency: ${src}`);
            resolve();
          };
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      }
  
      // Load Zoom SDK after dependencies
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://source.zoom.us/2.18.0/zoom-meeting-embedded-2.18.0.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          addDebugLog('Main Zoom SDK loaded');
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load main SDK'));
        document.head.appendChild(script);
      });
  
      // Wait for SDK to attach
      for (let i = 0; i < 30; i++) {
        if (window.ZoomMtg && typeof window.ZoomMtg.setZoomJSLib === 'function') {
          addDebugLog('ZoomMtg is available and properly initialized');
          setSdkLoaded(true);
          return true;
        }
        await new Promise(res => setTimeout(res, 500));
        if (i % 5 === 0) addDebugLog(`Waiting for ZoomMtg to initialize... (Attempt ${i + 1}/30)`);
      }
  
      throw new Error('ZoomMtg not available after maximum attempts');
    } catch (error) {
      addDebugLog(`Error loading Zoom SDK: ${error}`);
      setError(`Failed to initialize Zoom SDK: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
      return false;
    }
  };
  

  const initializeZoom = async () => {
    try {
      addDebugLog('Starting Zoom initialization...');
      setLoadingStep('Checking Zoom SDK...');
      
      if (!window.ZoomMtg) {
        throw new Error('Zoom SDK not loaded');
      }

      // Check if SDK methods are available
      if (typeof window.ZoomMtg.setZoomJSLib !== 'function') {
        throw new Error('Zoom SDK not properly loaded - missing setZoomJSLib method');
      }

      addDebugLog('Zoom SDK verification passed');
      setLoadingStep('Setting up Zoom libraries...');
      
      try {
        await window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
        addDebugLog('Zoom JS Lib set successfully');
      } catch (libError) {
        throw new Error(`Failed to set Zoom JS Lib: ${libError}`);
      }
      
      setLoadingStep('Loading WebAssembly modules...');
      try {
        await window.ZoomMtg.preLoadWasm();
        addDebugLog('WASM preloaded successfully');
      } catch (wasmError) {
        throw new Error(`Failed to preload WASM: ${wasmError}`);
      }

      // Create Meeting
      setLoadingStep('Creating meeting room...');
      addDebugLog('Creating meeting via API...');
      
      let createData;
      try {
        const response = await axios.post('http://localhost:6969/api/zoom/instant', {
          topic: 'Learning App Class',
        });
        createData = response.data;
        addDebugLog(`Meeting created: ${createData.data.id}`);
      } catch (apiError) {
        throw new Error(`Failed to create meeting: ${apiError instanceof Error ? apiError.message : 'API Error'}`);
      }

      const meetingData = createData.data;
      if (!meetingData.id || !meetingData.password) {
        throw new Error('Missing required meeting data (id or password)');
      }

      const meetingNumber = meetingData.id.toString();
      const password = meetingData.password;
      addDebugLog(`Meeting details - ID: ${meetingNumber}, Password: ${password}`);

      // Get signature
      setLoadingStep('Generating meeting signature...');
      addDebugLog('Requesting signature from server...');
      
      let sigData;
      try {
        const response = await axios.post('/api/zoom', {
          meetingNumber,
          role: 0,
        });
        sigData = response.data;
        addDebugLog('Signature received successfully');
      } catch (sigError) {
        throw new Error(`Failed to get signature: ${sigError instanceof Error ? sigError.message : 'Signature Error'}`);
      }

      if (!sigData.signature) {
        throw new Error('Server returned empty signature');
      }

      const signature = sigData.signature;
      const sdkKey = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY;

      if (!sdkKey) {
        throw new Error('Missing NEXT_PUBLIC_ZOOM_SDK_KEY environment variable');
      }

      // Initialize and join meeting
      setLoadingStep('Initializing Zoom meeting...');
      addDebugLog('Initializing Zoom meeting with config...');
      
      const initConfig: ZoomConfig = {
        leaveUrl: window.location.origin,
        success: () => {
          addDebugLog('Zoom initialized successfully, attempting to join...');
          setLoadingStep('Joining meeting...');
          
          const joinConfig: JoinConfig = {
            signature,
            sdkKey,
            meetingNumber,
            passWord: password,
            userName: 'Student',
            userEmail: 'student@example.com',
            success: () => {
              addDebugLog('Meeting joined successfully');
              setLoading(false);
            },
            error: (error: Error) => {
              addDebugLog(`Join error: ${error.message}`);
              setError(`Failed to join meeting: ${error.message}`);
              setLoading(false);
            },
          };

          addDebugLog(`Joining meeting ${meetingNumber}`);
          window.ZoomMtg.join(joinConfig);
        },
        error: (error: Error) => {
          addDebugLog(`Init error: ${error.message}`);
          setError(`Failed to initialize Zoom: ${error.message}`);
          setLoading(false);
        },
      };

      addDebugLog('Calling ZoomMtg.init...');
      window.ZoomMtg.init(initConfig);

    } catch (err) {
      addDebugLog(`Zoom initialization error: ${err}`);
      setError(err instanceof Error ? err.message : 'Failed to initialize Zoom');
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const loaded = await loadZoomSDK();
      if (loaded) {
        await initializeZoom();
      }
    };
    init();
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setLandscapePrompt(!isLandscape);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const retryConnection = () => {
    setError(null);
    setLoading(true);
    setLoadingStep('Retrying...');
    setDebugInfo([]);
    addDebugLog('Retrying connection...');
    window.location.reload();
  };

  const toggleDebug = () => {
    const debugElement = document.getElementById('debug-info');
    if (debugElement) {
      debugElement.style.display = debugElement.style.display === 'none' ? 'block' : 'none';
    }
  };

  return (
    <div className="h-screen w-screen bg-black relative">
      {landscapePrompt && (
        <div className="absolute inset-0 z-50 bg-black text-white flex items-center justify-center text-center px-4">
          <div className="max-w-md">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-lg">
              Please rotate your phone to <strong>landscape mode</strong> for the best experience.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center text-white bg-black bg-opacity-90">
          <div className="text-center max-w-md px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting to Zoom</h2>
            <p className="text-gray-300">{loadingStep}</p>
            <div className="mt-4 text-sm text-gray-400">
              This may take a few moments...
            </div>
            <button 
              onClick={toggleDebug}
              className="mt-4 text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Show Debug Info
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center text-white bg-black bg-opacity-90">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-4 text-red-400">Connection Failed</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={retryConnection}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors mr-4"
            >
              Try Again
            </button>
            <button 
              onClick={toggleDebug}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
            >
              Debug Info
            </button>
            <div className="mt-4 text-sm text-gray-400">
              If the problem persists, please check your internet connection.
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      <div 
        id="debug-info" 
        className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md max-h-64 overflow-y-auto text-xs z-30"
        style={{ display: 'none' }}
      >
        <h3 className="font-bold mb-2">Debug Log:</h3>
        {debugInfo.map((log, index) => (
          <div key={index} className="mb-1 font-mono">{log}</div>
        ))}
      </div>

      {/* Zoom Meeting Container */}
      <div id="zmmtg-root" className="w-full h-full" />
    </div>
  );
}