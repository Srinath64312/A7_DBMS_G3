-- ==============================================================================
-- KL UNIVERSITY - DEPARTMENT OF CSE (OFF-CAMPUS AZIZ NAGAR)
-- Course: 25CS1302E - Database Systems & Distributed Backend Development (DBS-DBD)
-- Solutions for First 35 DBMS / SQL Lab Questions
-- Database: PostgreSQL (klhdb)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPTIONAL SETUP: Standard EMP and DEPT Tables with Sample Data
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dept (
    deptno INT PRIMARY KEY,
    dname VARCHAR(50) NOT NULL,
    loc VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS emp (
    empno INT PRIMARY KEY,
    ename VARCHAR(50) NOT NULL,
    job VARCHAR(50) NOT NULL,
    mgr INT,
    hiredate DATE NOT NULL,
    sal NUMERIC(10, 2) NOT NULL,
    comm NUMERIC(10, 2) DEFAULT 0,
    deptno INT REFERENCES dept(deptno)
);

-- Sample Data Seeding
INSERT INTO dept (deptno, dname, loc) VALUES
(10, 'ACCOUNTING', 'NEW YORK'),
(20, 'RESEARCH', 'DALLAS'),
(30, 'SALES', 'CHICAGO'),
(40, 'OPERATIONS', 'BOSTON')
ON CONFLICT (deptno) DO NOTHING;

INSERT INTO emp (empno, ename, job, mgr, hiredate, sal, comm, deptno) VALUES
(7369, 'SMITH',  'CLERK',     7902, '2019-12-17', 3200.00, NULL,   20),
(7499, 'ALLEN',  'SALESMAN',  7698, '2020-02-20', 3600.00, 300.00, 30),
(7521, 'WARD',   'SALESMAN',  7698, '2020-02-22', 2500.00, 500.00, 30),
(7566, 'JONES',  'MANAGER',   7839, '2018-04-02', 5975.00, NULL,   20),
(7654, 'MARTIN', 'SALESMAN',  7698, '2021-09-28', 2500.00, 1400.00,30),
(7698, 'BLAKE',  'MANAGER',   7839, '2019-05-01', 4850.00, NULL,   30),
(7782, 'CLARK',  'MANAGER',   7839, '2019-06-09', 4450.00, NULL,   10),
(7788, 'SCOTT',  'ANALYST',   7566, '2020-04-19', 4000.00, NULL,   20),
(7839, 'KING',   'PRESIDENT', NULL, '2017-11-17', 8000.00, NULL,   10),
(7844, 'TURNER', 'SALESMAN',  7698, '2020-09-08', 3500.00, 0.00,   30),
(7876, 'ADAMS',  'CLERK',     7788, '2021-05-23', 3100.00, NULL,   20),
(7900, 'JAMES',  'CLERK',     7698, '2020-12-03', 2950.00, NULL,   30),
(7902, 'FORD',   'ANALYST',   7566, '2019-12-03', 4000.00, NULL,   40),
(7934, 'MILLER', 'CLERK',     7782, '2022-01-23', 3300.00, NULL,   10)
ON CONFLICT (empno) DO NOTHING;

-- ==============================================================================
-- SQL SOLUTIONS (1 to 35)
-- ==============================================================================

-- Q1. Display the dept information from department table
SELECT * FROM dept;

-- Q2. Display the details of all employees
SELECT * FROM emp;

-- Q3. Display the name and job for all employees
SELECT ename, job FROM emp;

-- Q4. Display name and salary for all employees
SELECT ename, sal FROM emp;

-- Q5. Display employee number and total salary for each employee (handling null commission)
SELECT empno, ename, sal + COALESCE(comm, 0) AS total_salary FROM emp;

-- Q6. Display employee name and annual salary for all employees
SELECT ename, sal * 12 AS annual_salary FROM emp;

-- Q7. Display the names of all employees who are working in department number 10
SELECT ename FROM emp WHERE deptno = 10;

-- Q8. Display the names of all employees working as clerks and drawing a salary more than 3000
SELECT ename FROM emp WHERE UPPER(job) = 'CLERK' AND sal > 3000;

-- Q9. Display employee number and names for employees who earn commission
SELECT empno, ename, comm FROM emp WHERE comm IS NOT NULL AND comm > 0;

-- Q10. Display names of employees who do not earn any commission
SELECT ename FROM emp WHERE comm IS NULL OR comm = 0;

-- Q11. Display the names of employees who are working as clerk, salesman or Field Assistant and drawing a salary more than 3000
SELECT ename, job, sal FROM emp 
WHERE UPPER(job) IN ('CLERK', 'SALESMAN', 'FIELD ASSISTANT') AND sal > 3000;

-- Q12. Display the names of employees who are working in the company for the past 5 years
SELECT ename, hiredate FROM emp 
WHERE hiredate <= CURRENT_DATE - INTERVAL '5 years';

-- Q13. Display the list of employees who have joined the company before 30th June 2020 or after 31st Dec 2020
SELECT ename, hiredate FROM emp 
WHERE hiredate < '2020-06-30' OR hiredate > '2020-12-31';

-- Q14. Display current date, current time, current date and time (three queries)
SELECT CURRENT_DATE AS current_date;
SELECT CURRENT_TIME AS current_time;
SELECT CURRENT_TIMESTAMP AS current_date_and_time;

-- Q15. Display the list of users (PostgreSQL system catalog)
SELECT usename FROM pg_user;

-- Q16. Display the names of all tables from the current user
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Q17. Display the name of the current user
SELECT CURRENT_USER;

-- Q18. Display the names of employees working in department number 10 or 20 or 40 or employees working as clerks, salesman or analyst
SELECT ename, deptno, job FROM emp 
WHERE deptno IN (10, 20, 40) OR UPPER(job) IN ('CLERK', 'SALESMAN', 'ANALYST');

-- Q19. Display the names of employees whose name starts with alphabet S
SELECT ename FROM emp WHERE ename LIKE 'S%';

-- Q20. Display employee name from employees whose name ends with alphabet S
SELECT ename FROM emp WHERE ename LIKE '%S';

-- Q21. Display the names of employees whose names have second alphabet A in their names
SELECT ename FROM emp WHERE ename LIKE '_A%';

-- Q22. Display the names of employees whose name is exactly five characters in length
SELECT ename FROM emp WHERE LENGTH(ename) = 5;

-- Q23. Display the names of employees who are not working as managers
SELECT ename, job FROM emp WHERE UPPER(job) != 'MANAGER';

-- Q24. Display the names of employees who are not working as SALESMAN or CLERK or ANALYST
SELECT ename, job FROM emp WHERE UPPER(job) NOT IN ('SALESMAN', 'CLERK', 'ANALYST');

-- Q26. Display the total number of employees working in the company
SELECT COUNT(*) AS total_employees FROM emp;

-- Q27. Display the total salary and total commission to all employees
SELECT SUM(sal) AS total_salary, SUM(COALESCE(comm, 0)) AS total_commission FROM emp;

-- Q28. Display the maximum salary from emp table
SELECT MAX(sal) AS max_salary FROM emp;

-- Q29. Display the minimum salary from emp table
SELECT MIN(sal) AS min_salary FROM emp;

-- Q30. Display the average salary from emp table
SELECT ROUND(AVG(sal), 2) AS avg_salary FROM emp;

-- Q31. Display the maximum salary being paid to CLERK
SELECT MAX(sal) AS max_clerk_salary FROM emp WHERE UPPER(job) = 'CLERK';

-- Q32. Display the maximum salary being paid in dept no 20
SELECT MAX(sal) AS max_sal_dept20 FROM emp WHERE deptno = 20;

-- Q33. Display the minimum salary being paid to any SALESMAN
SELECT MIN(sal) AS min_salesman_salary FROM emp WHERE UPPER(job) = 'SALESMAN';

-- Q34. Display the average salary drawn by managers
SELECT ROUND(AVG(sal), 2) AS avg_manager_salary FROM emp WHERE UPPER(job) = 'MANAGER';

-- Q35. Display the total salary drawn by analyst working in dept no 40
SELECT SUM(sal) AS total_analyst_sal_dept40 FROM emp WHERE UPPER(job) = 'ANALYST' AND deptno = 40;
