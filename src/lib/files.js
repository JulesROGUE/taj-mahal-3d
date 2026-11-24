// Export / import a text file: native dialogs in the desktop app, download / file picker in a browser.
export async function saveTextFile(defaultName, content, filters = []) {
  if (window.desktop) return window.desktop.saveFile({ defaultName, content, filters });
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: defaultName });
  a.click();
  URL.revokeObjectURL(url);
  return { saved: true };
}

export async function openTextFile(filters = []) {
  if (window.desktop) return window.desktop.openFile({ filters });
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement('input'), { type: 'file' });
    input.onchange = async () => {
      const file = input.files?.[0];
      resolve(file ? { name: file.name, content: await file.text() } : null);
    };
    input.click();
  });
}
