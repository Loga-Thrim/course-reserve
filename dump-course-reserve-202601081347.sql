--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 17.4

-- Started on 2026-01-08 13:47:57 +07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 16635)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3561 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 17002)
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id integer,
    user_type character varying(20) NOT NULL,
    user_name character varying(255),
    user_email character varying(255),
    action character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id integer,
    resource_name character varying(500),
    details jsonb,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    faculty character varying(255),
    program character varying(255)
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17001)
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- TOC entry 3563 (class 0 OID 0)
-- Dependencies: 231
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- TOC entry 215 (class 1259 OID 16657)
-- Name: course_books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_books (
    id integer NOT NULL,
    course_id integer,
    book_id character varying(50) NOT NULL,
    title character varying(500) NOT NULL,
    author character varying(255),
    publisher character varying(255),
    callnumber character varying(100),
    isbn character varying(50),
    bookcover character varying(500),
    added_by character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.course_books OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16663)
-- Name: course_books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_books_id_seq OWNER TO postgres;

--
-- TOC entry 3564 (class 0 OID 0)
-- Dependencies: 216
-- Name: course_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_books_id_seq OWNED BY public.course_books.id;


--
-- TOC entry 230 (class 1259 OID 16897)
-- Name: course_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_files (
    id integer NOT NULL,
    course_id integer,
    filename character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(50) NOT NULL,
    file_size integer,
    file_path character varying(500) NOT NULL,
    uploaded_by character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.course_files OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16896)
-- Name: course_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_files_id_seq OWNER TO postgres;

--
-- TOC entry 3565 (class 0 OID 0)
-- Dependencies: 229
-- Name: course_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_files_id_seq OWNED BY public.course_files.id;


--
-- TOC entry 217 (class 1259 OID 16664)
-- Name: course_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_instructors (
    id integer NOT NULL,
    course_id integer,
    instructor_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.course_instructors OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16668)
-- Name: course_instructors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_instructors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_instructors_id_seq OWNER TO postgres;

--
-- TOC entry 3566 (class 0 OID 0)
-- Dependencies: 218
-- Name: course_instructors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_instructors_id_seq OWNED BY public.course_instructors.id;


--
-- TOC entry 219 (class 1259 OID 16669)
-- Name: course_recommended_books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_recommended_books (
    id integer NOT NULL,
    course_id integer,
    book_id character varying(100) NOT NULL,
    title character varying(500) NOT NULL,
    author character varying(255),
    publisher character varying(255),
    callnumber character varying(255),
    isbn character varying(50),
    bookcover character varying(500),
    mattype_name character varying(255),
    lang character varying(50),
    keyword_source character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    admin_recommended boolean DEFAULT false,
    added_by character varying(50),
    cat_date timestamp without time zone
);


ALTER TABLE public.course_recommended_books OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16675)
-- Name: course_recommended_books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.course_recommended_books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_recommended_books_id_seq OWNER TO postgres;

--
-- TOC entry 3567 (class 0 OID 0)
-- Dependencies: 220
-- Name: course_recommended_books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.course_recommended_books_id_seq OWNED BY public.course_recommended_books.id;


--
-- TOC entry 221 (class 1259 OID 16686)
-- Name: curriculums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curriculums (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    faculty_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    level character varying(255)
);


ALTER TABLE public.curriculums OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16692)
-- Name: curriculums_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curriculums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.curriculums_id_seq OWNER TO postgres;

--
-- TOC entry 3568 (class 0 OID 0)
-- Dependencies: 222
-- Name: curriculums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curriculums_id_seq OWNED BY public.curriculums.id;


--
-- TOC entry 223 (class 1259 OID 16693)
-- Name: faculties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculties (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faculties OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16697)
-- Name: faculties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.faculties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faculties_id_seq OWNER TO postgres;

--
-- TOC entry 3569 (class 0 OID 0)
-- Dependencies: 224
-- Name: faculties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.faculties_id_seq OWNED BY public.faculties.id;


--
-- TOC entry 225 (class 1259 OID 16698)
-- Name: professor_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professor_courses (
    id integer NOT NULL,
    professor_id character varying(50),
    name_th character varying(255) NOT NULL,
    name_en character varying(255),
    code_th character varying(50) NOT NULL,
    code_en character varying(50),
    description_th text NOT NULL,
    description_en text,
    website character varying(500),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    keywords text[] DEFAULT '{}'::text[],
    faculty_id integer,
    curriculum_id integer
);


ALTER TABLE public.professor_courses OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16705)
-- Name: professor_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professor_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professor_courses_id_seq OWNER TO postgres;

--
-- TOC entry 3570 (class 0 OID 0)
-- Dependencies: 226
-- Name: professor_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professor_courses_id_seq OWNED BY public.professor_courses.id;


--
-- TOC entry 234 (class 1259 OID 24578)
-- Name: student_courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_courses (
    id integer NOT NULL,
    student_id character varying(50) NOT NULL,
    student_name character varying(255),
    student_email character varying(255),
    course_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_courses OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24577)
-- Name: student_courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_courses_id_seq OWNER TO postgres;

--
-- TOC entry 3571 (class 0 OID 0)
-- Dependencies: 233
-- Name: student_courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_courses_id_seq OWNED BY public.student_courses.id;


--
-- TOC entry 227 (class 1259 OID 16711)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    faculty character varying(255),
    role character varying(50) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16718)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3572 (class 0 OID 0)
-- Dependencies: 228
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3332 (class 2604 OID 17005)
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- TOC entry 3312 (class 2604 OID 16722)
-- Name: course_books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_books ALTER COLUMN id SET DEFAULT nextval('public.course_books_id_seq'::regclass);


--
-- TOC entry 3330 (class 2604 OID 16900)
-- Name: course_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_files ALTER COLUMN id SET DEFAULT nextval('public.course_files_id_seq'::regclass);


--
-- TOC entry 3314 (class 2604 OID 16723)
-- Name: course_instructors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors ALTER COLUMN id SET DEFAULT nextval('public.course_instructors_id_seq'::regclass);


--
-- TOC entry 3316 (class 2604 OID 16724)
-- Name: course_recommended_books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_recommended_books ALTER COLUMN id SET DEFAULT nextval('public.course_recommended_books_id_seq'::regclass);


