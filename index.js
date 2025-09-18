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
  res.render('index', { results: null, error: null });
});

app.post('/', async (req, res) => {
  const inputText = req.body.inputText;

  // Validate input
  if (!inputText || inputText.trim() === '') {
    return res.render('index', { 
      results: null, 
      error: 'Please enter at least one email address.' 
    });
  }

  // Split input into an array of emails and filter out empty lines
  const emails = inputText.split('\n')
    .map((line) => line.trim())
    .filter((email) => email.length > 0);

  if (emails.length === 0) {
    return res.render('index', { 
      results: null, 
      error: 'Please enter valid email addresses.' 
    });
  }

  // Validate emails
  const results = await validateEmails(emails);

  res.render('index', { results, error: null });
});

// Email validation function
async function validateEmails(emails) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  try {
    // First, do basic format validation
    const validEmails = emails.filter(email => emailRegex.test(email));
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    
    // Extract unique domains from valid emails
    const domains = [...new Set(validEmails.map(email => email.split('@')[1]))];
    
    // Results array to store all validation results
    const allResults = [];
    
    // Add invalid format emails to results
    invalidEmails.forEach(email => {
      allResults.push({
        email: email,
        isValid: false,
        message: 'Invalid email format'
      });
    });

    // First, verify domains using MX record check (faster and more reliable)
    let domainResults = {};
    try {
      const domainVerification = await new Promise((resolve) => {
        bulkEmailVerifier.verifyDomainsMX(domains).then(function(res) {
          resolve(res);
        }).catch(function(err) {
          console.error('Domain MX verification error:', err);
          resolve(null);
        });
      });

      if (domainVerification && Array.isArray(domainVerification)) {
        domainVerification.forEach((result, index) => {
          const domain = domains[index];
          domainResults[domain] = {
            hasValidMX: result && (result.status === 'valid' || result.valid === true),
            message: result ? (result.message || result.reason || 'Domain checked') : 'Domain verification completed'
          };
        });
      }
    } catch (domainError) {
      console.error('Domain verification failed:', domainError);
    }

    // Process emails based on domain verification results
    validEmails.forEach(email => {
      const domain = email.split('@')[1];
      const domainResult = domainResults[domain];
      
      if (domainResult) {
        allResults.push({
          email: email,
          isValid: domainResult.hasValidMX,
          message: domainResult.hasValidMX ? 
            'Valid domain with MX record' : 
            'Domain has no valid MX record'
        });
      } else {
        // Fallback for domains that couldn't be verified
        allResults.push({
          email: email,
          isValid: true, // Assume valid if we can't verify (to avoid false negatives)
          message: 'Domain verification unavailable - format is valid'
        });
      }
    });

    // Sort results to maintain original email order
    const sortedResults = emails.map(originalEmail => {
      return allResults.find(result => result.email === originalEmail) || {
        email: originalEmail,
        isValid: false,
        message: 'Processing error'
      };
    });

    return sortedResults;

  } catch (error) {
    console.error('Error validating emails:', error.message);
    return emails.map(email => ({
      email,
      isValid: emailRegex.test(email), // Fallback to format validation
      message: emailRegex.test(email) ? 
        'Format valid (verification unavailable)' : 
        'Invalid email format'
    }));
  }
}


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
