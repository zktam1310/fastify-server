import App from './app';

const app = new App();
app.start();

// Add a signal handler to gracefully shut down the server when it receives SIGTERM
process.on('SIGTERM', () => {
  console.log('Server is being shut down...');
  app.server.close(() => {
    console.log('Server has been shut down successfully');
    process.exit(0);
  });
});
