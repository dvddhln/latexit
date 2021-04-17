
<div align="center">
<img src="https://raw.githubusercontent.com/dvddhln/latexit/master/art/preview.webp" />
<h1>✍🏻 LatexIt</h1>
<p>React Webapp to edit and preview LaTex<p/><br/>
</div>

## ⚙ Setup locally

### Requirements 🍫

- Node.js
- npm
- Git (optional)
- Latex for running locally( or just build the Dockerfile)

Inspired by the Sharelatex project.

Live demo can be found at https://latexit.herokuapp.com

<br/>


```bash
npm install
```

<br/>

### Run in development mode 🧪

Execute the following command to run the app in the development mode with expressjs server.


```
node server.js
npm start
```


Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits. You will also see any lint errors in the console.

<br/>

### Generate a Build 📦

```
npm run build
```

Builds the app for production to the `build` folder.<br />

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

Now the app is ready to be deployed!

<br/>

### Run with Docker 🐋

```
npm run build
docker build . -t dvddhln/latexit
docker run -p 8080:8080 -d dvddhln/latexit:latest
```

Builds the app for production to the `build` folder.<br />

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

Now the app is ready to be deployed!

<br/>

