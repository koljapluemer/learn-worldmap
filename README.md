# Learn the Worldmap

![screenshot of the app showing excerpts from the worldmap where the user is challenged to select a country](doc/screenshot.png)

_do you know where the countries are?_

## Development

### Running It

1. Clone the repository
2. Make sure you have `npm` installed
3. Run `npm i`
4. Run `npm run dev` and open the displayed link in your browser

### Testing

For now, there are some E2E tests, which were recorded with Playwright.
You'll find them in the `tests/` directory.

To run them, execute the app with the test env var set, by running:

```
npm run testdev
```

Leave this running, and in another terminal, run the tests:

```
npm run test:e2e
```