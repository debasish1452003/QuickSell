-- NexusDAG relational schema.
-- Use this as the database contract when replacing the local JSON store.

create table users (
  id varchar(64) primary key,
  name varchar(160) not null,
  email varchar(220) not null unique,
  role varchar(32) not null check (role in ('employer', 'employee', 'client')),
  title varchar(160) not null,
  created_at timestamp not null default current_timestamp
);

create table projects (
  id varchar(64) primary key,
  name varchar(220) not null,
  client varchar(220) not null,
  client_user_id varchar(64) not null references users(id),
  health varchar(32) not null check (health in ('on_track', 'risk', 'blocked')),
  budget_used integer not null default 0 check (budget_used between 0 and 100),
  release_date date not null,
  created_at timestamp not null default current_timestamp
);

create table project_members (
  project_id varchar(64) not null references projects(id) on delete cascade,
  user_id varchar(64) not null references users(id) on delete cascade,
  responsibility varchar(120) not null default 'delivery',
  primary key (project_id, user_id)
);

create table workflow_tasks (
  id varchar(64) primary key,
  project_id varchar(64) not null references projects(id) on delete cascade,
  owner_id varchar(64) references users(id),
  title varchar(240) not null,
  description text not null default '',
  status varchar(32) not null check (status in ('backlog', 'ready', 'in_progress', 'blocked', 'review', 'done')),
  review_status varchar(32) not null check (review_status in ('not_submitted', 'submitted', 'approved', 'changes_requested')),
  priority integer not null default 3,
  duration_hours integer not null default 1,
  client_visible boolean not null default true,
  planned_start timestamp,
  planned_end timestamp,
  actual_start timestamp,
  actual_end timestamp,
  due_date timestamp,
  delay_reason text not null default '',
  position_x numeric(12, 3) not null default 0,
  position_y numeric(12, 3) not null default 0,
  position_z numeric(12, 3) not null default 0,
  updated_at timestamp not null default current_timestamp
);

create table task_dependencies (
  from_task_id varchar(64) not null references workflow_tasks(id) on delete cascade,
  to_task_id varchar(64) not null references workflow_tasks(id) on delete cascade,
  lag_hours integer not null default 0,
  kind varchar(32) not null check (kind in ('finish_to_start', 'review_gate', 'release_gate')),
  primary key (from_task_id, to_task_id)
);

create table task_submissions (
  id varchar(64) primary key,
  task_id varchar(64) not null references workflow_tasks(id) on delete cascade,
  project_id varchar(64) not null references projects(id) on delete cascade,
  employee_id varchar(64) not null references users(id),
  submitted_at timestamp not null default current_timestamp,
  status varchar(32) not null check (status in ('submitted', 'approved', 'changes_requested')),
  notes text not null default ''
);

create table project_milestones (
  id varchar(64) primary key,
  project_id varchar(64) not null references projects(id) on delete cascade,
  title varchar(220) not null,
  due_date date not null,
  status varchar(32) not null check (status in ('upcoming', 'complete', 'late'))
);

create table work_progress (
  id varchar(64) primary key,
  project_id varchar(64) not null references projects(id) on delete cascade,
  owner_id varchar(64) references users(id),
  phase varchar(160) not null,
  percent_complete integer not null default 0 check (percent_complete between 0 and 100),
  blocker_count integer not null default 0,
  last_updated_at timestamp not null default current_timestamp,
  notes text not null default ''
);

create index idx_workflow_tasks_project_status on workflow_tasks(project_id, status);
create index idx_workflow_tasks_owner_due on workflow_tasks(owner_id, due_date);
create index idx_task_submissions_project_status on task_submissions(project_id, status);
