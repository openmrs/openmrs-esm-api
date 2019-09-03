import { openmrsFetch } from "./openmrs-fetch";

export function getCurrentUser(errBack) {
  return (
    openmrsFetch("/ws/rest/v1/session")
      //@ts-ignore
      .then(res => errBack(null, res.data.user))
      .catch(e => errBack(e, null))
  );
}
