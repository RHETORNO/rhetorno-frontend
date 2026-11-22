import { getCredencial } from "@/lib/azure"

const POST = async () => {
  try {
    const { token, expiresOnTimestamp } = await getCredencial().getToken("https://ai.azure.com/.default")
     return Response.json({token, expiraEm: expiresOnTimestamp})
  }
  catch (erro) {
    console.error("[voz/token]", erro)
    return Response.json({ erro: "nao foi possivel autenticar no azure"}, {status: 500})
  } 
}

export { POST }
