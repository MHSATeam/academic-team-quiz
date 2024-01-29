import { UserProfile } from "@auth0/nextjs-auth0/client";

// From auth0 generated user model https://github.com/auth0/node-auth0/blob/master/src/management/__generated/models/index.ts#L6577
export type User = {
  [key: string]: any | any;
  /**
   * ID of the user which can be used when interacting with other APIs.
   *
   */
  user_id: string;
  /**
   * Email address of this user.
   *
   */
  email: string;
  /**
   * Whether this email address is verified (true) or unverified (false).
   *
   */
  email_verified: boolean;
  /**
   * Username of this user.
   *
   */
  username: string;
  /**
   * Phone number for this user when using SMS connections. Follows the <a href="https://en.wikipedia.org/wiki/E.164">E.164 recommendation</a>.
   *
   */
  phone_number: string;
  /**
   * Whether this phone number has been verified (true) or not (false).
   *
   */
  phone_verified: boolean;
  /**
   */
  created_at: string;
  /**
   */
  updated_at: string;
  /**
   * Array of user identity objects when accounts are linked.
   *
   */
  identities: Array<{
    /**
     * Name of the connection containing this identity.
     *
     */
    connection: string;
    /**
     * Unique identifier of the user user for this identity.
     *
     */
    user_id: string;
    /**
     * The type of identity provider
     *
     */
    provider: string;
    /**
     * Whether this identity is from a social provider (true) or not (false).
     *
     */
    isSocial: boolean;
    /**
     * IDP access token returned only if scope read:user_idp_tokens is defined.
     *
     */
    access_token: string;
    /**
     * IDP access token secret returned only if scope read:user_idp_tokens is defined.
     *
     */
    access_token_secret: string;
    /**
     * IDP refresh token returned only if scope read:user_idp_tokens is defined.
     *
     */
    refresh_token: string;
    /**
     */
    profileData: UserProfile;
  }>;
  /**
   */
  app_metadata: {
    [key: string]: any | any;
    /**
     */
    clientID: any | null;
    /**
     */
    globalClientID: any | null;
    /**
     */
    global_client_id: any | null;
    /**
     */
    email_verified: any | null;
    /**
     */
    user_id: any | null;
    /**
     */
    identities: any | null;
    /**
     */
    lastIP: any | null;
    /**
     */
    lastLogin: any | null;
    /**
     */
    metadata: any | null;
    /**
     */
    created_at: any | null;
    /**
     */
    loginsCount: any | null;
    /**
     */
    _id: any | null;
    /**
     */
    email: any | null;
    /**
     */
    blocked: any | null;
    /**
     */
    __tenant: any | null;
    /**
     */
    updated_at: any | null;
  };
  /**
   * User metadata to which this user has read/write access.
   *
   */
  user_metadata: { [key: string]: any };
  /**
   * URL to picture, photo, or avatar of this user.
   *
   */
  picture: string;
  /**
   * Name of this user.
   *
   */
  name: string;
  /**
   * Preferred nickname or alias of this user.
   *
   */
  nickname: string;
  /**
   * List of multi-factor authentication providers with which this user has enrolled.
   *
   */
  multifactor: Array<string>;
  /**
   * Last IP address from which this user logged in.
   *
   */
  last_ip: string;
  /**
   */
  last_login: string;
  /**
   * Total number of logins this user has performed.
   *
   */
  logins_count: number;
  /**
   * Whether this user was blocked by an administrator (true) or is not (false).
   *
   */
  blocked: boolean;
  /**
   * Given name/first name/forename of this user.
   *
   */
  given_name: string;
  /**
   * Family name/last name/surname of this user.
   *
   */
  family_name: string;
};
