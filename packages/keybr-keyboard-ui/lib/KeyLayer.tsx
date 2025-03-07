import {
  type Keyboard,
  type KeyId,
  type KeyShape,
  useKeyboard,
} from "@keybr/keyboard";
import {
  type ComponentType,
  memo,
  type ReactElement,
  useMemo,
  useRef,
} from "react";
import { type KeyProps, makeKeyComponent } from "./Key.tsx";
import { Surface } from "./shapes.tsx";

export const KeyLayer = memo(function KeyLayer({
  depressedKeys = [],
  toggledKeys = [],
  showColors = false,
  onKeyHoverIn,
  onKeyHoverOut,
  onKeyClick,
}: {
  readonly depressedKeys?: readonly KeyId[];
  readonly toggledKeys?: readonly KeyId[];
  readonly showColors?: boolean;
  readonly onKeyHoverIn?: (key: KeyId, elem: Element) => void;
  readonly onKeyHoverOut?: (key: KeyId, elem: Element) => void;
  readonly onKeyClick?: (key: KeyId, elem: Element) => void;
}) {
  const keyboard = useKeyboard();
  const svgRef = useRef<SVGSVGElement>(null);
  const children = useMemo(() => getKeyElements(keyboard), [keyboard]);
  return (
    <Surface
      ref={svgRef}
      onMouseOver={(event) => {
        relayEvent(svgRef.current!, event, onKeyHoverIn);
      }}
      onMouseOut={(event) => {
        relayEvent(svgRef.current!, event, onKeyHoverOut);
      }}
      onClick={(event) => {
        relayEvent(svgRef.current!, event, onKeyClick);
      }}
    >
      {children.map((child) =>
        child.select(depressedKeys, toggledKeys, showColors),
      )}
    </Surface>
  );
});

function relayEvent(
  root: Element,
  { target }: { readonly target: any },
  handler?: (key: KeyId, elem: Element) => void,
) {
  while (
    handler != null &&
    target instanceof Element &&
    root.contains(target)
  ) {
    const key = (target as SVGElement).dataset["key"];
    if (key) {
      handler(key, target);
      return;
    }
    target = target.parentElement;
  }
}

function getKeyElements(keyboard: Keyboard): MemoizedKeyElements[] {
  return [...keyboard.shapes.values()].map(
    (shape) => new MemoizedKeyElements(keyboard, shape),
  );
}

class MemoizedKeyElements {
  readonly component: ComponentType<KeyProps>;
  readonly state0: ReactElement<KeyProps>;
  readonly state1: ReactElement<KeyProps>;
  readonly state2: ReactElement<KeyProps>;
  readonly state3: ReactElement<KeyProps>;
  readonly state4: ReactElement<KeyProps>;
  readonly state5: ReactElement<KeyProps>;
  readonly state6: ReactElement<KeyProps>;
  readonly state7: ReactElement<KeyProps>;

  constructor(
    readonly keyboard: Keyboard,
    readonly shape: KeyShape,
  ) {
    const Component = makeKeyComponent(keyboard.layout.language, shape);
    this.component = Component;
    this.state0 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={false}
        showColors={false}
      />
    );
    this.state1 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={false}
        showColors={false}
      />
    );
    this.state2 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={true}
        showColors={false}
      />
    );
    this.state3 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={true}
        showColors={false}
      />
    );
    this.state4 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={false}
        showColors={true}
      />
    );
    this.state5 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={false}
        showColors={true}
      />
    );
    this.state6 = (
      <Component
        key={shape.id}
        depressed={false}
        toggled={true}
        showColors={true}
      />
    );
    this.state7 = (
      <Component
        key={shape.id}
        depressed={true}
        toggled={true}
        showColors={true}
      />
    );
  }

  select(
    depressedKeys: readonly KeyId[],
    toggledKeys: readonly KeyId[],
    showColors: boolean,
  ): ReactElement<KeyProps> {
    const { shape } = this;
    const depressed = depressedKeys.includes(shape.id);
    const toggled = toggledKeys.includes(shape.id);
    if (!showColors) {
      if (!toggled) {
        if (!depressed) {
          return this.state0;
        } else {
          return this.state1;
        }
      } else {
        if (!depressed) {
          return this.state2;
        } else {
          return this.state3;
        }
      }
    } else {
      if (!toggled) {
        if (!depressed) {
          return this.state4;
        } else {
          return this.state5;
        }
      } else {
        if (!depressed) {
          return this.state6;
        } else {
          return this.state7;
        }
      }
    }
  }
}
