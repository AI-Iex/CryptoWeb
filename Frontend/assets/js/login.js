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
    button.parentNode.insertBefore(error, button.nextSibling);
    return error;
  };

  const loginError = createErrorElement('Login_btn');
  const registerError = createErrorElement('Register_btn');

  // ============================
  // CAMBIO ENTRE LOGIN Y REGISTRO
  // ============================

  // Permite hacer clic en los textos LOGIN y REGISTRO para cambiar entre ellos
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

    try {
      const res = await axios.post('http://localhost:8000/auth/login', {
        email: emailField.value,
        password: passField.value
      });

      // Guardar el token con timestamp
      const tokenData = {
        data: res.data.access_token,
        timestamp: Date.now()
      };
      localStorage.setItem('access_token', JSON.stringify(tokenData));

      // Redirigir al home
      window.location.href = '../index.html';

    } catch (err) {
      let msg = err.message;
      if (err.response && err.response.status === 401) {
        msg = err.response.data.detail || msg;
      }

      showError(loginError, msg);
      applyTempErrorStyle(emailField);
      applyTempErrorStyle(passField);
    }
  });

  // ============================
  // EVENTO DE REGISTRO
  // ============================

  document.getElementById('Register_btn').addEventListener('click', async (e) => {
    e.preventDefault();

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
      showError(registerError, errors.join('\n'));
      return;
    }

    await registerUser(
      nameField.value.trim(),
      emailField.value,
      passField.value
    );
  });

  // ============================
  // FUNCIÓN DE REGISTRO
  // ============================

  async function registerUser(username, email, password) {
    try {
      // 1. Registrar usuario
      await axios.post('http://localhost:8000/auth/register', {
        username,
        email,
        password
      });

      // 2. Login automático
      const loginResponse = await axios.post('http://localhost:8000/auth/login', {
        email,
        password
      });

      // 3. Guardar token con timestamp
      const tokenData = {
        data: loginResponse.data.access_token,
        timestamp: Date.now()
      };
      localStorage.setItem('access_token', JSON.stringify(tokenData));

      // 4. Redirigir
      window.location.href = '../index.html';

    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Server error';
      showError(registerError, error.message);
      applyTempErrorStyle(document.getElementById('register_email'));
      applyTempErrorStyle(document.getElementById('register_password'));
    }
  }

  // ============================
  // ENTER PARA LOGIN
  // ============================

  const loginPasswordInput = document.getElementById('login_password');
  const loginButton = document.getElementById('Login_btn');

  loginPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir envío de formulario
      loginButton.click(); // Ejecutar login
    }
  });
});

 // ============================
  // Google login y Forgot password not implemented
  // ============================
document.getElementById('forgot-password-link').addEventListener('click', function(event) {
  event.preventDefault();
  alert('Not implemented yet');
});

document.getElementById('google-signin-btn').addEventListener('click', function(event) {
    event.preventDefault();
    alert('Not implemented yet');
  });