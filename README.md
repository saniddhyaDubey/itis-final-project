# 📄 Azure Text Summarization API

A production-ready Node.js Express application that leverages **Azure Cognitive Services** to extract and summarize text using advanced NLP techniques.

---

## 🎯 Quick Overview

This API provides a simple, RESTful interface to Azure's **Extractive Summarization** service. It accepts plain text input and returns the most relevant sentences ranked by importance, perfect for document summarization, content curation, and information extraction.

**Key Features:**
- ⚡ Fast asynchronous job processing
- 🎯 AI-powered sentence extraction with relevance ranking
- 🛡️ Secure Azure authentication
- 📊 Detailed response with position and scoring data
- 🚀 Production-ready error handling

---

## 🚀 Getting Started in 5 Minutes

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- Azure subscription with an active **Language resource**

### 1. Setup Your Azure Credentials

Create a **Language resource** in Azure:

1. Log in to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search **Language**
3. Select **Language** service → Click **Create**
4. Fill in details (use **Standard (S)** pricing tier for text summarization)
5. Once deployed, go to **Keys and Endpoints**
6. Copy your **API Key** and **Endpoint URL**

### 2. Install Dependencies

```bash
npm install express axios
```

### 3. Configure the API

Open `app.js` and replace these placeholders:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';        // From Azure Portal
const ENDPOINT = 'YOUR_ENDPOINT_HERE';      // From Azure Portal
```

### 4. Start the Server

```bash
node app.js
```

You should see:
```
Server running on port 3000
Test the endpoint: POST http://localhost:3000/api/summarize
```

### 5. Make Your First Request

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence is transforming industries. Machine learning algorithms recognize patterns in data. Companies use AI for customer service optimization. Experts warn about ethical concerns. Society must establish clear guidelines."
  }'
```

**Using Postman:**
1. Open Postman
2. Create a new **POST** request
3. URL: `http://localhost:3000/api/summarize`
4. Headers: `Content-Type: application/json`
5. Body (raw):
```json
{
  "text": "Your text to summarize here..."
}
```
6. Click **Send**

---

## 📚 API Reference

### Summarize Text

Extracts and ranks the most important sentences from your text.

#### Request

```http
POST /api/summarize HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "text": "Your text here..."
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | The text to summarize (plain text only) |

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "jobId": "fb11709d-78ae-40eb-b746-15df8fd27242",
    "status": "succeeded",
    "tasks": {
      "items": [
        {
          "results": {
            "documents": [
              {
                "id": "1",
                "sentences": [
                  {
                    "text": "Artificial intelligence is transforming industries across the globe.",
                    "rankScore": 0.31,
                    "offset": 0,
                    "length": 68
                  },
                  {
                    "text": "However, experts warn that AI systems require careful oversight to ensure they are used ethically and responsibly.",
                    "rankScore": 1.0,
                    "offset": 277,
                    "length": 114
                  },
                  {
                    "text": "As these technologies become more powerful, society must establish clear guidelines and regulations.",
                    "rankScore": 0.35,
                    "offset": 392,
                    "length": 143
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}
```

#### Response Fields Explained

| Field | Description |
|-------|-------------|
| `success` | Boolean indicating successful request processing |
| `jobId` | Unique identifier for the summarization job |
| `status` | Job status: `succeeded`, `failed`, or `inProgress` |
| `sentences` | Array of extracted sentences |
| `rankScore` | Relevance score (0-1), higher = more important |
| `offset` | Character position where sentence starts in original text |
| `length` | Character length of the sentence |

#### Error Responses

**400 Bad Request** - Missing required parameter:
```json
{
  "error": "Text is required"
}
```

**500 Internal Server Error** - Azure API failure:
```json
{
  "error": "Failed to summarize text",
  "details": {
    "error": {
      "code": "InvalidRequest",
      "message": "Error details from Azure"
    }
  }
}
```

---

## 💻 Code Examples

### JavaScript / Node.js

**Basic Usage:**
```javascript
const axios = require('axios');

async function summarizeText(text) {
  try {
    const response = await axios.post('http://localhost:3000/api/summarize', {
      text: text
    });
    
    const summary = response.data.data.tasks.items[0].results.documents[0].sentences;
    
    summary.forEach((sentence, index) => {
      console.log(`${index + 1}. [Score: ${sentence.rankScore}] ${sentence.text}`);
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Usage
summarizeText('Your long text here...');
```

**Extract Top Summary:**
```javascript
async function getTopSummary(text) {
  const response = await axios.post('http://localhost:3000/api/summarize', { text });
  const sentences = response.data.data.tasks.items[0].results.documents[0].sentences;
  
  // Sort by rank score and return top sentences
  const topSentences = sentences
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 3)
    .map(s => s.text)
    .join(' ');
    
  return topSentences;
}
```

---

## 🔧 Understanding the API Flow

