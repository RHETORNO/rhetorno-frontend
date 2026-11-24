import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function PerfilUsuario() {
  const user = await getCurrentUser();
  const nome: string = user.user_metadata.full_name || "Usuário";
  const supabase = await createClient();
  const { data: perfil } = await supabase.from("perfil").select("username, foto_url").eq("id", user.id).maybeSingle();
  const linkPerfil = `/profile/${perfil?.username ?? user.id}`;

  return (
    <div className="flex items-center justify-between gap-2 p-2 mb-4">
      <Link
        href={linkPerfil}
        title="Ver meu perfil"
        className="flex items-center gap-3 min-w-0 rounded-md -m-1 p-1 hover:bg-gray-100 dark:hover:bg-sidebar-accent"
      >
        {perfil?.foto_url ? (
          <Image
            src={perfil.foto_url}
            alt=""
            width={64}
            height={64}
            className="w-8 h-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm dark:bg-blue-500/20 dark:text-blue-200">
            {nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-foreground">{nome}</p>
          <p className="text-xs text-gray-500 truncate dark:text-muted-foreground">{user.email}</p>
        </div>
      </Link>
      <form action={logout}>
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-900 hover:cursor-pointer dark:text-muted-foreground dark:hover:bg-sidebar-accent dark:hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
