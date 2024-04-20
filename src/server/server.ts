//Create a default express server and listen on port 3000
import express from 'express';
import path from 'path';


const ankiRoutes = require('./routes/anki.ts');
const translatorRoutes = require('./routes/translator.ts');
let app;

const Server = (mode: 'default' | 'dev' | 'e2e', application?: Express.Application) => {
  app = application || express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '.')));
  if (mode !== 'e2e') {
    app.use('/', ankiRoutes);
    app.use('/', translatorRoutes);
  }
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'))
  }
  );

  return app;
};
module.exports = Server;
