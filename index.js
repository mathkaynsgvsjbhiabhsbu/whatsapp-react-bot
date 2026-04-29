const fs = require('fs');
const path = require('path');

// Delete old session to start fresh
const authPath = path.join(__dirname, 'auth_info_baileys');
if (fs.existsSync(authPath)) {
  fs.rmSync(authPath, { recursive: true, force: true });
  console.log('Deleted corrupted auth_info_baileys folder');
}

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

// PUT YOUR PHONE NUMBER HERE WITH COUNTRY CODE
const YOUR_PHONE_NUMBER = "+2349046417629"; 

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    browser: ['Ubuntu', 'Chrome', '120.0.0']
  });
  
  sock.ev.on('creds.update', saveCreds);

  if (!state.creds.registered) {
    const code = await sock.requestPairingCode(YOUR_PHONE_NUMBER.replace(/\D/g, ''));
    console.log(`=== YOUR PAIRING CODE ===`);
    console.log(`   ${code}`);
    console.log(`=== ENTER THIS IN WHATSAPP: Settings > Linked Devices > Link with phone number ===`);
  }

  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('Connected to WhatsApp');
    }
  });
}

startBot();
