import { BehaviorSubject, Observable } from "rxjs";
import { openmrsObservableFetch, FetchResponse } from "../openmrs-fetch";
import { mergeAll, filter, map } from "rxjs/operators";

const userSubject = new BehaviorSubject<Observable<LoggedInUserFetchResponse>>(
  openmrsObservableFetch("/ws/rest/v1/session") as Observable<
    LoggedInUserFetchResponse
  >
);

export function getCurrentUser(
  opts: CurrentUserOptions = {}
): Observable<LoggedInUser | UnauthenticatedUser> {
  return userSubject.asObservable().pipe(
    mergeAll(),
    map((r: LoggedInUserFetchResponse) =>
      opts.includeAuthStatus ? r.data : r.data.user
    ),
    filter(Boolean)
  ) as Observable<LoggedInUser | UnauthenticatedUser>;
}

export function refetchCurrentUser() {
  userSubject.next(openmrsObservableFetch("/ws/rest/v1/session"));
}

export function userHasAccess(requiredPrivilege, user) {
  return user.privileges.find(p => requiredPrivilege === p.display);
}

type CurrentUserOptions = {
  includeAuthStatus?: boolean;
};

interface LoggedInUser {
  uuid: string;
  display: string;
  username: string;
  systemId: string;
  userProperties: any;
  person: Person;
  privileges: Privilege[];
  roles: Role[];
  retired: boolean;
  locale: string;
  allowedLocales: string[];
  [anythingElse: string]: any;
}

type UnauthenticatedUser = {
  sessionId: string;
  authenticated: boolean;
  user?: LoggedInUser;
};

type Person = {
  uuid: string;
  display: string;
  links: any[];
};

type Privilege = {
  uuid: string;
  display: string;
  links: any[];
};

type Role = {
  uuid: string;
  display: string;
  links: any[];
};

interface LoggedInUserFetchResponse extends FetchResponse {
  data: UnauthenticatedUser & {
    user?: LoggedInUser;
  };
}
