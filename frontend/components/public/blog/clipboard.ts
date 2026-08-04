export async function copyToClipboard(value: string) {
  window.focus()

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      fallbackCopyToClipboard(value)
      return
    }
  }

  fallbackCopyToClipboard(value)
}

function fallbackCopyToClipboard(value: string) {
  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  textarea.style.top = "0"
  textarea.setAttribute("readonly", "")
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand("copy")
  textarea.remove()

  if (!copied) {
    throw new Error("浏览器拒绝了剪贴板写入")
  }
}
