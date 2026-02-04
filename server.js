// server.js
// Reads template + parameters file and exposes /params and /deploy
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ===== GitHub config from environment variables =====
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'AzureTest369';
const GITHUB_REPO = process.env.GITHUB_REPO || 'DeployAzureResources';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const WORKFLOW_FILE = process.env.WORKFLOW_FILE || 'deploy-vm.yml';
const WORKFLOW_REF = process.env.WORKFLOW_REF || 'main';

// Debug: Check if GITHUB_TOKEN is present (for testing only)
// console.log('GITHUB_TOKEN present?', !!process.env.GITHUB_TOKEN);
// ===============================================

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

    if (r.status === 204) {
      return res.json({ ok: true, message: 'Workflow dispatched' });
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
