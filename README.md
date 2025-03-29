# docsify-editor
Docsify Editor is a simple web-based Markdown editor built with Docsify and EasyMDE, supporting real-time preview and optional server-side storage.


## Node Start
Clone this repository and run below command

```bash
npm install
npm start
```

Update index.html & markdown files based on your requirements. 

## Docker Start
```bash
# start default docker
docker run -dp 3000:3000 cylin2000/docsify-editor:v1

# start docker and map windows path
docker run -dp 3000:3000 -v C:\work\mydocs:/var/www/docs cylin2000/docsify-editor:v1

# start docker and map linux path
docker run -dp 3000:3000 -v /var/mydocs:/var/www/docs cylin2000/docsify-editor:v1
```
