# 📦 Workflows n8n Exportáveis

**Data:** 13/11/2025
**Autor:** Claude Code
**Versão:** 1.0

---

## 📋 Como Usar

### Importar Workflow no n8n:

1. Abra seu n8n
2. Clique em **"+ Add workflow"** ou abra workflow existente
3. Clique no menu **⋮** (3 pontinhos) no canto superior direito
4. Escolha **"Import from File"** ou **"Import from URL"**
5. Cole o JSON abaixo
6. Clique em **"Import"**
7. Configure as credenciais (Gmail, Supabase)
8. Ative o workflow

---

## 🔧 Workflow 1: Enviar Email de Boas-Vindas

**Nome:** `loter.AI - Enviar Email Boas-Vindas`
**Descrição:** Envia email personalizado após pagamento confirmado
**Trigger:** Webhook

### JSON para Importar:

```json
{
  "name": "loter.AI - Enviar Email Boas-Vindas",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "loter-ai-welcome",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-node",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "loter-ai-welcome"
    },
    {
      "parameters": {
        "functionCode": "// Gerar token único para acesso\nconst crypto = require('crypto');\n\nconst email = $input.item.json.email;\nconst userId = $input.item.json.userId;\nconst name = $input.item.json.name;\n\n// Gera token aleatório\nconst token = crypto.randomBytes(32).toString('hex');\n\n// Calcula expiração (24 horas)\nconst expiresAt = new Date();\nexpiresAt.setHours(expiresAt.getHours() + 24);\n\n// Retorna dados\nreturn {\n  json: {\n    email,\n    userId,\n    name,\n    token,\n    expiresAt: expiresAt.toISOString(),\n    link: `https://www.fqdigital.com.br/app/criar-senha?token=${token}`\n  }\n};"
      },
      "id": "function-generate-token",
      "name": "Gerar Token",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "tableId": "access_tokens",
        "columns": "user_id,token,expires_at",
        "additionalFields": {}
      },
      "id": "supabase-save-token",
      "name": "Salvar Token no Supabase",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase - loter.AI"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "// Montar HTML do email\nconst name = $input.item.json.name;\nconst email = $input.item.json.email;\nconst link = $input.item.json.link;\n\n// Template HTML (simplificado - use o completo do outro documento)\nconst html = `\n<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Bem-vindo ao loter.AI</title>\n</head>\n<body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;\">\n  <table width=\"600\" style=\"margin: 0 auto; background-color: #ffffff; border-radius: 16px;\">\n    <tr>\n      <td style=\"padding: 40px; text-align: center;\">\n        <img src=\"https://i.ibb.co/r2FFdKRw/Logo-Lumen-1.png\" alt=\"loter.AI\" style=\"height: 80px;\">\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 20px; text-align: center;\">\n        <div style=\"background-color: #e8f5e9; color: #2e7d32; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: 600;\">\n          ✅ PAGAMENTO CONFIRMADO\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 20px; text-align: center;\">\n        <h1 style=\"font-size: 32px; color: #1a1a1a; margin: 0;\">🎉 Bem-vindo ao loter.AI!</h1>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; font-size: 16px; color: #333;\">\n        <p>Olá <strong>${name}</strong>,</p>\n        <p>Seu pagamento foi confirmado com sucesso! 🎊</p>\n        <p>Agora você tem <strong>acesso vitalício</strong> à plataforma loter.AI.</p>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; text-align: center;\">\n        <a href=\"${link}\" style=\"display: inline-block; background: linear-gradient(135deg, #36f28f, #1cb46d); color: #04110b; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: 700;\">\n          🔐 CRIAR MINHA SENHA\n        </a>\n        <p style=\"margin-top: 15px; font-size: 13px; color: #666;\">Clique no botão acima para criar sua senha e acessar</p>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 30px;\">\n        <p style=\"font-weight: 600; color: #333;\">Se o botão não funcionar, copie este link:</p>\n        <p style=\"background-color: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px;\">${link}</p>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px;\">\n        <div style=\"background-color: #f8f9fa; border-left: 4px solid #36f28f; padding: 20px; border-radius: 6px;\">\n          <p style=\"font-weight: 600; color: #333; margin-bottom: 10px;\">📋 Seus dados de acesso:</p>\n          <p style=\"color: #555; margin: 8px 0;\"><strong>Email:</strong> ${email}</p>\n          <p style=\"color: #555; margin: 0;\"><strong>Senha:</strong> Você vai criar ao clicar no botão acima</p>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 40px;\">\n        <div style=\"background-color: #e3f2fd; border-radius: 8px; padding: 20px; text-align: center;\">\n          <p style=\"font-size: 18px; font-weight: 600; color: #1565c0; margin-bottom: 15px;\">💬 Precisa de ajuda?</p>\n          <p style=\"font-size: 15px; color: #333; margin-bottom: 12px;\">Nossa equipe está disponível no WhatsApp</p>\n          <a href=\"https://api.whatsapp.com/send?phone=5511993371766&text=Ol%C3%A1!%20Acabei%20de%20comprar%20o%20loter.IA\" style=\"display: inline-block; background-color: #25D366; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;\">📱 Falar no WhatsApp</a>\n          <p style=\"margin-top: 10px; font-size: 14px; color: #666;\">Ou envie email para: <a href=\"mailto:scalewithlumen@gmail.com\" style=\"color: #1565c0;\">scalewithlumen@gmail.com</a></p>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 30px 40px; background-color: #f8f9fa; text-align: center; border-radius: 0 0 16px 16px;\">\n        <p style=\"font-size: 14px; color: #666; margin-bottom: 10px;\">© 2025 loter.AI - Inteligência estatística para suas apostas</p>\n        <p style=\"font-size: 12px; color: #999; margin: 0;\">Este email foi enviado porque você adquiriu acesso ao loter.AI</p>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n`;\n\nreturn {\n  json: {\n    ...items[0].json,\n    html\n  }\n};"
      },
      "id": "function-mount-html",
      "name": "Montar HTML",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "sendTo": "={{ $json.email }}",
        "subject": "🎉 Seu acesso ao loter.AI está liberado!",
        "emailFormat": "html",
        "html": "={{ $json.html }}",
        "options": {
          "senderName": "loter.AI",
          "replyTo": "scalewithlumen@gmail.com"
        }
      },
      "id": "gmail-send",
      "name": "Enviar Email via Gmail",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2,
      "position": [1050, 300],
      "credentials": {
        "gmailOAuth2": {
          "id": "2",
          "name": "Gmail - loter.AI"
        }
      }
    },
    {
      "parameters": {
        "operation": "insert",
        "tableId": "email_logs",
        "columns": "user_id,email_type,sent_at,status",
        "additionalFields": {}
      },
      "id": "supabase-log",
      "name": "Registrar Log (Opcional)",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1250, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase - loter.AI"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"message\": \"Email enviado com sucesso\", \"token\": $json.token } }}"
      },
      "id": "respond-webhook",
      "name": "Responder Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1450, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Gerar Token",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gerar Token": {
      "main": [
        [
          {
            "node": "Salvar Token no Supabase",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Salvar Token no Supabase": {
      "main": [
        [
          {
            "node": "Montar HTML",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Montar HTML": {
      "main": [
        [
          {
            "node": "Enviar Email via Gmail",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar Email via Gmail": {
      "main": [
        [
          {
            "node": "Registrar Log (Opcional)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Registrar Log (Opcional)": {
      "main": [
        [
          {
            "node": "Responder Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "versionId": "1",
  "id": "loter-ai-welcome"
}
```

### ⚙️ Configurar Credenciais:

Após importar, você precisa configurar 2 credenciais:

#### 1. Gmail OAuth2
```
1. Vá em: Credentials → Add Credential → Gmail OAuth2
2. Clique em "Sign in with Google"
3. Escolha conta: scalewithlumen@gmail.com
4. Autorize o n8n
5. Salve como: "Gmail - loter.AI"
```

#### 2. Supabase API
```
1. Vá em: Credentials → Add Credential → Supabase
2. Preencha:
   - Host: https://aaqthgqsuhyagsrlnyqk.supabase.co
   - Service Role Key: [sua chave service_role]
3. Salve como: "Supabase - loter.AI"
```

### 🔗 URL do Webhook

Após ativar o workflow, copie a URL do webhook:
```
https://your-n8n.app/webhook/loter-ai-welcome
```

Essa URL será usada no `kirvano-webhook`.

---

## 🔄 Workflow 2: Reenvio Automático (24 horas)

**Nome:** `loter.AI - Reenvio Automático 24h`
**Descrição:** Reenvia email para usuários que não acessaram em 24h
**Trigger:** Cron (1x por dia às 10h)

### JSON para Importar:

```json
{
  "name": "loter.AI - Reenvio Automático 24h",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 10 * * *"
            }
          ]
        }
      },
      "id": "cron-trigger",
      "name": "Cron (Todos os dias 10h)",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \n  u.id as user_id,\n  u.email,\n  u.raw_user_meta_data->>'full_name' as name,\n  p.created_at as payment_date\nFROM auth.users u\nINNER JOIN payments p ON p.user_id = u.id\nWHERE \n  p.status = 'active'\n  AND u.last_sign_in_at IS NULL\n  AND u.created_at < NOW() - INTERVAL '24 hours'\n  AND u.created_at > NOW() - INTERVAL '48 hours'\n  AND NOT EXISTS (\n    SELECT 1 FROM email_logs el \n    WHERE el.user_id = u.id \n    AND el.email_type = 'reminder_24h'\n  )\nLIMIT 50;"
      },
      "id": "supabase-query",
      "name": "Buscar Usuários Pendentes",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [450, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase - loter.AI"
        }
      }
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "id": "split-in-batches",
      "name": "Loop por Usuário",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "functionCode": "// Mesmo código de gerar token do Workflow 1\nconst crypto = require('crypto');\n\nconst email = $input.item.json.email;\nconst userId = $input.item.json.user_id;\nconst name = $input.item.json.name || 'Usuário';\n\nconst token = crypto.randomBytes(32).toString('hex');\nconst expiresAt = new Date();\nexpiresAt.setHours(expiresAt.getHours() + 48); // 48h para reenvio\n\nreturn {\n  json: {\n    email,\n    userId,\n    name,\n    token,\n    expiresAt: expiresAt.toISOString(),\n    link: `https://www.fqdigital.com.br/app/criar-senha?token=${token}`\n  }\n};"
      },
      "id": "function-generate-token-2",
      "name": "Gerar Novo Token",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "functionCode": "// Template de email LEMBRETE\nconst name = $input.item.json.name;\nconst email = $input.item.json.email;\nconst link = $input.item.json.link;\n\nconst html = `\n<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;\">\n  <table width=\"600\" style=\"margin: 0 auto; background-color: #ffffff; border-radius: 16px;\">\n    <tr>\n      <td style=\"padding: 40px; text-align: center;\">\n        <h1 style=\"font-size: 28px; color: #1a1a1a;\">🔔 Lembrete: Configure sua senha</h1>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; font-size: 16px; color: #333;\">\n        <p>Olá <strong>${name}</strong>,</p>\n        <p>Vimos que você ainda não configurou sua senha no loter.AI.</p>\n        <p>Seu acesso está <strong>liberado e aguardando</strong>! 🎉</p>\n        <p>Não perca tempo - clique no botão abaixo para criar sua senha e começar a usar:</p>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; text-align: center;\">\n        <a href=\"${link}\" style=\"display: inline-block; background: linear-gradient(135deg, #36f28f, #1cb46d); color: #04110b; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-size: 18px; font-weight: 700;\">\n          🔐 CRIAR SENHA AGORA\n        </a>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 30px; font-size: 14px; color: #666;\">\n        <p><strong>Link direto:</strong></p>\n        <p style=\"background-color: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all;\">${link}</p>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 40px;\">\n        <div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px;\">\n          <p style=\"margin: 0; color: #856404;\">⏰ Este link é válido por 48 horas</p>\n        </div>\n      </td>\n    </tr>\n    <tr>\n      <td style=\"padding: 0 40px 40px; text-align: center;\">\n        <p style=\"color: #666;\">Precisa de ajuda?</p>\n        <a href=\"https://api.whatsapp.com/send?phone=5511993371766\" style=\"color: #25D366; font-weight: 600;\">📱 Falar no WhatsApp</a>\n      </td>\n    </tr>\n  </table>\n</body>\n</html>\n`;\n\nreturn {\n  json: {\n    ...items[0].json,\n    html\n  }\n};"
      },
      "id": "function-mount-html-2",
      "name": "Montar HTML Lembrete",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "sendTo": "={{ $json.email }}",
        "subject": "🔔 Lembrete: Você ainda não configurou sua senha no loter.AI",
        "emailFormat": "html",
        "html": "={{ $json.html }}",
        "options": {
          "senderName": "loter.AI",
          "replyTo": "scalewithlumen@gmail.com"
        }
      },
      "id": "gmail-send-2",
      "name": "Enviar Email Lembrete",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2,
      "position": [1250, 300],
      "credentials": {
        "gmailOAuth2": {
          "id": "2",
          "name": "Gmail - loter.AI"
        }
      }
    },
    {
      "parameters": {
        "operation": "insert",
        "tableId": "email_logs",
        "columns": "user_id,email_type,sent_at,status"
      },
      "id": "supabase-log-2",
      "name": "Registrar Reenvio",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1450, 300],
      "credentials": {
        "supabaseApi": {
          "id": "1",
          "name": "Supabase - loter.AI"
        }
      }
    }
  ],
  "connections": {
    "Cron (Todos os dias 10h)": {
      "main": [
        [
          {
            "node": "Buscar Usuários Pendentes",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Buscar Usuários Pendentes": {
      "main": [
        [
          {
            "node": "Loop por Usuário",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Loop por Usuário": {
      "main": [
        [
          {
            "node": "Gerar Novo Token",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Loop por Usuário",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gerar Novo Token": {
      "main": [
        [
          {
            "node": "Montar HTML Lembrete",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Montar HTML Lembrete": {
      "main": [
        [
          {
            "node": "Enviar Email Lembrete",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar Email Lembrete": {
      "main": [
        [
          {
            "node": "Registrar Reenvio",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "versionId": "1",
  "id": "loter-ai-reminder-24h"
}
```

---

## 🚨 Workflow 3: Email de Urgência (3 dias)

**Nome:** `loter.AI - Email Urgência 3 Dias`
**Descrição:** Email de urgência para usuários que não acessaram em 3 dias
**Trigger:** Cron (1x por dia às 14h)

### JSON para Importar:

Similar ao Workflow 2, mas com mudanças:

1. **Query diferente:**
```sql
WHERE
  p.status = 'active'
  AND u.last_sign_in_at IS NULL
  AND u.created_at < NOW() - INTERVAL '3 days'
  AND u.created_at > NOW() - INTERVAL '4 days'
  AND NOT EXISTS (
    SELECT 1 FROM email_logs el
    WHERE el.user_id = u.id
    AND el.email_type = 'urgent_3days'
  )
```

2. **Template de email com tom de urgência:**
```html
<h1>⚠️ Não perca seu acesso vitalício ao loter.AI</h1>
<p>Olá ${name},</p>
<p>Seu acesso está liberado há 3 dias, mas ainda não vimos você por lá! 😢</p>
<p><strong>Não deixe seu investimento ir embora.</strong></p>
<p>Configure sua senha AGORA e comece a usar:</p>
<!-- Botão CTA -->
```

3. **Assunto:**
```
⚠️ Não perca seu acesso vitalício ao loter.AI
```

---

## 📊 Workflow 4: Dashboard de Métricas (Opcional)

**Nome:** `loter.AI - Coletar Métricas`
**Descrição:** Coleta métricas e envia para Google Sheets ou Slack
**Trigger:** Cron (1x por hora)

### Estrutura:

```
Cron → Supabase Query (métricas) → Function (formatar)
→ Google Sheets (atualizar) → Slack (notificar se alerta)
```

### Métricas coletadas:

```sql
-- Usuários pendentes
SELECT COUNT(*) as pending_users
FROM auth.users u
INNER JOIN payments p ON p.user_id = u.id
WHERE p.status = 'active' AND u.last_sign_in_at IS NULL;

-- Emails enviados hoje
SELECT COUNT(*) as emails_today
FROM email_logs
WHERE DATE(sent_at) = CURRENT_DATE;

-- Acessos realizados hoje
SELECT COUNT(DISTINCT user_id) as logins_today
FROM auth.audit_log_entries
WHERE action = 'login' AND DATE(created_at) = CURRENT_DATE;

-- Taxa de conversão
SELECT
  COUNT(DISTINCT p.user_id) as total_payments,
  COUNT(DISTINCT CASE WHEN u.last_sign_in_at IS NOT NULL THEN u.id END) as converted_users,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN u.last_sign_in_at IS NOT NULL THEN u.id END) / COUNT(DISTINCT p.user_id), 2) as conversion_rate
FROM payments p
INNER JOIN auth.users u ON u.id = p.user_id
WHERE p.status = 'active';
```

---

## 🔧 Customizações Recomendadas

### 1. Adicionar Delay entre Emails

Para evitar ser bloqueado pelo Gmail:

```javascript
// No node Function, adicionar antes de enviar email:
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos de delay
```

### 2. Limitar Quantidade de Emails por Execução

Na query do Supabase, adicionar:
```sql
LIMIT 50  -- Envia no máximo 50 emails por execução
```

### 3. Notificar Suporte de Falhas

Adicionar node de erro:

```
Email Send → [On Error] → Slack/Telegram (notificar equipe)
```

---

## 📋 Checklist de Ativação

Antes de ativar os workflows:

### Workflow 1 (Boas-Vindas):
- [ ] Importado no n8n
- [ ] Credencial Gmail configurada
- [ ] Credencial Supabase configurada
- [ ] URL do webhook copiada
- [ ] Testado com payload manual
- [ ] Ativado ✅

### Workflow 2 (Reenvio 24h):
- [ ] Importado no n8n
- [ ] Credenciais configuradas
- [ ] Horário do Cron ajustado (10h)
- [ ] Query SQL testada
- [ ] Ativado ✅

### Workflow 3 (Urgência 3 dias):
- [ ] Importado no n8n
- [ ] Credenciais configuradas
- [ ] Horário do Cron ajustado (14h)
- [ ] Template de urgência revisado
- [ ] Ativado ✅

---

## 🧪 Testar Workflows

### Testar Workflow 1 (Webhook):

```bash
curl -X POST https://your-n8n.app/webhook/loter-ai-welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email-teste@gmail.com",
    "name": "Teste Manual",
    "userId": "00000000-0000-0000-0000-000000000000",
    "transactionId": "test_' $(date +%s) '"
  }'
```

**Resultado esperado:**
- Email recebido em `seu-email-teste@gmail.com`
- Token salvo na tabela `access_tokens`
- Response 200 com `{"success": true}`

### Testar Workflow 2 e 3 (Cron):

**Opção 1:** Executar manualmente
- Abra o workflow no n8n
- Clique em "Execute Workflow"

**Opção 2:** Forçar execução via webhook
- Adicione um node Webhook temporário
- Chame via curl
- Remova após testar

---

## 💾 Backup dos Workflows

**Recomendação:** Faça backup regular dos workflows:

1. No n8n, vá no workflow
2. Clique no menu ⋮ → Export
3. Salve o JSON em local seguro
4. Versione no Git (opcional)

---

## 📞 Suporte

Se tiver dúvidas sobre os workflows:

1. Consulte a documentação do n8n: https://docs.n8n.io
2. Fórum da comunidade: https://community.n8n.io
3. Documentação do Supabase: https://supabase.com/docs

---

**Última atualização:** 13/11/2025
**Versão:** 1.0

**FIM DOS WORKFLOWS N8N**
