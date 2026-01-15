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

// Custom welcome email HTML
const CUSTOM_WELCOME_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Disposable Mail Service</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            padding: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
        }
        .button {
            display: inline-block;
            background: #48bb78;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
        .button:hover {
            background: #38a169;
        }
        .features {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Disposable Mail Service!</h1>
            <p>Your temporary email is ready to use</p>
        </div>
        
        <div class="content">
            <p>Hello there! 👋</p>
            <p>Thank you for using our disposable email service. Your temporary email address has been successfully created and is ready to receive messages.</p>
            
            <div class="features">
                <h3>✨ Features:</h3>
                <ul>
                    <li>✅ No registration required</li>
                    <li>✅ Complete privacy protection</li>
                    <li>✅ Auto-delete after 60 minutes</li>
                    <li>✅ Free to use forever</li>
                    <li>✅ Works on all devices</li>
                </ul>
            </div>
            
            <h3>📱 Stay Connected:</h3>
            <p>Join our WhatsApp channel for updates, tips, and exclusive content:</p>
            
            <center>
                <a href="https://whatsapp.com/channel/0029Vb901QrFy724Izy9Wn0m" class="button" target="_blank">
                    Join WhatsApp Channel
                </a>
            </center>
            
            <p style="margin-top: 30px; font-style: italic;">
                Created with ❤️ by Muhammad Makki
            </p>
        </div>
        
        <div class="footer">
            <p>🔒 Your privacy matters. This service helps protect your primary email from spam.</p>
            <p>📍 Service powered by <strong>TempLiify</strong></p>
        </div>
    </div>
</body>
</html>
`;

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

    let emails = response.data;
    if (Array.isArray(emails)) {
      // Filter out the original welcome mail from disposablemail.com
      emails = emails.filter(email => {
        // Remove disposablemail.com's welcome email
        if (email.predmet?.includes('Welcome to DisposableMail')) {
          return false;
        }
        // Also check for other welcome email patterns
        if (email.od?.includes('Admin@DisposableMail.com')) {
          return false;
        }
        return true;
      });
      
      // Add our custom welcome email if inbox is empty
      if (emails.length === 0) {
        const welcomeEmail = {
          predmetZkraceny: "Welcome to Mail Service",
          predmet: "Welcome to Disposable Mail Service by Muhammad Makki",
          od: "TempLiify Service <support@templiify.com>",
          id: 1,
          kdy: "Just now",
          akce: "",
          precteno: "new",
          isCustomWelcome: true
        };
        emails.unshift(welcomeEmail);
      }
    } else if (!emails || emails.length === 0) {
      // If no emails at all, add our welcome email
      emails = [{
        predmetZkraceny: "Welcome to Mail Service",
        predmet: "Welcome to Disposable Mail Service by Muhammad Makki",
        od: "TempLiify Service <support@templiify.com>",
        id: 1,
        kdy: "Just now",
        akce: "",
        precteno: "new",
        isCustomWelcome: true
      }];
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
    // Check if this is our custom welcome email (id 1)
    if (id === "1") {
      // Return our custom welcome email HTML
      return res.json({ 
        html: CUSTOM_WELCOME_HTML,
        isCustomWelcome: true
      });
    }

    // For other emails, fetch from disposablemail.com
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

    // Check if this is disposablemail.com's welcome email
    const htmlContent = response.data;
    if (htmlContent.includes('Welcome to our Temporary Email Service!') || 
        htmlContent.includes('DisposableMail.com') ||
        htmlContent.includes('temp mail address')) {
      // Instead of showing their welcome email, show ours
      return res.json({ 
        html: CUSTOM_WELCOME_HTML,
        isCustomWelcome: true
      });
    }

    res.json({ html: htmlContent });
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
    // Don't allow deletion of our custom welcome email
    if (id === "1") {
      return res.json({ 
        success: false, 
        message: "Cannot delete welcome email" 
      });
    }

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

// Serve the HTML frontend
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disposable Mail Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
            padding: 30px;
        }

        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }

        .control-panel {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            border: 1px solid #e9ecef;
        }

        .control-panel h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .input-group {
            margin-bottom: 20px;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }

        .input-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }

        .buttons button {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #667eea;
            color: white;
        }

        .btn-primary:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: #48bb78;
            color: white;
        }

        .btn-secondary:hover {
            background: #38a169;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(72, 187, 120, 0.4);
        }

        .btn-info {
            background: #4299e1;
            color: white;
        }

        .btn-info:hover {
            background: #3182ce;
            transform: translateY(-2px);
        }

        .btn-small {
            padding: 6px 12px !important;
            font-size: 0.9rem !important;
        }

        .current-email {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px dashed #667eea;
            margin-top: 20px;
        }

        .current-email h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }

        .email-display {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 1.1rem;
            color: #333;
            word-break: break-all;
            margin-bottom: 15px;
        }

        .email-display .copy-btn {
            float: right;
            background: #4299e1;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .email-display .copy-btn:hover {
            background: #3182ce;
        }

        .inbox-container {
            background: white;
            border-radius: 15px;
            border: 1px solid #e9ecef;
            overflow: hidden;
        }

        .inbox-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .inbox-header h2 {
            color: #333;
            font-size: 1.5rem;
        }

        .refresh-btn {
            background: #48bb78;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
        }

        .refresh-btn:hover {
            background: #38a169;
            transform: translateY(-2px);
        }

        .inbox-list {
            max-height: 500px;
            overflow-y: auto;
        }

        .email-item {
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .email-item:hover {
            background-color: #f8f9fa;
        }

        .email-item.unread {
            background-color: #f0f7ff;
            border-left: 4px solid #667eea;
        }

        .email-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .email-subject {
            font-weight: 600;
            color: #333;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }

        .email-from {
            color: #666;
            font-size: 0.95rem;
            margin-bottom: 5px;
        }

        .email-time {
            color: #999;
            font-size: 0.85rem;
            white-space: nowrap;
        }

        .email-preview {
            color: #777;
            font-size: 0.95rem;
            line-height: 1.4;
            max-height: 40px;
            overflow: hidden;
        }

        .no-emails {
            text-align: center;
            padding: 40px 20px;
            color: #999;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow: hidden;
            animation: modalAppear 0.3s ease;
        }

        @keyframes modalAppear {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            font-size: 1.3rem;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s;
        }

        .close-btn:hover {
            background: rgba(255,255,255,0.2);
        }

        .modal-body {
            padding: 0;
        }

        .email-iframe {
            width: 100%;
            height: 70vh;
            border: none;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #667eea;
        }

        .loading::after {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #667eea;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .error {
            background: #fed7d7;
            color: #c53030;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .api-docs-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s;
            z-index: 100;
        }

        .api-docs-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .docs-modal .modal-content {
            max-width: 600px;
        }

        .endpoint {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #667eea;
        }

        .endpoint h4 {
            color: #333;
            margin-bottom: 8px;
            font-family: monospace;
        }

        .endpoint p {
            color: #666;
            margin-bottom: 10px;
        }

        .param {
            background: white;
            padding: 8px 12px;
            border-radius: 5px;
            margin-bottom: 5px;
            font-family: monospace;
            font-size: 0.9rem;
        }

        footer {
            text-align: center;
            padding: 20px;
            color: #777;
            font-size: 0.9rem;
            border-top: 1px solid #e9ecef;
        }

        footer a {
            color: #667eea;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

        .status {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            text-align: center;
            display: none;
        }

        .status.success {
            background: #c6f6d5;
            color: #22543d;
        }

        .status.error {
            background: #fed7d7;
            color: #c53030;
        }
        
        .welcome-badge {
            background: #48bb78;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📧 Disposable Mail Generator</h1>
            <p>Generate temporary email addresses instantly. No registration required.</p>
        </header>

        <div class="main-content">
            <div class="control-panel">
                <h2>Generate Email</h2>
                
                <div class="error" id="error"></div>
                <div class="status" id="status"></div>
                
                <div class="input-group">
                    <label for="customName">Custom Name (Optional)</label>
                    <input type="text" id="customName" placeholder="Enter custom name for email">
                </div>

                <div class="buttons">
                    <button class="btn-primary" onclick="generateEmail()">
                        Generate Email
                    </button>
                    <button class="btn-secondary" onclick="generateCustomEmail()">
                        Custom Email
                    </button>
                </div>

                <button class="btn-info" onclick="clearAll()" style="width: 100%; margin-bottom: 20px;">
                    Clear All
                </button>

                <div class="current-email" id="currentEmailSection" style="display: none;">
                    <h3>Your Email Address</h3>
                    <div class="email-display">
                        <span id="currentEmail"></span>
                        <button class="copy-btn" onclick="copyEmail()">Copy</button>
                    </div>
                    <div class="buttons">
                        <button class="btn-small btn-info" onclick="copyEmail()">Copy Email</button>
                        <button class="btn-small btn-secondary" onclick="checkInbox()">Check Inbox</button>
                    </div>
                </div>
            </div>

            <div class="inbox-container">
                <div class="inbox-header">
                    <h2>📬 Inbox</h2>
                    <button class="refresh-btn" onclick="checkInbox()" id="refreshBtn">
                        <span>🔄 Refresh</span>
                    </button>
                </div>
                <div class="inbox-list" id="inboxList">
                    <div class="no-emails">
                        <p>No emails yet. Generate an email address to start receiving mail.</p>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <p>Created with ❤️ by <strong>Muhammad Makki</strong></p>
            <p>Join our <a href="https://whatsapp.com/channel/0029Vb901QrFy724Izy9Wn0m" target="_blank">WhatsApp Channel</a> for updates</p>
        </footer>
    </div>

    <!-- Email Modal -->
    <div class="modal" id="emailModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="emailModalTitle">Email Content</h3>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <iframe id="emailFrame" class="email-iframe"></iframe>
            </div>
        </div>
    </div>

    <!-- API Docs Modal -->
    <div class="modal docs-modal" id="docsModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>API Documentation</h3>
                <button class="close-btn" onclick="closeDocsModal()">×</button>
            </div>
            <div class="modal-body" style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                <h4 style="margin-bottom: 20px; color: #333;">Available Endpoints</h4>
                
                <div class="endpoint">
                    <h4>GET /getmail</h4>
                    <p>Generate a random email address</p>
                    <div class="param">Optional parameter: ?name=customname</div>
                </div>
                
                <div class="endpoint">
                    <h4>GET /chkmail</h4>
                    <p>Check inbox for received messages</p>
                    <div class="param">Required parameter: ?mail=email@domain.com</div>
                </div>
                
                <div class="endpoint">
                    <h4>GET /getmailbyid</h4>
                    <p>Get full email content by message ID</p>
                    <div class="param">Required parameters: ?mail=email@domain.com&id=message_id</div>
                </div>
                
                <div class="endpoint">
                    <h4>GET /delete</h4>
                    <p>Delete a specific mail by ID</p>
                    <div class="param">Required parameters: ?mail=email@domain.com&id=message_id</div>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f0f7ff; border-radius: 8px;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">📌 Response Format</h4>
                    <p style="color: #666;">All responses include WhatsApp channel link:</p>
                    <pre style="background: white; padding: 10px; border-radius: 5px; font-size: 0.9rem; margin-top: 10px;">
{
    "data": { ... },
    "whatsapp_channel": "https://whatsapp.com/channel/..."
}</pre>
                </div>
            </div>
        </div>
    </div>

    <button class="api-docs-btn" onclick="showDocsModal()">📖</button>

    <script>
        let currentEmail = '';
        let currentSession = '';
        let inboxData = [];

        function showStatus(message, type = 'success') {
            const statusDiv = document.getElementById('status');
            statusDiv.textContent = message;
            statusDiv.className = \`status \${type}\`;
            statusDiv.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        }

        function showError(message) {
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        async function generateEmail() {
            try {
                showStatus('Generating email...', 'success');
                const response = await fetch('/getmail');
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                const emailData = data.data;
                currentEmail = emailData.email;
                currentSession = emailData.session || '';
                
                document.getElementById('currentEmail').textContent = currentEmail;
                document.getElementById('currentEmailSection').style.display = 'block';
                document.getElementById('customName').value = '';
                
                showStatus('Email generated successfully!', 'success');
                
                // Check inbox after a short delay
                setTimeout(checkInbox, 1000);
            } catch (error) {
                showError('Failed to generate email: ' + error.message);
            }
        }

        async function generateCustomEmail() {
            const customName = document.getElementById('customName').value.trim();
            if (!customName) {
                showError('Please enter a custom name');
                return;
            }
            
            try {
                showStatus('Generating custom email...', 'success');
                const response = await fetch(\`/getmail?name=\${encodeURIComponent(customName)}\`);
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                const emailData = data.data;
                if (!emailData || !emailData.email) {
                    throw new Error('Email not available. Try another name.');
                }
                
                currentEmail = emailData.email;
                currentSession = emailData.session || '';
                
                document.getElementById('currentEmail').textContent = currentEmail;
                document.getElementById('currentEmailSection').style.display = 'block';
                
                showStatus('Custom email created successfully!', 'success');
                
                setTimeout(checkInbox, 1000);
            } catch (error) {
                showError(error.message);
            }
        }

        async function checkInbox() {
            if (!currentEmail) {
                showError('Please generate an email first');
                return;
            }
            
            try {
                const refreshBtn = document.getElementById('refreshBtn');
                refreshBtn.innerHTML = '<span>🔄 Loading...</span>';
                refreshBtn.disabled = true;
                
                const response = await fetch(\`/chkmail?mail=\${encodeURIComponent(currentEmail)}\`);
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                inboxData = data.data || [];
                renderInbox();
                
                if (inboxData.length === 0) {
                    showStatus('No emails found. Send an email to your address.', 'success');
                } else {
                    showStatus(\`Found \${inboxData.length} emails\`, 'success');
                }
            } catch (error) {
                showError('Failed to check inbox: ' + error.message);
            } finally {
                const refreshBtn = document.getElementById('refreshBtn');
                refreshBtn.innerHTML = '<span>🔄 Refresh</span>';
                refreshBtn.disabled = false;
            }
        }

        function renderInbox() {
            const inboxList = document.getElementById('inboxList');
            
            if (inboxData.length === 0) {
                inboxList.innerHTML = \`
                    <div class="no-emails">
                        <p>No emails yet. Send an email to your address.</p>
                    </div>
                \`;
                return;
            }
            
            inboxList.innerHTML = '';
            
            inboxData.forEach(email => {
                const emailItem = document.createElement('div');
                emailItem.className = \`email-item \${email.precteno === 'new' ? 'unread' : ''}\`;
                emailItem.onclick = () => viewEmail(email.id);
                
                const timeAgo = email.kdy || 'Just now';
                const subject = email.predmetZkraceny || email.predmet || 'No subject';
                const from = email.od || 'Unknown sender';
                const isWelcome = email.isCustomWelcome || subject.includes('Welcome to Disposable Mail Service');
                
                emailItem.innerHTML = \`
                    <div class="email-header">
                        <div>
                            <div class="email-subject">
                                \${subject}
                                \${isWelcome ? '<span class="welcome-badge">Welcome</span>' : ''}
                            </div>
                            <div class="email-from">From: \${from}</div>
                        </div>
                        <div class="email-time">\${timeAgo}</div>
                    </div>
                \`;
                
                inboxList.appendChild(emailItem);
            });
        }

        async function viewEmail(emailId) {
            if (!currentEmail) return;
            
            try {
                showStatus('Loading email...', 'success');
                const response = await fetch(\`/getmailbyid?mail=\${encodeURIComponent(currentEmail)}&id=\${emailId}\`);
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                const modal = document.getElementById('emailModal');
                const iframe = document.getElementById('emailFrame');
                
                // Create a blob with the HTML content
                const blob = new Blob([data.data.html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                
                iframe.src = url;
                modal.style.display = 'flex';
                
                // Mark as read if it's not our welcome email
                if (!data.data.isCustomWelcome) {
                    const emailIndex = inboxData.findIndex(e => e.id == emailId);
                    if (emailIndex > -1 && inboxData[emailIndex].precteno === 'new') {
                        inboxData[emailIndex].precteno = 'read';
                        renderInbox();
                    }
                }
            } catch (error) {
                showError('Failed to load email: ' + error.message);
            }
        }

        function copyEmail() {
            if (!currentEmail) return;
            
            navigator.clipboard.writeText(currentEmail).then(() => {
                showStatus('Email copied to clipboard!', 'success');
            }).catch(() => {
                showError('Failed to copy email');
            });
        }

        function clearAll() {
            currentEmail = '';
            currentSession = '';
            inboxData = [];
            
            document.getElementById('currentEmailSection').style.display = 'none';
            document.getElementById('customName').value = '';
            document.getElementById('inboxList').innerHTML = \`
                <div class="no-emails">
                    <p>No emails yet. Generate an email address to start receiving mail.</p>
                </div>
            \`;
            
            showStatus('All cleared', 'success');
        }

        function closeModal() {
            document.getElementById('emailModal').style.display = 'none';
            const iframe = document.getElementById('emailFrame');
            if (iframe.src) {
                URL.revokeObjectURL(iframe.src);
                iframe.src = '';
            }
        }

        function showDocsModal() {
            document.getElementById('docsModal').style.display = 'flex';
        }

        function closeDocsModal() {
            document.getElementById('docsModal').style.display = 'none';
        }

        // Close modals when clicking outside
        window.onclick = function(event) {
            const emailModal = document.getElementById('emailModal');
            const docsModal = document.getElementById('docsModal');
            
            if (event.target === emailModal) {
                closeModal();
            }
            if (event.target === docsModal) {
                closeDocsModal();
            }
        }

        // Check inbox automatically every 30 seconds if we have an email
        setInterval(() => {
            if (currentEmail) {
                checkInbox();
            }
        }, 30000);
    </script>
</body>
</html>
  `);
});

module.exports = app;
