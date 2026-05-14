import React from 'react';
import Sidebar from './Sidebar';

/**
 * ClientSidebar - thin wrapper around Sidebar
 * 
 * FIXES APPLIED:
 * - Removed duplicate footer prop (wallet card, user info, logout already live in Sidebar.jsx)
 * - Removed inconsistent logoSubtext (Sidebar.jsx controls its own logo rendering)
 */
export default function ClientSidebar(props) {
  return <Sidebar {...props} />;
}
