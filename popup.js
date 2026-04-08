document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('status');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs?.[0]?.url || '';
    const isTariffs = url.includes('/configurator/tariffs');
    const isDelOrgs = url.includes('/configurator/del-orgs');
    if (isTariffs) {
      status.innerHTML = '<span class="ok">✅ Активная вкладка:</span> страница тарифов. Кнопки и сайдбары должны работать здесь.';
    } else if (isDelOrgs) {
      status.innerHTML = '<span class="ok">✅ Активная вкладка:</span> страница del-orgs. Здесь работают resize-скрипты.';
    } else {
      status.innerHTML = '<span class="warn">⚠️ Открой поддерживаемую страницу:</span><br><code>/configurator/tariffs</code> или <code>/configurator/del-orgs</code>';
    }
  });
});