from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

PALAVRAS_CHAVE_SUSPEITAS = {
    "urgente", "imperdível", "cientistas confirmam", "inacreditável", 
    "chocante", "segredo revelado", "clique aqui", "milagrosa"
}
FONTES_NAO_CONFIAVEIS = [
    "www.noticia-inventada.com", 
    "blogdodesconhecido.net", 
    "zapzap-news.com"
]

def analisar_logica_noticia(noticia):
    pontuacao_suspeita = 0
    analise_detalhada = []
    texto_completo = (noticia.get("titulo", "") + " " + noticia.get("texto", "")).lower()

    for palavra in PALAVRAS_CHAVE_SUSPEITAS:
        if palavra in texto_completo:
            pontuacao_suspeita += 1
            analise_detalhada.append(f"Encontrou a palavra-chave suspeita: '{palavra}'")

    if noticia.get("fonte", "").lower() in FONTES_NAO_CONFIAVEIS:
        pontuacao_suspeita += 5
        analise_detalhada.append(f"A fonte '{noticia.get('fonte')}' não é confiável.")

    if texto_completo.count("!") > 2:
        pontuacao_suspeita += 1
        analise_detalhada.append("Detectou excesso de pontos de exclamação (!!!).")

    if noticia.get("titulo", "").isupper() and len(noticia.get("titulo", "")) > 10:
         pontuacao_suspeita += 1
         analise_detalhada.append("O título está todo em letras maiúsculas.")

    if pontuacao_suspeita >= 5:
        classificacao = "ALTAMENTE SUSPEITA"
    elif pontuacao_suspeita >= 2:
        classificacao = "SUSPEITA"
    else:
        classificacao = "PROVAVELMENTE CONFIÁVEL"

    return {
        "pontuacao": pontuacao_suspeita,
        "classificacao": classificacao,
        "detalhes": analise_detalhada
    }

@app.route("/analisar", methods=["POST"])
def analisar_endpoint():
    dados = request.get_json()
    if not dados or "titulo" not in dados or "texto" not in dados:
        return jsonify({"erro": "Dados incompletos"}), 400
    resultado = analisar_logica_noticia(dados)
    return jsonify(resultado)

if __name__ == "__main__":
    app.run(debug=True)