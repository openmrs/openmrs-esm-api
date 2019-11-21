import React from "react";
import {
  getCurrentPatient,
  getCurrentPatientUuid,
  PatientUuid
} from "./current-patient";
import { createErrorHandler, reportError } from "@openmrs/esm-error-handling";

/* This React hook returns the current patient, as specified by the current route. It returns
 * all the information needed to render a loading state, error state, and normal/success state.
 */
export function useCurrentPatient(): [
  boolean,
  NullablePatient,
  PatientUuid,
  Error | null
] {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    const sub = getCurrentPatientUuid().subscribe(
      uuid => dispatch({ type: ActionTypes.newUuid, uuid }),
      createErrorHandler()
    );
    return () => {
      sub.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(
      patient => dispatch({ type: ActionTypes.newPatient, patient }),
      err => {
        dispatch({ type: ActionTypes.patientLoadError, err });
        reportError(err);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return [state.isLoadingPatient, state.patient, state.patientUuid, state.err];
}

function reducer(
  state: CurrentPatientState,
  action: Action
): CurrentPatientState {
  switch (action.type) {
    case ActionTypes.newUuid:
      return {
        ...state,
        patientUuid: action.uuid,
        patient: null,
        isLoadingPatient: true,
        err: null
      };
    case ActionTypes.newPatient:
      return {
        ...state,
        patient: action.patient,
        isLoadingPatient: false,
        err: null
      };
    case ActionTypes.patientLoadError:
      return {
        ...state,
        patient: null,
        isLoadingPatient: false,
        err: action.err
      };
    default:
      throw Error();
  }
}

const initialState: CurrentPatientState = {
  patientUuid: null,
  patient: null,
  isLoadingPatient: true,
  err: null
};

type NullablePatient = fhir.Patient | null;

type CurrentPatientState = {
  patientUuid: PatientUuid;
  patient: NullablePatient;
  isLoadingPatient: boolean;
  err: Error | null;
};

type NewUuid = {
  type: ActionTypes.newUuid;
  uuid: PatientUuid;
};

type NewPatient = {
  type: ActionTypes.newPatient;
  patient: fhir.Patient;
};

type PatientLoadError = {
  type: ActionTypes.patientLoadError;
  err: Error | null;
};

type Action = NewUuid | NewPatient | PatientLoadError;

enum ActionTypes {
  newUuid = "newUuid",
  newPatient = "newPatient",
  patientLoadError = "patientLoadError"
}
