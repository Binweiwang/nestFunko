DROP TABLE IF EXISTS "Funkos";
DROP SEQUENCE IF EXISTS "Funkos_id_seq";
CREATE SEQUENCE "Funkos_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 999999999 START 4 CACHE 1;

CREATE TABLE "public"."Funkos" (
                                   "id" integer DEFAULT nextval('"Funkos_id_seq"') NOT NULL,
                                   "nombre" character varying(255) NOT NULL,
                                   "cantidad" integer NOT NULL,
                                   "imagen" character varying DEFAULT 'https://via.placeholder.com/150' NOT NULL,
                                   "created_at" timestamp DEFAULT now() NOT NULL,
                                   "updated_at" timestamp DEFAULT now() NOT NULL,
                                   "is_active" boolean DEFAULT false NOT NULL,
                                   "categoria_id" uuid,
                                   "precio" double precision DEFAULT '0' NOT NULL,
                                   CONSTRAINT "PK_2c0da146ea4b290a7c901299aab" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "Funkos" ("id", "nombre", "cantidad", "imagen", "created_at", "updated_at", "is_active", "categoria_id", "precio") VALUES
                                                                                                                                   (1,	'funko1',	10,	'https://via.placeholder.com/150',	'2023-12-20 17:15:17.734907',	'2023-12-20 17:15:17.734907',	't',	'66b45cd7-1b12-406e-b085-c92b160a4aa4',	1),
                                                                                                                                   (2,	'funko2',	10,	'https://via.placeholder.com/150',	'2023-12-20 17:22:53.231691',	'2023-12-20 17:22:53.231691',	't',	'f3e90ea0-0f2c-4690-91f2-f7b27d10fed7',	10),
                                                                                                                                   (3,	'funko3',	3,	'https://via.placeholder.com/150',	'2023-12-20 17:23:25.797605',	'2023-12-20 17:23:25.797605',	't',	'ee2ca126-30cb-4741-903f-47c1d2c3cc06',	10);

DROP TABLE IF EXISTS "categorias";
CREATE TABLE "public"."categorias" (
                                       "id" uuid NOT NULL,
                                       "nombre" character varying(255) NOT NULL,
                                       "created_at" timestamp DEFAULT now() NOT NULL,
                                       "updated_at" timestamp DEFAULT now() NOT NULL,
                                       "is_deleted" boolean DEFAULT false NOT NULL,
                                       CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"),
                                       CONSTRAINT "UQ_ccdf6cd1a34ea90a7233325063d" UNIQUE ("nombre")
) WITH (oids = false);

INSERT INTO "categorias" ("id", "nombre", "created_at", "updated_at", "is_deleted") VALUES
                                                                                        ('66b45cd7-1b12-406e-b085-c92b160a4aa4',	'DISNEY',	'2023-12-20 17:36:18.648444',	'2023-12-20 17:36:18.648444',	'f'),
                                                                                        ('f3e90ea0-0f2c-4690-91f2-f7b27d10fed7',	'SERIE',	'2023-12-20 17:36:21.607354',	'2023-12-20 17:36:21.607354',	'f'),
                                                                                        ('7502f91f-96fc-4cba-aeb2-d9987d711dfc',	'SUPERHEROES',	'2023-12-20 17:36:20.876955',	'2023-12-20 17:36:20.876955',	'f'),
                                                                                        ('29d1d34f-94c6-40f8-8c43-6dd17d21daac',	'PELICULA',	'2023-12-20 17:36:20.116954',	'2023-12-20 17:36:20.116954',	'f'),
                                                                                        ('ee2ca126-30cb-4741-903f-47c1d2c3cc06',	'OTROS',	'2023-12-20 17:36:19.416815',	'2023-12-20 17:36:19.416815',	'f');
DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;
CREATE SEQUENCE user_roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 6 CACHE 1;

CREATE TABLE "public"."user_roles" (
                                       "user_id" bigint,
                                       "role" character varying(50) DEFAULT 'USER' NOT NULL,
                                       "id" integer DEFAULT nextval('user_roles_id_seq') NOT NULL,
                                       CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "user_roles" ("user_id", "role", "id") VALUES
                                                       (1,	'USER',	1),
                                                       (1,	'ADMIN',	2),
                                                       (2,	'USER',	3),
                                                       (3,	'USER',	4),
                                                       (4,	'USER',	5);

DROP TABLE IF EXISTS "usuarios";
DROP SEQUENCE IF EXISTS usuarios_id_seq;
CREATE SEQUENCE usuarios_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 5 CACHE 1;

CREATE TABLE "public"."usuarios" (
                                     "is_deleted" boolean DEFAULT false NOT NULL,
                                     "created_at" timestamp DEFAULT now() NOT NULL,
                                     "id" bigint DEFAULT nextval('usuarios_id_seq') NOT NULL,
                                     "updated_at" timestamp DEFAULT now() NOT NULL,
                                     "apellidos" character varying(255) NOT NULL,
                                     "email" character varying(255) NOT NULL,
                                     "nombre" character varying(255) NOT NULL,
                                     "password" character varying(255) NOT NULL,
                                     "username" character varying(255) NOT NULL,
                                     CONSTRAINT "usuarios_email_key" UNIQUE ("email"),
                                     CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id"),
                                     CONSTRAINT "usuarios_username_key" UNIQUE ("username")
) WITH (oids = false);

INSERT INTO "usuarios" ("is_deleted", "created_at", "id", "updated_at", "apellidos", "email", "nombre", "password", "username") VALUES
                                                                                                                                    ('f',	'2023-11-02 11:43:24.724871',	1,	'2023-11-02 11:43:24.724871',	'Admin Admin',	'admin@prueba.net',	'Admin',	'$2a$10$vPaqZvZkz6jhb7U7k/V/v.5vprfNdOnh4sxi/qpPRkYTzPmFlI9p2',	'admin'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.730431',	2,	'2023-11-02 11:43:24.730431',	'User User',	'user@prueba.net',	'User',	'$2a$12$RUq2ScW1Kiizu5K4gKoK4OTz80.DWaruhdyfi2lZCB.KeuXTBh0S.',	'user'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.733552',	3,	'2023-11-02 11:43:24.733552',	'Test Test',	'test@prueba.net',	'Test',	'$2a$10$Pd1yyq2NowcsDf4Cpf/ZXObYFkcycswqHAqBndE1wWJvYwRxlb.Pu',	'test'),
                                                                                                                                    ('f',	'2023-11-02 11:43:24.736674',	4,	'2023-11-02 11:43:24.736674',	'Otro Otro',	'otro@prueba.net',	'otro',	'$2a$12$3Q4.UZbvBMBEvIwwjGEjae/zrIr6S50NusUlBcCNmBd2382eyU0bS',	'otro');

ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES usuarios(id) NOT DEFERRABLE;