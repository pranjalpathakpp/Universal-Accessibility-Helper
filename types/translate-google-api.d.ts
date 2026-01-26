// Type declarations for translate-google-api
declare module 'translate-google-api' {
  interface TranslateOptions {
    tld?: 'com' | 'cn';
    to?: string;
    from?: string;
    proxy?: {
      host: string;
      port: number;
      auth?: {
        username: string;
        password: string;
      };
    };
    config?: any; // Axios config
  }

  function translate(
    text: string | string[],
    options?: TranslateOptions
  ): Promise<string[]>;

  export default translate;
}
