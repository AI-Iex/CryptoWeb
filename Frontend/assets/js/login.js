// Permite clickar en la texto de Registro y login para el cambio, sin necesidad de clickar en el deslizable
document.querySelectorAll('.tab-switch span').forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const checkbox = document.getElementById('reg-log');
    checkbox.checked = index === 1; // 0 = Login, 1 = Registro
  });
});

document.addEventListener('DOMContentLoaded', () => {
    // Crear elementos de error
    const createErrorElement = (buttonId) => {
        const button = document.getElementById(buttonId);
        const error = document.createElement('div');
        error.className = 'error-message-login';
        button.parentNode.insertBefore(error, button.nextSibling);
        return error;
    };

    // Elementos de error
    const loginError = createErrorElement('Login_btn');
    const registerError = createErrorElement('Register_btn');

    // Función para mostrar errores
    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 8000);
    };

    // Validación de email
    const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Validación de contraseña
    const checkPasswordLength = password => password.length >= 6;

    // Estilos temporales de error
    const applyTempErrorStyle = field => {
        field.classList.add('form-style-error');
        setTimeout(() => field.classList.remove('form-style-error'), 8000);
    };

    // Evento de Login
    document.getElementById('Login_btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const emailField = document.getElementById('login_email');
        const passField = document.getElementById('login_password');
        let errors = [];

        if (!validateEmail(emailField.value)) {
            applyTempErrorStyle(emailField);
            errors.push('Email inválido');
        }

        if (!checkPasswordLength(passField.value)) {
            applyTempErrorStyle(passField);
            errors.push('La contraseña debe tener mínimo 6 caracteres');
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
            localStorage.setItem('access_token', res.data.access_token);
            window.location.href = '../index.html';
        } catch (err) {
            // Obtener mensaje del backend o usar uno por defecto
            const errorMessage = err.response?.data?.detail || 'Server error';
    
            // Mostrar error específico
            showError(loginError, errorMessage);
            applyTempErrorStyle(emailField);
            applyTempErrorStyle(passField);
        }
    });

  // Evento de Registro
  document.getElementById('Register_btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const nameField = document.getElementById('register_name');
    const emailField = document.getElementById('register_email');
    const passField = document.getElementById('register_password');
    const confirmField = document.getElementById('register_confirm');

    // Limpiar errores previos
    registerError.classList.remove('active');
    
    // Validación mejorada
    let errors = [];
    
    if (!nameField.value.trim()) {
        applyTempErrorStyle(nameField);
        errors.push('El nombre es obligatorio');
    }
    
    if (!validateEmail(emailField.value)) {
        applyTempErrorStyle(emailField);
        errors.push('Formato de email inválido');
    }
    
    if (!checkPasswordLength(passField.value)) {
        applyTempErrorStyle(passField);
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (passField.value !== confirmField.value) {
        applyTempErrorStyle(passField);
        applyTempErrorStyle(confirmField);
        errors.push('Las contraseñas no coinciden');
    }

    if (errors.length > 0) {
        showError(registerError, errors.join('\n'));
        return;
    }

    // Ejecutar registro
    await registerUser(
        nameField.value.trim(),
        emailField.value,
        passField.value
    );
  });

  // Función de registro
  async function registerUser(username, email, password) {
    try {
        // 1. Registrar usuario
        const registerResponse = await axios.post('http://localhost:8000/auth/register', {
            username,
            email,
            password
        });

        // 2. Iniciar sesión automáticamente
        const loginResponse = await axios.post('http://localhost:8000/auth/login', {
            email,
            password
        });

        // 3. Guardar token y redirigir
        localStorage.setItem('access_token', loginResponse.data.access_token);
        window.location.href = '../index.html';

    } catch (error) {
        // Manejo mejorado de errores
        const errorMessage = error.response?.data?.detail || 'Server error';
        showError(registerError, errorMessage);
        
        // Resaltar campos relevantes según el error
        if (errorMessage.includes('Email')) {
            applyTempErrorStyle(document.getElementById('register_email'));
        }
        if (errorMessage.includes('contraseña')) {
            applyTempErrorStyle(document.getElementById('register_password'));
        }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const loginPasswordInput = document.getElementById('login_password');
  const loginButton = document.getElementById('Login_btn');

  loginPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Evitar comportamiento por defecto (si fuera formulario)
      loginButton.click();
    }
  });
});