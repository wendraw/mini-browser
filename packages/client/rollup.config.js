import rollupTypescript from '@rollup/plugin-typescript'

export default {
  input: {
    main: 'src/main.ts',
    preload: 'src/preload.ts',
    renderer: 'src/renderer.ts',
  },
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [rollupTypescript()],
  external: ['@mini-browser/network', '@mini-browser/parse-html'],
}
