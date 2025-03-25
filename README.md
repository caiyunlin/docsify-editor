# docsify-editor
Docsify Editor is a simple web-based Markdown editor built with Docsify and EasyMDE, supporting real-time preview and optional server-side storage.


## Start
```javescript
npm install
npm start
```

## Docker
```
docker build -t cylin2000/docsify-editor:v1 ./

docker run -p 8300:3000 cylin2000/docsify-editor:v1

docker run -p 8300:3000 -v C:\work\github\mywork\wiki\Topics:/var/www/docs cylin2000/docsify-editor:v1

docker push cylin2000/docsify-editor:v1
```
