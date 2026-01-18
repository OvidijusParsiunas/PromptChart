# Web Component Build Guide

A reference guide for creating a web component with TypeScript, Vite, Rollup, and Babel for backwards compatibility.

---

## Project Structure

```
my-component/
├── src/
│   ├── myComponent.ts          # Entry point & custom element definition
│   ├── utils/
│   │   ├── decorators/
│   │   │   └── property.ts     # @Property decorator
│   │   └── webComponent/
│   │       └── internalHTML.ts # Base HTMLElement class
├── dist/                       # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
├── rollup.config.js
├── .babelrc
└── .eslintrc.json
```

---

## 1. Package Configuration

**package.json**
```json
{
  "name": "my-component",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/myComponent.js",
  "module": "./dist/myComponent.js",
  "types": "./dist/myComponent.d.ts",
  "exports": {
    ".": "./dist/myComponent.js",
    "./myComponent": "./dist/myComponent.js"
  },
  "files": ["dist/"],
  "scripts": {
    "lint": "eslint --fix './src/**/*.ts'",
    "build": "tsc && vite build",
    "build:bundle": "npm run lint && tsc && vite build && rollup -c && npm run build:babel",
    "build:babel": "npm run build:temp && npm run transpile && rimraf dist/myComponentTemp.js",
    "build:temp": "shx cp dist/myComponent.js dist/myComponentTemp.js",
    "transpile": "babel dist/myComponentTemp.js --out-file dist/myComponent.js"
  },
  "devDependencies": {
    "@babel/cli": "^7.23.9",
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "@rollup/plugin-node-resolve": "^16.0.0",
    "@rollup/plugin-replace": "^6.0.2",
    "@rollup/plugin-terser": "^0.4.4",
    "eslint": "^8.57.0",
    "rimraf": "^5.0.5",
    "rollup": "^4.34.0",
    "rollup-plugin-summary": "^2.0.1",
    "shx": "^0.3.4",
    "typescript": "^5.7.0",
    "vite": "^6.2.0",
    "vite-plugin-dts": "^4.5.0"
  }
}
```

---

## 2. TypeScript Configuration

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "es2020",
    "lib": ["es2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "experimentalDecorators": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Key settings:
- `target: es2019` - Modern syntax while maintaining compatibility
- `experimentalDecorators: true` - Required for `@Property()` pattern
- `declaration: true` - Generates `.d.ts` files

---

## 3. Vite Configuration

**vite.config.ts**
```typescript
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/myComponent.ts',
      formats: ['es'],
      fileName: 'myComponent',
    },
  },
  plugins: [dts({insertTypesEntry: true})],
});
```

---

## 4. Rollup Configuration (Minification)

**rollup.config.js**
```javascript
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import summary from 'rollup-plugin-summary';

export default {
  input: 'dist/myComponent.js',
  output: {
    file: 'dist/myComponent.bundle.js',
    format: 'esm',
  },
  plugins: [
    replace({
      'Reflect.decorate': 'undefined',  // Remove decorator overhead
      preventAssignment: true,
    }),
    resolve(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {regex: /^__/},     // Mangle private properties
      },
    }),
    summary(),
  ],
};
```

---

## 5. Babel Configuration (Backwards Compatibility)

**.babelrc**
```json
{
  "presets": [
    ["@babel/preset-env", {"modules": false}]
  ]
}
```

- `modules: false` - Preserves ES modules (Rollup handles bundling)
- `@babel/preset-env` - Transpiles to older JS based on browserslist

Babel transforms:
- Arrow functions to function expressions
- Classes to prototype-based constructors
- Async/await to generators
- Template literals to concatenation
- `const`/`let` to `var`

---

## 6. Base Web Component Class

**src/utils/webComponent/internalHTML.ts**
```typescript
import {TypeConverters} from '../decorators/property';

export class InternalHTML extends HTMLElement {
  // Maps attribute names to type converters
  static _attributes_: Record<string, (v: string) => unknown> = {};
  // Maps attributes to property names
  static _attributeToProperty_: Record<string, string> = {};

  static get observedAttributes(): string[] {
    return Object.keys(this._attributes_);
  }

  constructor() {
    super();
    this._createPropertyAccessors();
  }

  private _createPropertyAccessors(): void {
    const ctor = this.constructor as typeof InternalHTML;
    const attrs = ctor._attributes_;
    const attrToProp = ctor._attributeToProperty_;

    for (const attr of Object.keys(attrs)) {
      const prop = attrToProp[attr] || attr;
      const privateKey = `_${prop}`;

      Object.defineProperty(this, prop, {
        get() {
          return (this as Record<string, unknown>)[privateKey];
        },
        set(value: unknown) {
          (this as Record<string, unknown>)[privateKey] = value;
          this.onRender();
        },
        configurable: true,
      });
    }
  }

  attributeChangedCallback(name: string, _: string, newValue: string): void {
    const ctor = this.constructor as typeof InternalHTML;
    const converter = ctor._attributes_[name];
    const prop = ctor._attributeToProperty_[name] || name;

    if (converter) {
      (this as Record<string, unknown>)[prop] = converter(newValue);
    }
  }

  // Override in subclass for rendering
  onRender(): void {}
}
```

---

## 7. Property Decorator

**src/utils/decorators/property.ts**
```typescript
import {InternalHTML} from '../webComponent/internalHTML';

type PropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';

export const TypeConverters: Record<PropertyType, (v: string) => unknown> = {
  string: (value) => value,
  number: (value) => parseFloat(value),
  boolean: (value) => value === 'true',
  object: (value) => JSON.parse(value),
  array: (value) => JSON.parse(value),
  function: (value) => new Function('return ' + value)(),
};

export function Property(type: PropertyType = 'string') {
  return function (target: InternalHTML, propertyKey: string): void {
    const ctor = target.constructor as typeof InternalHTML;

    // Initialize static maps if needed
    if (!Object.hasOwn(ctor, '_attributes_')) {
      ctor._attributes_ = {...ctor._attributes_};
    }
    if (!Object.hasOwn(ctor, '_attributeToProperty_')) {
      ctor._attributeToProperty_ = {...ctor._attributeToProperty_};
    }

    const attrName = propertyKey.toLowerCase();
    ctor._attributes_[attrName] = TypeConverters[type];
    ctor._attributeToProperty_[attrName] = propertyKey;
  };
}
```

---

## 8. Component Entry Point

**src/myComponent.ts**
```typescript
import {InternalHTML} from './utils/webComponent/internalHTML';
import {Property} from './utils/decorators/property';

export class MyComponent extends InternalHTML {
  @Property('string')
  title?: string;

  @Property('object')
  config?: Record<string, unknown>;

  @Property('boolean')
  disabled?: boolean;

  private _elementRef: HTMLElement;

  constructor() {
    super();
    this._elementRef = document.createElement('div');
    this._elementRef.className = 'my-component';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    this._applyStyles();
  }

  private _applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 320px;
        height: 350px;
        border: 1px solid #cacaca;
        border-radius: 8px;
        font-family: Inter, sans-serif;
      }
      .my-component {
        height: 100%;
        padding: 16px;
      }
    `;
    this.shadowRoot?.appendChild(style);
  }

  override onRender(): void {
    this._elementRef.innerHTML = `
      <h2>${this.title || 'Default Title'}</h2>
      <p>Config: ${JSON.stringify(this.config)}</p>
      <p>Disabled: ${this.disabled}</p>
    `;
  }
}

