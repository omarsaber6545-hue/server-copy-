# 🚀 Discord Server Cloner | ناسخ سيرفرات ديسكورد

<div align="center">

![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Android](https://img.shields.io/badge/Android_APK-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**تطبيق احترافي متكامل للهواتف (Android APK) والويب لنسخ سيرفرات ديسكورد بالكامل مع الرتب، القنوات، الإيموجي، الاستيكرات، وصلاحيات القنوات بدقة 100%!**

[📱 تحميل التطبيق APK](#-تحميل-تطبيق-الأندرويد-apk--download-apk) • [✨ الميزات](#-الميزات-الرئيسية--features) • [📖 طريقة الاستخدام](#-دليل-الاستخدام--how-to-use) • [English Version](#-english-documentation)

</div>

---

## 📱 تحميل تطبيق الأندرويد APK | Download APK

يمكنك تنزيل ملف الـ **APK** وتثبيته مباشرة على هاتفك الأندرويد من خلال صفحة الإصدارات في GitHub:

👉 **[اضغط هنا للانتقال لصفحة تحميل الـ APK (GitHub Releases)](https://github.com/omarsaber6545-hue/server-copy-/releases)**

> يتم بناء ملف الـ APK وتحديثه تلقائياً فورياً عبر **GitHub Actions** مع كل تحديث جديد للكود!

---

## ✨ الميزات الرئيسية | Features

| الميزة | الوصف |
| :--- | :--- |
| 🛡️ **نسخ الرتب (Roles)** | نسخ كامل للأسماء، الألوان، الصلاحيات (Bitfield)، الترتيب الهرمي (Hierarchy)، وخصائص الظهور. |
| 📁 **نسخ الفئات والقنوات (Categories & Channels)** | نسخ القنوات النصية، الصوتية، الإعلانات، المنتديات، مع الحفاظ على الأوصاف والترتيب والـ NSFW والـ Slowmode. |
| 🔒 **نسخ الصلاحيات بدقة (Permission Overwrites)** | ربط صلاحيات كل قناة بالرتب الجديدة المنشأة حديثاً لضمان خصوصية وتطابق القنوات 100%. |
| 😀 **نسخ الإيموجي المخصصة (Custom Emojis)** | تنزيل وإعادة رفع جميع الإيموجي الثابتة والمتحركة (PNG & Animated GIF). |
| 🎨 **نسخ الاستيكرات المخصصة (Custom Stickers)** | تنزيل وإعادة رفع الاستيكرات مع أسمائها والأوصاف والتاغات. |
| ⚙️ **إعدادات السيرفر العامة** | نسخ اسم السيرفر، الأيقونة (Server Icon)، والبانر (Server Banner). |
| 🧹 **تنظيف السيرفر الهدف (Clean Target)** | خيار لحذف القنوات والرتب القديمة قبل بدء النسخ لإنشاء نسخة نظيفة ومتطابقة. |
| 💾 **النسخ الاحتياطي والقوالب (JSON Backup)** | تصدير هيكل السيرفر كاملاً في ملف `.json` واستعادته في أي وقت دون الحاجة للسيرفر الأصلي. |
| ⚡ **معالجة الـ Rate-Limits الذكية** | حماية تلقائية ضد قيود ديسكورد مع عداد تنازلي واستئناف تلقائي لمنع حظر الحساب أو البوت. |
| 🌐 **واجهة عربية وإنجليزية كاملة** | تصميم داكن عصري مستوحى من واجهة Discord مع دعم كامل للشاشات والهواتف. |

---

## 📖 دليل الاستخدام | How to Use

### 1️⃣ الحصول على توكن بوت ديسكورد (Bot Token - مستحسن):
1. افتح [Discord Developer Portal](https://discord.com/developers/applications).
2. اضغط على **New Application** وأدخل اسماً.
3. من القائمة الجانبية اختر تبويب **Bot** ثم اضغط **Reset Token** وانسخه.
4. فعّل خيارات **Privileged Gateway Intents** (مثل `Server Members Intent`).
5. قم بدعوة البوت إلى السيرفرين (المصدر والهدف) مع إعطائه صلاحية **Administrator**.

### 2️⃣ دعوة البوت برابط مباشر:
استبدل `YOUR_CLIENT_ID` بمعرف تطبيق البوت الخاص بك:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 3️⃣ بدء النسخ:
1. افتح التطبيق، أدخل التوكن واضغط **فحص التوكن والاتصال**.
2. اختر **السيرفر المصدر** و**السيرفر الهدف**.
3. حدد الخيارات التي تريد نسخها (الرتب، القنوات، الإيموجي، الاستيكر).
4. اضغط **بدء عملية النسخ الآن** وتابع تقدم النسخ لحظة بلحظة في السجل المباشر.

---

## 💻 التشغيل والتطوير محلياً | Local Development

إذا كنت تريد تشغيل المشروع على جهاز الكمبيوتر أو بناء الـ APK بنفسك:

```bash
# 1. استنساخ المستودع
git clone https://github.com/omarsaber6545-hue/server-copy-.git
cd server-copy-

# 2. تثبيت الحزم
npm install

# 3. تشغيل خادم التطوير (Web)
npm run dev

# 4. بناء نسخة الويب
npm run build

# 5. مزامنة تطبيق الأندرويد مع Capacitor
npx cap sync android

# 6. فتح مشروع الأندرويد في Android Studio
npx cap open android
```

---

## 🇺🇸 English Documentation

### Discord Server Cloner (Android APK & Web)
A high-performance, cross-platform Discord server cloner application built with React, Vite, TailwindCSS, and Capacitor.

#### Key Features:
- **Full Server Cloning**: Server Icon/Banner, Roles with exact permissions hierarchy, Categories, Text/Voice/Forum Channels, Custom Emojis (PNG & GIF), and Custom Stickers.
- **Smart Permission Overwrites Mapping**: Maps previous role permissions to the newly generated roles on the target guild.
- **Rate-Limit Handling**: Automatically manages Discord API 429 rate-limits with backoff timers to prevent locks.
- **JSON Backup & Restore**: Export server template to `.json` file and restore anytime.
- **Android APK Support**: Native Android build generated via Capacitor and automated through GitHub Actions CI/CD.

#### Download:
Visit the [Releases](https://github.com/omarsaber6545-hue/server-copy-/releases) tab to download the latest `DiscordServerCloner.apk`.

---

## 📜 ترخيص | License
هذا المشروع مفتوح المصدر ومخصص للأغراض التعليمية وإدارة السيرفرات والنسخ الاحتياطي.
