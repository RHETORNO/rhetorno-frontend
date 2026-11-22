import { ClientAssertionCredential, DefaultAzureCredential } from "@azure/identity"
import { getVercelOidcToken } from "@vercel/oidc"

let credencial: ClientAssertionCredential | DefaultAzureCredential | null = null

export const getCredencial = () => {
  if (credencial) return credencial

  if (process.env.VERCEL === "1") {
    const tenant = process.env.AZURE_TENANT_ID
    const cliente = process.env.AZURE_CLIENT_ID
    if (!tenant || !cliente) throw new Error("faltam AZURE_TENANT_ID ou AZURE_CLIENT_ID nas variáveis da Vercel")
    credencial = new ClientAssertionCredential(tenant, cliente, () => getVercelOidcToken())
  }
  else credencial = new DefaultAzureCredential()

  return credencial
}
