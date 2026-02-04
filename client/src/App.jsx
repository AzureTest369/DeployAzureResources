import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';

function App() {
  const [params, setParams] = useState([]);
  const [values, setValues] = useState({});
  const [resourceGroup, setResourceGroup] = useState('MyResourceGroup');
  const [location, setLocation] = useState('eastus');
  const [deploymentName, setDeploymentName] = useState('vm-deployment');
  const [templateUrl, setTemplateUrl] = useState('');
  const [paramsUrl, setParamsUrl] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch parameter metadata from backend
    async function load() {
      try {
        const res = await axios.get('/api/params');
        setParams(res.data.uiParams || []);
        const initial = {};
        (res.data.uiParams || []).forEach(p => {
          initial[p.name] = p.value || '';
        });
        setValues(initial);
        // If user wants to override the template urls, allow them to set them above (optional)
      } catch (err) {
        console.error(err);
        setStatus({ error: err.message });
      }
    }
    load();
  }, []);

  const onChange = (name, v) => {
    setValues(prev => ({ ...prev, [name]: v }));
  };

  const submit = async () => {
    setStatus({ busy: true, message: 'Starting deployment...' });
    try {
      const body = {
        resourceGroup,
        deploymentName,
        parameters: values,
        location,
        templateUrl: templateUrl || undefined,
        paramsUrl: paramsUrl || undefined
      };
      const res = await axios.post('/api/deploy', body);
      setStatus({ success: true, result: res.data });
    } catch (err) {
      console.error(err);
      setStatus({ error: err.response?.data?.error || err.message });
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>VM Deployer UI</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Resource Group: <input value={resourceGroup} onChange={e => setResourceGroup(e.target.value)} /></label>
        <label style={{ marginLeft: 12 }}>Location: <input value={location} onChange={e => setLocation(e.target.value)} /></label>
        <label style={{ marginLeft: 12 }}>Deployment Name: <input value={deploymentName} onChange={e => setDeploymentName(e.target.value)} /></label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Template URL (optional): <input style={{ width: '60%' }} value={templateUrl} onChange={e => setTemplateUrl(e.target.value)} placeholder="raw.githubusercontent.com/.../VM.json" /></label>
      </div>

      <h3>Parameters</h3>
      <div>
        {params.map(p => (
          <div key={p.name} style={{ marginBottom: 8 }}>
            <label style={{ display: 'block' }}>
              <strong>{p.name}</strong> — {p.description}
            </label>
            {p.allowedValues && p.allowedValues.length > 0 ? (
              <select value={values[p.name] || ''} onChange={e => onChange(p.name, e.target.value)}>
                <option value="">-- select --</option>
                {p.allowedValues.map(av => <option key={av} value={av}>{av}</option>)}
              </select>
            ) : (
              <input value={values[p.name] || ''} onChange={e => onChange(p.name, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={submit}>Deploy VM</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <pre>{status ? JSON.stringify(status, null, 2) : 'Idle'}</pre>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
createRoot(container).render(<App />);
