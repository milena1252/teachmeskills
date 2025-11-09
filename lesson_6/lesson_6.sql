create table if not exists users (
	id bigserial primary key,
	first_name text not null,
	last_name text not null,
	date_of_birth date not null,
	is_active boolean not null default true
	);

insert into users (first_name, last_name, date_of_birth, is_active) values
('Elena', 'Mironova', '1995-10-13', true),
('Egor', 'Sergeev', '1993-05-18', false),
('Karina', 'Levina', '2000-01-29', true),
('Ivan', 'Kovalev', '1992-09-15', true),
('Marina', 'Frolova', '1990-02-05', false);

select * 
from users 
where is_active=true
order by last_name asc;




