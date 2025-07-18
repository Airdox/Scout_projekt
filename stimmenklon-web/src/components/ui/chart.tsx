als | "circle" | "dot" | "double-circle" | "filled" | "none" | "open" | "sesame" | "triangle" | (string & {});

  export type TextIndent<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type TextJustify = Globals | "auto" | "inter-character" | "inter-word" | "none";

  export type TextOrientation = Globals | "mixed" | "sideways" | "upright";

  export type TextOverflow = Globals | "clip" | "ellipsis" | (string & {});

  export type TextRendering = Globals | "auto" | "geometricPrecision" | "optimizeLegibility" | "optimizeSpeed";

  export type TextShadow = Globals | "none" | (string & {});

  export type TextSizeAdjust = Globals | "auto" | "none" | (string & {});

  export type TextTransform = Globals | "capitalize" | "full-size-kana" | "full-width" | "lowercase" | "none" | "uppercase";

  export type TextUnderlineOffset<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type TextUnderlinePosition = Globals | "auto" | "from-font" | "left" | "right" | "under" | (string & {});

  export type TextWrap = Globals | "balance" | "nowrap" | "pretty" | "stable" | "wrap";

  export type TimelineScope = Globals | "none" | (string & {});

  export type Top<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type TouchAction =
    | Globals
    | "-ms-manipulation"
    | "-ms-none"
    | "-ms-pinch-zoom"
    | "auto"
    | "manipulation"
    | "none"
    | "pan-down"
    | "pan-left"
    | "pan-right"
    | "pan-up"
    | "pan-x"
    | "pan-y"
    | "pinch-zoom"
    | (string & {});

  export type Transform = Globals | "none" | (string & {});

  export type TransformBox = Globals | "border-box" | "content-box" | "fill-box" | "stroke-box" | "view-box";

  export type TransformOrigin<TLength = (string & {}) | 0> = Globals | TLength | "bottom" | "center" | "left" | "right" | "top" | (string & {});

  export type TransformStyle = Globals | "flat" | "preserve-3d";

  export type Transition<TTime = string & {}> = Globals | DataType.SingleTransition<TTime> | (string & {});

  export type TransitionBehavior = Globals | "allow-discrete" | "normal" | (string & {});

  export type TransitionDelay<TTime = string & {}> = Globals | TTime | (string & {});

  export type TransitionDuration<TTime = string & {}> = Globals | TTime | (string & {});

  export type TransitionProperty = Globals | "all" | "none" | (string & {});

  export type TransitionTimingFunction = Globals | DataType.EasingFunction | (string & {});

  export type Translate<TLength = (string & {}) | 0> = Globals | TLength | "none" | (string & {});

  export type UnicodeBidi =
    | Globals
    | "-moz-isolate"
    | "-moz-isolate-override"
    | "-moz-plaintext"
    | "-webkit-isolate"
    | "-webkit-isolate-override"
    | "-webkit-plaintext"
    | "bidi-override"
    | "embed"
    | "isolate"
    | "isolate-override"
    | "normal"
    | "plaintext";

  export type UserSelect = Globals | "-moz-none" | "all" | "auto" | "contain" | "element" | "none" | "text";

  export type VerticalAlign<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "baseline"
    | "bottom"
    | "middle"
    | "sub"
    | "super"
    | "text-bottom"
    | "text-top"
    | "top"
    | (string & {});

  export type ViewTimeline = Globals | "none" | (string & {});

  export type ViewTimelineAxis = Globals | "block" | "inline" | "x" | "y" | (string & {});

  export type ViewTimelineInset<TLength = (string & {}) | 0> = Globals | TLength | "auto" | (string & {});

  export type ViewTimelineName = Globals | "none" | (string & {});

  export type ViewTransitionName = Globals | "none" | (string & {});

  export type Visibility = Globals | "collapse" | "hidden" | "visible";

  export type WhiteSpace =
    | Globals
    | "-moz-pre-wrap"
    | "balance"
    | "break-spaces"
    | "collapse"
    | "discard"
    | "discard-after"
    | "discard-before"
    | "discard-inner"
    | "none"
    | "normal"
    | "nowrap"
    | "pre"
    | "pre-line"
    | "pre-wrap"
    | "preserve"
    | "preserve-breaks"
    | "preserve-spaces"
    | "pretty"
    | "stable"
    | "wrap"
    | (string & {});

  export type WhiteSpaceCollapse = Globals | "break-spaces" | "collapse" | "discard" | "preserve" | "preserve-breaks" | "preserve-spaces";

  export type WhiteSpaceTrim = Globals | "discard-after" | "discard-before" | "discard-inner" | "none" | (string & {});

  export type Widows = Globals | (number & {}) | (string & {});

  export type Width<TLength = (string & {}) | 0> =
    | Globals
    | TLength
    | "-moz-fit-content"
    | "-moz-max-content"
    | "-moz-min-content"
    | "-webkit-fit-content"
    | "-webkit-max-content"
    | "auto"
    | "fit-content"
    | "intrinsic"
    | "max-content"
    | "min-content"
    | "min-intrinsic"
    | (string & {});

  export type WillChange = Globals | DataType.AnimateableFeature | "auto" | (string & {});

  export type WordBreak = Globals | "break-all" | "break-word" | "keep-all" | "normal";

  export type WordSpacing<TLength = (string & {}) | 0> = Globals | TLength | "normal";

  export type WordWrap = Globals | "break-word" | "normal";

  export type WritingMode = Globals | "horizontal-tb" | "sideways-lr" | "sideways-rl" | "vertical-lr" | "vertical-rl";

  export type ZIndex = Globals | "auto" | (number & {}) | (string & {});

  export type Zoom = Globals | "normal" | "reset" | (string & {}) | (number & {});

  export type MozAppearance =
    | Globals
    | "-moz-mac-unified-toolbar"
    | "-moz-win-borderless-glass"
    | "-moz-win-browsertabbar-toolbox"
    | "-moz-win-communications-toolbox"
    | "-moz-win-communicationstext"
    | "-moz-win-exclude-glass"
    | "-moz-win-glass"
    | "-moz-win-media-toolbox"
    | "-moz-win-mediatext"
    | "-moz-window-button-box"
    | "-moz-window-button-box-maximized"
    | "-moz-window-button-close"
    | "-moz-window-button-maximize"
    | "-moz-window-button-minimize"
    | "-moz-window-button-restore"
    | "-moz-window-frame-bottom"
    | "-moz-window-frame-left"
    | "-moz-window-frame-right"
    | "-moz-window-titlebar"
    | "-moz-window-titlebar-maximized"
    | "button"
    | "button-arrow-down"
    | "button-arrow-next"
    | "button-arrow-previous"
    | "button-arrow-up"
    | "button-bevel"
    | "button-focus"
    | "caret"
    | "checkbox"
    | "checkbox-container"
    | "checkbox-label"
    | "checkmenuitem"
    | "dualbutton"
    | "groupbox"
    | "listbox"
    | "listitem"
    | "menuarrow"
    | "menubar"
    | "menucheckbox"
    | "menuimage"
    | "menuitem"
    | "menuitemtext"
    | "menulist"
    | "menulist-button"
    | "menulist-text"
    | "menulist-textfield"
    | "menupopup"
    | "menuradio"
    | "menuseparator"
    | "meterbar"
    | "meterchunk"
    | "none"
    | "progressbar"
    | "progressbar-vertical"
    | "progresschunk"
    | "progresschunk-vertical"
    | "radio"
    | "radio-container"
    | "radio-label"
    | "radiomenuitem"
    | "range"
    | "range-thumb"
    | "resizer"
    | "resizerpanel"
    | "scale-horizontal"
    | "scale-vertical"
    | "scalethumb-horizontal"
    | "scalethumb-vertical"
    | "scalethumbend"
    | "scalethumbstart"
    | "scalethumbtick"
    | "scrollbarbutton-down"
    | "scrollbarbutton-left"
    | "scrollbarbutton-right"
    | "scrollbarbutton-up"
    | "scrollbarthumb-horizontal"
    | "scrollbarthumb-vertical"
    | "scrollbartrack-horizontal"
    | "scrollbartrack-vertical"
    | "searchfield"
    | "separator"
    | "sheet"
    | "spinner"
    | "spinner-downbutton"
    | "spinner-textfield"
    | "spinner-upbutton"
    | "splitter"
    | "statusbar"
    | "statusbarpanel"
    | "tab"
    | "tab-scroll-arrow-back"
    | "tab-scroll-arrow-forward"
    | "tabpanel"
    | "tabpanels"
    | "textfield"
    | "textfield-multiline"
    | "toolbar"
    | "toolbarbutton"
    | "toolbarbutton-dropdown"
    | "toolbargripper"
    | "toolbox"
    | "tooltip"
    | "treeheader"
    | "treeheadercell"
    | "treeheadersortarrow"
    | "treeitem"
    | "treeline"
    | "treetwisty"
    | "treetwistyopen"
    | "treeview";

  export type MozBinding = Globals | "none" | (string & {});

  export type MozBorderBottomColors = Globals | DataType.Color | "none" | (string & {});

  export type MozBorderLeftColors = Globals | DataType.Color | "none" | (string & {});

  export type MozBorderRightColors = Globals | DataType.Color | "none" | (string & {});

  export type MozBorderTopColors = Globals | DataType.Color | "none" | (string & {});

  export type MozContextProperties = Globals | "fill" | "fill-opacity" | "none" | "stroke" | "stroke-opacity" | (string & {});

  export type MozFloatEdge = Globals | "border-box" | "content-box" | "margin-box" | "padding-box";

  export type MozForceBrokenImageIcon = Globals | 0 | (string & {}) | 1;

  export type MozImageRegion = Globals | "auto" | (string & {});

  export type MozOrient = Globals | "block" | "horizontal" | "inline" | "vertical";

  export type MozOutlineRadius<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type MozOutlineRadiusBottomleft<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type MozOutlineRadiusBottomright<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type MozOutlineRadiusTopleft<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type MozOutlineRadiusTopright<TLength = (string & {}) | 0> = Globals | TLength | (string & {});

  export type MozStackSizing = Globals | "ignore" | "stretch-to-fit";

  export type MozTextBlink = Globals | "blink" | "none";

  export type MozUserFocus = Globals | "ignore" | "none" | "normal" | "select-after" | "select-all" | "select-befor