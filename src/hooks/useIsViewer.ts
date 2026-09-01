// src/hooks/useIsViewer.ts
import { useAuth } from './useAuth';
export const useIsViewer = () => useAuth().user?.adminRole === 'Viewer';