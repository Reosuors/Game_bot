FROM node:18-slim

WORKDIR /app

# نسخ ملفات الحزم وتثبيت المكتبات
COPY package*.json ./
RUN npm install
RUN npm install express

# نسخ كل الملفات والمجلدات الفرعية للمشروع
COPY . .

# تشغيل السيرفر الوهمي من المجلد الرئيسي
CMD [ "node", "server.js" ]
