import {InternalHTML} from '../webComponent/internalHTML.js';

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
    if (!Object.prototype.hasOwnProperty.call(ctor, '_attributes_')) {
      ctor._attributes_ = {...ctor._attributes_};
    }
    if (!Object.prototype.hasOwnProperty.call(ctor, '_attributeToProperty_')) {
      ctor._attributeToProperty_ = {...ctor._attributeToProperty_};
    }

    const attrName = propertyKey.toLowerCase();
    ctor._attributes_[attrName] = TypeConverters[type];
    ctor._attributeToProperty_[attrName] = propertyKey;
  };
}
