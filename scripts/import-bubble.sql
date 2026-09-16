-- ------------------------------------------
-- Migração Bubble → Supabase  |  cadastros
-- Gerado em: 2026-06-18T17:17:18.303Z
--
-- 563 cadastros  |  293 PF  |  174 PJ
-- 470 endereços  |  470 docs  |  30 eventos
-- ------------------------------------------

BEGIN;

-- ================================================================
-- CADASTROS (normalizado)
--   1. cadastros       (mestre)
--   2. cadastros_pf    (pessoa física)
--   3. cadastros_pj    (pessoa jurídica)
--   4. cadastros_enderecos
-- ================================================================

INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7618ae44-4989-43e9-a0e6-d6dd61a47482'::uuid, '3547184', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('7618ae44-4989-43e9-a0e6-d6dd61a47482'::uuid, 'Daniela Celli Amalfi', '22471449859', '1980-09-09'::date, 'SP - 137511', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7618ae44-4989-43e9-a0e6-d6dd61a47482'::uuid, '14801180', 'Araraquara', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d1352aa9-4925-4694-a224-5255e2569ba9'::uuid, '3775653', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('d1352aa9-4925-4694-a224-5255e2569ba9'::uuid, 'ANDRADE NEVES ODONTOLOGIA LDTA', 'ANDRADE NEVES ODONTOLOGIA LDTA', '166171', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('d1352aa9-4925-4694-a224-5255e2569ba9'::uuid, '13186464', 'Hortolândia', 'Jardim Santa Clara do Lago II');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('440cd767-62ed-44d4-ada7-1dbbc3f30fc8'::uuid, '9547128', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('440cd767-62ed-44d4-ada7-1dbbc3f30fc8'::uuid, 'L. Demarchi odontologia LTDA', 'L. Demarchi odontologia LTDA', '84993');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('440cd767-62ed-44d4-ada7-1dbbc3f30fc8'::uuid, '17900113', 'Dracena', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e77ab21e-24f1-4d7e-abbd-dedfb12f9454'::uuid, '9278918', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('e77ab21e-24f1-4d7e-abbd-dedfb12f9454'::uuid, 'Virgínia Annett Polli Simoa', '00922388903', '1992-05-16'::date, 'SC - 14152', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e77ab21e-24f1-4d7e-abbd-dedfb12f9454'::uuid, '88036001', 'Florianópolis', 'Trindade', 'Apto 502 E');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e409bc30-f144-4fc4-a59e-3759d1ed49ed'::uuid, '9189321', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('e409bc30-f144-4fc4-a59e-3759d1ed49ed'::uuid, 'CENTRO DE SAÚDE ODONTOLÓGICA AVANÇADA LTDA', 'CENTRO DE SAÚDE ODONTOLÓGICA AVANÇADA LTDA', 'EPAO 7351', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e409bc30-f144-4fc4-a59e-3759d1ed49ed'::uuid, '32675595', 'Betim', 'São Luiz');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9b13cd2d-f0b4-4ab7-ae58-6f56ee369160'::uuid, '5848841', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9b13cd2d-f0b4-4ab7-ae58-6f56ee369160'::uuid, 'Julia Sgavioli santo', '42872672818', '1993-01-07'::date, '113733');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9b13cd2d-f0b4-4ab7-ae58-6f56ee369160'::uuid, '17012433', 'Bauru', 'Vila Aeroporto Bauru', 'Clínica evolve');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2498145d-db24-4619-a02f-f93d59b3b619'::uuid, '2670979', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('2498145d-db24-4619-a02f-f93d59b3b619'::uuid, 'INOVE 3D ODONTOLOGIA DIGITAL LTDA', 'INOVE 3D ODONTOLOGIA DIGITAL LTDA', '105220', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2498145d-db24-4619-a02f-f93d59b3b619'::uuid, '02042000', 'São Paulo', 'Jardim São Paulo(Zona Norte)');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f1bf014d-6118-4310-a230-9b1bc0b76105'::uuid, '0040354', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('f1bf014d-6118-4310-a230-9b1bc0b76105'::uuid, 'ASM CLINICA ODONTOLOGICA LTDA', 'ASM CLINICA ODONTOLOGICA LTDA', '94752');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('f1bf014d-6118-4310-a230-9b1bc0b76105'::uuid, '09510005', 'São Caetano do Sul', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5bfddb68-285c-4717-a50d-bb03b365ddd0'::uuid, '5917924', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5bfddb68-285c-4717-a50d-bb03b365ddd0'::uuid, 'C F STEINHAUSER E CIA LTDA', 'C F STEINHAUSER E CIA LTDA', '48599');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5bfddb68-285c-4717-a50d-bb03b365ddd0'::uuid, '04531012', 'São Paulo', 'Itaim Bibi', 'cj 27');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('77a31396-544d-4b25-ac20-e57dc65b88d6'::uuid, '3776212', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('77a31396-544d-4b25-ac20-e57dc65b88d6'::uuid, 'Rosana Cavalcante de Cequeira Fernandes', '12260123880', '1987-01-12'::date, '36391');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('77a31396-544d-4b25-ac20-e57dc65b88d6'::uuid, '18030050', 'Sorocaba', 'Jardim Vergueiro', 'sala 42');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('af5e4b7b-3bd1-4109-ae73-f4264c759403'::uuid, '2766473', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('af5e4b7b-3bd1-4109-ae73-f4264c759403'::uuid, 'Cláudio Venturelli', '27386153848', '1977-03-25'::date, 'SP - 68519', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('af5e4b7b-3bd1-4109-ae73-f4264c759403'::uuid, '13465773', 'Americana', 'Vila Santo Antônio', 'Casa 24');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('602b927a-d14c-49c1-a5c8-7457808a1000'::uuid, '5353762', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('602b927a-d14c-49c1-a5c8-7457808a1000'::uuid, 'RICARDO FABIAN MIRANDA ZAPATA', '09517991851', 'SPSPSPSP - 34047', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('602b927a-d14c-49c1-a5c8-7457808a1000'::uuid, '08674170', 'Suzano', 'Centro', '7 ANDAR- SALA 74');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('50c2104f-2311-4c6a-ae28-cdbec6d3b572'::uuid, '3695781', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('50c2104f-2311-4c6a-ae28-cdbec6d3b572'::uuid, 'ALVARO TADEU DAVI JUNIOR', 'ALVARO TADEU DAVI JUNIOR', '88014');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('50c2104f-2311-4c6a-ae28-cdbec6d3b572'::uuid, '13940172', 'Águas de Lindóia', 'Jardim São Francisco', 'Sala 12');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3a13f6c3-bda0-4082-a622-edb8cb97fa16'::uuid, '3037054', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3a13f6c3-bda0-4082-a622-edb8cb97fa16'::uuid, 'isabela gonçalves lima', '17976604708', '1997-11-10'::date, 'RJ - 49007', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('3a13f6c3-bda0-4082-a622-edb8cb97fa16'::uuid, '25850000', 'Paraíba do Sul');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('06607d87-af20-4f74-ac3f-1361dae80753'::uuid, '0996190', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('06607d87-af20-4f74-ac3f-1361dae80753'::uuid, 'Victória dos Santos Borges', '01436929280', '2019-01-17'::date, 'PAPAPA -', 'PA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('06607d87-af20-4f74-ac3f-1361dae80753'::uuid, '66055000', 'Belém', 'Umarizal', 'Apto2403');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9ae81474-733a-4f80-a676-894b3f637882'::uuid, '4638258', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9ae81474-733a-4f80-a676-894b3f637882'::uuid, 'Marcos Moelas', '29030341840', '1977-04-17'::date, '70605');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9ae81474-733a-4f80-a676-894b3f637882'::uuid, '04207030', 'São Paulo', 'Ipiranga', 'apto 64');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('50a3a58d-8aa0-4305-adcb-c2bacbdd0096'::uuid, '6292804', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('50a3a58d-8aa0-4305-adcb-c2bacbdd0096'::uuid, 'Davi Ferreira da Silva maia', '15858764703', '2025-11-10'::date, 'SCSC - 21199', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('50a3a58d-8aa0-4305-adcb-c2bacbdd0096'::uuid, '88511110', 'Lages', 'Universitário');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('10ded46f-646e-44ad-aa11-735e46980695'::uuid, '2619951', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('10ded46f-646e-44ad-aa11-735e46980695'::uuid, 'AMARALMED COMERCIOS E SERVIÇOS LTDA', 'AMARALMED COMERCIOS E SERVIÇOS LTDA', '2312800', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('10ded46f-646e-44ad-aa11-735e46980695'::uuid, '74610130', 'Goiânia', 'Setor Leste Universitário', 'QUADRA 72-A; LOTE 07');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1797cab5-c392-4e43-afa9-7778131fa740'::uuid, '7527364', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('1797cab5-c392-4e43-afa9-7778131fa740'::uuid, 'Kelly Barros de Deus', '33367618837', '2022-02-14'::date, '148958');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1797cab5-c392-4e43-afa9-7778131fa740'::uuid, '05777180', 'São Paulo', 'Vila Nova das Belezas', 'Apartamento 505');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d9046dc5-86ea-4c2b-ab47-35794d6e1121'::uuid, '7447910', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('d9046dc5-86ea-4c2b-ab47-35794d6e1121'::uuid, 'Maristela Oliveira da Silva Baptista', '12629476855', '1968-04-19'::date, 'SP - 174669', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d9046dc5-86ea-4c2b-ab47-35794d6e1121'::uuid, '08597765', 'Itaquaquecetuba', 'Jardim Serra Dourada', 'Cada');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('90b1bef6-22ce-4fea-a9ba-a8ed141e1e03'::uuid, '5376387', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('90b1bef6-22ce-4fea-a9ba-a8ed141e1e03'::uuid, 'Arthur Vaz Paixao', '09439849983', '1994-12-02'::date, 'SCSC - 17168', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('90b1bef6-22ce-4fea-a9ba-a8ed141e1e03'::uuid, '89114732', 'Gaspar', 'Sete de Setembro', 'Sl1 Odontoexcellence');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('195fb3b0-36f8-4376-ad45-2e39801e3949'::uuid, '7057916', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('195fb3b0-36f8-4376-ad45-2e39801e3949'::uuid, 'VITOR LOPES FRANCO', '80426913515', '1979-08-16'::date, 'BA - 8099', 'BA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('195fb3b0-36f8-4376-ad45-2e39801e3949'::uuid, '44190000', 'Santo Estêvão', 'CLINICA ELO ODONTO');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('71274383-4a1d-4036-a20d-a5281587dd2f'::uuid, '8051248', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('71274383-4a1d-4036-a20d-a5281587dd2f'::uuid, 'Sabrina Blotta Paes Gonçalves', '21932856838', '1979-07-15'::date, '79101');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('71274383-4a1d-4036-a20d-a5281587dd2f'::uuid, '05075060', 'São Paulo', 'Lapa', '13');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes) VALUES ('b8de310d-7871-42f0-a796-a65ab03acb74'::uuid, '4917240', 'PF', 'Migrado do Bubble. Colaborador: -');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('b8de310d-7871-42f0-a796-a65ab03acb74'::uuid, 'Marcela Senna Souza', '14011457604', '1998-05-10'::date, 'MG - 55485', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b8de310d-7871-42f0-a796-a65ab03acb74'::uuid, '36016903', 'Juiz de Fora', 'Centro', '1323');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0d300362-6a2d-4036-a958-2b6b12d923ac'::uuid, '4009231', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('0d300362-6a2d-4036-a958-2b6b12d923ac'::uuid, 'Bruna Vitorino', '09459516637', '2019-01-25'::date, 'RJ56691', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0d300362-6a2d-4036-a958-2b6b12d923ac'::uuid, '27511630', 'Resende', 'Barbosa Lima', 'Edifício Tom Jobim apt 101');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes) VALUES ('0c1c9e35-bae3-4453-a74f-e9e65c17a82b'::uuid, '8221460', 'PJ', 'Migrado do Bubble. Colaborador: -');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('0c1c9e35-bae3-4453-a74f-e9e65c17a82b'::uuid, 'ASSISTENCIA ODONTOLOGICA CLARO LTDA', 'ASSISTENCIA ODONTOLOGICA CLARO LTDA', 'CLM 1814', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0c1c9e35-bae3-4453-a74f-e9e65c17a82b'::uuid, '36010081', 'Juiz de Fora', 'Centro', '201');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e9ce2162-9543-4c4b-a636-5e96c94b0f77'::uuid, '8103186', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('e9ce2162-9543-4c4b-a636-5e96c94b0f77'::uuid, 'Ana Gabriela Martins Fazzolo', '12395857645', '1994-10-30'::date, 'MG - 55390', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('e9ce2162-9543-4c4b-a636-5e96c94b0f77'::uuid, '35220000', 'Itueta', 'Loja B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('11e15b85-0899-409f-a8d6-7df9dab74def'::uuid, '7376831', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('11e15b85-0899-409f-a8d6-7df9dab74def'::uuid, 'Eduardo Jiro Uchida', '12100596810', '1970-04-13'::date, 'SP - 50069', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('11e15b85-0899-409f-a8d6-7df9dab74def'::uuid, '04004903', 'São Paulo', 'Paraíso', 'Cj 34');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7180769a-e109-4b0c-a2af-40c6c8ff6b0f'::uuid, '0813693', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('7180769a-e109-4b0c-a2af-40c6c8ff6b0f'::uuid, 'Horácio Manoel Costa e Silva', '07722240640', '1983-12-18'::date, 'MGMG - 3747', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7180769a-e109-4b0c-a2af-40c6c8ff6b0f'::uuid, '38184022', 'Araxá', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5ffd0a0d-7aea-4eea-a8b8-a6823b3b2ebb'::uuid, '0452439', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('5ffd0a0d-7aea-4eea-a8b8-a6823b3b2ebb'::uuid, 'Estevão de Carvalho Amaral', '05437766629', '2006-08-17'::date, 'MGMG - 34104', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('5ffd0a0d-7aea-4eea-a8b8-a6823b3b2ebb'::uuid, '35117000', 'Naque');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('917598c1-038a-49df-a523-c9019f4c0fbc'::uuid, '2967887', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('917598c1-038a-49df-a523-c9019f4c0fbc'::uuid, 'Marcela dos santos piola', '45378385822', '1996-05-15'::date, 'SP - 131104', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('917598c1-038a-49df-a523-c9019f4c0fbc'::uuid, '14160570', 'Sertãozinho', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('930af7ae-8ea5-4fdf-ae0a-5bccf366fdfd'::uuid, '0638013', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('930af7ae-8ea5-4fdf-ae0a-5bccf366fdfd'::uuid, 'RODRIGO RODRIGUES', '63857669187', '1978-06-04'::date, 'AC - 650', 'AC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('930af7ae-8ea5-4fdf-ae0a-5bccf366fdfd'::uuid, '69945000', 'Acrelândia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('12121f2e-0c94-408c-a4f8-c8e423c53fa9'::uuid, '8555501', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('12121f2e-0c94-408c-a4f8-c8e423c53fa9'::uuid, 'Thainá Alves dos Santos', '16391028761', '2022-01-11'::date, 'RJRJ - 51978', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('12121f2e-0c94-408c-a4f8-c8e423c53fa9'::uuid, '25975550', 'Teresópolis', 'Ermitage', 'Condomínio Portal Serrano bloco 2 Apt 407');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('be73d26c-9afb-4c09-ac5d-f0017f3f08ff'::uuid, '7372760', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('be73d26c-9afb-4c09-ac5d-f0017f3f08ff'::uuid, 'CARLUS VINICIUS MORAES', '90156897172', '1981-07-13'::date, 'GO - 7900', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('be73d26c-9afb-4c09-ac5d-f0017f3f08ff'::uuid, '74093140', 'Goiânia', 'Setor Sul', 'Cely Clin odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ca9690ae-a011-4b80-a758-7ade5f66979c'::uuid, '5581922', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('ca9690ae-a011-4b80-a758-7ade5f66979c'::uuid, 'Vanderson Beligoli', '06878730619', '1985-08-23'::date, 'MG - 60.003', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ca9690ae-a011-4b80-a758-7ade5f66979c'::uuid, '36021710', 'Juiz de Fora', 'Mansões do Bom Pastor', '301');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e5923fe6-39ab-4d06-a92b-e16a5911e25e'::uuid, '2345648', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('e5923fe6-39ab-4d06-a92b-e16a5911e25e'::uuid, 'Fernando Noronha Júnior', '27611842897', '2003-02-10'::date, '71775');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e5923fe6-39ab-4d06-a92b-e16a5911e25e'::uuid, '13845232', 'Mogi Guaçu', 'Jardim Centenário');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3a9df2ee-a98e-4981-a0be-d863b4059ea0'::uuid, '2024869', 'PJ', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('3a9df2ee-a98e-4981-a0be-d863b4059ea0'::uuid, 'LABORATORIO DE PROTESE ODONTOLOGICA PROMASTER LTDA', 'LABORATORIO DE PROTESE ODONTOLOGICA PROMASTER LTDA', 'TPD2900', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3a9df2ee-a98e-4981-a0be-d863b4059ea0'::uuid, '36010001', 'Juiz de Fora', 'Centro', '303/305');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dc55546d-7811-4d20-ab39-e315df28dbcd'::uuid, '1977890', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('dc55546d-7811-4d20-ab39-e315df28dbcd'::uuid, 'Bruna da silva dos santos', '47031963877', '142884');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('dc55546d-7811-4d20-ab39-e315df28dbcd'::uuid, '17970970', 'São João do Pau d''Alho', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3942c56a-1f99-4443-a1b0-db384cc58df6'::uuid, '5031668', 'PJ', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('3942c56a-1f99-4443-a1b0-db384cc58df6'::uuid, 'VITTA ODONTOLOGIA ESPECIALIZADA & SAÚDE LTDA', 'VITTA ODONTOLOGIA ESPECIALIZADA & SAÚDE LTDA', '45287', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3942c56a-1f99-4443-a1b0-db384cc58df6'::uuid, '36900064', 'Manhuaçu', 'Centro', '102');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8dba8b94-f1b1-4a82-a36c-6563dda8cff5'::uuid, '9722761', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('8dba8b94-f1b1-4a82-a36c-6563dda8cff5'::uuid, 'Guilherme Santana de Vasconcelos', '08374658770', '2022-02-14'::date, 'RJRJ - 29991', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('8dba8b94-f1b1-4a82-a36c-6563dda8cff5'::uuid, '23027260', 'Rio de Janeiro', 'Pedra de Guaratiba');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('47d31013-bf6e-4ef1-a7e1-78697f8831a2'::uuid, '1152216', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('47d31013-bf6e-4ef1-a7e1-78697f8831a2'::uuid, 'Victor Rodrigues Carvalho', '13393296701', '1988-01-12'::date, 'RJ - 38803', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('47d31013-bf6e-4ef1-a7e1-78697f8831a2'::uuid, '24110013', 'Niterói', 'Santana');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e7fb31ff-f05d-4319-acd2-1b0b1eb69876'::uuid, '4424382', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('e7fb31ff-f05d-4319-acd2-1b0b1eb69876'::uuid, 'Ana Caroline Marques de Queiroz', '36931447882', '1988-09-24'::date, 'SP - 104646', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e7fb31ff-f05d-4319-acd2-1b0b1eb69876'::uuid, '09633000', 'São Bernardo do Campo', 'Rudge Ramos', 'Ap 87');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5f82a0a7-20aa-42c7-aa06-82cfd4c4a60f'::uuid, '6448100', 'PJ', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('5f82a0a7-20aa-42c7-aa06-82cfd4c4a60f'::uuid, 'Breno Souza', 'Breno Souza', '38190', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5f82a0a7-20aa-42c7-aa06-82cfd4c4a60f'::uuid, '30140001', 'Belo Horizonte', 'Santa Efigênia', '1107');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3b4d59ce-595b-4808-a295-f28374771872'::uuid, '1370160', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3b4d59ce-595b-4808-a295-f28374771872'::uuid, 'Mariana Andrielli de Barros', '40021481814', '2016-02-02'::date, 'SPSPSP - 109576', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('3b4d59ce-595b-4808-a295-f28374771872'::uuid, '13610340', 'Leme', 'Jardim Amália');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('39f544ec-aeab-4b32-a34c-b289eab483b3'::uuid, '1189264', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('39f544ec-aeab-4b32-a34c-b289eab483b3'::uuid, 'Marisa Estela dos santos', '32251496831', '1989-09-06'::date, 'SP - 101884', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('39f544ec-aeab-4b32-a34c-b289eab483b3'::uuid, '14801280', 'Araraquara', 'Centro', 'Clínica sorriso');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('416cddb7-04dd-46e3-ad58-ef0d61db1ad7'::uuid, '1059424', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('416cddb7-04dd-46e3-ad58-ef0d61db1ad7'::uuid, 'Matheus philipe Oliveira Guerra', '10422342645', '2023-02-03'::date, 'MGMG - 65412', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('416cddb7-04dd-46e3-ad58-ef0d61db1ad7'::uuid, '37901080', 'Passos', 'Vila Rica', 'casa cinza');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('57f31748-0e85-4c34-a7a3-abfb7183b7e5'::uuid, '7193570', 'PF', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('57f31748-0e85-4c34-a7a3-abfb7183b7e5'::uuid, 'Paulo Vitor de Freitas Nuernberger', '23004209888', '1987-04-14'::date, 'SP - 97537', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('57f31748-0e85-4c34-a7a3-abfb7183b7e5'::uuid, '05687002', 'São Paulo', 'Real Parque', 'Ap14');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dfbb1182-b56f-4545-acba-09097208fa66'::uuid, '7346939', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('dfbb1182-b56f-4545-acba-09097208fa66'::uuid, 'ARMONI ODONTOLOGIA E ESTETICA LTDA', 'ARMONI ODONTOLOGIA E ESTETICA LTDA', '72347');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('dfbb1182-b56f-4545-acba-09097208fa66'::uuid, '06454020', 'Barueri', 'Alphaville Centro Industrial e Empresarial/Alphaville.', '1516');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8e0ce97d-1317-4232-a1f9-b4d52f0df757'::uuid, '7037785', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8e0ce97d-1317-4232-a1f9-b4d52f0df757'::uuid, 'Sergio Hideki Yasuda', '17373214835', '1970-12-10'::date, '972550475');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8e0ce97d-1317-4232-a1f9-b4d52f0df757'::uuid, '01228200', 'São Paulo', 'Consolação', 'conj.91');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c319f7c2-9f01-47dd-afb1-9290427eb7e0'::uuid, '2447276', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('c319f7c2-9f01-47dd-afb1-9290427eb7e0'::uuid, 'Roosevelt Leandro Sousa Silva', '00191496111', '1983-05-25'::date, 'MG - 41441', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('c319f7c2-9f01-47dd-afb1-9290427eb7e0'::uuid, '38400095', 'Uberlândia', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f8a2edb9-e8c5-406c-a514-818881517dfd'::uuid, '8994263', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('f8a2edb9-e8c5-406c-a514-818881517dfd'::uuid, 'JULIA TOME CORAZZINA', '42942938889', '1995-05-10'::date, 'SPSP146275', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f8a2edb9-e8c5-406c-a514-818881517dfd'::uuid, '19970050', 'Palmital', 'Centro', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fe3cc38a-7271-4757-ae93-6c514806f58a'::uuid, '9409142', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('fe3cc38a-7271-4757-ae93-6c514806f58a'::uuid, 'HNZ ODONTOLOGIA HUMANIZADA LTDA', 'HNZ ODONTOLOGIA HUMANIZADA LTDA', '50371', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('fe3cc38a-7271-4757-ae93-6c514806f58a'::uuid, '28994795', 'Saquarema', 'Bacaxá (Bacaxá)', 'SUPERIOR GIRAU');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('af1ce7fc-53a5-4b83-acf4-c10cb6dae4a1'::uuid, '6529670', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('af1ce7fc-53a5-4b83-acf4-c10cb6dae4a1'::uuid, 'Carla Maria de Oliveira', '94728720187', '1982-07-04'::date, 'GO - 21132', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('af1ce7fc-53a5-4b83-acf4-c10cb6dae4a1'::uuid, '74250030', 'Goiânia', 'Jardim América', 'Clínica Reabilitê Odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a98595c1-80cf-4109-a3e4-3a46c44fa070'::uuid, '9635444', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('a98595c1-80cf-4109-a3e4-3a46c44fa070'::uuid, 'Clinica Odontológica Ming Fai Gia Ltda', 'Clinica Odontológica Ming Fai Gia Ltda', '13488', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('a98595c1-80cf-4109-a3e4-3a46c44fa070'::uuid, '30140072', 'Belo Horizonte', 'Lourdes');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a34c36fd-f1af-450f-a218-83934b79f812'::uuid, '8592749', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('a34c36fd-f1af-450f-a218-83934b79f812'::uuid, 'KENIA MARTINS MOSCARDINI', '83612920634', '1992-09-25'::date, 'MGMG - 17315', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a34c36fd-f1af-450f-a218-83934b79f812'::uuid, '35700019', 'Sete Lagoas', 'Centro', 'Predio');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e0c16716-a1d0-47d2-a256-702df2b37080'::uuid, '2658447', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('e0c16716-a1d0-47d2-a256-702df2b37080'::uuid, 'Marcelo Ranieri', '15392404871', 'SP - 110894', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e0c16716-a1d0-47d2-a256-702df2b37080'::uuid, '03335000', 'São Paulo', 'Vila Regente Feijó');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e71fc2a0-ef68-48fd-a50a-520e8786d3d5'::uuid, '4555146', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('e71fc2a0-ef68-48fd-a50a-520e8786d3d5'::uuid, 'Themer Jabour Venuto', '08060123661', '1990-01-16'::date, 'MG - 42546', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e71fc2a0-ef68-48fd-a50a-520e8786d3d5'::uuid, '36010330', 'Juiz de Fora', 'Centro', 'LOJA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('40378d65-08f1-4e16-a745-637bd3296ce8'::uuid, '1669468', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('40378d65-08f1-4e16-a745-637bd3296ce8'::uuid, 'Paulo de Tarso Rodrigues Barbosa', '01707028800', '1957-09-09'::date, 'SP - 26356', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('40378d65-08f1-4e16-a745-637bd3296ce8'::uuid, '13720083', 'São José do Rio Pardo', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5abd9785-30c8-483b-a828-8d7c795d3255'::uuid, '4689585', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('5abd9785-30c8-483b-a828-8d7c795d3255'::uuid, 'Fabiana Mara Brasil', '86551680682', '1969-06-03'::date, 'MG - 18318', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5abd9785-30c8-483b-a828-8d7c795d3255'::uuid, '36010003', 'Juiz de Fora', 'Centro', 'Sala 1114');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('958023de-004d-46cc-a326-822fcd221794'::uuid, '8800127', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('958023de-004d-46cc-a326-822fcd221794'::uuid, 'André Ferraz Lima', '09742184801', '1968-12-29'::date, '57881');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('958023de-004d-46cc-a326-822fcd221794'::uuid, '19470007', 'Presidente Epitácio', 'Centro', 'Prédio Impladent');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d0f87fc9-19d3-466b-a027-45c975052ace'::uuid, '5303830', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('d0f87fc9-19d3-466b-a027-45c975052ace'::uuid, 'Daniel Andrade Padilha', '09474637717', '1982-05-15'::date, 'RJ - 36408', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('d0f87fc9-19d3-466b-a027-45c975052ace'::uuid, '23951310', 'Angra dos Reis', 'Vila Histórica de Mambucaba (Mambucaba)');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('20673112-eaf3-4c25-ada3-edd41916d767'::uuid, '4902223', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('20673112-eaf3-4c25-ada3-edd41916d767'::uuid, 'Christiane da Silva Aguiar', '55', '1979-01-16'::date, '74568');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('20673112-eaf3-4c25-ada3-edd41916d767'::uuid, '13930037', 'Serra Negra', 'Centro', 'sala 32 - Centro Empresarial');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3856ce98-7e48-4279-a93f-f9d13c64c82d'::uuid, '3918645', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('3856ce98-7e48-4279-a93f-f9d13c64c82d'::uuid, 'Cássia Utiyama Takahashi', '25109443807', '1974-03-21'::date, '56686');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3856ce98-7e48-4279-a93f-f9d13c64c82d'::uuid, '01502001', 'São Paulo', 'Liberdade', 'sobreloja 18');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a2bb32e9-34f5-4e4b-a4b6-b346f00efc4f'::uuid, '4247631', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('a2bb32e9-34f5-4e4b-a4b6-b346f00efc4f'::uuid, 'Gelson', '05523444863', 'SP - 35252', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('a2bb32e9-34f5-4e4b-a4b6-b346f00efc4f'::uuid, '04117091', 'São Paulo', 'Vila Mariana');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3aee4343-52b4-4ac7-a476-92c14f6978e2'::uuid, '6242054', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('3aee4343-52b4-4ac7-a476-92c14f6978e2'::uuid, 'INSTITUTO ODONTOLOGICO FABIO TURCO LTDA', 'INSTITUTO ODONTOLOGICO FABIO TURCO LTDA', '3642', 'DF');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3aee4343-52b4-4ac7-a476-92c14f6978e2'::uuid, '70712903', 'Brasília', 'Asa Norte', 'TORRE B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8db35fa3-0d84-4dab-a207-5f393f0ff420'::uuid, '7770928', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('8db35fa3-0d84-4dab-a207-5f393f0ff420'::uuid, 'T Oliveira Costa Ltda', 'T Oliveira Costa Ltda', '1069', 'RR');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('8db35fa3-0d84-4dab-a207-5f393f0ff420'::uuid, '69312397', 'Boa Vista', 'Cinturão Verde');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a0313291-0d21-431d-a059-44f812989240'::uuid, '8003761', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('a0313291-0d21-431d-a059-44f812989240'::uuid, 'Arthur de Sousa Silva', '01626653690', '1999-04-26'::date, '69339', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a0313291-0d21-431d-a059-44f812989240'::uuid, '32340430', 'Contagem', 'Santa Cruz Industrial', '403');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3d25a77d-e1b1-47d1-ab7b-0c01814a21fd'::uuid, '3962252', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('3d25a77d-e1b1-47d1-ab7b-0c01814a21fd'::uuid, 'PEZOTI LEITE ODONTOLOGIA LTDA', 'PEZOTI LEITE ODONTOLOGIA LTDA', '051827', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3d25a77d-e1b1-47d1-ab7b-0c01814a21fd'::uuid, '24030078', 'Niterói', 'Centro', 'ORTOZARA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ae71a640-073e-4c05-a786-d37a29ae47fe'::uuid, '5672632', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('ae71a640-073e-4c05-a786-d37a29ae47fe'::uuid, 'Nataliane da rocha araujoujo', '33520153840', '2025-12-16'::date, 'SP - 112853', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('ae71a640-073e-4c05-a786-d37a29ae47fe'::uuid, '08215550', 'São Paulo', 'Itaquera');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('efbe857f-f245-4dab-aeec-fb86c52e2a2b'::uuid, '3156158', 'PF', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('efbe857f-f245-4dab-aeec-fb86c52e2a2b'::uuid, 'Alessandra Silveira Campos', '70580390462', '1998-01-07'::date, 'PE - 16907', 'PE');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep) VALUES ('efbe857f-f245-4dab-aeec-fb86c52e2a2b'::uuid, '5420080');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2446d31f-ddd7-4371-a2f3-40c0e867facc'::uuid, '9960018', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('2446d31f-ddd7-4371-a2f3-40c0e867facc'::uuid, 'ORIGENS ODONTOLOGIA LTDA', 'ORIGENS ODONTOLOGIA LTDA', '130080', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2446d31f-ddd7-4371-a2f3-40c0e867facc'::uuid, '13208056', 'Jundiaí', 'Anhangabaú', 'sala 618');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('69ad985d-d24a-4f0b-a31f-aef0db606e0d'::uuid, '9689480', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('69ad985d-d24a-4f0b-a31f-aef0db606e0d'::uuid, 'Claudio Noba', '30062548808', '1978-03-04'::date, '80591');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('69ad985d-d24a-4f0b-a31f-aef0db606e0d'::uuid, '03319001', 'São Paulo', 'Vila Gomes Cardim', 'ap. 76');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('57247db8-a7aa-4ef3-a2ba-2fe4860e4005'::uuid, '4525691', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('57247db8-a7aa-4ef3-a2ba-2fe4860e4005'::uuid, 'Dela Libera Odontologia LTDA', 'Dela Libera Odontologia LTDA', '40293');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('57247db8-a7aa-4ef3-a2ba-2fe4860e4005'::uuid, '13480100', 'Limeira', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f3a78dc2-93f7-4357-a9a3-fa4fb00d289b'::uuid, '1459446', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('f3a78dc2-93f7-4357-a9a3-fa4fb00d289b'::uuid, 'Thiago Coimbra Levorato', '01310707626', '2007-09-04'::date, '92497');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f3a78dc2-93f7-4357-a9a3-fa4fb00d289b'::uuid, '17207026', 'Jaú', 'Vila Hilst', 'A');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('02abc3a5-aa29-4cf5-a4d1-0817b1120925'::uuid, '4335126', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('02abc3a5-aa29-4cf5-a4d1-0817b1120925'::uuid, 'ELP - VL ODONTOLOGIA LTDA', 'ELP - VL ODONTOLOGIA LTDA', '044584', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('02abc3a5-aa29-4cf5-a4d1-0817b1120925'::uuid, '27600246', 'Valença', 'Centro', 'Ao lado do banco sicoob');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8d7f9a36-39ca-45ce-a9ba-55bebd075cd8'::uuid, '0187174', 'PF', 'Migrado do Bubble. Colaborador: 1760960510235x547964187199232900', '1760960510235x547964187199232900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8d7f9a36-39ca-45ce-a9ba-55bebd075cd8'::uuid, 'Renata Bommarito', '45898424830', '1997-04-26'::date, '136634');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8d7f9a36-39ca-45ce-a9ba-55bebd075cd8'::uuid, '06036048', 'Osasco', 'Umuarama', 'Apto 45 alabama');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('65e276bc-4de6-4e37-aaee-ce52cb6074b9'::uuid, '3602510', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('65e276bc-4de6-4e37-aaee-ce52cb6074b9'::uuid, 'Wally Reis Millard', '01218894679', '1980-12-14'::date, 'MG - 30877', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('65e276bc-4de6-4e37-aaee-ce52cb6074b9'::uuid, '35030765', 'Governador Valadares', 'São Paulo', 'Lj. 05');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('130babd0-c682-4ec0-aecf-1947ce0a9628'::uuid, '4178892', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('130babd0-c682-4ec0-aecf-1947ce0a9628'::uuid, 'Caroline Tigre Macedo', '35249263801', '2026-01-12'::date, '134263');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('130babd0-c682-4ec0-aecf-1947ce0a9628'::uuid, '13010211', 'Campinas', 'Centro', 'predio easy office sala 1010');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b2fa0e48-eb06-43c2-a7a3-8780e321f3b2'::uuid, '6391254', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('b2fa0e48-eb06-43c2-a7a3-8780e321f3b2'::uuid, 'Fabio Sanches da Costa', '00660503913', '1985-11-07'::date, 'SC - 11136', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b2fa0e48-eb06-43c2-a7a3-8780e321f3b2'::uuid, '88058690', 'Florianópolis', 'Ingleses do Rio Vermelho', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1ed1b241-c286-4544-a724-735b3f1e6497'::uuid, '6147974', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('1ed1b241-c286-4544-a724-735b3f1e6497'::uuid, 'Comercial de Angelo Produtos Pra saude ltda', 'Comercial de Angelo Produtos Pra saude ltda', '06767260', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1ed1b241-c286-4544-a724-735b3f1e6497'::uuid, '06767260', 'Taboão da Serra', 'Parque Pinheiros', 'sl 05');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('123a8b45-cb83-4bd4-a90e-0a4da36fcb45'::uuid, '2637456', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('123a8b45-cb83-4bd4-a90e-0a4da36fcb45'::uuid, 'Marcelo Fuziy', '00660503913', '1956-05-23'::date, '19244');
INSERT INTO public.cadastros_enderecos (cadastro_id, cidade, bairro) VALUES ('123a8b45-cb83-4bd4-a90e-0a4da36fcb45'::uuid, 'São Paulo', 'Sé');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('815560a8-6223-4f00-ae37-4a6640fae554'::uuid, '0972828', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('815560a8-6223-4f00-ae37-4a6640fae554'::uuid, 'Cláudia Vasques Tafner', '26661859822', '1974-05-30'::date, 'SP - 57257', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('815560a8-6223-4f00-ae37-4a6640fae554'::uuid, '13100040', 'Campinas', 'Jardim Paraíso', 'Apto  64');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1c2371ff-5fcc-47d5-afe5-86c5e856e3b6'::uuid, '4480757', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('1c2371ff-5fcc-47d5-afe5-86c5e856e3b6'::uuid, 'Rejane Silva de Oliveira', '02945750732', '1973-12-05'::date, 'RJ - 22235', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1c2371ff-5fcc-47d5-afe5-86c5e856e3b6'::uuid, '20940200', 'Rio de Janeiro', 'São Cristóvão', 'B 103 entregar na GARAGEM');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0ecbfc2e-c0d6-4324-a015-3ea17de0c69e'::uuid, '7902126', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('0ecbfc2e-c0d6-4324-a015-3ea17de0c69e'::uuid, 'Victor Felipe Ferreira Catapreta', '10887791662', '1991-03-23'::date, 'MG - 43443', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0ecbfc2e-c0d6-4324-a015-3ea17de0c69e'::uuid, '35162115', 'Ipatinga', 'Jardim Panorama', 'Apto 101');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f169af5a-631d-48ea-a9c1-2b18e76eaa9f'::uuid, '3324328', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('f169af5a-631d-48ea-a9c1-2b18e76eaa9f'::uuid, 'João Fortunato Guarnieri', '01684855837', '1959-06-25'::date, 'SP - 30203', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, complemento) VALUES ('f169af5a-631d-48ea-a9c1-2b18e76eaa9f'::uuid, '13500090', 'Entre AV 17 e 19');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6b14470c-3dd8-4e9c-a644-03ecbe3ef87c'::uuid, '7744436', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('6b14470c-3dd8-4e9c-a644-03ecbe3ef87c'::uuid, 'Isabela Amanda de Abreu Araujo Porcaro Filgueiras', '12945259729', '1993-11-21'::date, '127540');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6b14470c-3dd8-4e9c-a644-03ecbe3ef87c'::uuid, '14096190', 'Ribeirão Preto', 'Ribeirânia', 'Apart 1301');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3dcb9fa0-8b93-4488-af3d-4214e191350a'::uuid, '9005552', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3dcb9fa0-8b93-4488-af3d-4214e191350a'::uuid, 'Diogo Guadagnin', '03818815984', '1982-09-19'::date, 'SC - 12621', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3dcb9fa0-8b93-4488-af3d-4214e191350a'::uuid, '88350340', 'Brusque', 'Centro I', 'Odontonin Hospital Odontologico');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('85eb7248-0001-4c96-a78c-d2e656236e54'::uuid, '0008984', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('85eb7248-0001-4c96-a78c-d2e656236e54'::uuid, 'Eduardo Medeiros Laureano', '08548224967', '1990-12-01'::date, 'SC - 14431', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('85eb7248-0001-4c96-a78c-d2e656236e54'::uuid, '88070700', 'Florianópolis', 'Canto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a20e35d3-3892-4bfc-abce-255bd4d2bd31'::uuid, '4911573', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('a20e35d3-3892-4bfc-abce-255bd4d2bd31'::uuid, 'DONE Clínica Odontológica a Nível Especializado Ltda', 'DONE Clínica Odontológica a Nível Especializado Ltda', '20794');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a20e35d3-3892-4bfc-abce-255bd4d2bd31'::uuid, '03309000', 'São Paulo', 'Vila Gomes Cardim', 'interfone 1/2');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('43390714-f7ed-492f-a767-257e5a1c6686'::uuid, '6491385', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('43390714-f7ed-492f-a767-257e5a1c6686'::uuid, 'Ivan kauling', '08548224967', '1968-02-04'::date, 'SC - 957', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('43390714-f7ed-492f-a767-257e5a1c6686'::uuid, '88821594', 'Içara', 'Cristo Rei', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('17bd5a62-a8e7-4dc8-aea8-d2b15dd15389'::uuid, '0168408', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('17bd5a62-a8e7-4dc8-aea8-d2b15dd15389'::uuid, 'Lucas Dal Ri Sebrian', '36228734857', '1988-06-09'::date, 'SP - 115061', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('17bd5a62-a8e7-4dc8-aea8-d2b15dd15389'::uuid, '11070400', 'Santos', 'Marapé', '196t1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2df8b416-241c-4b77-a6ba-0df0d1f261d2'::uuid, '7577371', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2df8b416-241c-4b77-a6ba-0df0d1f261d2'::uuid, 'ANDRÉIA SCRAMIGNON ODONTOLOGIA', 'ANDRÉIA SCRAMIGNON ODONTOLOGIA', '026169');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2df8b416-241c-4b77-a6ba-0df0d1f261d2'::uuid, '06454000', 'Barueri', 'Alphaville Centro Industrial e Empresarial/Alphaville.', 'Sala 98');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('99a994f3-e943-4a81-a47f-6df67f9d2a02'::uuid, '2407417', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('99a994f3-e943-4a81-a47f-6df67f9d2a02'::uuid, 'Urailto Antônio Tavares', '93004621134', '1977-02-28'::date, 'GO - 7456', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('99a994f3-e943-4a81-a47f-6df67f9d2a02'::uuid, '76145000', 'Córrego do Ouro', 'Sobrado ao lado da antena de internet');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('cb19b19e-0804-4d1f-a817-ab0c6458d70d'::uuid, '8581155', 'PF', 'Migrado do Bubble. Colaborador: 1760960811956x525267045364542460', '1760960811956x525267045364542460');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('cb19b19e-0804-4d1f-a817-ab0c6458d70d'::uuid, 'Ariadiny de Paula Oliveira Cantarino', '41831897806', '2023-07-26'::date, '145786');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('cb19b19e-0804-4d1f-a817-ab0c6458d70d'::uuid, '07143040', 'Guarulhos', 'Jardim Kawamoto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7af50ba0-0bc5-4f2c-a0b2-69e7508597ac'::uuid, '0980701', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('7af50ba0-0bc5-4f2c-a0b2-69e7508597ac'::uuid, 'Italo Barouch Totti', '28677898859', '1979-07-19'::date, 'SP - 83949', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7af50ba0-0bc5-4f2c-a0b2-69e7508597ac'::uuid, '08780830', 'Mogi das Cruzes', 'Socorro', 'sala 91');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7dbc52be-2ce7-4b5e-a92a-45ddcd931ef3'::uuid, '0464637', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('7dbc52be-2ce7-4b5e-a92a-45ddcd931ef3'::uuid, 'anibal dario gonzalez recalde', 'anibal dario gonzalez recalde', '19948', 'RR');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7dbc52be-2ce7-4b5e-a92a-45ddcd931ef3'::uuid, '85862200', 'Foz do Iguaçu', 'Três Bandeiras', 'clinica odonto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dbf6b815-ba44-4ce0-af44-023f0212e427'::uuid, '1993157', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('dbf6b815-ba44-4ce0-af44-023f0212e427'::uuid, 'DJS ODONTO', 'DJS ODONTO', '8238', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, complemento) VALUES ('dbf6b815-ba44-4ce0-af44-023f0212e427'::uuid, '72984265', 'RUA BENJAMIN CONTANT Nº 65 CENTRO, PIRENOPOLIS-GO, EM FRENTE A GARAGEM DA PREFEITURA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('befbfd39-8c3d-4375-acaa-d25b96c121e9'::uuid, '0956576', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('befbfd39-8c3d-4375-acaa-d25b96c121e9'::uuid, 'CENTRO ODONTOLOGICO SAO JOSE LTDA', 'CENTRO ODONTOLOGICO SAO JOSE LTDA', 'CD-7968', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('befbfd39-8c3d-4375-acaa-d25b96c121e9'::uuid, '88102401', 'São José', 'Kobrasol');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('11477d7f-d255-40dd-af28-b88681b38e0b'::uuid, '6860084', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('11477d7f-d255-40dd-af28-b88681b38e0b'::uuid, 'Ana cristina duarte figueiredo', '13505918660', '1998-01-05'::date, 'MG - 57583', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('11477d7f-d255-40dd-af28-b88681b38e0b'::uuid, '39401081', 'Montes Claros', 'Cidade Santa Maria');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9494356a-a724-4705-ad2b-ae0655c3cd02'::uuid, '3130179', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('9494356a-a724-4705-ad2b-ae0655c3cd02'::uuid, 'Carlos Eduardo Ribas', '03388143960', 'SC - 13618', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9494356a-a724-4705-ad2b-ae0655c3cd02'::uuid, '89036301', 'Blumenau', 'Velha', 'Sala 01.   UNIA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('aad92ab5-330a-47e2-aaa0-5081b5eed6f1'::uuid, '3152116', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('aad92ab5-330a-47e2-aaa0-5081b5eed6f1'::uuid, 'Bruno Felipe Monteiro Lima', '01845704762', '1972-12-06'::date, 'RJ - 22977', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('aad92ab5-330a-47e2-aaa0-5081b5eed6f1'::uuid, '20511320', 'Rio de Janeiro', 'Tijuca', '502');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('907be621-d64c-488d-a629-1fc957787caf'::uuid, '7151188', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('907be621-d64c-488d-a629-1fc957787caf'::uuid, 'Michele Medeiros da silva', '44055267886', '1996-11-18'::date, '146757');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('907be621-d64c-488d-a629-1fc957787caf'::uuid, '14622434', 'Orlândia', 'Jardim Morada do Sol');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f2814d58-1ba5-4fbf-a419-b1e0a184de91'::uuid, '1559086', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('f2814d58-1ba5-4fbf-a419-b1e0a184de91'::uuid, 'Nogueira Odontologia de Barroso LTDA', 'Nogueira Odontologia de Barroso LTDA', '7581', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('f2814d58-1ba5-4fbf-a419-b1e0a184de91'::uuid, '36295044', 'Barroso', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ba7d4090-c839-42bd-a63a-73d9fbbe1263'::uuid, '5861865', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('ba7d4090-c839-42bd-a63a-73d9fbbe1263'::uuid, 'Leticia Kahlow', '07384426901', '1997-06-02'::date, 'SC - 21061', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ba7d4090-c839-42bd-a63a-73d9fbbe1263'::uuid, '80730020', 'Curitiba', 'Bigorrilho', 'Apto 603');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6ea3897c-b281-4b7b-a9d6-a0345d4b6984'::uuid, '5797472', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('6ea3897c-b281-4b7b-a9d6-a0345d4b6984'::uuid, 'Maryah Naves Borges Guimarães', '05815475602', '1985-12-12'::date, 'SP - 126536', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6ea3897c-b281-4b7b-a9d6-a0345d4b6984'::uuid, '13840015', 'Mogi Guaçu', 'Centro', 'Segundo andar');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('40e2a930-0db4-4457-a0ea-5a16ea51191d'::uuid, '7369013', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('40e2a930-0db4-4457-a0ea-5a16ea51191d'::uuid, 'Thamara Brito da Silva', '05941916701', '1991-10-31'::date, 'RJ - 43957', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('40e2a930-0db4-4457-a0ea-5a16ea51191d'::uuid, '22745004', 'Rio de Janeiro', 'Freguesia (Jacarepaguá)', 'Sala 731');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f70d0236-adc1-4315-a526-71b5ef4475bd'::uuid, '1559409', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('f70d0236-adc1-4315-a526-71b5ef4475bd'::uuid, 'Sorria Mais Ortho Ltda', 'Sorria Mais Ortho Ltda', '21649', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f70d0236-adc1-4315-a526-71b5ef4475bd'::uuid, '88130090', 'Palhoça', 'Centro', 'SL 201');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('18e9278b-f85f-4311-abb0-06b1c6866b1c'::uuid, '4140714', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('18e9278b-f85f-4311-abb0-06b1c6866b1c'::uuid, 'Elizabeth Rocha Bernabe', '08940359836', '1991-09-17'::date, '42391');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('18e9278b-f85f-4311-abb0-06b1c6866b1c'::uuid, '13025141', 'Campinas', 'Cambuí', 'Sala 62');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d0b2b3d9-223c-4d9f-ac2c-a8cf66416879'::uuid, '3151047', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('d0b2b3d9-223c-4d9f-ac2c-a8cf66416879'::uuid, 'Márcio Augusto Barbosa Lima', '01414987226', '2021-02-05'::date, 'AMAM - 7900', 'AM');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('d0b2b3d9-223c-4d9f-ac2c-a8cf66416879'::uuid, '69120000', 'Itapiranga');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7e2bb994-bfa4-4be7-a74a-ca129bed0e23'::uuid, '6991473', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('7e2bb994-bfa4-4be7-a74a-ca129bed0e23'::uuid, 'S o de queiroz ltda', 'S o de queiroz ltda', '3246', 'AM');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7e2bb994-bfa4-4be7-a74a-ca129bed0e23'::uuid, '69151270', 'Parintins', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8bd3d317-f18a-44f0-ab2e-96dc6d9b6cae'::uuid, '0966587', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('8bd3d317-f18a-44f0-ab2e-96dc6d9b6cae'::uuid, 'G & g odontologia Ltda', 'G & g odontologia Ltda', '110626');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('8bd3d317-f18a-44f0-ab2e-96dc6d9b6cae'::uuid, '13309150', 'Itu', 'Vila Leis');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0ca43422-35b5-4f03-a47c-49eea929ea8d'::uuid, '4212296', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('0ca43422-35b5-4f03-a47c-49eea929ea8d'::uuid, 'FABIANA R BEGNAMI ODONTOLOGIA LTDA', 'FABIANA R BEGNAMI ODONTOLOGIA LTDA', '78558');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('0ca43422-35b5-4f03-a47c-49eea929ea8d'::uuid, '13600170', 'Araras', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9d962a0d-0d6e-4292-ab12-763854be9c3a'::uuid, '9523863', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('9d962a0d-0d6e-4292-ab12-763854be9c3a'::uuid, 'Spa Riso Odontologia Especializada LTDA', 'Spa Riso Odontologia Especializada LTDA', '15333', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9d962a0d-0d6e-4292-ab12-763854be9c3a'::uuid, '74330670', 'Goiânia', 'Jardim Europa', 'SPARISO ODONTOLOGIA EM FRENTE AO HOSP SANTA BÁRBARA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0f4ffaa9-d8a8-44ac-abe6-2bac22596460'::uuid, '7689552', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('0f4ffaa9-d8a8-44ac-abe6-2bac22596460'::uuid, 'Renan Pazetti Souza Dias', '41210702835', '1994-02-26'::date, '125902');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0f4ffaa9-d8a8-44ac-abe6-2bac22596460'::uuid, '13170460', 'Sumaré', 'Parque Franceschini', 'Ap 41');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ddda8110-abd4-4bfa-a79e-1adc5ca0b865'::uuid, '8535745', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('ddda8110-abd4-4bfa-a79e-1adc5ca0b865'::uuid, 'Harmonizare Odontologia Ltda', 'Harmonizare Odontologia Ltda', '4540', 'DF');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ddda8110-abd4-4bfa-a79e-1adc5ca0b865'::uuid, '70790157', 'Brasília', 'Asa Norte', 'Edifício Golden Office, Bloco C salas 305 e 306');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dfd7afd8-eb79-482d-a3f1-6280705d0cb6'::uuid, '2205872', 'PJ', 'Migrado do Bubble. Colaborador: 1760960321978x307593504063646600', '1760960321978x307593504063646600');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('dfd7afd8-eb79-482d-a3f1-6280705d0cb6'::uuid, 'Reis odontologia e medicina integrada', 'Reis odontologia e medicina integrada', '28871', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('dfd7afd8-eb79-482d-a3f1-6280705d0cb6'::uuid, '37550026', 'Pouso Alegre', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a723e281-d81a-452a-a092-bba32d492668'::uuid, '1228573', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('a723e281-d81a-452a-a092-bba32d492668'::uuid, 'VILTON ZIMERMANN DE SOUZA', '52854418034', '1972-09-17'::date, 'RS - 7889', 'RS');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('a723e281-d81a-452a-a092-bba32d492668'::uuid, '89600000', 'Joaçaba', 'odonto vida');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ddcede65-7119-4471-ad4d-9d44787d9779'::uuid, '8457023', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('ddcede65-7119-4471-ad4d-9d44787d9779'::uuid, 'Lima & Ricciardi Ltda', 'Lima & Ricciardi Ltda', 'AC-CD-665', 'AC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('ddcede65-7119-4471-ad4d-9d44787d9779'::uuid, '69905052', 'Rio Branco', 'Cerâmica');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a9ea00e9-d967-4cd0-a204-4c4fd4caf694'::uuid, '7689433', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('a9ea00e9-d967-4cd0-a204-4c4fd4caf694'::uuid, 'Hemily Duarte Silva', '13071760620', '1996-04-13'::date, 'MG - 64564', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a9ea00e9-d967-4cd0-a204-4c4fd4caf694'::uuid, '35065104', 'Governador Valadares', 'Lagoa Santa', 'Apto 201');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('67000a4c-33f5-404b-a29e-515ece14016a'::uuid, '2239935', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('67000a4c-33f5-404b-a29e-515ece14016a'::uuid, 'AZ Mota reabilitações orais', 'AZ Mota reabilitações orais', '53141', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('67000a4c-33f5-404b-a29e-515ece14016a'::uuid, '36010003', 'Juiz de Fora', 'Centro', 'Sala 31');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('206c9780-f601-4017-ad59-a158d7144d79'::uuid, '2232375', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('206c9780-f601-4017-ad59-a158d7144d79'::uuid, 'Mariana Franco Medeiros', '38447397858', '1989-07-08'::date, '107093');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('206c9780-f601-4017-ad59-a158d7144d79'::uuid, '02915100', 'São Paulo', 'Vila Pirituba', 'Apto 104 torre 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7cde3905-853c-40ac-a109-dcaaf5db131a'::uuid, '1424414', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('7cde3905-853c-40ac-a109-dcaaf5db131a'::uuid, 'José Renato do Prado Hueb', '19678255804', '50943');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, complemento) VALUES ('7cde3905-853c-40ac-a109-dcaaf5db131a'::uuid, '04734004', '9° ANDAR CJ 93');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6dcca2cb-9668-42e6-a18a-099ba1535aaa'::uuid, '4197334', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('6dcca2cb-9668-42e6-a18a-099ba1535aaa'::uuid, 'Vitória Rodrigues dos Santos', '09094933675', '2002-05-13'::date, 'MG - 75273', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('6dcca2cb-9668-42e6-a18a-099ba1535aaa'::uuid, '37460000', 'Passa Quatro', 'Rua quilombo bairro quilombo sem número');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3955a870-466d-4eef-a672-ab79f5c969f6'::uuid, '1055084', 'PJ', 'Migrado do Bubble. Colaborador: 1760960811956x525267045364542460', '1760960811956x525267045364542460');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('3955a870-466d-4eef-a672-ab79f5c969f6'::uuid, 'lucy murata odontologia especializada', 'lucy murata odontologia especializada', '69246');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3955a870-466d-4eef-a672-ab79f5c969f6'::uuid, '12917021', 'Bragança Paulista', 'Condomínio Residencial Euroville', 'Sala 103');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b900a19e-ebe4-4f43-a26d-83290f7ac15c'::uuid, '2318887', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('b900a19e-ebe4-4f43-a26d-83290f7ac15c'::uuid, 'DPO SERVICOS ODONTOLOGICOS LTDA', 'DPO SERVICOS ODONTOLOGICOS LTDA', '137827');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b900a19e-ebe4-4f43-a26d-83290f7ac15c'::uuid, '02936000', 'São Paulo', 'Vila Pereira Barreto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('deaaa773-8686-496f-a891-1a9e4589600a'::uuid, '6198656', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('deaaa773-8686-496f-a891-1a9e4589600a'::uuid, 'DMINAS COMERCIAL LTDA', 'DMINAS COMERCIAL LTDA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('deaaa773-8686-496f-a891-1a9e4589600a'::uuid, '36976000', 'Alto Jequitibá', 'EM CIMA DA IGREJA GREMIO ESPÍ');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f5aada5d-8756-4f0d-ab9a-e0e3329ab711'::uuid, '0510591', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('f5aada5d-8756-4f0d-ab9a-e0e3329ab711'::uuid, 'Odontovila odontologia ltda', 'Odontovila odontologia ltda', '10355', 'DF');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f5aada5d-8756-4f0d-ab9a-e0e3329ab711'::uuid, '70802060', 'Brasília', 'Vila Planalto', 'Odontovila');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('79d382eb-d1aa-4ce9-a03f-37427847bc33'::uuid, '6141915', 'PF', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('79d382eb-d1aa-4ce9-a03f-37427847bc33'::uuid, 'Bruna suelen Rodrigues Penna', '13938500654', '2022-08-18'::date, 'MGMGMG - 63673', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('79d382eb-d1aa-4ce9-a03f-37427847bc33'::uuid, '30624000', 'Belo Horizonte', 'Flávio Marques Lisboa (Barreiro)', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2be68dfc-baee-48f5-a211-17ac51e4023e'::uuid, '1389453', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('2be68dfc-baee-48f5-a211-17ac51e4023e'::uuid, 'Alessandra Maria Palmieri Santos', '05034999609', '1980-12-31'::date, 'MG - 32578', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2be68dfc-baee-48f5-a211-17ac51e4023e'::uuid, '36030713', 'Juiz de Fora', 'Estrela Sul', 'Ap 202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c5b1b183-7eee-44b9-a470-6fe69d355108'::uuid, '8998287', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('c5b1b183-7eee-44b9-a470-6fe69d355108'::uuid, 'Ariene Zanini Gaili', '25855423867', '1976-08-04'::date, 'SP - 72708', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c5b1b183-7eee-44b9-a470-6fe69d355108'::uuid, '03307005', 'São Paulo', 'Tatuapé', '15');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('58a4a393-d85c-4b12-ae13-efdc3a545e5d'::uuid, '8640775', 'PF', 'Migrado do Bubble. Colaborador: 1760960484044x820541158713441000', '1760960484044x820541158713441000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('58a4a393-d85c-4b12-ae13-efdc3a545e5d'::uuid, 'Gustavo Morato', '21436381835', '1981-07-18'::date, '013120');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('58a4a393-d85c-4b12-ae13-efdc3a545e5d'::uuid, '88049350', 'Florianópolis', 'Tapera da Base', 'frente de vidro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('91e2b7d9-92a5-45fb-a44d-9ff5b4b10f58'::uuid, '7908906', 'PF', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('91e2b7d9-92a5-45fb-a44d-9ff5b4b10f58'::uuid, 'Talyssa Monike Marcelino Martins', '12431251608', '2022-12-29'::date, 'MGMG - 64681', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('91e2b7d9-92a5-45fb-a44d-9ff5b4b10f58'::uuid, '31615250', 'Belo Horizonte', 'Venda Nova', 'Bloco2/apto904');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('daaabef8-102a-4754-a4e6-f2244d5f1731'::uuid, '6294909', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('daaabef8-102a-4754-a4e6-f2244d5f1731'::uuid, 'Lauro Clemente Cunha', '76071316987', '2026-05-06'::date, 'SC - 3589', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, complemento) VALUES ('daaabef8-102a-4754-a4e6-f2244d5f1731'::uuid, '88015010', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('37f4c76d-2e94-402a-ab63-bd0b5882fb45'::uuid, '7718558', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('37f4c76d-2e94-402a-ab63-bd0b5882fb45'::uuid, 'Romão Adalberto de Souza Mansano', '28851108803', '1980-05-18'::date, '79434');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('37f4c76d-2e94-402a-ab63-bd0b5882fb45'::uuid, '13561003', 'São Carlos', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('40214b6c-e796-47b2-af03-b56389def2b5'::uuid, '5777848', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('40214b6c-e796-47b2-af03-b56389def2b5'::uuid, 'Fernando frannini', '07910947909', '1991-08-15'::date, 'PR - 24186', 'PR');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('40214b6c-e796-47b2-af03-b56389def2b5'::uuid, '82840240', 'Curitiba', 'Bairro Alto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('110a676e-0c1c-4a24-a5de-631425c984da'::uuid, '1206634', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('110a676e-0c1c-4a24-a5de-631425c984da'::uuid, 'Clínica Fabrício Mureb odontologia Ltda', 'Clínica Fabrício Mureb odontologia Ltda', '22383', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('110a676e-0c1c-4a24-a5de-631425c984da'::uuid, '28953570', 'Armação dos Búzios', 'Manguinhos', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6563d0af-159e-4ad6-a178-e96e889b5a8e'::uuid, '0752089', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro_uf) VALUES ('6563d0af-159e-4ad6-a178-e96e889b5a8e'::uuid, 'Ubiratan Goncalves Odontologia Ltda', 'Ubiratan Goncalves Odontologia Ltda', 'GO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('6563d0af-159e-4ad6-a178-e96e889b5a8e'::uuid, '75703050', 'Catalão', 'São João');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5dbdfbb0-f227-45b0-afb4-5c293ea5f192'::uuid, '3714006', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5dbdfbb0-f227-45b0-afb4-5c293ea5f192'::uuid, 'CENTRO ODONTOLÓGICO DE IMPLANTES BRASILEIRO', 'CENTRO ODONTOLÓGICO DE IMPLANTES BRASILEIRO', '15654');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5dbdfbb0-f227-45b0-afb4-5c293ea5f192'::uuid, '06401120', 'Barueri', 'Centro', 'CLINICA ODONTOLÓGICA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6918368d-e8a9-4ae1-acb8-33e98cf9d93e'::uuid, '9014947', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('6918368d-e8a9-4ae1-acb8-33e98cf9d93e'::uuid, 'laboratório odontológico cunha ltda', 'laboratório odontológico cunha ltda', '3927', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('6918368d-e8a9-4ae1-acb8-33e98cf9d93e'::uuid, '35148000', 'Dom Cavati', 'prolab');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8fb01fc7-b8e0-4d28-af6f-b4eb10569b56'::uuid, '0710744', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('8fb01fc7-b8e0-4d28-af6f-b4eb10569b56'::uuid, 'SHERRING ODONTOLOGIA LTDA', 'SHERRING ODONTOLOGIA LTDA', '1038', 'AP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8fb01fc7-b8e0-4d28-af6f-b4eb10569b56'::uuid, '68900110', 'Macapá', 'Central', 'Sala 01');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5762f324-a4ad-4629-a675-60eb869b31e6'::uuid, '2752008', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('5762f324-a4ad-4629-a675-60eb869b31e6'::uuid, 'Bruno Amorim Ventura', '06575338666', '1984-05-17'::date, 'MG - 33573', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5762f324-a4ad-4629-a675-60eb869b31e6'::uuid, '35570542', 'Formiga', 'Vila Irba', 'Consultório odontológico');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ba0d062d-092a-4b42-a4a5-fc40637a5270'::uuid, '7449067', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('ba0d062d-092a-4b42-a4a5-fc40637a5270'::uuid, 'Ma odontologia humanizada LTDA', 'Ma odontologia humanizada LTDA', '11407', 'PB');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ba0d062d-092a-4b42-a4a5-fc40637a5270'::uuid, '58040000', 'João Pessoa', 'Torre', 'Térreo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9fefd8c2-ed10-4b3d-a8e0-a0d013c6bfee'::uuid, '0842445', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('9fefd8c2-ed10-4b3d-a8e0-a0d013c6bfee'::uuid, 'Kamila Aparecida da Cruz', '10110295617', '1999-03-16'::date, 'MG - 58170', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9fefd8c2-ed10-4b3d-a8e0-a0d013c6bfee'::uuid, '36400065', 'Conselheiro Lafaiete', 'Centro', '202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('055f830c-3aea-42fb-a400-905e3d084969'::uuid, '0772854', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('055f830c-3aea-42fb-a400-905e3d084969'::uuid, 'Karolina Ribeiro Saraiva', '41206726890', '1993-06-26'::date, '138333');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('055f830c-3aea-42fb-a400-905e3d084969'::uuid, '05583070', 'São Paulo', 'Jardim Boa Vista (Zona Oeste)', 'Azaleia 171A');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4d793a68-1aee-4a87-aebc-48417cbfba23'::uuid, '6450473', 'PF', 'Migrado do Bubble. Colaborador: 1760960484044x820541158713441000', '1760960484044x820541158713441000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('4d793a68-1aee-4a87-aebc-48417cbfba23'::uuid, 'Waldson Souza', '02857802471', '1980-05-19'::date, 'PB - 3737', 'PB');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4d793a68-1aee-4a87-aebc-48417cbfba23'::uuid, '58030000', 'João Pessoa', 'Estados', 'sala 102');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('64613b2f-55f4-43a0-ac73-055f70b379e9'::uuid, '2728725', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('64613b2f-55f4-43a0-ac73-055f70b379e9'::uuid, 'STUDIO ORAL PREMIUM LTDA', 'STUDIO ORAL PREMIUM LTDA', '4096');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('64613b2f-55f4-43a0-ac73-055f70b379e9'::uuid, '72215507', 'Brasília', 'Ceilândia Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8b43cfce-b12f-4846-ab9d-40b8413eb3b7'::uuid, '7250639', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('8b43cfce-b12f-4846-ab9d-40b8413eb3b7'::uuid, 'Face Sorrisos Odontologia Integrada', 'Face Sorrisos Odontologia Integrada', '137152', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('8b43cfce-b12f-4846-ab9d-40b8413eb3b7'::uuid, '09020000', 'Santo André', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('cdd3f282-d9d1-4e18-a4e0-562fd127f95f'::uuid, '0943732', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('cdd3f282-d9d1-4e18-a4e0-562fd127f95f'::uuid, 'Claudio Rotelli Junior', '21629318850', '1972-12-03'::date, '75718 SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('cdd3f282-d9d1-4e18-a4e0-562fd127f95f'::uuid, '09715030', 'São Bernardo do Campo', 'Centro', '31 B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3bc5a864-8094-4563-a6a8-dba3abacaa55'::uuid, '0828225', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3bc5a864-8094-4563-a6a8-dba3abacaa55'::uuid, 'Rafael Pereira Freitas', '11603943773', '2011-03-03'::date, 'RJRJRJRJ - 38.494', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3bc5a864-8094-4563-a6a8-dba3abacaa55'::uuid, '23894358', 'Seropédica', 'Boa Esperança', 'LOJA B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b59e50c3-777e-4f94-a619-0c09774c292e'::uuid, '2898775', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('b59e50c3-777e-4f94-a619-0c09774c292e'::uuid, 'Antonio dos Reis cury', '87515814772', '2025-11-29'::date, 'RJ - 16513', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b59e50c3-777e-4f94-a619-0c09774c292e'::uuid, '27253220', 'Volta Redonda', 'São João', 'Sala 104');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4c1adb4f-fb46-4e0d-a620-41bc479c6ab0'::uuid, '0174272', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('4c1adb4f-fb46-4e0d-a620-41bc479c6ab0'::uuid, 'Leonardo Fernandes dos Santos', '09980256664', '1989-04-24'::date, 'MG - 44501', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4c1adb4f-fb46-4e0d-a620-41bc479c6ab0'::uuid, '36010240', 'Juiz de Fora', 'Centro', 'Sala 284');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('23d0abfd-41af-4f40-ade4-2a16649ca31b'::uuid, '7570424', 'PF', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('23d0abfd-41af-4f40-ade4-2a16649ca31b'::uuid, 'Darien moreira lepper', '02192296940', '2020-07-09'::date, '139727');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('23d0abfd-41af-4f40-ade4-2a16649ca31b'::uuid, '12940640', 'Atibaia', 'Centro', 'Segundo andar');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('916cb630-d0a7-4483-a9d3-fe5bd35c66c5'::uuid, '3283955', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('916cb630-d0a7-4483-a9d3-fe5bd35c66c5'::uuid, 'Vitreo Dental Lab', 'Vitreo Dental Lab', '10462', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('916cb630-d0a7-4483-a9d3-fe5bd35c66c5'::uuid, '06711500', 'Cotia', 'Jardim da Glória', 'SALA 9');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('10428503-1230-4c6b-afaa-03a45eee5743'::uuid, '4372765', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('10428503-1230-4c6b-afaa-03a45eee5743'::uuid, 'Bárbara Gleice Souza Pereira', '08499858627', '1991-03-07'::date, 'Mg60323');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('10428503-1230-4c6b-afaa-03a45eee5743'::uuid, '36307042', 'São João Del Rei', 'São Judas Tadeu', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7cccb1ca-e3d0-435b-ac61-5f5badecb043'::uuid, '6514926', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('7cccb1ca-e3d0-435b-ac61-5f5badecb043'::uuid, 'José Reinaldo de Carvalho Rezende', '70601933672', '1966-02-20'::date, 'MGMG - 16.582', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('7cccb1ca-e3d0-435b-ac61-5f5badecb043'::uuid, '37370000', 'São Vicente de Minas', 'Clínica');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f6281237-abab-4b17-a6d9-984690b2559b'::uuid, '5772020', 'PJ', 'Migrado do Bubble. Colaborador: 1760960510235x547964187199232900', '1760960510235x547964187199232900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('f6281237-abab-4b17-a6d9-984690b2559b'::uuid, 'CLINICA CARRARO ODONTOLOGIA DIGITAL LTDA', 'CLINICA CARRARO ODONTOLOGIA DIGITAL LTDA', '55551', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f6281237-abab-4b17-a6d9-984690b2559b'::uuid, '13930071', 'Serra Negra', 'Centro', 'andar superior');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('211f8046-a75a-418b-a746-1c71155ffbf6'::uuid, '1237091', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('211f8046-a75a-418b-a746-1c71155ffbf6'::uuid, 'Labodente ltda', 'Labodente ltda', 'Lab-0678');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('211f8046-a75a-418b-a746-1c71155ffbf6'::uuid, '36902051', 'Manhuaçu', 'Baixada');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('574cf662-3778-4716-ad4d-e675e9aa3625'::uuid, '7432192', 'PF', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('574cf662-3778-4716-ad4d-e675e9aa3625'::uuid, 'Noelma Pedrosa Brito', '26766319852', '1974-08-24'::date, 'SP - 70414', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('574cf662-3778-4716-ad4d-e675e9aa3625'::uuid, '03951060', 'São Paulo', 'Jardim Nove de Julho', 'Torre 01, apto 101');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a44fc898-20b1-415f-a89e-7c5752da7008'::uuid, '1679603', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('a44fc898-20b1-415f-a89e-7c5752da7008'::uuid, 'Qualita Odontologia Ltda.', 'Qualita Odontologia Ltda.', '7098', 'Sc');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a44fc898-20b1-415f-a89e-7c5752da7008'::uuid, '89580005', 'Fraiburgo', 'Centro', 'Oralplace');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b0fe73ea-ce3d-4666-a55d-b7490591411a'::uuid, '5048491', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b0fe73ea-ce3d-4666-a55d-b7490591411a'::uuid, 'Anderson dos Santos Costa', '00900497130', '1988-03-22'::date, '12090');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('b0fe73ea-ce3d-4666-a55d-b7490591411a'::uuid, '73790000', 'Cavalcante');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3c343ddb-4a7e-4192-aac1-429c3b87ffa8'::uuid, '3845201', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3c343ddb-4a7e-4192-aac1-429c3b87ffa8'::uuid, 'Claudia Avelar burger', '91468833987', '1994-12-26'::date, 'SCSC - 6585', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3c343ddb-4a7e-4192-aac1-429c3b87ffa8'::uuid, '88301350', 'Itajaí', 'Centro', 'Sala 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('12c53346-c7e8-44a7-a5c5-6a036a513763'::uuid, '4465568', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('12c53346-c7e8-44a7-a5c5-6a036a513763'::uuid, 'CLINICA ODONTOLOGIA SILVA RIBEIRO LTDA', 'CLINICA ODONTOLOGIA SILVA RIBEIRO LTDA', '032325');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('12c53346-c7e8-44a7-a5c5-6a036a513763'::uuid, '13207684', 'Jundiaí', 'Bela Vista');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6a44008a-9424-4aa1-a80d-f7bf88e2ddad'::uuid, '9360364', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('6a44008a-9424-4aa1-a80d-f7bf88e2ddad'::uuid, 'JAIME WILFREDO SOTO PARDO ODONTOLOGIA LTDA', 'JAIME WILFREDO SOTO PARDO ODONTOLOGIA LTDA', '9123', 'DF');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6a44008a-9424-4aa1-a80d-f7bf88e2ddad'::uuid, '71572315', 'Brasília', 'Paranoá', 'Ao lado do sabin');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b836530c-3ce9-4da5-a820-fa85883da40c'::uuid, '5257288', 'PF', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b836530c-3ce9-4da5-a820-fa85883da40c'::uuid, 'Joyce de Souza Castellano', '46683086842', '1997-10-29'::date, '144815');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b836530c-3ce9-4da5-a820-fa85883da40c'::uuid, '02883070', 'São Paulo', 'Vila Nova Parada');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('05db142c-f53f-4380-af28-345fed284392'::uuid, '5081422', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('05db142c-f53f-4380-af28-345fed284392'::uuid, 'Master Odonto de Piraju', 'Master Odonto de Piraju', '1317-3');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('05db142c-f53f-4380-af28-345fed284392'::uuid, '18800370', 'Piraju', 'Jardim Jurumirim');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('72065261-e497-4eef-ac3e-162a90ce0303'::uuid, '2594898', 'PF', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('72065261-e497-4eef-ac3e-162a90ce0303'::uuid, 'Bruno Abdalla Caetano', '12436622639', '2024-12-06'::date, 'MGMG - 75101', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('72065261-e497-4eef-ac3e-162a90ce0303'::uuid, '37207622', 'Lavras', 'Ouro Verde', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2df5fd4a-6e61-4592-ae4e-c501a2ec4610'::uuid, '7359568', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2df5fd4a-6e61-4592-ae4e-c501a2ec4610'::uuid, 'DG ODONTOLOGIA', 'DG ODONTOLOGIA', '1718');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2df5fd4a-6e61-4592-ae4e-c501a2ec4610'::uuid, '70770100', 'Brasília', 'Asa Norte', 'Edifício Jaime Leal - sala 133');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b94ab06c-ceb2-4a67-a8aa-360a149ad292'::uuid, '2416961', 'PF', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('b94ab06c-ceb2-4a67-a8aa-360a149ad292'::uuid, 'Alessandro Rodrigues nunes', '05550566605', '1982-12-20'::date, 'MG - 38171', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b94ab06c-ceb2-4a67-a8aa-360a149ad292'::uuid, '30692350', 'Belo Horizonte', 'Jatobá (Barreiro)', 'Loja de esquina');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2b1e87b8-3764-4fcc-addb-83e31638daec'::uuid, '9605722', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('2b1e87b8-3764-4fcc-addb-83e31638daec'::uuid, 'Júlia Silva Marques', '11375891677', '1997-12-30'::date, 'MG - 58166', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('2b1e87b8-3764-4fcc-addb-83e31638daec'::uuid, '36660000', 'Além Paraíba', 'Av. Olimpio cortes, bairro jardim santa rosa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('31c7f7df-2df7-4924-a642-4f68245af9e6'::uuid, '4136949', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('31c7f7df-2df7-4924-a642-4f68245af9e6'::uuid, 'Rodrigo Soares Pasini', '04450395743', '1976-05-21'::date, 'RJ - 22.604');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('31c7f7df-2df7-4924-a642-4f68245af9e6'::uuid, '24350310', 'Niterói', 'Piratininga', 'Loja 209 - Shopping Barravento');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3b32da21-3c1e-4aa2-a51a-b7eb62b4ca8a'::uuid, '5067839', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('3b32da21-3c1e-4aa2-a51a-b7eb62b4ca8a'::uuid, 'SIMPLE DIGITAL LAB ITU LTDA', 'SIMPLE DIGITAL LAB ITU LTDA', '76709');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3b32da21-3c1e-4aa2-a51a-b7eb62b4ca8a'::uuid, '13303532', 'Itu', 'Itu Novo Centro', 'PISO SUPERIOR');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('13424439-5477-4e03-ab7f-2ab7f6082824'::uuid, '4365431', 'PJ', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('13424439-5477-4e03-ab7f-2ab7f6082824'::uuid, 'Proa serviços odontológicos', 'Proa serviços odontológicos', '41141');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('13424439-5477-4e03-ab7f-2ab7f6082824'::uuid, '21862005', 'Rio de Janeiro', 'Bangu', 'Sala 201');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('eb73f6ff-b6d6-4004-aad5-665636f59130'::uuid, '2615991', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('eb73f6ff-b6d6-4004-aad5-665636f59130'::uuid, 'Rayana Soares de Andrade', '09961053605', '1994-01-27'::date, 'MG - 68698', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('eb73f6ff-b6d6-4004-aad5-665636f59130'::uuid, '39710000', 'Coroaci', 'Rua Antônio Pereira Ramos, 32, Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8f64dbfa-7eeb-4e4c-ad50-332f8cf9f51f'::uuid, '7917538', 'PJ', 'Migrado do Bubble. Colaborador: 1760960600443x741639706693608400', '1760960600443x741639706693608400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('8f64dbfa-7eeb-4e4c-ad50-332f8cf9f51f'::uuid, 'TEOCAM COM. DE MAT. ODONTOLÓGICO LTDA', 'TEOCAM COM. DE MAT. ODONTOLÓGICO LTDA', '91276');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8f64dbfa-7eeb-4e4c-ad50-332f8cf9f51f'::uuid, '01001001', 'São Paulo', 'Sé', 'SALA 1010');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2ae1519b-211e-44dc-aadd-c983387ce0f3'::uuid, '0492420', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2ae1519b-211e-44dc-aadd-c983387ce0f3'::uuid, 'Luiz Henrique Dias', '03622188111', '1990-04-26'::date, 'GO23765');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2ae1519b-211e-44dc-aadd-c983387ce0f3'::uuid, '74610190', 'Goiânia', 'Setor Leste Universitário', 'Apto 1303/ residencial Arte Home');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fdb68344-b345-4c7f-a37b-ae4589b2b773'::uuid, '8137914', 'PJ', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('fdb68344-b345-4c7f-a37b-ae4589b2b773'::uuid, 'Carga Express Próteses Odontológicas LTDA', 'Carga Express Próteses Odontológicas LTDA', '013120');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('fdb68344-b345-4c7f-a37b-ae4589b2b773'::uuid, '88049350', 'Florianópolis', 'Tapera da Base', 'Frente de vidro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5fec44bf-1066-40dc-a1c2-c7a436783b6f'::uuid, '0917809', 'PF', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('5fec44bf-1066-40dc-a1c2-c7a436783b6f'::uuid, 'Ricardo Bruno da Silva', '73141933120', '1986-04-19'::date, 'Go 117690');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5fec44bf-1066-40dc-a1c2-c7a436783b6f'::uuid, '75135490', 'Anápolis', 'Víviam Parque', 'Qd 65 lt 04 sala 01 Ridente Odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2bbad6ea-0a0d-4de9-a957-2a4e2d23ff1d'::uuid, '8004752', 'PJ', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2bbad6ea-0a0d-4de9-a957-2a4e2d23ff1d'::uuid, 'Espaço Sorrir Consultório Odontológico', 'Espaço Sorrir Consultório Odontológico', '031187');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2bbad6ea-0a0d-4de9-a957-2a4e2d23ff1d'::uuid, '16700009', 'Guararapes', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a21fdb1b-e4ff-447f-a67f-5724384484e2'::uuid, '9913110', 'PJ', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('a21fdb1b-e4ff-447f-a67f-5724384484e2'::uuid, 'CLINICA CORREA CORREIA ODONTOLOGIA', 'CLINICA CORREA CORREIA ODONTOLOGIA', '150580', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a21fdb1b-e4ff-447f-a67f-5724384484e2'::uuid, '02450001', 'São Paulo', 'Santa Teresinha', 'CASA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1501694a-2516-4de1-af7c-66ec8ddbf48f'::uuid, '4233021', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1501694a-2516-4de1-af7c-66ec8ddbf48f'::uuid, 'Henrique Ferreira Odontologia Especializada', 'Henrique Ferreira Odontologia Especializada', '17850');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1501694a-2516-4de1-af7c-66ec8ddbf48f'::uuid, '74685020', 'Goiânia', 'Vila Jardim São Judas Tadeu', 'quadra 20 lote 22');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ccf353c5-136c-4d59-a3c1-267a15fece9e'::uuid, '8041226', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('ccf353c5-136c-4d59-a3c1-267a15fece9e'::uuid, 'CMC CLINICA ODONTOLÓGICA LTDA ME', 'CMC CLINICA ODONTOLÓGICA LTDA ME', '61698');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ccf353c5-136c-4d59-a3c1-267a15fece9e'::uuid, '09750730', 'São Bernardo do Campo', 'Centro', 'Sala 721');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8dce24c4-b66f-469e-a0b1-ccda0d1342a5'::uuid, '7340471', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8dce24c4-b66f-469e-a0b1-ccda0d1342a5'::uuid, 'Natieli Guilherme Zeferino', '08836109900', '1995-08-15'::date, '15798');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('8dce24c4-b66f-469e-a0b1-ccda0d1342a5'::uuid, '89874000', 'Maravilha', 'Ed Stiler');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e964d8d6-7bd7-4250-acc3-8ec32fb704ec'::uuid, '1421467', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e964d8d6-7bd7-4250-acc3-8ec32fb704ec'::uuid, 'HASS JUNIOR E THOMAZELLI ARENT LTDA', 'HASS JUNIOR E THOMAZELLI ARENT LTDA', '17206');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('e964d8d6-7bd7-4250-acc3-8ec32fb704ec'::uuid, '88385000', 'Penha', 'Oralclin');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b778fb9b-f348-4167-a734-ff353776cf5d'::uuid, '2633846', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b778fb9b-f348-4167-a734-ff353776cf5d'::uuid, 'Vitória Iolanda Peinado de Sousa', '47297618802', '1999-06-26'::date, 'Sp 150442');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b778fb9b-f348-4167-a734-ff353776cf5d'::uuid, '02410010', 'São Paulo', 'Vila Aurora (Zona Norte)', 'Ap72');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2299ef92-b294-4647-ad36-a225b9f85982'::uuid, '9626414', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2299ef92-b294-4647-ad36-a225b9f85982'::uuid, 'ESA SMILE ODONTOLOGIA LTDA', 'ESA SMILE ODONTOLOGIA LTDA', 'MA-004532');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, complemento) VALUES ('2299ef92-b294-4647-ad36-a225b9f85982'::uuid, '65901610', 'CLINICA EM FRENTE AO MATEUS SUPERMECADO');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('19c7eafa-b3c0-4a2e-ad47-a0de60ae80e1'::uuid, '4498526', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('19c7eafa-b3c0-4a2e-ad47-a0de60ae80e1'::uuid, 'OdontoClass Porto Feliz Eireli', 'OdontoClass Porto Feliz Eireli', '99382');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('19c7eafa-b3c0-4a2e-ad47-a0de60ae80e1'::uuid, '18540061', 'Porto Feliz', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3ec4ec05-98c7-4c6d-adaa-fd2514174d50'::uuid, '9876542', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('3ec4ec05-98c7-4c6d-adaa-fd2514174d50'::uuid, 'Haylane Souza da Silva', '13510503708', '1992-04-21'::date, 'RJ - 42911', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3ec4ec05-98c7-4c6d-adaa-fd2514174d50'::uuid, '27260200', 'Volta Redonda', 'Vila Santa Cecília', 'Shopping 33, Torre II, sala 1509');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('296fc580-f7e1-4415-a245-8ccce736faa1'::uuid, '4425992', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('296fc580-f7e1-4415-a245-8ccce736faa1'::uuid, 'Mônica Moás', '07167050792', '2000-08-16'::date, 'RJRJ - 26175', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('296fc580-f7e1-4415-a245-8ccce736faa1'::uuid, '20051040', 'Rio de Janeiro', 'Centro', 'Sobreloja 202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ab4f1069-e11b-41b4-a423-313a03c741bc'::uuid, '6146177', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ab4f1069-e11b-41b4-a423-313a03c741bc'::uuid, 'Graziela Tangari Meira', '04309018602', '1978-01-16'::date, '40331');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('ab4f1069-e11b-41b4-a423-313a03c741bc'::uuid, '39100000', 'Diamantina', 'Tangari Odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d1bced87-20ae-425e-a697-fb9b524e8287'::uuid, '6587792', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('d1bced87-20ae-425e-a697-fb9b524e8287'::uuid, 'Clínica Odontológica Ferreira e Puzzoni LTDA', 'Clínica Odontológica Ferreira e Puzzoni LTDA', '149445');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d1bced87-20ae-425e-a697-fb9b524e8287'::uuid, '12940630', 'Atibaia', 'Centro', 'Clínica Rizzo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f27c43ad-a636-4ea4-aff9-5d5b3a4c2849'::uuid, '7845646', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('f27c43ad-a636-4ea4-aff9-5d5b3a4c2849'::uuid, 'Carolina Bessa Bueno Matos', '47693201831', '2024-02-16'::date, 'SP161680');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f27c43ad-a636-4ea4-aff9-5d5b3a4c2849'::uuid, '01508020', 'São Paulo', 'Liberdade', 'Apto 94');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1350dfce-5590-4b6a-a6b3-468d0523c349'::uuid, '3540702', 'PF', 'Migrado do Bubble. Colaborador: 1760960224446x585510211041943400', '1760960224446x585510211041943400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('1350dfce-5590-4b6a-a6b3-468d0523c349'::uuid, 'Higor César souza melo', '13609266660', '1997-11-10'::date, 'MG 65906');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1350dfce-5590-4b6a-a6b3-468d0523c349'::uuid, '36016905', 'Juiz de Fora', 'Centro', 'Sala 1505');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0cba5dfa-3f6a-45f0-a0be-367ee85cb41e'::uuid, '7588113', 'PF', 'Migrado do Bubble. Colaborador: 1771934581868x271800717018472860', '1771934581868x271800717018472860');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('0cba5dfa-3f6a-45f0-a0be-367ee85cb41e'::uuid, 'Julia kaster schwantz', '02694744044', '2015-12-10'::date, 'RSRS - 23781', 'RS');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('0cba5dfa-3f6a-45f0-a0be-367ee85cb41e'::uuid, '96015730', 'Pelotas', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('51a84b56-cc44-4852-af35-7575d7f3d2bf'::uuid, '7662466', 'PF', 'Migrado do Bubble. Colaborador: 1771934581868x271800717018472860', '1771934581868x271800717018472860');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('51a84b56-cc44-4852-af35-7575d7f3d2bf'::uuid, 'Geise Cristiane Teixeira Fernandes', '28649607888', '1979-03-11'::date, 'SP - 121309', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('51a84b56-cc44-4852-af35-7575d7f3d2bf'::uuid, '04571000', 'São Paulo', 'Cidade Monções', 'cj. 121 e 122');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('172e9a30-8225-432f-a117-977a3dfa6084'::uuid, '4641656', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('172e9a30-8225-432f-a117-977a3dfa6084'::uuid, 'Clínica de Odontologia Faria Ltda', 'Clínica de Odontologia Faria Ltda', '86839');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('172e9a30-8225-432f-a117-977a3dfa6084'::uuid, '12910401', 'Bragança Paulista', 'Jardim Doutor Júlio de Mesquita Filho');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('74412372-6559-4ad3-a8e4-f5a6ce46c4fa'::uuid, '1603559', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('74412372-6559-4ad3-a8e4-f5a6ce46c4fa'::uuid, 'GUSTAVO MASCARENHAS TEIXEIRA', '15850095802', '2025-12-22'::date, 'SP 58554');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('74412372-6559-4ad3-a8e4-f5a6ce46c4fa'::uuid, '13075490', 'Campinas', 'Jardim Nossa Senhora Auxiliadora');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('377bb4b6-f4da-420b-a76b-ff1f4d8f2c8d'::uuid, '3649641', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('377bb4b6-f4da-420b-a76b-ff1f4d8f2c8d'::uuid, 'Leidiane Oliveira', '03578743151', '2026-02-26'::date, 'Mg 70103');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('377bb4b6-f4da-420b-a76b-ff1f4d8f2c8d'::uuid, '38400402', 'Uberlândia', 'Osvaldo Rezende', 'Clínica cio');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('53ec70ef-3f42-4704-a458-98dffc281183'::uuid, '7148429', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('53ec70ef-3f42-4704-a458-98dffc281183'::uuid, 'Priscila westphal Ribeiro', '21696744890', '1980-04-03'::date, 'Sp 82418');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('53ec70ef-3f42-4704-a458-98dffc281183'::uuid, '04089000', 'São Paulo', 'Indianópolis', 'Predio comercial 5 andar cj 501');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8d8db9fa-909c-445c-abef-b720cf0d6737'::uuid, '6693593', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('8d8db9fa-909c-445c-abef-b720cf0d6737'::uuid, 'PSANTOS ODONTOLOGIA', 'PSANTOS ODONTOLOGIA', '7653');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8d8db9fa-909c-445c-abef-b720cf0d6737'::uuid, '25620000', 'Petrópolis', 'Centro', 'Sl. 716');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5cdffa8c-f41e-4cc2-a87d-5d282c9cf4bc'::uuid, '0957624', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('5cdffa8c-f41e-4cc2-a87d-5d282c9cf4bc'::uuid, 'Nilo Edgard Faria Júnior', '54871360172', '1971-07-22'::date, 'GO 4479');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5cdffa8c-f41e-4cc2-a87d-5d282c9cf4bc'::uuid, '74215170', 'Goiânia', 'Setor Bueno', 'Sala 1008');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('84898ea5-42fd-4d80-a0eb-56ceae0d653f'::uuid, '5520663', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('84898ea5-42fd-4d80-a0eb-56ceae0d653f'::uuid, 'BRUNO ODONTOLOGIA LTDA', 'BRUNO ODONTOLOGIA LTDA', '54386');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('84898ea5-42fd-4d80-a0eb-56ceae0d653f'::uuid, '38061050', 'Uberaba', 'Mercês');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e3475e8b-a4e9-42ef-ad6d-f6233a7783f9'::uuid, '1844382', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e3475e8b-a4e9-42ef-ad6d-f6233a7783f9'::uuid, 'Gransorriso Odontologia LTDA', 'Gransorriso Odontologia LTDA', '023062');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e3475e8b-a4e9-42ef-ad6d-f6233a7783f9'::uuid, '07776435', 'Cajamar', 'Jordanésia (Jordanésia)');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6269d06f-3583-4fda-a389-9c8dbe683193'::uuid, '0911290', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('6269d06f-3583-4fda-a389-9c8dbe683193'::uuid, 'Bueno odontologia ltda', 'Bueno odontologia ltda', '031195');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6269d06f-3583-4fda-a389-9c8dbe683193'::uuid, '16010285', 'Araçatuba', 'Centro', 'Clinica espaço sorrir');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('52f82fee-09e6-430a-ae61-eba6502e2240'::uuid, '0121668', 'PJ', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('52f82fee-09e6-430a-ae61-eba6502e2240'::uuid, 'Janete de Almeida Sampaio Odontologia Ltda', 'Janete de Almeida Sampaio Odontologia Ltda', '37006', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('52f82fee-09e6-430a-ae61-eba6502e2240'::uuid, '02229000', 'São Paulo', 'Parque Edu Chaves');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c199bf1b-f4ad-4a4f-ac73-e10974be3485'::uuid, '1499400', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('c199bf1b-f4ad-4a4f-ac73-e10974be3485'::uuid, 'CARVALHO E BARBOSA', 'CARVALHO E BARBOSA', '223');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('c199bf1b-f4ad-4a4f-ac73-e10974be3485'::uuid, '69301110', 'Boa Vista', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ff2121c2-3a39-42c6-abd9-38f99eca4d22'::uuid, '2881439', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ff2121c2-3a39-42c6-abd9-38f99eca4d22'::uuid, 'Hiago Gomes Duarte Pires Dias', '10260053616', '2022-09-26'::date, 'MG 64130');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ff2121c2-3a39-42c6-abd9-38f99eca4d22'::uuid, '36246024', 'Santos Dumont', 'São Sebastião', 'Clínica Oraldents');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e78fc10e-a1ef-4a90-a4fd-c02fe91e02ba'::uuid, '8838872', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e78fc10e-a1ef-4a90-a4fd-c02fe91e02ba'::uuid, 'CLINICA ODONTOLOGICA CHIHARA LTDA', 'CLINICA ODONTOLOGICA CHIHARA LTDA', '29460');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e78fc10e-a1ef-4a90-a4fd-c02fe91e02ba'::uuid, '08110150', 'São Paulo', 'Vila Silva Teles');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2c4e5ebf-a1cc-4caa-a5bb-ead5c5815975'::uuid, '9901123', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2c4e5ebf-a1cc-4caa-a5bb-ead5c5815975'::uuid, 'POZATTA ODONTOLOGIA LTDA', 'POZATTA ODONTOLOGIA LTDA', '0005167');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2c4e5ebf-a1cc-4caa-a5bb-ead5c5815975'::uuid, '88200108', 'Tijucas', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('939c1595-22b5-483b-a4eb-2a470d2d4216'::uuid, '4763944', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('939c1595-22b5-483b-a4eb-2a470d2d4216'::uuid, 'Aline Toledo Bastos', '08455850612', '1988-10-11'::date, 'MG 39298');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('939c1595-22b5-483b-a4eb-2a470d2d4216'::uuid, '35065100', 'Governador Valadares', 'Lagoa Santa', 'Apartamento 101');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('79ff92a6-2622-4622-a926-05d371511d07'::uuid, '6225517', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('79ff92a6-2622-4622-a926-05d371511d07'::uuid, 'CONCEPT ODONTO MONTE CARMELO LTDA', 'CONCEPT ODONTO MONTE CARMELO LTDA', '57669');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('79ff92a6-2622-4622-a926-05d371511d07'::uuid, '38500000', 'Monte Carmelo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5711e63d-4e61-445b-a6e6-bdcd848d55f3'::uuid, '5573213', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5711e63d-4e61-445b-a6e6-bdcd848d55f3'::uuid, 'SW ODONTOLOGIA INTEGRADA', 'SW ODONTOLOGIA INTEGRADA', '46703');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5711e63d-4e61-445b-a6e6-bdcd848d55f3'::uuid, '25953390', 'Teresópolis', 'Várzea', 'sobrado');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ed49ee07-8222-491f-abe3-8923dbc088b4'::uuid, '0794057', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ed49ee07-8222-491f-abe3-8923dbc088b4'::uuid, 'Lilian Mohamad Khalil', '11460395816', '1972-07-10'::date, 'SP-CD-11337');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ed49ee07-8222-491f-abe3-8923dbc088b4'::uuid, '15015705', 'São José do Rio Preto', 'Vila Nossa Senhora de Fátima', 'Bloco 6 AP 22');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e257cbf1-315e-46bd-aa5f-37903904c13c'::uuid, '2850263', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e257cbf1-315e-46bd-aa5f-37903904c13c'::uuid, 'Leandro de Menezes Jorge', 'Leandro de Menezes Jorge', '98822');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e257cbf1-315e-46bd-aa5f-37903904c13c'::uuid, '14505006', 'Ituverava', 'Vila São Francisco');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e62e0772-7028-42e6-a7fd-3540eacb3703'::uuid, '5768629', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('e62e0772-7028-42e6-a7fd-3540eacb3703'::uuid, 'Eduardo Gonçalves de Oliveira', '01068257717', '1970-05-11'::date, 'RJ-19927');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e62e0772-7028-42e6-a7fd-3540eacb3703'::uuid, '20520051', 'Rio de Janeiro', 'Tijuca', 'Sala 707');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('25afa1f6-65bb-4321-abee-b31f355db915'::uuid, '6948852', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('25afa1f6-65bb-4321-abee-b31f355db915'::uuid, 'Philippe Moreira', '07987963755', '1976-05-16'::date, 'Rj27223');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('25afa1f6-65bb-4321-abee-b31f355db915'::uuid, '28610460', 'Nova Friburgo', 'Centro', '108');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8ab28b4a-235f-4017-a70b-88691be7286f'::uuid, '1828608', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8ab28b4a-235f-4017-a70b-88691be7286f'::uuid, 'Claudia Giannini Cônsolo', '12029927813', '1966-03-29'::date, 'SP36959');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8ab28b4a-235f-4017-a70b-88691be7286f'::uuid, '06713630', 'Cotia', 'Jardim São Vicente', 'sala 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4b3d9609-a399-426d-ab44-20350e55fae2'::uuid, '6837285', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4b3d9609-a399-426d-ab44-20350e55fae2'::uuid, 'Frederico de Souza', '01483167194', '1990-03-11'::date, 'Goiás 12303');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4b3d9609-a399-426d-ab44-20350e55fae2'::uuid, '74215200', 'Goiânia', 'Setor Bueno', 'Apto 1102');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7ccec5ad-383e-4f6e-a2e8-b25107b61191'::uuid, '0462689', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('7ccec5ad-383e-4f6e-a2e8-b25107b61191'::uuid, 'Pedro Longo de Souza Ribeiro', '41822980801', '1992-04-27'::date, '129867');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7ccec5ad-383e-4f6e-a2e8-b25107b61191'::uuid, '13025087', 'Campinas', 'Cambuí', 'Apto 111');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0b97c174-8ada-45f4-a712-ded6fa722ddc'::uuid, '7760370', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('0b97c174-8ada-45f4-a712-ded6fa722ddc'::uuid, 'ALESSANDRO H N PINHEIRO LTDA', 'ALESSANDRO H N PINHEIRO LTDA', '020793', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0b97c174-8ada-45f4-a712-ded6fa722ddc'::uuid, '27600026', 'Valença', 'Centro', 'sala 309');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('cc745680-d07b-4ebd-a6f3-04aa97a90d5e'::uuid, '0047508', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento) VALUES ('cc745680-d07b-4ebd-a6f3-04aa97a90d5e'::uuid, 'Pedro Henrique Sá Neves', '11719732680', '1997-10-20'::date);
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('cc745680-d07b-4ebd-a6f3-04aa97a90d5e'::uuid, '35057070', 'Governador Valadares', 'Grã-Duquesa', 'Apto 302');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('01b8a447-f9ce-4206-a172-33588503bed2'::uuid, '7471850', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('01b8a447-f9ce-4206-a172-33588503bed2'::uuid, 'M. Mais Clinica Medica e Odontologica Ltda', 'M. Mais Clinica Medica e Odontologica Ltda');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('01b8a447-f9ce-4206-a172-33588503bed2'::uuid, '88301041', 'Itajaí', 'Centro', 'Térreo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9bceab7b-17c5-4b26-a645-fa3eb6c7de46'::uuid, '9661043', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('9bceab7b-17c5-4b26-a645-fa3eb6c7de46'::uuid, 'CONCEITO DIGITAL LTDA', 'CONCEITO DIGITAL LTDA', '3833', 'PB');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9bceab7b-17c5-4b26-a645-fa3eb6c7de46'::uuid, '21061560', 'Rio de Janeiro', 'Inhaúma', 'casa 84');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ed41a73d-95ef-4d05-a72c-10782b0f2aed'::uuid, '7195623', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ed41a73d-95ef-4d05-a72c-10782b0f2aed'::uuid, 'Amilcar Chagas Freitas Júnior', '88927547349', '1981-08-10'::date, 'RN CD 3923');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('ed41a73d-95ef-4d05-a72c-10782b0f2aed'::uuid, '59020240', 'Natal', 'Tirol');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3d797618-612d-4f34-a7cb-4e9562055c4f'::uuid, '5929519', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('3d797618-612d-4f34-a7cb-4e9562055c4f'::uuid, 'CARLOS HENRIQUE LEITÃO - ODONTOLOGIA', 'CARLOS HENRIQUE LEITÃO - ODONTOLOGIA', '33565');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3d797618-612d-4f34-a7cb-4e9562055c4f'::uuid, '04551010', 'São Paulo', 'Vila Olímpia', 'cj 54');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('976585f1-777f-407e-a30c-2e6fda321a70'::uuid, '3728516', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('976585f1-777f-407e-a30c-2e6fda321a70'::uuid, 'BRCH LTDA', 'BRCH LTDA', '006982');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('976585f1-777f-407e-a30c-2e6fda321a70'::uuid, '68540000', 'Conceição do Araguaia', 'PREDIO');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('33b5a2a4-017b-4d00-a4d7-9f38fe4cce69'::uuid, '9455672', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('33b5a2a4-017b-4d00-a4d7-9f38fe4cce69'::uuid, 'Amanda felizardo magre de Amorim', '09587279700', '1982-09-05'::date, 'RJ 34442');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('33b5a2a4-017b-4d00-a4d7-9f38fe4cce69'::uuid, '22641680', 'Rio de Janeiro', 'Itanhangá', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('276bc2d4-8a57-4640-aa46-5a19e6997b1b'::uuid, '1209339', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('276bc2d4-8a57-4640-aa46-5a19e6997b1b'::uuid, 'CRISTIANA GODOY SARTORI  LTDA', 'CRISTIANA GODOY SARTORI  LTDA', '40.120');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('276bc2d4-8a57-4640-aa46-5a19e6997b1b'::uuid, '13419080', 'Piracicaba', 'Cidade Alta', '52');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0876ba51-e6d7-475e-a32a-4d1a6d3dd9c6'::uuid, '0081671', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('0876ba51-e6d7-475e-a32a-4d1a6d3dd9c6'::uuid, 'Márcia Cristina Antunes da Cunha', '82611530700', '16459');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0876ba51-e6d7-475e-a32a-4d1a6d3dd9c6'::uuid, '20560040', 'Rio de Janeiro', 'Vila Isabel', 'Apto 402');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('838e2d50-117d-46bb-a60c-b07bbe09a2fb'::uuid, '4115403', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('838e2d50-117d-46bb-a60c-b07bbe09a2fb'::uuid, 'BRUNO CHARLES FREITAS SILVA', '99157012253', '1989-04-04'::date, '006982');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('838e2d50-117d-46bb-a60c-b07bbe09a2fb'::uuid, '68540000', 'Conceição do Araguaia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ab91b849-b06d-457b-a493-c8ecfe67c269'::uuid, '1265145', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ab91b849-b06d-457b-a493-c8ecfe67c269'::uuid, 'Claudia Regina Rodrigues Vieira', '78519020100', '1976-04-18'::date, '5679');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ab91b849-b06d-457b-a493-c8ecfe67c269'::uuid, '74730280', 'Goiânia', 'Conjunto Riviera', 'Esq com Av Liberdade qd 31 LT 38');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('56a7a3eb-8b62-45a9-ac65-f385958fe449'::uuid, '3696705', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('56a7a3eb-8b62-45a9-ac65-f385958fe449'::uuid, 'Gabrielle Duarte rego p', '17166062762', '2024-03-04'::date, 'RJ - 56148', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('56a7a3eb-8b62-45a9-ac65-f385958fe449'::uuid, '25680195', 'Petrópolis', 'Centro', 'Ap 105');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e0bf3563-b772-48bc-a2e0-664dc9272f0b'::uuid, '9527799', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e0bf3563-b772-48bc-a2e0-664dc9272f0b'::uuid, 'MONIQUE MISSAE FUJIWARA ME', 'MONIQUE MISSAE FUJIWARA ME', '68648');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e0bf3563-b772-48bc-a2e0-664dc9272f0b'::uuid, '13208760', 'Jundiaí', 'Jardim Ana Maria', 'conj 901 Edifício Helbor');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('afa3e01a-d51d-401f-ace9-23f77f939537'::uuid, '4438782', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('afa3e01a-d51d-401f-ace9-23f77f939537'::uuid, 'INSTITUTO MAIS IDENTIDADE', 'INSTITUTO MAIS IDENTIDADE', 'SP-029746');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('afa3e01a-d51d-401f-ace9-23f77f939537'::uuid, '04057000', 'São Paulo', 'Planalto Paulista', '-');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('bac73871-4e22-4bb9-a9fc-2f3eb094db5a'::uuid, '2410686', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('bac73871-4e22-4bb9-a9fc-2f3eb094db5a'::uuid, 'Clarissa Noemy Yoshinaga Chiba', '25762808890', '1994-08-23'::date, 'SP 52067');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('bac73871-4e22-4bb9-a9fc-2f3eb094db5a'::uuid, '04045003', 'São Paulo', 'Mirandópolis', 'Cj607');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dd4a2d04-745a-482f-a090-f0d4521861bd'::uuid, '4664344', 'PJ', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('dd4a2d04-745a-482f-a090-f0d4521861bd'::uuid, 'VERSA ODONTOLOGIA LTDA', 'VERSA ODONTOLOGIA LTDA', '41015', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('dd4a2d04-745a-482f-a090-f0d4521861bd'::uuid, '36010060', 'Juiz de Fora', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('13ada8e9-9190-42fa-a792-55211541fdda'::uuid, '3897244', 'PJ', 'Migrado do Bubble. Colaborador: 1760960893640x709281357527038500', '1760960893640x709281357527038500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('13ada8e9-9190-42fa-a792-55211541fdda'::uuid, 'ORE Odontologia Reabilitadora e Estética LTDA', 'ORE Odontologia Reabilitadora e Estética LTDA', '24282', 'PR');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('13ada8e9-9190-42fa-a792-55211541fdda'::uuid, '81130180', 'Curitiba', 'Capão Raso', 'Apto 903.');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('70f953aa-92d4-4256-a002-da2257ff88bf'::uuid, '9170987', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('70f953aa-92d4-4256-a002-da2257ff88bf'::uuid, 'CATIA MOLENA ODONTOLOGIA LTDA', 'CATIA MOLENA ODONTOLOGIA LTDA', '70121');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('70f953aa-92d4-4256-a002-da2257ff88bf'::uuid, '09850300', 'São Bernardo do Campo', 'Assunção', 'SALA 06');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5bd829f8-e2d9-4eb6-a847-934f488629b0'::uuid, '4558192', 'PJ', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5bd829f8-e2d9-4eb6-a847-934f488629b0'::uuid, 'Clinica Odontológica de Implantodontia Avançada', 'Clinica Odontológica de Implantodontia Avançada', '37560');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5bd829f8-e2d9-4eb6-a847-934f488629b0'::uuid, '35140000', 'Tarumirim', 'Centro', 'Comercial');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('26ae9de0-2ba7-4ba9-a10d-38a946be254c'::uuid, '0111280', 'PJ', 'Migrado do Bubble. Colaborador: 1760960893640x709281357527038500', '1760960893640x709281357527038500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('26ae9de0-2ba7-4ba9-a10d-38a946be254c'::uuid, 'Centro Odontologico Palhoça', 'Centro Odontologico Palhoça', '15434');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('26ae9de0-2ba7-4ba9-a10d-38a946be254c'::uuid, '88132149', 'Palhoça', 'Pagani', 'ImplanteMais');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c03e7924-874d-4b65-a360-927ff315348a'::uuid, '5257186', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('c03e7924-874d-4b65-a360-927ff315348a'::uuid, 'Sorriclean Odontologia Moderna', 'Sorriclean Odontologia Moderna', 'GO 19955');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('c03e7924-874d-4b65-a360-927ff315348a'::uuid, '73801400', 'Formosa', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5d485c71-4273-481f-aaae-a5f1774a6323'::uuid, '8281497', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('5d485c71-4273-481f-aaae-a5f1774a6323'::uuid, 'LIVIO BRAULIO SILVA E CAMARGO', '80269672168', '1977-03-23'::date, 'GO 6999');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5d485c71-4273-481f-aaae-a5f1774a6323'::uuid, '74510020', 'Goiânia', 'Setor Campinas', 'Camargo Odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f7160ae6-16ae-40e8-a855-4d81c75c9895'::uuid, '9237871', 'PF', 'Migrado do Bubble. Colaborador: 1769711538475x495488439983629000', '1769711538475x495488439983629000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('f7160ae6-16ae-40e8-a855-4d81c75c9895'::uuid, 'Ana Cláudia Approbato Basile', '36223264844', '1987-02-27'::date, '111604');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f7160ae6-16ae-40e8-a855-4d81c75c9895'::uuid, '14080420', 'RIBEIRAO PRETO', 'Campos Elíseos', 'Sala 7');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2f693499-011b-4b3f-a1fd-d036666269f6'::uuid, '1627082', 'PF', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2f693499-011b-4b3f-a1fd-d036666269f6'::uuid, 'Pedro Giorgetti Montagner', '44925800850', '1996-05-20'::date, 'SP 132695');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2f693499-011b-4b3f-a1fd-d036666269f6'::uuid, '13024091', 'Campinas', 'Cambuí');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('af1930fa-6b0e-4a62-aafd-8e82b021b277'::uuid, '8785866', 'PJ', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('af1930fa-6b0e-4a62-aafd-8e82b021b277'::uuid, 'CES ODONTOLOGIA INTEGRADA LTDA', 'CES ODONTOLOGIA INTEGRADA LTDA', '105898');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('af1930fa-6b0e-4a62-aafd-8e82b021b277'::uuid, '06683000', 'Itapevi', 'São João', 'Dentista dentro do Lopes');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('652b5057-9d3a-40cf-a3f6-ee0656790731'::uuid, '0051082', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('652b5057-9d3a-40cf-a3f6-ee0656790731'::uuid, 'Mariana Lemos de Andrade', '11886531641', '1994-06-24'::date, 'MG 48048');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('652b5057-9d3a-40cf-a3f6-ee0656790731'::uuid, '39800090', 'Teófilo Otoni', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2c670080-c636-4b20-a80a-1f22767537e6'::uuid, '5646246', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('2c670080-c636-4b20-a80a-1f22767537e6'::uuid, 'ANTONIO JOSE MARIANO BALSALOBRE SANCHES', '72717904891', '753');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2c670080-c636-4b20-a80a-1f22767537e6'::uuid, '17700057', 'Osvaldo Cruz', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ea958c8a-1ff1-4089-adea-ac24675b795b'::uuid, '7923971', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('ea958c8a-1ff1-4089-adea-ac24675b795b'::uuid, 'Speed Tooth LTDA', 'Speed Tooth LTDA', '013599');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('ea958c8a-1ff1-4089-adea-ac24675b795b'::uuid, '17700057', 'Osvaldo Cruz', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a64d72bd-fb25-4011-a088-3b852e77c8fa'::uuid, '0336981', 'PJ', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('a64d72bd-fb25-4011-a088-3b852e77c8fa'::uuid, 'Consultório odontológico dr diego Andrade Lima', 'Consultório odontológico dr diego Andrade Lima', '50791', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('a64d72bd-fb25-4011-a088-3b852e77c8fa'::uuid, '36893000', 'Miradouro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fc691454-83a7-49cc-afbc-15be464d3e40'::uuid, '7060103', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('fc691454-83a7-49cc-afbc-15be464d3e40'::uuid, 'Flávia Perches Sentinella', '25956091819', '1976-12-09'::date, 'SPCRO62019');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('fc691454-83a7-49cc-afbc-15be464d3e40'::uuid, '13600140', 'Araras', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('47055ba1-3eb8-4232-a7ca-eb176c8d0acd'::uuid, '4145673', 'PF', 'Migrado do Bubble. Colaborador: 1760960654475x332108157947981000', '1760960654475x332108157947981000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('47055ba1-3eb8-4232-a7ca-eb176c8d0acd'::uuid, 'Joyce Nascimento Almeida de Luccas', '45347161841', '1997-12-22'::date, '142690');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('47055ba1-3eb8-4232-a7ca-eb176c8d0acd'::uuid, '082750001', 'São Paulo', 'Cidade líder', 'Consultório');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4b3158c1-657d-4d3f-aef8-d7f627223a8f'::uuid, '7244354', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('4b3158c1-657d-4d3f-aef8-d7f627223a8f'::uuid, 'FUND DE APOIO AO ENSINO PESQ E ASSISTÊNCIA HCFMRPUSP', 'FUND DE APOIO AO ENSINO PESQ E ASSISTÊNCIA HCFMRPUSP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('4b3158c1-657d-4d3f-aef8-d7f627223a8f'::uuid, '17012900', 'Bauru', 'Vila Nova Cidade Universitária');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dff7e0a0-124e-4ce3-ae73-5efacfb18a7a'::uuid, '5510561', 'PJ', 'Migrado do Bubble. Colaborador: 1760961281448x436351621638805700', '1760961281448x436351621638805700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('dff7e0a0-124e-4ce3-ae73-5efacfb18a7a'::uuid, 'RENATA FARIA CLÍNICA ODONTOLÓGICA LTDA', 'RENATA FARIA CLÍNICA ODONTOLÓGICA LTDA', 'SP- 035754');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('dff7e0a0-124e-4ce3-ae73-5efacfb18a7a'::uuid, '11045003', 'Santos', 'Boqueirão', '2401');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e6a3e1ba-0275-4ffd-a402-af349ae2ba74'::uuid, '5949663', 'PJ', 'Migrado do Bubble. Colaborador: 1769711538475x495488439983629000', '1769711538475x495488439983629000');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e6a3e1ba-0275-4ffd-a402-af349ae2ba74'::uuid, 'Pitta & Pitta Serviços Odontológicos Ltda', 'Pitta & Pitta Serviços Odontológicos Ltda', '59926');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e6a3e1ba-0275-4ffd-a402-af349ae2ba74'::uuid, '14020750', 'Ribeirão Preto', 'Santa Cruz do José Jacques', 'Sala 1208');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1d931121-6240-426d-a217-ab024f113090'::uuid, '2231725', 'PF', 'Migrado do Bubble. Colaborador: 1760960600443x741639706693608400', '1760960600443x741639706693608400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('1d931121-6240-426d-a217-ab024f113090'::uuid, 'Osvaldo Franco Domingues Neto', '07009293805', 'SP 44476');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1d931121-6240-426d-a217-ab024f113090'::uuid, '04562080', 'São Paulo-SP', 'Brooklin', '31');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('091c1ece-1efe-4e70-a98b-3b873fa0fd79'::uuid, '5255608', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('091c1ece-1efe-4e70-a98b-3b873fa0fd79'::uuid, 'George Romulo C Santos', '89460634320', '2005-03-11'::date, '1858');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('091c1ece-1efe-4e70-a98b-3b873fa0fd79'::uuid, '64048385', 'Teresina', 'Jóquei');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6241ec76-dd57-440f-a6c7-d4411e7918d6'::uuid, '0825519', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('6241ec76-dd57-440f-a6c7-d4411e7918d6'::uuid, 'DRA DESIREE ODONTOLOGIA LTDA', 'DRA DESIREE ODONTOLOGIA LTDA', '103494');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6241ec76-dd57-440f-a6c7-d4411e7918d6'::uuid, '14182294', 'PONTAL', 'Manoel Fernandes', 'Clinica');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e7f6b407-4ceb-4913-a4dc-2fa3aaad825c'::uuid, '3664857', 'PF', 'Migrado do Bubble. Colaborador: 1760960683442x756433364065098900', '1760960683442x756433364065098900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('e7f6b407-4ceb-4913-a4dc-2fa3aaad825c'::uuid, 'Davi Esteves', '40864364857', '1993-02-22'::date, 'SP/142966');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e7f6b407-4ceb-4913-a4dc-2fa3aaad825c'::uuid, '02450001', 'São Paulo', 'Santa Teresinha');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('53ea4698-8a74-4434-a76b-adb3d88e575d'::uuid, '3151603', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('53ea4698-8a74-4434-a76b-adb3d88e575d'::uuid, 'Consultório Odontológico Drª. Adriana de Souza Imperatriz', 'Consultório Odontológico Drª. Adriana de Souza Imperatriz');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('53ea4698-8a74-4434-a76b-adb3d88e575d'::uuid, '02916000', 'São Paulo', 'Pirituba');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a5aa12b0-9730-4d3f-a6f7-0f7e815c7b96'::uuid, '2353518', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('a5aa12b0-9730-4d3f-a6f7-0f7e815c7b96'::uuid, 'Jaison Ruan Macedo Santos', '05687773525', '1998-01-16'::date, 'BA - 23492', 'BA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a5aa12b0-9730-4d3f-a6f7-0f7e815c7b96'::uuid, '46740000', 'Boninal', 'Centro', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c3a41766-5938-451b-a3ac-7095bbbc348b'::uuid, '0793755', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('c3a41766-5938-451b-a3ac-7095bbbc348b'::uuid, 'Elizabeth Baylet Braga', '12153183677', '1995-07-07'::date, 'Mg18.507.694');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c3a41766-5938-451b-a3ac-7095bbbc348b'::uuid, '28640000', 'Carmo', 'Centro', 'Hotel Portugal');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e34494dc-6ed0-48ba-a329-e31190113622'::uuid, '7371794', 'PF', 'Migrado do Bubble. Colaborador: 1760960510235x547964187199232900', '1760960510235x547964187199232900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('e34494dc-6ed0-48ba-a329-e31190113622'::uuid, 'Claudia Renata Torres', '12497490856', '1971-01-31'::date, '52113');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e34494dc-6ed0-48ba-a329-e31190113622'::uuid, '04713002', 'São Paulo', 'Chácara Santo Antônio', 'Sala 210');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4d20f50b-78ea-4d18-ac6e-635862b72416'::uuid, '2473962', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('4d20f50b-78ea-4d18-ac6e-635862b72416'::uuid, 'Keila Cristina Caetano ferreira', '03613421607', 'MG - 04278', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4d20f50b-78ea-4d18-ac6e-635862b72416'::uuid, '36770032', 'Cataguases', 'Centro', 'Sala 06');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b98b65a2-7b36-4a5d-a813-ed368a9b0132'::uuid, '7661328', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('b98b65a2-7b36-4a5d-a813-ed368a9b0132'::uuid, 'D''Oliveira Odontologia LTDA.', 'D''Oliveira Odontologia LTDA.', '149798');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b98b65a2-7b36-4a5d-a813-ed368a9b0132'::uuid, '13040115', 'Campinas', 'Jardim Nova Europa', 'Sala 01');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('be85764f-a138-4411-aa1b-c6a656925297'::uuid, '1233712', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('be85764f-a138-4411-aa1b-c6a656925297'::uuid, 'Danielle Delminda Gaspar ribeiro Ltda', 'Danielle Delminda Gaspar ribeiro Ltda', '97000');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('be85764f-a138-4411-aa1b-c6a656925297'::uuid, '14955025', 'Borborema', 'Centro', 'Consultorio');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('31ee67da-e775-4636-ad8d-6b2061eacb81'::uuid, '8629284', 'PJ', 'Migrado do Bubble. Colaborador: 1774533209736x122556311850657400', '1774533209736x122556311850657400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('31ee67da-e775-4636-ad8d-6b2061eacb81'::uuid, 'Renata R Martelini Antonio- Odontologia Especializada', 'Renata R Martelini Antonio- Odontologia Especializada', '016138', 'PR');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('31ee67da-e775-4636-ad8d-6b2061eacb81'::uuid, '86410000', 'Ribeirão Claro', 'centro', 'Consultório');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9ae046f0-7897-4909-a7f7-cb10df69657f'::uuid, '4069657', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9ae046f0-7897-4909-a7f7-cb10df69657f'::uuid, 'Alexandre Takeshi Iamamoto Orsi', '32314473809', '1984-09-21'::date, 'SP 92324');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9ae046f0-7897-4909-a7f7-cb10df69657f'::uuid, '14110000', 'Ribeirão Preto', 'Bonfim Paulista', 'Ap 151 C');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e006b721-e49b-4838-a682-f45d0ffe6266'::uuid, '9339659', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('e006b721-e49b-4838-a682-f45d0ffe6266'::uuid, 'Mariana Alvares Cavalcanti', '02446575307', '2016-12-01'::date, 'PB6197', 'PB');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e006b721-e49b-4838-a682-f45d0ffe6266'::uuid, '58038182', 'João Pessoa', 'Manaíra', 'Ap 602');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b67b249e-27ae-4488-ac46-9b3b62fd3c6b'::uuid, '0660475', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b67b249e-27ae-4488-ac46-9b3b62fd3c6b'::uuid, 'RAFAEL BARRETO DE SOUZA MELO', '06455143493', '2026-03-10'::date, 'RJ3833');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b67b249e-27ae-4488-ac46-9b3b62fd3c6b'::uuid, '22640100', 'Rio de Janeiro', 'Barra da Tijuca', 'bloco 8 sala 203');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a74aa616-7a66-4d69-a93e-fcb7640dd3a3'::uuid, '8943769', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('a74aa616-7a66-4d69-a93e-fcb7640dd3a3'::uuid, 'Gabriel Marques David Stipe', '40569959829', '2001-10-16'::date, 'SP 164732');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a74aa616-7a66-4d69-a93e-fcb7640dd3a3'::uuid, '07080120', 'Guarulhos', 'Picanço', '33 a');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1d354b22-ba97-47d7-a43f-15f2ab9309c4'::uuid, '5521147', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1d354b22-ba97-47d7-a43f-15f2ab9309c4'::uuid, 'Urashima Odontologia Especializada Ltda.', 'Urashima Odontologia Especializada Ltda.', '118724');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('1d354b22-ba97-47d7-a43f-15f2ab9309c4'::uuid, '07061002', 'Guarulhos', 'Vila Galvão');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7155331b-6b3f-46b8-a565-ffdd5099e4dc'::uuid, '1714132', 'PJ', 'Migrado do Bubble. Colaborador: 1760960785098x206374514602412300', '1760960785098x206374514602412300');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('7155331b-6b3f-46b8-a565-ffdd5099e4dc'::uuid, 'Simões Oral Clinic', 'Simões Oral Clinic', '35.029');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7155331b-6b3f-46b8-a565-ffdd5099e4dc'::uuid, '13466330', 'Americana', 'Vila Santa Catarina');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('cde1fb43-6b75-4d55-a2be-b80c8053e76a'::uuid, '7951096', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('cde1fb43-6b75-4d55-a2be-b80c8053e76a'::uuid, 'Jacqueline Thais da Silva Barbosa', '33662159082', '1986-07-16'::date, '171085');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('cde1fb43-6b75-4d55-a2be-b80c8053e76a'::uuid, '07012020', 'Guarulhos', 'Centro', 'Sala 411');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1d3b28f1-b236-4515-a69d-2586aab7df20'::uuid, '7407207', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1d3b28f1-b236-4515-a69d-2586aab7df20'::uuid, 'Rede Glow Odontologia, Estética e Saude Mental LTDA', 'Rede Glow Odontologia, Estética e Saude Mental LTDA', '111960');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1d3b28f1-b236-4515-a69d-2586aab7df20'::uuid, '06709150', 'Cotia', 'Granja Viana', 'Casa 4');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5741abcb-3f8c-4127-abb8-fd635b61a6cb'::uuid, '7144358', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5741abcb-3f8c-4127-abb8-fd635b61a6cb'::uuid, 'WFM KAMIMURA - SERVICOS ODONTOLOGICOS S/S EIRELI', 'WFM KAMIMURA - SERVICOS ODONTOLOGICOS S/S EIRELI', '15336');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5741abcb-3f8c-4127-abb8-fd635b61a6cb'::uuid, '04709001', 'São Paulo', 'Santo Amaro', 'Salas 05 e 06');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b7fb4ded-cc08-44d6-af73-9b9ec6c4bd24'::uuid, '6447822', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('b7fb4ded-cc08-44d6-af73-9b9ec6c4bd24'::uuid, 'José Moisés Odontologia LTDA', 'José Moisés Odontologia LTDA', '10240', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b7fb4ded-cc08-44d6-af73-9b9ec6c4bd24'::uuid, '88015300', 'Florianópolis', 'Centro', 'Torre 1 - Sala 103');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d2bc2f02-ef34-4b31-af96-9b6970e440ad'::uuid, '1193180', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d2bc2f02-ef34-4b31-af96-9b6970e440ad'::uuid, 'Gustavo Peclat David', '02754498150', '1996-06-24'::date, '17942');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('d2bc2f02-ef34-4b31-af96-9b6970e440ad'::uuid, '74633365', 'Goiânia', 'Vila Santa Isabel');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('da6a5405-a171-4ff5-aa41-bf4ee36a0686'::uuid, '2235427', 'PJ', 'Migrado do Bubble. Colaborador: 1773432046207x132810747042435570', '1773432046207x132810747042435570');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('da6a5405-a171-4ff5-aa41-bf4ee36a0686'::uuid, 'A M Montagner Serviços Educacionais', 'A M Montagner Serviços Educacionais', '132695');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('da6a5405-a171-4ff5-aa41-bf4ee36a0686'::uuid, '13076415', 'Campinas', 'Jardim Bela Vista');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0bc4beed-644d-4734-a245-18ba7aa73e05'::uuid, '1958900', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('0bc4beed-644d-4734-a245-18ba7aa73e05'::uuid, 'Matheus de Morais Paixao', '13037527609', '1999-05-29'::date, 'MG - 62819', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('0bc4beed-644d-4734-a245-18ba7aa73e05'::uuid, '36035180', 'Juiz de Fora', 'Morro da Glória');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('401aee10-320e-419c-a82f-24f4018d57b1'::uuid, '1135617', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('401aee10-320e-419c-a82f-24f4018d57b1'::uuid, 'DF LAB LTDA', 'DF LAB LTDA', '62976272000189');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('401aee10-320e-419c-a82f-24f4018d57b1'::uuid, '74223060', 'GOIANIA', 'SETOR BUENO', 'QUADRA102 LOTE 09/12 SALA 509');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('65fe0c01-b029-48f2-acff-36d295f70dc1'::uuid, '1750108', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('65fe0c01-b029-48f2-acff-36d295f70dc1'::uuid, 'Giuliano Zampieri Bof', '33295380821', '1984-11-10'::date, 'SP 090955');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('65fe0c01-b029-48f2-acff-36d295f70dc1'::uuid, '09710230', 'São Bernardo do Campo', 'Centro', 'Conjunto 31 - 3 andar');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d49729b1-700a-4e76-a199-01346adea28f'::uuid, '7579236', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d49729b1-700a-4e76-a199-01346adea28f'::uuid, 'Camila Deodato Silva', '28218576835', '1981-07-11'::date, 'SP 83808');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d49729b1-700a-4e76-a199-01346adea28f'::uuid, '08730140', 'Mogi das Cruzes', 'Jardim Santista', 'Clinica Odontologica');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('915be30c-df61-4b43-a0ad-c3b3bde52193'::uuid, '7385133', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('915be30c-df61-4b43-a0ad-c3b3bde52193'::uuid, 'Ana Luiza Oliveira Andrade', '13202376659', '1997-12-12'::date, 'Mg55615');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('915be30c-df61-4b43-a0ad-c3b3bde52193'::uuid, '32315000', 'Contagem', 'Eldorado', 'Sala 12');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('50dd3b14-618d-40bb-ad57-2b270eb20132'::uuid, '2072474', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('50dd3b14-618d-40bb-ad57-2b270eb20132'::uuid, 'Ricardo salgado de soza', '14405833826', '1970-06-30'::date, 'SP 50462');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('50dd3b14-618d-40bb-ad57-2b270eb20132'::uuid, '05419000', 'São Paulo', 'Pinheiros', 'Cj 24');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2d5661fc-06f7-4e66-a545-bd8fcf490824'::uuid, '1627885', 'PF', 'Migrado do Bubble. Colaborador: 1760960224446x585510211041943400', '1760960224446x585510211041943400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2d5661fc-06f7-4e66-a545-bd8fcf490824'::uuid, 'Bráulio ruella Pereira', '07471143665', '2016-09-02'::date, 'Mg 47738');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2d5661fc-06f7-4e66-a545-bd8fcf490824'::uuid, '36504178', 'Ubá', 'Bom Pastor');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4847975e-5441-444e-ae94-0c8f6584b4e6'::uuid, '7662350', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('4847975e-5441-444e-ae94-0c8f6584b4e6'::uuid, 'TOBIAS ODONTOLOGIA LTDA', 'TOBIAS ODONTOLOGIA LTDA', '271-PI');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4847975e-5441-444e-ae94-0c8f6584b4e6'::uuid, '64049494', 'Teresina', 'Fátima', 'Sl 1005 Torre Medical');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('eb42b5d4-d8de-46d0-a744-662ca718cf51'::uuid, '2510912', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('eb42b5d4-d8de-46d0-a744-662ca718cf51'::uuid, 'Patricia Maria Peres Touma', '46452281615', '1962-08-17'::date, 'MG - 13214', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('eb42b5d4-d8de-46d0-a744-662ca718cf51'::uuid, '36016230', 'Juiz de Fora', 'Centro', '805');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4d3a4ae8-54bc-4b35-a197-23965d81daf8'::uuid, '1902849', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('4d3a4ae8-54bc-4b35-a197-23965d81daf8'::uuid, 'Marotto Odontologia Ltda.', 'Marotto Odontologia Ltda.', '037267');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4d3a4ae8-54bc-4b35-a197-23965d81daf8'::uuid, '14801190', 'Araraquara', 'Centro', 'Instituto do Sono');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2eb6fa92-3d92-4bea-a6cd-65cf580d59e0'::uuid, '8581955', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2eb6fa92-3d92-4bea-a6cd-65cf580d59e0'::uuid, 'Samuel Italo de Almeida Silva', '60763083380', '2000-10-25'::date, 'CE: 17387');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2eb6fa92-3d92-4bea-a6cd-65cf580d59e0'::uuid, '60150900', 'Fortaleza', 'Aldeota', 'Apto 703 Bloco B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('893e413b-b992-46fc-a79b-50735785de89'::uuid, '0382981', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('893e413b-b992-46fc-a79b-50735785de89'::uuid, 'Clínica Odontológica Dra Paula Santos Ferraz', 'Clínica Odontológica Dra Paula Santos Ferraz');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('893e413b-b992-46fc-a79b-50735785de89'::uuid, '13284056', 'Vinhedo', 'Nova Vinhedo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f613efde-7941-491c-a820-129913215c9e'::uuid, '1532478', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('f613efde-7941-491c-a820-129913215c9e'::uuid, 'Hanne Joyce Perez Guimarães', '35682704800', '1987-06-05'::date, 'SP 96278');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f613efde-7941-491c-a820-129913215c9e'::uuid, '03645000', 'São Paulo', 'Vila Centenário', 'Sala 107');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1554f04e-05ed-4c96-ac3b-06232fe77e22'::uuid, '7537225', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1554f04e-05ed-4c96-ac3b-06232fe77e22'::uuid, 'H M J LTDA', 'H M J LTDA', '06518');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('1554f04e-05ed-4c96-ac3b-06232fe77e22'::uuid, '6492000', 'Cristino Castro', 'Centro II');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8d040a78-f00c-490d-add7-c735043baeb4'::uuid, '3247105', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8d040a78-f00c-490d-add7-c735043baeb4'::uuid, 'João Carlos Ferreira Duarte Júnior', '02134811706', '2001-08-10'::date, 'RJ 27468');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('8d040a78-f00c-490d-add7-c735043baeb4'::uuid, '28460000', 'Miracema', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('296ddca0-58a1-461c-ae1c-2bbe014cf5b7'::uuid, '3370194', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento) VALUES ('296ddca0-58a1-461c-ae1c-2bbe014cf5b7'::uuid, 'Thawan Justo Santos', '49403735848', '2002-07-10'::date);
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('296ddca0-58a1-461c-ae1c-2bbe014cf5b7'::uuid, '16015010', 'Araçatuba', 'Vila Mendonça');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d5768fd1-8b98-490f-a68f-f31629b5f5ec'::uuid, '9113594', 'PF', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d5768fd1-8b98-490f-a68f-f31629b5f5ec'::uuid, 'Virgílio Mendes Maia Junior', '64260046349', '1979-05-13'::date, 'CE4434');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('d5768fd1-8b98-490f-a68f-f31629b5f5ec'::uuid, '62430000', 'Granja', 'Granja');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('13a25e79-c694-45ea-acb9-a57aedd17948'::uuid, '1913997', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('13a25e79-c694-45ea-acb9-a57aedd17948'::uuid, 'João Paulo Soares Franciscon', '44206802882', '1997-06-14'::date, 'SP 144502');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('13a25e79-c694-45ea-acb9-a57aedd17948'::uuid, '16013422', 'Araçatuba', 'Concórdia IV', 'ap 41 bloco B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('418aca7a-b0f2-47e0-ae54-aa36af94d89e'::uuid, '4982908', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('418aca7a-b0f2-47e0-ae54-aa36af94d89e'::uuid, 'Cristiano Campos Nunes', '00947356622', '1974-09-09'::date, 'My 27285');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('418aca7a-b0f2-47e0-ae54-aa36af94d89e'::uuid, '31560300', 'Belo Horizonte', 'Santa Amélia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1f4423d6-7b03-431f-a7c7-f255b916e6c0'::uuid, '5213887', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1f4423d6-7b03-431f-a7c7-f255b916e6c0'::uuid, 'Ravos Laboratorio Ltda', 'Ravos Laboratorio Ltda', 'RN-TPD-216');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1f4423d6-7b03-431f-a7c7-f255b916e6c0'::uuid, '59020200', 'Natal', 'Tirol', 'Salas 10 e 11 pelo mezanino');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('41ac3e92-7465-4ad8-aff6-e44f7db4100e'::uuid, '1069128', 'PJ', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('41ac3e92-7465-4ad8-aff6-e44f7db4100e'::uuid, 'Adriano Veiga prótese dentária', 'Adriano Veiga prótese dentária', '174556');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('41ac3e92-7465-4ad8-aff6-e44f7db4100e'::uuid, '01451001', 'São Paulo', 'Jardim Paulistano', 'Conjunto 904');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('844a82c0-c97e-4f20-aa6a-56d6ce4ace69'::uuid, '6857066', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('844a82c0-c97e-4f20-aa6a-56d6ce4ace69'::uuid, 'Bruno Pereira de Souza', '44467936831', '2020-02-11'::date, 'SP 138046');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('844a82c0-c97e-4f20-aa6a-56d6ce4ace69'::uuid, '08473470', 'São Paulo', 'Jardim Wilma Flor', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('51ba956f-fbd1-4119-a670-81f4ce63ecb3'::uuid, '2489843', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('51ba956f-fbd1-4119-a670-81f4ce63ecb3'::uuid, 'VITORIA BOMBIG TOSTA', '36098594821', '1991-01-15'::date, '55+107.602');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('51ba956f-fbd1-4119-a670-81f4ce63ecb3'::uuid, '14500039', 'Ituverava', 'Centro', 'CLINICA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7c2f5204-909d-4073-a497-ee495082c57d'::uuid, '1616276', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('7c2f5204-909d-4073-a497-ee495082c57d'::uuid, 'ADRIANO FAVA ESTEVAM LTDA', 'ADRIANO FAVA ESTEVAM LTDA', '013594');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7c2f5204-909d-4073-a497-ee495082c57d'::uuid, '08130050', 'SAO PAULO', 'CIDADE KEMEL 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5959323c-e2a6-47bf-ac0f-9aee085e59a5'::uuid, '3067215', 'PJ', 'Migrado do Bubble. Colaborador: 1760960654475x332108157947981000', '1760960654475x332108157947981000');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5959323c-e2a6-47bf-ac0f-9aee085e59a5'::uuid, 'LF SERVICOS ODONTOLOGICOS LTDA', 'LF SERVICOS ODONTOLOGICOS LTDA', '101727');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('5959323c-e2a6-47bf-ac0f-9aee085e59a5'::uuid, '08710150', 'Mogi das Cruzes', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8648c628-bf17-4440-a56b-bb648115e76f'::uuid, '2685636', 'PJ', 'Migrado do Bubble. Colaborador: 1760960224446x585510211041943400', '1760960224446x585510211041943400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('8648c628-bf17-4440-a56b-bb648115e76f'::uuid, 'Accurato Odontologia e Estética Facial LTDA', 'Accurato Odontologia e Estética Facial LTDA', '19559');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8648c628-bf17-4440-a56b-bb648115e76f'::uuid, '36500069', 'Uba', 'Centro', 'Bloco A sala 202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('bba54146-740c-4851-adaa-b7f750b4f3a7'::uuid, '1507669', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('bba54146-740c-4851-adaa-b7f750b4f3a7'::uuid, 'Igor george da silva Vasconcelos', '96116498272', '1995-03-08'::date, '6552');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('bba54146-740c-4851-adaa-b7f750b4f3a7'::uuid, '69058448', 'Manaus', 'Flores', 'Torre Orion apto 406');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4b9d7f23-681a-4ab7-a637-2fe78d6c905c'::uuid, '8466808', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4b9d7f23-681a-4ab7-a637-2fe78d6c905c'::uuid, 'BRUNO PEREIRA MANFRIN', '39247111862', '1988-11-17'::date, '122978');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4b9d7f23-681a-4ab7-a637-2fe78d6c905c'::uuid, '07191080', 'Guarulhos', 'Jardim Rizzo', 'Ao lado da farmácia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f87daa0a-b8ec-4fef-ad69-ccea940de2a9'::uuid, '3898037', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('f87daa0a-b8ec-4fef-ad69-ccea940de2a9'::uuid, 'Larissa Müller', '41576820840', '1992-11-26'::date, 'SP112448');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('f87daa0a-b8ec-4fef-ad69-ccea940de2a9'::uuid, '13607362', 'Araras', 'Jardim Abolição de Lourenço Dias');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c1585656-4e2d-4cb5-a4da-e84b7c42d28c'::uuid, '6962867', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('c1585656-4e2d-4cb5-a4da-e84b7c42d28c'::uuid, 'Ludmilla da Silva Caetano', '89393872104', '1980-03-03'::date, 'GO 7522');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c1585656-4e2d-4cb5-a4da-e84b7c42d28c'::uuid, '74150070', 'Goiânia', 'Setor Marista', 'Clínica Special Care');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('40bbee30-dbfb-485a-a546-2d0893df2564'::uuid, '2349737', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('40bbee30-dbfb-485a-a546-2d0893df2564'::uuid, 'Fernanda Alves dos Santos', '27722288863', '1980-11-15'::date, '148977');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('40bbee30-dbfb-485a-a546-2d0893df2564'::uuid, '06764290', 'Taboão da serra', 'Jardim Henriqueta');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7a026f05-1923-4f58-aad5-e97661d4023f'::uuid, '5220264', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('7a026f05-1923-4f58-aad5-e97661d4023f'::uuid, 'Juan Pablo Vásquez Huidobro', '23831802890', '1978-11-08'::date, '135276');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7a026f05-1923-4f58-aad5-e97661d4023f'::uuid, '04134090', 'São Paulo', 'Vila Gumercindo', '81');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0003ce14-4a34-4a89-a251-ca951c1c5575'::uuid, '4101783', 'PJ', 'Migrado do Bubble. Colaborador: 1760960224446x585510211041943400', '1760960224446x585510211041943400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('0003ce14-4a34-4a89-a251-ca951c1c5575'::uuid, 'Pedro Henrique Andrade de Rezende', 'Pedro Henrique Andrade de Rezende', '60547', 'Mg');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0003ce14-4a34-4a89-a251-ca951c1c5575'::uuid, '3650000', 'Ubá', 'centro', 'Casa interfone n1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6d959642-4517-4a60-af91-9df79c01a892'::uuid, '4566918', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('6d959642-4517-4a60-af91-9df79c01a892'::uuid, 'Felipe Bergamasco Perri Cefali', '43933551803', '1995-11-16'::date, 'SP 180.165');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('6d959642-4517-4a60-af91-9df79c01a892'::uuid, '16025320', 'Araçatuba', 'Vila Nova');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fa62064a-24ac-47f5-a6c7-ecca9bd48965'::uuid, '3786236', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('fa62064a-24ac-47f5-a6c7-ecca9bd48965'::uuid, 'Victor Campos dos Santos', '49295065816', '1999-11-29'::date, '159354');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('fa62064a-24ac-47f5-a6c7-ecca9bd48965'::uuid, '13091594', '109: 3509502', 'Vila Trinta e Um de Março', 'Casa de portão verde');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a95c0fa2-3c60-4bf3-af3b-b505cc32e04a'::uuid, '4824983', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('a95c0fa2-3c60-4bf3-af3b-b505cc32e04a'::uuid, 'RAIMUNDO NONATO SANTOS', '60406933634', 'PR + 18219');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a95c0fa2-3c60-4bf3-af3b-b505cc32e04a'::uuid, '80010010', 'Curitiba', 'Centro', 'Sala 308');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('de4853d7-6248-4c99-ad22-14a296719cef'::uuid, '1441264', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf) VALUES ('de4853d7-6248-4c99-ad22-14a296719cef'::uuid, 'Giovanna Stephanie Barros de Sá', '47705676850');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('de4853d7-6248-4c99-ad22-14a296719cef'::uuid, '16202450', 'Birigui', 'Jardim São Genaro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b195a194-5967-4d78-ab87-3db013d15af4'::uuid, '9511197', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b195a194-5967-4d78-ab87-3db013d15af4'::uuid, 'Paula Juliana Leme Guedes', '31043713859', '1984-04-06'::date, '07573');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b195a194-5967-4d78-ab87-3db013d15af4'::uuid, '59650000', 'Açu', 'Vista bela');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('73411084-f584-46e9-a2e3-c5f538e11cea'::uuid, '2226998', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('73411084-f584-46e9-a2e3-c5f538e11cea'::uuid, 'Gustavo Dalton Nascimento Villar', '06595054280', '2004-09-14'::date, '06595054280');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('73411084-f584-46e9-a2e3-c5f538e11cea'::uuid, '69018153', 'Manaus', 'Lago Azul', 'BL 06, APTO 508');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('eacf24f2-be75-4939-a36f-7573acdfc686'::uuid, '2790982', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('eacf24f2-be75-4939-a36f-7573acdfc686'::uuid, 'L FELIX DA COSTA LTDA', 'L FELIX DA COSTA LTDA', 'MA- 000431');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('eacf24f2-be75-4939-a36f-7573acdfc686'::uuid, '65300019', 'Santa Inês', 'Centro', 'Predio do Hospital Vitallys');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('aee26ff2-7ae3-4870-a486-ff09e81d984e'::uuid, '1702322', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('aee26ff2-7ae3-4870-a486-ff09e81d984e'::uuid, 'Suelen Cristina de Araujo Athayde Altea', '01090219164', '1984-05-19'::date, '136960');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('aee26ff2-7ae3-4870-a486-ff09e81d984e'::uuid, '13299470', 'Itupeva', 'Residencial Ibi-Aram');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('942e4b2b-977f-459d-a0a3-b9c39838539e'::uuid, '5935027', 'PF', 'Migrado do Bubble. Colaborador: 1771934581868x271800717018472860', '1771934581868x271800717018472860');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('942e4b2b-977f-459d-a0a3-b9c39838539e'::uuid, 'PAULO VICTOR SOUSA RESENDE', '12450572600', '1996-07-26'::date, 'MG 53575');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('942e4b2b-977f-459d-a0a3-b9c39838539e'::uuid, '36340000', 'Resende Costa', 'Centro', '301');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e1d38bae-2c2a-4d42-a9f0-aa5d15f5d0fc'::uuid, '9740150', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e1d38bae-2c2a-4d42-a9f0-aa5d15f5d0fc'::uuid, 'Clínica odontológica Erlin Kistmacher Ltda', 'Clínica odontológica Erlin Kistmacher Ltda', '26911');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e1d38bae-2c2a-4d42-a9f0-aa5d15f5d0fc'::uuid, '84620000', 'Cruz Machado', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8ade3432-a9f5-44f1-aae5-fbc4c75579c6'::uuid, '0736586', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('8ade3432-a9f5-44f1-aae5-fbc4c75579c6'::uuid, 'Daniel Socram dos Reis', '07340428925', '2025-08-19'::date, 'SCSCSCSCSC - 25407', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, complemento) VALUES ('8ade3432-a9f5-44f1-aae5-fbc4c75579c6'::uuid, '88735000', 'Gravatal', 'Consultório odontológico');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ae49fe27-3a7b-4125-a58f-116b5050a493'::uuid, '5628266', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('ae49fe27-3a7b-4125-a58f-116b5050a493'::uuid, 'L''Armond Odontologia Avançada Ltda', 'L''Armond Odontologia Avançada Ltda', 'MG 20311');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ae49fe27-3a7b-4125-a58f-116b5050a493'::uuid, '35010030', 'Governador Valadares', 'centro', 'Sala 901 a 903');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4819f825-78af-476e-a22b-3dd7fca60ce6'::uuid, '1962849', 'PF', 'Migrado do Bubble. Colaborador: 1760960654475x332108157947981000', '1760960654475x332108157947981000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4819f825-78af-476e-a22b-3dd7fca60ce6'::uuid, 'Luiza Yohana Messias de Melo', '48213254899', '1998-02-18'::date, '138488');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4819f825-78af-476e-a22b-3dd7fca60ce6'::uuid, '03663010', 'São Paulo', 'Vila Ré', 'Casa 7');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('20bcfa87-d9ea-4b23-a640-091f1aecfca3'::uuid, '7798242', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('20bcfa87-d9ea-4b23-a640-091f1aecfca3'::uuid, 'EDUARDO FELIPE DE SOUZA PINHEIRO', '39200197841', '1991-02-06'::date, 'SP116133');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('20bcfa87-d9ea-4b23-a640-091f1aecfca3'::uuid, '05750260', 'São Paulo', 'Vila Praia', 'T2Ap41');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('48a1dccb-ec25-4258-ab51-7ee1999f10fc'::uuid, '9911188', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('48a1dccb-ec25-4258-ab51-7ee1999f10fc'::uuid, 'Bianca Fonçatti Frasson', '41531548814', '1998-01-08'::date, 'SP 137885');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('48a1dccb-ec25-4258-ab51-7ee1999f10fc'::uuid, '18900071', 'Santa Cruz do Rio Pardo', 'Centro', 'Sala 03');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b83761da-da42-4fe6-a516-4637b1d9c915'::uuid, '3229322', 'PF', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b83761da-da42-4fe6-a516-4637b1d9c915'::uuid, 'Daniel Oliveira', '00112624197', '1989-06-26'::date, 'DF 10062');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b83761da-da42-4fe6-a516-4637b1d9c915'::uuid, '71065330', 'Brasília', 'Guará II', 'Em frente a escola de inglês Wizard');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('78d2657e-85c1-4089-a89f-cf6fdd97a7da'::uuid, '3995062', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('78d2657e-85c1-4089-a89f-cf6fdd97a7da'::uuid, 'Liziane Machado da Luz Brunhara', '02471649920', '1977-01-30'::date, 'PR 11981');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('78d2657e-85c1-4089-a89f-cf6fdd97a7da'::uuid, '85801021', 'Cascavel', 'Centro', 'CIEO');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('10316ce8-25db-4f12-a233-125ef7e8f2ca'::uuid, '8270358', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('10316ce8-25db-4f12-a233-125ef7e8f2ca'::uuid, 'Bárbara Franco', '4336553894', '1996-07-09'::date, '136706');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('10316ce8-25db-4f12-a233-125ef7e8f2ca'::uuid, '13455425', 'Santa Bárbara D''Oeste', 'Jardim Europa I');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('decc86c9-b969-4783-a99f-b3f214638f3b'::uuid, '3988503', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('decc86c9-b969-4783-a99f-b3f214638f3b'::uuid, 'Odontologica de Friburgo LTDA', 'Odontologica de Friburgo LTDA', '5244');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('decc86c9-b969-4783-a99f-b3f214638f3b'::uuid, '24220008', 'Niterói', 'Icaraí', '202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('26a1169c-88af-4fd5-a922-26e99b6a1c87'::uuid, '7660040', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('26a1169c-88af-4fd5-a922-26e99b6a1c87'::uuid, 'CLINICA ORQUIDEA LTDA', 'CLINICA ORQUIDEA LTDA', '031404');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('26a1169c-88af-4fd5-a922-26e99b6a1c87'::uuid, '09910170', 'Diadema', 'Centro', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4ee551ac-fff8-4b56-ae91-209e491bd927'::uuid, '9744121', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4ee551ac-fff8-4b56-ae91-209e491bd927'::uuid, 'Guilherme Souza Andrade', '10041365607', '1995-09-26'::date, '51743');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('4ee551ac-fff8-4b56-ae91-209e491bd927'::uuid, '37950014', 'São Sebastião do Paraíso', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5067a5ed-f196-4a1e-abce-ac6cb837503c'::uuid, '9382856', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('5067a5ed-f196-4a1e-abce-ac6cb837503c'::uuid, 'Vinicius Gonzalez Rio Mayor da Silva', '14030469728', '2022-09-02'::date, '21979917797');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('5067a5ed-f196-4a1e-abce-ac6cb837503c'::uuid, '22271022', 'Rio de Janeiro', 'Botafogo');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6dfd77e4-a299-414b-a055-d56b3d9719e4'::uuid, '5180350', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('6dfd77e4-a299-414b-a055-d56b3d9719e4'::uuid, 'Emilly Angelica Augusto Guilherme', '13073908625', '1997-11-05'::date, 'Rj 53075');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6dfd77e4-a299-414b-a055-d56b3d9719e4'::uuid, '22793340', 'Rj', 'Barra da tijuca', '1105');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('18edc544-a72b-4f07-ab91-c61224a4df17'::uuid, '9294771', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('18edc544-a72b-4f07-ab91-c61224a4df17'::uuid, 'YANN PACHECO DIAS MARCH E SOUZA', '14952810780', '1993-12-07'::date, 'RJ 44856');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('18edc544-a72b-4f07-ab91-c61224a4df17'::uuid, '28908200', 'Cabo Frio', 'Braga', '406.3');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b6240e5e-46eb-437d-aa7e-e9363c9eaabf'::uuid, '2217769', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('b6240e5e-46eb-437d-aa7e-e9363c9eaabf'::uuid, 'NPP FONTE ODONTOLOGIA LTDA', 'NPP FONTE ODONTOLOGIA LTDA', '134190');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b6240e5e-46eb-437d-aa7e-e9363c9eaabf'::uuid, '08810020', 'Mogi das Cruzes', 'Vila Suissa', 'Torre 4 apto 21');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('16893698-99de-4590-a4c6-f4cc7be79314'::uuid, '1723140', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro, cro_uf) VALUES ('16893698-99de-4590-a4c6-f4cc7be79314'::uuid, 'Danielle Afonso', '05979513906', 'SC - 12788', 'SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('16893698-99de-4590-a4c6-f4cc7be79314'::uuid, '88905234', 'Araranguá', 'Nova Divinéia', 'Clinica Odontologica');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('92a3aca5-eb8c-4185-a0e0-fee2b81c2371'::uuid, '1489631', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('92a3aca5-eb8c-4185-a0e0-fee2b81c2371'::uuid, 'Gicele Schaffer', '04085993917', 'Sc 10170');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('92a3aca5-eb8c-4185-a0e0-fee2b81c2371'::uuid, '89035300', 'Blumenau', 'Vila Nova', 'Sala 1, consultório odontológico');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b9a08133-84ca-4d1c-ad9a-810cd75e6360'::uuid, '5836011', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b9a08133-84ca-4d1c-ad9a-810cd75e6360'::uuid, 'Francisco Mauro da Silva Girundi', '78559677615', '1968-07-13'::date, '19698');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b9a08133-84ca-4d1c-ad9a-810cd75e6360'::uuid, '30320670', 'BELO HORIZONTE', 'Belvedere', '1408');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3ca94d82-7d8e-4951-a829-f96afa1f4765'::uuid, '8979791', 'PF', 'Migrado do Bubble. Colaborador: 1771934581868x271800717018472860', '1771934581868x271800717018472860');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf) VALUES ('3ca94d82-7d8e-4951-a829-f96afa1f4765'::uuid, 'GAUBER GUSTAVOJAKIMIM S VILLELA', '02505065993');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3ca94d82-7d8e-4951-a829-f96afa1f4765'::uuid, '78061368', 'Cuiabá', 'Renascer', 'sobrado');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('60fdf870-92be-4ef9-a62c-6c14849ba36a'::uuid, '7606562', 'PJ', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('60fdf870-92be-4ef9-a62c-6c14849ba36a'::uuid, 'Cristiano Delamare Ribeiro Duarte', 'Cristiano Delamare Ribeiro Duarte', '24.137');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade) VALUES ('60fdf870-92be-4ef9-a62c-6c14849ba36a'::uuid, '37750000', 'Machado');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('636c4eae-e39b-4b72-ad79-4b2e697b7fa5'::uuid, '3511858', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('636c4eae-e39b-4b72-ad79-4b2e697b7fa5'::uuid, 'Minuti & Barbosa Laboratório de Prótese Dentária ME', 'Minuti & Barbosa Laboratório de Prótese Dentária ME', '10283');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('636c4eae-e39b-4b72-ad79-4b2e697b7fa5'::uuid, '17015410', 'Bauru', 'Centro', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4195f4eb-7983-438c-ad31-912e4e440552'::uuid, '5371169', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('4195f4eb-7983-438c-ad31-912e4e440552'::uuid, 'UNIKA ODONTOLOGIA ESTÉTICA E FUNCIONAL', 'UNIKA ODONTOLOGIA ESTÉTICA E FUNCIONAL', 'DF-01');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4195f4eb-7983-438c-ad31-912e4e440552'::uuid, '71936250', 'Brasília', 'Sul (Águas Claras)', '4° Andar');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e4e263e1-4dbf-4fc2-a5d5-e0e3c5d46eee'::uuid, '9189496', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e4e263e1-4dbf-4fc2-a5d5-e0e3c5d46eee'::uuid, 'CHAER CONSTRUINDO SORRISOS SS', 'CHAER CONSTRUINDO SORRISOS SS', '1598');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e4e263e1-4dbf-4fc2-a5d5-e0e3c5d46eee'::uuid, '75466392', 'Nerópolis', 'Jardim Paraiso', 'QD 06, LT 07');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d44bedb3-2c64-4195-adc0-35d053bf2c21'::uuid, '8236748', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d44bedb3-2c64-4195-adc0-35d053bf2c21'::uuid, 'Nicolle Alexia D Ruiz', '42463309814', '1998-08-20'::date, '148151');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d44bedb3-2c64-4195-adc0-35d053bf2c21'::uuid, '01238001', 'São Paulo', 'Higienópolis', 'Dra Nayara Freitas');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('333fde0d-11e2-478e-aca6-19b8fbb1e57f'::uuid, '8481612', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('333fde0d-11e2-478e-aca6-19b8fbb1e57f'::uuid, 'CLINICA ODONTOLOGICA POLI LTDA', 'CLINICA ODONTOLOGICA POLI LTDA', '2205 SC');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('333fde0d-11e2-478e-aca6-19b8fbb1e57f'::uuid, '88443000', 'Vidal Ramos', 'CENTRO');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('40f18240-d77d-477e-ab9f-6312aba1330e'::uuid, '3161332', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('40f18240-d77d-477e-ab9f-6312aba1330e'::uuid, 'LETICIA CARVALHO LEONEL', '11771121670', '1999-06-21'::date, 'MG70225');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('40f18240-d77d-477e-ab9f-6312aba1330e'::uuid, '35720000', 'Matozinhos', 'Cruzeiro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4eb57e56-e2a3-48d2-afe8-fb6f931fa1a7'::uuid, '6744417', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4eb57e56-e2a3-48d2-afe8-fb6f931fa1a7'::uuid, 'Paulo Rogério Felizardo', '22272718841', '1981-11-18'::date, '87446');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('4eb57e56-e2a3-48d2-afe8-fb6f931fa1a7'::uuid, '14802215', 'Araraquara', 'Jardim Santa Angelina');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('70ea85f9-6a71-4713-a21d-be24097e0ed2'::uuid, '0350488', 'PJ', 'Migrado do Bubble. Colaborador: (deleted thing)', '(deleted thing)');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('70ea85f9-6a71-4713-a21d-be24097e0ed2'::uuid, 'LARA VIEIRA ODONTOLOGIA E ESTETICA', 'LARA VIEIRA ODONTOLOGIA E ESTETICA', '10804', 'DF');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('70ea85f9-6a71-4713-a21d-be24097e0ed2'::uuid, '73026664', 'Brasília', 'Sobradinho', 'Sala');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7bb645e2-a4ed-4178-a649-dc503b43eed8'::uuid, '3191586', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('7bb645e2-a4ed-4178-a649-dc503b43eed8'::uuid, 'Breno Augusto Mackert Mourão', '44466629889', '2001-01-13'::date, 'SP161480');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7bb645e2-a4ed-4178-a649-dc503b43eed8'::uuid, '13563750', 'São Carlos', 'Parque Fehr', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fa74e2f0-5e8d-4a37-a066-a284c128b239'::uuid, '6545881', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('fa74e2f0-5e8d-4a37-a066-a284c128b239'::uuid, 'Raul David Santos de Freitas', '10064359484', '1993-07-21'::date, 'RN4641');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('fa74e2f0-5e8d-4a37-a066-a284c128b239'::uuid, '59780000', 'Caraúbas', 'Sebastião Maltês');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c808d783-b86f-4054-ae2e-4ee3bc5c3e43'::uuid, '9314723', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('c808d783-b86f-4054-ae2e-4ee3bc5c3e43'::uuid, 'CESAR XAVIER DA SILVA JUNIOR', '31934650110', '1964-04-30'::date, 'MaMaMa - 1095', 'Ma');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c808d783-b86f-4054-ae2e-4ee3bc5c3e43'::uuid, '65071750', 'São Luís', 'Cohafuma', 'Ed. Hyde Park - Jardins sala 624');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('501d53ba-aa13-4b22-abd2-9873b5bc6a6a'::uuid, '8185276', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('501d53ba-aa13-4b22-abd2-9873b5bc6a6a'::uuid, 'Odonto França Implantes LTDA', 'Odonto França Implantes LTDA', '103638');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('501d53ba-aa13-4b22-abd2-9873b5bc6a6a'::uuid, '08120060', 'São Paulo', 'Itaim Paulista', 'B');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('74799a8b-84f7-4d8b-a8af-e2d578bd8afd'::uuid, '5968734', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia) VALUES ('74799a8b-84f7-4d8b-a8af-e2d578bd8afd'::uuid, 'CLINICA VITESSE ODONTOLOGIA LTDA', 'CLINICA VITESSE ODONTOLOGIA LTDA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('74799a8b-84f7-4d8b-a8af-e2d578bd8afd'::uuid, '70673603', 'Brasília', 'Setor Sudoeste', 'Sala 123');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('db7d264e-3fdc-45da-a026-2bb1a56a4773'::uuid, '0658736', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('db7d264e-3fdc-45da-a026-2bb1a56a4773'::uuid, 'Juliana Sabino Lisboa', '29317357873', '1976-12-10'::date, 'SP 61103');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('db7d264e-3fdc-45da-a026-2bb1a56a4773'::uuid, '045771010', 'São Paulo', 'Cidade Monções', 'Thera Office sala 305');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1d1c4691-f8c6-4bb3-a36e-a214f3bf1d7d'::uuid, '4309538', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('1d1c4691-f8c6-4bb3-a36e-a214f3bf1d7d'::uuid, 'Daiany Rodrigues Santos de Sá', '04078564984', '1983-02-27'::date, 'SC 8310');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1d1c4691-f8c6-4bb3-a36e-a214f3bf1d7d'::uuid, '88600000', 'São Joaquim', 'Centro', 'A');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('67716d39-d4c7-48b0-a90b-0e6776fd2327'::uuid, '3864964', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('67716d39-d4c7-48b0-a90b-0e6776fd2327'::uuid, 'MLSP ESTÉTICA E SAÚDE LTDA', 'MLSP ESTÉTICA E SAÚDE LTDA', '035567');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('67716d39-d4c7-48b0-a90b-0e6776fd2327'::uuid, '14802304', 'Araraquara', 'Vila José Bonifácio');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a45f6446-7113-49ac-a702-2c4f8e905a4e'::uuid, '4208857', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('a45f6446-7113-49ac-a702-2c4f8e905a4e'::uuid, 'Caroline schuhmacher Amorim', '02461225958', '2026-04-29'::date, 'Sc 4960');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a45f6446-7113-49ac-a702-2c4f8e905a4e'::uuid, '88101170', 'São José', 'Campinas', '1014');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a5eaf816-878b-49d2-a1d3-45213cec8c49'::uuid, '8123389', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('a5eaf816-878b-49d2-a1d3-45213cec8c49'::uuid, 'RODOLFO ANTONIO DE MEDEIROS', '04279038740', '1975-06-16'::date, 'RJ 25464');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a5eaf816-878b-49d2-a1d3-45213cec8c49'::uuid, '22271044', 'Rio de Janeiro', 'Humaitá', '304');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0909b6e6-6814-4d59-a3e5-bcb52afe5ee2'::uuid, '8555057', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('0909b6e6-6814-4d59-a3e5-bcb52afe5ee2'::uuid, 'Gilbert Campos', '79712851753', '1962-10-21'::date, '19376');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0909b6e6-6814-4d59-a3e5-bcb52afe5ee2'::uuid, '24210510', 'Niterói', 'Ingá', 'Apto702');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('f95f742d-f8e2-449f-aa49-79638e96c98b'::uuid, '1135739', 'PJ', 'Migrado do Bubble. Colaborador: 1760960050405x783896891604489200', '1760960050405x783896891604489200');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('f95f742d-f8e2-449f-aa49-79638e96c98b'::uuid, 'Sorria + Clínica Odontológica', 'Sorria + Clínica Odontológica', '9643');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('f95f742d-f8e2-449f-aa49-79638e96c98b'::uuid, '71065612', 'Brasília', 'Guará II', 'Sala');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6e88db7f-af6d-4f5e-a8a5-8dad3233013d'::uuid, '1886943', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('6e88db7f-af6d-4f5e-a8a5-8dad3233013d'::uuid, 'Roberto Nakama', '05630128892', '43321');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6e88db7f-af6d-4f5e-a8a5-8dad3233013d'::uuid, '09110500', 'Santo André', 'Vila América', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1aa5db05-91a4-4645-ad3e-1adaa54e7a09'::uuid, '3873538', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('1aa5db05-91a4-4645-ad3e-1adaa54e7a09'::uuid, 'Qualite odontologia de Taiaçu', 'Qualite odontologia de Taiaçu', '127141');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1aa5db05-91a4-4645-ad3e-1adaa54e7a09'::uuid, '14725015', 'Taiaçu', 'Centro', 'Qualite');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e0ba88ac-d6bf-4809-ae9c-95eba3b90397'::uuid, '4877962', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('e0ba88ac-d6bf-4809-ae9c-95eba3b90397'::uuid, 'IDA ODONTOLOGIA ESPECIALIZADA', 'IDA ODONTOLOGIA ESPECIALIZADA', '68042');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('e0ba88ac-d6bf-4809-ae9c-95eba3b90397'::uuid, '01311200', 'São Paulo', 'Bela Vista', 'cj909');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d6d63e10-4275-4ae4-aea6-42075d326ddb'::uuid, '1229576', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('d6d63e10-4275-4ae4-aea6-42075d326ddb'::uuid, 'Consultorio odontologico dra lourdes melina', 'Consultorio odontologico dra lourdes melina', '94990');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d6d63e10-4275-4ae4-aea6-42075d326ddb'::uuid, '01044000', 'São Paulo', 'República', 'Sala 505');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d61e6099-f83b-4da3-af7f-08b88de62897'::uuid, '7826765', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d61e6099-f83b-4da3-af7f-08b88de62897'::uuid, 'Luiz Gabriel Pacífico Santos', '45689248800', '1996-03-05'::date, '160976');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('d61e6099-f83b-4da3-af7f-08b88de62897'::uuid, '18030005', 'Sorocaba', 'Jardim Vergueiro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8ca316c4-e1ec-4454-aeda-f2a4546fa72c'::uuid, '6641944', 'PJ', 'Migrado do Bubble. Colaborador: 1760960224446x585510211041943400', '1760960224446x585510211041943400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('8ca316c4-e1ec-4454-aeda-f2a4546fa72c'::uuid, 'Aja Serviços Odontológicos', 'Aja Serviços Odontológicos', 'MG58587');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8ca316c4-e1ec-4454-aeda-f2a4546fa72c'::uuid, '35430226', 'Ponte Nova', 'Palmeiras', 'Clínica Odoctor');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2e808192-134b-471c-a3f4-0391b0d70a1a'::uuid, '6871776', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('2e808192-134b-471c-a3f4-0391b0d70a1a'::uuid, 'LUCIANA MARINA DE REZENDE NACCARATO', '11016533888', '1967-01-06'::date, 'SP - 47797', 'SP');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2e808192-134b-471c-a3f4-0391b0d70a1a'::uuid, '13417380', 'Piracicaba', 'Jardim Elite', 'APT 103');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('aa9af26c-b960-4639-ab86-28e5d42b6ae9'::uuid, '8531985', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('aa9af26c-b960-4639-ab86-28e5d42b6ae9'::uuid, 'Tatiane Nascimento de Oliveira', '40570588855', '1992-09-22'::date, 'Sp 115619');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('aa9af26c-b960-4639-ab86-28e5d42b6ae9'::uuid, '17512752', 'Marília', 'Jardim Nazareth', 'Casa 225');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1bc90dad-98d6-4034-a662-b396286bf963'::uuid, '7489704', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('1bc90dad-98d6-4034-a662-b396286bf963'::uuid, 'Renata Janaina Sousa de Paula', '01786064308', '1987-02-24'::date, 'Ce cro 6618');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('1bc90dad-98d6-4034-a662-b396286bf963'::uuid, '60125121', 'Fortaleza', 'Dionisio Torres', 'Ap 503');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('55bc6379-3267-4c26-af45-0ebce6f90033'::uuid, '0599424', 'PF', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('55bc6379-3267-4c26-af45-0ebce6f90033'::uuid, 'Felipe Nobre Moura', '62425390391', '1979-07-28'::date, '4232');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('55bc6379-3267-4c26-af45-0ebce6f90033'::uuid, '60110000', 'Fortaleza', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('cf397cc0-e7bc-4775-a4b0-5450e6cf0140'::uuid, '4330566', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('cf397cc0-e7bc-4775-a4b0-5450e6cf0140'::uuid, 'RONNIERY FALCÃO DA SILVA', '95291164115', '1978-03-29'::date, 'MA 4578');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('cf397cc0-e7bc-4775-a4b0-5450e6cf0140'::uuid, '65062750', 'São Luís', 'Angelim', 'Cond. Fernando de Noronha BL 06 Apto 406');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a14c4102-c855-44a3-a4b8-8adcb2d26860'::uuid, '4602877', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('a14c4102-c855-44a3-a4b8-8adcb2d26860'::uuid, 'Lucas Eduardo Oliveira Borges Arruda', '05195461308', '1998-07-15'::date, 'GO021136');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('a14c4102-c855-44a3-a4b8-8adcb2d26860'::uuid, '74375509', 'Goiânia', 'Parque oeste industrial', 'Apt 807 torre 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('39d7d3aa-0cab-46ce-ac73-06cff8e0e085'::uuid, '1245756', 'PJ', 'Migrado do Bubble. Colaborador: 1760960811956x525267045364542460', '1760960811956x525267045364542460');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('39d7d3aa-0cab-46ce-ac73-06cff8e0e085'::uuid, 'Clinica odontologica Ident Ltda', 'Clinica odontologica Ident Ltda', '18746');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('39d7d3aa-0cab-46ce-ac73-06cff8e0e085'::uuid, '05073000', 'São Paulo', 'Lapa', 'sl');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9975daab-13f7-4b73-a090-aa689befdada'::uuid, '2126499', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('9975daab-13f7-4b73-a090-aa689befdada'::uuid, 'DANTE CENTRO INTEGRADO CLINICO, LABORATORIAL E EDUCACIONAL LTDA', 'DANTE CENTRO INTEGRADO CLINICO, LABORATORIAL E EDUCACIONAL LTDA', '3494');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9975daab-13f7-4b73-a090-aa689befdada'::uuid, '88331410', 'Balneário Camboriú', 'Praia dos Amores', 'INSTITUTO VALCANAIA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b5f21063-62a0-4e9d-a7cc-71a1b32dba3d'::uuid, '9172127', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b5f21063-62a0-4e9d-a7cc-71a1b32dba3d'::uuid, 'Thayane Carvalho de Almeida', '08848918956', '1992-08-18'::date, 'SC 15265');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('b5f21063-62a0-4e9d-a7cc-71a1b32dba3d'::uuid, '88140870', 'Santo Amaro da Imperatriz', 'Vila Becker', 'Sala 404');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('53519065-f50d-480a-a046-9883415ec348'::uuid, '6078508', 'PJ', 'Migrado do Bubble. Colaborador: 1760960018437x601408408359095800', '1760960018437x601408408359095800');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('53519065-f50d-480a-a046-9883415ec348'::uuid, 'Odontologia integrada planalto', 'Odontologia integrada planalto', '19273', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('53519065-f50d-480a-a046-9883415ec348'::uuid, '31730530', 'Belo Horizonte', 'Planalto', 'Endereço de entrega rua Osório duque estrada,186. Planalto');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9ec0b6d2-f61d-4bf0-a562-4a42b1c10fd2'::uuid, '3758277', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9ec0b6d2-f61d-4bf0-a562-4a42b1c10fd2'::uuid, 'Tatiana Regina Thomé da Silva Achôa', '02577929960', '1973-08-06'::date, '95002');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('9ec0b6d2-f61d-4bf0-a562-4a42b1c10fd2'::uuid, '17012533', 'Bauru', 'Vila Cidade Universitária');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('a3b82666-3167-43c6-a549-75bffa8dcc2c'::uuid, '2528707', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('a3b82666-3167-43c6-a549-75bffa8dcc2c'::uuid, 'GABRIELA SILVA DE OLIVEIRA', '41900254883', '1992-11-16'::date, '130821');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('a3b82666-3167-43c6-a549-75bffa8dcc2c'::uuid, '14020080', 'Ribeirão Preto', 'Vila Seixas');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b5f9ef3b-741c-417d-a70e-26988fa1dbd1'::uuid, '9506663', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('b5f9ef3b-741c-417d-a70e-26988fa1dbd1'::uuid, 'Thaís de Lima Moncler Santos', '47218034861', '1998-01-21'::date, 'SP152256');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b5f9ef3b-741c-417d-a70e-26988fa1dbd1'::uuid, '12922752', 'Bragança Paulista', 'Cidade Planejada II');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('79872850-b5fe-4aca-af06-0882395f3330'::uuid, '5691354', 'PF', 'Migrado do Bubble. Colaborador: 1760960289039x193094426802272300', '1760960289039x193094426802272300');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('79872850-b5fe-4aca-af06-0882395f3330'::uuid, 'Lethicia Gomes de Araújo Lays Piazzi', '10390577642', '1992-04-16'::date, 'MG - 45144', 'MG');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('79872850-b5fe-4aca-af06-0882395f3330'::uuid, '36010010', 'Juiz de Fora', 'Centro', 'Sala 301');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b1146aa1-9576-4c8f-ab5d-e31297e60f22'::uuid, '8763543', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('b1146aa1-9576-4c8f-ab5d-e31297e60f22'::uuid, 'Anderson Damasceno Belo', '33583833856', 'Sp 150117');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b1146aa1-9576-4c8f-ab5d-e31297e60f22'::uuid, '09130160', 'Santo André', 'Vila Tibiriçá');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c7285669-fdb3-4483-a654-1484efa4767a'::uuid, '8109418', 'PF', 'Migrado do Bubble. Colaborador: 1760961315711x132491962648193070', '1760961315711x132491962648193070');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('c7285669-fdb3-4483-a654-1484efa4767a'::uuid, 'Joelle Marie Garcia Morales', '22627968823', '1975-04-25'::date, '99844');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c7285669-fdb3-4483-a654-1484efa4767a'::uuid, '04023062', 'São Paulo', 'Vila Clementino', 'Cj 43');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('52abb710-30a4-4877-a686-d849ad29e882'::uuid, '9348637', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('52abb710-30a4-4877-a686-d849ad29e882'::uuid, 'Erica Gabriel da silva', '00084278609', '1973-06-17'::date, '27550');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('52abb710-30a4-4877-a686-d849ad29e882'::uuid, '37953310', 'São Sebastião do Paraíso', 'Residencial Califórnia Garden', 'Ap 101');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7aa95dc5-7757-44c6-a032-951d0380aa7d'::uuid, '1623571', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('7aa95dc5-7757-44c6-a032-951d0380aa7d'::uuid, 'Natascha Nunes Moreno', '39829129896', '1999-05-01'::date, 'SP 149.637');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('7aa95dc5-7757-44c6-a032-951d0380aa7d'::uuid, '08370120', 'SAO PAULO', 'Jardim São Gonçalo', 'Casa');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3e457f6e-b803-4f9e-ad3d-de03806a2978'::uuid, '4728493', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('3e457f6e-b803-4f9e-ad3d-de03806a2978'::uuid, 'Braulio José Bitencourte Soares da Costa', '02630695751', '1972-11-19'::date, 'RJ 20495');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3e457f6e-b803-4f9e-ad3d-de03806a2978'::uuid, '25620001', 'Petrópolis', 'Centro', '104');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('bffcf4f4-0c3b-4b92-ad3b-0d1f638c6c3e'::uuid, '9799281', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('bffcf4f4-0c3b-4b92-ad3b-0d1f638c6c3e'::uuid, 'Savi Clinic Odontologia', 'Savi Clinic Odontologia', '87628');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('bffcf4f4-0c3b-4b92-ad3b-0d1f638c6c3e'::uuid, '17014003', 'Bauru', 'Vila Santa Izabel');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5d5bd399-a79d-482c-a2b1-fd2243e74871'::uuid, '6511875', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('5d5bd399-a79d-482c-a2b1-fd2243e74871'::uuid, 'BAUMAN CLINICA ODONTOLOGICA LTDA', 'BAUMAN CLINICA ODONTOLOGICA LTDA', '18077');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5d5bd399-a79d-482c-a2b1-fd2243e74871'::uuid, '39401048', 'Montes Claros', 'Jardim São Luiz', 'Clinica Grupo Bauman Odontologia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('75465238-5546-40be-a10e-3a66126aaa21'::uuid, '6174701', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('75465238-5546-40be-a10e-3a66126aaa21'::uuid, 'Frederico Santos Lages', '07797288666', '1985-11-09'::date, 'MG-36544');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('75465238-5546-40be-a10e-3a66126aaa21'::uuid, '30380490', 'Belo Horizonte', 'Coração de Jesus');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0a4b3ae6-7f5e-4952-a1c9-8c2a593078c1'::uuid, '9117556', 'PJ', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('0a4b3ae6-7f5e-4952-a1c9-8c2a593078c1'::uuid, 'Dr Pedro Queiroz Odontologia LTDA', 'Dr Pedro Queiroz Odontologia LTDA', '42481');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('0a4b3ae6-7f5e-4952-a1c9-8c2a593078c1'::uuid, '24230060', 'Niterói', 'Icaraí', 'Sala 715');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('242bb97a-6607-4bd0-ae3f-65bd32eb4f9e'::uuid, '9191781', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro, cro_uf) VALUES ('242bb97a-6607-4bd0-ae3f-65bd32eb4f9e'::uuid, 'Alice Villa Silva', '08707998783', '1979-11-17'::date, 'RJ - 28130', 'RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('242bb97a-6607-4bd0-ae3f-65bd32eb4f9e'::uuid, '28470000', 'Santo Antônio de Pádua', 'Parque das Aguas');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('21acaaec-a220-4b21-a955-6505198b2ceb'::uuid, '6634050', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('21acaaec-a220-4b21-a955-6505198b2ceb'::uuid, 'Ana Carolina Neiva Schleier', '15885218773', '2022-03-28'::date, 'RJ52616');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('21acaaec-a220-4b21-a955-6505198b2ceb'::uuid, '22795077', 'Rio de Janeiro', 'Recreio dos Bandeirantes', 'Clínica Hypolito');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('68fa8dfe-e14a-42cf-a232-d8c0f02c6de1'::uuid, '7234769', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('68fa8dfe-e14a-42cf-a232-d8c0f02c6de1'::uuid, 'MG CLINICA ODONTOLOGICA LTDA', 'MG CLINICA ODONTOLOGICA LTDA', '13327 CRO');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('68fa8dfe-e14a-42cf-a232-d8c0f02c6de1'::uuid, '88062020', 'Florianópolis', 'Lagoa da Conceição', 'SALA 201 SHOPPING VIA LAGOA');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('3b1b70bb-e123-42b6-af6c-b85f1b35f0af'::uuid, '8991853', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('3b1b70bb-e123-42b6-af6c-b85f1b35f0af'::uuid, 'PAULO H F DE ARÊA LEÃO', 'PAULO H F DE ARÊA LEÃO', '2589');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('3b1b70bb-e123-42b6-af6c-b85f1b35f0af'::uuid, '64049494', 'Teresina', 'Fátima', 'Sala 1205');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dbea2b6b-0ae8-4594-a06b-194022003cb9'::uuid, '8235849', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('dbea2b6b-0ae8-4594-a06b-194022003cb9'::uuid, 'João Carlos Antunes da Silva Júnior', '00414266650', '1999-06-01'::date, 'MG25076');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('dbea2b6b-0ae8-4594-a06b-194022003cb9'::uuid, '37500013', 'Itajubá', 'Centro', 'Apto 907');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('361389dd-68b2-4c5c-ab74-9b6a58d972fe'::uuid, '5089849', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('361389dd-68b2-4c5c-ab74-9b6a58d972fe'::uuid, 'CENTRO DE REABILITAÇÃO ODONTOLOGIA E FISIOTERAPIA INTEGRADA', 'CENTRO DE REABILITAÇÃO ODONTOLOGIA E FISIOTERAPIA INTEGRADA', '9727');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('361389dd-68b2-4c5c-ab74-9b6a58d972fe'::uuid, '58416540', 'Campina Grande', 'Santa Rosa', 'portas de vidro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('b718ca99-3d4b-401d-a918-40d43cf602ea'::uuid, '9407599', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('b718ca99-3d4b-401d-a918-40d43cf602ea'::uuid, 'HOMA- HOSPITAL ODONTO MÉDICO DA AMAZÔNIA LTDA', 'HOMA- HOSPITAL ODONTO MÉDICO DA AMAZÔNIA LTDA', '2024');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('b718ca99-3d4b-401d-a918-40d43cf602ea'::uuid, '66055000', 'Belém', 'Umarizal');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ed245403-58bf-4305-ac62-b04d2b1f3f15'::uuid, '2843251', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ed245403-58bf-4305-ac62-b04d2b1f3f15'::uuid, 'EDSON ALVES DE ANDRADE FILHO', '65978498334', '1986-04-26'::date, '05244');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ed245403-58bf-4305-ac62-b04d2b1f3f15'::uuid, '64048380', 'Teresina', 'Jóquei', 'AP 601');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('65a5dd94-a197-4fd8-ac58-25574c93cf80'::uuid, '6513232', 'PF', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('65a5dd94-a197-4fd8-ac58-25574c93cf80'::uuid, 'BRUNO PINHEIRO NOBRE', '97192180378', '1983-12-28'::date, '5389/CE');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('65a5dd94-a197-4fd8-ac58-25574c93cf80'::uuid, '60150190', 'Fortaleza', 'Aldeota', 'Torre 2, Salas 612-613');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('d4ba328e-01da-4149-a584-02d5c254cb51'::uuid, '1240695', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('d4ba328e-01da-4149-a584-02d5c254cb51'::uuid, 'Felipe Camargo de Freitas', '10627471609', '1995-03-02'::date, 'SP 120342');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('d4ba328e-01da-4149-a584-02d5c254cb51'::uuid, '14160210', 'Sertãozinho', 'Centro', 'Sense Prime');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4bf4e0fa-d03f-48a0-a2a2-105dfe831d83'::uuid, '2961824', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4bf4e0fa-d03f-48a0-a2a2-105dfe831d83'::uuid, 'Fideles Castro Ferreira Martins', '71655735187', '1981-03-23'::date, '25442 GOIÁS');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4bf4e0fa-d03f-48a0-a2a2-105dfe831d83'::uuid, '74435060', 'Goiânia', 'Aeroviário', 'Predio verde');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('0840b5c8-9a60-4302-afe7-7655c173208e'::uuid, '1952576', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('0840b5c8-9a60-4302-afe7-7655c173208e'::uuid, 'Cilene Marques Lagoa Rufino', '15474242816', 'SP 62899');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('0840b5c8-9a60-4302-afe7-7655c173208e'::uuid, '6083215', 'Osasco', 'Vila Osasco');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ee468800-30c3-4cd6-a8b2-f84f0b2d2d7e'::uuid, '6510455', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('ee468800-30c3-4cd6-a8b2-f84f0b2d2d7e'::uuid, 'raquel palhares zcaber lages', '49368400687', 'mg11528');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ee468800-30c3-4cd6-a8b2-f84f0b2d2d7e'::uuid, '30535460', 'Belo Horizonte', 'Coração Eucarístico', 'salao 108');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9ed1ba58-1a1b-4a70-ac8b-4d977cdd67de'::uuid, '0826036', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('9ed1ba58-1a1b-4a70-ac8b-4d977cdd67de'::uuid, 'Kairós Odontologia Ltda - Me', 'Kairós Odontologia Ltda - Me', '61993196560');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9ed1ba58-1a1b-4a70-ac8b-4d977cdd67de'::uuid, '70200670', 'Brasília', 'Asa Sul', 'L2 Sul');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('6ea62471-07a0-41b9-a2e3-b6c31caeb088'::uuid, '2603939', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('6ea62471-07a0-41b9-a2e3-b6c31caeb088'::uuid, 'ODONTOPAS ODONTOLOGIA', 'ODONTOPAS ODONTOLOGIA', 'MG 28005');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('6ea62471-07a0-41b9-a2e3-b6c31caeb088'::uuid, '33230055', 'Lagoa Santa', 'Centro', 'LOJA 2');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2f647a38-d210-45e2-a77f-f463f36d05e7'::uuid, '2727279', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2f647a38-d210-45e2-a77f-f463f36d05e7'::uuid, 'Isadora Gondim Moura', '06444227186', '1998-08-11'::date, 'GO 18861');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2f647a38-d210-45e2-a77f-f463f36d05e7'::uuid, '74230022', 'Goiânia', 'Setor Bueno', 'Qd. 112 Lt 07');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('878dc730-be21-42ad-ad0a-03c6eedf15a8'::uuid, '6494388', 'PJ', 'Migrado do Bubble. Colaborador: 1771934581868x271800717018472860', '1771934581868x271800717018472860');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('878dc730-be21-42ad-ad0a-03c6eedf15a8'::uuid, 'OU PASSOS CLÍNICA ODONTOLÓGICA LTDA', 'OU PASSOS CLÍNICA ODONTOLÓGICA LTDA', '070290');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('878dc730-be21-42ad-ad0a-03c6eedf15a8'::uuid, '37904017', 'Passos', 'Santa Casa', 'Clínica Oral Unic');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('5f753802-622b-4603-aeca-7a524e5079e9'::uuid, '5876718', 'PF', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('5f753802-622b-4603-aeca-7a524e5079e9'::uuid, 'TAYNA DA COSTA MIRANDA', '07625425606', '1985-06-17'::date, 'SP 102892');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('5f753802-622b-4603-aeca-7a524e5079e9'::uuid, '14093017', 'Ribeirão Preto', 'Parque dos Lagos', 'AP 1701 TORRE 1');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('da1819f7-dfe4-402b-a5fa-b54a8d5f5534'::uuid, '3521470', 'PF', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('da1819f7-dfe4-402b-a5fa-b54a8d5f5534'::uuid, 'Fábio Jose Reis', '17413157861', '1974-08-30'::date, 'SP 59896');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('da1819f7-dfe4-402b-a5fa-b54a8d5f5534'::uuid, '18706240', 'Avaré', 'Colina da Boa Vista');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7f73308d-ed91-4161-af6a-16dbe57c8e95'::uuid, '8667185', 'PJ', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('7f73308d-ed91-4161-af6a-16dbe57c8e95'::uuid, 'Lins e sciammarella odontologia', 'Lins e sciammarella odontologia', '44633');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7f73308d-ed91-4161-af6a-16dbe57c8e95'::uuid, '24936730', 'Maricá', 'Praia de Itaipuaçu (Itaipuaçu)');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4b842fa2-38d5-4d36-aae7-5ca3a51585cb'::uuid, '1907490', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('4b842fa2-38d5-4d36-aae7-5ca3a51585cb'::uuid, 'Studio Oralgold - Setor Bueno Go LTDA', 'Studio Oralgold - Setor Bueno Go LTDA', '15659');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4b842fa2-38d5-4d36-aae7-5ca3a51585cb'::uuid, '74223070', 'Goiânia', 'Setor Bueno', 'Qd.112 Lt.7');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('617a70c0-9e37-4b19-ad50-9612a3b50269'::uuid, '2072833', 'PF', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('617a70c0-9e37-4b19-ad50-9612a3b50269'::uuid, 'Mariana Alves de Lima', '31120263816', '1982-06-24'::date, '82172');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('617a70c0-9e37-4b19-ad50-9612a3b50269'::uuid, '03305000', 'São Paulo', 'Cidade Mãe do Céu', '1407');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2a1a5745-9e38-4700-a656-8a658b3920a9'::uuid, '5180777', 'PJ', 'Migrado do Bubble. Colaborador: 1760961228860x811902827289403500', '1760961228860x811902827289403500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('2a1a5745-9e38-4700-a656-8a658b3920a9'::uuid, 'interdental odontologia integrada ltda', 'interdental odontologia integrada ltda', '2647');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('2a1a5745-9e38-4700-a656-8a658b3920a9'::uuid, '58030330', 'João Pessoa', 'Estados');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('06b4f8da-732b-46d2-a8ff-be96945465f1'::uuid, '8735492', 'PF', 'Migrado do Bubble. Colaborador: 1760961315711x132491962648193070', '1760961315711x132491962648193070');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('06b4f8da-732b-46d2-a8ff-be96945465f1'::uuid, 'Alison de Almeida Santos Sodré', '05550117550', '15659 BA');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('06b4f8da-732b-46d2-a8ff-be96945465f1'::uuid, '41820021', 'Salvador', 'Caminho das Árvores', 'CEO Salvador Shopping, Sala: 2711/2712');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('09bcdf70-55d3-47ef-a941-51fa30261131'::uuid, '8708468', 'PF', 'Migrado do Bubble. Colaborador: 1778855241290x782971465515476000', '1778855241290x782971465515476000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('09bcdf70-55d3-47ef-a941-51fa30261131'::uuid, 'RENATO FARIA DIAS', '09172687762', '1979-05-05'::date, 'RJ 29649');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('09bcdf70-55d3-47ef-a941-51fa30261131'::uuid, '28500000', 'CANTAGALO', 'Centro/ Clínica Dentária Sorria', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fc03c5e2-010f-4f05-a4d0-55483e8cbfef'::uuid, '4097029', 'PJ', 'Migrado do Bubble. Colaborador: 1769711538475x495488439983629000', '1769711538475x495488439983629000');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('fc03c5e2-010f-4f05-a4d0-55483e8cbfef'::uuid, 'SALA & DESIDERIO ODONTOLOGIA LTDA', 'SALA & DESIDERIO ODONTOLOGIA LTDA', '75886');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('fc03c5e2-010f-4f05-a4d0-55483e8cbfef'::uuid, '14160740', 'Sertãozinho', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('56d205d3-fa03-4ee2-a1bc-ea7d7d621270'::uuid, '5346152', 'PJ', 'Migrado do Bubble. Colaborador: 1760961840687x680878089921823900', '1760961840687x680878089921823900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('56d205d3-fa03-4ee2-a1bc-ea7d7d621270'::uuid, 'GANBATÊ ODONTOLOGIA EIRELI', 'GANBATÊ ODONTOLOGIA EIRELI', '22322');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('56d205d3-fa03-4ee2-a1bc-ea7d7d621270'::uuid, '13635000', 'Pirassununga', 'Jardim Elite');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('46444051-e527-44f8-accd-7985a64322ca'::uuid, '8075798', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('46444051-e527-44f8-accd-7985a64322ca'::uuid, 'Fernando Rodrigues da Cunha', '60245468668', '1970-07-31'::date, 'MG 17995');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('46444051-e527-44f8-accd-7985a64322ca'::uuid, '38440238', 'Araguari', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('242f8943-fd3d-4c7c-a7ca-32af07f1a224'::uuid, '8233679', 'PF', 'Migrado do Bubble. Colaborador: 1760960600443x741639706693608400', '1760960600443x741639706693608400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('242f8943-fd3d-4c7c-a7ca-32af07f1a224'::uuid, 'ANDERSON SILVA DE JESUS', '01578631580', '1985-09-26'::date, 'BAHIA 11438');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('242f8943-fd3d-4c7c-a7ca-32af07f1a224'::uuid, '45605470', 'Itabuna', 'Jardim Vitória', '9 ANDAR, SALA 902');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('1d1db31c-695f-4d12-a631-44d356419cc1'::uuid, '2810329', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('1d1db31c-695f-4d12-a631-44d356419cc1'::uuid, 'Vitória Celeste Fernandes Teixeira do Carmo', '06789844686', '1983-07-16'::date, 'MG 37426');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('1d1db31c-695f-4d12-a631-44d356419cc1'::uuid, '36026210', 'Juiz de Fora', 'Santa Cecília');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('621e7640-f96d-439f-a6e6-6470ac4911b1'::uuid, '5774158', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('621e7640-f96d-439f-a6e6-6470ac4911b1'::uuid, 'Gustavo Viana Montechi Silva', '00218285124', '1983-07-22'::date, 'Df Cro 7436');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('621e7640-f96d-439f-a6e6-6470ac4911b1'::uuid, '70715900', 'Brasília', 'Asa Norte', 'Mond Clinic torre norte');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4b9493e3-8175-4a38-af8d-aef62d432f43'::uuid, '0303015', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4b9493e3-8175-4a38-af8d-aef62d432f43'::uuid, 'Ana Marília Carmanini Gomes', '09929537660', '1989-08-23'::date, 'MG 41603');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4b9493e3-8175-4a38-af8d-aef62d432f43'::uuid, '36520000', 'VISCONDE DO RIO BRANCO', 'Centro', 'sala 103 - Edifício Florença');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c9cda5c1-2e29-46c2-a470-3ba51994c1fe'::uuid, '0005907', 'PF', 'Migrado do Bubble. Colaborador: 1760960868089x336980982901814900', '1760960868089x336980982901814900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('c9cda5c1-2e29-46c2-a470-3ba51994c1fe'::uuid, 'Sergio Carlos da Luz Pimentel Meiga', '98499491715', '1968-04-06'::date, '18221-8');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('c9cda5c1-2e29-46c2-a470-3ba51994c1fe'::uuid, '22640102', 'Rio de Janeiro', 'Barra da Tijuca', 'Bloco 07 sala 711');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8ef6094f-8aac-4b0c-a1b6-ca8ccf6bbde6'::uuid, '7335657', 'PF', 'Migrado do Bubble. Colaborador: 1778855241290x782971465515476000', '1778855241290x782971465515476000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('8ef6094f-8aac-4b0c-a1b6-ca8ccf6bbde6'::uuid, 'Micheline Leal Meirelles Duncan', '02772081737', '32527 RJ');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8ef6094f-8aac-4b0c-a1b6-ca8ccf6bbde6'::uuid, '28010272', 'Campos dos Goytacazes', 'Centro', 'Sala 217');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('c32f13c3-2994-4040-a036-8c01bec6ee58'::uuid, '3129507', 'PJ', 'Migrado do Bubble. Colaborador: 1760961186000x316786191684159900', '1760961186000x316786191684159900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('c32f13c3-2994-4040-a036-8c01bec6ee58'::uuid, 'All odontologia integrada ltda', 'All odontologia integrada ltda', '61148');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('c32f13c3-2994-4040-a036-8c01bec6ee58'::uuid, '03315000', 'São Paulo', 'Vila Gomes Cardim');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('4d1c9b42-495d-4646-a39d-7d8cd680e118'::uuid, '2090585', 'PF', 'Migrado do Bubble. Colaborador: 1778855241290x782971465515476000', '1778855241290x782971465515476000');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('4d1c9b42-495d-4646-a39d-7d8cd680e118'::uuid, 'LUIZ FERNANDO SARDINHA', '47299061791', '1955-04-08'::date, '10284');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('4d1c9b42-495d-4646-a39d-7d8cd680e118'::uuid, '28035260', 'Campos dos Goytacazes', 'Centro', 'SALA 704');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('e52d8f3c-a759-473f-af5a-0be3283bfebf'::uuid, '5678813', 'PF', 'Migrado do Bubble. Colaborador: 1763558838787x555178200777497400', '1763558838787x555178200777497400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('e52d8f3c-a759-473f-af5a-0be3283bfebf'::uuid, 'Gabriel lima johany de mello', '14529948625', '2025-02-15'::date, 'Rj 58092');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('e52d8f3c-a759-473f-af5a-0be3283bfebf'::uuid, '36242326', 'Santos Dumont', 'Graminha');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('25b621d9-d7ba-44ce-a686-23b9ef6ec39b'::uuid, '3588512', 'PJ', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro, cro_uf) VALUES ('25b621d9-d7ba-44ce-a686-23b9ef6ec39b'::uuid, 'Zefiro odontologia integrada', 'Zefiro odontologia integrada', '8916', 'rj');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('25b621d9-d7ba-44ce-a686-23b9ef6ec39b'::uuid, '24020320', 'Niterói', 'Centro', '204');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('dfe19684-3a94-4c00-a1ed-2c4d96d98347'::uuid, '1271195', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('dfe19684-3a94-4c00-a1ed-2c4d96d98347'::uuid, 'Marcela Maria Pereira de Souza', '14938614766', '1999-05-18'::date, 'Rj 51475');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('dfe19684-3a94-4c00-a1ed-2c4d96d98347'::uuid, '25710259', 'Petrópolis', 'Samambaia');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('8632dfee-217f-43df-adf2-41af3b3002b1'::uuid, '0290210', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('8632dfee-217f-43df-adf2-41af3b3002b1'::uuid, 'Ana Lucia Tancredo Micati', '02129484743', '1973-07-15'::date, '23053');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('8632dfee-217f-43df-adf2-41af3b3002b1'::uuid, '25953090', 'Teresópolis', 'Várzea', 'sala 404,405 e 406');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('2b5ed0c6-9a78-41f7-a773-06b1c10c32d5'::uuid, '5308522', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('2b5ed0c6-9a78-41f7-a773-06b1c10c32d5'::uuid, 'BRUNO MARTINS DE SOUZA', '11790038707', '1987-03-17'::date, 'RJ 40487');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('2b5ed0c6-9a78-41f7-a773-06b1c10c32d5'::uuid, '21235111', 'Rio de Janeiro', 'Irajá', 'SALA 202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('937bd16d-2e28-44ad-afac-1f1d6a6109c3'::uuid, '6487233', 'PF', 'Migrado do Bubble. Colaborador: 1760960600443x741639706693608400', '1760960600443x741639706693608400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, cro) VALUES ('937bd16d-2e28-44ad-afac-1f1d6a6109c3'::uuid, 'Sandra Nabuco de Araujo', '05215296898', '37600');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('937bd16d-2e28-44ad-afac-1f1d6a6109c3'::uuid, '01243001', 'São Paulo', 'Consolação', '11');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('06eff087-e20e-497f-a2cc-c3104fcf5201'::uuid, '0284831', 'PF', 'Migrado do Bubble. Colaborador: 1760960188423x644435733651189700', '1760960188423x644435733651189700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('06eff087-e20e-497f-a2cc-c3104fcf5201'::uuid, 'Lígia Maria Camargo Thomé', '55094686615', '1993-07-26'::date, 'MG 17869');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('06eff087-e20e-497f-a2cc-c3104fcf5201'::uuid, '35010151', 'Governador Valadares', 'Centro', 'Sala 202');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9c19a83b-4001-4ac6-ae91-dbff531dc8a3'::uuid, '6307695', 'PF', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9c19a83b-4001-4ac6-ae91-dbff531dc8a3'::uuid, 'Ricardo Koch', '00066093929', '1978-06-10'::date, '6440');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('9c19a83b-4001-4ac6-ae91-dbff531dc8a3'::uuid, '89294000', 'Campo Alegre', 'Centro');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('fb4b797a-ded9-42e4-a261-58baf3c7a38d'::uuid, '0511731', 'PJ', 'Migrado do Bubble. Colaborador: 1760961206569x556096945855634900', '1760961206569x556096945855634900');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('fb4b797a-ded9-42e4-a261-58baf3c7a38d'::uuid, 'Laboratório de Prótese Dentária Késsia Salviano', 'Laboratório de Prótese Dentária Késsia Salviano', '04289');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('fb4b797a-ded9-42e4-a261-58baf3c7a38d'::uuid, '35540000', 'Oliveira', 'Dom Bosco');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('9cb63daa-3bf4-42c6-afdd-a8fce5ddcae3'::uuid, '4879322', 'PF', 'Migrado do Bubble. Colaborador: 1760961159031x253699825227851700', '1760961159031x253699825227851700');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('9cb63daa-3bf4-42c6-afdd-a8fce5ddcae3'::uuid, 'HELVIO MASETI CONCEIÇÃO', '07159623886', '1967-05-29'::date, 'SP + 39588');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('9cb63daa-3bf4-42c6-afdd-a8fce5ddcae3'::uuid, '14096570', 'Ribeirão Preto', 'Nova Ribeirânia', 'Sala 1305');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('ca74ae73-4f1a-463a-a6be-d482d307f715'::uuid, '3694936', 'PF', 'Migrado do Bubble. Colaborador: 1773851922776x770562341900198400', '1773851922776x770562341900198400');
INSERT INTO public.cadastros_pf (cadastro_id, nome, cpf, data_nascimento, cro) VALUES ('ca74ae73-4f1a-463a-a6be-d482d307f715'::uuid, 'Omar Vicente Micati', '39210707753', '1955-10-05'::date, '11582');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('ca74ae73-4f1a-463a-a6be-d482d307f715'::uuid, '25953090', 'Teresópolis', 'Várzea', '404/406');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('50f5cc39-09bc-484f-a5c7-f16675c898c4'::uuid, '4826086', 'PJ', 'Migrado do Bubble. Colaborador: 1760960103185x615084713055062500', '1760960103185x615084713055062500');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('50f5cc39-09bc-484f-a5c7-f16675c898c4'::uuid, 'Reabilita Odontologia Especializada Ltda', 'Reabilita Odontologia Especializada Ltda', '11638');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro, complemento) VALUES ('50f5cc39-09bc-484f-a5c7-f16675c898c4'::uuid, '88015020', 'Florianópolis', 'Centro', 'sala 605');
INSERT INTO public.cadastros (id, codigo_cliente, tipo_pessoa, observacoes, colaborador) VALUES ('7cee528e-ebaa-484f-a3e6-28f8cd59b7a3'::uuid, '0320011', 'PJ', 'Migrado do Bubble. Colaborador: 1760961252873x320660805430841320', '1760961252873x320660805430841320');
INSERT INTO public.cadastros_pj (cadastro_id, razao_social, nome_fantasia, cro) VALUES ('7cee528e-ebaa-484f-a3e6-28f8cd59b7a3'::uuid, 'ODONTOLOGIA VALEJO PIVA LTDA', 'ODONTOLOGIA VALEJO PIVA LTDA', '15391');
INSERT INTO public.cadastros_enderecos (cadastro_id, cep, cidade, bairro) VALUES ('7cee528e-ebaa-484f-a3e6-28f8cd59b7a3'::uuid, '13073141', 'Campinas', 'Jardim Guanabara');

-- ================================================================
-- LEADS (importados de eventos)
-- ================================================================

INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '4a0df426-d546-40f5-a18c-a58430db6229'::uuid,
    'Diego Augusto Delgado',
    'duggy_19@msn.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 31149. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'b57d16f6-3912-44a5-ac09-3c5fcef378ee'::uuid,
    'Dayanha rouss zevallos tirado',
    'roussdzeti@icloud.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 89611. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '02f202fb-bb2b-4800-a482-39a20c561a05'::uuid,
    'Edgard david garcia barandiaran',
    'edgardgarciabarandiaran@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 56756. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '35af51e3-a548-4891-a946-5d21546e847a'::uuid,
    'Luis Felipe Acevedo',
    'acevedo.lfelipe@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 33725. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '5dc6e813-b8fe-487e-acd4-9e193f1ccdcd'::uuid,
    'Celena Andrade',
    'candradeodontologia@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 08408. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '24e41fba-6a48-4133-a667-bfe08f830f36'::uuid,
    'Karina Pilar Soria Guañuna',
    'kpsoria@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 81123. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '0828e2e3-26b2-4269-a363-596e72709b31'::uuid,
    'Luis Guillermo Peredo',
    'lgperedopaz@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 62566. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '0fe22220-3927-468a-a12f-78100c96c79b'::uuid,
    'JUAN CARLOS SALVADOR GARCES',
    'jusal26@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 22628. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '9f8fc12a-dea8-4f4b-a23d-2cb800fd2975'::uuid,
    'Pedro Villegas',
    'pdrvills1@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 44350. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '0d03e451-08d3-424c-abb4-1251406e1c93'::uuid,
    'Richard Fabian Montalván Ruilova',
    'richy-1985@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 60596. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '174a8623-5924-4dbd-af80-c0dcbe62f916'::uuid,
    'Juan Nicanor Medina Godoy',
    'julio2119@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 82319. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'c94e52a0-7917-404d-a9bd-a080216253a2'::uuid,
    'marialejandra morales centeno',
    'celinasmiles7@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 43862. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'a0f3cb81-2281-4694-a1bd-76216d2dc8fb'::uuid,
    'carlos junior angulo rodriguez',
    'mynw4567@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 58532. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '77cf7ca2-2689-4999-a024-55a8d7e7f784'::uuid,
    'DANIEL MORALES',
    'implant.trainingcenter@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 73469. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'e730be66-d956-4695-ae77-29c22604498a'::uuid,
    'David Gonzalo Montero López',
    'locritomontero@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 15274. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'e3109eaf-7f2f-4325-a1f7-52934872d65a'::uuid,
    'Rafael Rossini Borges',
    'rossiniortodontia@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 05145. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'e2adac2b-ff9e-4367-a7dd-d308ff6ac1c2'::uuid,
    'Juan Guillermo Peredo Nery',
    'j.peredo@technodent.com.bo',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 09513. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'dfbc5633-8097-4976-ad64-ef669abaea6d'::uuid,
    'Geraldo Sávio Almeida Holanda',
    'clinicaodontologica.cenpro@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 36745. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '029bd9ce-fd0a-4194-a581-33393781cedc'::uuid,
    'Ana Ma Siqueira de Araujo Holanda',
    'anasiqueira8@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 30254. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'a9789c5c-ccf9-4b8c-aeec-a7da88ccae03'::uuid,
    'Rodrigo Alves lagrotta Campos',
    'rodrigocamposlagrotta@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 80737. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '1990ab89-7d91-4f46-a466-73e9b2379eac'::uuid,
    'Vinícius Soares Silva Figueiredo',
    'drviniciusfig@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 79987. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'ef3e9b43-ff07-4dc1-ad32-503b180813ab'::uuid,
    'HEITOR B REIS',
    'heitor@iopodonto.com.br',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 95977. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '7a261cf2-6fde-47f1-a830-e728d7c57547'::uuid,
    'Sylvia lorena pflucker ballon',
    'celinasmiles7@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 52594. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '586669d6-57fa-414f-a4bf-e995a9e3f90e'::uuid,
    'Samuel Dias gomes',
    'samueltb2904@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 35487. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'b357a208-df01-4ff0-a5ab-6cab87fcc001'::uuid,
    'Luciano Alves Machado',
    'lualvesmachado71@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 17635. Confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '40cf1687-9002-4cda-a7be-b5c302a2a326'::uuid,
    'Boris munoz videla',
    'bvmv19@gmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 09998. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '60989a26-80d0-4aa7-a47c-80d6d91afd21'::uuid,
    'Pablo Sánchez Salazar',
    'pafer_98@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 47623. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    'c66134ab-677a-4e9f-afb9-7852ec70b651'::uuid,
    'Pablo Sánchez Figueroa',
    'clasdental@yahoo.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 40670. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '69dc5795-17cd-42e1-a0e6-51a144dba895'::uuid,
    'Ana Rosa Lalama saltos',
    'analalama.rouss@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 78645. Não confirmado.'
  );
INSERT INTO public.leads (id, nome, contato, origem, estagio, observacoes)
  VALUES (
    '7c163b1d-f206-4001-add7-a159211709cc'::uuid,
    'Fanny Chela',
    'fanny_chelys@hotmail.com',
    'Evento Bubble',
    'novo',
    'Importado de evento Bubble. Sorteio: 54797. Não confirmado.'
  );

COMMIT;
