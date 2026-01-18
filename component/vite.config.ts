import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/promptChart.ts',
      formats: ['es'],
      fileName: 'promptChart',
    },
  },
  plugins: [dts({insertTypesEntry: true})],
});
