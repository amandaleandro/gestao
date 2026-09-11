import DiagnosticForm from "@/components/DiagnosticForm";

const problems = [
  {
    index: "01",
    title: "Oportunidades se perdem no atendimento",
    description: "Leads chegam pelo WhatsApp, o orçamento é enviado e o acompanhamento depende da memória de alguém.",
  },
  {
    index: "02",
    title: "A operação cresceu em cima de planilhas",
    description: "Informação duplicada, tarefas manuais e pouca visibilidade sobre o que está parado ou atrasado.",
  },
  {
    index: "03",
    title: "Ferramentas não conversam entre si",
    description: "Equipe copia dados entre sistemas, mensagens, planilhas, financeiro e agenda para manter o processo funcionando.",
  },
  {
    index: "04",
    title: "Infraestrutura virou risco operacional",
    description: "Deploy manual, servidor sem observabilidade, backups pouco claros e falhas que chegam ao cliente antes da equipe.",
  },
];

const capabilities = [
  {
    label: "A2Y Solutions",
    title: "Automação e sistemas",
    description: "Transformamos processos manuais em fluxos rastreáveis, integrações e sistemas sob medida quando a operação realmente pede isso.",
  },
  {
    label: "Atendimento & Vendas",
    title: "Organização comercial",
    description: "Estruturamos leads, orçamentos, follow-up, agenda e visibilidade para equipes que vendem por conversa e relacionamento.",
  },
  {
    label: "A2Y Cloud",
    title: "DevOps e infraestrutura",
    description: "Organizamos deploy, containers, CI/CD, servidores, observabilidade e rotinas de infraestrutura para reduzir improviso técnico.",
  },
];

