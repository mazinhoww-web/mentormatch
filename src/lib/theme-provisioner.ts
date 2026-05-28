import { put } from "@vercel/blob"
import { db } from "./db"
import { parseDesignMd } from "./theme-parser"
import { tokensToCSS } from "./theme-engine"

export async function provisionTenant(
  tenantId: string,
  themeKey: string,
  mdContent: string
): Promise<{ cssUrl: string; tokens: Record<string, string> }> {
  const tokens = parseDesignMd(mdContent)
  const css = tokensToCSS(themeKey, tokens)

  const { url: cssUrl } = await put(`mentormatch/themes/${themeKey}.css`, css, {
    access: "public",
    contentType: "text/css",
    allowOverwrite: true,
  })

  await db.tenant.update({
    where: { id: tenantId },
    data: {
      themeKey,
      themeCssUrl: cssUrl,
      tokens: JSON.stringify(tokens),
    },
  })

  return { cssUrl, tokens }
}
