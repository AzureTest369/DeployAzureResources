# Quick Reference: GitHub Actions & Agents for Azure Admins

A condensed reference guide for common GitHub Actions and GitHub Copilot use cases for Azure Cloud Infrastructure Administrators.

## Quick Links

- 📚 [Full Use Cases Documentation](AZURE_GITHUB_USE_CASES.md)
- 📖 [Repository README](README.md)

## Top 10 GitHub Actions Use Cases

| Use Case | Description | When to Use |
|----------|-------------|-------------|
| **Infrastructure Deployment** | Deploy Azure resources using ARM/Bicep templates | Setting up new environments, deploying applications |
| **Cost Management** | Automated cost monitoring and optimization | Weekly/monthly cost reviews, budget management |
| **Security Scanning** | Scan for vulnerabilities and compliance issues | Daily security checks, before deployments |
| **Backup Automation** | Schedule backups for VMs, databases, storage | Daily/weekly backup windows |
| **Resource Lifecycle** | Auto-provision and cleanup environments | Dev/test environment management |
| **Monitoring Setup** | Configure Azure Monitor, alerts, dashboards | New resource deployments, monitoring updates |
| **Multi-Environment Deploy** | Deploy to Dev/Test/Staging/Prod with approvals | Application releases, infrastructure updates |
| **Infrastructure Testing** | Validate templates and configurations | Pre-deployment validation, PR checks |
| **Database Management** | Automated DB backups, maintenance, migrations | Regular DB maintenance, schema updates |
| **Container Operations** | Build images, push to ACR, deploy to AKS | Container deployments, K8s updates |

## Top 10 GitHub Copilot Use Cases

| Use Case | Example Prompt | Output |
|----------|----------------|--------|
| **Generate Templates** | "Create ARM template for Linux VM with 2 data disks" | Complete ARM template JSON |
| **Troubleshoot Errors** | "Why is my deployment failing with InvalidResourceReference?" | Root cause analysis and fix suggestions |
| **Create Documentation** | "Generate README for this ARM template" | Comprehensive documentation |
| **Code Review** | "Review this template for security best practices" | Security recommendations |
| **Convert Formats** | "Convert this ARM template to Bicep" | Bicep format code |
| **Learning Assistant** | "Explain Azure Private Link" | Detailed explanation |
| **Generate Policies** | "Create Azure Policy to enforce storage encryption" | Policy definition JSON |
| **Optimize Performance** | "Suggest optimizations for this VM configuration" | Cost and performance recommendations |
| **Incident Response** | "Create rollback procedure for this deployment" | Step-by-step rollback script |
| **Integration Scripts** | "Send Azure cost reports to Slack" | Complete integration script |

## Common Workflow Patterns

### 1. Deployment with Validation
```yaml
- Validate template
- Run security scan
- Deploy to non-prod
- Test deployment
- Deploy to prod (with approval)
```

### 2. Scheduled Maintenance
```yaml
- Run on schedule (cron)
- Login to Azure (OIDC)
- Perform maintenance task
- Generate report
- Send notification
```

### 3. Cost Optimization
```yaml
- Collect resource metrics
- Analyze usage patterns
- Identify optimization opportunities
- Apply changes (with approval)
- Report savings
```

### 4. Security Compliance
```yaml
- Scan resources
- Check policy compliance
- Identify violations
- Generate compliance report
- Create remediation tickets
```

## Essential GitHub Actions Syntax

### Trigger Types
```yaml
# Manual trigger
on: workflow_dispatch

# Schedule
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9 AM

# On push
on:
  push:
    branches: [main]

# On PR
on:
  pull_request:
    paths: ['**.json']
```

### Azure Login (OIDC)
```yaml
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### Workflow Inputs
```yaml
workflow_dispatch:
  inputs:
    environment:
      description: 'Target Environment'
      required: true
      type: choice
      options: [dev, test, prod]
```

### Environment Protection
```yaml
jobs:
  deploy:
    environment: production  # Requires approval
    runs-on: ubuntu-latest
```

## Common Azure CLI Commands

### Resource Management
```bash
# Create resource group
az group create --name MyRG --location eastus

# Deploy ARM template
az deployment group create \
  --resource-group MyRG \
  --template-file template.json \
  --parameters @parameters.json

# Validate template
az deployment group validate \
  --resource-group MyRG \
  --template-file template.json
```

### VM Operations
```bash
# Start VM
az vm start --resource-group MyRG --name MyVM

# Stop/deallocate VM
az vm deallocate --resource-group MyRG --name MyVM

# List VMs
az vm list --resource-group MyRG --output table
```

### Cost Management
```bash
# Get cost analysis
az costmanagement query \
  --type Usage \
  --timeframe MonthToDate

# Show resource costs
az consumption usage list \
  --start-date 2024-01-01 \
  --end-date 2024-01-31
```

### Security
```bash
# Check policy compliance
az policy state list \
  --resource-group MyRG \
  --filter "complianceState eq 'NonCompliant'"

# List NSG rules
az network nsg rule list \
  --resource-group MyRG \
  --nsg-name MyNSG
```

## GitHub Copilot Prompting Tips

### ✅ Good Prompts
- "Create an ARM template for a Linux VM with SSH key authentication, 2 data disks, and a public IP address"
- "Review this ARM template for security vulnerabilities and suggest improvements"
- "Convert this ARM template to Bicep format while maintaining all functionality"
- "Explain why this deployment is failing with error: InvalidResourceReference"

### ❌ Avoid Vague Prompts
- "Create a VM template"
- "Fix this"
- "Make it better"
- "Help with Azure"

### Prompt Formula
```
[Action] + [Specific Resource/Code] + [Context/Constraints] + [Desired Output]
```

Example:
"Generate a GitHub Actions workflow to deploy an Azure SQL Database with automated backups enabled, using OIDC authentication, that runs on manual trigger"

## Security Best Practices Checklist

- [ ] Use OIDC instead of storing credentials
- [ ] Store all secrets in GitHub Secrets
- [ ] Enable branch protection for main/production branches
- [ ] Require approvals for production deployments
- [ ] Use least-privilege service principals
- [ ] Enable Azure Policy for compliance
- [ ] Scan ARM templates before deployment
- [ ] Implement automated security testing
- [ ] Enable audit logging
- [ ] Regular security reviews of workflows

## Troubleshooting Quick Fixes

### Authentication Issues
1. Verify OIDC federation is configured
2. Check service principal permissions
3. Ensure secrets are correctly set
4. Validate subscription ID

### Template Validation Errors
1. Run `az deployment group validate` locally
2. Check parameter types match template
3. Verify resource dependencies
4. Ensure resource names are valid

### Workflow Failures
1. Check Azure Activity Log
2. Review GitHub Actions logs
3. Verify quota limits
4. Check resource group location

### Timeout Issues
1. Increase job timeout
2. Break into smaller steps
3. Use `--no-wait` for long operations
4. Implement retry logic

## Next Steps

1. **Start Simple**: Begin with basic deployment workflows
2. **Add Automation**: Gradually add cost, security, and backup workflows
3. **Optimize**: Use Copilot to improve and optimize existing workflows
4. **Scale**: Implement multi-environment and advanced patterns
5. **Monitor**: Set up alerts and dashboards for workflow health

## Additional Resources

- [Full Documentation](AZURE_GITHUB_USE_CASES.md) - Comprehensive guide with detailed examples
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Azure CLI Docs](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure ARM Templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/)

---

**Pro Tip**: Combine GitHub Actions for automation with GitHub Copilot for intelligent code generation and troubleshooting. This powerful combination can 10x your infrastructure management efficiency!
