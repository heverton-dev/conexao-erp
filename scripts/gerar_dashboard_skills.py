"""
Dashboard completo de todas as 300+ skills.
Analisa: temas, qualidade (linhas), idiomas, enriquecimento, duplicatas.
Gera um relatorio HTML e um resumo em markdown.
"""
import os, re, unicodedata, sys, json
from collections import Counter, defaultdict
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SKILLS_DIR = '.agents/skills'

# Generic phrases that indicate boilerplate (template content, not real book text)
GENERIC_PHRASES = [
    'Principios basicos e fundamentos apresentados no livro',
    'Conceitos essenciais para compreensao do tema',
    'Base teorica necessaria para aplicacao pratica',
    'Tecnicas e metodologias apresentadas pelos autores',
    'Principios de design e boas praticas',
    'Estrategias para resolucao de problemas',
    'Exemplos e casos de uso praticos',
    'Implementacao passo a passo dos conceitos',
    'Exercicios e projetos praticos',
    'Conceitos avancados e otimizacao',
    'Integracao com outras ferramentas e tecnologias',
    'Melhores praticas para producao e deploy',
    'Skill baseada no livro',
]

# Known wave categorization rules
WAVE_RULES = [
    ('criar-modulo', 'criar-rota', 'gerar-crud', 'criar-componente-modulo', 'adicionar-permissao',
     'validar-modulo', 'documentar-modulo', 'deploy-vps', 'planejar-modulo-repo-externo',
     'gerenciar-nav-items', 'design-frontend', 'responsividade', 'criar-design-modulo',
     'gerar-pagina', 'gerar-formulario', 'gerar-modal', 'google-maps-platform', 'loop',
     'rtk-memory', 'lean-ctx', 'caveman', 'pre-flight-check', 'implementar-mapa-dark-premium',
     'headroom', 'modulo-completo', 'loop-modulo-completo', 'engsoft-moderna'),
    ('ai-engineering', 'ai-agents-mcp-operacional', 'building-apps-ai-agents', 'agentic-enterprise',
     'ai-assisted-programming', 'ai-native-software-delivery', 'ai-systems-performance-engineering',
     'building-ai-agent-platforms', 'building-micro-frontends', 'ai-value-creators', 'eu-ai-act-guide',
     'ai-essentials-executives', 'building-software-vibe-coding', 'agentic-mesh',
     'ai-engineering-art-intelligent-systems', 'ai-assisted-programming-web-ml',
     'ai-agents-definitive-guide', 'agentic-ai-data-architectures', 'applied-ai-enterprise-java',
     'building-ai-powered-products', 'building-genai-fastapi', 'building-genai-enterprise',
     'genai-software-development', 'genai-design-patterns', 'designing-ai-interfaces',
     'essential-math-ai', 'grokking-ai-algorithms', 'hands-on-apis-ai-data-science',
     'python-simplified-genai', 'vibe-coding-kim-yegge', 'visualizing-genai', 'vibe-engineering',
     'automate-boring-stuff-python', 'principles-building-ai-agents', 'learning-ai-tools-tableau',
     'learning-genai-tools-excel', 'machine-learning-classificacao', 'vibe-coding-addy-osmani',
     'data-science-do-zero', 'engenharia-software-ia-sandeco'),
    ('apis-rest', 'arquitetura-distribuida', 'arquitetura-limpa', 'arquitetura-tomada-decisao',
     'building-microservices-go', 'building-multi-tenant-saas', 'clean-architecture-android',
     'designing-data-intensive', 'explorando-apis-java', 'facilitating-software-architecture',
     'fundamentals-software-architecture', 'fundamentos-arquitetura', 'google-app-engine',
     'graphql', 'head-first-software-architecture', 'introducao-arquitetura-design',
     'learning-domain-driven-design', 'mastering-apis-enterprise', 'modern-data-architecture-ai',
     'principles-modernization', 'rest-construa-apis-inteligentes', 'restful-api-design',
     'software-architecture-decision', 'version-control-git'),
    ('ai-native-software-delivery', 'caixa-de-ferramentas-devops', 'containers-com-docker',
     'cracking-containers-docker-kubernetes', 'descomplicando-docker-2a-edicao',
     'devops-pratica-entrega-software', 'docker', 'docker-basics-visual-guide-pt',
     'docker-basics-visual-guide-en', 'docker-deep-dive', 'docker-deep-dive-zero-to-docker',
     'docker-demystified', 'docker-in-action', 'docker-para-desenvolvedores',
     'docker-para-desenvolvedores-rafael-gomes', 'docker-up-and-running',
     'amazon-aws-descomplicando', 'azure-cloud', 'certificacao-linux-lpic',
     'containers-com-docker-pt', 'descomplicando-docker-v1', 'descomplicando-docker-v2',
     'devops-na-pratica', 'google-app-engine-devops', 'jornada-kubernetes-completo',
     'kubernetes-pt', 'genai-on-google-cloud', 'generative-ai-on-kubernetes',
     'hands-on-devops-linux', 'implementing-devsecops', 'infrastructure-automation-terraform',
     'jenkins-automatize-tudo', 'kubernetes-up-and-running', 'learn-docker-month-of-lunches',
     'manual-de-devops', 'manual-devops-agilidade-confiabilidade', 'mastering-docker',
     'modern-system-administration', 'sre-with-aiops', 'strategic-devops',
     'comprehensive-devops-interview-guide', 'ultimate-docker-container-book',
     'usando-docker', 'using-docker-2015'),
    ('a-web-mobile', 'aplicativos-web', 'boas-praticas-nodejs', 'building-production-ready',
     'cangaceiro-javascript', 'construindo-apis-rest', 'construindo-apis-testaveis',
     'creating-npm-package', 'data-structures-and-algorithms-in-javascript',
     'django-de-a-a-z', 'dominando-javascript', 'ecmascript-6', 'efficient-nodejs',
     'elixir-do-zero', 'eloquent-javascript', 'epub-angular', 'epub-aplicacoes-java',
     'epub-aprenda-javascript', 'epub-aspnet-mvc5', 'epub-canivete', 'epub-canvas',
     'epub-coletanea', 'epub-css-eficiente', 'epub-desenvolva-jogos',
     'epub-desenvolvimento-web', 'epub-estruturas-de-dados', 'epub-front-end-com-vuejs',
     'epub-guia-front-end', 'epub-guia-pratico-de-typescript', 'epub-html5-e-css3',
     'epub-javascript-assertivo', 'epub-jsf-eficaz', 'epub-php-e-laravel',
     'epub-play-framework', 'epub-postgresql', 'epub-progressive-web-apps',
     'epub-react-native', 'epub-sass', 'epub-seguranca', 'epub-vraptor',
     'epub-vuejs', 'epub-web-design-responsivo', 'epub-yesod-e-haskell',
     'estruturas-de-dados-e-algoritmos', 'flask-de-a-a-z', 'full-stack',
     'head-first-javascript', 'html-5-embarque', 'html-e-css-projete',
     'ios-programe', 'javascript', 'javascript-and-jquery', 'javascript-for-modern',
     'javascript-mastery', 'logica-de-programacao', 'mastering-mean-stack',
     'meteor-criando', 'modern-web-design', 'nodejs', 'o-retorno-do-cangaceiro',
     'primeiros-passos-com-nodejs', 'react-js', 'swift-programe', 'udemy-guide',
     'web-api-cookbook', 'web-apis-em-nodejs', 'web-design-responsivo',
     'web-development', 'webapp-com-nodejs'),
]

