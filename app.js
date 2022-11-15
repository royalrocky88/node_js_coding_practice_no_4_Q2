//--- Database Initialize--------------------------------
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//----Movie---------Object-------------------------------
const convertMovieDBObjToResponseObj = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//----Director-------Object----------------------------
const convertDirectorDBObjToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//---Get ---list of all movies---------------------------
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT movie_name  FROM movie;
    `;

  const moviesArray = await db.all(getMovieQuery);

  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//---Post ----Create New Movie Detail --------------------
app.post("/movies/", async (request, response) => {
  const moviesDetail = request.body;

  const { directorId, movieName, leadActor } = moviesDetail;

  const addMovieDetail = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES(        
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );
    `;
  const dbResponse = await db.run(addMovieDetail);

  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//---Get ---Single Movies detail show in list -----------------
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT * FROM movie 
    WHERE movie_id = ${movieId};
    `;

  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDBObjToResponseObj(movie));
});

//---Put ---Update movie details in list ---------------------
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieDetail = request.body;

  const { directorId, movieName, leadActor } = movieDetail;

  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
    `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//---Delete --- Delete movie detail in the list---------------
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
    `;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//---Get --- Open all Director List------------------------
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT * FROM director;`;

  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorDBObjToResponseObj(eachDirector)
    )
  );
});

//---- Get --- Find Specific movie director-----------------
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const movieDirectorList = `
    SELECT movie_name FROM movie WHERE director_id = ${directorId};
    `;

  const movieArray = await db.all(movieDirectorList);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
