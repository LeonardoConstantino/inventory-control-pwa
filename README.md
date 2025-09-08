# Controle de Inventário PWA

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green.svg)

### [preview do projeto](https://leonardoconstantino.github.io/inventory-control-pwa/)

Uma aplicação web progressiva (PWA) moderna e mobile-first para controle de inventário. Desenvolvida para ser simples, rápida e funcional, permitindo que o usuário gerencie itens, controle entradas e saídas de estoque, e visualize relatórios diretamente do navegador, com total capacidade offline.

O projeto utiliza **IndexedDB** para armazenamento de dados no lado do cliente, garantindo que todas as informações fiquem seguras no seu dispositivo e acessíveis mesmo sem conexão com a internet. A interface é limpa, responsiva e construída com as tecnologias mais recentes do ecossistema React.

---

## 📸 Telas da Aplicação

| Inventário Principal | Detalhes do Item | Histórico de Movimentações |
| :---: | :---: | :---: |
|  |  |  |
| **Relatórios** | **Adicionar Novo Item** | **Configurações** |
|  |  |  |

---

## ✨ Funcionalidades

*   **Gestão de Itens (CRUD)**: Adicione, edite e remova itens com informações como nome, descrição, preço, e foto.
*   **Controle de Estoque**: Registre facilmente entradas (adições) e saídas (remoções) de estoque para cada item.
*   **Histórico Detalhado**: Visualize um log completo de todas as movimentações, com filtros por item e tipo de movimentação.
*   **Relatórios e Insights**: Um painel com uma visão geral do seu inventário, incluindo valor total em estoque, número de itens, e os itens mais movimentados.
*   **Busca Rápida**: Encontre itens no seu inventário instantaneamente.
*   **Persistência de Dados 100% Offline**: Todos os dados são salvos localmente no navegador usando IndexedDB.
*   **Capacidade PWA**: Instale a aplicação na tela inicial do seu celular ou desktop para uma experiência nativa.
*   **Exportação e Importação de Dados**: Faça backup de todo o seu inventário e configurações em um arquivo JSON e restaure-o a qualquer momento.
*   **Configurações Flexíveis**: Personalize a aplicação com temas (claro/escuro/sistema), defina um estoque mínimo padrão e oculte campos desnecessários.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: [React](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Armazenamento de Dados**: IndexedDB (via custom hook `useIndexedDB`)
*   **Armazenamento de Configurações**: LocalStorage (via custom hook `useLocalStorage`)
*   **Estilização**: CSS puro com Flexbox e CSS Grid para responsividade.
*   **PWA**: Service Worker e Web App Manifest.

---

## 🚀 Como Executar

Para executar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/LeonardoConstantino/inventory-control-pwa.git
    cd inventory-control-pwa
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    # ou
    yarn install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```sh
    npm run dev
    # ou
    yarn dev
    ```

4.  Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no terminal).

---

## 📁 Estrutura do Projeto

O projeto é organizado de forma modular para facilitar a manutenção e a escalabilidade.

```
inventory-control-pwa/
├── src/
│   ├── components/            # Componentes reutilizáveis
│   │   ├── BottomNav.tsx      # Navegação inferior
│   │   ├── CameraCapture.tsx  # Captura de imagem
│   │   ├── Modal.tsx          # Componente de modal
│   │   └── Toast.tsx          # Notificações
│   ├── contexts/              # Contextos React
│   │   └── ToastContext.tsx   # Gerenciamento de toasts
│   ├── hooks/                 # Custom hooks
│   │   ├── useIndexedDB.ts    # Hook para IndexedDB
│   │   └── useLocalStorage.ts # Hook para LocalStorage
│   ├── pages/                 # Páginas da aplicação
│   │   ├── InventoryPage.tsx  # Tela principal
│   │   ├── ItemFormPage.tsx   # Formulário de item
│   │   ├── HistoryPage.tsx    # Histórico
│   │   ├── ReportPage.tsx     # Relatórios
│   │   └── SettingsPage.tsx   # Configurações
│   ├── types.ts               # Definições de tipos
│   ├── constants.ts           # Constantes da aplicação
│   └── App.tsx                # Componente principal
├── public/
│   ├── manifest.json          # Manifesto PWA
│   └── sw.js                  # Service Worker
├── dist/                      # Build de produção
├── package.json               # Dependências e scripts
└── vite.config.ts             # Configuração do Vite
```

---

## 🤝 Como Contribuir

Contribuições são bem-vindas! Se você tem alguma ideia para melhorar a aplicação, sinta-se à vontade para seguir estes passos:

1.  Faça um **Fork** do projeto.
2.  Crie uma nova **Branch** (`git checkout -b feature/minha-feature`).
3.  Faça **Commit** de suas alterações (`git commit -m 'Adiciona minha-feature'`).
4.  Faça **Push** para a Branch (`git push origin feature/minha-feature`).
5.  Abra um **Pull Request**.

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.