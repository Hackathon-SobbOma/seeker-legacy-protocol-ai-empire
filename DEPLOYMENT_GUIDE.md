# SEEKER LEGACY PROTOCOL - Deployment Guide

## Overview

SEEKER LEGACY PROTOCOL is a production-ready Web3 trading agent platform built with React 19, tRPC 11, Express 4, and Solana Web3.js. This guide covers deployment, configuration, and operational procedures.

## System Requirements

- Node.js 22.13.0+
- MySQL 8.0+ or TiDB compatible database
- 512 MB RAM minimum (recommended 2GB+)
- 1 vCPU minimum (recommended 2+ vCPU)

## Pre-Deployment Checklist

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compilation successful (`pnpm check`)
- [ ] Environment variables configured
- [ ] Database migrations applied (`pnpm db:push`)
- [ ] Solana network selected (mainnet/testnet/devnet)
- [ ] Wallet adapter configured
- [ ] OAuth credentials verified

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Owner Information
OWNER_OPEN_ID=owner_open_id
OWNER_NAME=Owner Name

# Solana Configuration
VITE_SOLANA_NETWORK=mainnet-beta # or testnet, devnet
```

### Optional Variables

```bash
# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# Application Branding
VITE_APP_TITLE=SEEKER LEGACY PROTOCOL
VITE_APP_LOGO=https://cdn.example.com/logo.png
```

## Deployment Steps

### 1. Prepare the Application

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the application
pnpm build
```

### 2. Database Setup

```bash
# Apply migrations
pnpm db:push

# Verify database connection
pnpm check
```

### 3. Start the Application

**Development:**
```bash
pnpm dev
```

**Production:**
```bash
pnpm build
pnpm start
```

### 4. Verify Deployment

```bash
# Check server health
curl http://localhost:3000/health

# Verify OAuth callback
curl http://localhost:3000/api/oauth/callback

# Test tRPC endpoint
curl http://localhost:3000/api/trpc/auth.me
```

## Solana Network Configuration

### Mainnet Beta (Production)
```typescript
// client/src/components/WalletProvider.tsx
<WalletProvider network="mainnet-beta">
```

### Testnet (Staging)
```typescript
<WalletProvider network="testnet">
```

### Devnet (Development)
```typescript
<WalletProvider network="devnet">
```

## Monitoring & Logs

### Log Files

- **Dev Server:** `.manus-logs/devserver.log`
- **Browser Console:** `.manus-logs/browserConsole.log`
- **Network Requests:** `.manus-logs/networkRequests.log`
- **Session Replay:** `.manus-logs/sessionReplay.log`

### Health Checks

```bash
# Check application status
curl http://localhost:3000/health

# Check database connection
pnpm check

# Run tests
pnpm test
```

## Performance Tuning

### Database Optimization

```sql
-- Create indexes for frequently queried fields
CREATE INDEX idx_agents_user_id ON trading_agents(user_id);
CREATE INDEX idx_tokens_user_id ON solana_token_allocations(user_id);
CREATE INDEX idx_transactions_user_id ON blockchain_transactions(user_id);
```

### Application Optimization

1. **Enable compression:**
   ```typescript
   app.use(compression());
   ```

2. **Configure caching:**
   ```typescript
   app.use(express.static('client/public', {
     maxAge: '1d'
   }));
   ```

3. **Use connection pooling:**
   ```typescript
   const pool = mysql.createPool({
     connectionLimit: 10,
     waitForConnections: true,
     queueLimit: 0
   });
   ```

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secure secret management
- Rotate API keys regularly

### 2. Database Security
- Use SSL connections
- Implement row-level security
- Regular backups

### 3. Wallet Security
- Never expose private keys
- Use hardware wallets for production
- Implement transaction signing verification

### 4. API Security
- Enable CORS appropriately
- Implement rate limiting
- Use HTTPS only
- Validate all inputs

## Backup & Recovery

### Database Backup

```bash
# Create backup
mysqldump -u user -p database > backup.sql

# Restore backup
mysql -u user -p database < backup.sql
```

### Application Backup

```bash
# Backup application files
tar -czf seeker-backup-$(date +%Y%m%d).tar.gz \
  server/ client/src/ drizzle/ package.json

# Restore from backup
tar -xzf seeker-backup-*.tar.gz
```

## Troubleshooting

### Common Issues

**Issue: Database connection failed**
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host -D database
```

**Issue: OAuth callback not working**
```bash
# Check OAuth configuration
echo $OAUTH_SERVER_URL
echo $VITE_APP_ID

# Verify callback URL in OAuth provider
```

**Issue: Wallet connection fails**
```bash
# Check Solana network
curl https://api.mainnet-beta.solana.com/

# Verify wallet adapter configuration
```

**Issue: High memory usage**
```bash
# Check Node process
ps aux | grep node

# Monitor memory
top -p $(pgrep -f "node.*server")

# Restart if needed
pkill -f "node.*server"
pnpm start
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer:** Use Nginx or HAProxy
2. **Database Replication:** Set up read replicas
3. **Session Storage:** Use Redis for session management
4. **Static Assets:** Use CDN (CloudFlare, Akamai)

### Vertical Scaling

1. **Increase CPU:** 2 vCPU → 4 vCPU
2. **Increase RAM:** 512 MB → 2 GB+
3. **Optimize queries:** Add indexes, optimize N+1 queries

## Maintenance

### Regular Tasks

- [ ] Review logs daily
- [ ] Monitor performance metrics
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Backup database daily
- [ ] Test disaster recovery monthly

### Update Procedure

```bash
# 1. Backup current state
git stash
pnpm build

# 2. Update dependencies
pnpm update

# 3. Run tests
pnpm test

# 4. Deploy
pnpm build
pnpm start
```

## Support & Documentation

- **API Documentation:** See `API_DOCUMENTATION.md`
- **Architecture:** See `README.md`
- **Issues:** Report to development team
- **Performance:** Monitor `.manus-logs/` directory

## Rollback Procedure

If deployment fails:

```bash
# 1. Identify last working checkpoint
git log --oneline | head -5

# 2. Rollback to previous version
git checkout <commit_hash>

# 3. Revert database changes if needed
pnpm db:push

# 4. Restart application
pnpm start
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Monitoring alerts set up
- [ ] Logging configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented
- [ ] Team trained on procedures
- [ ] Load testing completed
