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
          this.onPropertyChange(prop, value);
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

  // Override in subclass to react to property changes
  onPropertyChange(_property: string, _value: unknown): void {}

  // Override in subclass for rendering
  onRender(): void {}
}
