import "./set-public-path";
export { openmrsFetch, openmrsObservableFetch } from "./openmrs-fetch";
export { fhir } from "./fhir";
export {
  getCurrentUser,
  refetchCurrentUser,
  userHasAccess
} from "./shared-api-objects/current-user";

export { getCurrentPatient } from "./shared-api-objects/current-patient";

export {
  default as UserHasAccessReact
} from "./shared-api-objects/user-has-access-react.component";

export { omrsBackendDependencies } from "./openmrs-backend-dependencies";
