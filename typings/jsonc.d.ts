
interface jsonpackStatic {
    pack(json: any, options?: any): string;
    unpack(json: any, options?: any): any;
}

declare var jsonpack: jsonpackStatic;

declare module 'jsonpack' {
    export = jsonpack;
}
