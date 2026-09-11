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

Configure no ambiente do site:

```env
A2Y_CRM_LEAD_WEBHOOK_URL="https://SEU-CRM/api/integrations/site-leads"
A2Y_CRM_WEBHOOK_TOKEN="MESMO_TOKEN_DO_BACKOFFICE"
```

No backoffice, o token correspondente é lido por `A2Y_SITE_WEBHOOK_TOKEN`.

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

## Produção

O site possui `Dockerfile`, `docker-compose.prod.yml` e `deploy.sh`.

Fluxo esperado na VPS:

```bash
cd /app/a2y-site
cp .env.example .env.production
# preencher as variáveis reais
docker compose -f docker-compose.prod.yml up -d --build
```

A aplicação expõe `127.0.0.1:3012` e participa da rede Docker `shared_caddy_net`. No Caddy, encaminhe o domínio público da A2Y para `a2y-site:3000` ou para a porta local equivalente, conforme o padrão usado na VPS.

O script `deploy.sh` segue o mesmo modelo do CRM atual e recarrega o Caddy após o build.

## Rotas institucionais

- `/` — site principal;
- `/privacidade` — informações de privacidade;
- `/termos` — termos gerais de uso;
- `/api/leads` — entrada do formulário de diagnóstico.

## Antes de publicar

1. confirmar domínio e regra no Caddy;
2. configurar webhook e token do CRM;
3. validar formulário de diagnóstico ponta a ponta;
4. revisar desktop e mobile;
5. validar `npm run lint` e `npm run build`;
6. conferir textos legais com os dados formais da empresa quando estiverem definidos.

## Direção

- linguagem empresarial e concreta;
- problema antes de tecnologia;
- azul A2Y `#0344F0` como cor de ação;
- evitar estética genérica de IA, mascotes e promessas não comprovadas;
- CTA principal: diagnóstico.
