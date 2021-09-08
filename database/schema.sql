DROP TABLE IF EXISTS relatedFeatures;
DROP TABLE IF EXISTS relatedStaging;
DROP TABLE IF EXISTS relatedFinal;
DROP TABLE IF EXISTS featuresStaging;
DROP TABLE IF EXISTS featuresFinal;
/* create, copy, and transform related data to meet final schema */

CREATE TABLE relatedStaging (
  id SERIAL,
  current_product_id INT NOT NULL,
  related_product_id INT NOT NULL
);

COPY relatedStaging
FROM '/Users/willcasey/Desktop/SDC/relatedProducts/data/related.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE relatedFinal (
  current_product_id INT NOT NULL,
  related_ids VARCHAR NOT NULL
);

INSERT INTO relatedFinal (current_product_id, related_ids)
SELECT
current_product_id,
STRING_AGG(related_product_id::character varying, ',') AS related_ids
FROM
(SELECT
DISTINCT related_product_id,
current_product_id
FROM
relatedStaging ORDER BY current_product_id) as distinctValues
GROUP BY
current_product_id
ORDER BY
current_product_id;

/* create, copy, and transform features data to meet final schema */

CREATE TABLE featuresStaging (
  id SERIAL,
  product_id INT NOT NULL,
  feature VARCHAR(60) NOT NULL,
  value VARCHAR(60) NOT NULL
);

COPY featuresStaging
FROM '/Users/willcasey/Desktop/SDC/relatedProducts/data/features.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE featuresFinal (
  product_id INT NOT NULL,
  features VARCHAR(256) NOT NULL,
  values VARCHAR(256) NOT NULL
);

INSERT INTO featuresFinal (product_id, features, values)
SELECT
product_id,
STRING_AGG(feature::character varying, ',' order by product_id) AS features,
STRING_AGG(value::character varying, ',' order by product_id) AS values
FROM
featuresStaging
GROUP BY
product_id
ORDER BY
product_id;


/* create, copy, and transform final data to meet final schema */


CREATE TABLE relatedFeatures (
  product_id INT NOT NULL,
  related_ids VARCHAR,
  features VARCHAR,
  values VARCHAR
);

INSERT INTO relatedFeatures (product_id, related_ids, features, values)
SELECT
product_id,
related_ids,
features,
values
FROM
(Select * from featuresFinal inner join relatedFinal on (product_id = current_product_id)) as final
ORDER BY
product_id;




DROP TABLE relatedStaging;
DROP TABLE relatedFinal;
DROP TABLE featuresStaging;
DROP TABLE featuresFinal;
