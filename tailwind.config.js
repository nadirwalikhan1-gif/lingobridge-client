/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  
  safelist: [
    // Interpreter colors
    'bg-interpreter-sidebar',
    'bg-interpreter-accent',
    'text-interpreter-accent',
    'border-interpreter-accent',
    'bg-interpreter-accent/10',
    'bg-interpreter-accent/20',
    'hover:bg-interpreter-accent/10',
    'hover:bg-interpreter-accent/20',
    'hover:text-interpreter-accent',
    'focus:ring-interpreter-accent',
    'ring-interpreter-accent',
    
    // Client colors
    'bg-client-sidebar',
    'bg-client-accent',
    'text-client-accent',
    'border-client-accent',
    'bg-client-accent/10',
    'bg-client-accent/20',
    'hover:bg-client-accent/10',
    'hover:bg-client-accent/20',
    'hover:text-client-accent',
    'focus:ring-client-accent',
    'ring-client-accent',
    
    // Admin colors
    'bg-admin-sidebar',
    'bg-admin-accent',
    'text-admin-accent',
    'border-admin-accent',
    'bg-admin-accent/10',
    'bg-admin-accent/20',
    'hover:bg-admin-accent/10',
    'hover:bg-admin-accent/20',
    'hover:text-admin-accent',
    'focus:ring-admin-accent',
    'ring-admin-accent',
    
    // Lb colors
    'bg-lb-primary',
    'text-lb-primary',
    'bg-lb-deep',
    'text-lb-deep',
    'bg-lb-sidebar',
    'text-lb-sidebar',
    'bg-lb-bg',
    'text-lb-bg',
    'bg-lb-card',
    'text-lb-card',
    'bg-lb-border',
    'text-lb-border',
    'bg-lb-border-light',
    'text-lb-border-light',
    'bg-lb-text',
    'text-lb-text',
    'bg-lb-text-secondary',
    'text-lb-text-secondary',
    'bg-lb-text-muted',
    'text-lb-text-muted',
    
    // NEW: lb-ink tokens
    'bg-lb-ink',
    'text-lb-ink',
    'bg-lb-muted',
    'text-lb-muted',
    'bg-lb-subtle',
    'text-lb-subtle',
    'bg-lb-surface',
    'text-lb-surface',
    'bg-lb-border',
    'text-lb-border',
    
    // Opacity utilities
    'bg-opacity-10',
    'bg-opacity-20',
    'bg-opacity-50',
    'bg-opacity-75',
    
    // Common dynamic combinations
    'animate-ping',
  ],

  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1920px',
    },
    extend: {
      spacing: {
        sidebar: '215px',
        'sidebar-collapsed': '64px',
        summary: '300px',
        topbar: '56px',
        bottomnav: '56px',
        bottombar: '60px',
        'section-gap': '12px',
      },
      colors: {
        'lb-primary': '#6C2BFF',
        'lb-deep': '#5B21F5',
        'lb-sidebar': '#13114A',
        'lb-bg': '#F7F8FC',
        'lb-card': '#FFFFFF',
        'lb-border': '#E8EAF2',
        'lb-border-light': '#ECECF2',
        'lb-text': '#111827',
        'lb-text-secondary': '#6B7280',
        'lb-text-muted': '#6E7191',
        'admin-sidebar': '#1e293b',
        'interpreter-sidebar': '#4c1d95',
        'client-sidebar': '#4c1d95',
        'admin-accent': '#3b82f6',
        'client-accent': '#6C63FF',
        'interpreter-accent': '#7c3aed',
        
        // NEW: LingoBridge Interpreter tokens
        'lb-ink':    '#2C2C2A',
        'lb-muted':  '#888780',
        'lb-subtle': '#B4B2A9',
        'lb-surface': '#F1EFE8',
        'lb-border-custom': 'rgba(0,0,0,0.12)',
      },
      boxShadow: {
        'lb-card': '0 2px 10px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        'lb-card': '18px',
        'lb-button': '14px',
      },
    },
  },
  plugins: [],
}