// Register custom element
customElements.define('my-component', MyComponent);

// TypeScript DOM mapping
declare global {
  interface HTMLElementTagNameMap {
    'my-component': MyComponent;
  }
}
```

---

## 9. Build Pipeline

The full build chain:

```
npm run build:bundle
    │
    ├── eslint              # Lint TypeScript files
    │
    ├── tsc                 # Compile TS → JS in dist/
    │
    ├── vite build          # Bundle ES modules + generate .d.ts
    │
    ├── rollup -c           # Minify → dist/myComponent.bundle.js
    │
    └── babel               # Transpile for older browsers
        ├── Copy dist/myComponent.js → temp
        ├── Babel transform temp → dist/myComponent.js
        └── Delete temp file
```

**Output files:**
- `dist/myComponent.js` - Main bundle (transpiled)
- `dist/myComponent.bundle.js` - Minified bundle
- `dist/myComponent.d.ts` - TypeScript declarations

---

## 10. Usage

**HTML:**
```html
<script type="module" src="dist/myComponent.js"></script>

<my-component
  title="Hello World"
  config='{"theme": "dark"}'
  disabled="true"
></my-component>
```

**JavaScript:**
```javascript
import './dist/myComponent.js';

const el = document.createElement('my-component');
el.title = 'Hello World';
el.config = {theme: 'dark'};
el.disabled = true;
document.body.appendChild(el);
```

---

## Key Patterns

| Pattern | Purpose |
|---------|---------|
| Shadow DOM | Style encapsulation |
| `@Property()` decorator | Attribute-to-property binding with type conversion |
| `observedAttributes` | React to HTML attribute changes |
| Babel transpilation | ES5 compatibility for older browsers |
| Rollup minification | Smaller bundle with tree-shaking |
| Mangle `__` properties | Size reduction for private properties |
| `Reflect.decorate → undefined` | Remove decorator runtime overhead |

---

## Browser Support

With this setup:
- **Modern browsers**: ES modules work directly
- **Older browsers**: Babel-transpiled bundle + Web Components polyfill

For IE11/legacy support, add:
```html
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2/webcomponents-bundle.js"></script>
```
