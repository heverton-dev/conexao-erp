#!/usr/bin/env python3
import os

SKILLS_DIR = '.agents/skills'

# Simplified wave detection
erp = {
    'criar-modulo','criar-rota','gerar-crud','adicionar-permissao','validar-modulo',
    'documentar-modulo','deploy-vps','planejar-modulo-repo-externo','gerenciar-nav-items',
    'design-frontend','responsividade','criar-design-modulo','gerar-pagina','gerar-formulario',
    'gerar-modal','google-maps-platform','loop','lean-ctx','caveman','pre-flight-check',
    'implementar-mapa-dark-premium','headroom','modulo-completo','loop-modulo-completo',
    'engsoft-moderna','rtk-memory','criar-componente-modulo','cavecrew','caveman-commit',
    'caveman-compress','caveman-help','caveman-review','caveman-stats','calcular-gastos-sessao',
    'aplicar-design-modulo','extrair-skill-de-livro','master-skill','implementar-plan'
}

w1k = ['ai-','agentic-','genai-','vibe-','machine-learning','data-science-do-zero',
       'grokking-ai','automate-boring','building-micro-frontends','essential-math-ai',
       'python-simplified-genai','visualizing-genai']
w2k = ['arquitetura','apis-rest','clean-architecture','rest-construa','designing-data',
       'fundamentals-software','fundamentos-arquitetura','head-first-software',
       'learning-domain-driven','mastering-apis','principles-modernization','restful-api',
       'software-architecture','version-control','explorando-apis-java','google-app-engine',
       'graphql','introducao-arquitetura','building-microservices','building-multi-tenant',
       'modern-data-architecture']
w3k = ['docker','devops','kubernetes','jenkins','terraform','ansible','aws-','azure-',
       'certificacao-linux','sre-','strategic-devops','comprehensive-devops','ultimate-docker',
       'usando-docker','using-docker','manual-de-devops','manual-devops','caixa-de-ferramentas-devops',
       'containers-com-docker','cracking-containers','descomplicando-docker','genai-on-google',
       'generative-ai-on-kubernetes','google-app-engine-devops','hands-on-devops',
       'implementing-devsecops','infrastructure-automation','jornada-kubernetes','learn-docker',
       'mastering-docker','modern-system-administration','ai-native-software-delivery',
       'docker-deep-dive-zero-to-docker','docker-demystified','docker-in-action']
w4k = ['epub-','a-web-mobile','aplicativos-web','boas-praticas-nodejs','building-production-ready',
       'cangaceiro-javascript','construindo-apis-rest','construindo-apis-testaveis',
       'creating-npm-package','data-structures-and-algorithms-in-javascript','django-de-a-a-z',
       'dominando-javascript','ecmascript-6','efficient-nodejs','elixir-do-zero','eloquent-javascript',
       'estruturas-de-dados-e-algoritmos','flask-de-a-a-z','full-stack','head-first-javascript',
       'html-5-embarque','html-e-css-projete','ios-programe','javascript-and-jquery',
       'javascript-for-modern','javascript-mastery','logica-de-programacao','mastering-mean-stack',
       'meteor-criando','modern-web-design','nodejs-aplicacoes','nodejs-complete','nodejs-handbook',
       'nodejs-para-iniciantes','o-retorno-do-cangaceiro','primeiros-passos-com-nodejs','react-js',
       'swift-programe','udemy-guide','web-api-cookbook','web-apis-em-nodejs','web-design-responsivo',
       'web-development','webapp-com-nodejs']
w5k = ['a-logica-do-jogo','agile-','ai-engineering-and','algoritmos-em-java','applied-ai-for',
       'aprenda-a-programar','armazenando-dados','automate-the-boring','better-python-code',
       'casa-do-codigo','como-descobrir','data-science-for','datas-e-horas','desbravando-java',
       'desenvolvimento-web-com-php','engenharia-de-software','entendendo-algoritmos',
       'entrega-continua','epub-componentes','epub-cucumber','epub-datas','epub-desbravando',
       'epub-practical-java','epub-protractor','epub-refatorando','epub-rspec','epub-selenium',
       'epub-spock','epub-testes','fragmentos-de','fundamentals-of-software-engineering',
       'guia-do-mestre','image-processing','implementing-reverse','introducao-a-programacao',
       'ionic-framework','jogos-2d','jornada-python','jsf-eficaz-as-melhores','kotlin-com-android',
       'lean-game-development','learning-generative-ai','low-code-development','mastering-microsoft',
       'mastering-the-it','mongodb-construa','mysql-comece','o-programador-pragmatico',
       'oauth-20','onsumindo-a-api','platform-engineering','play-framework-java',
       'postgresql-banco-de-dados','powershell','practical-java-8','programando-em-google',
       'python-escreva','python-for-devops','python-powered','react-native-desenvolvimento',
       'redes-de-computadores','refatorando-com-padroes','seguranca-em-aplicacoes-web',
       'selenium-webdriver','series-temporais','sql-crash-course','test-driven-development',
       'trilhas-python','vraptor-desenvolvimento','web-automation-with','python-simplified','python']
w6k = ['aprendendo-node','modern-full-stack','web-scraping','enterprise-architects',
       'javascript-de-alto','mongodb-construa-novas','the-ai-engineers','comunicacao-de-dados',
       'marketing-de-conteudo','big-data-tecnicas','data-science-crash','elasticsearch',
       'epub-pandas-python','inteligencia-artificial-e-chatgpt','jpa-eficaz','nosql-como-armazenar',
       'pandas-python','sistemas-de-banco-de-dados']

def detect_wave(slug):
    if slug in erp:
        return 'ERP'
    for kw in w1k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 1'
    for kw in w2k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 2'
    for kw in w3k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 3'
    for kw in w4k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 4'
    for kw in w5k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 5'
    for kw in w6k:
        if slug.startswith(kw) or kw in slug:
            return 'Onda 6'
    return 'Nao categorizado'

thin = []
thick = []
for fname in sorted(os.listdir(SKILLS_DIR)):
    if not fname.endswith('.md'):
        continue
    path = os.path.join(SKILLS_DIR, fname)
    try:
        content = open(path, 'r', encoding='utf-8', errors='replace').read()
    except:
        continue
    lines = content.count('\n')
    slug = fname[:-3]
    wave = detect_wave(slug)
    if lines < 80:
        thin.append((slug, lines, wave))
    else:
        thick.append((slug, lines, wave))

print(f'Total .md files: {len(thin)+len(thick)}')
print(f'Thin (<80L): {len(thin)}')
print(f'Thick (>=80L): {len(thick)}')
print()

by_wave = {}
for slug, ln, wave in thin:
    by_wave.setdefault(wave, []).append((slug, ln))

for wave in ['ERP', 'Onda 1', 'Onda 2', 'Onda 3', 'Onda 4', 'Onda 5', 'Onda 6', 'Nao categorizado']:
    if wave in by_wave:
        items = by_wave[wave]
        avg = sum(x[1] for x in items) // len(items)
        print(f'{wave:15s}: {len(items):3d} skills (media {avg}L)')

print()
print('=== ALL thin skills sorted by lines ===')
for slug, ln, wave in sorted(thin, key=lambda x: x[1]):
    print(f'{ln:3d}L [{wave:7s}] {slug}')
