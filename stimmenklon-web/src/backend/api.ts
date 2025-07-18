export interface PropertiesHyphen<TLength = (string & {}) | 0, TTime = string & {}>
  extends StandardPropertiesHyphen<TLength, TTime>,
    VendorPropertiesHyphen<TLength, TTime>,
    ObsoletePropertiesHyphen<TLength, TTime>,
    SvgPropertiesHyphen<TLength, TTime> {}

export type StandardLonghandPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<StandardLonghandProperties<TLength, TTime>>;

export type StandardShorthandPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<StandardShorthandProperties<TLength, TTime>>;

export interface StandardPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends StandardLonghandPropertiesFallback<TLength, TTime>,
    StandardShorthandPropertiesFallback<TLength, TTime> {}

export type VendorLonghandPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<VendorLonghandProperties<TLength, TTime>>;

export type VendorShorthandPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<VendorShorthandProperties<TLength, TTime>>;

export interface VendorPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends VendorLonghandPropertiesFallback<TLength, TTime>,
    VendorShorthandPropertiesFallback<TLength, TTime> {}

export type ObsoletePropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<ObsoleteProperties<TLength, TTime>>;

export type SvgPropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<SvgProperties<TLength, TTime>>;

export interface PropertiesFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends StandardPropertiesFallback<TLength, TTime>,
    VendorPropertiesFallback<TLength, TTime>,
    ObsoletePropertiesFallback<TLength, TTime>,
    SvgPropertiesFallback<TLength, TTime> {}

export type StandardLonghandPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<StandardLonghandPropertiesHyphen<TLength, TTime>>;

export type StandardShorthandPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<StandardShorthandPropertiesHyphen<TLength, TTime>>;

export interface StandardPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends StandardLonghandPropertiesHyphenFallback<TLength, TTime>,
    StandardShorthandPropertiesHyphenFallback<TLength, TTime> {}

export type VendorLonghandPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<VendorLonghandPropertiesHyphen<TLength, TTime>>;

export type VendorShorthandPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<VendorShorthandPropertiesHyphen<TLength, TTime>>;

export interface VendorPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends VendorLonghandPropertiesHyphenFallback<TLength, TTime>,
    VendorShorthandPropertiesHyphenFallback<TLength, TTime> {}

export type ObsoletePropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<ObsoletePropertiesHyphen<TLength, TTime>>;

export type SvgPropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<SvgPropertiesHyphen<TLength, TTime>>;

export interface PropertiesHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}>
  extends StandardPropertiesHyphenFallback<TLength, TTime>,
    VendorPropertiesHyphenFallback<TLength, TTime>,
    ObsoletePropertiesHyphenFallback<TLength, TTime>,
    SvgPropertiesHyphenFallback<TLength, TTime> {}

export type AtRules =
  | "@charset"
  | "@counter-style"
  | "@document"
  | "@font-face"
  | "@font-feature-values"
  | "@font-palette-values"
  | "@import"
  | "@keyframes"
  | "@layer"
  | "@media"
  | "@namespace"
  | "@page"
  | "@property"
  | "@scope"
  | "@scroll-timeline"
  | "@starting-style"
  | "@supports"
  | "@viewport";

export type AdvancedPseudos =
  | ":-moz-any()"
  | ":-moz-dir"
  | ":-webkit-any()"
  | "::cue"
  | "::cue-region"
  | "::part"
  | "::slotted"
  | "::view-transition-group"
  | "::view-transition-image-pair"
  | "::view-transition-new"
  | "::view-transition-old"
  | ":dir"
  | ":has"
  | ":host"
  | ":host-context"
  | ":is"
  | ":lang"
  | ":matches()"
  | ":not"
  | ":nth-child"
  | ":nth-last-child"
  | ":nth-last-of-type"
  | ":nth-of-type"
  | ":where";

export type SimplePseudos =
  | ":-khtml-any-link"
  | ":-moz-any-link"
  | ":-moz-focusring"
  | ":-moz-full-screen"
  | ":-moz-placeholder"
  | ":-moz-read-only"
  | ":-moz-read-write"
  | ":-moz-ui-invalid"
  | ":-moz-ui-valid"
  | ":-ms-fullscreen"
  | ":-ms-input-placeholder"
  | ":-webkit-any-link"
  | ":-webkit-full-screen"
  | "::-moz-placeholder"
  | "::-moz-progress-bar"
  | "::-moz-range-progress"
  | "::-moz-range-thumb"
  | "::-moz-range-track"
  | "::-moz-selection"
  | "::-ms-backdrop"
  | "::-ms-browse"
  | "::-ms-check"
  | "::-ms-clear"
  | "::-ms-expand"
  | "::-ms-fill"
  | "::-ms-fill-lower"
  | "::-ms-fill-upper"
  | "::-ms-input-placeholder"
  | "::-ms-reveal"
  | "::-ms-thumb"
  | "::-ms-ticks-after"
  | "::-ms-ticks-before"
  | "::-ms-tooltip"
  | "::-ms-track"
  | "::-ms-value"
  | "::-webkit-backdrop"
  | "::-webkit-input-placeholder"
  | "::-webkit-progress-bar"
  | "::-webkit-progress-inner-value"
  | "::-webkit-progress-value"
  | "::-webkit-slider-runnable-track"
  | "::-webkit-slider-thumb"
  | "::after"
  | "::backdrop"
  | "::before"
  | "::cue"
  | "::cue-region"
  | "::first-letter"
  | "::first-line"
  | "::grammar-error"
  | "::marker"
  | "::placeholder"
  | "::selection"
  | "::spelling-error"
  | "::target-text"
  | "::view-transition"
  | ":active"
  | ":after"
  | ":any-link"
  | ":before"
  | ":blank"
  | ":checked"
  | ":current"
  | ":default"
  | ":defined"
  | ":disabled"
  | ":empty"
  | ":enabled"
  | ":first"
  | ":first-child"
  | ":first-letter"
  | ":first-line"
  | ":first-of-type"
  | ":focus"
  | ":focus-visible"
  | ":focus-within"
  | ":fullscreen"
  | ":future"
  | ":hover"
  | ":in-range"
  | ":indeterminate"
  | ":invalid"
  | ":last-child"
  | ":last-of-type"
  | ":left"
  | ":link"
  | ":local-link"
  | ":nth-col"
  | ":nth-last-col"
  | ":only