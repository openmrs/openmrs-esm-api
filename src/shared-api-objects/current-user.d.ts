export declare function getCurrentUser(
  opts?: CurrentUserOptions
): import("rxjs").Observable<unknown>;
export declare function refetchCurrentUser(): void;
export declare function userHasAccess(requiredPrivilege: any, user: any): any;
declare type CurrentUserOptions = {
  includeAuthStatus?: boolean;
};
export {};
