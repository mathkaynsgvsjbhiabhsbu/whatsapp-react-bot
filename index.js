const fs = require('fs');
const path = require('path');

// Delete old session to start fresh
const authPath = path.join(__dirname, 'auth_info_baileys');
if (fs.existsSync(authPath)) {
  fs.rmSync(authPath, { recursive: true, force: true });
  console.log('Deleted corrupted auth_info_baileys folder');
}

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    browser: ['Ubuntu', 'Chrome', '120.0.0'],
    qrTimeout: 60000
  });
  
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, qr } = u;
    
    if (qr) {
      console.log('=== SCAN THIS QR CODE WITH WHATSAPP ===');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      console.log('Connection closed, restarting...');
      startBot();
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });
}

startBot();