```
┌─────────────────┐
│  Submit Job     │ POST /api/summarize with text
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Azure Creates Job      │ Returns jobId
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Polling Job Status     │ Checks every ~1 second
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Job Completes          │ Status: "succeeded"
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Return Results         │ Extracted sentences with scores
└─────────────────────────┘
```

The API automatically handles:
- ✅ Job submission to Azure
- ✅ Polling for completion (up to 30 retries)
- ✅ Error handling and retry logic
- ✅ Result extraction and formatting

---

## 📊 Understanding Summarization Results

### What is "Rank Score"?

The `rankScore` (0-1) indicates how relevant a sentence is to the overall document:
- **1.0** = Most important, captures core idea
- **0.5** = Moderately important
- **0.1** = Less critical, supporting detail

### Example Analysis

**Original Text:**
> "Machine learning is revolutionizing software development. Teams now build intelligent systems without explicitly programming rules. This approach, called AI, requires massive datasets for training. However, algorithms still face challenges with bias and interpretability."

**Extracted Summary:**
```
1. Machine learning is revolutionizing software development.           [Score: 0.92]
2. However, algorithms still face challenges with bias and interpretability. [Score: 1.0]
3. This approach, called AI, requires massive datasets for training.   [Score: 0.45]
```

The API ranked the challenges sentence highest because it represents a critical counterpoint to the innovation narrative.

---

## 🛡️ Error Handling

### Common Errors and Solutions

#### 404 Resource Not Found
**Cause:** Incorrect Azure endpoint URL or credentials

**Solution:**
```javascript
// Verify your endpoint is in this format:
const ENDPOINT = 'https://your-resource-name.cognitiveservices.azure.com/';
// Double-check in Azure Portal > Keys and Endpoints
```

#### InvalidRequest Error
**Cause:** Text parameter missing or malformed

**Solution:**
```javascript
// ❌ Wrong
{ }

// ✅ Correct
{ "text": "Your text here" }
```

#### Job Polling Timeout
**Cause:** Azure taking too long to process (rare)

**Solution:**
- Check your internet connection
- Verify Azure service status
- Try with a shorter text input
- Check your Azure quota hasn't been exceeded

### Enable Debug Logging

Add this to `app.js` for detailed debugging:

```javascript
// Before making requests
axios.interceptors.request.use(config => {
  console.log('📤 Request:', config);
  return config;
});

axios.interceptors.response.use(response => {
  console.log('📥 Response:', response.data);
  return response;
});
```

---

## 📝 Input Specifications & Data Encoding

### Text Encoding

The API supports **UTF-8 encoding** for all text input:

```javascript
// ✅ Supports special characters
const text = "C++ is more efficient than Python! 你好世界 🚀";
```

### Text Length Limits

| Limit | Value |
|-------|-------|
| Minimum | 1 character |
| Maximum | ~5,120 characters per document |
| Recommended | 100-3,000 characters |

### Language Support

The API automatically detects language (set to English by default). Supported languages:
- English, Spanish, French, German
- Portuguese, Italian, Dutch
- Russian, Chinese, Japanese, Korean
- And 50+ others

---

## 🧪 Testing & Experimentation

### Test Cases

**Test 1: Short News Article**
```json
{
  "text": "Tech company announces new AI features. The update includes machine learning capabilities. Users can now automate complex tasks. The feature is available starting next month."
}
```

**Test 2: Long Research Paper**
```json
{
  "text": "This comprehensive study examines the intersection of cloud computing and edge devices. We conducted experiments across 15 different environments. Our findings reveal a 40% improvement in latency. These results have significant implications for distributed systems. However, scalability remains a concern for enterprise deployments."
}
```

**Test 3: Customer Support Conversation**
```json
{
  "text": "Customer asked about billing. Support agent explained the pricing model. Customer was concerned about hidden charges. Agent assured full transparency. Customer agreed to continue service."
}
```

### Try It Online

1. Keep the server running: `node app.js`
2. Open Postman or any API client
3. Set URL: `http://localhost:3000/api/summarize`
4. Experiment with different text lengths and types
5. Observe how `rankScore` changes across different inputs

---

## 🏗️ Architecture & How It Works

### System Components

```
┌──────────────────┐
│   Your Client    │
│   (Postman, etc) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   Express Server (app.js)    │
│  - Validates input           │
│  - Calls Azure API           │
│  - Manages polling           │
│  - Returns results           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Azure Cognitive Services (Cloud)   │
│  - Natural Language Processing       │
│  - Sentence extraction & ranking     │
│  - Asynchronous job processing       │
└──────────────────────────────────────┘
```

### Behind the Scenes

When you call `/api/summarize`:

1. **Request Validation** - Checks that `text` parameter exists
2. **Job Submission** - Sends text to Azure with NLP task configuration
3. **Async Processing** - Azure queues your job (usually takes 1-3 seconds)
4. **Polling Loop** - Server checks job status every 1 second
5. **Result Extraction** - Once complete, extracts sentences and scores
6. **Response** - Returns formatted data to your client

---

## 🔐 Security Best Practices

### Production Deployment

