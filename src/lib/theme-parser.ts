/**
 * Parse a design.md file and extract design tokens.
 *
 * Expected format:
 *
 *   ## Color Palette
 *   - **Primary Green** `#33820D`
 *   - **Border Gray** `#CDD3CD`
 *
 *   ## Typography
 *   - Display font: `Exo 2`
 *   - Body font: `Nunito`
 */
export function parseDesignMd(content: string): Record<string, string> {
  const tokens: Record<string, string> = {}

  const colorRegex = /\*\*([^*]+)\*\*\s*`(#[0-9A-Fa-f]{3,8})`/g
  let match: RegExpExecArray | null
  while ((match = colorRegex.exec(content)) !== null) {
    const [, name, value] = match
    const key = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    tokens[key] = value
  }

  const displayFont = content.match(/Display font[:\s]+`([^`]+)`/)
  const bodyFont = content.match(/Body font[:\s]+`([^`]+)`/)
  if (displayFont) tokens["font-display"] = `'${displayFont[1]}', sans-serif`
  if (bodyFont) tokens["font-body"] = `'${bodyFont[1]}', sans-serif`

  return tokens
}
