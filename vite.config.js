import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',  // JS files to js/ folder
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]'  // CSS to assets/
      }
    },
    // Prevent inlining
    inlineDynamicImports: false,
    minify: false  // Set to true for production
  }
})