def detect_wave(slug, all_slugs_in_order):
    """Detect which wave a skill belongs to based on its position in AGENTS.md and name patterns"""
    # Wave 0: ERP operational skills
    erp_skills = {'criar-modulo', 'criar-rota', 'gerar-crud', 'adicionar-permissao', 'validar-modulo',
                  'documentar-modulo', 'deploy-vps', 'planejar-modulo-repo-externo', 'gerenciar-nav-items',
                  'design-frontend', 'responsividade', 'criar-design-modulo', 'gerar-pagina', 'gerar-formulario',
                  'gerar-modal', 'google-maps-platform', 'loop', 'lean-ctx', 'caveman', 'pre-flight-check',
                  'implementar-mapa-dark-premium', 'headroom', 'modulo-completo', 'loop-modulo-completo',
                  'engsoft-moderna', 'rtk-memory', 'criar-componente-modulo'}
    if slug in erp_skills:
        return 'ERP'
    
    # Wave 1: IA
    wave1_starters = {'ai-engineering', 'ai-agents-mcp-operacional', 'building-apps-ai-agents', 'agentic-enterprise'}
    wave1_keywords = ['ai-', 'agentic-', 'genai-', 'vibe-', 'machine-learning', 'data-science-do-zero',
                      'engenharia-software-ia', 'grokking-ai', 'automate-boring',
                      'building-micro-frontends', 'essential-math-ai', 'python-simplified-genai',
                      'visualizing-genai']
    
    # Wave 2: Arquitetura
    wave2_keywords = ['arquitetura', 'apis-rest', 'clean-architecture', 'designing-data',
                      'fundamentals-software', 'fundamentos-arquitetura', 'head-first-software',
                      'learning-domain-driven', 'mastering-apis', 'principles-modernization',
                      'restful-api', 'software-architecture', 'version-control', 
                      'explorando-apis-java', 'google-app-engine', 'graphql',
                      'introducao-arquitetura', 'building-microservices', 'building-multi-tenant',
                      'modern-data-architecture', 'rest-construa-apis-inteligentes']
    
    # Wave 3: DevOps
    wave3_keywords = ['docker', 'devops', 'kubernetes', 'jenkins', 'terraform', 'ansible',
                      'aws-', 'azure-', 'certificacao-linux', 'sre-', 'strategic-devops',
                      'comprehensive-devops', 'ultimate-docker', 'usando-docker', 'using-docker',
                      'manual-de-devops', 'manual-devops', 'caixa-de-ferramentas-devops',
                      'containers-com-docker', 'cracking-containers', 'descomplicando-docker',
                      'genai-on-google', 'generative-ai-on-kubernetes', 'google-app-engine-devops',
                      'hands-on-devops', 'implementing-devsecops', 'infrastructure-automation',
                      'jornada-kubernetes', 'learn-docker', 'mastering-docker',
                      'modern-system-administration', 'ai-native-software-delivery',
                      'docker-deep-dive-zero-to-docker', 'docker-demystified', 'docker-in-action']
    
    # Wave 4: Web lote 1
    wave4_keywords = ['epub-a-web', 'epub-angular', 'epub-aplicacoes-java', 'epub-aprenda',
                      'epub-aspnet', 'epub-canivete', 'epub-canvas', 'epub-coletanea',
                      'epub-css', 'epub-desenvolva', 'epub-desenvolvimento', 'epub-estruturas',
                      'epub-front-end', 'epub-guia-front', 'epub-guia-pratico', 'epub-html5',
                      'epub-javascript-assertivo', 'epub-jsf', 'epub-php', 'epub-play',
                      'epub-postgresql', 'epub-progressive', 'epub-react-native', 'epub-sass',
                      'epub-seguranca', 'epub-vraptor', 'epub-vuejs', 'epub-web-design',
                      'epub-yesod', 'a-web-mobile', 'aplicativos-web', 'boas-praticas-nodejs',
                      'building-production-ready', 'cangaceiro-javascript', 'construindo-apis-rest',
                      'construindo-apis-testaveis', 'creating-npm-package',
                      'data-structures-and-algorithms-in-javascript', 'django-de-a-a-z',
                      'dominando-javascript', 'ecmascript-6', 'efficient-nodejs', 'elixir-do-zero',
                      'eloquent-javascript', 'estruturas-de-dados-e-algoritmos', 'flask-de-a-a-z',
                      'full-stack', 'head-first-javascript', 'html-5-embarque', 'html-e-css-projete',
                      'ios-programe', 'javascript-and-jquery', 'javascript-for-modern',
                      'javascript-mastery', 'logica-de-programacao', 'mastering-mean-stack',
                      'meteor-criando', 'modern-web-design', 'nodejs-aplicacoes', 'nodejs-complete',
                      'nodejs-handbook', 'nodejs-para-iniciantes', 'o-retorno-do-cangaceiro',
                      'primeiros-passos-com-nodejs', 'react-js', 'swift-programe', 'udemy-guide',
                      'web-api-cookbook', 'web-apis-em-nodejs', 'web-design-responsivo',
                      'web-development', 'webapp-com-nodejs']
    
    # Wave 5: Restantes
    wave5_keywords = ['a-logica-do-jogo', 'agile-', 'ai-engineering-and', 'algoritmos-em-java',
                      'applied-ai-for', 'aprenda-a-programar', 'armazenando-dados',
                      'automate-the-boring', 'better-python-code', 'casa-do-codigo',
                      'como-descobrir', 'data-science-for', 'datas-e-horas', 'desbravando-java',
                      'desenvolvimento-web-com-php', 'engenharia-de-software',
                      'entendendo-algoritmos', 'entrega-continua', 'epub-componentes',
                      'epub-cucumber', 'epub-datas', 'epub-desbravando', 'epub-practical-java',
                      'epub-protractor', 'epub-refatorando', 'epub-rspec', 'epub-selenium',
                      'epub-spock', 'epub-testes', 'fragmentos-de', 'fundamentals-of-software-engineering',
                      'guia-do-mestre', 'image-processing', 'implementing-reverse',
                      'introducao-a-programacao', 'ionic-framework', 'jogos-2d', 'jornada-python',
                      'jsf-eficaz-as-melhores', 'kotlin-com-android', 'lean-game-development',
                      'learning-generative-ai', 'low-code-development', 'mastering-microsoft',
                      'mastering-the-it', 'mongodb-construa', 'mysql-comece', 'o-programador-pragmatico',
                      'oauth-20', 'onsumindo-a-api', 'platform-engineering', 'play-framework-java',
                      'postgresql-banco-de-dados', 'powershell', 'practical-java-8',
                      'programando-em-google', 'python-escreva', 'python-for-devops',
                      'python-powered', 'react-native-desenvolvimento', 'redes-de-computadores',
                      'refatorando-com-padroes', 'seguranca-em-aplicacoes-web',
                      'selenium-webdriver', 'series-temporais', 'sql-crash-course',
                      'test-driven-development', 'trilhas-python', 'vraptor-desenvolvimento',
                      'web-automation-with', 'python-simplified', 'python']
    
    # Wave 6: PDFs/MOBIs
    wave6_keywords = ['aprendendo-node', 'modern-full-stack', 'web-scraping',
                      'enterprise-architects', 'javascript-de-alto', 'mongodb-construa-novas',
                      'the-ai-engineers', 'comunicacao-de-dados', 'marketing-de-conteudo',
                      'big-data-tecnicas', 'data-science-crash', 'elasticsearch',
                      'epub-pandas-python', 'inteligencia-artificial-e-chatgpt',
                      'jpa-eficaz', 'nosql-como-armazenar', 'pandas-python',
                      'sistemas-de-banco-de-dados']
    
    for kw in wave1_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 1'
    for kw in wave2_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 2'
    for kw in wave3_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 3'
    for kw in wave4_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 4'
    for kw in wave5_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 5'
    for kw in wave6_keywords:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 6'
    
    return 'Nao categorizado'


