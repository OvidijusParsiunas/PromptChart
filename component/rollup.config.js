import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import summary from 'rollup-plugin-summary';

export default {
  input: 'dist/promptChart.js',
  output: {
    file: 'dist/promptChart.bundle.js',
    format: 'esm',
  },
  plugins: [
    replace({
      'Reflect.decorate': 'undefined', // Remove decorator overhead
      preventAssignment: true,
    }),
    resolve(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {regex: /^__/}, // Mangle private properties
      },
    }),
    summary(),
  ],
};
