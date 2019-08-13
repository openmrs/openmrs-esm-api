import isPlainObject from "lodash-es/isPlainObject";

export function openmrsFetch(
  url: string,
  fetchInit: FetchConfig = {}
): Promise<FetchResponse> {
  if (typeof url !== "string") {
    throw Error(
      "The first argument to @openmrs/api's openmrsFetch function must be a url string or Request object"
    );
  }

  if (typeof fetchInit !== "object") {
    throw Error(
      "The second argument to @openmrs/api's openmrsFetch function must be a plain object."
    );
  }

  // @ts-ignore
  if (!window.openmrsBase) {
    throw Error(
      "@openmrs/api is running in a browser that doesn't have window.openmrsBase, which is provided by openmrs-module-spa's HTML file."
    );
  }

  // Prefix the url with the openmrs spa base
  // @ts-ignore
  url = window.openmrsBase + url;

  // We're going to need some headers
  if (!fetchInit.headers) {
    fetchInit.headers = {};
  }

  /* Automatically stringify javascript objects being sent in the
   * request body.
   */
  if (isPlainObject(fetchInit.body)) {
    fetchInit.body = JSON.stringify(fetchInit.body);
  }

  /* Add a request header to tell the server to respond with json,
   * since frontend code almost always wants json and the OpenMRS
   * server won't give you json unless you explicitly ask for it.
   * If a different Accept header is preferred, pass it into the fetchInit.
   * If no Accept header is desired, pass it in explicitly as null.
   */
  if (typeof fetchInit.headers.Accept === "undefined") {
    fetchInit.headers.Accept = "application/json";
  }

  if (fetchInit.headers.Accept === null) {
    delete fetchInit.headers.Accept;
  }

  /* We capture the stacktrace before making the request, so that if an error occurs we can
   * log a full stacktrace that includes the code that made the request and handled the response
   * Otherwise, we could run into situations where the stacktrace doesn't even show which code
   * called @openmrs/api.
   */
  const requestStacktrace = Error();

  return window.fetch(url, fetchInit as RequestInit).then(r => {
    const response = r as FetchResponse;
    if (response.ok) {
      if (response.status === 204) {
        /* HTTP 204 - No Content
         * We should not try to download the empty response as json. Instead,
         * we return null since there is no response body.
         */
        response.data = null;
        return response;
      } else {
        // HTTP 200s - The request succeeded
        return response.json().then(data => {
          response.data = data;
          return response;
        });
      }
    } else {
      /* HTTP response status is not in 200s. Usually this will mean
       * either HTTP 400s (bad request from browser) or HTTP 500s (server error)
       * Our goal is to come up with best possible stacktrace and error message
       * to help developers understand the problem and debug
       */

      // Attempt to download a response body, if it has one
      return response.text().then(
        responseText => {
          let responseBody = responseText;
          try {
            responseBody = JSON.parse(responseText);
          } catch (err) {
            // Server didn't respond with json, so just go with the response text string
          }

          /* Make the fetch promise go into "rejected" status, with the best
           * possible stacktrace and error message.
           */
          throw new OpenmrsFetchError(
            url,
            response,
            responseBody,
            requestStacktrace
          );
        },
        err => {
          /* We weren't able to download a response body for this error.
           * Time to just give the best possible stacktrace and error message.
           */
          throw new OpenmrsFetchError(url, response, null, requestStacktrace);
        }
      );
    }
  });
}

export class OpenmrsFetchError extends Error {
  constructor(
    url: string,
    response: Response,
    responseBody: ResponseBody | null,
    requestStacktrace: Error
  ) {
    super();
    this.message = `Server responded with ${response.status} (${response.statusText}) for url ${url}. Check err.responseBody or network tab in dev tools for more info`;
    requestStacktrace.message = this.message;
    this.responseBody = responseBody;
    this.response = response;
    this.stack = `Stacktrace for outgoing request:\n${requestStacktrace.stack}\nStacktrace for incoming response:\n${this.stack}`;
  }
  response: Response;
  responseBody: string | FetchResponseJson | null;
}

interface FetchResponse extends Response {
  data: any | null;
}

interface FetchConfig extends Omit<Omit<RequestInit, "body">, "headers"> {
  headers?: FetchHeaders;
  body?: FetchBody | string;
}

type ResponseBody = string | FetchResponseJson;

export interface FetchHeaders {
  [key: string]: string | null;
}

interface FetchBody {
  [key: string]: any;
}

interface FetchResponseJson {
  [key: string]: any;
}
