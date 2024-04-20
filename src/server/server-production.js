import Server from './server';
const mode = process.argv[2] || 'dev'
const app = Server(mode);

app.listen(8080, '127.0.0.1', () => {
  console.log('Spanish Companion running...');
});
