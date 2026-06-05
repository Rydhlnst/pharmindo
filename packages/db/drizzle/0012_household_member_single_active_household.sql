delete from household_members hm
where hm.id in (
  select id
  from (
    select
      hm.id,
      row_number() over (
        partition by hm.citizen_id
        order by
          case when hm.relationship = 'HEAD_OF_FAMILY' then 0 else 1 end,
          hm.created_at asc,
          hm.id asc
      ) as row_num
    from household_members hm
  ) ranked
  where ranked.row_num > 1
);

drop index if exists "household_members_citizen_id_idx";
create unique index "household_members_citizen_id_uq" on "household_members" using btree ("citizen_id");
