// pega a credencial do azure (na vercel usa o cracha oidc, no meu pc usa o az login)
import { getCredencial } from "@/lib/azure"
// cliente do supabase do lado do servidor, ele le o cookie de login
import { createClient } from "@/lib/supabase/server"

const POST = async () => {
  // abre o supabase com o cookie de quem fez o pedido
  const supabase = await createClient()
  // pergunta pro supabase quem ta logado (ele confere se o login e valido de vdd)
  const { data: { user } } = await supabase.auth.getUser()
  // ninguem logado? nem pede token pro azure, devolve 401 e acabou rs
  if (!user) return Response.json({ erro: "faça login" }, { status: 401 })

  try {
    // pede pro azure um token pra porta da voz (ai.azure.com)
    const { token, expiresOnTimestamp } = await getCredencial().getToken("https://ai.azure.com/.default")
    // manda o token e quando ele expira pro navegador abrir o websocket
     return Response.json({token, expiraEm: expiresOnTimestamp})
  }
  catch (erro) {
    // deu ruim no azure (login expirado, permissao...), mostra no terminal
    console.error("[voz/token]", erro)
    // e avisa o navegador sem vazar detalhe nenhum
    return Response.json({ erro: "nao foi possivel autenticar no azure"}, {status: 500})
  }
}

export { POST }
