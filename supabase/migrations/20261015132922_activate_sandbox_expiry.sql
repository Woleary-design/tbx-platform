-- Enable only after sandbox-expiry rollback tests have passed.
select cron.alter_job(jobid, active := true) from cron.job where jobname='expire-tbx-sandbox-reservations';
