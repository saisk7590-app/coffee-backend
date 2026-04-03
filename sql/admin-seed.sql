INSERT INTO users (name, email, phone, password, role)
SELECT
  'Admin',
  'admin@cafename.com',
  '9999999999',
  '$2b$10$NGVoRsTZqIztUn5kS3Dj7.1vh/9k/eWYtB4DOgQbIcNUKEfV6P6EG',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@cafename.com'
);
