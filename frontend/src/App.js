import React, { useState } from 'react';
import './App.css';

function App() {
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [fonte, setFonte] = useState('');
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setCarregando(true);
    setResultado(null);

    const noticia = { titulo, texto, fonte };

    fetch('http://127.0.0.1:5000/analisar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticia),
    })
    .then(response => response.json())
    .then(data => {
      setResultado(data);
      setCarregando(false);
    })
    .catch(error => {
      console.error('Erro ao conectar com o backend:', error);
      setCarregando(false);
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Detector de Fake News</h1>
        <p>Implementação do Desafio 4.0 - Estrutura de Dados</p>
      </header>
      <main className="App-main">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título da Notícia</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Texto da Notícia</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Fonte (URL do site)</label>
            <input type="text" value={fonte} onChange={(e) => setFonte(e.target.value)} required />
          </div>
          <button type="submit" disabled={carregando}>
            {carregando ? 'Analisando...' : 'Analisar Notícia'}
          </button>
        </form>

        {resultado && (
          <div className="resultado">
            <h2>Resultado da Análise</h2>
            <p><strong>Classificação:</strong> {resultado.classificacao}</p>
            <p><strong>Pontuação de Suspeita:</strong> {resultado.pontuacao}</p>
            {resultado.detalhes && resultado.detalhes.length > 0 && (
              <div>
                <strong>Detalhes:</strong>
                <ul>
                  {resultado.detalhes.map((detalhe, index) => (
                    <li key={index}>{detalhe}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;