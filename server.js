// server.js
// Reads template + parameters file and exposes /params and /deploy
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ===== GitHub configuration from environment variables =====
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'AzureTest369';
const GITHUB_REPO  = process.env.GITHUB_REPO || 'DeployAzureResources'; // repository containing the workflow
const GITHUB_TOKEN = process.env.PERSONAL_ACCESS_TOKEN; // GitHub PAT (must include repo & workflow scopes)
const WORKFLOW_FILE = process.env.WORKFLOW_FILE || 'deploy-vm.yml'; // filename under .github/workflows
const WORKFLOW_REF  = process.env.WORKFLOW_REF || 'main'; // branch name where the workflow exists

// Validate required configuration at startup
if (!GITHUB_TOKEN) {
  console.error('ERROR: PERSONAL_ACCESS_TOKEN environment variable is required but not set.');
  console.error('Please set a GitHub Personal Access Token with "repo" and "workflow" scopes.');
  console.error('Example: export PERSONAL_ACCESS_TOKEN="your_token_here"');
  console.error('See .env.example for more details.');
  process.exit(1);
}
// ===============================================================

const TEMPLATE_FILE = path.join(__dirname, 'azuredeploy.json');
const PARAMS_FILE = path.join(__dirname, 'azuredeploy.parameters.json');

function safeReadJson(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

// GET /params -> returns metadata for each parameter (type, allowedValues, defaultValue, description)
app.get('/params', (req, res) => {
  const tpl = safeReadJson(TEMPLATE_FILE);
  const pfile = safeReadJson(PARAMS_FILE);
  if (!tpl) return res.status(500).json({ error: 'Template not found or invalid' });

  const tplParams = tpl.parameters || {};
  const pfileParams = (pfile && pfile.parameters) || {};

  const metadata = {};
  Object.keys(tplParams).forEach((k) => {
    const p = tplParams[k];
    // parameter-level defaultValue from template (if any)
    const tplDefault = p.defaultValue !== undefined ? p.defaultValue : null;
    // parameter value from azuredeploy.parameters.json
    const paramFileValue = (pfileParams[k] && pfileParams[k].value) !== undefined ? pfileParams[k].value : null;

    metadata[k] = {
      name: k,
      type: p.type || 'string',
      allowedValues: p.allowedValues || null,
      description: (p.metadata && p.metadata.description) || '',
      defaultValue: paramFileValue !== null ? paramFileValue : tplDefault
    };
  });

  res.json({ parameters: metadata });
});

// Trigger GitHub Actions workflow_dispatch
app.post('/deploy', async (req, res) => {
  if (!GITHUB_TOKEN) {
    return res.status(401).json({ 
      error: 'Unauthorized: Server not configured with PERSONAL_ACCESS_TOKEN',
      details: 'The GitHub Personal Access Token is missing. Please configure the PERSONAL_ACCESS_TOKEN environment variable with a valid token that has "repo" and "workflow" scopes.'
    });
  }
  const inputs = req.body || {};
  
  // Validate that we're not passing empty SSH values when using password auth
  if (inputs.authenticationType === 'password' && inputs.sshPublicKey) {
    delete inputs.sshPublicKey;
  }
  
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  const body = {
    ref: WORKFLOW_REF,
    inputs
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (r.status === 204) {
      return res.json({ ok: true, message: 'Workflow dispatched' });
    } else if (r.status === 401) {
      const txt = await r.text();
      console.error('GitHub API 401 Unauthorized:', txt);
      return res.status(401).json({ 
        ok: false, 
        error: 'Unauthorized: GitHub token is invalid or expired',
        details: 'The PERSONAL_ACCESS_TOKEN may be expired, revoked, or lack the necessary permissions. Please verify the token has "repo" and "workflow" scopes and regenerate if needed.',
        status: r.status, 
        response: txt 
      });
    } else {
      const txt = await r.text();
      console.error('GitHub API response:', r.status, txt);
      return res.status(500).json({ ok: false, status: r.status, response: txt });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to call GitHub API', detail: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
