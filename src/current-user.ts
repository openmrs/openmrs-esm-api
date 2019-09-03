import { openmrsFetch } from "./openmrs-fetch";

export function getCurrentUser(errBack) {
  return openmrsFetch("/ws/rest/v1/session")
    .then(data => errBack(null, data))
    .catch(e => errBack(e, null));
}
