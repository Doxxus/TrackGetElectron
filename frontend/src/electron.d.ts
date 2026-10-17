export {};

declare global {
  interface Window {
    electronAPI: {
      chooseFolder: () => Promise<string | null>;
      getVersion: () => Promise<string>;
      startDownload: (playlistUrl: string, folder: string, concurrency: number) => Promise<void>;
      onProgress: (callback: (msg: string) => void) => void;
    };
  }
}