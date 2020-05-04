import { BehaviorSubject, Observable } from "rxjs";
import { openmrsObservableFetch, FetchResponse } from "../openmrs-fetch";
import { mergeAll, filter, map, tap } from "rxjs/operators";
import i18n from "i18next";

const userSubject = new BehaviorSubject<Observable<LoggedInUserFetchResponse>>(
  openmrsObservableFetch("/ws/rest/v1/session") as Observable<
    LoggedInUserFetchResponse
  >
);

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
    //@ts-ignore
    const i18nInstance = i18n.default || i18n;
    if (locale != i18nInstance.language) {
      i18nInstance.changeLanguage(locale).catch(e => {
        console.error(
          "Failed to set language to user's preferred language: " + locale
        );
      });
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
  userSubject.next(openmrsObservableFetch("/ws/rest/v1/session"));
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
