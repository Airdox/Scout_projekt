 namespace AtRule {
  export interface CounterStyle<TLength = (string & {}) | 0, TTime = string & {}> {
    additiveSymbols?: string | undefined;
    fallback?: string | undefined;
    negative?: string | undefined;
    pad?: string | undefined;
    prefix?: string | undefined;
    range?: Range | undefined;
    speakAs?: SpeakAs | undefined;
    suffix?: string | undefined;
    symbols?: string | undefined;
    system?: System | undefined;
  }

  export interface CounterStyleHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
    "additive-symbols"?: string | undefined;
    fallback?: string | undefined;
    negative?: string | undefined;
    pad?: string | undefined;
    prefix?: string | undefined;
    range?: Range | undefined;
    "speak-as"?: SpeakAs | undefined;
    suffix?: string | undefined;
    symbols?: string | undefined;
    system?: System | undefined;
  }

  export type CounterStyleFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<CounterStyle<TLength, TTime>>;

  export type CounterStyleHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<CounterStyleHyphen<TLength, TTime>>;

  export interface FontFace<TLength = (string & {}) | 0, TTime = string & {}> {
    MozFontFeatureSettings?: FontFeatureSettings | undefined;
    ascentOverride?: AscentOverride | undefined;
    descentOverride?: DescentOverride | undefined;
    fontDisplay?: FontDisplay | undefined;
    fontFamily?: string | undefined;
    fontFeatureSettings?: FontFeatureSettings | undefined;
    fontStretch?: FontStretch | undefined;
    fontStyle?: FontStyle | undefined;
    fontVariant?: FontVariant | undefined;
    fontVariationSettings?: FontVariationSettings | undefined;
    fontWeight?: FontWeight | undefined;
    lineGapOverride?: LineGapOverride | undefined;
    sizeAdjust?: string | undefined;
    src?: string | undefined;
    unicodeRange?: string | undefined;
  }

  export interface FontFaceHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
    "-moz-font-feature-settings"?: FontFeatureSettings | undefined;
    "ascent-override"?: AscentOverride | undefined;
    "descent-override"?: DescentOverride | undefined;
    "font-display"?: FontDisplay | undefined;
    "font-family"?: string | undefined;
    "font-feature-settings"?: FontFeatureSettings | undefined;
    "font-stretch"?: FontStretch | undefined;
    "font-style"?: FontStyle | undefined;
    "font-variant"?: FontVariant | undefined;
    "font-variation-settings"?: FontVariationSettings | undefined;
    "font-weight"?: FontWeight | undefined;
    "line-gap-override"?: LineGapOverride | undefined;
    "size-adjust"?: string | undefined;
    src?: string | undefined;
    "unicode-range"?: string | undefined;
  }

  export type FontFaceFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<FontFace<TLength, TTime>>;

  export type FontFaceHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<FontFaceHyphen<TLength, TTime>>;

  export interface FontPaletteValues<TLength = (string & {}) | 0, TTime = string & {}> {
    basePalette?: BasePalette | undefined;
    fontFamily?: string | undefined;
    overrideColors?: string | undefined;
  }

  export interface FontPaletteValuesHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
    "base-palette"?: BasePalette | undefined;
    "font-family"?: string | undefined;
    "override-colors"?: string | undefined;
  }

  export type FontPaletteValuesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<FontPaletteValues<TLength, TTime>>;

  export type FontPaletteValuesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<FontPaletteValuesHyphen<TLength, TTime>>;

  export interface Page<TLength = (string & {}) | 0, TTi