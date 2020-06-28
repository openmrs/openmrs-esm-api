import { Observable, ReplaySubject } from "rxjs";
import { FetchResponse, openmrsFetch } from "../openmrs-fetch";
import { filter, map, tap, mergeAll } from "rxjs/operators";

const userSubject = new ReplaySubject<Promise<LoggedInUserFetchResponse>>(1);
let lastFetchTimeMillis: number = 0;

refetchCurrentUser();

function getCurrentUser(): Observable<LoggedInUser>;
function getCurrentUser(
  opts: CurrentUserWithResponseOption
): Observable<UnauthenticatedUser>;
function getCurrentUser(
  opts: CurrentUserWithoutResponseOption
): Observable<LoggedInUser>;
function getCurrentUser(
  opts: CurrentUserOptions = { includeAuthStatus: false }
): Observable<LoggedInUser | UnauthenticatedUser> {
  if (lastFetchTimeMillis < Date.now() - 1000 * 60) {
    refetchCurrentUser();
  }
  return userSubject.asObservable().pipe(
    mergeAll(),
    tap(setUserLanguage),
    map((r: LoggedInUserFetchResponse) =>
      opts.includeAuthStatus ? r.data : r.data.user
    ),
    filter(Boolean)
  ) as Observable<LoggedInUser | UnauthenticatedUser>;
}

function setUserLanguage(sessionResponse) {
  if (sessionResponse?.data?.user?.userProperties?.defaultLocale) {
    const locale = sessionResponse.data.user.userProperties.defaultLocale;
    const htmlLang = document.documentElement.getAttribute("lang");
    if (locale != htmlLang) {
      document.documentElement.setAttribute("lang", locale);
    }
  }
}

function userHasPrivilege(requiredPrivilege, user) {
  return user.privileges.find(p => requiredPrivilege === p.display);
}

function isSuperUser(user) {
  const superUserRole = "System Developer";
  return user.roles.find(role => role.display === superUserRole);
}

export { getCurrentUser };

export function refetchCurrentUser() {
  lastFetchTimeMillis = Date.now();
  userSubject.next(openmrsFetch("/ws/rest/v1/session"));
}

export function userHasAccess(requiredPrivilege, user) {
  if (userHasPrivilege(requiredPrivilege, user) || isSuperUser(user)) {
    return true;
  }
  return false;
}

interface CurrentUserOptions {
  includeAuthStatus?: boolean;
}

interface CurrentUserWithResponseOption extends CurrentUserOptions {
  includeAuthStatus: true;
}

interface CurrentUserWithoutResponseOption extends CurrentUserOptions {
  includeAuthStatus: false;
}

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
