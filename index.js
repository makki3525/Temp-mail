const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Middleware to append WhatsApp channel link to all JSON responses
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const response = {
      data: data,
      whatsapp_channel: "https://whatsapp.com/channel/0029Vb901QrFy724Izy9Wn0m"
    };
    originalJson.call(this, response);
  };
  next();
});

// Serve static files
app.use(express.static('public'));

// For custom mail create (if name given)
async function getCustomMail(name) {
  const checkRes = await axios.post(
    'https://www.disposablemail.com/index/email-check/',
    new URLSearchParams({ email: name, format: 'json' }),
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://www.disposablemail.com',
      }
    }
  );

  if (checkRes.data !== 'ok') return null;

  const createRes = await axios.post(
    'https://www.disposablemail.com/index/new-email/',
    new URLSearchParams({ emailInput: name, format: 'json' }),
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://www.disposablemail.com',
      }
    }
  );

  const cookie = createRes.headers['set-cookie']?.find(c => c.includes('TMA='))?.split(';')[0];
  const email = decodeURIComponent(cookie?.split('=')[1]);

  return { email, session: cookie };
}

// For default mail (if no name given)
async function getDefaultMail() {
  const homeRes = await axios.get('https://www.disposablemail.com', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'DNT': '1',
      'Referer': 'https://www.disposablemail.com/',
    },
    decompress: true
  });

  const setCookie = homeRes.headers['set-cookie'];
  const phpsessid = setCookie?.find(c => c.includes('PHPSESSID'))?.split(';')[0];
  const csrf = homeRes.data.match(/const CSRF\s*=\s*"(.+?)"/)?.[1];

  const inboxRes = await axios.get(`https://www.disposablemail.com/index/index?csrf_token=${csrf}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.disposablemail.com/',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': phpsessid
    },
    decompress: true
  });

  return {
    email: inboxRes.data?.email || null,
    password: inboxRes.data?.heslo || null,
  };
}

// Create mail route
app.get('/getmail', async (req, res) => {
  try {
    const name = req.query.name;
    if (name) {
      const result = await getCustomMail(name);
      if (!result) return res.status(400).json({ error: 'Mail not available' });
      return res.json(result);
    } else {
      const data = await getDefaultMail();
      return res.json(data);
    }
  } catch {
    res.status(500).json({ error: 'Failed to generate mail' });
  }
});

// Check inbox route
app.get('/chkmail', async (req, res) => {
  const mail = req.query.mail;
  if (!mail) return res.status(400).json({ error: 'Missing mail query parameter' });

  try {
    const response = await axios.get('https://www.disposablemail.com/index/refresh', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'sec-ch-ua-platform': '"Android"',
        'x-requested-with': 'XMLHttpRequest',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-fetch-site': 'same-origin',
        'referer': 'https://www.disposablemail.com/',
        'accept-language': 'en-US,en;q=0.9',
        'Cookie': `TMA=${encodeURIComponent(mail)}`
      }
    });

    // Filter out the welcome mail
    let emails = response.data;
    if (Array.isArray(emails)) {
      emails = emails.filter(email => !email.predmet?.includes('Welcome to DisposableMail'));
    }
    
    res.json(emails);
  } catch {
    res.status(500).json({ error: 'Failed to check mail' });
  }
});

// Get full email content by ID
app.get('/getmailbyid', async (req, res) => {
  const { mail, id } = req.query;
  if (!mail || !id) return res.status(400).json({ error: 'Missing mail or id parameter' });

  try {
    const response = await axios.get(`https://www.disposablemail.com/email/id/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Cookie': `TMA=${encodeURIComponent(mail)}`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.disposablemail.com/'
      },
      decompress: true
    });

    res.json({ html: response.data });
  } catch (error) {
    console.error('Error fetching email content:', error.message);
    res.status(500).json({ error: 'Failed to fetch email content' });
  }
});

// Delete mail route
app.get('/delete', async (req, res) => {
  const { mail, id } = req.query;
  if (!mail || !id) return res.status(400).json({ error: 'Missing mail or id' });

  try {
    const delRes = await axios.post(`https://www.disposablemail.com/delete-email/${id}`,
      new URLSearchParams({ id }),
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'sec-ch-ua-platform': '"Android"',
          'sec-ch-ua-mobile': '?1',
          'x-requested-with': 'XMLHttpRequest',
          'sec-fetch-mode': 'cors',
          'Cookie': `TMA=${encodeURIComponent(mail)}`
        }
      }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete mail' });
  }
});

// API documentation
app.get('/api-docs', (req, res) => {
  res.json({
    endpoints: [
      {
        method: 'GET',
        path: '/getmail',
        description: 'Generate a random email address',
        parameters: [
          { name: 'name', optional: true, description: 'Custom name for email (e.g., yourname)' }
        ]
      },
      {
        method: 'GET',
        path: '/chkmail',
        description: 'Check inbox for received messages',
        parameters: [
          { name: 'mail', required: true, description: 'Email address to check' }
        ]
      },
      {
        method: 'GET',
        path: '/getmailbyid',
        description: 'Get full email content by message ID',
        parameters: [
          { name: 'mail', required: true, description: 'Email address' },
          { name: 'id', required: true, description: 'Message ID' }
        ]
      },
      {
        method: 'GET',
        path: '/delete',
        description: 'Delete a specific mail by ID',
        parameters: [
          { name: 'mail', required: true, description: 'Email address' },
          { name: 'id', required: true, description: 'Message ID' }
        ]
      }
    ]
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
