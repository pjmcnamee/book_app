DROP TABLE IF EXISTS books;

CREATE TABLE books(
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn TEXT,
image_url TEXT,
description TEXT,
bookshelf TEXT
);

