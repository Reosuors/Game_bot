const express = require('express');
const { spawn } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8080;

// سيرفر الويب الوهمي لمنع ريندر من الإغلاق
app.get('/', (req, res) => {
    res.send('البوت الخارق شغال 24/7 والأمور تمام!');
});

app.listen(PORT, () => {
    console.log(`[-] Web server started on port ${PORT}`);
    
    // تشغيل ملف البوت الأصلي تبعك تلقائياً (تأكد من تعديل index.js إذا كان اسم الملف الرئيسي عندك مختلف)
    console.log('[-] Launching original Discord bot...');
    const bot = spawn('node', ['index.js'], { stdio: 'inherit' });

    bot.on('close', (code) => {
        console.log(`[!] Bot process exited with code ${code}`);
    });
});
