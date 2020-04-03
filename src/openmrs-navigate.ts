import { navigateToUrl } from "single-spa";

export default function openmrsNavigate(spa: boolean, url: string) {
  if (spa) {
    navigateToUrl(url);
  } else {
    const rootRelativeUrlRegex = new RegExp("^/[^/]");
    if (url.match(rootRelativeUrlRegex)) {
      //@ts-ignore
      url = window.openmrsBase + url;
    }
    window.location.assign(url);
  }
}
