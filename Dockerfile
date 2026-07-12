FROM node:18-slim

WORKDIR /usr/src/app

# نسخ ملف الحزم وتثبيت المكتبات
COPY package*.json ./
RUN npm install
RUN npm install express

# نسخ باقي ملفات المشروع
COPY . .

# تشغيل ملف الـ server.js الجديد الذي قمنا بإنشائه
CMD [ "node", "server.js" ]
