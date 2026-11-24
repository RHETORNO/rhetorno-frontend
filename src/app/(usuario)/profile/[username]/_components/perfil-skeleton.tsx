import { Skeleton } from "@/components/ui/skeleton"

export function PerfilSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col" aria-busy="true" aria-label="Carregando perfil">
      <div className="flex items-start gap-5 border-b pb-10 sm:gap-7">
        <Skeleton className="size-16 rounded-md sm:size-24" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-10 w-3/4 max-w-md sm:h-14" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-x-16 gap-y-14 pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-4 h-24 w-full" />
        </div>
      </div>
    </div>
  )
}
