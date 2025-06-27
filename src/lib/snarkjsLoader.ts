// SnarkJS loader utility
export class SnarkjsLoader {
  private static loaded = false;
  private static loading = false;
  private static loadPromise: Promise<void> | null = null;

  /**
   * Load snarkjs library dynamically
   */
  static async load(): Promise<void> {
    // If already loaded, return immediately
    if (this.loaded && window.snarkjs) {
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.loading && this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.loading = true;
    this.loadPromise = this.loadSnarkjs();

    try {
      await this.loadPromise;
      this.loaded = true;
      this.loading = false;
      console.log('✅ SnarkJS loaded successfully');
    } catch (error) {
      this.loading = false;
      this.loadPromise = null;
      console.error('❌ Failed to load SnarkJS:', error);
      throw error;
    }

    return this.loadPromise;
  }

  /**
   * Check if snarkjs is available
   */
  static isLoaded(): boolean {
    return typeof window !== 'undefined' && 
           !!window.snarkjs && 
           this.loaded;
  }

  /**
   * Get loading status
   */
  static isLoading(): boolean {
    return this.loading;
  }

  /**
   * Force reload snarkjs
   */
  static async reload(): Promise<void> {
    this.loaded = false;
    this.loading = false;
    this.loadPromise = null;
    
    // Remove existing script if present
    const existingScript = document.querySelector('script[src*="snarkjs"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Clear window.snarkjs
    if (window.snarkjs) {
      delete window.snarkjs;
    }
    
    return this.load();
  }

  /**
   * Internal method to load snarkjs script
   */
  private static loadSnarkjs(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        reject(new Error('Not in browser environment'));
        return;
      }

      // Check if snarkjs is already available globally
      if (window.snarkjs) {
        console.log('SnarkJS already available globally');
        resolve();
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      
      // Try multiple CDN sources for reliability
      const sources = [
        'https://unpkg.com/snarkjs@latest/build/snarkjs.min.js',
        'https://cdn.jsdelivr.net/npm/snarkjs@latest/build/snarkjs.min.js',
        'https://cdn.skypack.dev/snarkjs'
      ];

      let currentSourceIndex = 0;

      const tryLoadSource = () => {
        if (currentSourceIndex >= sources.length) {
          reject(new Error('All SnarkJS sources failed to load'));
          return;
        }

        script.src = sources[currentSourceIndex];
        console.log(`Attempting to load SnarkJS from: ${script.src}`);

        script.onload = () => {
          // Wait a bit for the global object to be available
          setTimeout(() => {
            if (window.snarkjs) {
              console.log(`✅ SnarkJS loaded successfully from: ${script.src}`);
              resolve();
            } else {
              console.warn(`Script loaded but snarkjs not available from: ${script.src}`);
              currentSourceIndex++;
              tryLoadSource();
            }
          }, 100);
        };

        script.onerror = (error) => {
          console.warn(`Failed to load from: ${script.src}`, error);
          currentSourceIndex++;
          tryLoadSource();
        };

        // Add timeout for each attempt
        const timeout = setTimeout(() => {
          console.warn(`Timeout loading from: ${script.src}`);
          currentSourceIndex++;
          tryLoadSource();
        }, 10000); // 10 second timeout

        script.onload = () => {
          clearTimeout(timeout);
          setTimeout(() => {
            if (window.snarkjs) {
              console.log(`✅ SnarkJS loaded successfully from: ${script.src}`);
              resolve();
            } else {
              console.warn(`Script loaded but snarkjs not available from: ${script.src}`);
              currentSourceIndex++;
              tryLoadSource();
            }
          }, 100);
        };
      };

      // Start loading
      tryLoadSource();
      document.head.appendChild(script);
    });
  }

  /**
   * Preload snarkjs with retry mechanism
   */
  static async preload(maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📦 Loading SnarkJS (attempt ${attempt}/${maxRetries})...`);
        await this.load();
        return;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to load SnarkJS after ${maxRetries} attempts`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Get SnarkJS version if available
   */
  static getVersion(): string | null {
    if (this.isLoaded() && window.snarkjs?.version) {
      return window.snarkjs.version;
    }
    return null;
  }

  /**
   * Test SnarkJS functionality
   */
  static async test(): Promise<boolean> {
    if (!this.isLoaded()) {
      return false;
    }

    try {
      // Test if groth16 module is available
      if (!window.snarkjs.groth16) {
        console.error('SnarkJS groth16 module not available');
        return false;
      }

      console.log('✅ SnarkJS test passed');
      return true;
    } catch (error) {
      console.error('❌ SnarkJS test failed:', error);
      return false;
    }
  }
}

// Global type declaration
declare global {
  interface Window {
    snarkjs: {
      groth16: {
        fullProve: (input: any, wasmPath: string, zkeyPath: string) => Promise<any>;
        verify: (vKey: any, publicSignals: any, proof: any) => Promise<boolean>;
        prove: (zkeyPath: string, witness: any) => Promise<any>;
      };
      version?: string;
    };
  }
}

// Export for convenience
export const loadSnarkjs = SnarkjsLoader.load.bind(SnarkjsLoader);
export const isSnarkjsLoaded = SnarkjsLoader.isLoaded.bind(SnarkjsLoader);
export const preloadSnarkjs = SnarkjsLoader.preload.bind(SnarkjsLoader);