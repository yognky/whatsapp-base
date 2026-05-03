const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Event: QR Code Generated
client.on('qr', (qr) => {
    console.log('\n📱 Scan QR Code dengan WhatsApp Anda:');
    qrcode.generate(qr, { small: true });
    console.log('\n⏳ Menunggu konfirmasi...\n');
});

// Event: Authentication Success
client.on('authenticated', () => {
    console.log('✅ Autentikasi berhasil!');
});

// Event: Ready
client.on('ready', () => {
    console.log('🤖 Bot WhatsApp siap digunakan!');
});

// Event: Receive Message
client.on('message', async (message) => {
    console.log(`[${message.from}] ${message.body}`);

    // Fitur: Balasan otomatis
    if (message.body === 'halo') {
        await client.sendMessage(message.from, 'Halo! Ada yang bisa saya bantu? 😊');
    }

    // Fitur: Perintah !info
    if (message.body === '!info') {
        await client.sendMessage(message.from, 'Bot WhatsApp v1.0\nDiperintahkan oleh Anda 🤖');
    }

    // Fitur: Perintah !help
    if (message.body === '!help') {
        const helpText = `📋 Daftar Perintah:\n
1. halo - Balasan otomatis
2. !info - Informasi bot
3. !help - Tampilkan bantuan
4. !echo [teks] - Ulangi pesan Anda`;
        await client.sendMessage(message.from, helpText);
    }

    // Fitur: Perintah !echo
    if (message.body.startsWith('!echo ')) {
        const echoText = message.body.slice(6);
        await client.sendMessage(message.from, `Echo: ${echoText}`);
    }
});

// Event: Disconnect
client.on('disconnected', (reason) => {
    console.log('❌ Bot terputus:', reason);
});

// Event: Error
client.on('error', (error) => {
    console.error('❌ Error:', error);
});

// Inisialisasi client
client.initialize();

console.log('🚀 Memulai bot WhatsApp...');
