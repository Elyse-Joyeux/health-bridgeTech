declare module '*.module.css';
declare module '*.css';

interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (dep?: string | string[], callback?: (modules: any[]) => void) => void;
    dispose: (callback: () => void) => void;
  };
}
