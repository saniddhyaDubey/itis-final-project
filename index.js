const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Your Azure credentials
const API_KEY = 'YOUR_API_KEY_HERE';
const ENDPOINT = 'YOUR_ENDPOINT_HERE';

// Function to wait for job completion with polling
async function pollJobStatus(jobId, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `${ENDPOINT}/language/analyze-text/jobs/${jobId}?api-version=2022-10-01-preview`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'succeeded') {
        return response.data;
      } else if (response.data.status === 'failed') {
        throw new Error('Job failed');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      throw error;
    }
  }

  throw new Error('Job polling timeout');
}

// POST endpoint for text summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const submitResponse = await axios.post(
      `${ENDPOINT}/language/analyze-text/jobs?api-version=2022-10-01-preview`,
      {
        displayName: 'Text Summarization Task',
        analysisInput: {
          documents: [
            {
              id: '1',
              language: 'en',
              text: text
            }
          ]
        },
        tasks: [
          {
            kind: 'ExtractiveSummarization',
            parameters: {
              sentenceCount: 3
            }
          }
        ]
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const operationLocation = submitResponse.headers['operation-location'];
    const jobId = operationLocation.split('/').pop().split('?')[0];
    console.log('Job submitted:', jobId);

    const result = await pollJobStatus(jobId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to summarize text',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the endpoint: POST http://localhost:${PORT}/api/summarize`);
});
