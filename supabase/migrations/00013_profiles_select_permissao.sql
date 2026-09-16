-- Libera leitura de profiles para todos os usuários autenticados
drop policy if exists "Autenticados veem perfis" on public.profiles;
create policy "Autenticados veem perfis"
  on public.profiles for select to authenticated
  using (true);
