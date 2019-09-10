import { BehaviorSubject } from "rxjs";
import { openmrsObservableFetch, FetchResponse } from "../openmrs-fetch";
import { mergeAll, filter, map } from "rxjs/operators";

const userSubject = new BehaviorSubject(
  openmrsObservableFetch("/ws/rest/v1/session")
);

export function getCurrentUser(opts: CurrentUserOptions = {}) {
  return userSubject.asObservable().pipe(
    mergeAll(),
    map((r: FetchResponse) => (opts.includeAuthStatus ? r.data : r.data.user)),
    filter(Boolean)
  );
}

export function refetchCurrentUser() {
  userSubject.next(openmrsObservableFetch("/ws/rest/v1/session"));
}

export function userHasAccess(requiredPrivilege, user) {
  console.log("checking for access", user);
  return user.privileges.find(p => requiredPrivilege === p.display);
}

type CurrentUserOptions = {
  includeAuthStatus?: boolean;
};
