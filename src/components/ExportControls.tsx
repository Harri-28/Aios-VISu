import React, { useState } from 'react';
import { Download, Camera, Video, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { exportToVideo } from '../utils/videoExporter';
import html2canvas from 'html2canvas';

interface ExportControlsProps {
  chartRef: React.RefObject<HTMLDivElement>;
  data: any;
}

const QUALITY_PRESETS = [
  { label: '4K', width: 3840, height: 2160 },
  { label: '2K', width: 2560, height: 1440 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 }
];

const ANIMATION_PRESETS = [
  { label: 'Simple Fade', animations: [{ type: 'fade', duration: 1 }] },
  { label: 'Slide & Fade', animations: [
    { type: 'slide', duration: 1 },
    { type: 'fade', duration: 0.8, delay: 0.2 }
  ]},
  { label: 'Zoom In', animations: [{ type: 'zoom', duration: 1.2 }] },
  { label: 'Rotate', animations: [{ type: 'rotate', duration: 1.5 }] }
];

export function ExportControls({ chartRef, data }: ExportControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [videoSettings, setVideoSettings] = useState({
    duration: 3,
    fps: 30,
    quality: '1080p',
    width: 1920,
    height: 1080,
    animationPreset: 'Simple Fade'
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visualization.png';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Image exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export image');
    }
  };

  const exportAsVideo = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    
    try {
      const preset = QUALITY_PRESETS.find(p => p.label === videoSettings.quality) || QUALITY_PRESETS[2];
      const animations = ANIMATION_PRESETS.find(p => p.label === videoSettings.animationPreset)?.animations;
      
      const videoBlob = await exportToVideo(chartRef.current, {
        duration: videoSettings.duration,
        fps: videoSettings.fps,
        width: preset.width,
        height: preset.height,
        animations
      });
      
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visualization.mp4';
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Video exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export video. Please try image export instead.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportData = () => {
    try {
      const exportData = {
        data,
        exportedAt: new Date().toISOString(),
        metadata: {
          type: 'AEOS Visualization',
          version: '1.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visualization-data.json';
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Data export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="relative z-20">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSettings(!showSettings)}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center space-x-2"
      >
        <Settings className="h-4 w-4" />
        <span>Export Options</span>
      </motion.button>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 border border-gray-200 dark:border-gray-700"
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Export Settings</h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={exportAsImage}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Export as Image (PNG)</span>
                  </button>

                  <div className="space-y-3">
                    <button
                      onClick={exportAsVideo}
                      disabled={isExporting}
                      className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <Video className="h-4 w-4" />
                      <span>{isExporting ? 'Creating Video...' : 'Export as Video (MP4)'}</span>
                    </button>

                    <div className="space-y-3 px-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Duration: {videoSettings.duration}s
                        </label>
                        <input
                          type="range"
                          min="2"
                          max="10"
                          step="0.5"
                          value={videoSettings.duration}
                          onChange={(e) => setVideoSettings(prev => ({
                            ...prev,
                            duration: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          FPS: {videoSettings.fps}
                        </label>
                        <input
                          type="range"
                          min="24"
                          max="60"
                          value={videoSettings.fps}
                          onChange={(e) => setVideoSettings(prev => ({
                            ...prev,
                            fps: Number(e.target.value)
                          }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Quality
                        </label>
                        <select
                          value={videoSettings.quality}
                          onChange={(e) => {
                            const preset = QUALITY_PRESETS.find(p => p.label === e.target.value);
                            if (preset) {
                              setVideoSettings(prev => ({
                                ...prev,
                                quality: e.target.value,
                                width: preset.width,
                                height: preset.height
                              }));
                            }
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
                        >
                          {QUALITY_PRESETS.map(preset => (
                            <option key={preset.label} value={preset.label}>
                              {preset.label} ({preset.width}x{preset.height})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Animation Style
                        </label>
                        <select
                          value={videoSettings.animationPreset}
                          onChange={(e) => setVideoSettings(prev => ({
                            ...prev,
                            animationPreset: e.target.value
                          }))}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200"
                        >
                          {ANIMATION_PRESETS.map(preset => (
                            <option key={preset.label} value={preset.label}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={exportData}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Data (JSON)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}