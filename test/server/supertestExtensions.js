const request = require('supertest');

let app;
export const setApp = (application) => {
    app = application;
}

export const expectJson = (path, query, expected) => {
  return request(app)
    .get(path)
    .query(query)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(expected);
};

export const requestBodyAsync = async (path, body) => {
  return request(app)
    .post(path)
    .send(body)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);
};
