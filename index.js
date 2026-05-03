const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

let sock;

async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Tampilkan QR Code jika ada
        if (qr) {
            console.log('❌ QR Code sudah tidak digunakan. Gunakan pairing code di bawah:\n');
        }

        // Tampilkan Pairing Code
        if (update.qr === undefined && connection === 'open' && !sock.user) {
            console.log('📱 Menunggu pairing code...');
        }

        if (connection === 'connecting') {
            console.log('🔗 Menghubungkan ke WhatsApp...');
        }

        if (connection === 'open') {
            console.log('✅ Bot WhatsApp berhasil terhubung!');
            console.log(`👤 Nomor: ${sock.user.id}`);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Koneksi terputus:', lastDisconnect?.error);

            if (shouldReconnect) {
                connectWhatsApp();
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        if (!m.messages) return;

        const msg = m.messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        console.log(`[${sender}] ${text}`);

        // Fitur: Balasan otomatis
        if (text.toLowerCase() === 'halo') {
            await sock.sendMessage(sender, { text: 'Halo! Ada yang bisa saya bantu? 😊' });
        }

        // Fitur: Perintah !info
        if (text === '!info') {
            await sock.sendMessage(sender, { text: 'Bot WhatsApp Baileys v1.0\nDiperintahkan oleh Anda 🤖' });
        }

        // Fitur: Perintah !help
        if (text === '!help') {
            const helpText = `📋 Daftar Perintah:\n
1. halo - Balasan otomatis
2. !info - Informasi bot
3. !help - Tampilkan bantuan
4. !echo [teks] - Ulangi pesan Anda`;
            await sock.sendMessage(sender, { text: helpText });
        }

        // Fitur: Perintah !echo
        if (text.startsWith('!echo ')) {
            const echoText = text.slice(6);
            await sock.sendMessage(sender, { text: `Echo: ${echoText}` });
        }
    });
}

connectWhatsApp().catch(console.error);

console.log('🚀 Bot WhatsApp dengan Pairing Code dimulai...');
console.log('⏳ Silakan tunggu dan ikuti instruksi pairing code yang muncul...\n');
