![alt text](https://i.imgur.com/vh06Bf6.png)


Share your favorite movies with fellow film buffs, put together that watchlist you've been scheming on for the past 3 years, and discover new gems with GoSeeThis. Check out the **[live app!](https://goseethis-client.herokuapp.com/)**

#### Sample Users
* username: jshmoe | password: jshmoepassword
* username: jdoe | password: jshmoepassword

## Introduction
How many times have you been interested in a movie, newly released or otherwise, only to write it off because a few of your friends decided the movie wasn't worth watching. If you were to ask them whether they'd actually seen the movie, they'd probably tell you no, followed by a remark that "the movie got some scathing reviews on Rotten Tomatoes."

This scenario points to an interesting phenomenon: **our impressions of a work, whether in film or television, are often mediated by public opinion, which in turn is heavily influenced by the objective critique of a select few, whose tastes have been groomed in a cultural environment completely seperate from our own.** GoSeeThis directly addresses this phenomenon, and aims to establish the point that everyone's tastes are unique. GoSeeThis is an app that allows users to make recommendations for the movies they **personally feel ARE worth watching.** Where sites like Rotten Tomatoes work to establish objective absolutes, we aim to reinforce the subjective, human perspective that shapes personal tastes in media consumption, and provide an open source space for avid movie watchers to share these perspectives with others, in hopes that they might build connections with those that support their views, and/or challenge their opinions. At its core, GoSeeThis is about **exploration, expression, and discovery in film.**

## How it Works
Our application uses the Movie Database's (tMDB) extensive film data library to populate the user's title searches with relevant metadata via their public web API. Users can visit movie pages, add movies to a personal watchlist, and create recommendations on the fly. Recommendations posted by all users are accessible through a global feed on the user's dashboard. However, we wanted to give the user more control over how they experience the app by allowing them to follow their favorite recommenders and develop a more personalized, nuanced network that caters to their personal tastes. All of our app's features contribute to our goal of fostering a dynamic, user-driven environment that encourages, yup. You guessed it. **Exploration, expression, and discovery.**

## Client-Side
The client-side GitHub repo can be found [here](https://github.com/thinkful-ei23/GoSeeThis-Client).

## Tech Stack
### MERN
* MongoDB
* Express.js
* React
* Node.js

### Client-side dependencies
* redux
* redux-form
* react-router
* react-redux

### Server-side dependencies
* cors
* passport
* mongoose
* jwt

## API Documentation
[Click to view tMDB API documentation](https://developers.themoviedb.org/3/getting-started/introduction)


## Features List
### V1
* Add a movie recommendation (from add form and from movie page)
* Global recommendations feed (ordered by most recent)
* User profile page
  * User recommendations
  * Follow a user
* Following recommendations feed (ordered by most recent)
* MyProfile page
  * My recommendations list
  * Following/Followers lists
  * My watchlist
* Add (and remove) a movie from user watchlist
* Movie Search Bar

### V2
* User recommendations become multimedia (television, books, YouTube videos, etc).
* Following recommendations feed ordered by level of priority (weighted recs).
* Feature movie trailers on movie page
* Feed filter (by title and by genre)
* Making genre clickable link to movie search by genre
* Links to stream sources (Netflix, Hulu, iTunes, etc).
* Event confirmation (When deleting recommendations, unfollowing a user, etc).

## Contributors
* [Tarik Desire](https://github.com/tdesire)
* [David Folks](https://github.com/DFolks)
* [David Graves](https://github.com/DaGraves)
* [Ryan Ureta](https://github.com/rcureta)

## Social Media + Marketing

* **[Twitter](https://twitter.com/GoSeeThisApp1)**
* **[Product Hunt](https://www.producthunt.com/posts/goseethis)**
