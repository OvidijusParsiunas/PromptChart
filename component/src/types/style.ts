// Only include string CSS properties (excludes read-only props, methods, and symbols)
export type CustomStyle = {
  [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]?: string;
};
