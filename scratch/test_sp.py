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

try:
    print("Testing sp_tramite_iniciar directly...")
    cur.execute("SELECT sp_tramite_iniciar('ALTA', '72407570', 'Juan Alexander', 'Miranda', 'Quispe', '2001-08-22'::date, 'M', 'ESCANEO')::text;")
    res = cur.fetchone()
    print("Result:", res)
except Exception as e:
    print("ERROR calling sp_tramite_iniciar:")
    print(e)

conn.close()
