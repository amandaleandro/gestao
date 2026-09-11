# Integrações do backoffice A2Y

## Site institucional → CRM

Endpoint:

```text
POST /api/integrations/site-leads
```

Variável no CRM:

```env
A2Y_SITE_WEBHOOK_TOKEN=
```

Variáveis no `a2y-site`:

```env
A2Y_CRM_LEAD_WEBHOOK_URL=https://SEU-CRM/api/integrations/site-leads
A2Y_CRM_WEBHOOK_TOKEN=
```

`A2Y_CRM_WEBHOOK_TOKEN` e `A2Y_SITE_WEBHOOK_TOKEN` devem ter o mesmo valor.

## Sales Agent → CRM

Endpoint:

```text
POST /api/integrations/sales-agent/meeting
```

Variável no CRM:

```env
A2Y_AGENT_WEBHOOK_TOKEN=
```

Variáveis no `agente-de-vendas`:

```env
A2Y_BACKOFFICE_MEETING_WEBHOOK_URL=https://SEU-CRM/api/integrations/sales-agent/meeting
A2Y_BACKOFFICE_WEBHOOK_TOKEN=
```

`A2Y_BACKOFFICE_WEBHOOK_TOKEN` e `A2Y_AGENT_WEBHOOK_TOKEN` devem ter o mesmo valor.

## Regras

- usar segredos fortes e diferentes entre as duas integrações;
- nunca versionar valores reais no Git;
- trocar os segredos se forem expostos;
- o webhook do agente é idempotente por lead e não deve duplicar oportunidade ao receber a mesma reunião novamente;
- falha na sincronização do backoffice não deve desfazer a reunião que já foi confirmada com o prospect.
