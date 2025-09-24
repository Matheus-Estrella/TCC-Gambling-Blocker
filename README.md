# 🛑 TCC Gambling Blocker

Extensão para Google Chrome desenvolvida como parte de um Trabalho de Conclusão de Curso (TCC).  
Seu objetivo é **bloquear a influência psicológica de sites de apostas, reduzindo efeitos da ludopatia** ao reduzir estímulos visuais e auditivos.

---

## 🚀 Funcionalidades

- Bloqueio de sites de apostas configurados na lista.  
- Opções de filtro visual (blur, escala de cinza etc.).  
- Opção de silenciar o áudio de sites de apostas.  
- Interface simples para gerenciar as preferências.  
- Código-fonte aberto, permitindo ajustes e contribuições.

---

## 🖥️ Instalação no Google Chrome

1. Baixe o repositório ou o arquivo `.zip`:
git clone https://github.com/Matheus-Estrella/TCC-Gambling-Blocker.git

2. Extraia o conteúdo (se baixou em `.zip`).

3. Abra o Google Chrome e vá até:
chrome://extensions/

4. Ative o **Modo do desenvolvedor** (canto superior direito).

5. Clique em **Carregar sem compactação** e selecione, do projeto baixado, a pasta:
extension/

6. A extensão estará instalada e ativa. 🎉

---

## 📂 Estrutura do Projeto

TCC-Gambling-Blocker/
│
├── extension/ # Código-fonte da extensão
│ ├── manifest.json # Manifesto da extensão (configuração principal)
│ ├── background.ts # Script de background (gerencia bloqueio em segundo plano)
│ ├── content.ts # Script injetado nas páginas bloqueadas
│ ├── popup.html # Interface do popup da extensão
│ ├── popup.ts # Lógica do popup
│ ├── styles.css # Estilos da interface
│ └── ... # Outros utilitários
│
├── .gitignore
├── package.json # Dependências do projeto
├── tsconfig.json # Configuração do TypeScript
└── README.md # Documentação

---

## 👨‍💻 Para Desenvolvedores

Se quiser modificar o código:

1. Instale as dependências:
npm install

2. Compile o TypeScript para JavaScript:
npm run build

3. Recarregue a extensão no `chrome://extensions/`.

---
