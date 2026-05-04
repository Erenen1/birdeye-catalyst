# 💾 ChainTrigger - Data Schema & API Context

Bu doküman, sistemin omurgasını oluşturan MongoDB veritabanı şemasını ve Node.js Worker servisinin işleyeceği Birdeye API yanıt formatlarını içerir. AI asistanların kural motorunu (Rule Engine) yazarken bu şemayı referans alması gerekmektedir.

---

## 1. MongoDB Koleksiyonları (Mongoose Models)

Sisteme Wallet Connect ve Kota mantığı eklendiği için artık iki ana koleksiyonumuz (tablomuz) var: `users` ve `rules`.

### Koleksiyon: `users`
Sisteme cüzdan bağlayan kullanıcıların kota ve abonelik durumlarını tutar.
```typescript
{
  walletAddress: { type: String, required: true, unique: true }, // Cüzdan adresi (Primary Key)
  tier: { type: String, enum: ['free', 'pro'], default: 'free' },
  activeRuleCount: { type: Number, default: 0 }, // Maksimum 3 olabilir (Free tier için)
  createdAt: { type: Date, default: Date.now }
}