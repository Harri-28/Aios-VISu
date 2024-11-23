import React, { useState } from 'react';
import { Video, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { exportToVideo } from '../utils/videoExporter';

interface VideoExportControlsProps {
  chartRef: React.RefObject<HTMLDivElement>;
}

export function VideoExportControls({ chartRef }: VideoExportControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    duration: 5,
    fps: 30,
    width: 1920,
    height: 1080
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!chartRef.current) return;

    setIsExporting(true);
    try {
      const videoBlob = await exportToVideo(chartRef.current, settings);
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'infographic.mp4';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Video exported successfully!');
    } catch (error) {
      toast.error('Failed to export video');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-primary"
        >
          <Settings className="h-4 w-4 mr-2" />
          Export Settings
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
        >
          <Video className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export as Video'}
        </motion.button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Export Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={settings.duration}
                  onChange={(e) => setSettings({ ...settings, duration: Number(e.target.value) })}
                  className="input w-full"
                  min="1"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">FPS</label>
                <input
                  type="number"
                  value={settings.fps}
                  onChange={(e) => setSettings({ ...settings, fps: Number(e.target.value) })}
                  className="input w-full"
                  min="24"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={settings.width}
                    onChange={(e) => setSettings({ ...settings, width: Number(e.target.value) })}
                    className="input"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    value={settings.height}
                    onChange={(e) => setSettings({ ...settings, height: Number(e.target.value) })}
                    className="input"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}