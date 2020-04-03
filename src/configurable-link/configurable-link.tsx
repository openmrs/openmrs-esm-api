import React from "react";
import openmrsNavigate from "../openmrs-navigate";

type ConfigurableLinkProps = {
  label: string;
  /** Whether or not `url` refers to a SPA route */
  spa: boolean;
  /** If `spa`, this should be a route. Otherwise it can be any of
   *  * An absolute URL
   *  * A root-relative URL (beinning with `/`), relative to the OpenMRS base URL
   *  * A path-relative URL (not beginning with `/`)
   */
  url: string;
  className?: string;
};

export default function ConfigurableLink({
  label,
  spa,
  url,
  className = ""
}: ConfigurableLinkProps) {
  return (
    <a
      className={className}
      onClick={event =>
        filterAlternateClicks(event, () => openmrsNavigate(spa, url))
      }
      href={url}
    >
      {label}
    </a>
  );
}

function filterAlternateClicks(event, callback: Function) {
  if (!event.ctrlKey && event.which != 2 && event.which != 3) {
    event.preventDefault();
    callback();
  }
}
