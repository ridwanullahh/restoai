import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Eye, 
  Save, 
  RefreshCw, 
  Copy, 
  Check,
  Paintbrush,
  Droplet,
  Sparkles
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { applyTheme } from '../../lib/themes';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface BrandSettings {
  colors: BrandColors;
  logo?: string;
  favicon?: string;
  customCSS?: string;
}

const BrandManagementPage: React.FC = () => {
  const { currentRestaurant, updateRestaurant } = useRestaurant();
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: '#F97316',
    secondary: '#FB923C',
    accent: '#FED7AA',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280'
  });
  const [originalColors, setOriginalColors] = useState<BrandColors | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  useEffect(() => {
    loadBrandSettings();
  }, [currentRestaurant]);

  const loadBrandSettings = async () => {
    try {
      setLoading(true);
      
      if (currentRestaurant?.settings?.brand?.colors) {
        const colors = currentRestaurant.settings.brand.colors;
        setBrandColors(colors);
        setOriginalColors(colors);
      } else {
        // Use current theme colors as default
        const currentTheme = currentRestaurant?.settings?.theme;
        if (currentTheme?.config?.colors) {
          const themeColors = currentTheme.config.colors;
          setBrandColors(themeColors);
          setOriginalColors(themeColors);
        }
      }
    } catch (error) {
      console.error('Failed to load brand settings:', error);
      toast.error('Failed to load brand settings');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (colorKey: keyof BrandColors, value: string) => {
    const newColors = {
      ...brandColors,
      [colorKey]: value
    };
    setBrandColors(newColors);
    
    // Apply preview if in preview mode
    if (previewMode) {
      applyBrandColors(newColors);
    }
  };

  const applyBrandColors = (colors: BrandColors) => {
    const root = document.documentElement;
    
    // Apply brand colors as CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--brand-${key}`, value);
      root.style.setProperty(`--color-${key}`, value); // Override theme colors
    });
  };

  const handlePreviewToggle = () => {
    if (previewMode) {
      // Exit preview mode - restore original colors
      if (originalColors) {
        applyBrandColors(originalColors);
      }
      setPreviewMode(false);
    } else {
      // Enter preview mode - apply current colors
      applyBrandColors(brandColors);
      setPreviewMode(true);
    }
  };

  const handleSave = async () => {
    if (!currentRestaurant) return;
    
    setSaving(true);
    
    try {
      // Update restaurant settings with brand colors
      const updatedSettings = {
        ...currentRestaurant.settings,
        brand: {
          ...currentRestaurant.settings?.brand,
          colors: brandColors
        }
      };
      
      await sdk.update('restaurants', currentRestaurant.id, {
        settings: updatedSettings,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      await updateRestaurant({
        ...currentRestaurant,
        settings: updatedSettings
      });
      
      setOriginalColors(brandColors);
      
      // Apply colors permanently
      applyBrandColors(brandColors);
      
      toast.success('Brand colors saved successfully!');
    } catch (error) {
      console.error('Failed to save brand colors:', error);
      toast.error('Failed to save brand colors');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalColors) {
      setBrandColors(originalColors);
      if (previewMode) {
        applyBrandColors(originalColors);
      }
    }
  };

  const copyColorToClipboard = async (color: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(colorName);
      toast.success(`${colorName} color copied to clipboard!`);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      toast.error('Failed to copy color');
    }
  };

  const generateColorPalette = () => {
    // Generate a harmonious color palette based on the primary color
    const primary = brandColors.primary;
    
    // Simple color generation logic (in a real app, you'd use a proper color library)
    const hsl = hexToHsl(primary);
    
    const newColors: BrandColors = {
      primary: primary,
      secondary: hslToHex((hsl.h + 30) % 360, hsl.s, Math.max(hsl.l - 10, 10)),
      accent: hslToHex((hsl.h + 60) % 360, Math.max(hsl.s - 20, 20), Math.min(hsl.l + 20, 90)),
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: hsl.l > 50 ? '#111827' : '#F9FAFB',
      textSecondary: hsl.l > 50 ? '#6B7280' : '#D1D5DB'
    };
    
    setBrandColors(newColors);
    if (previewMode) {
      applyBrandColors(newColors);
    }
    
    toast.success('Color palette generated!');
  };

  // Helper functions for color conversion
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const colorFields: Array<{
    key: keyof BrandColors;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'primary',
      label: 'Primary Color',
      description: 'Main brand color used for buttons and highlights',
      icon: <Palette className="w-5 h-5" />
    },
    {
      key: 'secondary',
      label: 'Secondary Color',
      description: 'Supporting color for accents and secondary elements',
      icon: <Paintbrush className="w-5 h-5" />
    },
    {
      key: 'accent',
      label: 'Accent Color',
      description: 'Highlight color for special elements and calls-to-action',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      key: 'background',
      label: 'Background Color',
      description: 'Main background color for pages',
      icon: <Droplet className="w-5 h-5" />
    },
    {
      key: 'surface',
      label: 'Surface Color',
      description: 'Color for cards, modals, and elevated surfaces',
      icon: <Droplet className="w-5 h-5" />
    },
    {
      key: 'text',
      label: 'Text Color',
      description: 'Primary text color for headings and body text',
      icon: <Droplet className="w-5 h-5" />
    },
    {
      key: 'textSecondary',
      label: 'Secondary Text',
      description: 'Color for secondary text and descriptions',
      icon: <Droplet className="w-5 h-5" />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-2">
            Customize your restaurant's brand colors to match your identity
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handlePreviewToggle}
            icon={<Eye className="w-4 h-4" />}
          >
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </Button>
          
          <Button
            variant="outline"
            onClick={generateColorPalette}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Generate Palette
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReset}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Reset
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Preview Notice */}
      {previewMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-medium">Preview Mode Active</p>
              <p className="text-blue-600 text-sm">
                You're seeing a live preview of your brand colors. Click "Exit Preview" to return to normal.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Color Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Controls */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Brand Colors</h2>
          
          {colorFields.map((field, index) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                      style={{ backgroundColor: brandColors[field.key] }}
                    >
                      {field.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{field.label}</h3>
                      <button
                        onClick={() => copyColorToClipboard(brandColors[field.key], field.label)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {copiedColor === field.label ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{field.description}</p>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={brandColors[field.key]}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <Input
                        value={brandColors[field.key]}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        placeholder="#000000"
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Color Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
          
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Color Palette</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(brandColors).map(([key, color]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{color}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Sample Components</h3>
            <div className="space-y-4">
              {/* Sample Header */}
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: brandColors.primary,
                  color: brandColors.background
                }}
              >
                <h4 className="font-semibold">Sample Header</h4>
                <p className="text-sm opacity-90">This shows how your primary color looks</p>
              </div>

              {/* Sample Card */}
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: brandColors.surface,
                  borderColor: brandColors.accent,
                  color: brandColors.text
                }}
              >
                <h4 className="font-semibold mb-2">Sample Card</h4>
                <p style={{ color: brandColors.textSecondary }}>
                  This is how your content will look with the selected colors.
                </p>
                <button
                  className="mt-3 px-4 py-2 rounded text-sm font-medium"
                  style={{
                    backgroundColor: brandColors.secondary,
                    color: brandColors.background
                  }}
                >
                  Sample Button
                </button>
              </div>

              {/* Sample Text */}
              <div 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: brandColors.background,
                  color: brandColors.text
                }}
              >
                <h4 className="font-semibold mb-2">Sample Text</h4>
                <p style={{ color: brandColors.textSecondary }}>
                  This demonstrates how your text colors will appear on the background.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandManagementPage;
