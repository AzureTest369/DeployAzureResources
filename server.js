// server.js (hard-coded GitHub values - DO NOT COMMIT THIS FILE WITH REAL TOKEN)
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ===== Hard-coded GitHub config (temporary) =====
// Replace these values with your actual values BEFORE running:
const GITHUB_OWNER = 'anweshak369';           // your GitHub user/org
const GITHUB_REPO  = 'DeployAzureResources';       // repository containing the workflow
const GITHUB_TOKEN = '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'; // your GitHub PAT (must include repo & workflow scopes)

const WORKFLOW_FILE = 'deploy-vm.yml'; // filename under .github/workflows
const WORKFLOW_REF  = 'main';          // branch name where the workflow exists
// ===============================================

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
    ref: WORKFLOW_REF,
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

    // GitHub returns 204 No Content on success
    if (r.status === 204) {
      return res.json({ ok: true, message: 'Workflow dispatched' });
    } else {
      const txt = await r.text();
      console.error('GitHub API response:', r.status, txt);
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
