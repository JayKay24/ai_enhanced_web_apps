import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';
Object.assign(global, { TextEncoder, TextDecoder, ReadableStream });
