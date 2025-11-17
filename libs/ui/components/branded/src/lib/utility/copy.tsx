/**
 * Copies given text to device's clipboard
 * @param text {string} Text to copy to clipboard
 */
export async function copyTextToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    console.log(`Error occured attempting to copy text to clipboard: ${text}`);
  });
}
