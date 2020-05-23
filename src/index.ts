import { makeApp } from './Service';

const port = process.env.PORT || '8080';
const user = process.env.ADMIN_USER || 'admin';
const pass = process.env.ADMIN_PASS || 'admin123';
const app = makeApp(user, pass);

app.listen(port, (err) => {
  if (err) return console.error(err);
  return console.log(`Server is listening on ${port}`);
});
