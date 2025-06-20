# How to Change the (Underlying) Country Data

*Say a new country just dropped (new Sudan?) or you decide to get cooler map visuals. How do you do it?*

1. Find cool data on [Natural Earth](https://www.naturalearthdata.com/), and download.

    - My recommendation: Always make a reduced file containing just one or two countries from any data you get, and pretty-print format it. Way easier to reason about the data, both for you and any LLMs who may want to help.

2. At this point, you probably want to make a new repo. Having this awkward python infra in `generate` is pretty annoying.
3. Make a flat, authoritative list of country names.
    - There is some infra for this: `/generate/01_make_complete_country_list.py`. In any case, it's a simple script.
    - Make sure that you use `name_long` or something nice. Currently, my data is full of awkward abreviations.
    - Make sure that this list, from then on out, is authoritative. I have lots of trouble with mutually mismatching names all over the place.
4. At this point, you probably want to bother with i18n. We *have* all this nice name data in the geojsons. Probably evolve a strategy to actually use that.
    - We do have budget string replacement in place in the consuming app, because we need to adapt `Exercise` instructions depending on whether or not we're on mobile. Just a note.
5. Make a quick `islands.json` file that is a dict detailling whether a given country is an island
    - Just ask ChatGPT
    - Purpose: Most islands are either easy or they bore people. We can later de-prio them a bit, and make a learning goal to disable them alltogether
6. Decide on zoom levels.
    - At this point, you probably want to rework the zoom functionality
        - It is currently heavily dependent on the idiosyncratic, country-shape dependent zooming happening in `WorldMap`.
            - At *this point*, you probably want to rework the `WorldMap`/`WorldMapGame`/`Play` component structure:
                - It would be sweet if we could have map properly abstracted, so we can render them with different use cases, inside and outside playing
                - Also, once upon a time, we wanted to build a challenge mode. Still not a bad idea, but with the current structure an inherent hack
                - And we basically need a vue app that renders lots of maps in this larger step anyways
    - In any case, at some point you should have a file like `zoomLevelData.json`, detailling how much the map should be zoomed in for the challenge "Find Ghana in its neighborhood", or whatever
        - I created the current version with an incredibly awkward Vue view in this very project
            - Since it dependent on `igu-algos` and all other obsolete stuff, I simply removed it
            - You can take a look at it on commit `e003e45`
        - See above: I'd probably make a separate vue app for this, do it cleanly
            - Another concept: Do it in python (make sure projections match) where probably stuff loads faster, then have a dedicated admin module in this project where I can play around with the zoom levels and make sure it all matches
7. Make sure `generate_simplified_geojson` works. 
    - This is just a nice little thing removing all the country metadata from the geojson, to shrink our bundle
    - Probably needs...reworking depending on i18n
    - Copy result in `modules/map-data` or whatever
8. Adapt `generate_learning_goals_and_exercises.py`
    - This is a ginormous file, comes with its own equally long markdown doc alongside it
    - Should mostly still work
    - Should just need filename adaptions and what not
    - Copy results in relevant `modules/` folder (make sure it's the compressed JSON)