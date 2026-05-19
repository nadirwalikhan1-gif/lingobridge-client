// This file is a re-export shim.
// The real AuthProvider and useAuth live in src/providers/AuthProvider.jsx.
// All imports across the codebase that point here resolve to the real implementation.
export { AuthProvider, useAuth } from '../providers/AuthProvider';