**Never hardcode credentials in source code:**

```javascript
// ❌ NEVER DO THIS
const API_KEY = 'abc123xyz456...';

// ✅ DO THIS INSTEAD
const API_KEY = process.env.AZURE_API_KEY;
const ENDPOINT = process.env.AZURE_ENDPOINT;
```

### Using Environment Variables

Create a `.env` file:
```
AZURE_API_KEY=your_api_key_here
AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
PORT=3000
```

Install dotenv:
```bash
npm install dotenv
```

Update `app.js`:
```javascript
require('dotenv').config();

const API_KEY = process.env.AZURE_API_KEY;
const ENDPOINT = process.env.AZURE_ENDPOINT;
```

### Access Control

In production, add authentication to your endpoints:

```javascript
function authenticate(req, res, next) {
  const token = req.headers['x-api-key'];
  if (token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/api/summarize', authenticate, async (req, res) => {
  // ... handle request
});
```

---

## 📦 Deployment Guide

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set AZURE_API_KEY=your_key
heroku config:set AZURE_ENDPOINT=your_endpoint

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to AWS Lambda

```bash
npm install serverless-http
```

Update `app.js`:
```javascript
const serverless = require('serverless-http');
module.exports.handler = serverless(app);
```

Deploy:
```bash
serverless deploy
```

---

## 🐛 Troubleshooting

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Invalid API Key"

**Solution:**
1. Go to Azure Portal
2. Navigate to your Language resource
3. Go to **Keys and Endpoints**
4. Copy **Key 1** (not Key 2)
5. Paste into your `.env` file

### Issue: "Job polling timeout"

**Solution:**
- This means Azure took >30 seconds to process
- Try with shorter text input
- Check Azure service status
- Increase `maxRetries` in `app.js` if needed

### Issue: "CORS errors in browser"

**Solution:**
Add CORS middleware:
```bash
npm install cors
```

```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📈 Performance & Limits

### Response Times

| Text Length | Typical Time | Max Time |
|------------|--------------|----------|
| <500 chars | <2 seconds | 5 seconds |
| 500-2000 chars | 2-5 seconds | 10 seconds |
| 2000-5000 chars | 5-10 seconds | 20 seconds |

### Concurrency Limits

Azure Language Service has rate limits:
- **Free Tier (F0):** 1 request/second
- **Standard Tier (S):** 10 requests/second

For production use, request higher limits from Azure.

---

## 🚀 Advanced Usage

### Batch Processing Multiple Texts

```javascript
async function summarizeBatch(texts) {
  const results = await Promise.all(
    texts.map(text => 
      axios.post('http://localhost:3000/api/summarize', { text })
    )
  );
  return results.map(r => r.data);
}

// Usage
const articles = ["Article 1...", "Article 2...", "Article 3..."];
summarizeBatch(articles).then(summaries => {
  console.log(summaries);
});
```

### Filter Sentences by Rank

```javascript
async function getSummaryAboveThreshold(text, threshold = 0.5) {
  const response = await axios.post('http://localhost:3000/api/summarize', { text });
  const sentences = response.data.data.tasks.items[0].results.documents[0].sentences;
  
  return sentences.filter(s => s.rankScore >= threshold);
}
```

### Generate Headline from Summary

```javascript
async function generateHeadline(text) {
  const response = await axios.post('http://localhost:3000/api/summarize', { text });
  const topSentence = response.data.data.tasks.items[0].results.documents[0].sentences
    .sort((a, b) => b.rankScore - a.rankScore)[0];
  
  return topSentence.text.replace(/\.$/, ''); // Remove period
}
```

---

## 📚 Resources

- [Azure Text Summarization Docs](https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview)
- [Express.js Documentation](https://expressjs.com/)
- [Axios Documentation](https://axios-http.com/)
- [Azure Portal](https://portal.azure.com)

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## ✨ Project Status

✅ **Complete** - Ready for production use

### Tested Features:
- ✅ Text submission and processing
- ✅ Asynchronous job handling
- ✅ Error handling and validation
- ✅ Multiple text lengths
- ✅ Postman API testing
- ✅ Score ranking accuracy

---

## 👨‍💻 About This Project

This is a student project demonstrating integration with Azure Cognitive Services. The API showcases:
- RESTful API design best practices
- Asynchronous API polling patterns
- Cloud service integration
- Comprehensive documentation
- Error handling and validation

**Created:** December 2025  
**Technology Stack:** Node.js, Express, Azure Cognitive Services, Axios

---

## 🎓 Learning Outcomes

Through building this API, you'll learn:
- How to integrate with cloud AI services
- Asynchronous programming patterns
- RESTful API design principles
- Error handling in Node.js
- Cloud service authentication
- API documentation best practices

---

## 💬 Questions or Issues?

If you encounter problems:
1. Check the **Troubleshooting** section above
2. Verify your Azure credentials
3. Review error messages carefully
4. Check that Node.js and npm are installed correctly

---

**Happy Summarizing! 🚀**
