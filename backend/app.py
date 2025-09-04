from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# --- BASE DE CONHECIMENTO COM PONTUAÇÃO PONDERADA ---

# Dicionário de fontes e sua reputação. 
# Scores positivos = suspeita. Scores negativos = confiança.
FONTES_REPUTACAO = {
    # Fontes não confiáveis (score alto de suspeita)
    "www.noticia-inventada.com": 10,
    "blogdodesconhecido.net": 8,
    "zapzap-news.com": 10,
    "fakenewsbrasil.org": 10,
    "noticiasduvidosas.info": 9,
    # Fontes de sátira/humor que podem ser confundidas
    "sensacionalista.com.br": 5, 
    # Fontes confiáveis (score negativo, reduz a suspeita)
    "www.bbc.com": -10,
    "www.cnn.com": -10,
    "www.nytimes.com": -10,
    "g1.globo.com": -10,
    "bbc.com": -10,
    "folha.uol.com.br": -10,
    "estadao.com.br": -10,
    "oglobo.globo.com": -10,
}

# Dicionário de palavras-chave e seu "peso" de suspeita
PALAVRAS_CHAVE_SUSPEITAS = {
    "inacreditável": 3,
    "chocante": 3,
    "segredo revelado": 5,
    "milagrosa": 4,
    "cientistas confirmam": 4,
    "especialistas odeiam": 5,
    "urgente": 2,
    "imperdível": 2,
    "clique aqui": 3,
    "compartilhe antes que apaguem": 8,
}

# Termos que indicam sensacionalismo ou alarmismo
TERMOS_ALARMISTAS = [
    "cuidado", "perigo", "alerta", "não acredite", "grande farsa"
]

# --- LÓGICA DE ANÁLISE REFINADA ---

def _eh_gibberish(texto):
    """Verifica se um texto parece ser coisa aleatória tipo dfjfsufhsddf."""
    texto = texto.lower().strip()
    
    if len(texto) < 10:
        return False
        
    if re.search(r'[bcdfghjklmnpqrstvwxyz]{7,}', texto):
        return True
        
    vogais = sum(1 for char in texto if char in 'aeiou')
    letras = sum(1 for char in texto if char.isalpha())
    
    if letras == 0 and len(texto) > 5:
        return True

    if letras > 10 and (vogais / letras) < 0.15:
        return True

    if ' ' not in texto and len(texto) > 25:
        return True
        
    return False

def _analisar_fonte(fonte_url, detalhes):
    """Analisa a reputação da fonte e retorna sua pontuação."""
    fonte_normalizada = fonte_url.lower().replace("http://", "").replace("https://", "")
    for dominio, score in FONTES_REPUTACAO.items():
        if dominio in fonte_normalizada:
            if score > 0:
                detalhes.append(f"A fonte '{fonte_url}' é considerada pouco confiável.")
            else:
                detalhes.append(f"A fonte '{fonte_url}' é considerada confiável.")
            return score
    detalhes.append("A fonte da notícia não é amplamente conhecida.")
    return 1

def _analisar_titulo(titulo, detalhes):
    """Analisa padrões no título e retorna uma pontuação."""
    score = 0
    if titulo.isupper() and len(titulo) > 20:
        score += 3
        detalhes.append("O título está todo em letras maiúsculas, um padrão comum em clickbaits.")
    
    if len(re.findall(r'!!|\?\?', titulo)) > 0:
        score += 2
        detalhes.append("O título usa excesso de pontuação (!!, ??), indicando sensacionalismo.")
        
    return score

def _analisar_conteudo(texto, detalhes):
    """Analisa o texto em busca de palavras-chave e padrões."""
    score = 0
    texto_lower = texto.lower()
    
    for palavra, peso in PALAVRAS_CHAVE_SUSPEITAS.items():
        if palavra in texto_lower:
            score += peso
            detalhes.append(f"Encontrou o termo suspeito: '{palavra}' (Peso: {peso}).")
            
    for termo in TERMOS_ALARMISTAS:
        if termo in texto_lower:
            score += 2
            detalhes.append(f"Encontrou o termo alarmista: '{termo}'.")
            
    return score


def analisar_logica_noticia(noticia):
    """Função principal que orquestra a análise da notícia."""
    detalhes = []
    pontuacao_total = 0

    titulo = noticia.get("titulo", "")
    texto = noticia.get("texto", "")
    fonte = noticia.get("fonte", "")

    pontuacao_total += _analisar_fonte(fonte, detalhes)
    pontuacao_total += _analisar_titulo(titulo, detalhes)
    pontuacao_total += _analisar_conteudo(titulo + " " + texto, detalhes)

    if pontuacao_total >= 10:
        classificacao = "ALTAMENTE SUSPEITA"
    elif pontuacao_total >= 5:
        classificacao = "SUSPEITA"
    else:
        classificacao = "PROVAVELMENTE CONFIÁVEL"

    return {
        "pontuacao": pontuacao_total,
        "classificacao": classificacao,
        "detalhes": detalhes
    }

# --- ROTA DA API (Endpoint) ---
@app.route("/analisar", methods=["POST"])
def analisar_endpoint():
    dados = request.get_json()
    
    if not dados or "titulo" not in dados or "texto" not in dados or "fonte" not in dados:
        return jsonify({"erro": "Dados incompletos"}), 400
        
    titulo = dados.get("titulo", "")
    texto = dados.get("texto", "")
    fonte = dados.get("fonte", "")

    # Validação de texto sem sentido (gibberish) para título e texto
    if _eh_gibberish(titulo) or _eh_gibberish(texto):
        return jsonify({"erro": "O título ou texto parece ser inválido. Por favor, insira uma notícia real."}), 400

    # NOVO: Validação específica para a fonte
    if ' ' in fonte or '.' not in fonte:
         return jsonify({"erro": "A fonte (URL) parece ser inválida. Verifique se digitou o site corretamente."}), 400

    resultado = analisar_logica_noticia(dados)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(debug=True)

