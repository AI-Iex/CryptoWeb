// Permite clickar en la texto de Registro y login para el cambio, sin necesidad de clickar en el deslizable
document.querySelectorAll('.tab-switch span').forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const checkbox = document.getElementById('reg-log');
    checkbox.checked = index === 1; // 0 = Login, 1 = Registro
  });
});


document.addEventListener('DOMContentLoaded', () => {

  // ——————— FUNCIONES ———————

  async function loginUser(email, password) {
    try {
      const response = await axios.post('http://localhost:8000/auth/login', {
        email,
        password
      });
      localStorage.setItem('access_token', response.data.access_token);
      alert('Login exitoso!');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Credenciales incorrectas o error en el servidor');
    }
  }

  async function registerUser(username, email, password) {
    try {
      const response = await axios.post('http://localhost:8000/auth/register', {
        username,
        email,
        password
      });
      alert('Usuario registrado exitosamente!');
    } catch (error) {
       
      if (error.response) {
        // El servidor respondió con un error HTTP
        console.error('Datos de respuesta (error.response.data):', error.response.data);
        alert('Error en el servidor: ' + JSON.stringify(error.response.data));
      } else if (error.request) {
        // La petición salió pero no hubo respuesta
        console.error('No hubo respuesta del servidor:', error.request);
        alert('No obtuve respuesta del servidor');
      } else {
        // Otro tipo de error (configuración, CORS, etc.)
        console.error('Error al configurar la petición:', error.message);
        alert('Error de red o configuración: ' + error.message);
      }
  

    }
  }

  // ——————— LISTENERS ———————

  // Login
  const loginBtn = document.getElementById('Login_btn');
  loginBtn.addEventListener('click', e => {
    e.preventDefault();
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    if (email && password) {
      loginUser(email, password);
    } else {
      alert('Por favor, ingresa todos los campos');
    }
  });

  // Registro
  const registerBtn = document.getElementById('Register_btn');
  registerBtn.addEventListener('click', e => {
    e.preventDefault();
    const name  = document.getElementById('register_name').value;
    const email = document.getElementById('register_email').value;
    const pass  = document.getElementById('register_password').value;
    const confirm = document.getElementById('register_confirm').value;

    if (!name || !email || !pass || !confirm) {
      return alert('Por favor, ingresa todos los campos');
    }
    if (pass !== confirm) {
      return alert('Las contraseñas no coinciden');
    }
    registerUser(name, email, pass);
  });

});




