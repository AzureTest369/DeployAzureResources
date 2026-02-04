const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Config: set these environment variables for the backend
// GITHUB_OWNER (owner/org), GITHUB_REPO, GITHUB_TOKEN (PAT)
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'YOUR_GITHUB_OWNER';
const GITHUB_REPO = process.env.GITHUB_REPO || 'YOUR_REPO';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // PAT with repo & workflow scopes
const WORKFLOW_FILE = 'deploy-vm.yml'; // workflow filename under .github/workflows

// Helper to read template parameters and return parameter metadata
app.get('/params', (req, res) => {
  const tplPath = path.join(__dirname, 'azuredeploy.json');
  try {
    const tpl = JSON.parse(fs.readFileSync(tplPath, 'utf8'));
    const params = tpl.parameters || {};
    const metadata = {};
    Object.keys(params).forEach((k) => {
      metadata[k] = {
        type: params[k].type,
        defaultValue: params[k].defaultValue || null,
        allowedValues: params[k].allowedValues || null,
        description: (params[k].metadata && params[k].metadata.description) || ''
      };
    });
    res.json({ parameters: metadata });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read template' });
  }
});

// Trigger GitHub Actions workflow_dispatch
app.post('/deploy', async (req, res) => {
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server not configured with GITHUB_TOKEN' });
  }
  const inputs = req.body || {};
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  const body = {
    ref: 'main', // change branch if needed
    inputs
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (r.status === 204) {
      return res.json({ ok: true, message: 'Workflow dispatched' });
    } else {
      const txt = await r.text();
      return res.status(500).json({ ok: false, status: r.status, response: txt });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to call GitHub API' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
