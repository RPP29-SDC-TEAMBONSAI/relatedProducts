const app = require('../server/server.js');
const supertest = require('supertest');
const request = supertest(app);
const pool = require('../database/index.js');

describe('testing API requests for related ids', () => {

  it('should respond with relatedIds from GET request', async () => {
    const response = await request.get('/api/related?id=1');

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(4);

  })

  it('should respond with error from GET request without id parameter', async () => {
    const response = await request.get('/api/related')

    expect(response.status).toBe(400);
    expect(response.text).toBe('missing product ID')

  })

  it('should respond with error from GET request with ID not in database', async () => {
    const response = await request.get('/api/related?id=45643643564')

    expect(response.status).toBe(400);
    expect(response.text).toBe('Error connecting to DB')

  })

})
