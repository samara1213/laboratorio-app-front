/**
 * Abre en una pestaña nueva una URL que se obtiene del servidor (PDF o adjunto con URL firmada).
 * La pestaña se abre en el mismo clic (si se abre después de esperar, el navegador la bloquea)
 * y la URL no se guarda en ningún lado
 * @param {() => Promise<string>} getUrl pide la URL temporal
 */
export async function openInNewTab(getUrl) {
  const tab = window.open('', '_blank');
  try {
    const url = await getUrl();
    if (!url) throw new Error('Sin URL');
    if (tab) {
      // la pestaña nueva no puede controlar esta
      tab.opener = null;
      tab.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener');
    }
  } catch (error) {
    tab?.close();
    throw error;
  }
}
