document.querySelectorAll('.tab-switch span').forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const checkbox = document.getElementById('reg-log');
    checkbox.checked = index === 1; // 0 = Login, 1 = Registro
  });
});
