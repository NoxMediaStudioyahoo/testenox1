const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa o banco
const db = new sqlite3.Database('./supporters.db');

db.run(`
  CREATE TABLE IF NOT EXISTS supporters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    logo TEXT,
    amount REAL NOT NULL,
    since TEXT,
    message TEXT,
    tier TEXT NOT NULL,
    pix_txid TEXT UNIQUE,
    payment_confirmed BOOLEAN DEFAULT FALSE
  )
`);

// Configuração do Nodemailer (ajuste para seu provedor)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'SEU_EMAIL@gmail.com',
    pass: 'SENHA_DO_EMAIL_OU_APP_PASSWORD'
  }
});

async function sendConfirmationEmail({ name, email, amount, tier }) {
  if (!email) return;
  
  const html = `
    <div style="font-family:Inter,sans-serif;background:#0F101A;color:#fff;padding:32px;max-width:600px;margin:auto;border-radius:16px;border:1px solid #222">
      <img src='https://noxmedia.studio/logo.svg' alt='NoxMedia Studio' style='height:48px;margin-bottom:24px;'>
      <h2 style="color:#60a5fa">PIX Confirmado! Obrigado, ${name}!</h2>
      <p style="font-size:1.1em">Sua contribuição de <b>R$ ${amount}</b> foi confirmada com sucesso.</p>
      <div style="background:#181b2a;padding:16px;border-radius:8px;margin:24px 0">
        <b>Seus benefícios:</b>
        <ul style="margin:12px 0">
          <li>✨ Acesso antecipado a recursos</li>
          <li>💬 Canal exclusivo no Discord</li>
          <li>🎯 Suporte prioritário</li>
        </ul>
        <a href="https://discord.gg/SEU_LINK" style="display:inline-block;background:#8b5cf6;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold">
          Acessar Discord
        </a>
      </div>
      <div style="background:#1a1f35;padding:16px;border-radius:8px;margin:24px 0">
        <b>Próximos passos:</b>
        <ol style="margin:12px 0">
          <li>1. Entre no Discord usando o link acima</li>
          <li>2. Verifique seu email no canal #verificação</li>
          <li>3. Acesse os canais exclusivos para apoiadores</li>
        </ol>
      </div>
      <p style="font-size:0.95em;color:#aaa">Dúvidas ou sugestões? Fale direto com a equipe: <a href="mailto:contato@noxmedia.studio" style="color:#60a5fa">contato@noxmedia.studio</a></p>
    </div>
  `;

  return transporter.sendMail({
    from: 'NoxMedia Studio <SEU_EMAIL@gmail.com>',
    to: email,
    subject: 'PIX Confirmado - Bem-vindo(a) ao NoxMedia Studio!',
    html
  });
}

// Listar apoiadores
app.get('/api/supporters', (req, res) => {
  db.all('SELECT * FROM supporters WHERE payment_confirmed = TRUE ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Registrar novo apoiador (sem confirmação ainda)
app.post('/api/supporters', (req, res) => {
  const { name, email, amount, since, message, tier, logo, pix_txid } = req.body;
  if (!name || !amount || !tier || !pix_txid) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, amount, tier, pix_txid' });
  }

  db.run(
    'INSERT INTO supporters (name, email, amount, since, message, tier, logo, pix_txid, payment_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)',
    [name, email, amount, since, message, tier, logo, pix_txid],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, txid: pix_txid });
    }
  );
});

// Webhook para confirmação do PIX
app.post('/api/pix-webhook', async (req, res) => {
  const { txid, status } = req.body;
  
  if (!txid || !status) {
    return res.status(400).json({ error: 'txid e status são obrigatórios' });
  }

  if (status === 'CONFIRMED') {
    db.get(
      'SELECT * FROM supporters WHERE pix_txid = ? AND payment_confirmed = FALSE',
      [txid],
      async (err, supporter) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!supporter) return res.status(404).json({ error: 'Doação não encontrada' });

        db.run(
          'UPDATE supporters SET payment_confirmed = TRUE WHERE pix_txid = ?',
          [txid],
          async (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            try {
              // Envia email de confirmação
              if (supporter.email) {
                await sendConfirmationEmail(supporter);
              }
              res.json({ success: true, message: 'Pagamento confirmado e email enviado' });
            } catch (emailErr) {
              console.error('Erro ao enviar email:', emailErr);
              // Mesmo que falhe o envio do email, confirmamos o sucesso do webhook
              res.json({ success: true, message: 'Pagamento confirmado, mas houve erro ao enviar email' });
            }
          }
        );
      }
    );
  } else {
    res.json({ success: true, message: 'Status recebido' });
  }
});

// Iniciar servidor
app.listen(8000, () => {
  console.log('Servidor de apoiadores rodando em http://localhost:8000');
});