const steps = [
  ["01", "Diagnóstico", "Entendemos como o processo funciona hoje e onde está o gargalo."],
  ["02", "Desenho", "Definimos a menor solução capaz de resolver o problema sem criar complexidade desnecessária."],
  ["03", "Implantação", "Configuramos, integramos, testamos e colocamos a solução dentro da rotina real da equipe."],
  ["04", "Evolução", "Medimos uso, corrigimos atritos e expandimos apenas o que demonstrar valor."],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main className="bg-white text-[#071827]">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#inicio" className="flex items-center gap-3" aria-label="A2Y Tecnologia — início">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0344F0] text-sm font-black tracking-[-0.04em] text-white">A2Y</span>
            <span>
              <strong className="block text-sm tracking-[-0.01em]">A2Y Tecnologia</strong>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Software · Automação · Cloud</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex" aria-label="Principal">
            <a className="transition hover:text-[#071827]" href="#problemas">Problemas que resolvemos</a>
            <a className="transition hover:text-[#071827]" href="#solucoes">Soluções</a>
            <a className="transition hover:text-[#071827]" href="#processo">Como trabalhamos</a>
            <a className="transition hover:text-[#071827]" href="#produtos">Produtos</a>
          </nav>

          <a href="#diagnostico" className="rounded-lg bg-[#071827] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">Solicitar diagnóstico</a>
        </div>
      </header>

      <section id="inicio" className="grid-shell border-b border-slate-200">
        <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#0344F0]">
              Tecnologia aplicada a problemas reais de negócio
            </div>
            <h1 className="text-balance max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#071827] sm:text-6xl lg:text-7xl">
              Sua empresa não precisa de mais uma ferramenta. Precisa resolver o que está travando a operação.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              A A2Y identifica gargalos em vendas, atendimento e operação e cria a solução certa — automação, sistema ou infraestrutura — sem começar pelo código e procurar um problema depois.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#diagnostico" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0344F0] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(3,68,240,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0239c9]">
                Solicitar diagnóstico <Arrow />
              </a>
              <a href="#processo" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">
                Ver como trabalhamos
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="border-l-2 border-[#0344F0] pl-3"><strong className="block text-[#071827]">Diagnóstico antes da solução</strong>Sem empurrar tecnologia.</div>
              <div className="border-l-2 border-slate-300 pl-3"><strong className="block text-[#071827]">Escopo objetivo</strong>Menos promessa, mais entrega.</div>
              <div className="border-l-2 border-slate-300 pl-3"><strong className="block text-[#071827]">Evolução por evidência</strong>Expandir só o que funcionar.</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[40px] bg-blue-50/80 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[#071827] shadow-[0_32px_100px_rgba(7,24,39,0.16)]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Diagnóstico operacional</p>
                  <p className="mt-1 text-sm text-white/60">Do sintoma para uma decisão técnica.</p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">processo claro</span>
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                {[
                  ["Entrada", "Leads chegam pelo WhatsApp e Instagram"],
                  ["Gargalo", "Orçamentos sem próxima ação definida"],
                  ["Impacto", "Gestor não enxerga o que ainda pode avançar"],
                  ["Solução", "Pipeline + follow-up + alertas + visão de gestão"],
                ].map(([label, value], index) => (
                  <div key={label} className="grid grid-cols-[36px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-xs font-black text-white">0{index + 1}</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-white/80">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 px-6 py-5 text-sm text-white/55">
                A tecnologia aparece depois que o problema ficou claro.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problemas" className="border-b border-slate-200 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Onde entramos</p>
              <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Quando o improviso começa a custar caro.</h2>
              <p className="mt-5 max-w-md leading-7 text-slate-600">Nem todo problema precisa de um sistema novo. Nosso trabalho começa entendendo onde existe perda de tempo, informação ou oportunidade.</p>
            </div>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {problems.map((problem) => (
                <article key={problem.index} className="grid gap-4 py-8 sm:grid-cols-[64px_1fr] sm:py-10">
                  <span className="text-sm font-black text-[#0344F0]">{problem.index}</span>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em]">{problem.title}</h3>
                    <p className="mt-3 max-w-2xl leading-7 text-slate-600">{problem.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solucoes" className="bg-[#F5F8FB] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Soluções</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Capacidade técnica ampla. Oferta comercial simples.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">Não vendemos um cardápio de tecnologia. Escolhemos a capacidade certa de acordo com o gargalo encontrado.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.label} className="flex min-h-[310px] flex-col rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(7,24,39,0.08)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0344F0]">{item.label}</p>
                <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{item.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{item.description}</p>
                <div className="mt-auto pt-8 text-sm font-bold text-[#071827]">Construído a partir do diagnóstico →</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Oferta inicial</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Atendimento & Vendas para operações que vivem no WhatsApp.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Para empresas que recebem pedidos, fazem orçamento e precisam acompanhar várias oportunidades ao mesmo tempo sem depender da memória do vendedor.</p>
            <a href="#diagnostico" className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#0344F0]">Quero avaliar meu processo <Arrow /></a>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-[#071827] p-6 text-white sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Leads organizados", "Cada oportunidade com contexto, responsável e etapa."],
                ["02", "Pipeline visível", "Gestão sabe o que entrou, avançou, parou ou foi perdido."],
                ["03", "Follow-up", "Próximas ações deixam de depender de lembrar manualmente."],
                ["04", "Automação com limite", "Automatizamos o repetitivo e preservamos handoff humano."],
              ].map(([n, title, text]) => (
                <div key={n} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                  <span className="text-xs font-black text-blue-300">{n}</span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="processo" className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Como trabalhamos</p>
              <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Menos teatro de inovação. Mais processo.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map(([n, title, text]) => (
                <article key={n} className="rounded-2xl border border-slate-200 p-6">
                  <span className="text-xs font-black text-[#0344F0]">{n}</span>
                  <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="produtos" className="border-y border-slate-200 bg-[#F5F8FB] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">A2Y Labs</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Também construímos produtos próprios.</h2>
            </div>
            <p className="max-w-md leading-7 text-slate-600">Produtos servem como laboratório real de produto, software, infraestrutura, pagamentos e experiência — não como vitrine de buzzwords.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex items-center justify-between gap-4"><span className="text-xs font-black uppercase tracking-[0.16em] text-[#0344F0]">Produto</span><span className="text-xs text-slate-400">A2Y Labs</span></div>
              <h3 className="mt-10 text-3xl font-semibold tracking-[-0.04em]">CarreirasMatch</h3>
              <p className="mt-3 max-w-xl leading-7 text-slate-600">Tecnologia aplicada à tomada de decisão em candidaturas e desenvolvimento profissional.</p>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-7">
              <div className="flex items-center justify-between gap-4"><span className="text-xs font-black uppercase tracking-[0.16em] text-[#0344F0]">Produto</span><span className="text-xs text-slate-400">A2Y Labs</span></div>
              <h3 className="mt-10 text-3xl font-semibold tracking-[-0.04em]">FechaPro</h3>
              <p className="mt-3 max-w-xl leading-7 text-slate-600">Propostas comerciais, apresentação de valor e acompanhamento do processo de fechamento em uma experiência digital.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="diagnostico" className="grid-shell py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0344F0]">Próximo passo</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">Antes de falar de tecnologia, vamos entender o que precisa mudar.</h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">Conte rapidamente o gargalo. Se houver fit, seguimos para uma conversa de diagnóstico e desenhamos o próximo passo com escopo claro.</p>
            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <p><strong className="text-[#071827]">Sem compromisso de projeto.</strong> Primeiro avaliamos se existe um problema que a A2Y realmente consegue resolver.</p>
              <p><strong className="text-[#071827]">Sem promessa de resultado inventada.</strong> Trabalhamos com processo, evidência e limites claros de escopo.</p>
            </div>
          </div>
          <DiagnosticForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#071827] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0344F0] text-xs font-black">A2Y</span><strong>A2Y Tecnologia</strong></div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/50">Software, automação e infraestrutura aplicados a problemas reais de operação e vendas.</p>
          </div>
          <div className="text-xs text-white/40">© {new Date().getFullYear()} A2Y Tecnologia. Todos os direitos reservados.</div>
        </div>
      </footer>
    </main>
  );
}
