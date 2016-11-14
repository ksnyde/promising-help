/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export declare function setContext(c: Object): void;
export declare function clearContext(): void;
export declare function logger(first: any, ...rest: any[]): PromiseLike<any>;
export declare function msg(first: any, ...rest: any[]): Promise<void>;
export declare class Stash {
    private _stash;
    readonly stash: IDictionary<any>;
    get(property: string): any;
    toString(): string;
    add(property?: string | IDictionary<any>, value?: any): (...args: any[]) => Promise<any[]>;
    constructor(init: IDictionary<any> | undefined);
}