# Read AGENTS.md entries with their order
agents_entries = []
with open('AGENTS.md', 'r', encoding='utf-8') as f:
    for line in f:
        if line.strip().startswith('| `'):
            m = re.search(r'`([^`]+)`', line)
            if m:
                agents_entries.append(m.group(1))

# Read all .md files
all_skills = {}
for f in os.listdir(SKILLS_DIR):
    if not f.endswith('.md') or f == '_lista_unica.json' or f.startswith('_'):
        continue
    slug = f.replace('.md', '')
    path = os.path.join(SKILLS_DIR, f)
    with open(path, 'r', encoding='utf-8') as fh:
        content = fh.read()
    lines = content.count('\n')
    chars = len(content)
    
    # Detect language from content
    has_pt = any(w in content.lower() for w in ['passos', 'para o', 'com o', 'na pratica', 'voce'])
    has_en = any(w in content.lower() for w in ['this book', 'chapter', 'introduction', 'you will'])
    
    generic_count = sum(1 for p in GENERIC_PHRASES if p in content)
    is_boilerplate = generic_count >= 4  # 4+ generic phrases = still boilerplate
    
    # Detect main topic from description
    desc = ''
    m = re.search(r'description:\s*>\s*\n\s*(.+?)(?:\n---|\Z)', content, re.DOTALL)
    if m:
        desc = m.group(1).strip()
    
    all_skills[slug] = {
        'lines': lines,
        'chars': chars,
        'lang': 'PT' if has_pt else ('EN' if has_en else 'N/A'),
        'boilerplate': is_boilerplate,
        'wave': detect_wave(slug, agents_entries),
        'desc': desc[:80] if desc else 'N/A',
        'registered': slug in agents_entries,
    }

