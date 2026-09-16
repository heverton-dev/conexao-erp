-- Allow anonymous (public) SELECT on empresas_config so the public NPS survey page
-- can read the empresa theme (colors, logos, etc.) without authentication.
CREATE POLICY "Anon podem ver empresas_config"
ON public.empresas_config FOR SELECT TO anon
USING (true);
