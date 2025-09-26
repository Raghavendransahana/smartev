import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory vector database implementation
 */
class InMemoryVectorDB {
  constructor() {
    this.documents = new Map(); // id -> document metadata
    this.chunks = new Map(); // id -> chunk data with embedding
    this.documentChunks = new Map(); // documentId -> Set of chunkIds
  }

  /**
   * Store a document with its chunks and embeddings
   * @param {Object} document - Document metadata
   * @param {Array} chunks - Array of chunk objects with embeddings
   */
  async storeDocument(document, chunks) {
    const documentId = document.id || uuidv4();
    document.id = documentId;
    
    this.documents.set(documentId, {
      ...document,
      createdAt: new Date().toISOString(),
      chunkCount: chunks.length
    });

    const chunkIds = new Set();
    
    for (const chunk of chunks) {
      const chunkId = uuidv4();
      chunkIds.add(chunkId);
      
      this.chunks.set(chunkId, {
        id: chunkId,
        documentId,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: chunk.metadata || {},
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        createdAt: new Date().toISOString()
      });
    }
    
    this.documentChunks.set(documentId, chunkIds);
    return documentId;
  }

  /**
   * Search for similar chunks using cosine similarity
   * @param {number[]} queryEmbedding - Query embedding vector
   * @param {number} topK - Number of results to return
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array} - Array of similar chunks with similarity scores
   */
  async searchSimilar(queryEmbedding, topK = 5, threshold = 0.7) {
    const results = [];
    
    for (const [chunkId, chunk] of this.chunks) {
      const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      
      if (similarity >= threshold) {
        results.push({
          ...chunk,
          similarity,
          document: this.documents.get(chunk.documentId)
        });
      }
    }
    
    // Sort by similarity (descending) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]} vecA - First vector
   * @param {number[]} vecB - Second vector
   * @returns {number} - Cosine similarity score
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }

  /**
   * Get document by ID
   * @param {string} documentId - Document ID
   * @returns {Object|null} - Document metadata or null
   */
  getDocument(documentId) {
    return this.documents.get(documentId) || null;
  }

  /**
   * Get all documents
   * @returns {Array} - Array of all documents
   */
  getAllDocuments() {
    return Array.from(this.documents.values());
  }

  /**
   * Get chunks for a document
   * @param {string} documentId - Document ID
   * @returns {Array} - Array of chunks for the document
   */
  getDocumentChunks(documentId) {
    const chunkIds = this.documentChunks.get(documentId);
    if (!chunkIds) return [];
    
    return Array.from(chunkIds)
      .map(chunkId => this.chunks.get(chunkId))
      .filter(Boolean);
  }

  /**
   * Delete a document and its chunks
   * @param {string} documentId - Document ID to delete
   */
  deleteDocument(documentId) {
    const chunkIds = this.documentChunks.get(documentId);
    
    if (chunkIds) {
      for (const chunkId of chunkIds) {
        this.chunks.delete(chunkId);
      }
      this.documentChunks.delete(documentId);
    }
    
    this.documents.delete(documentId);
  }

  /**
   * Get database statistics
   * @returns {Object} - Database statistics
   */
  getStats() {
    return {
      documentsCount: this.documents.size,
      chunksCount: this.chunks.size,
      totalSize: this.documents.size + this.chunks.size
    };
  }

  /**
   * Clear all data
   */
  clear() {
    this.documents.clear();
    this.chunks.clear();
    this.documentChunks.clear();
  }
}

export default InMemoryVectorDB;