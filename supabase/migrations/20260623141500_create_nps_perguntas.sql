CREATE TABLE IF NOT EXISTS public.nps_perguntas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  type text NOT NULL,
  question_text text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  required boolean DEFAULT true,
  active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.nps_perguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para autenticados" 
ON public.nps_perguntas FOR SELECT USING (true);

CREATE POLICY "Permitir manipulacao por admin" 
ON public.nps_perguntas FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_super_admin = true
  )
);

INSERT INTO public.nps_perguntas (key, type, question_text, required, active, is_system, order_index)
VALUES 
  ('nps_score', 'nps', 'Em uma escala de 0 a 10, o quanto você recomendaria a nossa empresa para um amigo ou colega?', true, true, true, 1),
  ('nps_comentario', 'text', 'Qual o principal motivo da sua nota?', false, true, true, 2)
ON CONFLICT (key) DO NOTHING;
