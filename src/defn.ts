declare module 'type-of' {
  export default function(thingy: any): string;
};

interface IDictionary<T> {
  [key: string]: T;
};