# Count by wave
wave_counts = defaultdict(lambda: {'total': 0, 'lines': 0, 'boilerplate': 0, 'enriched': 0, 'pt': 0, 'en': 0})
for slug, info in all_skills.items():
    w = info['wave']
    wave_counts[w]['total'] += 1
    wave_counts[w]['lines'] += info['lines']
    if info['boilerplate']:
        wave_counts[w]['boilerplate'] += 1
    else:
        wave_counts[w]['enriched'] += 1
    if info['lang'] == 'PT':
        wave_counts[w]['pt'] += 1
    elif info['lang'] == 'EN':
        wave_counts[w]['en'] += 1

# Generate HTML
html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ERP Odonto — Dashboard de Skills</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: #0f172a; color: #e2e8f0; padding: 2rem; }}
  h1 {{ color: #38bdf8; margin-bottom: 0.5rem; }}
  h2 {{ color: #94a3b8; margin: 2rem 0 1rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }}
  .subtitle {{ color: #64748b; margin-bottom: 2rem; }}
  .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }}
  .card {{ background: #1e293b; border-radius: 0.75rem; padding: 1.25rem; }}
  .card .value {{ font-size: 2rem; font-weight: 700; color: #38bdf8; }}
  .card .label {{ font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }}
  table {{ width: 100%; border-collapse: collapse; margin-bottom: 2rem; }}
  th, td {{ padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #1e293b; }}
  th {{ background: #1e293b; color: #94a3b8; font-weight: 600; font-size: 0.875rem; }}
  tr:hover {{ background: #1e293b99; }}
  .badge {{ display: inline-block; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }}
  .badge-pt {{ background: #166534; color: #86efac; }}
  .badge-en {{ background: #1e3a5f; color: #93c5fd; }}
  .badge-thin {{ background: #78350f; color: #fdba74; }}
  .badge-ok {{ background: #14532d; color: #86efac; }}
  .badge-boilerplate {{ background: #422006; color: #fcd34d; }}
  .badge-enriched {{ background: #1e3a5f; color: #93c5fd; }}
  .bar {{ height: 1.5rem; background: #1e293b; border-radius: 0.25rem; overflow: hidden; margin: 0.25rem 0; }}
  .bar-fill {{ height: 100%; background: #38bdf8; border-radius: 0.25rem; }}
  .bar-fill.enriched {{ background: #22c55e; }}
  .bar-fill.boilerplate {{ background: #eab308; }}
</style>
</head>
<body>
<h1>📊 Dashboard de Skills — ERP Odonto</h1>
<p class="subtitle">{len(all_skills)} skills analisadas em {len(all_skills)} arquivos .md | {len(agents_entries)} entries no AGENTS.md</p>

<div class="summary">
  <div class="card"><div class="value">{len(all_skills)}</div><div class="label">Total Skills</div></div>
  <div class="card"><div class="value">{sum(s['lines'] for s in all_skills.values())}</div><div class="label">Linhas Totais</div></div>
  <div class="card"><div class="value">{sum(s['lines'] for s in all_skills.values())//max(len(all_skills),1)}</div><div class="label">Média Linhas/Skill</div></div>
  <div class="card"><div class="value">{sum(1 for s in all_skills.values() if s['boilerplate'])}</div><div class="label">Boilerplate (fina)</div></div>
  <div class="card"><div class="value">{sum(1 for s in all_skills.values() if not s['boilerplate'])}</div><div class="label">Enriquecidas</div></div>
  <div class="card"><div class="value">{sum(1 for s in all_skills.values() if s['lang'] == 'PT')}</div><div class="label">Português (PT)</div></div>
  <div class="card"><div class="value">{sum(1 for s in all_skills.values() if s['lang'] == 'EN')}</div><div class="label">Inglês (EN)</div></div>
  <div class="card"><div class="value">{sum(1 for s in all_skills.values() if not s['registered'])}</div><div class="label">Não registrados</div></div>
</div>

<h2>📈 Skills por Onda</h2>
<table>
<tr><th>Onda</th><th>Total</th><th>Linhas</th><th>Média</th><th>Boilerplate</th><th>Enriquecidas</th><th>PT</th><th>EN</th><th>% Boilerplate</th></tr>
"""
for wave_name in ['ERP', 'Onda 1', 'Onda 2', 'Onda 3', 'Onda 4', 'Onda 5', 'Onda 6', 'Nao categorizado']:
    if wave_name in wave_counts:
        w = wave_counts[wave_name]
        pct = (w['boilerplate'] / w['total'] * 100) if w['total'] > 0 else 0
        avg = w['lines'] // w['total'] if w['total'] > 0 else 0
        html += f"<tr><td>{wave_name}</td><td>{w['total']}</td><td>{w['lines']}</td><td>{avg}</td>"
        html += f"<td>{w['boilerplate']}</td><td>{w['enriched']}</td><td>{w['pt']}</td><td>{w['en']}</td>"
        html += f"<td><div class='bar' style='width:100px;display:inline-block;vertical-align:middle'><div class='bar-fill boilerplate' style='width:{pct}%'></div></div> {pct:.0f}%</td></tr>"

# Top 10 maiores skills
top_skills = sorted(all_skills.items(), key=lambda x: x[1]['lines'], reverse=True)[:10]
html += f"""
</table>

<h2>🏆 Top 10 Maiores Skills (mais linhas)</h2>
<table>
<tr><th>#</th><th>Skill</th><th>Linhas</th><th>Chars</th><th>Idioma</th><th>Onda</th><th>Tipo</th></tr>
"""
for i, (slug, info) in enumerate(top_skills, 1):
    badge_lang = f"<span class='badge badge-{info['lang'].lower()}'>{info['lang']}</span>"
    badge_type = "<span class='badge badge-enriched'>Enriquecida</span>" if not info['boilerplate'] else "<span class='badge badge-boilerplate'>Boilerplate</span>"
    html += f"<tr><td>{i}</td><td><code>{slug[:50]}</code></td><td>{info['lines']}</td><td>{info['chars']:,}</td><td>{badge_lang}</td><td>{info['wave']}</td><td>{badge_type}</td></tr>"

# Bottom 10 (fina)
bottom_skills = sorted(all_skills.items(), key=lambda x: x[1]['lines'])[:10]
html += f"""
</table>

<h2>🔻 Top 10 Skills Mais Finas (menos linhas)</h2>
<table>
<tr><th>#</th><th>Skill</th><th>Linhas</th><th>Idioma</th><th>Onda</th><th>Descrição</th></tr>
"""
for i, (slug, info) in enumerate(bottom_skills, 1):
    badge_lang = f"<span class='badge badge-{info['lang'].lower()}'>{info['lang']}</span>"
    html += f"<tr><td>{i}</td><td><code>{slug[:50]}</code></td><td>{info['lines']}</td><td>{badge_lang}</td><td>{info['wave']}</td><td>{info['desc'][:60]}</td></tr>"

# Distribution by line count
html += f"""
</table>

<h2>📊 Distribuição por Qualidade</h2>
<table>
<tr><th>Qualidade</th><th>Faixa de Linhas</th><th>Quantidade</th><th>%</th></tr>
"""
ranges = [('Excelente', 200, 99999), ('Boa', 120, 199), ('Regular', 80, 119), ('Fina', 0, 79)]
for label, lo, hi in ranges:
    count = sum(1 for s in all_skills.values() if lo <= s['lines'] <= hi)
    pct = count / len(all_skills) * 100 if all_skills else 0
    html += f"<tr><td>{label}</td><td>{lo}-{hi if hi < 99999 else '+'} linhas</td><td>{count}</td><td>{pct:.1f}%</td></tr>"

html += f"""
</table>

<h2>📋 Distribuição por Idioma</h2>
<table>
<tr><th>Idioma</th><th>Quantidade</th><th>%</th></tr>
"""
total = len(all_skills)
for lang in ['PT', 'EN', 'N/A']:
    count = sum(1 for s in all_skills.values() if s['lang'] == lang)
    html += f"<tr><td>{lang}</td><td>{count}</td><td>{count/total*100:.1f}% ({count})</td></tr>"

html += """
</table>

<h2>⚠️ Sugestões de Ação</h2>
<ul style="color: #94a3b8; line-height: 1.8;">
"""
if sum(1 for s in all_skills.values() if s['boilerplate']) > 0:
    html += f"<li><strong>Enriquecer skills finas:</strong> {sum(1 for s in all_skills.values() if s['boilerplate'])} skills ainda são boilerplate template sem conteúdo real extraído dos livros. Priorizar Onda 4 e 5.</li>"
if sum(1 for s in all_skills.values() if not s['registered']) > 0:
    html += f"<li><strong>Registrar skills órfãs:</strong> {sum(1 for s in all_skills.values() if not s['registered'])} arquivos .md não estão no AGENTS.md.</li>"
if sum(1 for s in all_skills.values() if s['lines'] < 50) > 0:
    html += f"<li><strong>Remover skills muito finas:</strong> {sum(1 for s in all_skills.values() if s['lines'] < 50)} skills com menos de 50 linhas têm valor questionável.</li>"
# Data Science folder still unprocessed
html += "<li><strong>Nova pasta disponível:</strong> Data Science e Inteligência Artificial (42 EPUBs) não foi processada — está disponível como Onda 7.</li>"
html += """
</ul>

<p style="color: #475569; margin-top: 3rem; font-size: 0.875rem;">
Gerado em: """ + __import__('datetime').datetime.now().strftime('%d/%m/%Y %H:%M') + """ | Total: """ + str(len(all_skills)) + """ skills
</p>
</body>
</html>
"""

# Write HTML dashboard
dashboard_path = 'dashboard_skills.html'
with open(dashboard_path, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'Dashboard gerado: {dashboard_path}')
print(f'Tamanho: {len(html)} bytes')

# Also print text summary
print(f'\n=== RESUMO DASHBOARD ===')
print(f'Total de skills: {len(all_skills)}')
print(f'Registradas no AGENTS.md: {len(agents_entries)}')
print(f'Total de linhas: {sum(s["lines"] for s in all_skills.values())}')
print(f'Média de linhas/skill: {sum(s["lines"] for s in all_skills.values()) // max(len(all_skills),1)}')
print(f'Boilerplate: {sum(1 for s in all_skills.values() if s["boilerplate"])}')
print(f'Enriquecidas: {sum(1 for s in all_skills.values() if not s["boilerplate"])}')
print(f'PT: {sum(1 for s in all_skills.values() if s["lang"] == "PT")}')
print(f'EN: {sum(1 for s in all_skills.values() if s["lang"] == "EN")}')
print()

print('--- Skills por Onda ---')
for wave_name in ['ERP', 'Onda 1', 'Onda 2', 'Onda 3', 'Onda 4', 'Onda 5', 'Onda 6', 'Nao categorizado']:
    if wave_name in wave_counts:
        w = wave_counts[wave_name]
        pct = w['boilerplate'] / w['total'] * 100 if w['total'] > 0 else 0
        print(f'  {wave_name:20s}: {w["total"]:3d} skills | {w["lines"]:5d} linhas | {w["boilerplate"]:3d} boilerplate ({pct:.0f}%) | PT:{w["pt"]} EN:{w["en"]}')

print()
print('--- Distribuicao por qualidade ---')
for label, lo, hi in [('Excelente (200+ linhas)', 200, 99999), ('Boa (120-199)', 120, 199), ('Regular (80-119)', 80, 119), ('Fina (<80 linhas)', 0, 79)]:
    count = sum(1 for s in all_skills.values() if lo <= s['lines'] <= hi)
    print(f'  {label:30s}: {count:3d} skills')
