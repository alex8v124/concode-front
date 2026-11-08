import psycopg2

conn = psycopg2.connect(
    host='aws-0-us-east-1.pooler.supabase.com',
    port=5432,
    database='postgres',
    user='postgres.kdsdcjsqdlieeojsfjin',
    password='concode2026',
    connect_timeout=10
)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
tables = [r[0] for r in cur.fetchall()]
print(f"Total tables in public schema: {len(tables)}")
for t in tables:
    print(f" - {t}")

cur.execute("SELECT routine_name FROM information_schema.routines WHERE routine_schema='public' ORDER BY routine_name;")
routines = [r[0] for r in cur.fetchall()]
print(f"\nTotal routines/functions in public schema: {len(routines)}")
for r in routines:
    print(f" - {r}")

conn.close()
