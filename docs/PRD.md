# 🚀 ChainTrigger - Product Requirements Document (PRD)

## 📌 1. Proje Özeti (Executive Summary)
**ChainTrigger**, Birdeye altyapısı üzerine inşa edilmiş otonom bir "DeFi Event Router" (On-chain Zapier) uygulamasıdır. Kullanıcıların Birdeye verilerini sürekli "poll" etmek (sorgulamak) yerine, özel kurallar oluşturarak bu kurallar gerçekleştiğinde (örn: Yeni bir token çıktı VE likiditesi $50k'dan büyük) Telegram üzerinden anında otomatik bildirimler almasını sağlar.

* **Sorun:** Geliştiriciler ve yatırımcılar anlık on-chain fırsatları yakalamak için Birdeye API'sine sürekli istek atarak rate-limit'lere takılır ve sunucu maliyetlerini artırırlar.
* **Çözüm:** ChainTrigger, karmaşık "Eğer-Öyleyse" (If-This-Then-That) kurallarını backend'de optimize edilmiş bir Redis kuyruk sistemiyle (BullMQ) çalıştırır ve rate-limit sorununu merkezi olarak çözerek bildirimleri doğrudan kullanıcının cebine (Telegram) gönderir.

---

## 🎯 2. MVP Kapsamı (Sprint 3 Hackathon Hedefleri)

Zaman kısıtlaması nedeniyle (Bitiş: 9 Mayıs 2026), proje yalnızca en yüksek değer üreten çekirdek özelliklerle (MVP) sınırlı tutulacaktır. 

### Kapsam Dahilinde Olanlar (In-Scope):
* **Web3 Authentication:** Kullanıcıların e-posta/şifre yerine doğrudan **Wallet Connect** (Örn: Phantom veya MetaMask) ile cüzdanlarını bağlayarak sisteme giriş yapması.
* **Kota ve Tier Sistemi:** Sisteme giren her kullanıcı varsayılan olarak "Free" (Ücretsiz) plandadır ve maksimum **3 aktif kural** oluşturma kotasına sahiptir. 
* **"Fake it till you make it" Ödeme Akışı:** Kullanıcı kotayı doldurup 4. kuralı eklemek istediğinde veya "Upgrade to Pro" butonuna bastığında gerçek bir ödeme altyapısı (Stripe vb.) ÇALIŞMAZ. Bunun yerine "Premium özellikler çok yakında! Erken erişim listesine katıl" yazan bir Waitlist (Bekleme Listesi) pop-up'ı çıkar (Talebi ölçmek/valide etmek için).
* **Kullanıcı Arayüzü (Next.js):** Basit bir dashboard. Kural oluşturma, silme ve aktif/pasif duruma getirme.
* **Kural Çeşitleri:** `new_listing` ve `trending_entry`.
* **Filtreler:** Token Security skoru ve Minimum Likidite.
* **Aksiyon:** Telegram Bot Entegrasyonu (Kullanıcının Chat ID'sine mesaj fırlatma).
* **Arka Plan Motoru:** BullMQ ve Redis kullanarak Birdeye'dan asenkron veri çeken Node.js servisi.

### Kapsam Dışında Bırakılanlar (Out-of-Scope for MVP):
* Gerçek Kredi Kartı/Kripto ödeme altyapısı (Stripe vb. entegrasyonları sonraya bırakıldı).
* Discord Webhook entegrasyonu.

### Kapsam Dışında Bırakılanlar (Out-of-Scope for MVP):
* Kullanıcı Girişi (Authentication) -> Şimdilik tek bir hardcoded test kullanıcısı (`userId: "test_user_1"`) üzerinden ilerlenecek.
* Discord Webhook Entegrasyonu.
* Kredi kartı/Stripe ile ödeme alma (Monetization).

---

## 🔄 3. Kullanıcı Akışı (User Flow)

1. **Dashboard'a Giriş:** Kullanıcı Next.js arayüzünü açar. Ekranda mevcut kurallarını (Aktif/Pasif) görür.
2. **Kural Oluşturma (Create Rule):** 
   * Kullanıcı "Yeni Kural Ekle" butonuna basar.
   * *Tetikleyici Seçer:* "Yeni Token Listelendiğinde" (`new_listing`).
   * *Şart Ekler:* "Security Score büyüktür 80" VE "Likidite büyüktür 100.000 USD".
   * *Aksiyon Belirler:* Telegram Botu'ndan mesaj almak için kendi `Chat ID` bilgisini girer.
3. **Arka Plan İşlemi (Background Magic):** 
   * Node.js Worker, düzenli aralıklarla Birdeye API'sine istek atar. 
   * Şartları sağlayan bir token bulduğunda, bu işlemi Redis kuyruğuna (BullMQ) ekler.
4. **Sonuç:** Kullanıcının Telegram uygulamasına anında şu formatta bir mesaj düşer: 
   *"🚨 ChainTrigger Alarm: [Token Adı] piyasaya sürüldü! Güvenlik Skoru: 85, Likidite: $120k. [Birdeye Linki]"*

---

## 📏 4. Başarı Kriterleri (Success Metrics)
* Sistemin çökmeden art arda gelen Birdeye API çağrılarını (Rate Limit testini) başarıyla yönetebilmesi.
* Oluşturulan bir kuralın, veri eşleşmesinden sonra maksimum 3 saniye içinde Telegram'a iletilmesi.