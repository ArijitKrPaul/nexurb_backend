import postgres from "postgres";

const sql = postgres({
  host: "localhost",
  port: "5432",
  database: "Nexurb",
  username: "postgres",
  password: "password",
});

export default sql;
