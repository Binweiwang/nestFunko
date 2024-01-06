DROP TABLE IF EXISTS "Funkos";
DROP SEQUENCE IF EXISTS "Funkos_id_seq";
CREATE SEQUENCE "Funkos_id_seq" INCREMENT 1 MINVALUE 1 MAXVALUE 999999999 CACHE 3;

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