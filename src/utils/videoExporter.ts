import { getFFmpeg } from './ffmpeg';
import html2canvas from 'html2canvas';
import { gsap } from 'gsap';
import * as THREE from 'three';
import toast from 'react-hot-toast';

interface VideoExportOptions {
  duration: number;
  fps?: number;
  width: number;
  height: number;
  quality?: number;
  animations?: {
    type: 'fade' | 'slide' | 'zoom' | 'rotate' | '3d';
    duration?: number;
    delay?: number;
    easing?: string;
  }[];
}

interface RenderFrame {
  time: number;
  element: HTMLElement;
  width: number;
  height: number;
  animations: VideoExportOptions['animations'];
}

class AnimationRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(width: number, height: number) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.camera.position.z = 5;
  }

  async render3DFrame(frame: RenderFrame): Promise<ArrayBuffer> {
    try {
      const canvas = await html2canvas(frame.element, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const geometry = new THREE.PlaneGeometry(5, 5 * (frame.height / frame.width));
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(geometry, material);

      this.scene.clear();
      this.scene.add(plane);

      const progress = frame.time;
      plane.rotation.y = Math.PI * progress;
      plane.position.z = -2 * Math.sin(Math.PI * progress);

      this.renderer.render(this.scene, this.camera);
      
      return new Promise((resolve, reject) => {
        try {
          this.renderer.domElement.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as ArrayBuffer);
              reader.onerror = reject;
              reader.readAsArrayBuffer(blob);
            } else {
              reject(new Error('Failed to create frame blob'));
            }
          }, 'image/png', 1.0);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('3D frame rendering error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  dispose() {
    this.scene.clear();
    this.renderer.dispose();
  }
}

async function applyAnimations(
  element: HTMLElement,
  progress: number,
  animations: VideoExportOptions['animations'] = []
): Promise<void> {
  return new Promise((resolve) => {
    element.style.transform = '';
    element.style.opacity = '1';

    const timeline = gsap.timeline({
      onComplete: () => resolve()
    });

    animations.forEach((animation) => {
      const duration = animation.duration || 1;
      const delay = animation.delay || 0;
      const ease = animation.easing || 'power2.inOut';

      switch (animation.type) {
        case 'fade':
          timeline.fromTo(element, 
            { opacity: 0 },
            { opacity: 1, duration, delay, ease }
          );
          break;
        case 'slide':
          timeline.fromTo(element,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration, delay, ease }
          );
          break;
        case 'zoom':
          timeline.fromTo(element,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration, delay, ease }
          );
          break;
        case 'rotate':
          timeline.fromTo(element,
            { rotation: -180, opacity: 0 },
            { rotation: 0, opacity: 1, duration, delay, ease }
          );
          break;
      }
    });

    timeline.progress(progress);
    timeline.update();
  });
}

async function captureFrame(frame: RenderFrame): Promise<ArrayBuffer> {
  try {
    const { element, width, height, animations, time } = frame;

    await applyAnimations(element, time, animations);

    if (animations?.some(a => a.type === '3d')) {
      const renderer = new AnimationRenderer(width, height);
      const buffer = await renderer.render3DFrame(frame);
      renderer.dispose();
      return buffer;
    }

    const canvas = await html2canvas(element, {
      width,
      height,
      scale: 1,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            resolve(arrayBuffer);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Failed to create frame blob'));
        }
      }, 'image/png', 1.0);
    });
  } catch (error) {
    console.error('Frame capture error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function exportToVideo(
  element: HTMLElement,
  options: VideoExportOptions
): Promise<Blob> {
  const {
    duration = 3,
    fps = 30,
    width = 1920,
    height = 1080,
    quality = 23,
    animations = [{ type: 'fade', duration: 1 }]
  } = options;

  const toastId = toast.loading('Initializing video export...');

  try {
    const ffmpeg = await getFFmpeg();
    
    if (!ffmpeg) {
      throw new Error('Failed to initialize FFmpeg');
    }

    toast.loading('Capturing frames...', { id: toastId });
    
    await ffmpeg.createDir('frames');

    const totalFrames = Math.floor(duration * fps);
    const framePromises = [];

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    document.body.appendChild(clone);

    try {
      const batchSize = 5;
      for (let i = 0; i < totalFrames; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, totalFrames - i) }, async (_, j) => {
          const frame = i + j;
          const time = frame / totalFrames;
          
          try {
            const frameData = await captureFrame({
              time,
              element: clone,
              width,
              height,
              animations
            });
            
            const frameName = `frames/frame${frame.toString().padStart(6, '0')}.png`;
            await ffmpeg.writeFile(frameName, new Uint8Array(frameData));
            
            toast.loading(`Capturing frames: ${Math.round((frame / totalFrames) * 100)}%`, { id: toastId });
            
            return frameName;
          } catch (error) {
            console.error(`Error capturing frame ${frame}:`, error);
            throw error;
          }
        });
        
        framePromises.push(...batch);
        await Promise.all(batch);
      }

      toast.loading('Generating video...', { id: toastId });

      await ffmpeg.exec([
        '-framerate', fps.toString(),
        '-i', 'frames/frame%06d.png',
        '-c:v', 'libx264',
        '-preset', 'slow',
        '-crf', quality.toString(),
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        '-profile:v', 'high',
        '-tune', 'animation',
        '-b:v', '8M',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      
      await ffmpeg.deleteDir('frames');
      await ffmpeg.delete('output.mp4');

      toast.success('Video exported successfully!', { id: toastId });

      return new Blob([data], { type: 'video/mp4' });
    } finally {
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }
    }
  } catch (error) {
    console.error('Video export error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    toast.error(
      error instanceof Error 
        ? `Export failed: ${error.message}`
        : 'Failed to export video. Please try image export instead.',
      { id: toastId }
    );
    throw error;
  }
}