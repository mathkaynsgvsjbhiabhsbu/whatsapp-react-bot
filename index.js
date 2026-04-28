const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({ 
    auth: state, 
    version,
    browser: ['Ubuntu', 'Chrome', '120.0.0'], // changed from Chrome to Ubuntu
    connectTimeoutMs: 60000 
  });

  sock.ev.on("creds.update", saveCreds);
  
  sock.ev.on("connection.update", async (u) => { 
    const { connection, lastDisconnect } = u;
    console.log('Connection update:', u);
    
    if (!sock.authState.creds.registered && connection === 'connecting') {
      const phoneNumber = '2348012345678'; // <-- your number with 234, no +
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`=== YOUR PAIRING CODE: ${code} ===`);
    }
  });
}

startBot();
