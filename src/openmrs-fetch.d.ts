import { Observable } from "rxjs";
export declare function openmrsFetch(
  url: string,
  fetchInit?: FetchConfig
): Promise<FetchResponse>;
export declare function openmrsObservableFetch(
  url: string,
  fetchInit?: FetchConfig
): Observable<FetchResponse>;
export declare class OpenmrsFetchError extends Error {
  super(
    url: string,
    response: Response,
    responseBody: ResponseBody | null,
    requestStacktrace: Error
  );
  response: Response;
  responseBody: string | FetchResponseJson | null;
}
export interface FetchResponse extends Response {
  data: any | null;
}
interface FetchConfig extends Omit<Omit<RequestInit, "body">, "headers"> {
  headers?: FetchHeaders;
  body?: FetchBody | string;
}
declare type ResponseBody = string | FetchResponseJson;
export interface FetchHeaders {
  [key: string]: string | null;
}
interface FetchBody {
  [key: string]: any;
}
interface FetchResponseJson {
  [key: string]: any;
}
export {};
