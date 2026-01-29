import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type ViewMode = 'delivery' | 'local';

interface ViewModeContextType {
  mode: ViewMode;
  isDeliveryMode: boolean;
  isLocalMode: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
}

export const ViewModeProvider = ({ children }: ViewModeProviderProps) => {
  const location = useLocation();

  const value = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Detect mode based on URL path or query param
    const isLocalPath = location.pathname === '/menu';
    const isLocalParam = searchParams.get('mode') === 'local';
    
    const mode: ViewMode = (isLocalPath || isLocalParam) ? 'local' : 'delivery';
    
    return {
      mode,
      isDeliveryMode: mode === 'delivery',
      isLocalMode: mode === 'local',
    };
  }, [location.pathname, location.search]);

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  
  // Provide default values if context is not available (for components outside provider)
  if (!context) {
    return {
      mode: 'delivery',
      isDeliveryMode: true,
      isLocalMode: false,
    };
  }
  
  return context;
};
