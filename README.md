# Analisador de Transações GA4 vs Floodlight

Este projeto é uma ferramenta web para analisar e comparar dados de transações do Google Analytics 4 (GA4) e Floodlight.

## Visão Geral

A aplicação consiste em:
-   Um frontend HTML com Tailwind CSS e Chart.js, permitindo o upload de dois arquivos CSV.
-   Um backend Node.js com Express.js para lidar com o upload de arquivos e a lógica de análise.
-   A biblioteca `multer` para gerenciar uploads, `csv-parser` para processar dados CSV e `uuid` para sessões de análise.

## Funcionalidades

-   Upload de arquivos CSV do GA4 e Floodlight.
-   Análise dos arquivos para identificar transações e receita:
    -   Capturadas em ambas as plataformas.
    -   Capturadas apenas no GA4.
    -   Capturadas apenas no Floodlight.
-   **Agrupamento por Data**: Todos os resultados são agrupados por dia.
-   **Gráficos Comparativos**: Exibição de gráficos de linha para comparar transações e receita diárias.
-   **Download de Resultados**: Permite baixar as listas de IDs de transação para cada categoria (Apenas GA4, Apenas Floodlight, Ambos).
-   Feedback visual durante o processamento e em caso de erros.

## Esquema dos Arquivos CSV

Para que a análise funcione corretamente, os arquivos CSV enviados **devem conter as três colunas a seguir**.

-   **Coluna de ID da Transação**: O cabeçalho deve corresponder a `/id/i` (ex: "transactionId", "ID").
-   **Coluna de Receita**: O cabeçalho deve corresponder a `/revenue/i` (ex: "revenue", "Receita").
-   **Coluna de Data**: O cabeçalho deve corresponder a `/date/i` (ex: "date", "Data"). O formato da data deve ser um que o construtor `new Date()` do JavaScript consiga interpretar (ex: `AAAA-MM-DD`, `MM/DD/AAAA`).

**Exemplo de CSV válido:**
```csv
date,id,revenue
2023-10-26,v60020454abc,26290.90
2023-10-27,v60024392abc,22000.76
...
```

## Pré-requisitos

-   Node.js (versão 12.x ou superior recomendada)
-   npm (geralmente vem com o Node.js)

## Configuração e Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd analisador-csv-ga4-vs-floodlight
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

## Executando a Aplicação

1.  **Inicie o servidor:**
    ```bash
    node server.js
    ```

2.  Abra seu navegador e acesse: `http://localhost:3000`

## Como Usar (usuário final)

1.  Acesse a página da aplicação no seu navegador: https://louren.co.in/analisador-csv-ga4-vs-floodlight
2.  Clique no botão "Escolher arquivo" para o "Arquivo de Transações do GA4" e selecione o arquivo CSV correspondente.
3.  Clique no botão "Escolher arquivo" para o "Arquivo de Transações do Floodlight" e selecione o arquivo CSV correspondente.
4.  Clique no botão "Analisar Arquivos".
5.  Aguarde o processamento. Os resultados serão exibidos abaixo do formulário, mostrando:
    -   Número de transações e receita total capturadas em ambas as plataformas.
    -   Número de transações e receita total capturadas apenas no GA4.
    -   Número de transações e receita total capturadas apenas no Floodlight.

## Pilha de Tecnologias

-   **Backend**: Node.js, Express.js
-   **Frontend**: HTML, JavaScript (vanilla), Tailwind CSS (via CDN), Chart.js (via CDN)
-   **Processamento de CSV**: `csv-parser`
-   **Upload de Arquivos**: `multer`

## Possíveis Melhorias Futuras

-   Permitir que o usuário especifique os nomes das colunas de ID e receita.
-   Adicionar a capacidade de baixar os conjuntos de dados resultantes (apenas GA4, apenas Floodlight, ambos).
-   Implementar testes unitários e de integração.
-   Melhorar o tratamento de erros e feedback ao usuário.
-   Adicionar mais métricas de comparação (por exemplo, diferença de receita para transações comuns).
-   Incluir o campo data na análise e criar gráficos de linha para comparação visual.