# K-Means Document Summarizer CLI

A standalone NestJS command-line tool that performs document summarization on local PDF files using K-Means semantic clustering.

## Features
- **PDF Extraction**: Uses the LangChain Community `PDFLoader` to parse text contents from local PDF files.
- **Recursive Character Splitting**: Chunks extracted text into smaller segments for vectorization.
- **Text Embedding**: Generates high-quality vector embeddings using Google Vertex AI `text-embedding-004`.
- **K-Means Clustering**: Groups document chunk vectors into $K$ distinct clusters (using `ml-kmeans`).
- **Centroid Excerpt Selection**: Computes Euclidean distance to select the single most representative text chunk closest to each cluster's centroid vector.
- **Cohesive LLM Synthesis**: Combines representative chunks in their original reading order and uses Gemini 2.5 Flash via Vertex AI to generate a cohesive summary.

## Prerequisites
Ensure Vertex AI environment variables and Application Default Credentials (ADC) are active:
```bash
gcloud auth application-default login
export VERTEX_AI_PROJECT_ID="your-project-id"
export VERTEX_AI_LOCATION="us-central1"
```

## How to Execute
Run this CLI application using Nx, specifying the target PDF file path as an argument:
```bash
npx nx execute kmeans-summarization --args="path/to/your/document.pdf"
```

For testing, you can use a sample PDF from node_modules:
```bash
npx nx execute kmeans-summarization --args="node_modules/pdf-parse/test/data/01-valid.pdf"
```
