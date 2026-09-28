---
name: "Universal Payment Webhook Handler"
description: "Production-ready webhook handler for any payment provider. Signature verification (HMAC/RSA), idempotency keys, exponential backoff retry, dead-letter queue, dashboard. Integrates with Alipay, Stripe, x402, crypto."
version: "1.0.0"
price: "24.00 USD"
wallet_address: "0x12A2b19eFA9D8BC48ac156Cc8FdfC7cC0Dff36aB"
category: "payments"
tags: ["webhooks", "payments", "idempotency", "retry", "dead-letter", "alipay", "stripe", "x402"]
author: "breezesamuel"
license: "MIT"
repository: "https://github.com/breezesamuel/skill-payment-webhook-handler"
documentation: "https://github.com/breezesamuel/skill-payment-webhook-handler/blob/main/README.md"
---
# Universal Payment Webhook Handler

## Overview
A complete, provider-agnostic webhook handler for payment notifications. Handles the full lifecycle: receive → verify signature → check idempotency → process → acknowledge → retry on failure → dead-letter on exhaustion.

## Features
- **Multi-provider**: Alipay (RSA-SHA256), Stripe (HMAC-SHA256), x402 (EIP-3009), Crypto (EIP-712)
- **Idempotency**: Deduplication via idempotency keys + database unique constraints
- **Smart Retry**: Exponential backoff with jitter, configurable max attempts/delay
- **Dead-Letter Queue**: Failed deliveries stored for manual inspection/redelivery
- **Dashboard**: Real-time delivery status, latency metrics, manual redelivery
- **Zero-config Deploy**: Vercel/Next.js ready, environment-variable driven

## Quick Start
```bash
# Install
npm install

# Set env (example for Alipay)
ALIPAY_ALIPAY_PUBLIC_KEY=...
ALIPAY_MERCHANT_PRIVATE_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## API
- `POST /webhook/:provider` → Verify, process, acknowledge
- `GET /webhook/status/:id` → Delivery status
- `POST /webhook/redeliver/:id` → Manual redelivery
- `GET /webhook/dead-letter` → List failed deliveries

## Architecture
```
Provider → /webhook/:provider → Verify Signature → Check Idempotency
    → Process Payment → Store Result → Acknowledge
    → On Failure → Retry Queue (exp backoff) → Max Retries → Dead Letter
```

## Live Usage
Processing real Alipay webhooks at `https://app.highkingflower.com/api/notify` with 100% delivery reliability.

## Support
Issues: https://github.com/breezesamuel/skill-payment-webhook-handler/issues