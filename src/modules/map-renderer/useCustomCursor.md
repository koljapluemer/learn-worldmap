# useCustomCursor

This composable is responsible for rendering a custom cursor on our game map.

## Features

### Touch/Mouse-Controlled Detection

Some features diverge depending on whether the user is on a touch-device or not.
Detect this *once* in the beginning, then diverge at the relevant point

### What to Render?

The user should see a red circle as a cursor.
Its size for touch and non-touch may be different and should be settable with const at the beginning of the file.

On non-touch, we use an actual custom cursor, while on touch of course there is no cursor, so we render the same circle simply as an element and make sure it follows *both* drag and drop events and tab events.

Note that this cursor should only be displayed on its parent object, the map — not beyond it.

### "Click" Detection

The learner will use the cursor to guess where countries are. 
As such, we want to trigger an event when the user guesses.

This works a bit differently, depending on device:

- On non-touch, listen for clicks 
- On touch, listen either for dragends related to our "cursor", or for tabs anywhere on the parent object.
