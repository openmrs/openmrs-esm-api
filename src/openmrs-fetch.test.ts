import { openmrsFetch, openmrsObservableFetch } from "./openmrs-fetch";
import { isObservable } from "rxjs";

import { getConfig as mockGetConfig } from "@openmrs/esm-module-config";

jest.mock("@openmrs/esm-module-config", () => ({
  defineConfigSchema: jest.fn(),
  getConfig: jest
    .fn()
    .mockReturnValue({ redirectAuthFailure: { enabled: false } })
}));

describe("openmrsFetch", () => {
  beforeEach(() => {
    // @ts-ignore
    window.openmrsBase = "/openmrs";
    window.fetch = jest.fn();
  });

  afterEach(() => {
    // @ts-ignore
    delete window.openmrsBase;
  });

  it(`throws an error if you don't pass in a url string`, () => {
    // @ts-ignore
    expect(() => openmrsFetch()).toThrowError(/first argument/);
    // @ts-ignore
    expect(() => openmrsFetch({})).toThrowError(/first argument/);
  });

  it(`throws an error if you pass in an invalid fetchInit object`, () => {
    // @ts-ignore
    expect(() => openmrsFetch("/session", "invalid second arg")).toThrowError(
      /second argument/
    );

    // @ts-ignore
    expect(() => openmrsFetch("/session", 123)).toThrowError(/second argument/);
  });

  it(`throws an Error if there is no openmrsBase`, () => {
    // @ts-ignore
    delete window.openmrsBase;

    expect(() => openmrsFetch("/session")).toThrowError(/openmrsBase/);
  });

  it(`calls window.fetch with the correct arguments for a basic GET request`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(new Promise(() => {}));
    openmrsFetch("/ws/rest/v1/session");
    expect(window.fetch).toHaveBeenCalledWith("/openmrs/ws/rest/v1/session", {
      headers: { Accept: "application/json" }
    });
  });

  it(`calls window.fetch correctly for requests that have a request body`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(new Promise(() => {}));
    const requestBody = { some: "json" };
    openmrsFetch("/ws/rest/v1/session", {
      method: "POST",
      body: requestBody
    });
    expect(window.fetch).toHaveBeenCalledWith("/openmrs/ws/rest/v1/session", {
      headers: { Accept: "application/json" },
      body: JSON.stringify(requestBody),
      method: "POST"
    });
  });

  it(`allows you to specify your own Accept request header`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(new Promise(() => {}));
    const requestBody = { some: "json" };
    openmrsFetch("/ws/rest/v1/session", {
      headers: {
        Accept: "application/xml"
      }
    });
    expect(window.fetch).toHaveBeenCalledWith("/openmrs/ws/rest/v1/session", {
      headers: { Accept: "application/xml" }
    });
  });

  it(`allows you to specify no Accept request header to be sent`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(new Promise(() => {}));
    openmrsFetch("/ws/rest/v1/session", {
      headers: {
        // specifically null on purpose
        Accept: null
      }
    });
    expect(window.fetch).toHaveBeenCalledWith("/openmrs/ws/rest/v1/session", {
      headers: {}
    });
  });

  it(`returns a promise that resolves with a json object when the request succeeds`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: "hi" })
      })
    );

    return openmrsFetch("/ws/rest/v1/session").then(response => {
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ value: "hi" });
    });
  });

  it(`returns a promise that resolves with null when the request succeeds with HTTP 204`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 204,
        json: () => Promise.reject(Error("No json for HTTP 204's!!"))
      })
    );

    return openmrsFetch("/ws/rest/v1/session").then(response => {
      expect(response.status).toBe(204);
      expect(response.data).toEqual(null);
    });
  });

  it(`gives you an amazing error when the server responds with a 500 that has json`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () =>
          Promise.resolve(
            JSON.stringify({
              error: "The server is dead"
            })
          )
      })
    );

    return openmrsFetch("/ws/rest/v1/session")
      .then(data => {
        fail("Promise shouldn't resolve when server responds with 500");
      })
      .catch(err => {
        expect(err.message).toMatch(
          /Server responded with 500 \(Internal Server Error\)/
        );
        expect(err.message).toMatch(/\/ws\/rest\/v1\/session/);
        expect(err.responseBody).toEqual({ error: "The server is dead" });
        expect(err.response.status).toBe(500);
      });
  });

  it(`gives you an amazing error when the server responds with a 400 that doesn't have json`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 400,
        statusText: "You goofed up",
        text: () => Promise.resolve("a string response body")
      })
    );

    return openmrsFetch("/ws/rest/v1/session")
      .then(data => {
        fail("Promise shouldn't resolve when server responds with 400");
      })
      .catch(err => {
        expect(err.message).toMatch(
          /Server responded with 400 \(You goofed up\)/
        );
        expect(err.message).toMatch(/\/ws\/rest\/v1\/session/);
        expect(err.responseBody).toEqual("a string response body");
        expect(err.response.status).toBe(400);
      });
  });

  it(`redirects to login page when the server responds with a 401`, () => {
    // @ts-ignore
    window.location.assign = jest.fn();
    mockGetConfig.mockReturnValueOnce({
      redirectAuthFailure: { enabled: true, url: "test/url", errors: [401] }
    });

    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: "You are not authorized",
        text: () => Promise.resolve("a string response body")
      })
    );

    return openmrsFetch("/ws/rest/v1/session")
      .then(data => {
        fail("Promise shouldn't resolve when server responds with 401");
      })
      .catch(err => {
        // @ts-ignore
        expect(window.location.assign.mock.calls[0][0]).toBe("test/url");
      });
  });
});

describe("openmrsObservableFetch", () => {
  beforeEach(() => {
    // @ts-ignore
    window.openmrsBase = "/openmrs";
    window.fetch = jest.fn();
  });

  it(`calls window.fetch with the correct arguments for a basic GET request`, done => {
    // @ts-ignore
    window.fetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: "hi" })
      })
    );

    const observable = openmrsObservableFetch("/ws/rest/v1/session");
    expect(isObservable(observable)).toBe(true);

    observable.subscribe(
      response => {
        expect(response.data).toEqual({ value: "hi" });
        done();
      },
      err => {
        fail(err);
      }
    );

    expect(window.fetch).toHaveBeenCalled();
    // @ts-ignore
    expect(window.fetch.mock.calls[0][0]).toEqual(
      "/openmrs/ws/rest/v1/session"
    );
    // @ts-ignore
    expect(window.fetch.mock.calls[0][1].headers.Accept).toEqual(
      "application/json"
    );
  });

  it(`aborts the fetch request when subscription is unsubscribed`, () => {
    // @ts-ignore
    window.fetch.mockReturnValue(new Promise(() => {}));

    const subscription = openmrsObservableFetch(
      "/ws/rest/v1/session"
    ).subscribe();
    // @ts-ignore
    const abortSignal: AbortSignal = window.fetch.mock.calls[0][1].signal;
    expect(abortSignal.aborted).toBe(false);

    subscription.unsubscribe();
    expect(abortSignal.aborted).toBe(true);
  });
});
