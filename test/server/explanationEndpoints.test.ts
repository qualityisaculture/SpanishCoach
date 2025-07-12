const request = require('supertest');
const App = require('../../src/server/server');
import { setApp } from './supertestExtensions';

// Mock LangChainHandler
jest.mock('../../src/server/LangChainHandler.ts');

describe('Explanation Endpoints', () => {
  let app;
  let mockGenerateExplanation;
  let mockGenerateSimplifiedExplanation;

  beforeEach(() => {
    app = App();
    setApp(app);
    
    // Create mock methods
    mockGenerateExplanation = jest.fn();
    mockGenerateSimplifiedExplanation = jest.fn();
    
    // Mock the LangChainHandler constructor
    const LangChainHandler = require('../../src/server/LangChainHandler.ts').default;
    LangChainHandler.mockImplementation(() => ({
      generateExplanation: mockGenerateExplanation,
      generateSimplifiedExplanation: mockGenerateSimplifiedExplanation
    }));
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('GET /explain', () => {
    it('returns a Spanish explanation and complexity', async () => {
      const spanish = 'perro';
      const mockResponse = {
        explanation: 'Un animal doméstico que ladra y es el mejor amigo del hombre',
        complexity: 'intermediate'
      };
      
      mockGenerateExplanation.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/explain')
        .query({ spanish })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('explanation');
      expect(res.body).toHaveProperty('complexity');
      expect(res.body.explanation).toBe(mockResponse.explanation);
      expect(res.body.complexity).toBe('intermediate');
      expect(mockGenerateExplanation).toHaveBeenCalledWith(spanish);
    });

    it('returns 400 error when spanish parameter is missing', async () => {
      await request(app)
        .get('/explain')
        .expect(400)
        .expect('You must provide a spanish parameter');
    });

    it('returns 500 error when AI generation fails', async () => {
      const spanish = 'perro';
      mockGenerateExplanation.mockRejectedValue(new Error('AI service unavailable'));

      const res = await request(app)
        .get('/explain')
        .query({ spanish })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Failed to generate explanation');
      expect(res.body).toHaveProperty('details');
    });
  });

  describe('GET /simplify', () => {
    it('returns a simplified Spanish explanation', async () => {
      const spanish = 'perro';
      const mockResponse = {
        simplifiedExplanation: 'Un animal que vive en casa'
      };
      
      mockGenerateSimplifiedExplanation.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/simplify')
        .query({ spanish })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('simplifiedExplanation');
      expect(res.body.simplifiedExplanation).toBe(mockResponse.simplifiedExplanation);
      expect(mockGenerateSimplifiedExplanation).toHaveBeenCalledWith(spanish);
    });

    it('returns 400 error when spanish parameter is missing', async () => {
      await request(app)
        .get('/simplify')
        .expect(400)
        .expect('You must provide a spanish parameter');
    });

    it('returns 500 error when AI simplification fails', async () => {
      const spanish = 'perro';
      mockGenerateSimplifiedExplanation.mockRejectedValue(new Error('AI service unavailable'));

      const res = await request(app)
        .get('/simplify')
        .query({ spanish })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('Failed to simplify explanation');
      expect(res.body).toHaveProperty('details');
    });
  });
}); 