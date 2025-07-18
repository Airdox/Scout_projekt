"border" | "content" | "padding" | (string & {});

  export type WebkitMaskPosition<TLength = (string & {}) | 0> = Globals | DataType.Position<TLength> | (string & {});

  export type WebkitMaskPositionX<TLength = (string & {}) | 0> = Globals | TLength | "center" | "left" | "right" | (string & {});

  export type WebkitMaskPositionY<TLength = (string & {}) | 0> = Globals | TLength | "bottom" | "center" | "top" | (string & {});

  export type WebkitMaskRepeat = Globals | DataType.RepeatStyle | (string & {});

  export type WebkitMaskRepeatX = Globals | "no-repeat" | "repeat" | "round" | "space";

  export type WebkitMaskRepeatY = Globals | "no-repeat" | "repeat" | "round" | "space";

  export type WebkitMaskSize<TLength = (string & {}) | 0> = Globals | DataType.BgSize<TLength>