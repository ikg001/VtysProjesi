-- Streaks table for tracking routine consistency
-- This table is managed by application logic, NOT database triggers

CREATE TABLE IF NOT EXISTS public.streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id      UUID NOT NULL UNIQUE REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INT NOT NULL DEFAULT 0,
  best_streak     INT NOT NULL DEFAULT 0,
  last_checkin_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_routine ON public.streaks(routine_id);

-- RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own streaks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='streaks' AND policyname='streaks_owner_all'
  ) THEN
    CREATE POLICY streaks_owner_all
    ON public.streaks
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname='trg_streaks_updated_at' AND c.relname='streaks' AND n.nspname='public'
  ) THEN
    CREATE TRIGGER trg_streaks_updated_at
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- Events table for telemetry
CREATE TABLE IF NOT EXISTS public.events (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  payload   JSONB NOT NULL DEFAULT '{}'::JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_ts ON public.events(user_id, timestamp DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='events' AND policyname='events_owner_all'
  ) THEN
    CREATE POLICY events_owner_all
    ON public.events
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;
