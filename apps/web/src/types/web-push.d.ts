declare module "web-push" {
  export type PushSubscription = {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  export type RequestDetails = {
    statusCode?: number;
    headers?: Record<string, string | string[]>;
    body?: string;
  };

  const webpush: {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    sendNotification(
      subscription: PushSubscription,
      payload?: string,
      options?: Record<string, unknown>,
    ): Promise<RequestDetails>;
  };

  export default webpush;
}
