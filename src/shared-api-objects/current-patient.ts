import { ReplaySubject, Observable } from "rxjs";
import { FetchResponse } from "../openmrs-fetch";
import { fhir } from "../fhir";
import { mergeAll, filter, map } from "rxjs/operators";

let currentPatientUuid;
const currentPatientSubject = new ReplaySubject(1);

window.addEventListener("single-spa:routing-event", () => {
  const u = getPatientUuidFromUrl();
  if (u && currentPatientUuid !== u) {
    currentPatientUuid = u;
    currentPatientSubject.next(
      fhir.read({ type: "Patient", patient: currentPatientUuid })
    );
  }
});

function getPatientUuidFromUrl() {
  const match = /\/patient\/([a-zA-Z0-9]+)\/?/.exec(window.location.pathname);
  return match && match[1];
}

export function getCurrentPatient(
  opts: PatientFhirOptions = { includeConfig: false }
): Observable<Patient> {
  return currentPatientSubject.asObservable().pipe(
    mergeAll(),
    map((r: CurrentPatientFhirResponse) => (opts.includeConfig ? r : r.data)),
    filter(Boolean)
  ) as Observable<Patient>;
}

export function refetchCurrentPatient() {
  currentPatientSubject.next(
    fhir.read({ type: "Patient", patient: currentPatientUuid })
  );
}

// exported only for testing purposes. Should not be exported outside of openmrs-esm-api to other modules
// The browser's url and routes are the only thing that should determine the current uuid.
// export function setCurrentPatientUuid(uuid) {
//   currentPatientUuid = uuid
// }

type PatientFhirOptions = {
  includeConfig: boolean;
};

interface Patient {
  uuid: string;
  display: string;
  active: boolean;
  address: [any];
  birthDate: string;
  deceasedBoolean: boolean;
  gender: string;
  identifier: [any];
  name: [any];
  [anythingElse: string]: any;
}

interface CurrentPatientFhirResponse extends FetchResponse {
  config: {};
  data: {};
}
