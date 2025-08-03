import { Theme, ThemeConfig } from '../types';

export const defaultThemes: Omit<Theme, 'id' | 'uid' | 'createdAt'>[] = [
  {
    name: 'classic',
    displayName: 'Classic Elegance',
    description: 'Timeless design with warm colors and traditional typography',
    active: true,
    preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        accent: '#CD853F',
        background: '#FFF8DC',
        surface: '#FFFFFF',
        text: '#2C1810',
        textSecondary: '#6B4423'
      },
      typography: {
        fontFamily: 'Georgia, serif',
        headingFont: 'Playfair Display, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.375rem',
        spacing: '1rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'classic',
          transparent: false
        },
        buttons: {
          style: 'rounded'
        },
        cards: {
          shadow: 'md',
          border: true
        }
      }
    }
  },
  {
    name: 'modern',
    displayName: 'Modern Minimalist',
    description: 'Clean, contemporary design with bold typography and vibrant colors',
    active: true,
    preview: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        accent: '#FFD23F',
        background: '#FAFAFA',
        surface: '#FFFFFF',
        text: '#1A1A1A',
        textSecondary: '#666666'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Poppins, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.5rem',
        spacing: '1.5rem',
        maxWidth: '1400px'
      },
      components: {
        header: {
          style: 'modern',
          transparent: true
        },
        buttons: {
          style: 'pill'
        },
        cards: {
          shadow: 'lg',
          border: false
        }
      }
    }
  },
  {
    name: 'rustic',
    displayName: 'Rustic Charm',
    description: 'Warm, earthy tones with natural textures and cozy atmosphere',
    active: true,
    preview: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#8B4513',
        secondary: '#A0522D',
        accent: '#DEB887',
        background: '#F5F5DC',
        surface: '#FFFEF7',
        text: '#3C2415',
        textSecondary: '#8B7355'
      },
      typography: {
        fontFamily: 'Merriweather, serif',
        headingFont: 'Cabin, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.25rem',
        spacing: '1.25rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'classic',
          transparent: false
        },
        buttons: {
          style: 'square'
        },
        cards: {
          shadow: 'sm',
          border: true
        }
      }
    }
  },
  {
    name: 'luxury',
    displayName: 'Luxury Gold',
    description: 'Sophisticated design with gold accents and premium feel',
    active: true,
    preview: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#B8860B',
        secondary: '#DAA520',
        accent: '#FFD700',
        background: '#1A1A1A',
        surface: '#2D2D2D',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC'
      },
      typography: {
        fontFamily: 'Cormorant Garamond, serif',
        headingFont: 'Cinzel, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.125rem',
        spacing: '2rem',
        maxWidth: '1600px'
      },
      components: {
        header: {
          style: 'minimal',
          transparent: true
        },
        buttons: {
          style: 'square'
        },
        cards: {
          shadow: 'lg',
          border: false
        }
      }
    }
  },
  {
    name: 'fresh',
    displayName: 'Fresh & Green',
    description: 'Natural, eco-friendly design with green tones and organic feel',
    active: true,
    preview: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#228B22',
        secondary: '#32CD32',
        accent: '#90EE90',
        background: '#F0FFF0',
        surface: '#FFFFFF',
        text: '#2F4F2F',
        textSecondary: '#556B2F'
      },
      typography: {
        fontFamily: 'Nunito, sans-serif',
        headingFont: 'Quicksand, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '1rem',
        spacing: '1.5rem',
        maxWidth: '1300px'
      },
      components: {
        header: {
          style: 'modern',
          transparent: false
        },
        buttons: {
          style: 'pill'
        },
        cards: {
          shadow: 'md',
          border: false
        }
      }
    }
  },
  {
    name: 'ocean',
    displayName: 'Ocean Blue',
    description: 'Calming blue tones inspired by the sea with flowing design',
    active: true,
    preview: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#1E90FF',
        secondary: '#4169E1',
        accent: '#87CEEB',
        background: '#F0F8FF',
        surface: '#FFFFFF',
        text: '#191970',
        textSecondary: '#4682B4'
      },
      typography: {
        fontFamily: 'Open Sans, sans-serif',
        headingFont: 'Montserrat, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.75rem',
        spacing: '1.25rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'modern',
          transparent: true
        },
        buttons: {
          style: 'rounded'
        },
        cards: {
          shadow: 'md',
          border: false
        }
      }
    }
  },
  {
    name: 'sunset',
    displayName: 'Sunset Warmth',
    description: 'Warm sunset colors with gradient effects and cozy ambiance',
    active: true,
    preview: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#FF4500',
        secondary: '#FF6347',
        accent: '#FFA500',
        background: '#FFF8DC',
        surface: '#FFFFFF',
        text: '#8B4513',
        textSecondary: '#CD853F'
      },
      typography: {
        fontFamily: 'Lato, sans-serif',
        headingFont: 'Oswald, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.5rem',
        spacing: '1.75rem',
        maxWidth: '1300px'
      },
      components: {
        header: {
          style: 'classic',
          transparent: false
        },
        buttons: {
          style: 'rounded'
        },
        cards: {
          shadow: 'lg',
          border: true
        }
      }
    }
  },
  {
    name: 'ocean',
    displayName: 'Ocean Breeze',
    description: 'Cool blues and aqua tones perfect for seafood restaurants',
    active: true,
    preview: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#06B6D4',
        accent: '#67E8F9',
        background: '#F0F9FF',
        surface: '#FFFFFF',
        text: '#0C4A6E',
        textSecondary: '#0369A1'
      },
      typography: {
        fontFamily: 'Nunito, sans-serif',
        headingFont: 'Poppins, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '1rem',
        spacing: '1rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'clean',
          transparent: true
        },
        buttons: {
          style: 'pill'
        },
        cards: {
          shadow: 'medium',
          border: false
        }
      }
    }
  },
  {
    name: 'forest',
    displayName: 'Forest Garden',
    description: 'Natural greens and earth tones for organic and farm-to-table restaurants',
    active: true,
    preview: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        accent: '#6EE7B7',
        background: '#F0FDF4',
        surface: '#FFFFFF',
        text: '#064E3B',
        textSecondary: '#047857'
      },
      typography: {
        fontFamily: 'Source Sans Pro, sans-serif',
        headingFont: 'Merriweather, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.5rem',
        spacing: '1rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'natural',
          transparent: false
        },
        buttons: {
          style: 'organic'
        },
        cards: {
          shadow: 'soft',
          border: true
        }
      }
    }
  },
  {
    name: 'midnight',
    displayName: 'Midnight Luxury',
    description: 'Dark and sophisticated theme for upscale dining establishments',
    active: true,
    preview: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#7C3AED',
        secondary: '#A855F7',
        accent: '#C4B5FD',
        background: '#0F0F23',
        surface: '#1E1B4B',
        text: '#E2E8F0',
        textSecondary: '#CBD5E1'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingFont: 'Playfair Display, serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.5rem',
        spacing: '1rem',
        maxWidth: '1200px'
      },
      components: {
        header: {
          style: 'luxury',
          transparent: true
        },
        buttons: {
          style: 'elegant'
        },
        cards: {
          shadow: 'large',
          border: false
        }
      }
    }
  },
  {
    name: 'rustic',
    displayName: 'Rustic Charm',
    description: 'Earthy browns and warm textures for country-style restaurants',
    active: true,
    preview: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#92400E',
        secondary: '#B45309',
        accent: '#FCD34D',
        background: '#FFFBEB',
        surface: '#FFFFFF',
        text: '#451A03',
        textSecondary: '#78350F'
      },
      typography: {
        fontFamily: 'Libre Baskerville, serif',
        headingFont: 'Fredoka One, cursive',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.375rem',
        spacing: '1rem',
        maxWidth: '1180px'
      },
      components: {
        header: {
          style: 'rustic',
          transparent: false
        },
        buttons: {
          style: 'handcrafted'
        },
        cards: {
          shadow: 'soft',
          border: true
        }
      }
    }
  },
  {
    name: 'neon',
    displayName: 'Neon Nights',
    description: 'Electric colors and modern design for trendy nightlife venues',
    active: true,
    preview: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    config: {
      colors: {
        primary: '#EC4899',
        secondary: '#F59E0B',
        accent: '#10B981',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#D1D5DB'
      },
      typography: {
        fontFamily: 'Orbitron, monospace',
        headingFont: 'Exo 2, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      layout: {
        borderRadius: '0.25rem',
        spacing: '1rem',
        maxWidth: '1400px'
      },
      components: {
        header: {
          style: 'futuristic',
          transparent: false
        },
        buttons: {
          style: 'neon'
        },
        cards: {
          shadow: 'glow',
          border: true
        }
      }
    }
  }
];

export const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
  // Apply CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--heading-font', theme.typography.headingFont || theme.typography.fontFamily);
  root.style.setProperty('--border-radius', theme.layout.borderRadius);
  root.style.setProperty('--spacing', theme.layout.spacing);
  root.style.setProperty('--max-width', theme.layout.maxWidth);
};

export const getThemeCSS = (theme: ThemeConfig): string => {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      
      --font-family: ${theme.typography.fontFamily};
      --heading-font: ${theme.typography.headingFont || theme.typography.fontFamily};
      
      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      --font-size-3xl: ${theme.typography.fontSize['3xl']};
      
      --border-radius: ${theme.layout.borderRadius};
      --spacing: ${theme.layout.spacing};
      --max-width: ${theme.layout.maxWidth};
    }
    
    body {
      font-family: var(--font-family);
      background-color: var(--color-background);
      color: var(--color-text);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--heading-font);
    }
    
    .btn-primary {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    .btn-secondary {
      background-color: var(--color-secondary);
      border-color: var(--color-secondary);
    }
    
    .card {
      background-color: var(--color-surface);
      border-radius: var(--border-radius);
    }
    
    .header {
      background-color: ${theme.components.header.transparent ? 'transparent' : 'var(--color-surface)'};
    }
  `;
};
