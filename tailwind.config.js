/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
        'interpreter-sidebar': '#064e3b',
        'client-sidebar': '#4c1d95',
        'admin-accent': '#3b82f6',
        'client-accent': '#6C63FF',
        'interpreter-accent': '#10b981',
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