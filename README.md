# Analisador de Transações GA4 vs Floodlight

Este projeto é uma ferramenta web simples para analisar e comparar dados de transações de duas fontes: Google Analytics 4 (GA4) e Floodlight. Ele permite que os usuários façam upload de arquivos CSV de cada plataforma e visualizem um resumo das transações que são comuns a ambas, exclusivas do GA4 ou exclusivas do Floodlight, juntamente com a receita total para cada categoria.

## Visão Geral

A aplicação consiste em:
-   Um frontend HTML simples com Tailwind CSS para estilização, permitindo o upload de dois arquivos CSV.
-   Um backend Node.js com Express.js para lidar com o upload de arquivos e a lógica de análise.
-   A biblioteca `multer` para gerenciar uploads de arquivos e `csv-parser` para processar os dados CSV.

## Funcionalidades

-   Upload de arquivos CSV para dados de transações do GA4.
-   Upload de arquivos CSV para dados de transações do Floodlight.
-   Análise dos arquivos para identificar:
    -   Transações e receita capturadas em ambas as plataformas.
    -   Transações e receita capturadas apenas no GA4.
    -   Transações e receita capturadas apenas no Floodlight.
-   Exibição dos resultados de forma clara na interface do usuário.
-   Feedback visual durante o processamento e em caso de erros.

## Esquema dos Arquivos CSV

Para que a análise funcione corretamente, os arquivos CSV enviados devem seguir um esquema específico para as colunas de ID da transação e receita. A aplicação é flexível em relação aos nomes exatos dos cabeçalhos, mas espera que as colunas relevantes estejam presentes.

### Arquivo CSV do GA4

O arquivo CSV do GA4 deve conter pelo menos duas colunas: uma para o ID da transação e outra para a receita.

-   **Coluna de ID da Transação**:
    -   Deve ser a primeira coluna (índice 0).
    -   Ou, o cabeçalho da coluna deve corresponder à expressão regular `/transaction.?Id/i` (por exemplo, "transactionId", "transaction Id", "Transaction ID", etc., case-insensitive).
-   **Coluna de Receita**:
    -   Deve ser a segunda coluna (índice 1).
    -   Ou, o cabeçalho da coluna deve corresponder à expressão regular `/revenue/i` (por exemplo, "revenue", "Revenue", etc., case-insensitive).
    -   Os valores de receita devem ser numéricos (serão convertidos para `float`).

**Exemplo de `ga4.csv`:**
```csv
id,revenue
v60020454abc,26290.90
v60024392abc,22000.76
...
```
ou
```csv
Transaction ID,Transaction Revenue
v60020454abc,26290.90
v60024392abc,22000.76
...
```

### Arquivo CSV do Floodlight

Similarmente, o arquivo CSV do Floodlight deve conter pelo menos duas colunas: uma para o ID da transação e outra para a receita.

-   **Coluna de ID da Transação**:
    -   Deve ser a primeira coluna (índice 0).
    -   Ou, o cabeçalho da coluna deve corresponder à expressão regular `/transaction.?id|id/i` (por exemplo, "transaction_id", "transaction id", "id", "ID", etc., case-insensitive).
-   **Coluna de Receita**:
    -   Deve ser a segunda coluna (índice 1).
    -   Ou, o cabeçalho da coluna deve corresponder à expressão regular `/revenue/i` (por exemplo, "revenue", "Revenue", etc., case-insensitive).
    -   Os valores de receita devem ser numéricos (serão convertidos para `float`).

**Exemplo de `flood.csv`:**
```csv
id,revenue
v60020454abc,26290.90
v60024392abc,22000.76
...
```
ou
```csv
TransactionId,Revenue
v60020454abc,26290.90
v60024392abc,22000.76
...
```

**Nota:** Quaisquer outras colunas nos arquivos CSV serão ignoradas pela aplicação. Se uma linha não contiver um ID ou receita válidos, a aplicação não funciona.

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

## Executando a Aplicação (deploy)

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
-   **Frontend**: HTML, JavaScript (vanilla), Tailwind CSS (via CDN)
-   **Processamento de CSV**: `csv-parser`
-   **Upload de Arquivos**: `multer`

## Possíveis Melhorias Futuras

-   Permitir que o usuário especifique os nomes das colunas de ID e receita.
-   Adicionar a capacidade de baixar os conjuntos de dados resultantes (apenas GA4, apenas Floodlight, ambos).
-   Implementar testes unitários e de integração.
-   Melhorar o tratamento de erros e feedback ao usuário.
-   Adicionar mais métricas de comparação (por exemplo, diferença de receita para transações comuns).
-   Incluir o campo data na análise e criar gráficos de linha para comparação visual.