 TLength | "auto" | (string & {});

  export type MarginRight<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type MarginTop<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type MarginTrim = Globals | "all" | "in-flow" | "none";

  export type Mask<TLength = (string & {}) | 0> = Globals | DataType.MaskLayer<TLength> | (string & {});

  export type MaskBorder = Globals | "alpha" | "luminance" | "none" | "repeat" | "round" | "space" | "stretch" | (string & {}) | (number & {});

  export type MaskBorderMode = Globals | "alpha" | "luminance";

  export type MaskBorderOutset<TLength = (string & {}) | 0> = Globals | TLength | (string & {}) | (number & {});

  export type MaskBorderRepeat = Globals | "repeat" | "round" | "space" | "stretch" | (string & {});

  export type MaskBorderSlice = Globals | (string & {}) | (number & {});

  export type MaskBorderSource = Globals | "none" | (string & {});

  export type MaskBorderWidth<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {}) | (number & {});

  export type MaskClip = Globals | DataType.GeometryBox | "no-clip" | (string & {});

  export type MaskComposite = Globals | DataType.CompositingOperator | (string & {});

  export type MaskImage = Globals | "none" | (string & {});

  export type MaskMode = Globals | DataType.MaskingMode | (string & {});

  export type MaskOrigin = Globals | DataType.GeometryBox | (string & {});

  export type MaskPosition<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength> | (string & {});

  export type MaskRepeat = Globals | DataType.RepeatStyle | (string & {});

  export type MaskSize<TLength = (string & {}) | 0> = Globals | DataType.BgSize<TLength> | (string & {});

  export type MaskType = Globals | "alpha" | "luminance";

  export type MasonryAutoFlow = Globals | "definite-first" | "next" | "ordered" | "pack" | (string & {});

  export type MathDepth = Globals | "auto-add" | (string & {}) | (number & {});

  export type MathShift = Globals | "compact" | "normal";

  export type MathStyle = Globals | "compact" | "normal";

  export type MaxBlockSize<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-max-content"
    | "-moz-min-content"
    | "-webkit-fill-available"
    | "fit-content"
    | "max-content"
    | "min-content"
    | "none"
    | (string & {});

  export type MaxHeight<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-fit-content"
    | "-moz-max-content"
    | "-moz-min-content"
    | "-webkit-fit-content"
    | "-webkit-max-content"
    | "-webkit-min-content"
    | "fit-content"
    | "intrinsic"
    | "max-content"
    | "min-content"
    | "none"
    | (string & {});

  export type MaxInlineSize<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-fit-content"
    | "-moz-max-content"
    | "