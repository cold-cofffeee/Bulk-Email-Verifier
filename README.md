# Bulk Email Verifier

A web application for validating multiple email addresses at once using SMTP verification.

## Features

- Bulk email validation using SMTP connection
- No API key required - uses direct SMTP verification
- Clean web interface using Bootstrap
- Groups emails by domain for efficient validation
- Real-time results display with validation status
- Format validation for invalid email formats

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```

3. **Access the Application**
   Open your browser and go to `http://localhost:3000`

## Usage

1. Enter email addresses in the text area (one per line)
2. Click "Validate" to check the emails
3. View the results with validation status for each email

## How It Works

- The application uses the `bulk-email-verifier` package
- **Primary Method**: Domain MX record verification (checks if domain can receive emails)
- **Fallback**: Basic email format validation
- Due to SMTP port 25 restrictions by ISPs and firewalls, individual email verification via SMTP is often blocked
- The application gracefully handles these limitations and provides meaningful validation results

## Notes

- The application filters out empty lines automatically
- Error messages are displayed for invalid inputs
- **Domain Validation**: Checks if the email domain has valid MX records (can receive emails)
- **Format Validation**: Ensures email addresses follow proper format rules
- SMTP verification may timeout due to network restrictions - this is normal and expected

## Validation Levels

1. **Format Check**: Basic regex validation for email format
2. **Domain MX Check**: Verifies if the domain has mail exchange records
3. **SMTP Verification**: Attempts direct email verification (may timeout due to restrictions)

### Understanding Results

- **Valid**: Email format is correct AND domain has valid MX records
- **Invalid**: Either incorrect format OR domain cannot receive emails
- **Format Valid (verification unavailable)**: Correct format but domain verification failed
- **Domain has no valid MX record**: Domain cannot receive emails

## Dependencies

- Express.js - Web framework
- EJS - Template engine
- Bootstrap - UI framework
- bulk-email-verifier - SMTP-based email validation
- body-parser - Request body parsing

## Validation Process

1. **Format Check**: Basic regex validation for email format
2. **Domain Grouping**: Emails are grouped by their domain
3. **SMTP Verification**: Each domain group is verified using SMTP connection
4. **Results Display**: Shows validation status and messages for each email