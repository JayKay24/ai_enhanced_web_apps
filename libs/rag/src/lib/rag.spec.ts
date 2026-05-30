import { AviationRAG } from './rag.js';
import { FakeEmbeddings, FakeListChatModel } from '@langchain/core/utils/testing';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';

// Mock HNSWLib module
jest.mock('@langchain/community/vectorstores/hnswlib', () => {
  const mockVectorStore = {
    save: jest.fn().mockResolvedValue(undefined),
    asRetriever: jest.fn().mockReturnValue({
      pipe: jest.fn().mockImplementation((formatDocsFn) => {
        return {
          invoke: async () => {
            // Simulate retrieval of mock documents and apply the formatDocs function
            const mockDocs = [
              new Document({
                pageContent: 'NTSB accident info: engine failure occurred.',
                metadata: { sourceFile: 'report1.pdf' },
              }),
            ];
            return formatDocsFn(mockDocs);
          },
        };
      }),
    }),
  };
  return {
    HNSWLib: {
      fromDocuments: jest.fn().mockResolvedValue(mockVectorStore),
      load: jest.fn().mockResolvedValue(mockVectorStore),
    },
  };
});

// Mock PDFLoader module
jest.mock('@langchain/community/document_loaders/fs/pdf', () => {
  return {
    PDFLoader: jest.fn().mockImplementation(() => {
      return {
        load: jest.fn().mockResolvedValue([
          new Document({
            pageContent: 'NTSB safety incident content',
            metadata: { loc: { pageNumber: 1 } },
          }),
        ]),
      };
    }),
  };
});

// Mock fs module
jest.mock('fs', () => {
  const original = jest.requireActual('fs');
  return {
    ...original,
    existsSync: jest.fn(),
    readdirSync: jest.fn(),
    mkdirSync: jest.fn(),
  };
});

describe('AviationRAG', () => {
  let fakeEmbeddings: FakeEmbeddings;
  let fakeLlm: FakeListChatModel;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeEmbeddings = new FakeEmbeddings();
    fakeLlm = new FakeListChatModel({
      responses: ['The incident was caused by engine failure.'],
    });
  });

  describe('Constructor & DI Fallbacks', () => {
    it('should use fakes in test environment if none are provided', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const rag = new AviationRAG();
      expect((rag as any).embeddings).toBeInstanceOf(FakeEmbeddings);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use injected embeddings and LLM overrides', () => {
      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });
      expect((rag as any).embeddings).toBe(fakeEmbeddings);
      expect((rag as any).llm).toBe(fakeLlm);
    });
  });

  describe('buildIndex', () => {
    it('should load PDFs, split them, inject metadata, and build local HNSWLib index', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['report1.pdf', 'report2.pdf']);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      await rag.buildIndex('/fake/docs', '/fake/save');

      expect(fs.existsSync).toHaveBeenCalledWith('/fake/docs');
      expect(fs.readdirSync).toHaveBeenCalledWith('/fake/docs');
      expect(PDFLoader).toHaveBeenCalledTimes(2);
      
      // HNSWLib.fromDocuments should be called with faked embeddings
      expect(HNSWLib.fromDocuments).toHaveBeenCalledWith(
        expect.any(Array),
        fakeEmbeddings
      );
      
      // Verify metadata is appended
      const callArgs = (HNSWLib.fromDocuments as jest.Mock).mock.calls[0];
      const docsArg = callArgs[0] as Document[];
      expect(docsArg.length).toBeGreaterThan(0);
      expect(docsArg[0].metadata).toHaveProperty('sourceFile');
    });

    it('should throw error if docsDir does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      await expect(rag.buildIndex('/fake/docs', '/fake/save')).rejects.toThrow(
        /Documents directory not found/
      );
    });

    it('should throw error if no PDF files are found', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['not_a_pdf.txt']);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      await expect(rag.buildIndex('/fake/docs', '/fake/save')).rejects.toThrow(
        /No PDF files found to index/
      );
    });
  });

  describe('query', () => {
    it('should load vector index and invoke LCEL chain with fakes', async () => {
      // Mock presence of args.json to indicate valid index
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      const queryResult = await rag.query('/fake/index', 'What caused the accident?');

      expect(fs.existsSync).toHaveBeenCalledWith('/fake/index/args.json');
      expect(HNSWLib.load).toHaveBeenCalledWith('/fake/index', fakeEmbeddings);
      
      // Since fakeLlm returns 'The incident was caused by engine failure.', queryResult should match
      expect(queryResult).toBe('The incident was caused by engine failure.');
    });

    it('should throw error if index path is invalid', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      await expect(rag.query('/fake/index', 'What happened?')).rejects.toThrow(
        /Valid HNSWLib index not found/
      );
    });
  });

  describe('queryStream', () => {
    it('should load vector index and stream LCEL chain with fakes', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      const stream = await rag.queryStream('/fake/index', 'What caused the accident?');

      expect(fs.existsSync).toHaveBeenCalledWith('/fake/index/args.json');
      expect(HNSWLib.load).toHaveBeenCalledWith('/fake/index', fakeEmbeddings);
      expect(stream).toBeDefined();
    });

    it('should throw error if index path is invalid', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      const rag = new AviationRAG({
        embeddings: fakeEmbeddings,
        llm: fakeLlm,
      });

      await expect(rag.queryStream('/fake/index', 'What happened?')).rejects.toThrow(
        /Valid HNSWLib index not found/
      );
    });
  });
});
