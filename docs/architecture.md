# ⚡️ ChainTrigger: Technical Requirements & Architecture

## 📖 Proje Özeti
ChainTrigger, Birdeye veri altyapısı üzerinde çalışan "On-Chain Zapier" (DeFi Event Router) modelidir. Kullanıcıların belirlediği özel on-chain şartlar (örneğin; yeni token listelenmesi ve güvenlik skorunun > 85 olması) gerçekleştiğinde, otonom olarak dış sistemlere Webhook veya Discord/Telegram bildirimleri fırlatır.

## 🏗 Sistem Mimarisi (System Architecture)
Sistem, yüksek erişilebilirlik (high availability) ve asenkron veri işleme prensiplerine göre 3 ana modülden oluşmaktadır:

1. **User Interface & API (Next.js):** Kullanıcıların tetikleyici kurallarını oluşturduğu ve yönettiği arayüz.
2. **The Watcher & Engine (Node.js Worker):** Birdeye API'sini sürekli dinleyen, veritabanındaki kuralları okuyan ve eşleşme arayan bağımsız arka plan servisi.
3. **Queue & Dispatcher (Redis + BullMQ):** Kuralı eşleşen tokenların bildirimlerini rate-limit'e takılmadan sırayla hedefe gönderen kuyruk yöneticisi.

## 🛠 Tech Stack (Teknoloji Yığını)

### 1. Frontend & Core API
* **Framework:** Next.js (App Router / API Routes)
* **Styling:** Tailwind CSS (Hızlı, temiz ve karanlık mod uyumlu arayüz için)
* **Kullanım Amacı:** Kuralların CRUD işlemleri ve kullanıcı dashboard'u.

### 2. Backend (Worker & Rule Engine)
* **Runtime:** Node.js (Saf asenkron işlemler)
* **HTTP Client:** `axios` + `axios-retry` (Birdeye API Rate Limit'lerine karşı "Exponential Backoff" direnci sağlamak için)
* **Queue Management:** `BullMQ` (Redis tabanlı iş kuyruğu)
* **Security:** Node.js `crypto` modülü (Dışarıya fırlatılan Webhook'ların güvenliği için HMAC-SHA256 imzalama)

### 3. Database & Caching
* **Database:** MongoDB (Mongoose ORM)
  * *Neden:* Esnek JSON tabanlı kural yapılarını (nested conditions) şema zorunluluğu olmadan en hızlı şekilde saklayıp okuyabilmek için.
* **Cache & Message Broker:** Redis
  * *Neden:* Hem Birdeye API çağrılarını önbelleğe almak (rate-limiting) hem de BullMQ'nun mesaj kuyruğu altyapısını tek bir servisle (minimalist mimari) çözmek için.

### 4. DevOps & Deployment
* **Orchestration:** Docker & Docker Compose
  * *Açıklama:* Tüm servisler (Next.js, Node.js Worker, MongoDB, Redis) tek bir `docker-compose.yml` dosyası ile aynı izole ağ (network) içerisinde ayağa kalkacak şekilde yapılandırılmıştır.

---

## 🎯 MVP Kapsamı (Sprint 3 Hackathon Sınırları)

Zaman kısıtlaması nedeniyle (5 gün) sistem ilk etapta aşağıdaki sınırlarla canlıya alınacaktır:

**Tetikleyiciler (Triggers):**
1. `new_listing`: Birdeye `/v2/tokens/new_listing` üzerinden yeni token çıkışı.
2. `trending_entry`: Birdeye `/defi/token_trending` listesine yeni bir giriş.

**Filtreler (Conditions):**
* Sözleşme güvenliği doğrulama (Honeypot/Rug-pull risk analizi - `/defi/token_security`).
* Minimum likidite havuzu şartı (`/defi/v3/token/market-data`).

**Aksiyonlar (Actions):**
* Discord Webhook (Belirlenen kanala anlık JSON mesajı fırlatma).

---

## 💾 Veri Modeli Örneği (MongoDB - Rule Schema)

Kullanıcıların oluşturduğu esnek kurallar veritabanında aşağıdaki yapı ile tutulur:
```json
{
  "userId": "user_id_string",
  "triggerType": "new_listing",
  "conditions": [
    { "field": "security_score", "operator": ">=", "value": 85 },
    { "field": "liquidity", "operator": ">=", "value": 50000 }
  ],
  "action": {
    "type": "discord_webhook",
    "endpoint": "[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)..."
  },
  "isActive": true,
  "createdAt": "2026-05-04T00:00:00Z"
}