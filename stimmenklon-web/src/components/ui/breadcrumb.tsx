ant =
    | Globals
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

  export type FontVariantAlternates = Globals | "historical-forms" | "normal" | (string & {});

  export type FontVariantCaps = Globals | "all-petite-caps" | "all-small-caps" | "normal" | "petite-caps" | "small-caps" | "titling-caps" | "unicase";

  export type FontVariantEastAsian = Globals | DataType.EastAsianVariantValues | "full-width" | "normal" | "proportional-width" | "ruby" | (string & {});

  export type FontVariantEmoji = Globals | "emoji" | "normal" | "text" | "unicode";

  export type FontVariantLigatures =
    | Globals
    | "common-ligatures"
    | "contextual"
    | "discretionary-ligatures"
    | "historical-ligatures"
    | "no-common-ligatures"
    | "no-contextual"
    | "no-discretionary-ligatures"
    | "no-historical-ligatures"
    | "none"
    | "normal"
    | (string & {});

  export type FontVariantNumeric =
    | Globals
    | "diagonal-fractions"
    | "lining-nums"
    | "normal"
    | "oldstyle-nums"
    | "ordinal"
    | "proportional-nums"
    | "slashed-zero"
    | "stacked-fractions"
    | "tabular-nums"
    | (string & {});

  export type FontVariantPosition = Globals | "normal" | "sub" | "super";

  export type FontVariationSettings = Globals | "normal" | (string & {});

  export type FontWeight = Globals | DataType.FontWeightAbsolute | "bolder" | "lighter";

  export type ForcedColorAdjust = Globals | "auto" | "none";

  export type Gap<TLength = (string & {}) | 0> = Globals | TLength | "normal" | (string & {});

  export type Grid = Globals | "none" | (string & {});

  export type GridArea = Globals | DataType.GridLine | (string & {});

  export type GridAutoColumns<TLength = 