export const defineConfigSchema = jest.fn();

export const getConfig = jest
  .fn()
  .mockResolvedValue({ redirectAuthFailure: { enabled: false } });
