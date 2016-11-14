import * as Promise from 'bluebird';
import * as stackTrace  from 'stack-trace';
import * as chalk from 'chalk';
import * as typeOf from 'type-of';
import * as _ from 'lodash';

let context: IDictionary<any> = {};

export function setContext(c: Object) {
  context = _.assign(context, c);
}

export function clearContext() {
  context = {};
}

function contextString(c: Object): string {
  if(c) {
    const props: string[] = [];
    Object.keys(context).map(key => {
      props.push(`${key}: ${chalk.grey(context[key])}`);
    });
    return '[ ' + props.join('; ') + ' ]';
  }
  return '';
}

/**
 * Allow logging to stdout in your promise pipeline while allowing for
 * the prior step's output to be proxied through to the next stage
 * @param  {string}   first   a value
 * @param  {string}   rest    an array of values sent to stdout
 * @return {Function}
 */
export function logger(first: any, ...rest: any[]): PromiseLike<any> {
  const trace = stackTrace.get(null);
  let lineNumber: number;
  let fileName: string;

  lineNumber = trace[1].getLineNumber();
  fileName = trace[1].getFileName().split('/').pop();
  console.log(contextString(context), first, chalk.grey(` [${fileName}: ${lineNumber}]`));
  if(rest.length > 0) {
    console.log(chalk.grey('Parameters proxied through the promise chain:'));
    rest.map((lineItem, index) => {
      console.log(`  ${index}: ` + chalk.grey(lineItem));
    });
    console.log(chalk.grey('---'));
  }

  return Promise.resolve(rest);
}

/**
 * Can be used in a promise chain (similar to logger but takes multi-args)
 * or can just be used independant of promises within sync code as a replacement
 * to console.log()
 */
export function msg(first: any, ...rest: any[]) {
  const trace = stackTrace.get();
  const lineNumber = trace[1].getLineNumber();
  const fileName = trace[1].getFileName().split('/').pop();

  console.log(contextString(context), first, ...rest, chalk.grey(` [${fileName}: ${lineNumber}]`));
  return Promise.resolve();
}

export class Stash {
  private _stash: IDictionary<any> = {};
  public get stash():IDictionary<any> {
    return this._stash;
  }
  public get(property: string) {
    return this._stash[property];
  }
  public toString() {
    return JSON.stringify(this._stash);
  }
  /**
   * Adds explicit name/value pairs as well as merging in name/value pairs from the
   * upstream promise resolution.
   *
   * @memberOf Stash
   */
  public add(property?: string | IDictionary<any>, value?: any) {
    return (...args: any[]) => {
      if (property) {
        if(typeof property === 'string') {
          this._stash[property] = value;
        }
        if(typeof property === 'object' && !value) {
          console.log(`property ${property} is a hash`);
          this._stash = _.assign(property, this._stash);
        }
      }
      args.map(argument => {
        if (typeof argument === 'object') {
          this._stash = _.assign(argument, this._stash);
        }
      });
      return Promise.resolve(args);
    }
  }

  constructor(init: IDictionary<any> | undefined) {
    if (init) {
      this._stash = init;
    }
  }

}

// export function stash(...args: any[]) {
//   let value;
//   let target;
//   let property;

//   switch (args.length) {
//   case 3:
//     [value, target, property] = args;
//     target[property] = value;
//     return Promise.resolve(value);
//   case 2:
//     [value, target] = args;
//     if (typeOf(value) === 'object' && typeOf(target) === 'object') {
//       target = _.(target, value);
//     } else if (typeOf(target) === 'array') {
//       console.log('pushing value: ', value);
//       target.push(value);
//     } else {
//       throw new Error('invalid use of stash parameters:' + JSON.stringify(args, null, 2));
//     }
//     return Promise.resolve(value);
//   }


// }
