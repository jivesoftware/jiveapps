--
-- Name: jiveinstances; Type: TABLE; Schema: public;
--
DROP TABLE IF EXISTS jiveinstances;
CREATE TABLE jiveinstances (
    instanceid character varying(50) PRIMARY KEY
);

--
-- Name: linkedcontent; Type: TABLE; Schema: public;
--
DROP TABLE IF EXISTS linkedcontent;
CREATE TABLE linkedcontent (
    prop_id varchar (50) UNIQUE,
    content_id character varying(10),
    content_type text,
    content_link text,
    content_title text,
    jiveinstanceid character varying(50) REFERENCES jiveinstances NOT NULL
);

--
-- Name: proptypes; Type: TABLE; Schema: public;
--
DROP TABLE IF EXISTS proptypes;
CREATE TABLE proptypes (
    id integer PRIMARY KEY,
    title text NOT NULL,
    definition text NOT NULL,
    level integer NOT NULL,
    jiveinstanceid character varying(50) REFERENCES jiveinstances NOT NULL,
    image bytea,
    image_url text
);

--
-- Name: props; Type: TABLE; Schema: public;
--
DROP TABLE IF EXISTS props;
CREATE TABLE props (
    id character varying(50) PRIMARY KEY,
    user_id integer NOT NULL,
    giver_id integer NOT NULL,
    prop_type integer REFERENCES proptypes NOT NULL,
    message text NOT NULL,
    stream_entry_url text,
    orig_id character varying(50),
    jiveinstanceid character varying(50) REFERENCES jiveinstances NOT NULL,
    created_at timestamp without time zone NOT NULL,
    content_id character varying(10)
);