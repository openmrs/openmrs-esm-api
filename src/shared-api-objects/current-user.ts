import { BehaviorSubject } from "rxjs";
import { openmrsObservableFetch, FetchResponse } from "../openmrs-fetch";
import { mergeAll, filter, map } from "rxjs/operators";

const userSubject = new BehaviorSubject(
  openmrsObservableFetch("/ws/rest/v1/session")
);

export function getCurrentUser(opts: CurrentUserOptions = {}) {
  return userSubject.asObservable().pipe(
    mergeAll(),
    map((r: FetchResponse) => r.data),
    filter(user => opts.includeUnauthenticated || user.authenticated)
  );
}

export function refetchUser() {
  userSubject.next(openmrsObservableFetch("/ws/rest/v1/session"));
}

type CurrentUserOptions = {
  includeUnauthenticated?: boolean;
};
