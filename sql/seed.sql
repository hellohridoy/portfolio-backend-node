INSERT INTO users (id, name, title, summary, hero_title, hero_subtitle, hero_description, phone, email, location, avatar_url)
VALUES
  ('ridoy', 'Ridoy Hossain', 'Software Engineer',
   'Software engineer focused on backend systems, scalable APIs, and clean user experiences.',
   'A Senior Software Engineer',
   'With High Skills',
   'I build secure backend services, scalable APIs, and performant web applications for modern teams.',
   '(+880) 1714 000 000', 'ridoy@example.com', 'Dhaka, Bangladesh',
   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (user_id, name, level, category) VALUES
  ('ridoy', 'Java', 92, 'Backend'),
  ('ridoy', 'Spring Boot', 90, 'Backend'),
  ('ridoy', 'Angular', 88, 'Frontend'),
  ('ridoy', 'PostgreSQL', 86, 'Database'),
  ('ridoy', 'Docker', 80, 'DevOps')
ON CONFLICT DO NOTHING;

INSERT INTO programming (user_id, name, level) VALUES
  ('ridoy', 'Java', 92),
  ('ridoy', 'TypeScript', 88),
  ('ridoy', 'SQL', 86)
ON CONFLICT DO NOTHING;

INSERT INTO projects (user_id, title, description, image_url, live_url, repo_url, category) VALUES
  ('ridoy', 'Multi-Tenant SaaS Dashboard', 'Scalable analytics dashboard with RBAC and audit logging.',
   'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=1200&auto=format&fit=crop',
   'https://example.com/demo', 'https://github.com/example/repo', 'SaaS'),
  ('ridoy', 'Fintech Payment Orchestrator', 'Event-driven payment orchestration with retries and idempotency.',
   'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&auto=format&fit=crop',
   NULL, 'https://github.com/example/fintech', 'Fintech'),
  ('ridoy', 'Developer Portfolio Platform', 'Single-page portfolio with dynamic content and admin tools.',
   'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop',
   NULL, NULL, 'Web App')
ON CONFLICT DO NOTHING;

INSERT INTO social_links (user_id, platform, url) VALUES
  ('ridoy', 'GitHub', 'https://github.com/ridoy'),
  ('ridoy', 'LinkedIn', 'https://linkedin.com/in/ridoy'),
  ('ridoy', 'Email', 'mailto:ridoy@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO certificates (user_id, title, issuer, type, date_earned, credential_id, verify_url) VALUES
  ('ridoy', 'AWS Certified Developer', 'AWS', 'primary', '2024-06-01', 'AWS-DEV-2024-001', 'https://aws.amazon.com/certification/'),
  ('ridoy', 'Oracle Java SE 17 Developer', 'Oracle', 'secondary', '2023-09-15', 'OCP17-2023-110', 'https://education.oracle.com/')
ON CONFLICT DO NOTHING;

INSERT INTO education (user_id, degree_type, institution, subject, year_start, year_end) VALUES
  ('ridoy', 'bsc', 'State University', 'Computer Science', 2017, 2021),
  ('ridoy', 'msc', 'Tech University', 'Software Engineering', 2022, 2024)
ON CONFLICT DO NOTHING;

INSERT INTO cv_files (user_id, file_name) VALUES
  ('ridoy', 'cv_latest.pdf')
ON CONFLICT DO NOTHING;