--
-- TOC entry 3319 (class 2604 OID 16727)
-- Name: curriculums id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums ALTER COLUMN id SET DEFAULT nextval('public.curriculums_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 16728)
-- Name: faculties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties ALTER COLUMN id SET DEFAULT nextval('public.faculties_id_seq'::regclass);


--
-- TOC entry 3323 (class 2604 OID 16729)
-- Name: professor_courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professor_courses ALTER COLUMN id SET DEFAULT nextval('public.professor_courses_id_seq'::regclass);


--
-- TOC entry 3334 (class 2604 OID 24581)
-- Name: student_courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses ALTER COLUMN id SET DEFAULT nextval('public.student_courses_id_seq'::regclass);


--
-- TOC entry 3327 (class 2604 OID 16731)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3553 (class 0 OID 17002)
-- Dependencies: 232
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, user_id, user_type, user_name, user_email, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, created_at, faculty, program) FROM stdin;
1	43326	student	ปิยังกรู อินทร์ทับ	6512231026	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 02:27:24.495872	\N	\N
2	4	professor	โลก้า ทริม	\N	create	course	26	test123 - test123	{"keywords": [], "instructors": ["ปิยังกรู อินทร์ทับ"]}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 02:47:38.699478	\N	\N
3	43326	student	ปิยังกรู อินทร์ทับ	6512231026	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 02:55:44.608876	คณะวิทยาศาสตร์และเทคโนโลยี	วิทยาการคอมพิวเตอร์
4	61958	professor	CourseReserv Online	256800001	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:07:19.058528	\N	\N
5	61958	professor	CourseReserv Online	256800001	create	book	18	Cyberpsychology and New Media : a thematic reader / edited by Andrew Power and Grâinne Kirwan.	{"bookId": "b00014366", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:07:26.636107	\N	\N
6	61958	professor	CourseReserv Online	256800001	create	book	19	Cryptography and network security : principles and practices / William Stallings.	{"bookId": "b00051145", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:07:27.592994	\N	\N
7	61958	professor	CourseReserv Online	256800001	create	book	20	Data infrastructure management : insights and strategies / Greg Schulz.	{"bookId": "b00074801", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:07:28.405178	\N	\N
8	61958	professor	CourseReserv Online	256800001	create	book	21	E-Learning ecologies : principles for new learning andassessment / edited by Bill Cope and Mary Kalantzis	{"bookId": "b00029755", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:07:29.939363	\N	\N
9	61958	professor	CourseReserv Online	256800001	create	book	22	Cryptography and network security : principles and practices / William Stallings.	{"bookId": "b00046406", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:08:32.643762	\N	\N
10	61958	professor	CourseReserv Online	256800001	create	book	23	E-Learning ecologies : principles for new learning andassessment / edited by Bill Cope and Mary Kalantzis	{"bookId": "b00028973", "courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:08:33.453292	\N	\N
11	61958	professor	CourseReserv Online	256800001	delete	book	22	Cryptography and network security : principles and practices / William Stallings.	{"courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:13:06.650376	\N	\N
12	61958	professor	CourseReserv Online	256800001	delete	book	21	E-Learning ecologies : principles for new learning andassessment / edited by Bill Cope and Mary Kalantzis	{"courseId": "3", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-18 03:13:08.706552	\N	\N
13	61958	professor	CourseReserv Online	256800001	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 02:52:23.40816	\N	\N
14	61958	professor	CourseReserv Online	256800001	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 02:59:00.638741	\N	\N
15	43326	student	ปิยังกรู อินทร์ทับ	6512231026	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-25 02:59:25.170885	คณะวิทยาศาสตร์และเทคโนโลยี	วิทยาการคอมพิวเตอร์
16	43326	student	ปิยังกรู อินทร์ทับ	6512231026	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 04:32:26.792256	คณะวิทยาศาสตร์และเทคโนโลยี	วิทยาการคอมพิวเตอร์
17	43326	student	ปิยังกรู อินทร์ทับ	6512231026	login	auth	\N	\N	{"method": "password"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 04:51:56.802585	คณะวิทยาศาสตร์และเทคโนโลยี	วิทยาการคอมพิวเตอร์
18	4	professor	โลก้า ทริม	\N	create	course	27	วท.คพ.161 - การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์	{"keywords": ["security", "cyber"], "instructors": ["ปิยังกรู อินทร์ทับ"]}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:45:24.729637	\N	\N
19	4	professor	โลก้า ทริม	\N	create	course	28	วท.คพ.161 - การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์	{"keywords": ["cyber", "security"], "instructors": ["ปิยังกรู อินทร์ทับ", "โลก้า ทริม"]}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:46:35.210656	\N	\N
20	4	professor	โลก้า ทริม	\N	create	book	24	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	{"bookId": "b00084966", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:52:42.9981	\N	\N
21	4	professor	โลก้า ทริม	\N	delete	book	24	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:52:47.691454	\N	\N
22	4	professor	โลก้า ทริม	\N	create	book	25	Introduction to machine learning with applications in information security / Mark Stamp.	{"bookId": "b00082354", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:59:09.062572	\N	\N
23	4	professor	โลก้า ทริม	\N	create	book	26	Teaching cybersecurity : a handbook for teaching the cybersecurity body of knowledge in a conventional classroom / Daniel Shoemaker, Ken Sigler andTamara Shoemaker.	{"bookId": "b00082357", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:59:10.117699	\N	\N
24	4	professor	โลก้า ทริม	\N	create	book	27	ระบบไซเบอร์กายภาพและการประยุกต์ หน่วยที่ 1-8 = Cyber-Physical system and applications : เอกสารการสอนชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00084090", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:59:11.336328	\N	\N
25	4	professor	โลก้า ทริม	\N	create	book	28	Management of information security / Michael E. Whitman, Herbert J. Mattord.	{"bookId": "b00084963", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:59:18.519321	\N	\N
26	4	professor	โลก้า ทริม	\N	create	book	29	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	{"bookId": "b00084966", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 06:59:19.689591	\N	\N
27	4	professor	โลก้า ทริม	\N	create	book	30	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 8-15 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00084138", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-06 07:09:21.053873	\N	\N
28	1	professor	อภินันท์ ชาติจันทึก	\N	delete	course	27	วท.คพ.161 - การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์	{}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 02:55:14.314635	\N	\N
29	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	30	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 8-15 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.385873	\N	\N
30	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	29	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.397622	\N	\N
31	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	28	Management of information security / Michael E. Whitman, Herbert J. Mattord.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.405087	\N	\N
32	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	27	ระบบไซเบอร์กายภาพและการประยุกต์ หน่วยที่ 1-8 = Cyber-Physical system and applications : เอกสารการสอนชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.413107	\N	\N
33	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	26	Teaching cybersecurity : a handbook for teaching the cybersecurity body of knowledge in a conventional classroom / Daniel Shoemaker, Ken Sigler andTamara Shoemaker.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.423758	\N	\N
34	1	professor	อภินันท์ ชาติจันทึก	\N	delete	book	25	Introduction to machine learning with applications in information security / Mark Stamp.	{"courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:25.431209	\N	\N
35	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	31	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 8-15 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00084138", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.232125	\N	\N
36	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	32	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 1-7 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00084137", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.239674	\N	\N
37	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	33	นโยบายความมั่นคงและความสัมพันธ์ระหว่างประเทศ / ทิพย์วรรณ จักรเพ็ชร.	{"bookId": "b00080598", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.245168	\N	\N
38	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	34	Food Security in times of COVID-19 วิถีเกษตรฟื้นความมั่นคงทางอาหารในวิกฤติโควิด / ศิริกร โพธิจักร.	{"bookId": "j00027885", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.250743	\N	\N
39	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	35	ยามหล่อบอกต่อว่ารัก Security Love / HIDEKO_SUNSHINE	{"bookId": "b00026273", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.256372	\N	\N
40	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	36	คู่มือเรียนและใช้งาน Network Security Lab ฉบับใช้งานจริง / จักรชัย โสอินทร์ และคณะ	{"bookId": "b00026590", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.262677	\N	\N
41	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	37	ความมั่นคงของระบบสารสนเทศ = Information system security / พลอยพรรณ สอนสุวิทย์	{"bookId": "b00034660", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.268014	\N	\N
42	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	38	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	{"bookId": "b00019061", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.274476	\N	\N
55	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	51	Manual on livestock health and production for national food security : the book describes various challenges faced in food security sector and how to tackle it from Animal Husbandry outlook / Sunil Nayak, Hari R., Shahaji Phand.	{"bookId": "b00079516", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.35563	\N	\N
43	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	39	คู่มือ Cyber security สำหรับประชาชน : คู่มือแนวทางปฏิบัติการรักษาความปลอดภัยบนโลกไซเบอร์ภาคประชาชน / สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ	{"bookId": "b00028927", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.280775	\N	\N
44	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	40	ความมั่นคงอาเซียน = ASEAN security / พรเทพ จันทรนิก.	{"bookId": "b00015545", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.286796	\N	\N
45	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	41	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 9-15 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00072760", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.292139	\N	\N
46	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	42	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 1-8 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	{"bookId": "b00072761", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.298014	\N	\N
47	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	43	ความมั่นคงปลอดภัยของสารสนเทศและการจัดการ = Information security and management / พนิดา พานิชกุล.	{"bookId": "b00050215", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.307766	\N	\N
48	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	44	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	{"bookId": "b00056980", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.313489	\N	\N
49	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	45	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	{"bookId": "b00041199", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.318683	\N	\N
50	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	46	กลยุทธ์ในการจัดการกับสวัสดิภาพและความปลอดภัยในโรงเรียน = Practical school security / เคนเนธ ทรัมพ์ ; แปลและเรียบเรียงโดย ประศักดิ์ หอมสนิท .	{"bookId": "b00021043", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.325316	\N	\N
51	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	47	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	{"bookId": "b00084966", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.331569	\N	\N
52	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	48	Teaching cybersecurity : a handbook for teaching the cybersecurity body of knowledge in a conventional classroom / Daniel Shoemaker, Ken Sigler andTamara Shoemaker.	{"bookId": "b00082357", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.337735	\N	\N
53	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	49	Introduction to machine learning with applications in information security / Mark Stamp.	{"bookId": "b00082354", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.343112	\N	\N
54	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	50	Big Data, IoT, and machine learning : tools and applications / edited by Rashmi Agrawal, Marcin Paprzycki, Neha Gupta.	{"bookId": "b00079163", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.34958	\N	\N
56	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	52	Biodiversity, food and nutrition : a nwe agenda for sustainable food systems / edited by Danny Hunter, Teresa Borelli and Eliot Gee.	{"bookId": "b00076769", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.362528	\N	\N
57	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	53	Management of information security / Michael E. Whitman, Herbert J. Mattord.	{"bookId": "b00084963", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.371586	\N	\N
58	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	54	Intelligence and state surveillance in modern societies : an international perspective / by Frederic Lemieux.	{"bookId": "b00074783", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.381331	\N	\N
59	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	55	System forensics, investigation, and response / Chuck Easttom.	{"bookId": "b00078403", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.390769	\N	\N
60	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	56	Blockchain for distributed systems security / edited by Sachin S. Shetty, Charles A. Kamhoua, Laurent L. Njilla.	{"bookId": "b00073704", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.399405	\N	\N
61	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	57	Global supply chain security and management : appraising programs, preventing crimes / Darren J. Prokop	{"bookId": "b00038466", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.407051	\N	\N
62	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	58	Emerging capital markets and transition in contemporary China / Ken Morita	{"bookId": "b00037630", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.41696	\N	\N
63	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	59	Industrial network security : securing critical infrastructure networks for Smart Grid,SCADA, and other industrial control systems / Eric Knapp, Joel Thomas Langill.	{"bookId": "b00015372", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.439851	\N	\N
64	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	60	Protecting transportation : implementing security policies and programs / R. William Johnstone.	{"bookId": "b00029141", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.450876	\N	\N
65	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	61	Computer and information security handbook / edited by John R. Vacca	{"bookId": "b00014122", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.457363	\N	\N
66	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	62	Financial statement analysis and security valuation / Stephen H. Penman .	{"bookId": "b00014720", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.46402	\N	\N
67	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	63	Discrete dynamical systems and chaotic machines : theory and applications / Jacques M. Bahi, Christophe Guyeux.	{"bookId": "b00074086", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.471855	\N	\N
68	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	64	Hospitality security : managing security in today's hotel, lodging, entertainment, and tourism environment / Darrell Clifton.	{"bookId": "b00058160", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.4789	\N	\N
69	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	65	Sustainable livestock management for poverty alleviationand food security / Katrien E. van	{"bookId": "b00014303", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.486237	\N	\N
70	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	66	Safety and security review for the process industries : application of HAZOP, PHA and What-If reviews / DennisP. Nolan	{"bookId": "b00031409", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.492169	\N	\N
71	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	67	Cloud computing : SaaS, PaaS, IaaS, virtualization, business models, mobile, security, and more / Kris Jamsa.	{"bookId": "b00059885", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.499789	\N	\N
72	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	68	Global Energy Assessment (GEA) / editors, Thomas B. Johansson, Anand Patwardhan, Nebojsa Nakicenovic, Gomez-Echeverri.	{"bookId": "b00058359", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.50613	\N	\N
73	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	69	The Routledge handbook of security studies / edited by Myriam Dunn Cavelty and Victor Mauer	{"bookId": "b00049972", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.512159	\N	\N
74	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	70	Computer security : principles and Practice / Willam Stallings, Lawrie Brown with contributions by Mick Bauer and Michael Howard.	{"bookId": "b00044991", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.518839	\N	\N
75	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	71	Secure computer and network systems : modeling, analysis and design / Nong Ye .	{"bookId": "b00048102", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.527605	\N	\N
76	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	72	Citrix access security for IT administrators : citrix product development team.	{"bookId": "b00057521", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.53559	\N	\N
77	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	73	Network security essentials : applications and standards / William Stallings.	{"bookId": "b00046407", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.543126	\N	\N
78	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	74	Lawrence Pfleeger .	{"bookId": "b00046101", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.55097	\N	\N
79	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	75	Information assurance for the enterprise : a roadmap to information security / Corey Schou, Dan Shoemaker.	{"bookId": "b00057451", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.560078	\N	\N
80	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	76	Financial statement analysis and security valuation / Stephen H. Penman .	{"bookId": "b00051262", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.568914	\N	\N
81	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	77	Managing soil for food security and environmental quality / Premjit Sharma, editor.	{"bookId": "b00046424", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.575135	\N	\N
82	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	78	Innovative cryptography / Nick Moldovyan, Alex Moldovyan.	{"bookId": "b00051175", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.582045	\N	\N
83	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	79	Cryptography and network security : principles and practices / William Stallings.	{"bookId": "b00046406", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.58775	\N	\N
84	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	80	Hacking exposed : Network security secrets & solutions / Stuart Mcclure, Joel Scambray, George Kurtz.	{"bookId": "b00012003", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.594147	\N	\N
85	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	81	Guide to operating systems security / Michael Palmer.	{"bookId": "b00011837", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.599988	\N	\N
86	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	82	Business and security : public-private sector relationships in a new security environment / edited by Alyson J. K. Bailes, Isabel Frommelt.	{"bookId": "b00027699", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.661329	\N	\N
87	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	83	Defeating terrorism : shaping the new security environment / Russell D. Howard, Reid L. Sawyer.	{"bookId": "b00057529", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.717596	\N	\N
88	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	84	Cryptography and network security : principles and practices / William Stallings.	{"bookId": "b00051145", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.741122	\N	\N
89	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	85	Hacking exposed : Windows server 2003 / Joel Scambray, Stuart McClure .	{"bookId": "b00051158", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.750442	\N	\N
90	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	86	IIS security / Marty Jost and Michael Cobb.	{"bookId": "b00051161", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.758848	\N	\N
91	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	87	Hack attack denied : a complete guide to network lockdown / John Chirillo.	{"bookId": "b00008412", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.765151	\N	\N
92	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	88	Auditiong and security : As/400, NT, UNIT networks, and disaster recovery plans / Yusufali F. Musaji.	{"bookId": "b00071834", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.770358	\N	\N
93	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	89	International relations and world politics : security, economy, identity / Paul R. Viotti, Mark V. Kauppi.	{"bookId": "b00051109", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.778126	\N	\N
94	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	90	Viruses revealed / David Harley, Robert Slade, Urs Gattiker.	{"bookId": "b00012720", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.783292	\N	\N
95	1	professor	อภินันท์ ชาติจันทึก	\N	create	book	91	Ensuring health and income security for an aging workforce / Peter P. Budetti...[et. al], editors.	{"bookId": "b00004820", "courseId": "28", "courseName": "การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์"}	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-08 03:00:35.789434	\N	\N
\.


--
-- TOC entry 3536 (class 0 OID 16657)
-- Dependencies: 215
-- Data for Name: course_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_books (id, course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, added_by, created_at) FROM stdin;
31	28	b00084138	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 8-15 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. บัณฑิตศึกษา สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.8 ม192ร 2566	9786161630089	https://imagsopac.psru.ac.th/bookcover/84138/84138-fc-t.gif	\N	2026-01-08 03:00:35.227595
32	28	b00084137	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 1-7 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. บัณฑิตศึกษา สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.8 ม192ร 2566	9786161630287	https://imagsopac.psru.ac.th/bookcover/84137/84137-fc-t.gif	\N	2026-01-08 03:00:35.237887
33	28	b00080598	นโยบายความมั่นคงและความสัมพันธ์ระหว่างประเทศ / ทิพย์วรรณ จักรเพ็ชร.	ทิพย์วรรณ จักรเพ็ชร.	กรุงเทพฯ : เปเปอร์เน็ต, 2565.	327 ท366น 2565		https://imagsopac.psru.ac.th/bookcover/80598/80598-fc-t.gif	\N	2026-01-08 03:00:35.243982
34	28	j00027885	Food Security in times of COVID-19 วิถีเกษตรฟื้นความมั่นคงทางอาหารในวิกฤติโควิด / ศิริกร โพธิจักร.	ศิริกร โพธิจักร.	2563.			https://imagsopac.psru.ac.th/bookcover/68612/68612h000000141323-fc-a.jpg	\N	2026-01-08 03:00:35.24985
35	28	b00026273	ยามหล่อบอกต่อว่ารัก Security Love / HIDEKO_SUNSHINE	ฮิเดโกะ ซันซาย	กรุงเทพฯ : แจ่มใส, 2560	น ฮ354ย	9786160619108 :	https://imagsopac.psru.ac.th/bookcover/26273/26273-fc-t.gif	\N	2026-01-08 03:00:35.255357
36	28	b00026590	คู่มือเรียนและใช้งาน Network Security Lab ฉบับใช้งานจริง / จักรชัย โสอินทร์ และคณะ	\N	นนทบุรี : ไอดีซี, 2560	004.6 ค416	9786162006869 :	https://imagsopac.psru.ac.th/bookcover/26590/26590-fc-t.gif	\N	2026-01-08 03:00:35.261527
37	28	b00034660	ความมั่นคงของระบบสารสนเทศ = Information system security / พลอยพรรณ สอนสุวิทย์	พลอยพรรณ สอนสุวิทย์	กำแพงเพชร : คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏกำแพงเพชร, 2560	658.4038 พ179ค		https://imagsopac.psru.ac.th/bookcover/34660/34660-fc-t.gif	\N	2026-01-08 03:00:35.267122
38	28	b00019061	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2558.	005.8 จ144ม 2558	9786162006043 :	https://imagsopac.psru.ac.th/bookcover/19061/19061-fc-t.gif	\N	2026-01-08 03:00:35.273615
39	28	b00028927	คู่มือ Cyber security สำหรับประชาชน : คู่มือแนวทางปฏิบัติการรักษาความปลอดภัยบนโลกไซเบอร์ภาคประชาชน / สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ	\N	กรุงเทพฯ : สำนัก, 2558.	004.678 ค416	9786162045301	https://imagsopac.psru.ac.th/bookcover/28927/28927-fc-t.gif	\N	2026-01-08 03:00:35.279314
40	28	b00015545	ความมั่นคงอาเซียน = ASEAN security / พรเทพ จันทรนิก.	พรเทพ จันทรนิก.	กรุงเทพฯ : เอ.เอส. เทคนิคการพิมพ์, 2557.	นต 341.2473 พ175ค 2557	9786163742292 :	https://imagsopac.psru.ac.th/bookcover/15545/15545-fc-t.gif	\N	2026-01-08 03:00:35.285662
41	28	b00072760	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 9-15 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี	นนทบุรี : สำนักพิมพ์มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2557.	658 ม192ก 2557	9786161606268	https://imagsopac.psru.ac.th/bookcover/72760/72760-fc-t.gif	\N	2026-01-08 03:00:35.291298
42	28	b00072761	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 1-8 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี	นนทบุรี : สำนักพิมพ์มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2557.	658 ม192ก 2557	9786161605919	https://imagsopac.psru.ac.th/bookcover/72761/72761-fc-t.gif	\N	2026-01-08 03:00:35.297078
66	28	b00031409	Safety and security review for the process industries : application of HAZOP, PHA and What-If reviews / DennisP. Nolan	Nolan, Dennis P	Waltham, MA : Elsevier, c2012	660.2804 N787S	9781437735185	https://imagsopac.psru.ac.th/bookcover/31409/31409-fc-t.gif	\N	2026-01-08 03:00:35.491328
43	28	b00050215	ความมั่นคงปลอดภัยของสารสนเทศและการจัดการ = Information security and management / พนิดา พานิชกุล.	พนิดา พานิชกุล.	กรุงเทพฯ : เคทีพี, 2553.	005.8 พ153ค	9786167396002 :	https://imagsopac.psru.ac.th/bookcover/50215/50215-fc-t.gif	\N	2026-01-08 03:00:35.304343
44	28	b00056980	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2553.	005.8 จ144ม	9786162001062 :	https://imagsopac.psru.ac.th/bookcover/56980/56980-fc-t.gif	\N	2026-01-08 03:00:35.31254
45	28	b00041199	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2550.	005.8 จ144ม 2550	9789749660737 :	https://imagsopac.psru.ac.th/bookcover/41199/41199-fc-t.gif	\N	2026-01-08 03:00:35.317929
46	28	b00021043	กลยุทธ์ในการจัดการกับสวัสดิภาพและความปลอดภัยในโรงเรียน = Practical school security / เคนเนธ ทรัมพ์ ; แปลและเรียบเรียงโดย ประศักดิ์ หอมสนิท .	ทรัมพ์, เคนเนธ.	กรุงเทพฯ : เอ็กซเปอร์เน็ท, 2546.	363.119371 ท1711ก	974911373X :	https://imagsopac.psru.ac.th/bookcover/21043/21043-fc-t.gif	\N	2026-01-08 03:00:35.32398
47	28	b00084966	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	Mangrulkar, Ramchandra Sharad.	\N	005.824 M277B 2024	9781484299746	https://imagsopac.psru.ac.th/bookcover/84966/84966-fc-t.gif	\N	2026-01-08 03:00:35.330605
48	28	b00082357	Teaching cybersecurity : a handbook for teaching the cybersecurity body of knowledge in a conventional classroom / Daniel Shoemaker, Ken Sigler andTamara Shoemaker.	Shoemaker, Daniel.	Boca Raton : CPC Press, Taylor & Francis Group , 2023.	005.8071 S559T 2023	9781032034089	https://imagsopac.psru.ac.th/bookcover/82357/82357-fc-t.gif	\N	2026-01-08 03:00:35.3363
49	28	b00082354	Introduction to machine learning with applications in information security / Mark Stamp.	Stamp, Mark.	Boca Raton : CPC Press, Taylor & Francis Group , 2023.	004.6 S783I 2023	9781032204925	https://imagsopac.psru.ac.th/bookcover/82354/82354-fc-t.gif	\N	2026-01-08 03:00:35.342271
50	28	b00079163	Big Data, IoT, and machine learning : tools and applications / edited by Rashmi Agrawal, Marcin Paprzycki, Neha Gupta.	\N	Boca Raton ; CRC Press, c2021.	005.7 B592B 2021	9780367336745	https://imagsopac.psru.ac.th/bookcover/79163/79163-fc-t.gif	\N	2026-01-08 03:00:35.347762
51	28	b00079516	Manual on livestock health and production for national food security : the book describes various challenges faced in food security sector and how to tackle it from Animal Husbandry outlook / Sunil Nayak, Hari R., Shahaji Phand.	Nayak, Sunil.	Mauritius : LAP LAMBERT Academic Publishing, 2020.	338.19 N331M 2020	9786202669757	https://imagsopac.psru.ac.th/bookcover/79516/79516-fc-t.gif	\N	2026-01-08 03:00:35.354663
52	28	b00076769	Biodiversity, food and nutrition : a nwe agenda for sustainable food systems / edited by Danny Hunter, Teresa Borelli and Eliot Gee.	\N	Abingdon, Oxon : Routledge , 2020.	631.58 B615 2020	9780367141516	https://imagsopac.psru.ac.th/bookcover/76769/76769-fc-t.gif	\N	2026-01-08 03:00:35.361014
53	28	b00084963	Management of information security / Michael E. Whitman, Herbert J. Mattord.	Whitman, Michael E.	Singapore : Cengage Learing Asia, c2019.	005.8 W615M 2018	9789814834735	https://imagsopac.psru.ac.th/bookcover/84963/84963-fc-t.gif	\N	2026-01-08 03:00:35.370556
54	28	b00074783	Intelligence and state surveillance in modern societies : an international perspective / by Frederic Lemieux.	Lemieux, Frederic.	Bingley, UK: Emerald, c2019.	364.4 L554I 2019		https://imagsopac.psru.ac.th/bookcover/74783/74783-fc-t.gif	\N	2026-01-08 03:00:35.378205
55	28	b00078403	System forensics, investigation, and response / Chuck Easttom.	Easttom, Chuck.	Burlington, MA : Jones & Bartlett Learning, 2019.	W 624 E13S 2019	9781284121841	https://imagsopac.psru.ac.th/bookcover/78403/78403-fc-t.gif	\N	2026-01-08 03:00:35.389186
56	28	b00073704	Blockchain for distributed systems security / edited by Sachin S. Shetty, Charles A. Kamhoua, Laurent L. Njilla.	\N	Hoboken, New Jersey : Wiley-IEEE, c2019.	005.74 B651 2019	9781119519607	https://imagsopac.psru.ac.th/bookcover/73704/73704-fc-t.gif	\N	2026-01-08 03:00:35.398003
57	28	b00038466	Global supply chain security and management : appraising programs, preventing crimes / Darren J. Prokop	Prokop, Darren	United Kingdom : Butterworth-Heinemann, 2017	658.5 P962G	9780128007488	https://imagsopac.psru.ac.th/bookcover/38466/38466-fc-t.gif	\N	2026-01-08 03:00:35.405722
58	28	b00037630	Emerging capital markets and transition in contemporary China / Ken Morita	Morita, Ken	New Jersey : World Scientific, 2017.	332.04150951 M862E	9789813147898	https://imagsopac.psru.ac.th/bookcover/37630/37630-fc-t.gif	\N	2026-01-08 03:00:35.415278
59	28	b00015372	Industrial network security : securing critical infrastructure networks for Smart Grid,SCADA, and other industrial control systems / Eric Knapp, Joel Thomas Langill.	Knapp, Eric	Amsterdam: Elsevier, 2015.	670.42 K16I	9780124201149	https://imagsopac.psru.ac.th/bookcover/15372/15372-fc-t.gif	\N	2026-01-08 03:00:35.434123
60	28	b00029141	Protecting transportation : implementing security policies and programs / R. William Johnstone.	Johnstone, R. william.	Waltham, MA : Butterworth-Heinemann, 2015.	380 J72P	9780124081017	https://imagsopac.psru.ac.th/bookcover/29141/29141-fc-t.gif	\N	2026-01-08 03:00:35.449728
61	28	b00014122	Computer and information security handbook / edited by John R. Vacca	\N	Waltham : Elsevier, c2013	005.8 C736	9780123943972	https://imagsopac.psru.ac.th/bookcover/14122/14122-fc-t.gif	\N	2026-01-08 03:00:35.456316
62	28	b00014720	Financial statement analysis and security valuation / Stephen H. Penman .	Penman, Stephen H.	Boston : McGraw-Hill Irwin, c2013.	332.632042 P397F	9780071326407	https://imagsopac.psru.ac.th/bookcover/14720/14720-fc-t.gif	\N	2026-01-08 03:00:35.463093
63	28	b00074086	Discrete dynamical systems and chaotic machines : theory and applications / Jacques M. Bahi, Christophe Guyeux.	Bahi, Jacques Mohcine.	Boca Raton, FL : CRC Press, c2013.	005.8 B151D 2013	9781466554504	https://imagsopac.psru.ac.th/bookcover/74086/74086-fc-t.gif	\N	2026-01-08 03:00:35.470855
64	28	b00058160	Hospitality security : managing security in today's hotel, lodging, entertainment, and tourism environment / Darrell Clifton.	Clifton, Darrell.	Boca Raton, FL : CRC Press, c2012.	647.94068 C639H		https://imagsopac.psru.ac.th/bookcover/58160/58160-fc-t.gif	\N	2026-01-08 03:00:35.477655
65	28	b00014303	Sustainable livestock management for poverty alleviationand food security / Katrien E. van	Hooft, Katrien van ́t,	Cambridge, MA : CABI, c2012	338.162 H778S	9781845938277	https://imagsopac.psru.ac.th/bookcover/14303/14303-fc-t.gif	\N	2026-01-08 03:00:35.485258
67	28	b00059885	Cloud computing : SaaS, PaaS, IaaS, virtualization, business models, mobile, security, and more / Kris Jamsa.	Jamsa, Kris.	Burlington, MA : Jones & Bartlett Learning, 2013.	004.6782 J27C	9781449647391	https://imagsopac.psru.ac.th/bookcover/59885/59885-fc-t.gif	\N	2026-01-08 03:00:35.497483
68	28	b00058359	Global Energy Assessment (GEA) / editors, Thomas B. Johansson, Anand Patwardhan, Nebojsa Nakicenovic, Gomez-Echeverri.	\N	Cambridge : Cambridge University Press, 2012.	333.79 G562	9780521182935 :	https://imagsopac.psru.ac.th/bookcover/58359/58359-fc-t.gif	\N	2026-01-08 03:00:35.505121
69	28	b00049972	The Routledge handbook of security studies / edited by Myriam Dunn Cavelty and Victor Mauer	\N	New York : Routledge, 2010.	355 R852	9780415422789 :	https://imagsopac.psru.ac.th/bookcover/49972/49972-fc-t.gif	\N	2026-01-08 03:00:35.510802
70	28	b00044991	Computer security : principles and Practice / Willam Stallings, Lawrie Brown with contributions by Mick Bauer and Michael Howard.	Stallings, William.	Upper Saddle River, NJ : Prentice Hall, 2008.	005.8 S775C	9780135137116	https://imagsopac.psru.ac.th/bookcover/44991/44991-fc-t.gif	\N	2026-01-08 03:00:35.517685
71	28	b00048102	Secure computer and network systems : modeling, analysis and design / Nong Ye .	Ye, Nong.	Chichester, England ; Hoboken, NJ : J. Wiley & Sons, c2008.	005.8 Y37S	9780470023242	https://imagsopac.psru.ac.th/bookcover/48102/48102-fc-t.gif	\N	2026-01-08 03:00:35.525421
72	28	b00057521	Citrix access security for IT administrators : citrix product development team.	\N	New York : McGraw-Hil, 2007.	005.8 C581	9780071485432	https://imagsopac.psru.ac.th/bookcover/57521/57521-fc-t.gif	\N	2026-01-08 03:00:35.534511
73	28	b00046407	Network security essentials : applications and standards / William Stallings.	Stallings, William.	Upper Saddle River, NJ : Pearson Prentice Hall, 2007.	005.8 S775N	0132303787	https://imagsopac.psru.ac.th/bookcover/46407/46407-fc-t.gif	\N	2026-01-08 03:00:35.541965
74	28	b00046101	Lawrence Pfleeger .	Pfleeger, Charles P.	Upper Saddle River, NJ : Prentice Hall, c2007	005.8 P531S	0136012965	https://imagsopac.psru.ac.th/bookcover/46101/46101-fc-t.gif	\N	2026-01-08 03:00:35.549505
75	28	b00057451	Information assurance for the enterprise : a roadmap to information security / Corey Schou, Dan Shoemaker.	Schou, Corey.	Boston : McGraw-Hill Irwin, 2007.	005.8 S277I	9780072255249	https://imagsopac.psru.ac.th/bookcover/57451/57451-fc-t.gif	\N	2026-01-08 03:00:35.558686
76	28	b00051262	Financial statement analysis and security valuation / Stephen H. Penman .	Penman, Stephen H.	Boston : McGraw-Hill Irwin, c2007.	332.632042 P397F	0071254323	https://imagsopac.psru.ac.th/bookcover/51262/51262-fc-t.gif	\N	2026-01-08 03:00:35.567818
77	28	b00046424	Managing soil for food security and environmental quality / Premjit Sharma, editor.	\N	New Delhi : Gene - tech books, 2007.	631.4 M266	9788189729240	https://imagsopac.psru.ac.th/bookcover/46424/46424-fc-t.gif	\N	2026-01-08 03:00:35.574073
78	28	b00051175	Innovative cryptography / Nick Moldovyan, Alex Moldovyan.	Moldovyan, Nick .	Boston : Charles River Media, c2007	005.82 M717I	1584504676	https://imagsopac.psru.ac.th/bookcover/51175/51175-fc-t.gif	\N	2026-01-08 03:00:35.581018
79	28	b00046406	Cryptography and network security : principles and practices / William Stallings.	Stallings, William.	Upper Saddle River, N.J. : Pearson/Prentice Hall, 2006.	005.8 S782C	9780132023221	https://imagsopac.psru.ac.th/bookcover/46406/46406-fc-t.gif	\N	2026-01-08 03:00:35.586682
80	28	b00012003	Hacking exposed : Network security secrets & solutions / Stuart Mcclure, Joel Scambray, George Kurtz.	Mcclure, Stuart.	New York : McGraw-Hill, 2005.	005.8 M487H	0072260815 :	https://imagsopac.psru.ac.th/bookcover/12003/12003-fc-t.gif	\N	2026-01-08 03:00:35.592543
81	28	b00011837	Guide to operating systems security / Michael Palmer.	Palmer, Michael.	Boston : Thomson, 2004.	005.8 P175G	0619160403 :	https://imagsopac.psru.ac.th/bookcover/11837/11837-fc-t.gif	\N	2026-01-08 03:00:35.599101
82	28	b00027699	Business and security : public-private sector relationships in a new security environment / edited by Alyson J. K. Bailes, Isabel Frommelt.	\N	Solna, Sweden : SIPRI, 2004.	338.88 B978	0199274509	https://imagsopac.psru.ac.th/bookcover/27699/27699-fc-t.gif	\N	2026-01-08 03:00:35.631719
83	28	b00057529	Defeating terrorism : shaping the new security environment / Russell D. Howard, Reid L. Sawyer.	Howard, Russell D.	New York : The McGraw-Hill Companies, 2004.	363.320973 H848D	0072873027	https://imagsopac.psru.ac.th/bookcover/57529/57529-fc-t.gif	\N	2026-01-08 03:00:35.716288
84	28	b00051145	Cryptography and network security : principles and practices / William Stallings.	Stallings, William.	Upper Saddle River, NJ : Prentice Hall, c2003	005.8 S782C	0131115022	https://imagsopac.psru.ac.th/bookcover/51145/51145-fc-t.gif	\N	2026-01-08 03:00:35.733316
85	28	b00051158	Hacking exposed : Windows server 2003 / Joel Scambray, Stuart McClure .	Scambray, Joel.	New York : McGraw-Hill/Osborne, c2003.	005.8 S283H	0072230614	https://imagsopac.psru.ac.th/bookcover/51158/51158-fc-t.gif	\N	2026-01-08 03:00:35.749498
86	28	b00051161	IIS security / Marty Jost and Michael Cobb.	Jost, Marty.	New York : McGraw-Hill/Osborne, c2002.	005.8 J83I	0072224398	https://imagsopac.psru.ac.th/bookcover/51161/51161-fc-t.gif	\N	2026-01-08 03:00:35.757816
87	28	b00008412	Hack attack denied : a complete guide to network lockdown / John Chirillo.	Chirillo, John.	New York : John Wiley & Sons, 2001.	005.8 C541H	0471416258	https://imagsopac.psru.ac.th/bookcover/8412/8412-fc-t.gif	\N	2026-01-08 03:00:35.76443
88	28	b00071834	Auditiong and security : As/400, NT, UNIT networks, and disaster recovery plans / Yusufali F. Musaji.	Musaji, Yusufali F.	New York : John Wiley & Sons, 2001.	005.8 M985A 2001	0471383716 :	https://imagsopac.psru.ac.th/bookcover/71834/71834-fc-t.gif	\N	2026-01-08 03:00:35.769076
89	28	b00051109	International relations and world politics : security, economy, identity / Paul R. Viotti, Mark V. Kauppi.	Viotti, Paul R .	Upper Saddle River, NJ : Prentice Hall, c2001.	327 V799I	0130172774	https://imagsopac.psru.ac.th/bookcover/51109/51109-fc-t.gif	\N	2026-01-08 03:00:35.777252
90	28	b00012720	Viruses revealed / David Harley, Robert Slade, Urs Gattiker.	Harley, David.	Berkeley, Calif : Osborn/McGraw-Hill, 2001.	005.84 H285V	0072130903	https://imagsopac.psru.ac.th/bookcover/12720/12720-fc-t.gif	\N	2026-01-08 03:00:35.782605
91	28	b00004820	Ensuring health and income security for an aging workforce / Peter P. Budetti...[et. al], editors.	\N	Kalamazoo, Michigan : W.E. Upjohn Institute for Employment / Research, 2001.	331.394 E59	0880992204	https://imagsopac.psru.ac.th/bookcover/4820/4820-fc-t.gif	\N	2026-01-08 03:00:35.788731
\.


--
-- TOC entry 3551 (class 0 OID 16897)
-- Dependencies: 230
-- Data for Name: course_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_files (id, course_id, filename, original_name, file_type, file_size, file_path, uploaded_by, created_at) FROM stdin;
\.


--
-- TOC entry 3538 (class 0 OID 16664)
-- Dependencies: 217
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_instructors (id, course_id, instructor_name, created_at) FROM stdin;
66	28	ปิยังกรู อินทร์ทับ	2026-01-06 06:46:35.179503
67	28	โลก้า ทริม	2026-01-06 06:46:35.179503
\.


--
-- TOC entry 3540 (class 0 OID 16669)
-- Dependencies: 219
-- Data for Name: course_recommended_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_recommended_books (id, course_id, book_id, title, author, publisher, callnumber, isbn, bookcover, mattype_name, lang, keyword_source, created_at, admin_recommended, added_by, cat_date) FROM stdin;
28630	28	b00084138	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 8-15 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. บัณฑิตศึกษา สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.8 ม192ร 2566	9786161630089	https://imagsopac.psru.ac.th/bookcover/84138/84138-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.586582	f	\N	2025-06-12 00:00:00
28644	28	b00034660	ความมั่นคงของระบบสารสนเทศ = Information system security / พลอยพรรณ สอนสุวิทย์	พลอยพรรณ สอนสุวิทย์	กำแพงเพชร : คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏกำแพงเพชร, 2560	658.4038 พ179ค		https://imagsopac.psru.ac.th/bookcover/34660/34660-fc-t.gif	Book	English	security	2026-01-06 06:46:36.100363	f	\N	2019-07-02 00:00:00
28631	28	b00084137	ระบบอัตโนมัติของเครือข่ายแลความมั่นคงปลอดภัยทางไซเบอร์ หน่วยที่ 1-7 = network automation and cyber security : ประมวลสาระชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. บัณฑิตศึกษา สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.8 ม192ร 2566	9786161630287	https://imagsopac.psru.ac.th/bookcover/84137/84137-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.595854	f	\N	2025-06-12 00:00:00
28632	28	b00084091	ระบบไซเบอร์กายภาพและการประยุกต์ หน่วยที่ 9-15 = Cyber-Physical system and applications : เอกสารการสอนชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.1 ม192ร 2566	9786161630270	https://imagsopac.psru.ac.th/bookcover/84091/84091-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.598524	f	\N	2025-06-10 00:00:00
28633	28	b00084090	ระบบไซเบอร์กายภาพและการประยุกต์ หน่วยที่ 1-8 = Cyber-Physical system and applications : เอกสารการสอนชุดวิชา / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี.	นนทบุรี : มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2566.	005.1 ม192ร 2566	9786161629939	https://imagsopac.psru.ac.th/bookcover/84090/84090-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.601177	f	\N	2025-06-10 00:00:00
28634	28	b00076456	กฎหมายความผิดเกี่ยวกับคอมพิวเตอร์ เล่ม 1 : ภาคกรอบแนวคิด ทฤษฎี และโครงสร้างฐานความผิด ภาคความผิดต่อความมั่นคงปลอดภัยของระบบและข้อมูลคอมพิวเตอร์ / คณาธิป ทองรวีวงศ์.	คณาธิป ทองรวีวงศ์.	กรุงเทพฯ : นิติธรรม, 2563.	นต 343.0994 ค142ก 2563	9789742037963	https://imagsopac.psru.ac.th/bookcover/76456/76456-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.60238	f	\N	2021-03-09 00:00:00
28635	28	b00028927	คู่มือ Cyber security สำหรับประชาชน : คู่มือแนวทางปฏิบัติการรักษาความปลอดภัยบนโลกไซเบอร์ภาคประชาชน / สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ	\N	กรุงเทพฯ : สำนัก, 2558.	004.678 ค416	9786162045301	https://imagsopac.psru.ac.th/bookcover/28927/28927-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.603325	f	\N	2019-07-02 00:00:00
28636	28	b00008866	Cyber Law กฎหมายกับอินเตอร์เน็ต / ชวลิต อัตถศาสตร์...[และคนอื่น ๆ].	\N	กรุงเทพฯ : โปรวิชั่น, 2544.	343.59309944 ช955	9747822385 :	https://imagsopac.psru.ac.th/bookcover/8866/8866-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.604116	f	\N	2019-07-02 00:00:00
28637	28	b00031649	Embedded System Design : Embedded Systems Foundations of Cyber-Physical Systems and the internet of things / by Peter Marwedel	Marwedel, Peter	Dordrecht : Springer Netherlands, 2018	004.21 M298E	9783319560434	https://imagsopac.psru.ac.th/bookcover/31649/31649-fc-t.gif	Book	English	cyber	2026-01-06 06:46:35.605011	f	\N	2019-07-02 00:00:00
28638	28	b00028127	Introduction to embedded systems : a cyber-physicalsystems approach / Edward Ashford Lee and SanjitArunkumar Seshia	Lee, Edward A.	Cambridge, Massachusetts : The MIT Press, 2017	006.22 L477I	9780262533812	https://imagsopac.psru.ac.th/bookcover/28127/28127-fc-t.gif	Book	English	cyber	2026-01-06 06:46:35.605919	f	\N	2019-07-02 00:00:00
28639	28	b00015378	High-performance embedded computing : applications in cyber-physical systems and mobile computing / Wayne Wolf.	Wolf, Wayne	Amsterdam : Elsevier, c2014.	004.16 W853H	978012415119	https://imagsopac.psru.ac.th/bookcover/15378/15378-fc-t.gif	Book	ภาษาไทย	cyber	2026-01-06 06:46:35.607267	f	\N	2019-07-02 00:00:00
28640	28	b00080598	นโยบายความมั่นคงและความสัมพันธ์ระหว่างประเทศ / ทิพย์วรรณ จักรเพ็ชร.	ทิพย์วรรณ จักรเพ็ชร.	กรุงเทพฯ : เปเปอร์เน็ต, 2565.	327 ท366น 2565		https://imagsopac.psru.ac.th/bookcover/80598/80598-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.090163	f	\N	2023-04-19 00:00:00
28641	28	j00027885	Food Security in times of COVID-19 วิถีเกษตรฟื้นความมั่นคงทางอาหารในวิกฤติโควิด / ศิริกร โพธิจักร.	ศิริกร โพธิจักร.	2563.			https://imagsopac.psru.ac.th/bookcover/68612/68612h000000141323-fc-a.jpg	Article	ภาษาไทย	security	2026-01-06 06:46:36.093755	f	\N	2021-06-23 00:00:00
28642	28	b00026273	ยามหล่อบอกต่อว่ารัก Security Love / HIDEKO_SUNSHINE	ฮิเดโกะ ซันซาย	กรุงเทพฯ : แจ่มใส, 2560	น ฮ354ย	9786160619108 :	https://imagsopac.psru.ac.th/bookcover/26273/26273-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.095621	f	\N	2019-07-02 00:00:00
28643	28	b00026590	คู่มือเรียนและใช้งาน Network Security Lab ฉบับใช้งานจริง / จักรชัย โสอินทร์ และคณะ	\N	นนทบุรี : ไอดีซี, 2560	004.6 ค416	9786162006869 :	https://imagsopac.psru.ac.th/bookcover/26590/26590-fc-t.gif	Book	English	security	2026-01-06 06:46:36.097598	f	\N	2019-07-02 00:00:00
28684	28	b00051175	Innovative cryptography / Nick Moldovyan, Alex Moldovyan.	Moldovyan, Nick .	Boston : Charles River Media, c2007	005.82 M717I	1584504676	https://imagsopac.psru.ac.th/bookcover/51175/51175-fc-t.gif	Book	English	security	2026-01-06 06:46:36.148293	f	\N	2019-07-02 00:00:00
28645	28	b00019061	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2558.	005.8 จ144ม 2558	9786162006043 :	https://imagsopac.psru.ac.th/bookcover/19061/19061-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.102101	f	\N	2019-07-02 00:00:00
28646	28	b00015545	ความมั่นคงอาเซียน = ASEAN security / พรเทพ จันทรนิก.	พรเทพ จันทรนิก.	กรุงเทพฯ : เอ.เอส. เทคนิคการพิมพ์, 2557.	นต 341.2473 พ175ค 2557	9786163742292 :	https://imagsopac.psru.ac.th/bookcover/15545/15545-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.10459	f	\N	2019-07-02 00:00:00
28647	28	b00072760	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 9-15 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี	นนทบุรี : สำนักพิมพ์มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2557.	658 ม192ก 2557	9786161606268	https://imagsopac.psru.ac.th/bookcover/72760/72760-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.105565	f	\N	2019-12-11 00:00:00
28648	28	b00072761	การบริหารความมั่นคงปลอดภัยสารสนเทศ หน่วยที่ 1-8 : เอกสารการสอนชุดวิชา = information security management / สาขาวิชาวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสุโขทัยธรรมาธิราช.	มหาวิทยาลัยสุโขทัยธรรมาธิราช. สาขาวิชาวิทยาศาสตร์และเทคโนโลยี	นนทบุรี : สำนักพิมพ์มหาวิทยาลัยสุโขทัยธรรมาธิราช, 2557.	658 ม192ก 2557	9786161605919	https://imagsopac.psru.ac.th/bookcover/72761/72761-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.106804	f	\N	2019-12-11 00:00:00
28649	28	b00050215	ความมั่นคงปลอดภัยของสารสนเทศและการจัดการ = Information security and management / พนิดา พานิชกุล.	พนิดา พานิชกุล.	กรุงเทพฯ : เคทีพี, 2553.	005.8 พ153ค	9786167396002 :	https://imagsopac.psru.ac.th/bookcover/50215/50215-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.10896	f	\N	2019-07-02 00:00:00
28650	28	b00056980	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2553.	005.8 จ144ม	9786162001062 :	https://imagsopac.psru.ac.th/bookcover/56980/56980-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.109804	f	\N	2019-07-02 00:00:00
28651	28	b00041199	Master in Security / จตุชัย แพงจันทร์ ; อรรณพ ขันธิกุล : บรรณาธิการ.	จตุชัย แพงจันทร์.	กรุงเทพฯ : ไอดีซี ดิสทริบิวเตอร์ เซ็นเตอร์, 2550.	005.8 จ144ม 2550	9789749660737 :	https://imagsopac.psru.ac.th/bookcover/41199/41199-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.110777	f	\N	2019-07-02 00:00:00
28652	28	b00021043	กลยุทธ์ในการจัดการกับสวัสดิภาพและความปลอดภัยในโรงเรียน = Practical school security / เคนเนธ ทรัมพ์ ; แปลและเรียบเรียงโดย ประศักดิ์ หอมสนิท .	ทรัมพ์, เคนเนธ.	กรุงเทพฯ : เอ็กซเปอร์เน็ท, 2546.	363.119371 ท1711ก	974911373X :	https://imagsopac.psru.ac.th/bookcover/21043/21043-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.111873	f	\N	2019-07-02 00:00:00
28653	28	b00084966	Blockchain essentials : core concepts and implementations / Ramchandra Sharad Mangrulkar, Pallavi Vijay Chavan.	Mangrulkar, Ramchandra Sharad.	\N	005.824 M277B 2024	9781484299746	https://imagsopac.psru.ac.th/bookcover/84966/84966-fc-t.gif	Book	English	security	2026-01-06 06:46:36.112968	f	\N	2025-08-28 00:00:00
28654	28	b00082357	Teaching cybersecurity : a handbook for teaching the cybersecurity body of knowledge in a conventional classroom / Daniel Shoemaker, Ken Sigler andTamara Shoemaker.	Shoemaker, Daniel.	Boca Raton : CPC Press, Taylor & Francis Group , 2023.	005.8071 S559T 2023	9781032034089	https://imagsopac.psru.ac.th/bookcover/82357/82357-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.114101	f	\N	2024-06-05 00:00:00
28655	28	b00082354	Introduction to machine learning with applications in information security / Mark Stamp.	Stamp, Mark.	Boca Raton : CPC Press, Taylor & Francis Group , 2023.	004.6 S783I 2023	9781032204925	https://imagsopac.psru.ac.th/bookcover/82354/82354-fc-t.gif	Book	English	security	2026-01-06 06:46:36.114831	f	\N	2024-06-05 00:00:00
28656	28	b00079163	Big Data, IoT, and machine learning : tools and applications / edited by Rashmi Agrawal, Marcin Paprzycki, Neha Gupta.	\N	Boca Raton ; CRC Press, c2021.	005.7 B592B 2021	9780367336745	https://imagsopac.psru.ac.th/bookcover/79163/79163-fc-t.gif	Book	English	security	2026-01-06 06:46:36.115632	f	\N	2022-07-05 00:00:00
28657	28	b00079516	Manual on livestock health and production for national food security : the book describes various challenges faced in food security sector and how to tackle it from Animal Husbandry outlook / Sunil Nayak, Hari R., Shahaji Phand.	Nayak, Sunil.	Mauritius : LAP LAMBERT Academic Publishing, 2020.	338.19 N331M 2020	9786202669757	https://imagsopac.psru.ac.th/bookcover/79516/79516-fc-t.gif	Book	English	security	2026-01-06 06:46:36.11748	f	\N	2022-08-21 00:00:00
28658	28	b00076769	Biodiversity, food and nutrition : a nwe agenda for sustainable food systems / edited by Danny Hunter, Teresa Borelli and Eliot Gee.	\N	Abingdon, Oxon : Routledge , 2020.	631.58 B615 2020	9780367141516	https://imagsopac.psru.ac.th/bookcover/76769/76769-fc-t.gif	Book	English	security	2026-01-06 06:46:36.118238	f	\N	2021-04-16 00:00:00
28659	28	b00084963	Management of information security / Michael E. Whitman, Herbert J. Mattord.	Whitman, Michael E.	Singapore : Cengage Learing Asia, c2019.	005.8 W615M 2018	9789814834735	https://imagsopac.psru.ac.th/bookcover/84963/84963-fc-t.gif	Book	English	security	2026-01-06 06:46:36.119042	f	\N	2025-08-28 00:00:00
28660	28	b00074783	Intelligence and state surveillance in modern societies : an international perspective / by Frederic Lemieux.	Lemieux, Frederic.	Bingley, UK: Emerald, c2019.	364.4 L554I 2019		https://imagsopac.psru.ac.th/bookcover/74783/74783-fc-t.gif	Book	English	security	2026-01-06 06:46:36.11971	f	\N	2020-06-18 00:00:00
28661	28	b00078403	System forensics, investigation, and response / Chuck Easttom.	Easttom, Chuck.	Burlington, MA : Jones & Bartlett Learning, 2019.	W 624 E13S 2019	9781284121841	https://imagsopac.psru.ac.th/bookcover/78403/78403-fc-t.gif	Book	English	security	2026-01-06 06:46:36.121399	f	\N	2022-01-26 00:00:00
28662	28	b00073704	Blockchain for distributed systems security / edited by Sachin S. Shetty, Charles A. Kamhoua, Laurent L. Njilla.	\N	Hoboken, New Jersey : Wiley-IEEE, c2019.	005.74 B651 2019	9781119519607	https://imagsopac.psru.ac.th/bookcover/73704/73704-fc-t.gif	Book	English	security	2026-01-06 06:46:36.122603	f	\N	2020-04-22 00:00:00
28663	28	b00038466	Global supply chain security and management : appraising programs, preventing crimes / Darren J. Prokop	Prokop, Darren	United Kingdom : Butterworth-Heinemann, 2017	658.5 P962G	9780128007488	https://imagsopac.psru.ac.th/bookcover/38466/38466-fc-t.gif	Book	English	security	2026-01-06 06:46:36.123442	f	\N	2019-07-02 00:00:00
28664	28	b00037630	Emerging capital markets and transition in contemporary China / Ken Morita	Morita, Ken	New Jersey : World Scientific, 2017.	332.04150951 M862E	9789813147898	https://imagsopac.psru.ac.th/bookcover/37630/37630-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.124905	f	\N	2019-07-02 00:00:00
28665	28	b00015372	Industrial network security : securing critical infrastructure networks for Smart Grid,SCADA, and other industrial control systems / Eric Knapp, Joel Thomas Langill.	Knapp, Eric	Amsterdam: Elsevier, 2015.	670.42 K16I	9780124201149	https://imagsopac.psru.ac.th/bookcover/15372/15372-fc-t.gif	Book	English	security	2026-01-06 06:46:36.125984	f	\N	2019-07-02 00:00:00
28666	28	b00029141	Protecting transportation : implementing security policies and programs / R. William Johnstone.	Johnstone, R. william.	Waltham, MA : Butterworth-Heinemann, 2015.	380 J72P	9780124081017	https://imagsopac.psru.ac.th/bookcover/29141/29141-fc-t.gif	Book	English	security	2026-01-06 06:46:36.126885	f	\N	2019-07-02 00:00:00
28667	28	b00014122	Computer and information security handbook / edited by John R. Vacca	\N	Waltham : Elsevier, c2013	005.8 C736	9780123943972	https://imagsopac.psru.ac.th/bookcover/14122/14122-fc-t.gif	Book	English	security	2026-01-06 06:46:36.127604	f	\N	2019-07-02 00:00:00
28668	28	b00014720	Financial statement analysis and security valuation / Stephen H. Penman .	Penman, Stephen H.	Boston : McGraw-Hill Irwin, c2013.	332.632042 P397F	9780071326407	https://imagsopac.psru.ac.th/bookcover/14720/14720-fc-t.gif	Book	English	security	2026-01-06 06:46:36.129364	f	\N	2019-07-02 00:00:00
28669	28	b00074086	Discrete dynamical systems and chaotic machines : theory and applications / Jacques M. Bahi, Christophe Guyeux.	Bahi, Jacques Mohcine.	Boca Raton, FL : CRC Press, c2013.	005.8 B151D 2013	9781466554504	https://imagsopac.psru.ac.th/bookcover/74086/74086-fc-t.gif	Book	English	security	2026-01-06 06:46:36.130826	f	\N	2020-05-15 00:00:00
28670	28	b00058160	Hospitality security : managing security in today's hotel, lodging, entertainment, and tourism environment / Darrell Clifton.	Clifton, Darrell.	Boca Raton, FL : CRC Press, c2012.	647.94068 C639H		https://imagsopac.psru.ac.th/bookcover/58160/58160-fc-t.gif	Book	English	security	2026-01-06 06:46:36.132823	f	\N	2019-07-02 00:00:00
28671	28	b00014303	Sustainable livestock management for poverty alleviationand food security / Katrien E. van	Hooft, Katrien van ́t,	Cambridge, MA : CABI, c2012	338.162 H778S	9781845938277	https://imagsopac.psru.ac.th/bookcover/14303/14303-fc-t.gif	Book	ภาษาไทย	security	2026-01-06 06:46:36.134074	f	\N	2019-07-02 00:00:00
28672	28	b00031409	Safety and security review for the process industries : application of HAZOP, PHA and What-If reviews / DennisP. Nolan	Nolan, Dennis P	Waltham, MA : Elsevier, c2012	660.2804 N787S	9781437735185	https://imagsopac.psru.ac.th/bookcover/31409/31409-fc-t.gif	Book	English	security	2026-01-06 06:46:36.135335	f	\N	2019-07-02 00:00:00
28673	28	b00059885	Cloud computing : SaaS, PaaS, IaaS, virtualization, business models, mobile, security, and more / Kris Jamsa.	Jamsa, Kris.	Burlington, MA : Jones & Bartlett Learning, 2013.	004.6782 J27C	9781449647391	https://imagsopac.psru.ac.th/bookcover/59885/59885-fc-t.gif	Book	English	security	2026-01-06 06:46:36.136281	f	\N	2019-07-02 00:00:00
28674	28	b00058359	Global Energy Assessment (GEA) / editors, Thomas B. Johansson, Anand Patwardhan, Nebojsa Nakicenovic, Gomez-Echeverri.	\N	Cambridge : Cambridge University Press, 2012.	333.79 G562	9780521182935 :	https://imagsopac.psru.ac.th/bookcover/58359/58359-fc-t.gif	Book	English	security	2026-01-06 06:46:36.137271	f	\N	2019-07-02 00:00:00
28675	28	b00049972	The Routledge handbook of security studies / edited by Myriam Dunn Cavelty and Victor Mauer	\N	New York : Routledge, 2010.	355 R852	9780415422789 :	https://imagsopac.psru.ac.th/bookcover/49972/49972-fc-t.gif	Book	English	security	2026-01-06 06:46:36.138215	f	\N	2019-07-02 00:00:00
28676	28	b00044991	Computer security : principles and Practice / Willam Stallings, Lawrie Brown with contributions by Mick Bauer and Michael Howard.	Stallings, William.	Upper Saddle River, NJ : Prentice Hall, 2008.	005.8 S775C	9780135137116	https://imagsopac.psru.ac.th/bookcover/44991/44991-fc-t.gif	Book	English	security	2026-01-06 06:46:36.139035	f	\N	2019-07-02 00:00:00
28677	28	b00048102	Secure computer and network systems : modeling, analysis and design / Nong Ye .	Ye, Nong.	Chichester, England ; Hoboken, NJ : J. Wiley & Sons, c2008.	005.8 Y37S	9780470023242	https://imagsopac.psru.ac.th/bookcover/48102/48102-fc-t.gif	Book	English	security	2026-01-06 06:46:36.140096	f	\N	2019-07-02 00:00:00
28678	28	b00057521	Citrix access security for IT administrators : citrix product development team.	\N	New York : McGraw-Hil, 2007.	005.8 C581	9780071485432	https://imagsopac.psru.ac.th/bookcover/57521/57521-fc-t.gif	Book	English	security	2026-01-06 06:46:36.142515	f	\N	2019-07-02 00:00:00
28679	28	b00046407	Network security essentials : applications and standards / William Stallings.	Stallings, William.	Upper Saddle River, NJ : Pearson Prentice Hall, 2007.	005.8 S775N	0132303787	https://imagsopac.psru.ac.th/bookcover/46407/46407-fc-t.gif	Book	English	security	2026-01-06 06:46:36.143537	f	\N	2019-07-02 00:00:00
28680	28	b00046101	Lawrence Pfleeger .	Pfleeger, Charles P.	Upper Saddle River, NJ : Prentice Hall, c2007	005.8 P531S	0136012965	https://imagsopac.psru.ac.th/bookcover/46101/46101-fc-t.gif	Book	English	security	2026-01-06 06:46:36.144348	f	\N	2019-07-02 00:00:00
28681	28	b00057451	Information assurance for the enterprise : a roadmap to information security / Corey Schou, Dan Shoemaker.	Schou, Corey.	Boston : McGraw-Hill Irwin, 2007.	005.8 S277I	9780072255249	https://imagsopac.psru.ac.th/bookcover/57451/57451-fc-t.gif	Book	English	security	2026-01-06 06:46:36.145306	f	\N	2019-07-02 00:00:00
28682	28	b00051262	Financial statement analysis and security valuation / Stephen H. Penman .	Penman, Stephen H.	Boston : McGraw-Hill Irwin, c2007.	332.632042 P397F	0071254323	https://imagsopac.psru.ac.th/bookcover/51262/51262-fc-t.gif	Book	English	security	2026-01-06 06:46:36.146359	f	\N	2019-07-02 00:00:00
28683	28	b00046424	Managing soil for food security and environmental quality / Premjit Sharma, editor.	\N	New Delhi : Gene - tech books, 2007.	631.4 M266	9788189729240	https://imagsopac.psru.ac.th/bookcover/46424/46424-fc-t.gif	Book	English	security	2026-01-06 06:46:36.147579	f	\N	2019-07-02 00:00:00
28685	28	b00046406	Cryptography and network security : principles and practices / William Stallings.	Stallings, William.	Upper Saddle River, N.J. : Pearson/Prentice Hall, 2006.	005.8 S782C	9780132023221	https://imagsopac.psru.ac.th/bookcover/46406/46406-fc-t.gif	Book	English	security	2026-01-06 06:46:36.149433	f	\N	2019-07-02 00:00:00
28686	28	b00012003	Hacking exposed : Network security secrets & solutions / Stuart Mcclure, Joel Scambray, George Kurtz.	Mcclure, Stuart.	New York : McGraw-Hill, 2005.	005.8 M487H	0072260815 :	https://imagsopac.psru.ac.th/bookcover/12003/12003-fc-t.gif	Book	English	security	2026-01-06 06:46:36.15067	f	\N	2019-07-02 00:00:00
28687	28	b00011837	Guide to operating systems security / Michael Palmer.	Palmer, Michael.	Boston : Thomson, 2004.	005.8 P175G	0619160403 :	https://imagsopac.psru.ac.th/bookcover/11837/11837-fc-t.gif	Book	English	security	2026-01-06 06:46:36.151343	f	\N	2019-07-02 00:00:00
28688	28	b00027699	Business and security : public-private sector relationships in a new security environment / edited by Alyson J. K. Bailes, Isabel Frommelt.	\N	Solna, Sweden : SIPRI, 2004.	338.88 B978	0199274509	https://imagsopac.psru.ac.th/bookcover/27699/27699-fc-t.gif	Book	English	security	2026-01-06 06:46:36.152028	f	\N	2019-07-02 00:00:00
28689	28	b00057529	Defeating terrorism : shaping the new security environment / Russell D. Howard, Reid L. Sawyer.	Howard, Russell D.	New York : The McGraw-Hill Companies, 2004.	363.320973 H848D	0072873027	https://imagsopac.psru.ac.th/bookcover/57529/57529-fc-t.gif	Book	English	security	2026-01-06 06:46:36.153333	f	\N	2019-07-02 00:00:00
28690	28	b00051145	Cryptography and network security : principles and practices / William Stallings.	Stallings, William.	Upper Saddle River, NJ : Prentice Hall, c2003	005.8 S782C	0131115022	https://imagsopac.psru.ac.th/bookcover/51145/51145-fc-t.gif	Book	English	security	2026-01-06 06:46:36.154158	f	\N	2019-07-02 00:00:00
28691	28	b00051158	Hacking exposed : Windows server 2003 / Joel Scambray, Stuart McClure .	Scambray, Joel.	New York : McGraw-Hill/Osborne, c2003.	005.8 S283H	0072230614	https://imagsopac.psru.ac.th/bookcover/51158/51158-fc-t.gif	Book	English	security	2026-01-06 06:46:36.154909	f	\N	2019-07-02 00:00:00
28692	28	b00051161	IIS security / Marty Jost and Michael Cobb.	Jost, Marty.	New York : McGraw-Hill/Osborne, c2002.	005.8 J83I	0072224398	https://imagsopac.psru.ac.th/bookcover/51161/51161-fc-t.gif	Book	English	security	2026-01-06 06:46:36.155568	f	\N	2019-07-02 00:00:00
28693	28	b00008412	Hack attack denied : a complete guide to network lockdown / John Chirillo.	Chirillo, John.	New York : John Wiley & Sons, 2001.	005.8 C541H	0471416258	https://imagsopac.psru.ac.th/bookcover/8412/8412-fc-t.gif	Book	English	security	2026-01-06 06:46:36.156196	f	\N	2019-07-02 00:00:00
28694	28	b00071834	Auditiong and security : As/400, NT, UNIT networks, and disaster recovery plans / Yusufali F. Musaji.	Musaji, Yusufali F.	New York : John Wiley & Sons, 2001.	005.8 M985A 2001	0471383716 :	https://imagsopac.psru.ac.th/bookcover/71834/71834-fc-t.gif	Book	English	security	2026-01-06 06:46:36.157187	f	\N	2019-10-21 00:00:00
28695	28	b00051109	International relations and world politics : security, economy, identity / Paul R. Viotti, Mark V. Kauppi.	Viotti, Paul R .	Upper Saddle River, NJ : Prentice Hall, c2001.	327 V799I	0130172774	https://imagsopac.psru.ac.th/bookcover/51109/51109-fc-t.gif	Book	English	security	2026-01-06 06:46:36.157774	f	\N	2019-07-02 00:00:00
28696	28	b00012720	Viruses revealed / David Harley, Robert Slade, Urs Gattiker.	Harley, David.	Berkeley, Calif : Osborn/McGraw-Hill, 2001.	005.84 H285V	0072130903	https://imagsopac.psru.ac.th/bookcover/12720/12720-fc-t.gif	Book	English	security	2026-01-06 06:46:36.158327	f	\N	2019-07-02 00:00:00
28697	28	b00004820	Ensuring health and income security for an aging workforce / Peter P. Budetti...[et. al], editors.	\N	Kalamazoo, Michigan : W.E. Upjohn Institute for Employment / Research, 2001.	331.394 E59	0880992204	https://imagsopac.psru.ac.th/bookcover/4820/4820-fc-t.gif	Book	English	security	2026-01-06 06:46:36.158856	f	\N	2019-07-02 00:00:00
\.


--
-- TOC entry 3542 (class 0 OID 16686)
-- Dependencies: 221
-- Data for Name: curriculums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curriculums (id, name, faculty_id, created_at, level) FROM stdin;
138	สาขาวิชาการศึกษา วิชาเอกการประถมศึกษา	37	2025-12-25 06:53:26.899828	ป.ตรี
139	สาขาวิชาการศึกษา วิชาเอกการศึกษาปฐมวัย	37	2025-12-25 06:53:26.899828	ป.ตรี
140	สาขาวิชาการศึกษา วิชาเอกการศึกษาพิเศษ	37	2025-12-25 06:53:26.899828	ป.ตรี
141	สาขาวิชาการศึกษา วิชาเอกคณิตศาสตร์	37	2025-12-25 06:53:26.899828	ป.ตรี
142	สาขาวิชาการศึกษา วิชาเอกจิตวิทยาและการแนะแนว	37	2025-12-25 06:53:26.899828	ป.ตรี
143	สาขาวิชาการศึกษา วิชาเอกดนตรีและนาฏศิลป์ศึกษา	37	2025-12-25 06:53:26.899828	ป.ตรี
144	สาขาวิชาการศึกษา วิชาเอกพลศึกษา	37	2025-12-25 06:53:26.899828	ป.ตรี
145	สาขาวิชาการศึกษา วิชาเอกภาษาไทย	37	2025-12-25 06:53:26.899828	ป.ตรี
146	สาขาวิชาการศึกษา วิชาเอกภาษาอังกฤษ	37	2025-12-25 06:53:26.899828	ป.ตรี
147	สาขาวิชาการศึกษา วิชาเอกวิทยาศาสตร์ทั่วไป	37	2025-12-25 06:53:26.899828	ป.ตรี
148	สาขาวิชาการศึกษา วิชาเอกสังคมศึกษา	37	2025-12-25 06:53:26.899828	ป.ตรี
149	ประกาศนียบัตรบัณฑิต วิชาชีพครู	37	2025-12-25 06:53:26.899828	ป.บัณฑิต
150	ครุศาสตรมหาบัณฑิต สาขาวิชาหลักสูตรและการสอน	37	2025-12-25 06:53:26.899828	ป.โท
151	ครุศาสตรมหาบัณฑิต สาขาวิชาการบริหารการศึกษา	37	2025-12-25 06:53:26.899828	ป.โท
152	ปรัชญาดุษฎีบัณฑิต สาขาวิชาวิจัยและพัฒนานวัตกรรม	37	2025-12-25 06:53:26.899828	ป.เอก
153	ครุศาสตรมหาบัณฑิต สาขาวิชาวิจัยและพัฒนานวัตกรรม	37	2025-12-25 06:53:26.899828	ป.โท
154	สาขาวิชาเกษตรศาสตร์ วิชาเอกการจัดการทรัพยากรเกษตรและสิ่งแวดล้อม	38	2025-12-25 06:53:26.899828	ป.ตรี
155	สาขาวิชาเกษตรศาสตร์ วิชาเอกพืชศาสตร์	38	2025-12-25 06:53:26.899828	ป.ตรี
156	สาขาวิชานวัตกรรมและเทคโนโลยีเพิ่มมูลค่าผลพลอยได้ทางการเกษตร	38	2025-12-25 06:53:26.899828	ป.ตรี
157	สาขาวิชาพัฒนาผลิตภัณฑ์เพื่อสุขภาพและเครื่องสำอาง	38	2025-12-25 06:53:26.899828	ป.ตรี
158	สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร	38	2025-12-25 06:53:26.899828	ป.ตรี
159	สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกการเพาะเลี้ยงสัตว์น้ำ	38	2025-12-25 06:53:26.899828	ป.ตรี
160	สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกสัตวศาสตร์	38	2025-12-25 06:53:26.899828	ป.ตรี
161	สาขาวิชาสถาปัตยกรรม	39	2025-12-25 06:53:26.899828	ป.ตรี
162	สาขาวิชาวิศวกรรมการผลิต	39	2025-12-25 06:53:26.899828	ป.ตรี
163	สาขาวิชาวิศวกรรมคอมพิวเตอร์	39	2025-12-25 06:53:26.899828	ป.ตรี
164	สาขาวิชาวิศวกรรมเครื่องกล	39	2025-12-25 06:53:26.899828	ป.ตรี
165	สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์	39	2025-12-25 06:53:26.899828	ป.ตรี
166	สาขาวิชาวิศวกรรมโยธา	39	2025-12-25 06:53:26.899828	ป.ตรี
167	สาขาวิชาวิศวกรรมโลจิสติกส์	39	2025-12-25 06:53:26.899828	ป.ตรี
168	สาขาวิชาศิลปะและการออกแบบ วิชาเอกเครื่องปั้นดินเผา	39	2025-12-25 06:53:26.899828	ป.ตรี
169	สาขาวิชาศิลปะและการออกแบบ วิชาเอกออกแบบผลิตภัณฑ์	39	2025-12-25 06:53:26.899828	ป.ตรี
170	สาขาวิชาวิศวกรรมการผลิต (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
171	สาขาวิชาวิศวกรรมคอมพิวเตอร์ (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
172	สาขาวิชาวิศวกรรมเครื่องกล (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
173	สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์ (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
174	สาขาวิชาวิศวกรรมโยธา (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
175	สาขาวิชาศิลปะและการออกแบบ (เทียบโอน)	39	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
176	สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมการจัดการและโลจิสติกส์ (ต่อเนื่อง)	39	2025-12-25 06:53:26.899828	ป.ตรี (ต่อเนื่อง)
177	สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมไฟฟ้ากำลัง (ต่อเนื่อง)	39	2025-12-25 06:53:26.899828	ป.ตรี (ต่อเนื่อง)
178	วิศวกรรมศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมการจัดการและเทคโนโลยีอุตสาหกรรม	39	2025-12-25 06:53:26.899828	ป.โท
179	พยาบาลศาสตรบัณฑิต	40	2025-12-25 06:53:26.899828	ป.ตรี
180	สาขาวิชาดนตรี	41	2025-12-25 06:53:26.899828	ป.ตรี
181	สาขาวิชาภาษาจีน	41	2025-12-25 06:53:26.899828	ป.ตรี
182	สาขาวิชาภาษาจีนธุรกิจ	41	2025-12-25 06:53:26.899828	ป.ตรี
183	สาขาวิชาภาษาญี่ปุ่น	41	2025-12-25 06:53:26.899828	ป.ตรี
184	สาขาวิชาภาษาไทย	41	2025-12-25 06:53:26.899828	ป.ตรี
185	สาขาวิชาภาษาอังกฤษ	41	2025-12-25 06:53:26.899828	ป.ตรี
186	สาขาวิชาภาษาอังกฤษธุรกิจ	41	2025-12-25 06:53:26.899828	ป.ตรี
187	สาขาวิชาสารสนเทศศาสตร์	41	2025-12-25 06:53:26.899828	ป.ตรี
188	ศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาไทย	41	2025-12-25 06:53:26.899828	ป.โท
189	สาขาวิชาการจัดการ	42	2025-12-25 06:53:26.899828	ป.ตรี
190	สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ	42	2025-12-25 06:53:26.899828	ป.ตรี
191	สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ	42	2025-12-25 06:53:26.899828	ป.ตรี
192	สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล	42	2025-12-25 06:53:26.899828	ป.ตรี
193	สาขาวิชาการท่องเที่ยวและบริการยุคดิจิทัล	42	2025-12-25 06:53:26.899828	ป.ตรี
194	บัญชีบัณฑิต	42	2025-12-25 06:53:26.899828	ป.ตรี
195	สาขาวิชาธุรกิจการค้าสมัยใหม่	42	2025-12-25 06:53:26.899828	ป.ตรี
196	สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล	42	2025-12-25 06:53:26.899828	ป.ตรี
197	สาขาวิชานิเทศศาสตร์	42	2025-12-25 06:53:26.899828	ป.ตรี
198	สาขาวิชาเศรษฐศาสตร์ธุรกิจและภาครัฐ	42	2025-12-25 06:53:26.899828	ป.ตรี
199	สาขาวิชาการจัดการ (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
200	สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
201	สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
202	สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
203	บัญชีบัณฑิต (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
204	สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (เทียบโอน)	42	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
205	บริหารธุรกิจมหาบัณฑิต สาขาวิชาบริหารธุรกิจ	42	2025-12-25 06:53:26.899828	ป.โท
206	ปรัชญาดุษฎีบัณฑิต สาขาวิชาบริหารธุรกิจ	42	2025-12-25 06:53:26.899828	ป.เอก
207	สาขาวิชาคณิตศาสตร์	43	2025-12-25 06:53:26.899828	ป.ตรี
208	สาขาวิชาคหกรรมศาสตร์	43	2025-12-25 06:53:26.899828	ป.ตรี
209	สาขาวิชาเคมี	43	2025-12-25 06:53:26.899828	ป.ตรี
210	สาขาวิชาจุลชีววิทยา	43	2025-12-25 06:53:26.899828	ป.ตรี
211	สาขาวิชาชีววิทยา	43	2025-12-25 06:53:26.899828	ป.ตรี
212	สาขาวิชาเทคโนโลยีสารสนเทศ	43	2025-12-25 06:53:26.899828	ป.ตรี
213	สาขาวิชาฟิสิกส์	43	2025-12-25 06:53:26.899828	ป.ตรี
214	สาขาวิชาวิทยาการคอมพิวเตอร์	43	2025-12-25 06:53:26.899828	ป.ตรี
215	สาขาวิชาวิทยาศาสตร์สิ่งแวดล้อม	43	2025-12-25 06:53:26.899828	ป.ตรี
216	สาขาวิชาสาธารณสุขศาสตร์	43	2025-12-25 06:53:26.899828	ป.ตรี
217	สาขาวิชาเทคโนโลยีสารสนเทศ (เทียบโอน)	43	2025-12-25 06:53:26.899828	ป.ตรี (เทียบโอน)
218	ศิลปศาสตรมหาบัณฑิต สาขาวิชาคหกรรมศาสตร์	43	2025-12-25 06:53:26.899828	ป.โท
219	ปรัชญาดุษฎีบัณฑิต สาขาวิชาคหกรรมศาสตร์	43	2025-12-25 06:53:26.899828	ป.เอก
220	สาขาวิชาการพัฒนาชุมชน	44	2025-12-25 06:53:26.899828	ป.ตรี
221	สาขาวิชานิติศาสตร์	44	2025-12-25 06:53:26.899828	ป.ตรี
222	สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการบริหารจัดการภาครัฐ	44	2025-12-25 06:53:26.899828	ป.ตรี
223	สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการปกครองท้องถิ่น	44	2025-12-25 06:53:26.899828	ป.ตรี
224	สาขาวิชารัฐศาสตร์	44	2025-12-25 06:53:26.899828	ป.ตรี
225	สาขาวิชาสังคมสงเคราะห์ศาสตร์	44	2025-12-25 06:53:26.899828	ป.ตรี
226	รัฐประศาสนศาสตรมหาบัณฑิต สาขาวิชารัฐประศาสนศาสตร์	44	2025-12-25 06:53:26.899828	ป.โท
227	ปรัชญาดุษฎีบัณฑิต สาขาวิชารัฐประศาสนศาสตร์	44	2025-12-25 06:53:26.899828	ป.เอก
\.


--
-- TOC entry 3544 (class 0 OID 16693)
-- Dependencies: 223
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculties (id, name, created_at) FROM stdin;
37	ครุศาสตร์	2025-12-25 06:53:26.899828
38	เทคโนโลยีการเกษตรและอาหาร	2025-12-25 06:53:26.899828
39	เทคโนโลยีอุตสาหกรรม	2025-12-25 06:53:26.899828
40	พยาบาลศาสตร์	2025-12-25 06:53:26.899828
41	มนุษยศาสตร์และสังคมศาสตร์	2025-12-25 06:53:26.899828
42	วิทยาการจัดการ	2025-12-25 06:53:26.899828
43	วิทยาศาสตร์และเทคโนโลยี	2025-12-25 06:53:26.899828
44	สังคมศาสตร์และการพัฒนาท้องถิ่น	2025-12-25 06:53:26.899828
\.


--
-- TOC entry 3546 (class 0 OID 16698)
-- Dependencies: 225
-- Data for Name: professor_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professor_courses (id, professor_id, name_th, name_en, code_th, code_en, description_th, description_en, website, created_at, updated_at, keywords, faculty_id, curriculum_id) FROM stdin;
28	\N	การสื่อสารข้อมูลและเครือข่ายคอมพิวเตอร์	Data Communications and Networking	วท.คพ.161	COMP161	test	\N	\N	2026-01-06 06:46:35.179503	2026-01-06 06:46:35.179503	{cyber,security}	43	214
\.


--
-- TOC entry 3555 (class 0 OID 24578)
-- Dependencies: 234
-- Data for Name: student_courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_courses (id, student_id, student_name, student_email, course_id, created_at) FROM stdin;
8	6512231026	ปิยังกรู อินทร์ทับ	6512231026	28	2026-01-06 06:59:56.617746
\.


--
-- TOC entry 3548 (class 0 OID 16711)
-- Dependencies: 227
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, created_at, faculty, role) FROM stdin;
1	gfd7812548965@gmail.com	$2b$10$9r1S4dofEoAOJGS1Uvcn5edB8DGrLrIwcHdTHQKz3PslVnvPqFCE2	อภินันท์ ชาติจันทึก	2025-11-19 06:43:40.889069	คณะวิทยาศาสตร์และเทคโนโลยี	admin
2	panadda.m@gmail.com	$2b$10$eollXLwHUokK/uIRlJmA.eUaC4BMX/bVDiM0SAO60kGTreDzJx9Ta	ปนัดดา มังสา	2025-11-19 06:44:51.974707	วิทยาลัยการจัดการและพัฒนาท้องถิ่น	user
3	pongsagorn.l@gmail.com	$2b$10$IUn/ZOD.Ig5w0FDVKS7ZDuG2f8pI6ugKqDz/aZqT7lDqbeEkYzrFm	พงศกร เลิศศิริ	2025-11-19 06:45:18.411349	คณะครุศาสตร์	user
4	logathrim@gmail.com	$2b$10$Llt0ZBD6rF11r5TOztcQ7OPQ8/WoZU3bUf/NTZIfGoO5iTaf6Nj/a	โลก้า ทริม	2025-11-19 06:46:06.425243	คณะวิทยาศาสตร์และเทคโนโลยี	professor
\.


--
-- TOC entry 3573 (class 0 OID 0)
-- Dependencies: 231
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 95, true);


--
-- TOC entry 3574 (class 0 OID 0)
-- Dependencies: 216
-- Name: course_books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_books_id_seq', 91, true);


--
-- TOC entry 3575 (class 0 OID 0)
-- Dependencies: 229
-- Name: course_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_files_id_seq', 1, true);


--
-- TOC entry 3576 (class 0 OID 0)
-- Dependencies: 218
-- Name: course_instructors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_instructors_id_seq', 67, true);


--
-- TOC entry 3577 (class 0 OID 0)
-- Dependencies: 220
-- Name: course_recommended_books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.course_recommended_books_id_seq', 28697, true);


--
-- TOC entry 3578 (class 0 OID 0)
-- Dependencies: 222
-- Name: curriculums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curriculums_id_seq', 227, true);


--
-- TOC entry 3579 (class 0 OID 0)
-- Dependencies: 224
-- Name: faculties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculties_id_seq', 44, true);


--
-- TOC entry 3580 (class 0 OID 0)
-- Dependencies: 226
-- Name: professor_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professor_courses_id_seq', 28, true);


--
-- TOC entry 3581 (class 0 OID 0)
-- Dependencies: 233
-- Name: student_courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_courses_id_seq', 9, true);


--
-- TOC entry 3582 (class 0 OID 0)
-- Dependencies: 228
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 3370 (class 2606 OID 17010)
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3337 (class 2606 OID 16741)
-- Name: course_books course_books_course_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_course_id_book_id_key UNIQUE (course_id, book_id);


--
-- TOC entry 3339 (class 2606 OID 16743)
-- Name: course_books course_books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_pkey PRIMARY KEY (id);


--
-- TOC entry 3367 (class 2606 OID 16905)
-- Name: course_files course_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_files
    ADD CONSTRAINT course_files_pkey PRIMARY KEY (id);


--
-- TOC entry 3343 (class 2606 OID 16745)
-- Name: course_instructors course_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 16747)
-- Name: course_recommended_books course_recommended_books_course_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_recommended_books
    ADD CONSTRAINT course_recommended_books_course_id_book_id_key UNIQUE (course_id, book_id);


--
-- TOC entry 3348 (class 2606 OID 16749)
-- Name: course_recommended_books course_recommended_books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_recommended_books
    ADD CONSTRAINT course_recommended_books_pkey PRIMARY KEY (id);


--
-- TOC entry 3352 (class 2606 OID 16759)
-- Name: curriculums curriculums_name_faculty_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT curriculums_name_faculty_id_key UNIQUE (name, faculty_id);


--
-- TOC entry 3354 (class 2606 OID 16761)
-- Name: curriculums curriculums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT curriculums_pkey PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 16763)
-- Name: faculties faculties_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_name_key UNIQUE (name);


--
-- TOC entry 3358 (class 2606 OID 16765)
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- TOC entry 3361 (class 2606 OID 16767)
-- Name: professor_courses professor_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professor_courses
    ADD CONSTRAINT professor_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3382 (class 2606 OID 24586)
-- Name: student_courses student_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3384 (class 2606 OID 24588)
-- Name: student_courses student_courses_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- TOC entry 3363 (class 2606 OID 16771)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3365 (class 2606 OID 16773)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3371 (class 1259 OID 17013)
-- Name: idx_activity_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_action ON public.activity_logs USING btree (action);


--
-- TOC entry 3372 (class 1259 OID 17015)
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at);


--
-- TOC entry 3373 (class 1259 OID 17016)
-- Name: idx_activity_logs_created_at_desc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_created_at_desc ON public.activity_logs USING btree (created_at DESC);


--
-- TOC entry 3374 (class 1259 OID 17054)
-- Name: idx_activity_logs_faculty; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_faculty ON public.activity_logs USING btree (faculty);


--
-- TOC entry 3375 (class 1259 OID 17055)
-- Name: idx_activity_logs_program; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_program ON public.activity_logs USING btree (program);


--
-- TOC entry 3376 (class 1259 OID 17014)
-- Name: idx_activity_logs_resource_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_resource_type ON public.activity_logs USING btree (resource_type);


--
-- TOC entry 3377 (class 1259 OID 17011)
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- TOC entry 3378 (class 1259 OID 17012)
-- Name: idx_activity_logs_user_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_activity_logs_user_type ON public.activity_logs USING btree (user_type);


--
-- TOC entry 3340 (class 1259 OID 16774)
-- Name: idx_course_books_book_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_books_book_id ON public.course_books USING btree (book_id);


--
-- TOC entry 3341 (class 1259 OID 16775)
-- Name: idx_course_books_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_books_course_id ON public.course_books USING btree (course_id);


--
-- TOC entry 3368 (class 1259 OID 16916)
-- Name: idx_course_files_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_files_course_id ON public.course_files USING btree (course_id);


--
-- TOC entry 3344 (class 1259 OID 16776)
-- Name: idx_course_instructors_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_instructors_course_id ON public.course_instructors USING btree (course_id);


--
-- TOC entry 3349 (class 1259 OID 16861)
-- Name: idx_course_recommended_books_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_recommended_books_admin ON public.course_recommended_books USING btree (admin_recommended);


--
-- TOC entry 3350 (class 1259 OID 16777)
-- Name: idx_course_recommended_books_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_course_recommended_books_course_id ON public.course_recommended_books USING btree (course_id);


--
-- TOC entry 3359 (class 1259 OID 16954)
-- Name: idx_professor_courses_professor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professor_courses_professor_id ON public.professor_courses USING btree (professor_id);


--
-- TOC entry 3379 (class 1259 OID 24595)
-- Name: idx_student_courses_course_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_courses_course_id ON public.student_courses USING btree (course_id);


--
-- TOC entry 3380 (class 1259 OID 24594)
-- Name: idx_student_courses_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_student_courses_student_id ON public.student_courses USING btree (student_id);


--
-- TOC entry 3385 (class 2606 OID 16799)
-- Name: course_books course_books_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_books
    ADD CONSTRAINT course_books_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.professor_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3391 (class 2606 OID 16906)
-- Name: course_files course_files_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_files
    ADD CONSTRAINT course_files_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.professor_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3386 (class 2606 OID 16804)
-- Name: course_instructors course_instructors_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.professor_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3387 (class 2606 OID 16809)
-- Name: course_recommended_books course_recommended_books_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_recommended_books
    ADD CONSTRAINT course_recommended_books_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.professor_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3388 (class 2606 OID 16829)
-- Name: curriculums curriculums_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT curriculums_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON DELETE CASCADE;


--
-- TOC entry 3389 (class 2606 OID 16891)
-- Name: professor_courses professor_courses_curriculum_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professor_courses
    ADD CONSTRAINT professor_courses_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id);


--
-- TOC entry 3390 (class 2606 OID 16886)
-- Name: professor_courses professor_courses_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professor_courses
    ADD CONSTRAINT professor_courses_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id);


--
-- TOC entry 3392 (class 2606 OID 24589)
-- Name: student_courses student_courses_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.professor_courses(id) ON DELETE CASCADE;


--
-- TOC entry 3562 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-01-08 13:47:57 +07

--
-- PostgreSQL database dump complete
--

