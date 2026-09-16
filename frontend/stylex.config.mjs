/** @type {import('@stylexjs/nextjs-plugin').Config} */
export default {
  dev: process.env.NODE_ENV === 'development',
  stylexImports: ['@stylexjs/stylex'],
  useCSSLayers: false,
  classNamePrefix: 'x',
  unstable_moduleResolution: {
    type: 'commonJS',
    rootDir: __dirname,
  },
};




