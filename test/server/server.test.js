const request = require('supertest');
const App = require('../../src/server/server');
jest.mock('../../src/server/LangChainHandler.ts');

describe('App', () => {
  let app;
  beforeEach(() => {
    app = App();
  });

  it('returns a file', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Hello World/);
  });
});
