/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
// @ts-check
import path from 'path'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import polyfillNode from 'rollup-plugin-polyfill-node'
import { terser } from 'rollup-plugin-terser'

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

// const masterVersion = require('./package.json').version
const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const resolve = (p) => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}
const name = packageOptions.filename || path.basename(packageDir)

const outputConfigs = {
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`,
  },
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map((format) => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach((format) => {
    if (packageOptions.prod === false) {
      return
    }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }
    if (format === 'esm') {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.exports = 'named'
  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false

  const tsPlugin = typescript({
    check: process.env.NODE_ENV === 'production',
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
      },
      exclude: ['**/__tests__', 'test-dts'],
    },
  })

  const entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]

  const nodePlugins =
    packageOptions.enableNonBrowserBranches && format !== 'cjs'
      ? [
          commonjs({
            sourceMap: false,
          }),
          polyfillNode(),
          nodeResolve(),
        ]
      : []

  return {
    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [
      json({
        namedExports: false,
      }),
      tsPlugin,
      ...nodePlugins,
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  }
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  })
}

function createMinifiedConfig(format) {
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
        safari10: true,
      }),
    ]
  )
}
