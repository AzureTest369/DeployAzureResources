# Azure VM Deployer

This repository contains ARM templates and a web UI for deploying Azure Virtual Machines using GitHub Actions with OIDC authentication.

## Architecture

The solution consists of:
1. **ARM Templates**: Define the VM infrastructure (network, storage, compute)
2. **GitHub Actions Workflows**: Automated deployment pipelines using OIDC
3. **Web UI**: Simple interface to trigger deployments with custom parameters

## Prerequisites

### Azure Setup (OIDC Authentication)
The GitHub Actions workflows use OIDC (OpenID Connect) to authenticate with Azure. This is more secure than using service principal secrets.

**Required Azure Secrets/Variables** (configured in GitHub repository settings):
- `AZURE_CLIENT_ID`: The client ID of your Azure App Registration
- `AZURE_TENANT_ID`: Your Azure tenant ID
- `AZURE_SUBSCRIPTION_ID`: Your Azure subscription ID
- `RESOURCE_GROUP`: Target resource group name (e.g., 'RG1')

### GitHub Token (for Web UI)
To trigger workflows from the web UI, you need a GitHub Personal Access Token.

**Required Environment Variables** (for running the web server):
- `PERSONAL_ACCESS_TOKEN`: GitHub Personal Access Token with `repo` and `workflow` scopes

**Optional Environment Variables**:
- `GITHUB_OWNER`: GitHub username/org (default: 'AzureTest369')
- `GITHUB_REPO`: Repository name (default: 'DeployAzureResources')
- `WORKFLOW_FILE`: Workflow filename (default: 'deploy-vm.yml')
- `WORKFLOW_REF`: Branch name (default: 'main')
- `PORT`: Server port (default: 3000)

## Usage

### Option 1: Deploy via GitHub Actions UI
1. Go to the "Actions" tab in GitHub
2. Select "Deploy VM via ARM template (OIDC)" workflow
3. Click "Run workflow"
4. Fill in the parameters:
   - VM Name
   - Azure Location
   - VM Size
   - Admin Username
   - Authentication Type (password or sshPublicKey)
   - Admin Password or SSH Key (based on authentication type)
5. Click "Run workflow" to start deployment

### Option 2: Deploy via Web UI
1. Set the required environment variables:
   ```bash
   export PERSONAL_ACCESS_TOKEN="your_github_token_here"
   ```

2. Start the server:
   ```bash
   npm install
   npm start
   ```

3. Open http://localhost:3000 in your browser

4. Fill in the VM parameters and click "Deploy"

5. The UI will trigger the GitHub Actions workflow, which will:
   - Authenticate to Azure using OIDC
   - Create the resource group (if needed)
   - Deploy the ARM template
   - Provision the VM

## ARM Template Parameters

The `azuredeploy.json` template accepts the following parameters:

- **vmName**: Name of the virtual machine (default: "simplevm")
- **location**: Azure region (default: "eastus")
- **vmSize**: VM size - Standard_B1s, Standard_B2s, or Standard_D2s_v3 (default: "Standard_B1s")
- **adminUsername**: Admin username for the VM (default: "azureuser")
- **authenticationType**: Type of authentication - "password" or "sshPublicKey" (default: "password")
- **adminPasswordOrKey**: Password or SSH public key for authentication (optional, secure string)

## Resources Created

The ARM template creates:
- Virtual Network (10.0.0.0/16)
- Subnet (10.0.0.0/24)
- Public IP Address
- Network Interface
- Network Security Group
- Virtual Machine (Ubuntu 22.04 LTS)

## Security Notes

- ⚠️ **Never commit GitHub tokens or Azure credentials to the repository**
- Use GitHub Secrets for sensitive data
- OIDC authentication is preferred over service principal secrets
- SSH keys should be generated securely and never committed
- When using password authentication, ensure passwords meet Azure's complexity requirements

## Troubleshooting

### 401 Authentication Error
- **Cause**: Invalid or missing GitHub token
- **Solution**: Ensure `PERSONAL_ACCESS_TOKEN` environment variable is set with a valid PAT that has `repo` and `workflow` scopes

### OIDC Authentication Failed
- **Cause**: Azure secrets not configured or incorrect
- **Solution**: Verify all Azure secrets are set correctly in GitHub repository settings

### VM Deployment Failed
- **Cause**: Invalid parameters or Azure quota limits
- **Solution**: Check the GitHub Actions logs for detailed error messages

## Files

- `azuredeploy.json`: Main ARM template for VM
- `azuredeploy.parameters.json`: Default parameters
- `.github/workflows/deploy-vm.yml`: GitHub Actions workflow for VM deployment
- `server.js`: Backend server for web UI
- `public/index.html`: Web UI for triggering deployments

## License

MIT
