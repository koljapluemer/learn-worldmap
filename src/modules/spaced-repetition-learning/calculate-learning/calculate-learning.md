# Calculate Learning

## Process

1. We choose random *due* lesson.
    - Whether a given lesson is due can be discerned via its id, which is saved in a dexie db (`lessonCards`)
    - The `LessonManager` can give out the actual `Lesson` by its id
    - We make sure that we do not pick the same lesson twice by saving the last-picked id as a variable
    - If *no* lesson is due, we pick a random lesson that was never seen before (id not in the db)
    - At this step, we log how many lessons are due, how many are new, and the id of the chosen one
2. We choose a random *due* exercise *from the picked lesson*
    - Again, whether a given exercise is due can be seen via the db
    - Relevant util functions should be in the `Lesson` class
    - If *no* exercise from this lesson is due, we pick the exercise from this lesson that will be done nearest in the future
    - At this step, we log how many exercises this specific lesson has, how many are due, how many are new
3. After the user finishes an exercise by clicking on the country after n tries, we restart the progress