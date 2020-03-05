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
    resolvePromise: {
      default: false
    }
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
  refetchCurrentPatient,
  getCurrentPatientUuid
} from "./shared-api-objects/current-patient";
export {
  useCurrentPatient
} from "./shared-api-objects/use-current-patient.hook";

export {
  default as UserHasAccessReact
} from "./shared-api-objects/user-has-access-react.component";

export { omrsBackendDependencies } from "./openmrs-backend-dependencies";

export {
  newWorkspaceItem,
  getNewWorkspaceItem,
  WorkspaceItem
} from "./workspace/workspace.resource";
