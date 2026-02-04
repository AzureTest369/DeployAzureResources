// server.js
// Reads template + parameters file and exposes /params and /deploy
const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ===== Hard-coded GitHub config (temporary) =====
// Replace with your values (or switch back to env vars later)
const GITHUB_OWNER = 'anweshak369';           // your GitHub user/org
const GITHUB_REPO  = 'DeployAzureResources'; // repository containing the workflow
const GITHUB_TOKEN = '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'; // your GitHub PAT (must include repo & workflow scopes)
const WORKFLOW_FILE = 'deploy-vm.yml'; // filename under .github/workflows
const WORKFLOW_REF  = 'main';          // branch name where the workflow exists
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
