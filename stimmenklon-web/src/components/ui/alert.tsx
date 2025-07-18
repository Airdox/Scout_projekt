eRangeName | TLength | "normal" | (string & {});

  export type AnimationTimeline = Globals | DataType.SingleAnimationTimeline | (string & {});

  export type AnimationTimingFunction = Globals | DataType.EasingFunction | (string & {});

  export type Appearance = Globals | DataType.CompatAuto | "auto" | "menulist-button" | "none" | "textfield";

  export type AspectRatio = Globals | "auto" | (string & {}) | (number & {});

  export type Azimuth =
    | Globals
    | "behind"
    | "center"
    | "center-left"
    | "center-right"
    | "far-left"
    | "far-right"
    | "left"
    | "left-side"
    | "leftwards"
    | "right"
    | "right-side"
    | "rightwards"
    | (string & {});

  export type BackdropFilter = Globals | "none" | (string & {});

  export type BackfaceVisibility = Globals | "hidden" | "visible";

  export type Background<TLength = (string & {}) | 0> = Globals | DataType.FinalBgLayer<TLength> | (string & {});

  export type BackgroundAttachment = Globals | DataType.Attachment | (string & {});

  export type BackgroundBlendMode = Globals | DataType.BlendMode | (string & {});

  export type BackgroundClip = Globals | DataType.Box | (string & {});

  export type BackgroundColor = Globals | DataType.Color;

  export type BackgroundImage = Globals | "none" | (string & {});

  export type BackgroundOrigin = Globals | DataType.Box | (string & {});

  export type BackgroundPosition<TLength = (string & {}) | 0> = Globals | DataType.BgPosition<TLength> | (string & {});

  export type BackgroundPositionX<TLength = (string & {}) | 0> = Globals | TLength | "center" | "left" | "righ