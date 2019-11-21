import { defineConfigSchema } from "@openmrs/esm-module-config";
import "./set-public-path";

defineConfigSchema("@openmrs/esm-api", {
  redirectAuthFailure: {
    enabled: {
      default: true
    },
    url: {
      //@ts-ignore
      default: window.getOpenmrsSpaBase() + "login"
    },
    errors: {
      default: [401]
    },
    resolvePromise: false
  }
});

export { openmrsFetch, openmrsObservableFetch } from "./openmrs-fetch";
export { fhir } from "./fhir";
export {
  getCurrentUser,
  refetchCurrentUser,
  userHasAccess
} from "./shared-api-objects/current-user";

export {
  getCurrentPatient,
  refetchCurrentPatient
} from "./shared-api-objects/current-patient";

export {
  default as UserHasAccessReact
} from "./shared-api-objects/user-has-access-react.component";

export { omrsBackendDependencies } from "./openmrs-backend-dependencies";
