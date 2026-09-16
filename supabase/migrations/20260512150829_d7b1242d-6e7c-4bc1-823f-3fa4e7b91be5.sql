UPDATE public.usuarios SET gestor_id = '00000000-0000-4000-8000-000000000003' WHERE id = '00000000-0000-4000-8000-000000000004';
UPDATE public.usuarios SET nome_completo = 'Demo Super Admin' WHERE id = '00000000-0000-4000-8000-000000000002';
UPDATE public.usuarios SET nome_completo = 'Demo Gestor'      WHERE id = '00000000-0000-4000-8000-000000000003';
UPDATE public.usuarios SET nome_completo = 'Demo Consultor'   WHERE id = '00000000-0000-4000-8000-000000000004';
UPDATE public.usuarios SET nome_completo = 'Heverton Eduardo Peres' WHERE id = '00000000-0000-4000-8000-000000000001';

INSERT INTO public.clientes (id, nome_doutor, nome_clinica, telefone_contato, consultor_atual_id) VALUES
  ('11111111-0000-4000-8000-000000000001','Dra. Ana Martins','Sorriso Pleno','(11) 98888-1001','00000000-0000-4000-8000-000000000004'),
  ('11111111-0000-4000-8000-000000000002','Dr. Bruno Carvalho','OdontoVida','(11) 98888-1002','00000000-0000-4000-8000-000000000004'),
  ('11111111-0000-4000-8000-000000000003','Dra. Camila Souza','Clínica IdealOdonto','(11) 98888-1003','00000000-0000-4000-8000-000000000004'),
  ('11111111-0000-4000-8000-000000000004','Dr. Diego Lima','Implantes & Cia','(21) 98888-1004','00000000-0000-4000-8000-000000000004'),
  ('11111111-0000-4000-8000-000000000005','Dra. Eduarda Rocha','Centro Odontológico Rocha','(11) 98888-1005','00000000-0000-4000-8000-000000000004'),
  ('11111111-0000-4000-8000-000000000006','Dr. Felipe Nogueira','NovaOdonto','(31) 98888-1006','00000000-0000-4000-8000-000000000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.visitas
  (id, cliente_id, consultor_executor_id, data_visita, tipo_visita, atendente, cargo_atendente,
   gerou_orcamento, gerou_pedido, valor_estimado, interesse_escala, temperatura_vendedor,
   probabilidade_fechamento, feedback_cliente, observacoes_vendedor, data_proximo_contato, acao_prevista)
VALUES
  ('22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 2,'Prospecção','Recepcionista Júlia','Secretária',true,true,18500.00,5,'Quente','Alta',
   'Aprovou kit cirúrgico premium','Enviar NF amanhã',CURRENT_DATE + 7,'Agendar entrega'),
  ('22222222-0000-4000-8000-000000000007','11111111-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 20,'Prospecção','Dra. Ana Martins','Dentista',true,false,18500.00,4,'Morno','Média',
   'Pediu condições à vista','Negociar desconto',CURRENT_DATE - 3,'Follow-up final'),

  ('22222222-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 5,'Relacionamento','Dr. Bruno Carvalho','Dentista',true,false,32000.00,5,'Quente','Alta',
   'Quer treinamento incluso','Avaliar pacote',CURRENT_DATE + 3,'Enviar contrato'),

  ('22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 10,'Prospecção','Sec. Marina','Secretária',true,false,7800.00,3,'Morno','Média',
   'Comparando concorrentes','Reforçar diferenciais',CURRENT_DATE + 5,'Visita técnica'),

  ('22222222-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 14,'Prospecção','Dr. Diego Lima','Dentista',false,false,NULL,2,'Frio','Baixa',
   'Sem demanda no momento','Reabordar em 60d',CURRENT_DATE + 30,'Follow-up frio'),

  ('22222222-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 7,'Pós-venda','Dra. Eduarda Rocha','Dentista',true,false,12400.00,3,'Morno','Média',
   'Avaliando aquisição de scanner','Enviar comparativo',CURRENT_DATE + 4,'Apresentar proposta'),
  ('22222222-0000-4000-8000-000000000008','11111111-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 30,'Prospecção','Dra. Eduarda Rocha','Dentista',false,false,NULL,2,'Frio','Baixa',
   'Primeiro contato','Conhecer estrutura',CURRENT_DATE - 23,'Retornar visita'),

  ('22222222-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000004',
   CURRENT_DATE - 1,'Prospecção','Sec. Paula','Secretária',false,false,NULL,1,'Frio','Baixa',
   'Não atendeu','Reagendar',CURRENT_DATE + 14,'Tentar novo horário')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.logs_transferencia (id, cliente_id, de_consultor_id, para_consultor_id, transferido_por_id, data_transferencia)
VALUES ('33333333-0000-4000-8000-000000000001',
        '11111111-0000-4000-8000-000000000004', NULL,
        '00000000-0000-4000-8000-000000000004',
        '00000000-0000-4000-8000-000000000003',
        now() - interval '15 days')
ON CONFLICT (id) DO NOTHING;