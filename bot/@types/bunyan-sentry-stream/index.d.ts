/** Declaration file generated by dts-gen */

declare module 'bunyan-sentry-stream' {
    export = bunyan_sentry_stream;

    function bunyan_sentry_stream(client: any): any;

    namespace bunyan_sentry_stream {
        class SentryStream {
            constructor(...args: any[]);

            deserializeError(...args: any[]): void;

            getSentryLevel(...args: any[]): void;

            write(...args: any[]): void;
        }
    }
}

