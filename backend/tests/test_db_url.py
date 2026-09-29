from sqlalchemy import create_engine

from app.config import Settings


def test_render_postgres_scheme_is_normalized():
    s = Settings(_env_file=None, database_url="postgres://u:p@host:5432/db")
    assert s.database_url == "postgresql+psycopg://u:p@host:5432/db"
    create_engine(s.database_url)


def test_bare_postgresql_scheme_pins_psycopg_driver():
    s = Settings(_env_file=None, database_url="postgresql://u:p@host:5432/db")
    assert s.database_url == "postgresql+psycopg://u:p@host:5432/db"


def test_qualified_url_is_unchanged():
    url = "postgresql+psycopg://pp:pp@localhost:5432/pp"
    assert Settings(_env_file=None, database_url=url).database_url == url
