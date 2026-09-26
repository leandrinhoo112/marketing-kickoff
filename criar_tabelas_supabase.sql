-- =====================================================
-- SQL PARA CRIAR TODAS AS TABELAS NO NOVO SUPABASE
-- Cole isso no SQL Editor do novo projeto Supabase
-- =====================================================

-- 1. KICKOFFS (Check-ins diários / Radar do dia)
CREATE TABLE IF NOT EXISTS kickoffs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    today_tasks TEXT,
    help_needed TEXT,
    who_help TEXT,
    blockers TEXT,
    observations TEXT,
    energy_level TEXT DEFAULT '😐 Normal',
    reactions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUCESSOS (Celebrações semanais)
CREATE TABLE IF NOT EXISTS sucessos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    victory TEXT,
    praise TEXT,
    insight TEXT,
    monthly_goal_progress TEXT,
    reactions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUGESTOES (Sugestões + Enquetes + Férias)
CREATE TABLE IF NOT EXISTS sugestoes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT,
    sugestao TEXT,
    reactions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FEEDBACKS (Feedback anônimo)
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    desempenho TEXT,
    melhorar_marketing TEXT,
    sugestao TEXT,
    sobrecarregado TEXT DEFAULT 'Não informado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOVIDADES (Publicações do gestor)
CREATE TABLE IF NOT EXISTS novidades (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo TEXT,
    descricao TEXT,
    autor TEXT DEFAULT 'Gestor',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MINIGAME_SCORES (Placar do Termo)
CREATE TABLE IF NOT EXISTS minigame_scores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario TEXT NOT NULL,
    data_jogo TEXT,
    tentativas INT,
    venceu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CACAPALAVRAS_SCORES (Placar do Caça-Palavras)
CREATE TABLE IF NOT EXISTS cacapalavras_scores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario TEXT NOT NULL,
    data_jogo TEXT,
    palavras_achadas INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TUTORIALS (Tutoriais do time)
CREATE TABLE IF NOT EXISTS tutorials (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Geral',
    steps TEXT,
    tip TEXT,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OMEUEMAIOR_SCORES (Placar do jogo O Meu é Maior)
CREATE TABLE IF NOT EXISTS omeuemaior_scores (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario TEXT NOT NULL,
    data_jogo TEXT NOT NULL,
    pontos INT DEFAULT 0,
    detalhes JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) + ACESSO PÚBLICO
-- Permite que qualquer pessoa com a anon key leia/escreva
-- =====================================================

ALTER TABLE kickoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE novidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigame_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cacapalavras_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE omeuemaior_scores ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (leitura e escrita para todos)
CREATE POLICY "Acesso público kickoffs" ON kickoffs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público sucessos" ON sucessos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público sugestoes" ON sugestoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público novidades" ON novidades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público minigame_scores" ON minigame_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público cacapalavras_scores" ON cacapalavras_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público tutorials" ON tutorials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público omeuemaior_scores" ON omeuemaior_scores FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PRONTO! Todas as 9 tabelas criadas com sucesso ✅
-- =====================================================
