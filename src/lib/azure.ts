import { ClientAssertionCredential, DefaultAzureCredential } from "@azure/identity"
import { getVercelOidcToken } from "@vercel/oidc"

const naVercel = process.env.VERCEL === "1"

export const credencial = naVercel
  ? new ClientAssertionCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      () => getVercelOidcToken()
    )
  : new DefaultAzureCredential()
