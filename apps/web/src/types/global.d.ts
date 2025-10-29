// Global type declarations for CSS imports
// This allows TypeScript to recognize CSS file imports

declare module '*.css' {
  const content: void;
  export default content;
}
