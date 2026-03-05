import React from 'react';
import { Settings as SettingsIcon, Check } from 'lucide-react';

interface SettingsProps {
  themeColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Slate', value: '#64748b' },
];

export default function Settings({ themeColor, onColorChange }: SettingsProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-theme-500" />
          Settings
        </h2>
        <p className="text-gray-500">Customize your FitJourney experience.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Color</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Preset Colors</p>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => onColorChange(color.value)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      backgroundColor: color.value,
                      boxShadow: themeColor === color.value ? `0 0 0 2px white, 0 0 0 4px ${color.value}` : 'none'
                    }}
                    title={color.name}
                  >
                    {themeColor === color.value && <Check className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-3">Custom Color</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  {themeColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
