const fs = require('fs');
const path = require('path');

// Force delete corrupted WhatsApp session on startup
const authPath = path.join(__dirname, 'auth_info_baileys');
if (fs.existsSync(authPath)) {
  fs.rmSync(authPath, { recursive: true, force: true });
  console.log('Deleted corrupted auth_info_baileys folder');
}

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    browser: ['Ubuntu', 'Chrome', '120.0.0'],
    connectTimeoutMs: 60000
  });
  
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;
    console.log('Connection update:', u);

    if (!sock.authState.creds.registered && connection === 'connecting') {
      const phoneNumber = '2349044617629'; // Replace with your number, 234 + number, no +
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`=== YOUR PAIRING CODE: ${code} ===`);
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
