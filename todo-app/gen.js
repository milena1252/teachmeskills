const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    sub: 'milena1252',
    role: 'user',
  },
  'super-secret-key', 
  { expiresIn: '1h' }
);

console.log(token);
