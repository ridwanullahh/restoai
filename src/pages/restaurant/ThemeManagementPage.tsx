import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, Check, RefreshCw } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { Theme, ThemeConfig } from '../../types';
import { defaultThemes, applyTheme } from '../../lib/themes';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ThemeManagementPage: React.FC = () => {
  const { currentRestaurant, updateRestaurant } = useRestaurant();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string>('classic');
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadThemes();
    loadCurrentTheme();
  }, [currentRestaurant]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      
      // Check if themes exist in database, if not, create them
      let existingThemes = await sdk.queryBuilder<Theme>('themes')
        .where(theme => theme.active === true)
        .exec();
      
      if (existingThemes.length === 0) {
        // Create default themes
        const createdThemes = [];
        for (const themeData of defaultThemes) {
          const theme = await sdk.insert<Theme>('themes', themeData);
          createdThemes.push(theme);
        }
        setThemes(createdThemes);
      } else {
        setThemes(existingThemes);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentTheme = () => {
    if (currentRestaurant?.settings?.theme?.name) {
      setCurrentTheme(currentRestaurant.settings.theme.name);
    }
  };

  const handlePreviewTheme = (theme: Theme) => {
    setPreviewTheme(theme.config);
    setIsPreviewModalOpen(true);
    
    // Apply theme temporarily for preview
    applyTheme(theme.config);
  };

  const handleApplyTheme = async (theme: Theme) => {
    if (!currentRestaurant) return;
    
    setApplying(true);
    
    try {
      // Update restaurant settings with new theme
      const updatedSettings = {
        ...currentRestaurant.settings,
        theme: {
          name: theme.name,
          displayName: theme.displayName,
          config: theme.config
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
      
      setCurrentTheme(theme.name);
      
      // Apply theme to current page
      applyTheme(theme.config);
      
      toast.success(`${theme.displayName} theme applied successfully!`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast.error('Failed to apply theme');
    } finally {
      setApplying(false);
    }
  };

  const resetToDefault = async () => {
    const defaultTheme = themes.find(t => t.name === 'classic');
    if (defaultTheme) {
      await handleApplyTheme(defaultTheme);
    }
  };

  const closePreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewTheme(null);
    
    // Restore current theme
    const current = themes.find(t => t.name === currentTheme);
    if (current) {
      applyTheme(current.config);
    }
  };

  const ColorPalette: React.FC<{ colors: ThemeConfig['colors'] }> = ({ colors }) => (
    <div className="flex space-x-2 mb-3">
      {Object.entries(colors).slice(0, 4).map(([key, color]) => (
        <div
          key={key}
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: color }}
          title={`${key}: ${color}`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Theme Management</h1>
          <p className="text-gray-600">Customize the look and feel of your restaurant's public pages.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={resetToDefault}
            icon={<RefreshCw className="w-5 h-5" />}
          >
            Reset to Default
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="relative overflow-hidden">
              {/* Theme Preview Image */}
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                {theme.preview && (
                  <img
                    src={theme.preview}
                    alt={theme.displayName}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                
                {/* Current Theme Badge */}
                {currentTheme === theme.name && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Check className="w-3 h-3 mr-1" />
                      Current
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{theme.displayName}</h3>
                <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                
                {/* Color Palette */}
                <ColorPalette colors={theme.config.colors} />
                
                {/* Theme Details */}
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <div>Font: {theme.config.typography.fontFamily.split(',')[0]}</div>
                  <div>Style: {theme.config.components.header.style}</div>
                  <div>Buttons: {theme.config.components.buttons.style}</div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTheme(theme)}
                    icon={<Eye className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApplyTheme(theme)}
                    disabled={currentTheme === theme.name || applying}
                    icon={<Palette className="w-4 h-4" />}
                    className="flex-1"
                  >
                    {currentTheme === theme.name ? 'Applied' : 'Apply'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Theme Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={closePreview}
        title="Theme Preview"
        size="lg"
      >
        {previewTheme && (
          <div className="space-y-6">
            {/* Color Scheme */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Color Scheme</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(previewTheme.colors).map(([key, color]) => (
                  <div key={key} className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xs text-gray-500">{color}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Typography */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Typography</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Body Font: </span>
                  <span className="font-medium">{previewTheme.typography.fontFamily}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Heading Font: </span>
                  <span className="font-medium">{previewTheme.typography.headingFont || previewTheme.typography.fontFamily}</span>
                </div>
              </div>
            </div>
            
            {/* Component Styles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Component Styles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Header Style: </span>
                  <span className="font-medium capitalize">{previewTheme.components.header.style}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Button Style: </span>
                  <span className="font-medium capitalize">{previewTheme.components.buttons.style}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Card Shadow: </span>
                  <span className="font-medium capitalize">{previewTheme.components.cards.shadow}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Border Radius: </span>
                  <span className="font-medium">{previewTheme.layout.borderRadius}</span>
                </div>
              </div>
            </div>
            
            {/* Sample Components */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Components</h3>
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <div 
                  className="p-4 rounded"
                  style={{ 
                    backgroundColor: previewTheme.colors.surface,
                    color: previewTheme.colors.text,
                    borderRadius: previewTheme.layout.borderRadius
                  }}
                >
                  <h4 
                    className="text-lg font-semibold mb-2"
                    style={{ 
                      fontFamily: previewTheme.typography.headingFont || previewTheme.typography.fontFamily,
                      color: previewTheme.colors.text
                    }}
                  >
                    Sample Heading
                  </h4>
                  <p style={{ color: previewTheme.colors.textSecondary }}>
                    This is how your content will look with this theme applied.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    className="px-4 py-2 text-white font-medium"
                    style={{
                      backgroundColor: previewTheme.colors.primary,
                      borderRadius: previewTheme.components.buttons.style === 'pill' ? '9999px' : 
                                   previewTheme.components.buttons.style === 'rounded' ? previewTheme.layout.borderRadius : '0'
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 text-white font-medium"
                    style={{
                      backgroundColor: previewTheme.colors.secondary,
                      borderRadius: previewTheme.components.buttons.style === 'pill' ? '9999px' : 
                                   previewTheme.components.buttons.style === 'rounded' ? previewTheme.layout.borderRadius : '0'
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={closePreview}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default ThemeManagementPage;
