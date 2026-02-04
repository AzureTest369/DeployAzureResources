const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const path = require('path');
const { ClientSecretCredential } = require('@azure/identity');
const { ResourceManagementClient } = require('@azure/arm-resources');

const app = express();
app.use(bodyParser.json());

// Serve static client (built SPA) from ./public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Environment variables (set in Azure App Settings / GitHub secrets used by workflow)
const {
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  AZURE_CLIENT_SECRET,
  AZURE_SUBSCRIPTION_ID,
  GITHUB_RAW_TEMPLATE_URL,
  GITHUB_RAW_PARAMETERS_URL
} = process.env;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

// API: return UI-friendly parameter metadata
app.get('/api/params', async (req, res) => {
  try {
    const templateUrl = req.query.templateUrl || GITHUB_RAW_TEMPLATE_URL;
    const paramsUrl = req.query.paramsUrl || GITHUB_RAW_PARAMETERS_URL;
    const [template, paramsFile] = await Promise.all([
      fetchJson(templateUrl),
      fetchJson(paramsUrl)
    ]);

    const templateParams = template.parameters || {};
    const fileParams = (paramsFile.parameters) || {};

    const uiParams = Object.keys(templateParams).map((name) => {
      const t = templateParams[name];
      const p = fileParams[name] || {};
      return {
        name,
        type: t.type || 'string',
        defaultValue: t.defaultValue,
        allowedValues: t.allowedValues || null,
        description: (t.metadata && t.metadata.description) || '',
        value: p.value !== undefined ? p.value : (t.defaultValue !== undefined ? t.defaultValue : '')
      };
    });

    res.json({ uiParams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: deploy selected parameters
app.post('/api/deploy', async (req, res) => {
  try {
    const { resourceGroup, deploymentName, parameters, location, templateUrl } = req.body;
    if (!resourceGroup || !deploymentName || !parameters) {
      return res.status(400).json({ error: 'resourceGroup, deploymentName and parameters are required' });
    }
    if (!location) return res.status(400).json({ error: 'location is required' });
    const template = await fetchJson(templateUrl || GITHUB_RAW_TEMPLATE_URL);

    const armParams = {};
    for (const [k, v] of Object.entries(parameters)) {
      armParams[k] = { value: v };
    }

    // Authenticate to Azure using client secret (ensure env vars set)
    const credential = new ClientSecretCredential(AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET);
    const client = new ResourceManagementClient(credential, AZURE_SUBSCRIPTION_ID);

    await client.resourceGroups.createOrUpdate(resourceGroup, { location });

    const deployment = {
      properties: {
        mode: 'Incremental',
        template,
        parameters: armParams
      }
    };

    const result = await client.deployments.createOrUpdate(resourceGroup, deploymentName, deployment);

    res.json({ deploymentResult: result });
  } catch (err) {
    console.error('Deployment error', err);
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback: return index.html for any other route (so routing works)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
