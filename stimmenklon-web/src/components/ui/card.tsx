
  export type MinInlineSize<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-fit-content"
    | "-moz-max-content"
    | "-moz-min-content"
    | "-webkit-fill-available"
    | "auto"
    | "fit-content"
    | "max-content"
    | "min-content"
    | (string & {});

  export type MinWidth<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-fit-content"
    | "-moz-max-content"
    | "-moz-min-content"
    | "-webkit-fill-available"
    | "-webkit-fit-content"
    | "-webkit-max-content"
    | "-webkit-min-content"
    | "auto"
    | "fit-content"
    | "intrinsic"
    | "max-content"
    | "min-content"
    | "min-intrinsic"
    | (string & {});

  export type MixBlendMode = Globals | DataType.BlendMode | "plus-lighter";

  export type Offset<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength> | "auto" | "none" | "normal" | (string & {});

  export type OffsetDistance<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type OffsetPath = Globals | "none" | (string & {});

  export type OffsetRotate = Globals | "auto" | "reverse" | (string & {});

  export type ObjectFit = Globals | "contain" | "cover" | "fill" | "none" | "scale-down";

  export type ObjectPosition<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength>;

  export type OffsetAnchor<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength> | "auto";

  export type OffsetPosition<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength> | "auto" | "normal";

  export type Opacity = Globals | (string & {}) | (number & {});

  export type Order = Globals | (number & {}) | (string & {});

  export type Orphans = Globals | (number & {}) | (string & {});

  export type Outline<TLength = (string & {}) | 0> = Globals | DataType.Color | DataType.LineStyle | DataType.LineWidth<TLength> | "auto" | "invert" | (string & {});

  export type OutlineColor = Globals | DataType.Color | "invert";

 