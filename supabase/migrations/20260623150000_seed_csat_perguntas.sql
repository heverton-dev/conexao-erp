-- Insere as perguntas padrão do CSAT (Matriz de Satisfação) no módulo NPS
INSERT INTO public.nps_perguntas (key, type, question_text, required, active, is_system, order_index)
VALUES
  ('csat_qualidade', 'csat', 'Qualidade do Atendimento', false, true, true, 3),
  ('csat_tempo', 'csat', 'Tempo de Resposta', false, true, true, 4),
  ('csat_clareza', 'csat', 'Clareza da Comunicação', false, true, true, 5),
  ('csat_resolucao', 'csat', 'Resolução do Problema', false, true, true, 6),
  ('csat_cortesia', 'csat', 'Cortesia do Consultor', false, true, true, 7)
ON CONFLICT (key) DO UPDATE SET 
  question_text = EXCLUDED.question_text,
  active = EXCLUDED.active,
  order_index = EXCLUDED.order_index;
