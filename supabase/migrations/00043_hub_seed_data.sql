-- ============================================================
-- Migration 00043: Seed Data Módulo HUB
-- ============================================================

-- 1. Gamification Levels (8 níveis do projeto original)
INSERT INTO hub_gamification_levels (name, min_points, order_index, color) VALUES
  ('Iniciante', 0, 1, '#888888'),
  ('Aprendiz', 100, 2, '#3b82f6'),
  ('Estudante', 300, 3, '#8b5cf6'),
  ('Especialista', 600, 4, '#06b6d4'),
  ('Mestre', 1000, 5, '#10b981'),
  ('Líder', 2000, 6, '#f59e0b'),
  ('Grão-Mestre', 5000, 7, '#ef4444'),
  ('Lendário', 10000, 8, '#c9a655')
ON CONFLICT DO NOTHING;

-- 2. Badges padrão (10 badges do projeto original)
INSERT INTO hub_badges (name, description, icon_name, trigger_type, trigger_value, points_reward, color) VALUES
  ('Descobridor', 'Abra seu primeiro material', 'star', 'material_completed', 1, 10, '#ffd700'),
  ('Leitor Compromissado', 'Complete 10 materiais', 'book', 'material_completed', 10, 50, '#6366f1'),
  ('Mestre do Conhecimento', 'Complete 50 materiais', 'graduation', 'material_completed', 50, 200, '#8b5cf6'),
  ('Primeiro Passo', 'Complete sua primeira trilha', 'rocket', 'collection_completed', 1, 25, '#f59e0b'),
  ('Caçador de Trilhas', 'Complete 5 trilhas', 'trophy', 'collection_completed', 5, 100, '#c9a655'),
  ('Diamante', 'Alcance 1.000 XP', 'diamond', 'points_reached', 1000, 300, '#06b6d4'),
  ('Líder', 'Fique em 1º lugar no ranking', 'crown', 'ranking_position', 1, 150, '#c9a655'),
  ('Sequência de Ouro', 'Acesse por 7 dias seguidos', 'flame', 'streak_days', 7, 50, '#ef4444'),
  ('Veterano', 'Acesse por 30 dias', 'shield', 'streak_days', 30, 150, '#10b981'),
  ('Colecionador XP', 'Complete 500 materiais', 'stars', 'material_completed', 500, 500, '#ec4899')
ON CONFLICT DO NOTHING;

-- 3. System Config padrão (será vinculado à primeira empresa via script)
-- Nota: empresa_id é obrigatório, seed via aplicação ou script específico
