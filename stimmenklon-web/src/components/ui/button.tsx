pe HyphenateCharacter = Globals | "auto" | (string & {});

  export type HyphenateLimitChars = Globals | "auto" | (string & {}) | (number & {});

  export type Hyphens = Globals | "auto" | "manual" | "none";

  export type ImageOrientation = Globals | "flip" | "from-image" | (string & {});

  export type ImageRendering = Globals | "-moz-crisp-edges" | "-webkit-optimize-contrast" | "auto" | "crisp-edges" | "pixelated";

  export type ImageResolution = Globals | "from-image" | (string & {});

  export type ImeMode = Globals | "active" | "auto" | "disabled" | "inactive" | "normal";

  export type InitialLetter = Globals | "normal" | (string & {}) | (number & {});

  export type InlineSize<TLength = (string & {}) | 0> =
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

  export type InputSecurity = Globals | "auto" | "none";

  export type Inset<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetBlock<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetBlockEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetBlockStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetInline<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetInlineEnd<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type InsetInlineStart<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type Isolation = Globals | "auto" | "isolate";

  export type JustifyContent = Globals | DataType.ContentDistribution | DataType.ContentPosition | "left" | "normal" | "right" | (string & {});

  export type JustifyItems = Globals | DataType.SelfPosition | "baseline" | "left" | "legacy" | "normal" | "right" | "stretch" | (string & {});

  export type JustifySelf = Globals | Data