import { DefaultAzureCredential } from "@azure/identity"

const credencial = new DefaultAzureCredential

const POST = async () => {
  try {
    const { token, expiresOnTimestamp } = await credencial.getToken("https://ai.azure.com/.default")
     return Response.json({token, expiraEm: expiresOnTimestamp})
  }
  catch (erro) {
    console.error("[voz/token]", erro)
    return Response.json({ erro: "nao foi possivel autenticar no azure"}, {status: 500})
  } 
}

export { POST }
