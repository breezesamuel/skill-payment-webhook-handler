# Universal Payment Webhook Handler

Production webhook handler for Alipay, Stripe, x402, crypto payments.

## Files
- `SKILL.md` — SkillShop manifest ($24, USDC on Base)
- `src/webhook-handler.ts` — Core handler
- `src/providers/` — Provider implementations
- `package.json` — Dependencies

## Deploy
```bash
vercel --prod
# Set provider keys + KV env
```

## Live
Processing real payments at app.highkingflower.com