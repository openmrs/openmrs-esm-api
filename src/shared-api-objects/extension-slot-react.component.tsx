import React from "react";
import { renderExtension } from "@openmrs/esm-extension-manager";

export interface ExtensionSlotReactProps {
  name: string;
}

declare global {
  interface Window {
    renderOpenmrsExtension(
      target: HTMLElement,
      name: string,
      params: any
    ): CancelLoading;
  }
}

interface CancelLoading {
  (): void;
}

const ExtensionSlotReact = ({ name }: ExtensionSlotReactProps) => {
  const ref = React.useRef<HTMLSlotElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      return renderExtension(ref.current, name, {});
    }
  }, []);

  return <slot ref={ref} />;
};

export default ExtensionSlotReact;
