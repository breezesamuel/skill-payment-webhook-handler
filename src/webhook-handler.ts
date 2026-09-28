// Universal Payment Webhook Handler
import { createHmac, timingSafeEqual } from "crypto";

export interface WebhookConfig {
  provider: "alipay" | "stripe" | "x402" | "crypto";
  secret: string;
  algorithm: "hmac-sha256" | "rsa-sha256" | "eip3009" | "eip712";
}

export interface DeliveryRecord {
  id: string;
  provider: string;
  payload: any;
  signature: string;
  verified: boolean;
  idempotencyKey: string;
  attempts: number;
  status: "pending" | "verified" | "processed" | "failed" | "dead-letter";
  createdAt: Date;
  updatedAt: Date;
}

export class WebhookHandler {
  private config: WebhookConfig;
  private kv: any; // Vercel KV client

  constructor(config: WebhookConfig, kvClient: any) {
    this.config = config;
    this.kv = kvClient;
  }

  async handle(req: Request): Promise<Response> {
    const payload = await req.json();
    const signature = req.headers.get(this.getSignatureHeader()) || "";
    const idempotencyKey = req.headers.get("idempotency-key") || this.generateIdempotencyKey(payload);

    // 1. Check idempotency
    const existing = await this.kv.get(`webhook:${idempotencyKey}`);
    if (existing) {
      return new Response(JSON.stringify({ status: "duplicate", original: existing }), { status: 200 });
    }

    // 2. Verify signature
    const verified = await this.verifySignature(payload, signature);
    if (!verified) {
      await this.recordDelivery({ ...payload, verified: false, idempotencyKey, status: "failed" });
      return new Response("Invalid signature", { status: 400 });
    }

    // 3. Process payment (provider-specific)
    const result = await this.processPayment(payload);

    // 4. Record success
    await this.recordDelivery({ ...payload, verified: true, idempotencyKey, status: "processed", result });

    return new Response(JSON.stringify({ status: "ok", result }), { status: 200 });
  }

  private async verifySignature(payload: any, signature: string): Promise<boolean> {
    switch (this.config.algorithm) {
      case "hmac-sha256": // Stripe
        const expected = createHmac("sha256", this.config.secret).update(JSON.stringify(payload)).digest("hex");
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      case "rsa-sha256": // Alipay
        // RSA verification logic here
        return true; // Simplified
      case "eip3009": // x402
        // EIP-3009 verification
        return true;
      default:
        return false;
    }
  }

  private async processPayment(payload: any): Promise<any> {
    // Provider-specific processing
    return { processed: true };
  }

  private async recordDelivery(record: Partial<DeliveryRecord>): Promise<void> {
    const key = `webhook:${record.idempotencyKey}`;
    await this.kv.set(key, JSON.stringify({ ...record, createdAt: new Date(), updatedAt: new Date() }));
  }

  private getSignatureHeader(): string {
    switch (this.config.provider) {
      case "stripe": return "stripe-signature";
      case "alipay": return "sign";
      default: return "x-signature";
    }
  }

  private generateIdempotencyKey(payload: any): string {
    return createHmac("sha256", "idempotency").update(JSON.stringify(payload)).digest("hex").slice(0, 32);
  }
}