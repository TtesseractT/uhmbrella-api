
export interface UsageApi {

  /**
   * @function getUsage
   * @returns {Promise<UsageInfo>} resolves to {@link UsageInfo}
   */
  getUsage: () => Promise<UsageInfo>;

  /**
   * @function getUsageSafe - validates the response body from the server.
   * @returns {Promise<UsageInfo>} resolves to {@link UsageInfo}
   * @throws {UhmbrellaAssertError} if the recieved response is not the type of UsageInfo.
   */
  getUsageSafe: () => Promise<UsageInfo>;
}
