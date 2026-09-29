-- =====================================================
-- TABELA DO JOGO: O MEU É MAIOR
-- Execute no SQL Editor do Supabase para ativar o ranking geral
-- =====================================================

CREATE TABLE IF NOT EXISTS omeuemaior_scores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario TEXT NOT NULL,
    data_jogo TEXT NOT NULL,
    pontos INT DEFAULT 0,
    detalhes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE omeuemaior_scores ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e gravação para a anon key (acesso público)
DROP POLICY IF EXISTS "Acesso público omeuemaior_scores" ON omeuemaior_scores;
CREATE POLICY "Acesso público omeuemaior_scores" ON omeuemaior_scores FOR ALL USING (true) WITH CHECK (true);

-- Índices para carregamento instantâneo do ranking
CREATE INDEX IF NOT EXISTS idx_omeuemaior_data_pontos ON omeuemaior_scores(data_jogo, pontos DESC);
