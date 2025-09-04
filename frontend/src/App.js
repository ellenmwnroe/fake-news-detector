import React, { useState, useEffect, useRef } from 'react';

// --- Estilos CSS para a interface ---
const styles = {
  botAvatarDiv: { width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#4A5568', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 },
  botAvatarSvg: { height: '1.5rem', width: '1.5rem' },
  sendIconSvg: { height: '1.5rem', width: '1.5rem' },
  appContainer: { background: 'linear-gradient(180deg, #0d084bff 0%, #3441b1ff 100%)', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' },
  chatWindow: { backgroundColor: '#1A202C', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: '0.5rem', width: '100%', maxWidth: '42rem', height: '90vh', display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#2D3748', padding: '1rem', color: 'white', textAlign: 'center', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' },
  headerTitle: { fontSize: '1.25rem', fontWeight: '600', margin: '0' },
  headerSubtitle: { fontSize: '0.875rem', color: '#A0AEC0', margin: '4px 0 0 0' },
  headerCredits: { fontSize: '0.75rem', color: '#718096', margin: '8px 0 0 0', fontStyle: 'italic' },
  chatBody: { flex: '1 1 0%', padding: '1.5rem', overflowY: 'auto' },
  messageContainerUser: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', justifyContent: 'flex-end' },
  messageContainerBot: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  messageBubble: { maxWidth: '80%', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' },
  userBubble: { backgroundColor: '#3B82F6', borderBottomRightRadius: '0' },
  botBubble: { backgroundColor: '#374151', borderBottomLeftRadius: '0' },
  analyzingBubble: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  analyzingDot: { width: '0.5rem', height: '0.5rem', backgroundColor: '#60A5FA', borderRadius: '9999px' },
  restartButtonContainer: { display: 'flex', justifyContent: 'center', marginTop: '1rem' },
  restartButton: { backgroundColor: '#3B82F6', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer' },
  form: { padding: '1rem', backgroundColor: '#2D3748', borderTop: '1px solid #4A5568', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  input: { flex: '1 1 0%', backgroundColor: '#4A5568', border: 'none', borderRadius: '9999px', padding: '0.5rem 1rem', color: 'white', outline: 'none' },
  submitButton: { backgroundColor: '#3B82F6', color: 'white', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', display: 'flex' },
  resultGif: { maxWidth: '250px', width: '100%', borderRadius: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' },
  resultBubble: { animation: 'fadeIn 0.5s ease-in-out' }
};

// --- Ícones e Componentes Auxiliares ---
const BotAvatar = () => (
  <div style={styles.botAvatarDiv}>
    <svg xmlns="http://www.w3.org/2000/svg" style={styles.botAvatarSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
  </div>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={styles.sendIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
);

// --- Componente para Exibir o Resultado da Análise com GIF ---
const AnalysisResult = ({ data }) => {
  let gifUrl = '';
  let classificationStyle = {};

  switch (data.classificacao) {
    case 'PROVAVELMENTE CONFIÁVEL':
      gifUrl = 'https://media.giphy.com/media/d9ZKe69R3pAaA/giphy.gif';
      classificationStyle = { color: '#48BB78', fontWeight: 'bold' };
      break;
    case 'SUSPEITA':
      gifUrl = 'https://media.giphy.com/media/ANbD1CCdA3iI8/giphy.gif';
      classificationStyle = { color: '#F6E05E', fontWeight: 'bold' };
      break;
    case 'ALTAMENTE SUSPEITA':
      gifUrl = 'https://media.giphy.com/media/T3QdUTzVq13eURm2Q2/giphy.gif';
      classificationStyle = { color: '#F56565', fontWeight: 'bold' };
      break;
    default:
      gifUrl = '';
  }

  const resultText = `**Pontuação de Suspeita:** ${data.pontuacao}\n\n` +
    (data.detalhes && data.detalhes.length > 0 ? `**Detalhes:**\n` + data.detalhes.map(d => `- ${d}`).join('\n') : '');

  return (
    <div>
      <p><strong>Classificação: </strong><span style={classificationStyle}>{data.classificacao}</span></p>
      {gifUrl && <img src={gifUrl} alt="Resultado da análise" style={styles.resultGif} />}
      {resultText.split('\n').map((line, i) => (
        <span key={i} style={{ display: 'block', whiteSpace: 'pre-wrap' }}>
          {line.startsWith('**') ? <strong>{line.replaceAll('**', '')}</strong> : line}
        </span>
      ))}
    </div>
  );
};

// --- Componente Principal ---
function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState('start');
  const [newsData, setNewsData] = useState({ titulo: '', texto: '', fonte: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatEndRef = useRef(null);
  const effectRan = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  useEffect(() => {
    if (step === 'start' && effectRan.current === false) {
      addBotMessage("Olá! Sou o Detector de Fake News. Vamos analisar uma notícia? Por favor, me envie o TÍTULO da matéria.");
      setStep('awaiting_title');
      return () => { effectRan.current = true; };
    }
  }, [step]);

  const addBotMessage = (textOrComponent) => {
    setMessages(prev => [...prev, { sender: 'bot', content: textOrComponent }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', content: text }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    addUserMessage(userText);
    setInputValue('');

    switch (step) {
      case 'awaiting_title':
        setNewsData({ ...newsData, titulo: userText });
        addBotMessage("Entendi. Agora, por favor, me envie o TEXTO completo da notícia.");
        setStep('awaiting_text');
        break;
      case 'awaiting_text':
        setNewsData({ ...newsData, texto: userText });
        addBotMessage("Ótimo. Para finalizar, qual é a FONTE (o site) da notícia? Ex: g1.globo.com");
        setStep('awaiting_source');
        break;
      case 'awaiting_source':
        const finalNewsData = { ...newsData, fonte: userText };
        setNewsData(finalNewsData);
        setStep('analyzing');
        setIsAnalyzing(true);
        
        setTimeout(() => {
          fetch('http://127.0.0.1:5000/analisar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalNewsData),
          })
          .then(response => {
            if (!response.ok) {
              return response.json().then(errorData => { throw errorData; });
            }
            return response.json();
          })
          .then(presentAnalysis)
          .catch(handleServerError);
        }, 2000);
        break;
      default:
        break;
    }
  };
  
  const presentAnalysis = (data) => {
    addBotMessage(`Análise concluída! Aqui está o que encontrei:`);
    addBotMessage(<AnalysisResult data={data} />);
    setIsAnalyzing(false);
    setStep('finished');
  };

  const handleServerError = (error) => {
    if (error.erro) {
      const errorMessage = (
        <div>
          <p><strong>Esta notícia não é válida.</strong></p>
          <p>{error.erro}</p>
          <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2hxc2hueDZ0aGFsZ3RtMzBtODZiMTkyc3BrZjFyZ25vbDhnanJqcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1zSz5MVw4zKg0/giphy.gif" alt="Erro" style={styles.resultGif} />
        </div>
      );
      addBotMessage(errorMessage);
    } else {
      console.error('Erro de conexão:', error);
      addBotMessage("Desculpe, tive um problema para me conectar com meu cérebro (o servidor).");
    }
    setIsAnalyzing(false);
    setStep('finished');
  };

  const restartConversation = () => {
    setMessages([]);
    setNewsData({ titulo: '', texto: '', fonte: '' });
    effectRan.current = false;
    setStep('start');
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.chatWindow}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Detector de Fake News</h1>
          <p style={styles.headerSubtitle}>Desafio 4.0 - Estrutura de Dados</p>
          <p style={styles.headerCredits}>Feito com ❤️ por: elle, babi, telma, rodrigo, davi & daniel</p>
        </header>

        <div style={styles.chatBody}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.sender === 'user' ? styles.messageContainerUser : styles.messageContainerBot}>
                {msg.sender === 'bot' && <BotAvatar />}
                <div style={{ ...styles.messageBubble, ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble), ...(typeof msg.content !== 'string' ? styles.resultBubble : {}) }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isAnalyzing && (
              <div style={styles.messageContainerBot}>
                <BotAvatar />
                <div style={{ ...styles.messageBubble, ...styles.botBubble, ...styles.analyzingBubble }}>
                    <span>Analisando</span>
                    <div style={{...styles.analyzingDot, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '75ms' }}></div>
                    <div style={{...styles.analyzingDot, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '150ms' }}></div>
                    <div style={{...styles.analyzingDot, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            
            {step === 'finished' && (
               <div style={styles.restartButtonContainer}>
                  <button onClick={restartConversation} style={styles.restartButton}>
                    Analisar Outra Notícia
                  </button>
               </div>
            )}
          </div>
          <div ref={chatEndRef} />
        </div>

        {step !== 'finished' && step !== 'analyzing' && (
          <form onSubmit={handleSendMessage} style={styles.form}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua resposta aqui..."
              style={styles.input}
              autoFocus
            />
            <button type="submit" style={styles.submitButton}>
              <SendIcon />
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}

export default App;

