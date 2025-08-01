import 'react';

declare module 'react' {
  interface IntrinsicAttributes {
    'client:only'?: string;
  }
}