import {CustomStyle} from '../../types/style';
import {GoogleFont} from './googleFont';

export class WebComponentStyleUtils {
  private static readonly DEFAULT_COMPONENT_STYLE: CustomStyle = {
    height: '350px',
    width: '100%',
    fontFamily: GoogleFont.DEFAULT_FONT_FAMILY,
    fontSize: '0.9rem',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
  };

  private static applyToStyleIfNotDefined(cssDeclaration: CSSStyleDeclaration, source: CustomStyle) {
    for (const key in source) {
      const cssKey = key as keyof CustomStyle;
      const value = source[cssKey];
      if (cssDeclaration[cssKey] === '' && value) {
        cssDeclaration[cssKey] = value;
      }
    }
  }

  public static applyDefaultStyleToComponent(style: CSSStyleDeclaration, containerStyle?: CustomStyle) {
    if (containerStyle) WebComponentStyleUtils.applyToStyleIfNotDefined(style, containerStyle);
    WebComponentStyleUtils.applyToStyleIfNotDefined(style, WebComponentStyleUtils.DEFAULT_COMPONENT_STYLE);
  }
}
