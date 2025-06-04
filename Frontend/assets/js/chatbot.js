const form = document.querySelector('.chat-form');
const container = document.querySelector('.message-container');
const token = checkAccessTokenValidity();
const CHAT_STORAGE_KEY = 'chat_history';

document.addEventListener('DOMContentLoaded', () => loadChatHistory());

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const input = this.querySelector('.chat-input');
    const text = input.value.trim();
    if (!text) return;

    // Añade mensaje de usuario
    const userMessage = createMessageElement(text, 'user');
    container.appendChild(userMessage);
    saveMessageToHistory(text, 'user');
    input.value = '';
    scrollToBottom();

    // Placeholder de Thinking
    const loading = createMessageElement('Thinking...', 'bot');
    container.appendChild(loading);
    scrollToBottom();

    // Envia la petición a la API
    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      // Elimina el mensaje placeholder de Thinking
      container.removeChild(loading);

      // Añade mensaje de la IA
      const botMessage = createMessageElement(data.response, 'bot');
      container.appendChild(botMessage);
      saveMessageToHistory(data.response, 'bot');
      scrollToBottom();

    } catch (err) {
      container.removeChild(loading);
      const errorMessage = createMessageElement('Error connecting to the server: '+ err.message + '.', 'bot');
      container.appendChild(errorMessage);
      scrollToBottom();
      console.error(err);
    }

  });

  // Función para crear un mensaje
  function createMessageElement(text, type) {
    const msg = document.createElement('div');
    msg.className = `message ${type}-message`;
    msg.innerHTML = `
      <div class="message-content">${text}</div>
      <div class="message-time">${new Date().toLocaleTimeString([], {
        hour:'2-digit', minute:'2-digit'
      })}</div>`;
    return msg;
  }

  // Función que te lleva hasta abajo del chat
  function scrollToBottom() {
    container.scrollTop = container.scrollHeight;
  }

  // Función de guardar el historial del chat (se borra al cerrar sesión, no es para la ia, la ia no tiene historial)
  function saveMessageToHistory(text, type) {
    let history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY));
    if (!Array.isArray(history)) history = [];
    history.push({
      text, type,
      timestamp: new Date().toLocaleTimeString([], {
        hour:'2-digit', minute:'2-digit'
      })
    });
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
  }

  // Carga el chat en la interfaz
  function loadChatHistory() {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
    } catch {
      history = [];
    }
    history.forEach(msg => {
      const el = createMessageElement(msg.text, msg.type);
      container.appendChild(el);
    });
    scrollToBottom();
  }