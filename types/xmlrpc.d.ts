declare module 'xmlrpc' {
  export type XmlRpcClient = {
    methodCall(method: string, params: unknown[], callback: (error: Error | null, value: unknown) => void): void;
  };
  export function createClient(options: { url: string; cookies?: boolean; encoding?: string }): XmlRpcClient;
  export function createSecureClient(options: { url: string; cookies?: boolean; encoding?: string }): XmlRpcClient;
}
