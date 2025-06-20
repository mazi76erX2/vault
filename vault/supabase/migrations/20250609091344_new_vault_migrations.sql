create sequence "public"."migration_history_id_seq";

create table "public"."migration_history" (
    "id" integer not null default nextval('migration_history_id_seq'::regclass),
    "version" character varying(50) not null,
    "description" text,
    "applied_at" timestamp without time zone default now(),
    "execution_time_ms" integer,
    "checksum" character varying(64)
);


alter sequence "public"."migration_history_id_seq" owned by "public"."migration_history"."id";

CREATE INDEX idx_migration_history_version ON public.migration_history USING btree (version);

CREATE UNIQUE INDEX migration_history_pkey ON public.migration_history USING btree (id);

CREATE UNIQUE INDEX migration_history_version_key ON public.migration_history USING btree (version);

alter table "public"."migration_history" add constraint "migration_history_pkey" PRIMARY KEY using index "migration_history_pkey";

alter table "public"."migration_history" add constraint "migration_history_version_key" UNIQUE using index "migration_history_version_key";

grant delete on table "public"."migration_history" to "anon";

grant insert on table "public"."migration_history" to "anon";

grant references on table "public"."migration_history" to "anon";

grant select on table "public"."migration_history" to "anon";

grant trigger on table "public"."migration_history" to "anon";

grant truncate on table "public"."migration_history" to "anon";

grant update on table "public"."migration_history" to "anon";

grant delete on table "public"."migration_history" to "authenticated";

grant insert on table "public"."migration_history" to "authenticated";

grant references on table "public"."migration_history" to "authenticated";

grant select on table "public"."migration_history" to "authenticated";

grant trigger on table "public"."migration_history" to "authenticated";

grant truncate on table "public"."migration_history" to "authenticated";

grant update on table "public"."migration_history" to "authenticated";

grant delete on table "public"."migration_history" to "service_role";

grant insert on table "public"."migration_history" to "service_role";

grant references on table "public"."migration_history" to "service_role";

grant select on table "public"."migration_history" to "service_role";

grant trigger on table "public"."migration_history" to "service_role";

grant truncate on table "public"."migration_history" to "service_role";

grant update on table "public"."migration_history" to "service_role";


