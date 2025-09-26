import natural from 'natural';

/**
 * Document processing utilities for chunking and preprocessing
 */
class DocumentProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 400;
    this.chunkOverlap = options.chunkOverlap || 50;
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Process and chunk a document
   * @param {string} content - Document content
   * @param {Object} metadata - Document metadata
   * @returns {Array} - Array of processed chunks
   */
  processDocument(content, metadata = {}) {
    // Clean and normalize text
    const cleanedContent = this.cleanText(content);
    
    // Create chunks
    const chunks = this.createChunks(cleanedContent);
    
    // Add metadata to each chunk
    return chunks.map((chunk, index) => ({
      content: chunk.text,
      metadata: {
        ...metadata,
        chunkIndex: index,
        totalChunks: chunks.length
      },
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex
    }));
  }

  /**
   * Clean and normalize text content
   * @param {string} text - Raw text content
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with processing
      .replace(/[^\w\s.,!?;:()\-"']/g, '')
      // Trim whitespace
      .trim();
  }

  /**
   * Create overlapping chunks from text
   * @param {string} text - Text to chunk
   * @returns {Array} - Array of chunk objects
   */
  createChunks(text) {
    const sentences = this.splitIntoSentences(text);
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;
    let startIndex = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const sentenceTokens = this.countTokens(sentence);
      
      // If adding this sentence would exceed chunk size, finalize current chunk
      if (currentTokens + sentenceTokens > this.chunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          startIndex,
          endIndex: startIndex + currentChunk.length,
          tokenCount: currentTokens
        });
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk);
        currentChunk = overlapText + ' ' + sentence;
        currentTokens = this.countTokens(currentChunk);
        startIndex = startIndex + currentChunk.length - overlapText.length - sentence.length - 1;
      } else {
        // Add sentence to current chunk
        currentChunk += (currentChunk ? ' ' : '') + sentence;
        currentTokens += sentenceTokens;
      }
    }
    
    // Add final chunk if it has content
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        tokenCount: currentTokens
      });
    }
    
    return chunks;
  }

  /**
   * Split text into sentences
   * @param {string} text - Text to split
   * @returns {Array} - Array of sentences
   */
  splitIntoSentences(text) {
    // Use Natural's sentence tokenizer with some custom improvements
    const tokenizer = new natural.SentenceTokenizer();
    let sentences = tokenizer.tokenize(text);
    
    // Filter out very short sentences and clean up
    return sentences
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10) // Remove very short sentences
      .filter(sentence => /[.!?]$/.test(sentence) || sentence.length > 50); // Keep complete sentences or longer fragments
  }

  /**
   * Get overlap text for chunk continuity
   * @param {string} chunk - Current chunk text
   * @returns {string} - Overlap text
   */
  getOverlapText(chunk) {
    const tokens = this.tokenizer.tokenize(chunk);
    const overlapTokenCount = Math.min(this.chunkOverlap, tokens.length);
    
    return tokens.slice(-overlapTokenCount).join(' ');
  }

  /**
   * Count tokens in text (approximate)
   * @param {string} text - Text to count
   * @returns {number} - Token count
   */
  countTokens(text) {
    return this.tokenizer.tokenize(text).length;
  }

  /**
   * Extract metadata from document content
   * @param {string} content - Document content
   * @param {string} filename - Original filename
   * @returns {Object} - Extracted metadata
   */
  extractMetadata(content, filename = '') {
    const tokens = this.tokenizer.tokenize(content);
    const sentences = this.splitIntoSentences(content);
    
    // Try to extract title (first meaningful line)
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const title = lines[0] || filename.replace(/\.[^/.]+$/, '') || 'Untitled';
    
    // Extract keywords using TF-IDF (simple version)
    const keywords = this.extractKeywords(content);
    
    return {
      title,
      filename,
      tokenCount: tokens.length,
      sentenceCount: sentences.length,
      characterCount: content.length,
      keywords: keywords.slice(0, 10), // Top 10 keywords
      language: 'en', // Could be enhanced with language detection
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Extract keywords from text using simple TF-IDF
   * @param {string} text - Text to analyze
   * @returns {Array} - Array of keywords
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    const tokens = this.tokenizer.tokenize(text.toLowerCase())
      .filter(token => token.length > 2 && !stopWords.has(token))
      .filter(token => /^[a-zA-Z]+$/.test(token)); // Only alphabetic tokens
    
    // Count frequency
    const frequency = {};
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .map(([word]) => word);
  }
}

export default DocumentProcessor;