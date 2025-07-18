pe BorderWidth<TLength = (string & {}) | 0> = Globals | DataType.LineWidth<TLength> | (string & {});

  export type Bottom<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type BoxAlign = Globals | "baseline" | "center" | "end" | "start" | "stretch";

  export type BoxDecorationBreak = Globals | "clone" | "slice";

  export type BoxDirection = Globals | "inherit" | "normal" | "reverse";

  export type BoxFlex = Globals | (number & {}) | (string & {});

  export type BoxFlexGroup = Globals | (number & {}) | (string & {});

  export type BoxLines = Globals | "multiple" | "single";

  export type BoxOrdinalGroup = Globals | (number & {}) | (string & {});

  export type BoxOrient = Globals | "block-axis" | "horizontal" | "inherit" | "inline-axis" | "vertical";

  export type BoxPack = Globals | "center" | "end" | "justify" | "start";

  export type BoxShadow = Globals | "none" | (string & {});

  export type BoxSizing = Globals | "border-box" | "content-box";

  export type BreakAfter =
    | Globals
    | "all"
    | "always"
    | "auto"
    | "av