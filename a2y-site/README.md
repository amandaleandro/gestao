# A2Y Site Institucional

Aplicação pública da A2Y Tecnologia. É separada do `a2y-app`, que continua sendo o backoffice/CRM interno.

## Rodar localmente

```bash
cd a2y-site
npm install
npm run dev
```

## Integração de leads

O formulário envia para `/api/leads`, que encaminha o payload ao CRM por webhook.

Configure:

```env
A2Y_CRM_LEAD_WEBHOOK_URL="https://..."
A2Y_CRM_WEBHOOK_TOKEN="..."
```

Payload principal:

```json
{
  "name": "...",
  "company": "...",
  "contact": "...",
  "segment": "...",
  "bottleneck": "...",
  "source": "SITE_A2Y"
}
```

## Direção

- linguagem empresarial e concreta;
- problema antes de tecnologia;
- azul A2Y `#0344F0` como cor de ação;
- evitar estética genérica de IA, mascotes e promessas não comprovadas;
- CTA principal: diagnóstico.
