-- POLICY: test_delete_rls_policy_$%{}[]()&*^!@"'`\/#

-- DROP POLICY IF EXISTS "test_delete_rls_policy_$%{}[]()&*^!@""'`\/#" ON public.test_rls_policy;

CREATE POLICY "test_delete_rls_policy_$%{}[]()&*^!@""'`\/#"
    ON public.test_rls_policy
    FOR DELETE
    TO public
    USING ((salary < '1000000000000'::bigint));
