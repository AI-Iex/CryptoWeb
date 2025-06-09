document.addEventListener('DOMContentLoaded', () => {

  // Validación de email
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validación de longitud mínima de contraseña
  const checkPasswordLength = password => password.length >= 6;

  // Estilo temporal de error en campos de formulario
  const applyTempErrorStyle = field => {
    field.classList.add('form-style-error');
    setTimeout(() => field.classList.remove('form-style-error'), 8000);
  };

  // Mostrar mensaje de error en pantalla
  const showError = (element, message) => {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => element.style.display = 'none', 8000);
  };

  // Crear elementos donde aparecerán los mensajes de error
  const createErrorElement = (buttonId) => {
    const button = document.getElementById(buttonId);
    const error = document.createElement('div');
    error.className = 'error-message-login';
    error.style.display = 'none';
    button.parentNode.insertBefore(error, button.nextSibling);
    return error;
  };

  const loginError = createErrorElement('Login_btn');
  const registerError = createErrorElement('Register_btn');

  // Referencias a los divs de estado que ya has colocado en el HTML
  const loginStatus = document.getElementById('loginStatus');
  const registerStatus = document.getElementById('registerStatus');

  // ============================
  // CAMBIO ENTRE LOGIN Y REGISTRO
  // ============================

  document.querySelectorAll('.tab-switch span').forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const checkbox = document.getElementById('reg-log');
      checkbox.checked = index === 1; // 0 = Login, 1 = Registro
    });
  });

  // ============================
  // EVENTO DE LOGIN
  // ============================

  document.getElementById('Login_btn').addEventListener('click', async (e) => {
    e.preventDefault();

    // Ocultar mensajes previos
    loginError.style.display = 'none';
    loginStatus.style.display = 'none';

    const emailField = document.getElementById('login_email');
    const passField = document.getElementById('login_password');
    let errors = [];

    if (!validateEmail(emailField.value)) {
      applyTempErrorStyle(emailField);
      errors.push('Invalid Email Format');
    }
    if (!checkPasswordLength(passField.value)) {
      applyTempErrorStyle(passField);
      errors.push('The password must be at least 6 characters long');
    }
    if (errors.length > 0) {
      showError(loginError, errors.join(' • '));
      return;
    }

    // Mostrar mensaje de espera
    loginStatus.textContent = '⏳ Waiting for the server...';
    loginStatus.style.display = 'block';

    const serverReady = await waitForServer();
    if (!serverReady) {
      showError(loginError, '⚠️ Server did not respond after several attempts.');
      loginStatus.style.display = 'none';
      return;
    }

    loginStatus.textContent = '🔐 Logging in...';

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: emailField.value,
        password: passField.value
      });

      const tokenData = {
        data: res.data.access_token,
        timestamp: Date.now()
      };
      localStorage.setItem('access_token', JSON.stringify(tokenData));
      window.location.href = '../index.html';

    } catch (err) {
      let msg = err.message;
      if (err.response && err.response.status === 401) {
        msg = err.response.data.detail || msg;
      }
      showError(loginError, msg);
      applyTempErrorStyle(emailField);
      applyTempErrorStyle(passField);

    } finally {
      loginStatus.style.display = 'none';
    }
  });

  // ============================
  // EVENTO DE REGISTRO
  // ============================

  document.getElementById('Register_btn').addEventListener('click', async (e) => {
    e.preventDefault();

    // Ocultar mensajes previos
    registerError.style.display = 'none';
    registerStatus.style.display = 'none';

    const nameField = document.getElementById('register_name');
    const emailField = document.getElementById('register_email');
    const passField = document.getElementById('register_password');
    const confirmField = document.getElementById('register_confirm');
    let errors = [];

    if (!nameField.value.trim()) {
      applyTempErrorStyle(nameField);
      errors.push('The name is mandatory');
    }
    if (!validateEmail(emailField.value)) {
      applyTempErrorStyle(emailField);
      errors.push('Invalid Email Format');
    }
    if (!checkPasswordLength(passField.value)) {
      applyTempErrorStyle(passField);
      errors.push('The password must be at least 6 characters long');
    }
    if (passField.value !== confirmField.value) {
      applyTempErrorStyle(passField);
      applyTempErrorStyle(confirmField);
      errors.push('Passwords do not match');
    }
    if (errors.length > 0) {
      showError(registerError, errors.join(' • '));
      return;
    }

    // Mostrar mensaje de espera
    registerStatus.textContent = '⏳ Waiting for the server...';
    registerStatus.style.display = 'block';

    const serverReady = await waitForServer();
    if (!serverReady) {
      showError(registerError, '⚠️ Server did not respond after several attempts.');
      registerStatus.style.display = 'none';
      return;
    }

    registerStatus.textContent = '📝 Registering...';

    try {
      // Llamada a registro
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username: nameField.value.trim(),
        email: emailField.value,
        password: passField.value
      });

      // Login automático tras registro
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: emailField.value,
        password: passField.value
      });

      const tokenData = {
        data: loginResponse.data.access_token,
        timestamp: Date.now()
      };
      localStorage.setItem('access_token', JSON.stringify(tokenData));
      window.location.href = '../index.html';

    } catch (error) {
      let msg = error.response?.data?.detail || 'Server error';
      showError(registerError, msg);
      applyTempErrorStyle(emailField);
      applyTempErrorStyle(passField);
      applyTempErrorStyle(confirmField);

    } finally {
      registerStatus.style.display = 'none';
    }
  });

  // ============================
  // ENTER PARA LOGIN
  // ============================
  const loginPasswordInput = document.getElementById('login_password');
  const loginButton = document.getElementById('Login_btn');
  loginPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loginButton.click();
    }
  });

  // ============================
  // Google login y Forgot password no implementados
  // ============================
  document.getElementById('forgot-password-link').addEventListener('click', function (event) {
    event.preventDefault();
    alert('Not implemented yet');
  });
  document.getElementById('google-signin-btn').addEventListener('click', function (event) {
    event.preventDefault();
    alert('Not implemented yet');
  });

});
