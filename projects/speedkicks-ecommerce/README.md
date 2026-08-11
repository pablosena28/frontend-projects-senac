# SpeedKicks — E-commerce de Tênis

Projeto front-end de uma loja virtual de tênis desenvolvido durante a formação em Programação Front-End no SENAC.

A aplicação foi construída com **HTML5, CSS3 e JavaScript puro**, com foco em manipulação do DOM, gerenciamento de estado no navegador, formulários, responsividade e organização de código.

## Funcionalidades

- catálogo de produtos gerado a partir de uma fonte única no JavaScript;
- carrinho lateral com abertura imediata ao adicionar um produto;
- aumento, redução e remoção de itens;
- cálculo automático de quantidade e valor total;
- persistência do carrinho com `localStorage`;
- cadastro demonstrativo com e-mail, senha e CEP;
- consulta de endereço com ViaCEP;
- perfil local com dados básicos do usuário;
- checkout demonstrativo;
- formulário de contato com validação;
- layout responsivo;
- recursos básicos de acessibilidade.

## Organização do carrinho

As alterações do carrinho passam por uma única rotina de atualização. O fluxo é:

1. atualizar o estado em memória;
2. persistir os dados no `localStorage`;
3. renderizar novamente a interface.

Essa abordagem evita referências antigas no DOM e mantém a interface sincronizada ao adicionar ou remover produtos.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+
- LocalStorage
- Fetch API
- ViaCEP

## Estrutura

```text
speedkicks-ecommerce/
├── assets/
│   ├── airboost-max.jpg
│   ├── flexfit-ultra.jpg
│   └── speedrunner-pro.jpg
├── index.html
├── styles.css
├── script.js
├── README.md
└── .gitignore
```

## Como executar

O projeto não possui dependências nem etapa de compilação.

Clone o repositório e execute um servidor local na raiz do portfólio. Para abrir somente este projeto, acesse a pasta `projects/speedkicks-ecommerce` pelo navegador.

Exemplo com Python:

```bash
python -m http.server 8000
```

## Segurança

Este projeto é exclusivamente front-end e tem finalidade demonstrativa. A senha digitada no cadastro é validada, mas **não é armazenada**. Um fluxo real de autenticação deve utilizar backend, HTTPS, banco de dados, hash de senha e validação no servidor.

## Aprendizados demonstrados

- manipulação e renderização dinâmica do DOM;
- delegação de eventos;
- gerenciamento de estado no cliente;
- persistência de dados locais;
- consumo de API externa;
- validação de formulários;
- construção de interfaces responsivas;
- separação entre estrutura, estilo e comportamento.

## Autor

Desenvolvido por **Pablo Sena** como projeto de portfólio do curso de Programação Front-End do SENAC.
