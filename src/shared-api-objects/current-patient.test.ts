import { getCurrentPatient } from "./current-patient";
import { fhir } from "../fhir";
import { first } from "rxjs/operators";

jest.mock("../fhir", () => ({
  fhir: {
    read: jest.fn()
  }
}));

describe("current patient", () => {
  beforeEach(() => {
    fhir.read.mockReset();
  });

  it("fetches the correct patient from a patient chart URL", () => {
    fhir.read.mockReturnValueOnce(
      Promise.resolve({
        data: {}
      })
    );

    window.history.pushState({}, document.title, `/patient/12/chart`);
    window.dispatchEvent(new CustomEvent("single-spa:routing-event"));

    return getCurrentPatient()
      .pipe(first())
      .toPromise()
      .then(() => {
        expect(fhir.read).toHaveBeenCalledWith({
          type: "Patient",
          patient: "12"
        });
      });
  });

  it("fetches the correct patient from the patient home URL", () => {
    fhir.read.mockReturnValueOnce(
      Promise.resolve({
        data: {}
      })
    );

    window.history.pushState({}, document.title, `/patient/34`);
    window.dispatchEvent(new CustomEvent("single-spa:routing-event"));

    return getCurrentPatient()
      .pipe(first())
      .toPromise()
      .then(() => {
        expect(fhir.read).toHaveBeenCalledWith({
          type: "Patient",
          patient: "34"
        });
      });
  });
});
