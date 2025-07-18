ndefined;
    marks?: Marks | undefined;
    "page-orientation"?: PageOrientation | undefined;
    size?: Size<TLength> | undefined;
  }

  export type PageFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<Page<TLength, TTime>>;

  export type PageHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<PageHyphen<TLength, TTime>>;

  export interface Property<TLength = (string & {}) | 0, TTime = string & {}> {
    inherits?: Inherits | undefined;
    initialValue?: string | undefined;
    syntax?: string | undefined;
  }

  export interface PropertyHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
    inherits?: Inherits | undefined;
    "initial-value"?: string | undefined;
    syntax?: string | undefined;
  }

  export type PropertyFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<Property<TLength, TTime>>;

  export type PropertyHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<PropertyHyphen<TLength, TTime>>;

  export interface Viewport<TLength = (string & {}) | 0, TTime = string & {}> {
    height?: Height<TLength> | undefined;
    maxHeight?: MaxHeight<TLength> | undefined;
    maxWidth?: MaxWidth<TLength> | undefined;
    maxZoom?: MaxZoom | undefined;
    minHeight?: MinHeight<TLength> | undefined;
    minWidth?: MinWidth<TLength> | undefined;
    minZoom?: MinZoom | undefined;
    orientation?: Orientation | undefined;
    userZoom?: UserZoom | undefined;
    viewportFit?: ViewportFit | undefined;
    width?: Width<TLength> | undefined;
    zoom?: Zoom | undefined;
  }

  export interface ViewportHyphen<TLength = (string & {}) | 0, TTime = string & {}> {
    height?: Height<TLength> | undefined;
    "max-height"?: MaxHeight<TLength> | undefined;
    "max-width"?: MaxWidth<TLength> | undefined;
    "max-zoom"?: MaxZoom | undefined;
    "min-height"?: MinHeight<TLength> | undefined;
    "min-width"?: MinWidth<TLength> | undefined;
    "min-zoom"?: MinZoom | undefined;
    orientation?: Orientation | undefined;
    "user-zoom"?: UserZoom | undefined;
    "viewport-fit"?: ViewportFit | undefined;
    width?: Width<TLength> | undefined;
    zoom?: Zoom | undefined;
  }

  export type ViewportFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<Viewport<TLength, TTime>>;

  export type ViewportHyphenFallback<TLength = (string & {}) | 0, TTime = string & {}> = Fallback<ViewportHyphen<TLength, TTime>>;

  type Range = "auto" | (string & {});

  type SpeakAs = "auto" | "bullets" | "numbers" | "spell-out" | "words" | (string & {});

  type System = "additive" | "alphabetic" | "cyclic" | "fixed" | "numeric" | "symbolic" | (string & {});

  type FontFeatureSettings = "normal" | (string & {});

  type AscentOverride = "normal" | (string & {});

  type DescentOverride = "normal" | (string & {});

  type FontDisplay = "auto" | "block" | "fallback" | "optional" | "swap";

  type FontStretch = DataType.FontStretchAbsolute | (string & {});

  type FontStyle = "italic" | "normal" | "oblique" | (string & {});

  type FontVariant =
    | DataType.EastAsianVariantValues
    | "all-petite-caps"
    | "all-small-caps"
    | "common-ligatures"
    | "contextual"
    | "diagonal-fractions"
    | "discretionary-ligatures"
    | "full-width"
    | "historical-forms"
    | "historical-ligatures"
    | "lining-nums"
    | "no-common-ligatures"
    | "no-contextual"
    | "no-discretionary-ligatures"
    | "no-historical-ligatures"
    | "none"
    | "normal"
    | "oldstyle-nums"
    | "ordinal"
    | "petite-caps"
    | "proportional-nums"
    | "proportional-width"
    | "ruby"
    | "slashed-zero"
    | "small-caps"
    | "stacked-fractions"
    | "tabular-nums"
    | "titling-caps"
    | "unicase"
    | (string & {});

  type FontVariationSettings = "normal" | (string & {});

  type FontWeight = DataType.FontWeightAbsolute | (string & {});

  type LineGapOverride = "normal" | (string & {});

  type BasePalette = "dark" | "light" | (number & {}) | (string & {});

  type Bleed<TLength> = TLength | "auto";

  type Marks = "crop" | "cross" | "none" | (string & {});

  type PageOrientation = "rotate-left" | "rotate-right" | "upright";

  type Size<TLength> = DataType.PageSize | TLength | "auto" | "landscape" | "portrait" | (string & {});

  type Inherits = "false" | "true";

  type Height<TLength> = DataType.ViewportLength<TLength> | (string & {});

  type MaxHeight<TLength> = DataType.ViewportLength<TLength>;

  type MaxWidth<TLength> = DataType.ViewportLength<TLength>;

  type MaxZoom = "auto" | (string & {}) | (number & {});

  type MinHeight<TLength> = DataType.ViewportLength<