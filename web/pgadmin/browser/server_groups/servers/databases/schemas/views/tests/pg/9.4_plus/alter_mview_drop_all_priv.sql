-- View: public.testmview_$%{}[]()&*^!/@`#

-- DROP MATERIALIZED VIEW IF EXISTS public."testmview_$%{}[]()&*^!/@`#";

CREATE MATERIALIZED VIEW IF NOT EXISTS public."testmview_$%{}[]()&*^!/@`#"
TABLESPACE pg_default
AS
 SELECT 1
WITH NO DATA;

ALTER TABLE IF EXISTS public."testmview_$%{}[]()&*^!/@`#"
    OWNER TO postgres;

COMMENT ON MATERIALIZED VIEW public."testmview_$%{}[]()&*^!/@`#"
    IS 'comment1';

GRANT ALL ON TABLE public."testmview_$%{}[]()&*^!/@`#" TO postgres;
