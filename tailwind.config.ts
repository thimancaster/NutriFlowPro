
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        nutri: {
          'green-light': '#4ade80',
          'green': '#22c55e',
          'green-dark': '#16a34a',
          'blue-light': '#60a5fa',
          'blue': '#3b82f6',
          'blue-dark': '#2563eb',
          'teal': '#0d9488',
          'gray-light': '#f1f5f9',
          'gray': '#94a3b8',
          'gray-dark': '#64748b',
          'premium-yellow': '#fbbf24',
          'premium-gold': '#f59e0b',
        },
        // Paleta refinada para modo escuro - tons mais suaves e harmoniosos
        'dark': {
          'bg': {
            'primary': '#0a0a0b',        // Fundo principal mais profundo
            'secondary': '#111114',      // Fundo secundário mais sutil
            'card': '#161619',           // Cards com contraste suave
            'elevated': '#1c1c20',       // Elementos elevados
            'surface': '#232327',        // Superfícies interativas
            'overlay': '#2a2a2f',        // Overlays e modais
          },
          'border': {
            'primary': '#2d2d32',        // Bordas principais mais visíveis
            'secondary': '#38383e',      // Bordas secundárias
            'subtle': '#242429',         // Bordas sutis
            'accent': '#404049',         // Bordas com destaque
          },
          'text': {
            'primary': '#ffffff',        // Texto principal - branco puro
            'secondary': '#e4e4e7',      // Texto secundário - quase branco
            'muted': '#a1a1aa',          // Texto desbotado mais legível
            'subtle': '#71717a',         // Texto sutil
            'placeholder': '#52525b',    // Placeholders
            'disabled': '#3f3f46',       // Texto desabilitado
          },
          'accent': {
            'green': '#22d3aa',          // Verde mais vibrante para modo escuro
            'blue': '#3b82f6',           // Azul mantido
            'yellow': '#fbbf24',         // Amarelo premium
            'red': '#ef4444',            // Vermelho para alertas
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'pulse-soft': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.8'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-5px)'
          }
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-200% 0'
          },
          '100%': {
            backgroundPosition: '200% 0'
          }
        },
        'slide-in-from-top': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'slide-in-from-bottom': {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(34, 211, 170, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(34, 211, 170, 0.5)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite'
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 211, 170, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(34, 211, 170, 0.1)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.6)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'dark-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'dark-glow': '0 0 20px rgba(34, 211, 170, 0.4)',
        'dark-glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
