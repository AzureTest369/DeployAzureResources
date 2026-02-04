# Quick Setup Guide

This guide helps you quickly get started with deploying Azure VMs.

## What Was Fixed

The following issues have been resolved:
1. ✅ Removed expired hardcoded GitHub token (security fix)
2. ✅ Fixed GitHub owner to `AzureTest369`
3. ✅ Added environment variable support for configuration
4. ✅ Updated to Azure login v2 for better OIDC support
5. ✅ Upgraded Ubuntu from 18.04 to 22.04 LTS
6. ✅ Added startup validation for required environment variables

## Option 1: Deploy via GitHub Actions (Recommended)

This is the easiest way - just use the GitHub UI directly:

1. **Go to Actions Tab**: Navigate to https://github.com/AzureTest369/DeployAzureResources/actions

2. **Select Workflow**: Click on "Deploy VM via ARM template (OIDC)"

3. **Run Workflow**: Click "Run workflow" button

4. **Fill Parameters**:
   - **VM Name**: e.g., `myvm01`
   - **Azure Location**: e.g., `eastus`
   - **VM Size**: Choose from Standard_B1s, Standard_B2s, or Standard_D2s_v3
   - **Admin Username**: e.g., `azureuser`
   - **SSH Public Key**: Paste your SSH public key (required!)

5. **Deploy**: Click "Run workflow" to start the deployment

The workflow will:
- Authenticate using OIDC (no secrets needed!)
- Create the resource group if it doesn't exist
- Deploy all resources (network, VM, etc.)
- Show progress in the Actions tab

## Option 2: Deploy via Web UI

If you want to use the web interface:

### Prerequisites
- Node.js installed
- A GitHub Personal Access Token with `repo` and `workflow` scopes
  - Create one at: https://github.com/settings/tokens

### Steps

1. **Set Environment Variable**:
   ```bash
   export GITHUB_TOKEN="ghp_your_token_here"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Server**:
   ```bash
   npm start
   ```

4. **Open Browser**:
   Visit http://localhost:3000

5. **Fill Form and Deploy**:
   - Enter VM parameters
   - Click "Deploy" button
   - Server will trigger the GitHub Actions workflow
   - Check the Actions tab for progress

## SSH Key Generation

If you don't have an SSH key:

```bash
# Generate a new SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy the public key
cat ~/.ssh/id_rsa.pub
```

Then paste the output (starts with `ssh-rsa ...`) into the sshKeyData parameter.

## Troubleshooting

### 401 Error
- **Old Issue**: This was caused by an expired hardcoded token (now fixed!)
- **New Issue**: If you still see 401, ensure your `GITHUB_TOKEN` environment variable is set and valid

### OIDC Authentication Failed
- Verify Azure secrets are configured in GitHub:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
  - `RESOURCE_GROUP`

### VM Deployment Failed
- Check Azure quota limits in your subscription
- Verify the VM size is available in your chosen location
- Review the Actions logs for detailed error messages

## Verify Azure Secrets

To check if your Azure secrets are configured:

1. Go to: https://github.com/AzureTest369/DeployAzureResources/settings/secrets/actions
2. Verify these secrets exist:
   - AZURE_CLIENT_ID
   - AZURE_TENANT_ID
   - AZURE_SUBSCRIPTION_ID
   - RESOURCE_GROUP

If any are missing, the OIDC authentication will fail.

## Next Steps

After successful deployment:
1. Check the Actions tab for deployment status
2. Find your VM in Azure Portal
3. Connect via SSH: `ssh azureuser@<vm-public-ip>`

## Security Notes

- ✅ Never commit tokens or credentials to the repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ OIDC is more secure than service principal secrets
- ✅ Rotate your GitHub tokens regularly
