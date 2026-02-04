# Deploy Azure Resources

This repository provides automated infrastructure deployment solutions for Azure using GitHub Actions and ARM templates. It enables Azure Cloud Infrastructure Administrators to deploy, manage, and maintain Azure resources efficiently through Infrastructure as Code (IaC).

## Overview

The repository contains:
- ARM templates for deploying various Azure resources (VMs, KeyVault, Web Apps)
- GitHub Actions workflows for automated deployments
- Parameter files for environment-specific configurations
- A web-based UI for triggering deployments

## Features

### Current Deployments

1. **Virtual Machine Deployment** (`deploy-vm.yml`)
   - Deploy Linux VMs with customizable configurations
   - SSH key authentication
   - Automated network configuration (VNet, Subnet, NSG)
   - Supports multiple VM sizes

2. **Master Template Deployment** (`masterdeploy.yml`)
   - Deploy KeyVault and Web App together
   - Linked template architecture
   - OIDC authentication for secure Azure access

3. **Basic Deployment** (`deploy.yml`)
   - Simple ARM template deployment
   - Triggered on push to main branch

### Web UI

A web-based interface is available for triggering VM deployments:
- Express.js backend (`server.js`)
- Dynamic form generation based on ARM template parameters
- Integration with GitHub Actions API

## Getting Started

### Prerequisites

- Azure Subscription
- GitHub repository with necessary secrets configured:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`
  - `RESOURCE_GROUP`
- OIDC federation configured between GitHub and Azure

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AzureTest369/DeployAzureResources.git
   cd DeployAzureResources
   ```

2. **Configure Azure authentication**:
   - Set up OIDC federation in Azure
   - Add required secrets to GitHub repository settings

3. **Deploy resources**:
   - Go to Actions tab in GitHub
   - Select a workflow (e.g., "Deploy VM via ARM template")
   - Click "Run workflow"
   - Fill in required parameters
   - Click "Run workflow" to start deployment

## Repository Structure

```
.
├── .github/
│   └── workflows/          # GitHub Actions workflow files
│       ├── deploy-vm.yml
│       ├── deploy.yml
│       ├── masterdeploy.yml
│       ├── keyvault.json
│       └── webapp.json
├── client/                 # Frontend files
├── public/                 # Static assets
├── server/                 # Server-side files
├── azuredeploy.json        # VM ARM template
├── azuredeploy.parameters.json
├── master.azuredeploy.json # Master template for linked deployments
├── master.parameters.json
├── masterdeploy.yml        # Workflow file (root)
├── server.js               # Express server for web UI
└── package.json
```

## Use Cases and Examples

For comprehensive documentation on additional use cases, workflows, and best practices for GitHub Actions and GitHub Agents (Copilot) in Azure infrastructure management, see:

📚 **[Azure GitHub Use Cases Documentation](AZURE_GITHUB_USE_CASES.md)**

This guide covers:
- 10+ GitHub Actions use cases for Azure administrators
- 10+ GitHub Copilot/Agents use cases
- Cost optimization workflows
- Security and compliance automation
- Backup and disaster recovery
- Multi-environment deployments
- Container and Kubernetes operations
- And much more!

## Workflows

### Deploy VM via ARM Template (OIDC)

Deploys a Linux virtual machine with the following features:
- Custom VM name, size, and location
- SSH key authentication
- Automated resource group creation
- Network configuration (VNet, Subnet, Public IP, NSG)

**Trigger**: Manual (workflow_dispatch)

**Parameters**:
- `vmName`: Name of the VM
- `location`: Azure region
- `vmSize`: VM size (Standard_B1s, Standard_B2s, Standard_D2s_v3)
- `adminUsername`: Admin username
- `sshKeyData`: SSH public key

### Deploy Master ARM Template

Deploys a Key Vault and Web App using linked templates:
- Modular template architecture
- Reusable linked templates hosted on GitHub
- Environment-specific configurations

**Trigger**: Manual (workflow_dispatch)

**Parameters**:
- `resource_group`: Target resource group
- `location`: Azure region

### Deploy to Azure

Simple continuous deployment workflow:
- Triggered on push to main branch
- Deploys ARM template automatically
- Uses OIDC for authentication

## Security

This repository uses **OpenID Connect (OIDC)** for Azure authentication, which provides:
- No stored credentials in GitHub
- Short-lived tokens
- Fine-grained access control
- Enhanced security posture

All secrets are stored in GitHub Secrets and never exposed in code or logs.

## Web UI Usage

To use the web-based deployment interface:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the UI**:
   - Open browser to `http://localhost:3000`
   - Fill in deployment parameters
   - Click "Deploy" to trigger GitHub Actions workflow

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes thoroughly
5. Submit a pull request

## Best Practices

1. **Security**:
   - Never commit secrets or credentials
   - Use OIDC for Azure authentication
   - Follow least-privilege principles
   - Enable branch protection rules

2. **Testing**:
   - Validate ARM templates before deployment
   - Test in non-production environments first
   - Use Azure Policy for compliance checks

3. **Cost Management**:
   - Use appropriate VM sizes for workloads
   - Implement auto-shutdown for dev/test resources
   - Tag resources for cost tracking
   - Monitor spending regularly

4. **Reliability**:
   - Implement proper error handling
   - Use retry logic for transient failures
   - Monitor deployments and set up alerts
   - Maintain rollback procedures

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify OIDC federation is configured correctly
   - Check that all required secrets are set in GitHub
   - Ensure service principal has appropriate permissions

2. **Template Validation Errors**:
   - Run `az deployment group validate` locally first
   - Check parameter file syntax
   - Verify resource naming conventions

3. **Deployment Failures**:
   - Check Azure Activity Log for detailed errors
   - Verify quota limits in subscription
   - Ensure resource group exists and is in correct region

## Resources

- [Azure ARM Template Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Azure CLI Documentation](https://docs.microsoft.com/en-us/cli/azure/)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues, questions, or contributions, please open an issue in this repository.

---

**Note**: Remember to update your GitHub secrets and Azure configurations before running workflows. See the [Use Cases documentation](AZURE_GITHUB_USE_CASES.md) for more advanced scenarios and examples.
