import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-base':    'var(--color-bg-base)',
        'bg-subtle':  'var(--color-bg-subtle)',
        'bg-muted':   'var(--color-bg-muted)',
        'border-base': 'var(--color-border)',
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'status-not-started': 'var(--color-not-started-dot)',
        'status-in-progress': 'var(--color-in-progress-dot)',
        'status-completed':   'var(--color-completed-dot)',
        'status-overdue':     'var(--color-overdue-dot)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        dropdown: '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
      },
    },
  },
} satisfies Config
