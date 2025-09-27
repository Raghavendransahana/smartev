# Open Charge Map API Setup Guide

## 🚀 Quick Start

The EV Stations page works immediately with **demo data** - no setup required! However, for real-time charging station data, you'll need a free OCM API key.

## Demo Mode vs Real Data

### Demo Mode (Default)
- **Works immediately** with sample charging stations
- Shows 3 demo stations in major Indian cities
- Blue info message explaining how to get real data
- Perfect for development and testing

### Real Data Mode
- **Requires free API key** from Open Charge Map
- Access to 500,000+ real charging stations worldwide
- Real-time availability and station details
- Updated by community contributors

## Getting Your Free OCM API Key

### Step 1: Register/Login to OCM

1. Go to: <https://openchargemap.org/site/loginprovider?connect=true>
2. Sign up with Google, Microsoft, or create an account
3. Complete the registration process

### Step 2: Get Your API Key

1. After logging in, go to: <https://openchargemap.org/site/profile/applications>
2. Click "Register a new application"
3. Fill in the application details:
   - **Application Name**: FlexiEV SmartEV Platform
   - **Description**: EV charging station management platform
   - **Website URL**: <http://localhost:5176> (for development)
4. Submit the application
5. You'll receive your API key immediately

### Step 3: Configure Your Environment

1. Copy your API key
2. Open the `.env` file in `frontend/web/`
3. Replace the empty value with your actual API key:

   ```env
   VITE_OCM_API_KEY=your-actual-api-key-here
   ```

4. Save the file and restart the development server

## API Usage Limits

- **Free tier**: 10,000 requests per day
- **Rate limit**: 1 request per second
- **No cost**: OCM is completely free to use

## Troubleshooting

- **Demo data shown**: No API key configured (this is normal for first-time setup)
- **403 Forbidden**: API key is invalid or rejected
- **429 Too Many Requests**: Rate limit exceeded (wait 1 second between requests)
- **Network Error**: Check internet connection

## Support

If you have issues with the API key:

1. Check the OCM developer forum: <https://openchargemap.org/site/develop>
2. Contact OCM support through their website
3. Verify your application is approved in your OCM profile