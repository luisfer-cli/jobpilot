use tauri_plugin_sql::{Migration, MigrationKind};

pub const DB_URL: &str = "sqlite:jobpilot.db";

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    full_name TEXT NOT NULL DEFAULT '',
    job_title TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    linkedin TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE work_experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    current INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT NOT NULL DEFAULT '',
    degree TEXT NOT NULL DEFAULT '',
    field TEXT NOT NULL DEFAULT '',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT ''
);

CREATE TABLE skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT ''
);

CREATE TABLE languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    level TEXT NOT NULL DEFAULT ''
);

CREATE TABLE certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    issuer TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL DEFAULT ''
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    link TEXT NOT NULL DEFAULT ''
);

CREATE TABLE job_offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    raw_text TEXT NOT NULL DEFAULT '',
    structured TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'guardada',
    salary TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE generated_cvs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_offer_id INTEGER NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    structured TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE cover_letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_offer_id INTEGER NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE technical_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_offer_id INTEGER NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO settings (key, value) VALUES ('openrouter_api_key', '');
INSERT INTO settings (key, value) VALUES ('model', 'openai/gpt-4o-mini');
INSERT INTO settings (key, value) VALUES ('theme', 'light');

INSERT INTO profile (id) VALUES (1);
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "technical_tests_standalone",
            sql: r#"
CREATE TABLE technical_tests_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_offer_id INTEGER REFERENCES job_offers(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO technical_tests_new (id, job_offer_id, title, content, created_at)
    SELECT id, job_offer_id, '', content, created_at FROM technical_tests;

DROP TABLE technical_tests;
ALTER TABLE technical_tests_new RENAME TO technical_tests;
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "job_offers_ats_analysis",
            sql: "ALTER TABLE job_offers ADD COLUMN ats_analysis TEXT NOT NULL DEFAULT '';",
            kind: MigrationKind::Up,
        },
    ]
}
