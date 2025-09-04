# 🤖 Detector de Fake News - Desafio 4.0

![Demonstração do Chatbot](https://i.imgur.com/gO0tH8a.gif)

## 📖 Sobre o Projeto

Este é um protótipo funcional de uma ferramenta de análise de notícias, desenvolvido como solução para o **Desafio 4.0** da disciplina de **Estrutura de Dados** do Centro Universitário UNDB.

A aplicação utiliza uma interface de chatbot interativa onde o usuário pode submeter o título, o texto e a fonte de uma notícia. O sistema então processa essas informações através de um backend inteligente em Python, que realiza uma análise ponderada e retorna uma classificação sobre o potencial da notícia ser fake news.

---

## ✨ Funcionalidades Principais

* **Interface de Chatbot**: Uma conversa guiada para coletar os dados da notícia de forma amigável e intuitiva.
* **Análise Ponderada**: O backend utiliza um sistema de pontuação com pesos diferentes para palavras-chave, reputação de fontes e padrões textuais (como títulos em caixa alta e excesso de pontuação).
* **Validação de Entradas**: O sistema possui múltiplas regras para rejeitar entradas inválidas, muito curtas ou sem sentido (gibberish), retornando mensagens de erro específicas.
* **Resultados Dinâmicos**: A resposta da análise é apresentada com cores, detalhes e um GIF correspondente à classificação (Confiável, Suspeita ou Altamente Suspeita).

---

## ⚙️ Como o Projeto Funciona

A aplicação segue um fluxo de trabalho cliente-servidor bem definido para analisar cada notícia:

1.  **Coleta de Dados (Frontend - React)**: O usuário interage com o chatbot, que solicita, passo a passo, o **título**, o **texto** e a **fonte** da notícia a ser analisada.
2.  **Requisição via API (Comunicação)**: Com todos os dados em mãos, o frontend envia um objeto JSON para o backend através de uma requisição `POST` para o endpoint `/analisar`.
3.  **Processamento (Backend - Python/Flask)**: O servidor recebe os dados e executa uma sequência de tarefas:
    * **Validação Rigorosa**: Primeiro, uma função de validação verifica se os dados são aceitáveis (campos não estão vazios, textos não são curtos demais ou aleatórios, URL da fonte é válida, etc.). Se algum critério falhar, ele retorna uma mensagem de erro específica imediatamente.
    * **Análise Ponderada**: Se os dados forem válidos, o sistema calcula uma **pontuação de suspeita**. Ele soma e subtrai pontos com base em vários fatores, como a reputação da fonte, a presença de palavras-chave alarmistas e padrões de sensacionalismo no título.
    * **Classificação Final**: Com base na pontuação total, a notícia é classificada como `PROVAVELMENTE CONFIÁVEL`, `SUSPEITA` ou `ALTAMENTE SUSPEITA`.
4.  **Exibição do Resultado (Frontend - React)**: O frontend recebe a resposta do backend e a exibe para o usuário de forma organizada, mostrando a classificação, os detalhes da análise e um GIF que representa visualmente o resultado.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura cliente-servidor:

* **Frontend (Cliente):**
    * [**React.js**](https://reactjs.org/): Biblioteca JavaScript para construir a interface de usuário.
    * **CSS-in-JS**: Para a estilização dos componentes.
* **Backend (Servidor):**
    * [**Python**](https://www.python.org/): Linguagem principal para a lógica de análise.
    * [**Flask**](https://flask.palletsprojects.com/): Micro-framework para criar a API que conecta o frontend e o backend.
    * **Estruturas de Dados**: Uso intensivo de **Dicionários** para a pontuação ponderada e **Conjuntos** para buscas eficientes, conforme solicitado no desafio.

---

## 🚀 Como Executar o Projeto Localmente

Para rodar a aplicação na sua máquina, você precisará ter o **Node.js** e o **Python** instalados. Siga os passos abaixo:

### 1. Configurando o Backend (Servidor Python)

Primeiro, vamos iniciar o "cérebro" da aplicação.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. Crie e ative um ambiente virtual
python -m venv venv
./venv/Scripts/activate

# 3. Instale as dependências necessárias
pip install Flask Flask-CORS

# 4. Inicie o servidor Flask
flask --app app.py run
