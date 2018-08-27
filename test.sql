<delete_reservation>:
reservation_number | INT 11
/*DELIMITER $$
CREATE DEFINER=F17336Gteam7@localhost PROCEDURE delete_reservation(IN reservation_number INT(11))
BEGIN
DECLARE seg0 INT(11);
DECLARE seg1 INT(11);
DECLARE pTRIPDATE DATE;
DECLARE pTRAINID INT(11);
DECLARE placeholder INT(11);
SELECT trip_train_id, trip_date, trip_seg_start, trip_seg_ends INTO pTRAINID, pTRIPDATE, seg0, seg1 FROM trips WHERE reservation_id = reservation_number;
DELETE FROM trips WHERE reservation_id = reservation_number;
if seg1> seg0
THEN
	UPDATE seats_free SET freeseat = freeseat + 1 WHERE train_id = pTRAINID and seat_free_date = pTRIPDATE and segment_id between seg0 and seg1;
ELSE
	UPDATE seats_free SET freeseat = freeseat + 1 where (train_id = pTRAINID and seat_free_date = pTRIPDATE and segment_id between seg1 and seg0);
end if;
DELETE FROM reservations WHERE reservation_id = reservation_number;
END$$
DELIMITER ;*/

<get_avail_trains>:
trip_date   | DATE  /*2017-11-13*/
trip_start  | VARCHAR 4 /*1*/
trip_end    | VARCHAR 4 /*2*/
time_of_day | CHAR 3 /*'06:25:00'*/ 
day_of_week | CHAR 1 
train_avail | TINYINT [OUT]
/*DELIMITER $$
CREATE DEFINER=F17336Gteam7@localhost PROCEDURE get_avail_trains(IN trip_date DATE, IN trip_start VARCHAR(4), IN trip_end VARCHAR(4), IN time_of_day CHAR(3), IN 'day_of_week' CHAR(1), OUT train_avail TINYINT)
find_trains:
BEGIN
	declare trip_direction tinyint; 
	declare seg0 int;
	declare seg1 int;
	declare tod_start_time time;
	declare tod_end_time time;
	declare trip_start_id int;
	declare trip_end_id int;
	declare ptrain_id int;
	declare place_holder int;
	set trip_start_id = (trip_start);
 	set trip_end_id = (trip_end);
	if trip_start_id < trip_end_id 
	then 
		set trip_direction=0; 
		set seg0 = (select segment_id from segments where seg_n_end=trip_start_id);
		set seg1 = (select segment_id from segments where seg_s_end=trip_end_id);
	else 
		set trip_direction=1
		set seg0 = (select segment_id from segments where seg_s_end=trip_start_id);
		set seg1 = (select segment_id from segments where seg_n_end=trip_end_id);
	end if;
	if time_of_day = 'MOR' THEN
		set tod_start_time='06:00';
		set tod_end_time='12:00';
	elseif time_of_day = 'AFT' THEN
		set tod_start_time='12:00';
		set tod_end_time='18:00';
	elseif time_of_day = 'EVE' THEN
		set tod_start_time='18:00';
		set tod_end_time='00:00';
	else
		set tod_start_time='00:00';
		set tod_end_time='06:00';
	end if;
	if seg1 > seg0
	then
		select DISTINCT x.train_id, y.time_out as "Time of Day", x.seat_free_date as "Trip Date", x.freeseat as "Seats Availiable" from seats_free x inner join 
		stops_at y on x.train_id = y.train_id inner join trains z on z.train_id = x.train_id 
		where (x.seat_free_date = trip_date AND x.segment_id between seg0 and seg1) and 
		(y.time_out between tod_start_time and tod_end_time) and z.train_direction = trip_direction and x.freeseat > 0 ORDER BY x.train_id ASC;
	else
		select DISTINCT x.train_id, y.time_out as "Time of Day", x.seat_free_date as "Trip Date", x.freeseat as "Seats Availiable" from seats_free x inner join 
		stops_at y on x.train_id = y.train_id inner join trains z on z.train_id = x.train_id 
		where (x.seat_free_date = trip_date AND x.segment_id between seg1 and seg0) and 
		(y.time_out between tod_start_time and tod_end_time) and z.train_direction = trip_direction and x.freeseat > 0 ORDER BY x.train_id ASC;
	end if;
 END$$
DELIMITER ;*/

<make_reservation>:
trip_date          | DATE
trip_train         | INT 11
seg0               | INT 11
seg1               | INT 11
passenger_id       | INT 11
card_number        | VARCHAR 16
billing_address    | VARCHAR 100
reservation_number | INT 11
/*DELIMITER $$
CREATE PROCEDURE make_reservation(IN trip_date DATE, IN trip_train_id INT(11), IN seg0 INT(11), IN seg1 INT(11), IN passenger_id INT(11), IN card_number VARCHAR(16), IN billing_address VARCHAR(100), OUT reservation_number INT(11))
BEGIN
DECLARE reservation_number INT(11);
UPDATE seats_free SET freeseat = freeseat - 1 where (train_id = trip_train_id and seat_free_date = trip_date and freeseat > 0 and segment_id between seg0 and seg1);
INSERT INTO reservations (reservation_date, paying_passenger_id, card_number, billing_address) VALUES(NOW(), passenger_id, card_number, billing_address);
SET reservation_number = (select reservation_id from reservations order by reservation_id DESC limit 1);
SELECT reservation_number;
END$$
DELIMITER ;*/

DELIMITER $$
CREATE PROCEDURE make_trains_late()
BEGIN
DECLARE rand_train_id INT(11); 
DECLARE rand_station_id INT(11); 
DECLARE ptime_in TIME;
DECLARE ptime_out TIME;
DECLARE ptime_diff TIME;
DECLARE prand_interval TIME;
DECLARE base_time TIME;
SET rand_train_id = FLOOR(RAND()*28);
SET rand_station_id = FLOOR(RAND()*25);
SET base_time = (SELECT DATE_ADD(DATE_ADD(timeout, INTERVAL 15*RAND() MINUTE), INTERVAL 90*RAND() SECOND) FROM stops_at where train_id = rand_train_id and station_id = rand_station_id);
SET prand_interval = (SELECT TIME_DIFF(prand_interval, time_out) FROM stops_at where train_id = rand_train_id and station_id = rand_station_id);
label1: WHILE rand_station_id <= 24 DO
SELECT time_out INTO ptime_out from stops_at where train_id = rand_train_id and station_id = rand_station_id;
SELECT time_in  INTO ptime_in from stops_at where train_id = rand_train_id and station_id = rand_station_id+1;
SET ptime_diff = TIMEDIFF(ptime_out, ptime_in);
SET  rand_station_id = rand_station_id + 1;
END WHILE label1;
END$$
DELIMITER ;