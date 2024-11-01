const express = require('express');
const bodyParser = require('body-parser');
const bulkEmailVerifier = require('bulk-email-verifier');
const path = require('path');

const app = express();
const port = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Serve static files from the 'node_modules' folder
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Define routes
app.get('/', (req, res) => {
  res.render('index', { results: null });
});

app.post('/', async (req, res) => {
  const inputText = req.body.inputText;

  // Split input into an array of emails
  const emails = inputText.split('\n').map((line) => line.trim());

  // Validate emails
  const results = await validateEmails(emails);

  res.render('index', { results });
});

// Email validation function
async function validateEmails(emails) {
  try {
    const results = await bulkEmailVerifier.verifyEmails('', emails, {});

    if (!results || !Array.isArray(results)) {
      throw new Error('Invalid response from bulk-email-verifier');
    }

    return results.map((result, index) => ({
      email: emails[index],
      isValid: result.status === 'valid',
      message: result.msg
    }));
  } catch (error) {
    console.error('Error validating emails:', error.message);
    return emails.map(email => ({
      email,
      isValid: false,
      message: 'Error during validation'
    }));
  }
}


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
