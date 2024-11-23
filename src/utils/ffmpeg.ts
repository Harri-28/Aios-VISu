import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let loadingPromise: Promise<FFmpeg> | null = null;

// Use jsDelivr as the primary CDN with Unpkg as fallback
const CDN_URLS = {
  primary: {
    core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasm: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    worker: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js'
  },
  fallback: {
    core: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasm: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    worker: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js'
  }
};

async function fetchWithRetry(urls: string[], retries = 3): Promise<Response> {
  let lastError;

  for (const url of urls) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        lastError = error;
        if (i === retries - 1) continue;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after all retries');
}

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) {
    return ffmpeg;
  }

  if (isLoading && loadingPromise) {
    return loadingPromise;
  }

  isLoading = true;
  ffmpeg = new FFmpeg();

  loadingPromise = (async () => {
    try {
      // Try both CDNs for each resource
      const [coreResponse, wasmResponse, workerResponse] = await Promise.all([
        fetchWithRetry([CDN_URLS.primary.core, CDN_URLS.fallback.core]),
        fetchWithRetry([CDN_URLS.primary.wasm, CDN_URLS.fallback.wasm]),
        fetchWithRetry([CDN_URLS.primary.worker, CDN_URLS.fallback.worker])
      ]);

      // Convert responses to blobs with proper MIME types
      const [coreBlob, wasmBlob, workerBlob] = await Promise.all([
        coreResponse.blob().then(blob => new Blob([blob], { type: 'text/javascript' })),
        wasmResponse.blob().then(blob => new Blob([blob], { type: 'application/wasm' })),
        workerResponse.blob().then(blob => new Blob([blob], { type: 'text/javascript' }))
      ]);

      // Create blob URLs
      const [coreBlobUrl, wasmBlobUrl, workerBlobUrl] = await Promise.all([
        toBlobURL(coreBlob, 'text/javascript'),
        toBlobURL(wasmBlob, 'application/wasm'),
        toBlobURL(workerBlob, 'text/javascript')
      ]);

      // Load FFmpeg with the blob URLs
      await ffmpeg!.load({
        coreURL: coreBlobUrl,
        wasmURL: wasmBlobUrl,
        workerURL: workerBlobUrl
      });

      return ffmpeg!;
    } catch (error) {
      console.error('FFmpeg initialization error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      ffmpeg = null;
      throw new Error(
        error instanceof Error 
          ? `FFmpeg initialization failed: ${error.message}`
          : 'Failed to initialize video processing. Please try again later.'
      );
    } finally {
      isLoading = false;
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}