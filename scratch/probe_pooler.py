import psycopg2

regions = ['sa-east-1', 'us-east-1', 'us-west-1', 'us-east-2', 'eu-west-1', 'eu-central-1']
project_ref = 'kdsdcjsqdlieeojsfjin'
password = 'concode2026'

for reg in regions:
    host = f'aws-0-{reg}.pooler.supabase.com'
    user = f'postgres.{project_ref}'
    print(f"Trying region {reg} ({host})...")
    try:
        conn = psycopg2.connect(
            host=host,
            port=5432,
            database='postgres',
            user=user,
            password=password,
            connect_timeout=4
        )
        print(f"SUCCESS! Connected to Supabase in region {reg}!")
        cur = conn.cursor()
        cur.execute("SELECT current_database(), current_user;")
        print("DB Info:", cur.fetchone())
        conn.close()
        break
    except Exception as e:
        print(f"  Failed on {reg}: {e}")
